use crate::model::*;
use base64::Engine;
use reqwest::blocking::Client;
use reqwest::header::{ACCEPT, AUTHORIZATION, HeaderMap, HeaderValue, USER_AGENT};
use serde_json::Value;
use std::collections::HashSet;
use std::time::Duration;
use url::Url;

pub struct GithubClient {
    client: Client,
    base: String,
    pub rate_limit: Option<RateLimit>,
}

struct ApiResult {
    value: Option<Value>,
    status: u16,
    note: String,
    source: String,
}

impl GithubClient {
    pub fn new(base: &str, token: Option<&str>) -> Result<Self, String> {
        let mut headers = HeaderMap::new();
        headers.insert(USER_AGENT, HeaderValue::from_static("github-exit/0.1"));
        headers.insert(ACCEPT, HeaderValue::from_static("application/vnd.github+json"));
        if let Some(token) = token {
            let value = HeaderValue::from_str(&format!("Bearer {token}"))
                .map_err(|_| "The token contains invalid header characters.".to_string())?;
            headers.insert(AUTHORIZATION, value);
        }
        let client = Client::builder()
            .default_headers(headers)
            .timeout(Duration::from_secs(25))
            .build()
            .map_err(|e| format!("Could not create the GitHub client: {e}"))?;
        Ok(Self { client, base: base.trim_end_matches('/').to_string(), rate_limit: None })
    }

    pub fn scan_repositories(&mut self, repositories: Vec<Value>, scope: &str) -> Vec<RepositoryInventory> {
        repositories.into_iter().map(|repo| self.scan_repository(repo, scope)).collect()
    }

    pub fn repository(&mut self, full_name: &str) -> Result<Value, String> {
        let result = self.get(&format!("/repos/{full_name}"));
        result.value.ok_or_else(|| format!("GitHub did not return {full_name}. {}", result.note))
    }

    pub fn owner_repositories(&mut self, owner: &str) -> Result<Vec<Value>, String> {
        let org_path = format!("/orgs/{owner}/repos?type=all&sort=full_name&per_page=100");
        let mut result = self.get_paginated(&org_path);
        if result.is_err() {
            result = self.get_paginated(&format!("/users/{owner}/repos?type=owner&sort=full_name&per_page=100"));
        }
        result
    }

    pub fn packages(&mut self, owner: &str, repo_names: &HashSet<String>) -> (Vec<PackageRecord>, Vec<Evidence>) {
        let mut packages = Vec::new();
        let mut evidence = Vec::new();
        for package_type in ["container", "npm", "maven", "rubygems", "nuget"] {
            let org_path = format!("/orgs/{owner}/packages?package_type={package_type}&per_page=100");
            let user_path = format!("/users/{owner}/packages?package_type={package_type}&per_page=100");
            let first = self.get(&org_path);
            let result = if first.status == 404 { self.get(&user_path) } else { first };
            match result.value.and_then(|v| v.as_array().cloned()) {
                Some(items) => {
                    for item in items {
                        let repository = text_at(&item, "/repository/full_name");
                        if repository.is_empty() || repo_names.contains(&repository) {
                            packages.push(PackageRecord {
                                repository,
                                name: text_at(&item, "/name"),
                                package_type: package_type.to_string(),
                                visibility: text_at(&item, "/visibility"),
                            });
                        }
                    }
                    evidence.push(verified("packages", result.source, format!("{package_type} package list checked")));
                }
                None => evidence.push(unknown("packages", result.source, result.note)),
            }
        }
        (packages, evidence)
    }

    fn scan_repository(&mut self, repo: Value, _scope: &str) -> RepositoryInventory {
        let full_name = text_at(&repo, "/full_name");
        let name = text_at(&repo, "/name");
        let mut evidence = Vec::new();

        let workflow_result = self.get(&format!("/repos/{full_name}/actions/workflows?per_page=100"));
        let workflows = array_at(workflow_result.value.as_ref(), "/workflows").iter().map(|item| Workflow {
            name: text_at(item, "/name"), path: text_at(item, "/path"), state: text_at(item, "/state"), url: text_at(item, "/html_url"),
        }).collect::<Vec<_>>();
        evidence.push(result_evidence("actions", &workflow_result, format!("{} workflows found", workflows.len())));

        let mut action_dependencies = Vec::new();
        let mut app_oauth_references = Vec::new();
        for workflow in &workflows {
            let content_result = self.get(&format!("/repos/{full_name}/contents/{}", encode_path(&workflow.path)));
            if let Some(content) = content_result.value.as_ref().and_then(|v| v.get("content")).and_then(Value::as_str) {
                let clean = content.replace('\n', "");
                if let Ok(bytes) = base64::engine::general_purpose::STANDARD.decode(clean) {
                    if let Ok(text) = String::from_utf8(bytes) {
                        for line in text.lines() {
                            let trimmed = line.trim();
                            if let Some(value) = trimmed.strip_prefix("uses:") {
                                let uses = value.trim().trim_matches(['\'', '"']).to_string();
                                if !uses.starts_with("./") {
                                    let version = uses.rsplit('@').next().unwrap_or("");
                                    let pinned = version.len() == 40 && version.chars().all(|c| c.is_ascii_hexdigit());
                                    action_dependencies.push(ActionDependency { uses: uses.clone(), workflow: workflow.path.clone(), pinned_to_commit: pinned });
                                    if !uses.starts_with("actions/") {
                                        app_oauth_references.push(IntegrationReference { kind: "GitHub Action".into(), name: uses, evidence: format!("{} uses an external action", workflow.path) });
                                    }
                                }
                            }
                            let lower = trimmed.to_ascii_lowercase();
                            if lower.contains("github_app") || lower.contains("github-app") || lower.contains("oauth") {
                                app_oauth_references.push(IntegrationReference { kind: "App or OAuth signal".into(), name: trimmed.chars().take(120).collect(), evidence: workflow.path.clone() });
                            }
                        }
                    }
                }
            }
        }
        action_dependencies.sort_by(|a, b| a.uses.cmp(&b.uses).then(a.workflow.cmp(&b.workflow)));
        action_dependencies.dedup_by(|a, b| a.uses == b.uses && a.workflow == b.workflow);

        let hook_result = self.get(&format!("/repos/{full_name}/hooks?per_page=100"));
        let webhooks = array_root(hook_result.value.as_ref()).iter().map(|item| {
            let raw = text_at(item, "/config/url");
            let target_host = Url::parse(&raw).ok().and_then(|u| u.host_str().map(str::to_string)).unwrap_or_else(|| "redacted or unavailable".into());
            Webhook { id: item.get("id").and_then(Value::as_u64).unwrap_or(0), active: item.get("active").and_then(Value::as_bool).unwrap_or(false), events: item.get("events").and_then(Value::as_array).map(|a| a.iter().filter_map(Value::as_str).map(str::to_string).collect()).unwrap_or_default(), target_host }
        }).collect::<Vec<_>>();
        for hook in &webhooks {
            app_oauth_references.push(IntegrationReference { kind: "Webhook target".into(), name: hook.target_host.clone(), evidence: format!("hook {} event delivery", hook.id) });
        }
        evidence.push(result_evidence("webhooks", &hook_result, format!("{} webhooks found", webhooks.len())));

        let releases_result = self.get(&format!("/repos/{full_name}/releases?per_page=100"));
        let releases = array_root(releases_result.value.as_ref()).iter().map(|item| ReleaseRecord {
            tag: text_at(item, "/tag_name"), draft: bool_at(item, "/draft"), prerelease: bool_at(item, "/prerelease"), assets: array_at(Some(item), "/assets").len(),
        }).collect::<Vec<_>>();
        evidence.push(result_evidence("releases", &releases_result, format!("{} releases found", releases.len())));

        let default_branch = text_at(&repo, "/default_branch");
        let protection_result = self.get(&format!("/repos/{full_name}/branches/{}/protection", encode_path(&default_branch)));
        let mut branch_rules = Vec::new();
        if protection_result.value.is_some() {
            branch_rules.push(BranchRule { name: default_branch.clone(), kind: "branch protection".into(), enforcement: "active".into() });
            evidence.push(verified("branch protection", protection_result.source.clone(), "default branch protection found".into()));
        } else if protection_result.status == 404 {
            evidence.push(verified("branch protection", protection_result.source.clone(), "no default branch protection returned".into()));
        } else {
            evidence.push(unknown("branch protection", protection_result.source.clone(), protection_result.note.clone()));
        }
        let ruleset_result = self.get(&format!("/repos/{full_name}/rulesets?includes_parents=true&per_page=100"));
        for item in array_root(ruleset_result.value.as_ref()) {
            branch_rules.push(BranchRule { name: text_at(&item, "/name"), kind: "repository ruleset".into(), enforcement: text_at(&item, "/enforcement") });
        }
        evidence.push(result_evidence("rulesets", &ruleset_result, format!("{} total branch rules found", branch_rules.len())));

        let autolink_result = self.get(&format!("/repos/{full_name}/autolinks?per_page=100"));
        let autolinks = array_root(autolink_result.value.as_ref()).iter().map(|item| Autolink { prefix: text_at(item, "/key_prefix"), target_template: text_at(item, "/url_template") }).collect::<Vec<_>>();
        evidence.push(result_evidence("issue autolinks", &autolink_result, format!("{} autolinks found; issues setting also recorded", autolinks.len())));

        // GitHub has no repository endpoint that lists every OAuth grant. Keep that limitation explicit.
        evidence.push(unknown("GitHub Apps and OAuth", format!("{}/settings/installations", text_at(&repo, "/html_url")), "GitHub does not expose a complete repository-scoped OAuth grant list; workflow and webhook signals were recorded".into()));
        app_oauth_references.sort_by(|a, b| a.kind.cmp(&b.kind).then(a.name.cmp(&b.name)));
        app_oauth_references.dedup_by(|a, b| a.kind == b.kind && a.name == b.name);

        RepositoryInventory {
            name, full_name, visibility: text_at(&repo, "/visibility"), archived: bool_at(&repo, "/archived"), default_branch,
            issues_enabled: bool_at(&repo, "/has_issues"), url: text_at(&repo, "/html_url"), workflows, action_dependencies,
            webhooks, releases, branch_rules, autolinks, app_oauth_references, evidence,
        }
    }

    fn get_paginated(&mut self, first_path: &str) -> Result<Vec<Value>, String> {
        let mut page = 1;
        let mut all = Vec::new();
        loop {
            let separator = if first_path.contains('?') { '&' } else { '?' };
            let result = self.get(&format!("{first_path}{separator}page={page}"));
            let values = result.value.and_then(|v| v.as_array().cloned())
                .ok_or_else(|| format!("GitHub did not return a repository list. {}", result.note))?;
            let count = values.len();
            all.extend(values);
            if count < 100 { break; }
            page += 1;
        }
        Ok(all)
    }

    fn get(&mut self, path: &str) -> ApiResult {
        let source = format!("{}{}", self.base, path);
        let response = match self.client.get(&source).send() {
            Ok(response) => response,
            Err(error) => return ApiResult { value: None, status: 0, note: format!("request failed: {error}"), source },
        };
        let status = response.status().as_u16();
        let headers = response.headers().clone();
        if let (Some(remaining), Some(limit), Some(reset)) = (
            header_u64(&headers, "x-ratelimit-remaining"), header_u64(&headers, "x-ratelimit-limit"), header_u64(&headers, "x-ratelimit-reset"),
        ) {
            self.rate_limit = Some(RateLimit { remaining, limit, reset_unix: reset });
        }
        if status == 403 && self.rate_limit.as_ref().is_some_and(|r| r.remaining == 0) {
            return ApiResult { value: None, status, note: "GitHub rate limit reached. Wait until the reset time, then run again.".into(), source };
        }
        let value = response.json::<Value>().ok();
        if (200..300).contains(&status) {
            ApiResult { value, status, note: "checked".into(), source }
        } else {
            let message = value.as_ref().map(|v| text_at(v, "/message")).filter(|s| !s.is_empty()).unwrap_or_else(|| format!("HTTP {status}"));
            ApiResult { value: None, status, note: format!("HTTP {status}: {message}"), source }
        }
    }
}

pub fn finalize(mut inventory: Inventory) -> Inventory {
    let mut checklist = Vec::new();
    for repo in &inventory.repositories {
        add_check(&mut checklist, repo, "Actions", repo.workflows.len(), "Rebuild each workflow on the target runner and test its secrets.", "Forgejo Actions", CheckStatus::Verified, "https://forgejo.org/docs/latest/user/actions/");
        add_check(&mut checklist, repo, "Webhooks", repo.webhooks.len(), "Create each endpoint on the target forge and send a test event.", "Target-forge webhooks", CheckStatus::Unknown, "Confirm payload and signature support with each receiver.");
        add_check(&mut checklist, repo, "Releases", repo.releases.len(), "Export release notes and assets, then compare checksums after import.", "GitLab releases", CheckStatus::Verified, "https://docs.gitlab.com/user/project/releases/");
        add_check(&mut checklist, repo, "Branch rules", repo.branch_rules.len(), "Translate every rule and test a rejected pull request.", "GitLab protected branches", CheckStatus::Verified, "https://docs.gitlab.com/user/project/repository/branches/protected/");
        add_check(&mut checklist, repo, "Issue links", repo.autolinks.len(), "Recreate autolink prefixes and test old issue references.", "GitLab external issue trackers", CheckStatus::Verified, "https://docs.gitlab.com/integration/external-issue-tracker/");
        let oauth_evidence = repo.evidence.iter().find(|e| e.area == "GitHub Apps and OAuth").unwrap();
        checklist.push(ChecklistItem { repository: repo.full_name.clone(), area: "GitHub Apps and OAuth".into(), status: oauth_evidence.status.clone(), finding: format!("{} workflow or webhook signals found; the grant list still needs review", repo.app_oauth_references.len()), next_step: "Open repository and organization installation settings. Record each app owner, scopes, callback URL, and replacement.".into(), alternative: "Target-forge app or OAuth integration".into(), alternative_status: CheckStatus::Unknown, alternative_evidence: "Compatibility depends on each app vendor and callback contract.".into() });
    }
    for package in &inventory.packages {
        checklist.push(ChecklistItem { repository: if package.repository.is_empty() { inventory.scope.clone() } else { package.repository.clone() }, area: "Packages".into(), status: CheckStatus::Verified, finding: format!("{} package `{}` found", package.package_type, package.name), next_step: "Copy versions to the target registry and update publish and install URLs.".into(), alternative: "OCI or package-native registry".into(), alternative_status: CheckStatus::Unknown, alternative_evidence: "Choose a registry that supports this package type and retention policy.".into() });
    }
    inventory.checklist = checklist;
    let s = &mut inventory.summary;
    s.repositories = inventory.repositories.len();
    s.workflows = inventory.repositories.iter().map(|r| r.workflows.len()).sum();
    s.action_dependencies = inventory.repositories.iter().map(|r| r.action_dependencies.len()).sum();
    s.webhooks = inventory.repositories.iter().map(|r| r.webhooks.len()).sum();
    s.releases = inventory.repositories.iter().map(|r| r.releases.len()).sum();
    s.rules = inventory.repositories.iter().map(|r| r.branch_rules.len()).sum();
    s.autolinks = inventory.repositories.iter().map(|r| r.autolinks.len()).sum();
    s.packages = inventory.packages.len();
    s.unknown_checks = inventory.repositories.iter().flat_map(|r| &r.evidence).filter(|e| e.status == CheckStatus::Unknown).count();
    s.risk_points = s.workflows * 3 + s.action_dependencies * 2 + s.webhooks * 3 + s.packages * 2 + s.releases + s.rules * 2 + s.autolinks + s.unknown_checks * 3;
    inventory
}

fn add_check(out: &mut Vec<ChecklistItem>, repo: &RepositoryInventory, area: &str, count: usize, next: &str, alternative: &str, alternative_status: CheckStatus, alternative_evidence: &str) {
    let evidence = repo.evidence.iter().find(|e| e.area.eq_ignore_ascii_case(area) || (area == "Branch rules" && e.area == "rulesets")).map(|e| e.status.clone()).unwrap_or(CheckStatus::Unknown);
    out.push(ChecklistItem { repository: repo.full_name.clone(), area: area.into(), status: evidence, finding: format!("{count} {} found", area.to_ascii_lowercase()), next_step: next.into(), alternative: alternative.into(), alternative_status, alternative_evidence: alternative_evidence.into() });
}

fn result_evidence(area: &str, result: &ApiResult, success: String) -> Evidence {
    if result.value.is_some() { verified(area, result.source.clone(), success) } else { unknown(area, result.source.clone(), result.note.clone()) }
}
fn verified(area: &str, source: String, note: String) -> Evidence { Evidence { area: area.into(), status: CheckStatus::Verified, source, note } }
fn unknown(area: &str, source: String, note: String) -> Evidence { Evidence { area: area.into(), status: CheckStatus::Unknown, source, note } }
fn text_at(value: &Value, pointer: &str) -> String { value.pointer(pointer).and_then(Value::as_str).unwrap_or("").to_string() }
fn bool_at(value: &Value, pointer: &str) -> bool { value.pointer(pointer).and_then(Value::as_bool).unwrap_or(false) }
fn array_at(value: Option<&Value>, pointer: &str) -> Vec<Value> { value.and_then(|v| v.pointer(pointer)).and_then(Value::as_array).cloned().unwrap_or_default() }
fn array_root(value: Option<&Value>) -> Vec<Value> { value.and_then(Value::as_array).cloned().unwrap_or_default() }
fn header_u64(headers: &HeaderMap, name: &str) -> Option<u64> { headers.get(name)?.to_str().ok()?.parse().ok() }
fn encode_path(path: &str) -> String { path.split('/').map(|part| url::form_urlencoded::byte_serialize(part.as_bytes()).collect::<String>()).collect::<Vec<_>>().join("/") }
