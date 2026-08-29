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
    rate_limit_error: Option<String>,
}

struct ApiResult {
    value: Option<Value>,
    status: u16,
    note: String,
    source: String,
}

impl GithubClient {
    pub fn new(base: &str, token: Option<&str>) -> Result<Self, String> {
        let parsed_base = Url::parse(base).map_err(|_| api_base_error())?;
        if !matches!(parsed_base.scheme(), "http" | "https")
            || parsed_base.host_str().is_none()
            || parsed_base.cannot_be_a_base()
            || parsed_base.query().is_some()
            || parsed_base.fragment().is_some()
        {
            return Err(api_base_error());
        }
        let mut headers = HeaderMap::new();
        headers.insert(USER_AGENT, HeaderValue::from_static("github-exit/0.1"));
        headers.insert(
            ACCEPT,
            HeaderValue::from_static("application/vnd.github+json"),
        );
        if let Some(token) = token {
            let value = HeaderValue::from_str(&format!("Bearer {token}"))
                .map_err(|_| "The token contains invalid header characters.".to_string())?;
            headers.insert(AUTHORIZATION, value);
        }
        let client = Client::builder()
            .default_headers(headers)
            .timeout(Duration::from_secs(25))
            .build()
            .map_err(|error| format!("Could not create the GitHub client: {error}"))?;
        Ok(Self {
            client,
            base: parsed_base.as_str().trim_end_matches('/').to_string(),
            rate_limit: None,
            rate_limit_error: None,
        })
    }

    pub fn rate_limit_error(&self) -> Option<&str> {
        self.rate_limit_error.as_deref()
    }

    pub fn scan_repositories(
        &mut self,
        repositories: Vec<Value>,
        scope: &str,
    ) -> Vec<RepositoryInventory> {
        repositories
            .into_iter()
            .map(|repo| self.scan_repository(repo, scope))
            .collect()
    }

    pub fn repository(&mut self, full_name: &str) -> Result<Value, String> {
        let result = self.get(&format!("/repos/{full_name}"));
        result.value.ok_or_else(|| {
            self.request_error(&format!(
                "GitHub did not return {full_name}. {}",
                result.note
            ))
        })
    }

    pub fn owner_repositories(&mut self, owner: &str) -> Result<Vec<Value>, String> {
        let org_path = format!("/orgs/{owner}/repos?type=all&sort=full_name&per_page=100");
        let mut result = self.get_paginated_array(&org_path, None);
        if result.value.is_none() && result.status == 404 && self.rate_limit_error.is_none() {
            result = self.get_paginated_array(
                &format!("/users/{owner}/repos?type=owner&sort=full_name&per_page=100"),
                None,
            );
        }
        result
            .value
            .and_then(|value| value.as_array().cloned())
            .ok_or_else(|| {
                self.request_error(&format!(
                    "GitHub did not return a repository list. {}",
                    result.note
                ))
            })
    }

    pub fn packages(
        &mut self,
        owner: &str,
        repo_names: &HashSet<String>,
    ) -> (Vec<PackageRecord>, Vec<Evidence>) {
        let mut packages = Vec::new();
        let mut evidence = Vec::new();
        for package_type in ["container", "npm", "maven", "rubygems", "nuget"] {
            let org_path =
                format!("/orgs/{owner}/packages?package_type={package_type}&per_page=100");
            let user_path =
                format!("/users/{owner}/packages?package_type={package_type}&per_page=100");
            let first = self.get_paginated_array(&org_path, None);
            let result = if first.status == 404 && self.rate_limit_error.is_none() {
                self.get_paginated_array(&user_path, None)
            } else {
                first
            };
            match result.value.and_then(|value| value.as_array().cloned()) {
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
                    evidence.push(verified(
                        "packages",
                        result.source,
                        format!("{package_type} package list checked"),
                    ));
                }
                None => evidence.push(unknown(
                    "packages",
                    result.source,
                    format!(
                        "{package_type} package list could not be read: {}",
                        result.note
                    ),
                )),
            }
        }
        (packages, evidence)
    }

    fn scan_repository(&mut self, repo: Value, _scope: &str) -> RepositoryInventory {
        let full_name = text_at(&repo, "/full_name");
        let name = text_at(&repo, "/name");
        let mut evidence = Vec::new();

        let workflow_result = self.get_paginated_array(
            &format!("/repos/{full_name}/actions/workflows?per_page=100"),
            Some("workflows"),
        );
        let workflows = array_root(workflow_result.value.as_ref())
            .iter()
            .map(|item| Workflow {
                name: text_at(item, "/name"),
                path: text_at(item, "/path"),
                state: text_at(item, "/state"),
                url: text_at(item, "/html_url"),
            })
            .collect::<Vec<_>>();

        let mut action_dependencies = Vec::new();
        let mut app_oauth_references = Vec::new();
        let mut unreadable_workflow_contents = Vec::new();
        for workflow in &workflows {
            let content_result = self.get(&format!(
                "/repos/{full_name}/contents/{}",
                encode_path(&workflow.path)
            ));
            let parsed = content_result
                .value
                .as_ref()
                .and_then(|value| value.get("content"))
                .and_then(Value::as_str)
                .map(|content| content.replace('\n', ""))
                .and_then(|content| {
                    base64::engine::general_purpose::STANDARD
                        .decode(content)
                        .ok()
                })
                .and_then(|bytes| String::from_utf8(bytes).ok());
            let Some(text) = parsed else {
                unreadable_workflow_contents.push(workflow.path.clone());
                evidence.push(unknown(
                    "workflow content",
                    content_result.source,
                    format!(
                        "{} could not be read: {}",
                        workflow.path, content_result.note
                    ),
                ));
                continue;
            };
            for line in text.lines() {
                let trimmed = line.trim();
                let step = trimmed
                    .strip_prefix('-')
                    .map(str::trim_start)
                    .unwrap_or(trimmed);
                if let Some(value) = step.strip_prefix("uses:") {
                    let uses = value.trim().trim_matches(['\'', '"']).to_string();
                    if !uses.starts_with("./") {
                        let version = uses.rsplit('@').next().unwrap_or("");
                        let pinned = version.len() == 40
                            && version
                                .chars()
                                .all(|character| character.is_ascii_hexdigit());
                        action_dependencies.push(ActionDependency {
                            uses: uses.clone(),
                            workflow: workflow.path.clone(),
                            pinned_to_commit: pinned,
                        });
                        if !uses.starts_with("actions/") {
                            app_oauth_references.push(IntegrationReference {
                                kind: "GitHub Action".into(),
                                name: uses,
                                evidence: format!("{} uses an external action", workflow.path),
                            });
                        }
                    }
                }
                let lower = trimmed.to_ascii_lowercase();
                if lower.contains("github_app")
                    || lower.contains("github-app")
                    || lower.contains("oauth")
                {
                    app_oauth_references.push(IntegrationReference {
                        kind: "App or OAuth signal".into(),
                        name: trimmed.chars().take(120).collect(),
                        evidence: workflow.path.clone(),
                    });
                }
            }
        }
        action_dependencies.sort_by(|left, right| {
            left.uses
                .cmp(&right.uses)
                .then(left.workflow.cmp(&right.workflow))
        });
        action_dependencies
            .dedup_by(|left, right| left.uses == right.uses && left.workflow == right.workflow);
        if workflow_result.value.is_none() || !unreadable_workflow_contents.is_empty() {
            let note = if workflow_result.value.is_none() {
                workflow_result.note.clone()
            } else {
                format!(
                    "{} workflows found; contents unavailable for {}",
                    workflows.len(),
                    unreadable_workflow_contents.join(", ")
                )
            };
            evidence.push(unknown("actions", workflow_result.source.clone(), note));
        } else {
            evidence.push(verified(
                "actions",
                workflow_result.source.clone(),
                format!("{} workflows found", workflows.len()),
            ));
        }

        let hook_result =
            self.get_paginated_array(&format!("/repos/{full_name}/hooks?per_page=100"), None);
        let webhooks = array_root(hook_result.value.as_ref())
            .iter()
            .map(|item| {
                let raw = text_at(item, "/config/url");
                let target_host = Url::parse(&raw)
                    .ok()
                    .and_then(|url| url.host_str().map(str::to_string))
                    .unwrap_or_else(|| "redacted or unavailable".into());
                Webhook {
                    id: item.get("id").and_then(Value::as_u64).unwrap_or(0),
                    active: item.get("active").and_then(Value::as_bool).unwrap_or(false),
                    events: item
                        .get("events")
                        .and_then(Value::as_array)
                        .map(|items| {
                            items
                                .iter()
                                .filter_map(Value::as_str)
                                .map(str::to_string)
                                .collect()
                        })
                        .unwrap_or_default(),
                    target_host,
                }
            })
            .collect::<Vec<_>>();
        for hook in &webhooks {
            app_oauth_references.push(IntegrationReference {
                kind: "Webhook target".into(),
                name: hook.target_host.clone(),
                evidence: format!("hook {} event delivery", hook.id),
            });
        }
        evidence.push(result_evidence(
            "webhooks",
            &hook_result,
            format!("{} webhooks found", webhooks.len()),
        ));

        let releases_result =
            self.get_paginated_array(&format!("/repos/{full_name}/releases?per_page=100"), None);
        let releases = array_root(releases_result.value.as_ref())
            .iter()
            .map(|item| ReleaseRecord {
                tag: text_at(item, "/tag_name"),
                draft: bool_at(item, "/draft"),
                prerelease: bool_at(item, "/prerelease"),
                assets: array_at(Some(item), "/assets").len(),
            })
            .collect::<Vec<_>>();
        evidence.push(result_evidence(
            "releases",
            &releases_result,
            format!("{} releases found", releases.len()),
        ));

        let default_branch = text_at(&repo, "/default_branch");
        let protection_result = self.get(&format!(
            "/repos/{full_name}/branches/{}/protection",
            encode_path(&default_branch)
        ));
        let mut branch_rules = Vec::new();
        if protection_result.value.is_some() {
            branch_rules.push(BranchRule {
                name: default_branch.clone(),
                kind: "branch protection".into(),
                enforcement: "active".into(),
            });
            evidence.push(verified(
                "branch protection",
                protection_result.source.clone(),
                "default branch protection found".into(),
            ));
        } else {
            evidence.push(unknown(
                "branch protection",
                protection_result.source.clone(),
                format!(
                    "Branch protection could not be confirmed (a 404 can mean missing access): {}",
                    protection_result.note
                ),
            ));
        }
        let ruleset_result = self.get_paginated_array(
            &format!("/repos/{full_name}/rulesets?includes_parents=true&per_page=100"),
            None,
        );
        for item in array_root(ruleset_result.value.as_ref()) {
            branch_rules.push(BranchRule {
                name: text_at(&item, "/name"),
                kind: "repository ruleset".into(),
                enforcement: text_at(&item, "/enforcement"),
            });
        }
        evidence.push(result_evidence(
            "rulesets",
            &ruleset_result,
            format!("{} total branch rules found", branch_rules.len()),
        ));
        if protection_result.value.is_some() && ruleset_result.value.is_some() {
            evidence.push(verified(
                "branch rules",
                ruleset_result.source.clone(),
                format!("{} branch rules checked", branch_rules.len()),
            ));
        } else {
            evidence.push(unknown(
                "branch rules",
                ruleset_result.source.clone(),
                "Branch rule access is incomplete; review the unknown branch-protection or ruleset evidence."
                    .into(),
            ));
        }

        let autolink_result =
            self.get_paginated_array(&format!("/repos/{full_name}/autolinks?per_page=100"), None);
        let autolinks = array_root(autolink_result.value.as_ref())
            .iter()
            .map(|item| Autolink {
                prefix: text_at(item, "/key_prefix"),
                target_template: text_at(item, "/url_template"),
            })
            .collect::<Vec<_>>();
        evidence.push(result_evidence(
            "issue autolinks",
            &autolink_result,
            format!(
                "{} autolinks found; issues setting also recorded",
                autolinks.len()
            ),
        ));

        evidence.push(unknown(
            "GitHub Apps and OAuth",
            format!("{}/settings/installations", text_at(&repo, "/html_url")),
            "The CLI cannot enumerate every app and OAuth grant; workflow and webhook signals were recorded".into(),
        ));
        app_oauth_references
            .sort_by(|left, right| left.kind.cmp(&right.kind).then(left.name.cmp(&right.name)));
        app_oauth_references
            .dedup_by(|left, right| left.kind == right.kind && left.name == right.name);

        RepositoryInventory {
            name,
            full_name,
            visibility: text_at(&repo, "/visibility"),
            archived: bool_at(&repo, "/archived"),
            default_branch,
            issues_enabled: bool_at(&repo, "/has_issues"),
            url: text_at(&repo, "/html_url"),
            workflows,
            action_dependencies,
            webhooks,
            releases,
            branch_rules,
            autolinks,
            app_oauth_references,
            evidence,
        }
    }

    fn get_paginated_array(&mut self, first_path: &str, key: Option<&str>) -> ApiResult {
        let mut page = 1;
        let mut all = Vec::new();
        let mut first_source = String::new();
        loop {
            let separator = if first_path.contains('?') { '&' } else { '?' };
            let result = self.get(&format!("{first_path}{separator}page={page}"));
            if first_source.is_empty() {
                first_source.clone_from(&result.source);
            }
            let Some(value) = result.value else {
                return ApiResult {
                    value: None,
                    status: result.status,
                    note: result.note,
                    source: first_source,
                };
            };
            let values = match key {
                Some(key) => value.get(key).and_then(Value::as_array).cloned(),
                None => value.as_array().cloned(),
            };
            let Some(values) = values else {
                return ApiResult {
                    value: None,
                    status: result.status,
                    note: "GitHub returned an unexpected list response.".into(),
                    source: first_source,
                };
            };
            let count = values.len();
            all.extend(values);
            if count < 100 {
                return ApiResult {
                    value: Some(Value::Array(all)),
                    status: 200,
                    note: "checked".into(),
                    source: first_source,
                };
            }
            page += 1;
        }
    }

    fn get(&mut self, path: &str) -> ApiResult {
        let source = format!("{}{}", self.base, path);
        if let Some(message) = &self.rate_limit_error {
            return ApiResult {
                value: None,
                status: 403,
                note: message.clone(),
                source,
            };
        }
        let response = match self.client.get(&source).send() {
            Ok(response) => response,
            Err(error) => {
                return ApiResult {
                    value: None,
                    status: 0,
                    note: format!("request failed: {error}"),
                    source,
                };
            }
        };
        let status = response.status().as_u16();
        let headers = response.headers().clone();
        let retry_after = headers
            .get("retry-after")
            .and_then(|value| value.to_str().ok())
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string);
        if let (Some(remaining), Some(limit), Some(reset)) = (
            header_u64(&headers, "x-ratelimit-remaining"),
            header_u64(&headers, "x-ratelimit-limit"),
            header_u64(&headers, "x-ratelimit-reset"),
        ) {
            self.rate_limit = Some(RateLimit {
                remaining,
                limit,
                reset_unix: reset,
            });
        }
        let value = response.json::<Value>().ok();
        let response_message = value
            .as_ref()
            .map(|value| text_at(value, "/message"))
            .filter(|message| !message.is_empty());
        let lower_message = response_message
            .as_deref()
            .unwrap_or_default()
            .to_ascii_lowercase();
        let exhausted = header_u64(&headers, "x-ratelimit-remaining") == Some(0);
        let rate_limited = status == 429
            || (status == 403
                && (exhausted
                    || retry_after.is_some()
                    || lower_message.contains("rate limit")
                    || lower_message.contains("abuse detection")));
        if rate_limited {
            let message = match retry_after.as_deref() {
                Some(seconds) if seconds.parse::<u64>().is_ok() => format!(
                    "GitHub rate limit reached. Retry after {seconds} seconds, then run again."
                ),
                Some(value) => format!(
                    "GitHub rate limit reached. Retry after GitHub's Retry-After time ({value}), then run again."
                ),
                None => "GitHub rate limit reached. Wait until the reset time, then run again."
                    .to_string(),
            };
            self.rate_limit_error = Some(message.clone());
            return ApiResult {
                value: None,
                status,
                note: message,
                source,
            };
        }
        if (200..300).contains(&status) {
            ApiResult {
                value,
                status,
                note: "checked".into(),
                source,
            }
        } else {
            let message = response_message.unwrap_or_else(|| format!("HTTP {status}"));
            ApiResult {
                value: None,
                status,
                note: format!("HTTP {status}: {message}"),
                source,
            }
        }
    }

    fn request_error(&self, message: &str) -> String {
        self.rate_limit_error
            .clone()
            .unwrap_or_else(|| message.to_string())
    }
}

fn api_base_error() -> String {
    "--api-base must be an absolute HTTP or HTTPS GitHub API URL (for example, https://api.github.com).".into()
}

pub fn finalize(mut inventory: Inventory) -> Inventory {
    let mut checklist = Vec::new();
    for repo in &inventory.repositories {
        add_check(
            &mut checklist,
            repo,
            repo.workflows.len(),
            CheckGuide::new(
                "Actions",
                "Rebuild each workflow on the target runner and test its secrets.",
                "Forgejo Actions",
                CheckStatus::Verified,
                "https://forgejo.org/docs/latest/user/actions/",
            ),
        );
        add_check(
            &mut checklist,
            repo,
            repo.webhooks.len(),
            CheckGuide::new(
                "Webhooks",
                "Create each endpoint on the target forge and send a test event.",
                "Target-forge webhooks",
                CheckStatus::Unknown,
                "Confirm payload and signature support with each receiver.",
            ),
        );
        add_check(
            &mut checklist,
            repo,
            repo.releases.len(),
            CheckGuide::new(
                "Releases",
                "Export release notes and assets, then compare checksums after import.",
                "GitLab releases",
                CheckStatus::Verified,
                "https://docs.gitlab.com/user/project/releases/",
            ),
        );
        add_check(
            &mut checklist,
            repo,
            repo.branch_rules.len(),
            CheckGuide::new(
                "Branch rules",
                "Translate every rule and test a rejected pull request.",
                "GitLab protected branches",
                CheckStatus::Verified,
                "https://docs.gitlab.com/user/project/repository/branches/protected/",
            ),
        );
        add_check(
            &mut checklist,
            repo,
            repo.autolinks.len(),
            CheckGuide::new(
                "Issue links",
                "Recreate autolink prefixes and test old issue references.",
                "GitLab external issue trackers",
                CheckStatus::Verified,
                "https://docs.gitlab.com/integration/external-issue-tracker/",
            ),
        );
        let oauth_evidence = repo
            .evidence
            .iter()
            .find(|evidence| evidence.area == "GitHub Apps and OAuth")
            .expect("OAuth evidence is always included");
        checklist.push(ChecklistItem { repository: repo.full_name.clone(), area: "GitHub Apps and OAuth".into(), status: oauth_evidence.status.clone(), finding: "The CLI cannot enumerate every app and OAuth grant.".into(), next_step: "Open repository and organization installation settings. Record each app owner, scopes, callback URL, and replacement.".into(), alternative: "Target-forge app or OAuth integration".into(), alternative_status: CheckStatus::Unknown, alternative_evidence: "Compatibility depends on each app vendor and callback contract.".into() });
    }
    for package in &inventory.packages {
        checklist.push(ChecklistItem {
            repository: if package.repository.is_empty() {
                inventory.scope.clone()
            } else {
                package.repository.clone()
            },
            area: "Packages".into(),
            status: CheckStatus::Verified,
            finding: format!("{} package `{}` found", package.package_type, package.name),
            next_step: "Copy versions to the target registry and update publish and install URLs."
                .into(),
            alternative: "OCI or package-native registry".into(),
            alternative_status: CheckStatus::Unknown,
            alternative_evidence:
                "Choose a registry that supports this package type and retention policy.".into(),
        });
    }
    for evidence in inventory
        .repositories
        .iter()
        .flat_map(|repo| &repo.evidence)
        .filter(|evidence| evidence.area == "packages" && evidence.status == CheckStatus::Unknown)
    {
        checklist.push(ChecklistItem {
            repository: inventory.scope.clone(),
            area: "Packages".into(),
            status: CheckStatus::Unknown,
            finding: evidence.note.clone(),
            next_step:
                "Grant package read access or inspect this package type in GitHub before migration."
                    .into(),
            alternative: "OCI or package-native registry".into(),
            alternative_status: CheckStatus::Unknown,
            alternative_evidence:
                "Package access was incomplete, so compatibility still needs review.".into(),
        });
    }
    inventory.checklist = checklist;
    let summary = &mut inventory.summary;
    summary.repositories = inventory.repositories.len();
    summary.workflows = inventory
        .repositories
        .iter()
        .map(|repo| repo.workflows.len())
        .sum();
    summary.action_dependencies = inventory
        .repositories
        .iter()
        .map(|repo| repo.action_dependencies.len())
        .sum();
    summary.webhooks = inventory
        .repositories
        .iter()
        .map(|repo| repo.webhooks.len())
        .sum();
    summary.releases = inventory
        .repositories
        .iter()
        .map(|repo| repo.releases.len())
        .sum();
    summary.rules = inventory
        .repositories
        .iter()
        .map(|repo| repo.branch_rules.len())
        .sum();
    summary.autolinks = inventory
        .repositories
        .iter()
        .map(|repo| repo.autolinks.len())
        .sum();
    summary.packages = inventory.packages.len();
    summary.unknown_checks = inventory
        .repositories
        .iter()
        .flat_map(|repo| &repo.evidence)
        .filter(|evidence| evidence.status == CheckStatus::Unknown)
        .count();
    inventory
}

struct CheckGuide {
    area: &'static str,
    next: &'static str,
    alternative: &'static str,
    alternative_status: CheckStatus,
    alternative_evidence: &'static str,
}

impl CheckGuide {
    fn new(
        area: &'static str,
        next: &'static str,
        alternative: &'static str,
        alternative_status: CheckStatus,
        alternative_evidence: &'static str,
    ) -> Self {
        Self {
            area,
            next,
            alternative,
            alternative_status,
            alternative_evidence,
        }
    }
}

fn add_check(
    out: &mut Vec<ChecklistItem>,
    repo: &RepositoryInventory,
    count: usize,
    guide: CheckGuide,
) {
    let evidence = repo
        .evidence
        .iter()
        .find(|evidence| {
            evidence.area.eq_ignore_ascii_case(guide.area)
                || (guide.area == "Issue links" && evidence.area == "issue autolinks")
        })
        .map(|evidence| evidence.status.clone())
        .unwrap_or(CheckStatus::Unknown);
    out.push(ChecklistItem {
        repository: repo.full_name.clone(),
        area: guide.area.into(),
        status: evidence,
        finding: format!("{count} {} found", guide.area.to_ascii_lowercase()),
        next_step: guide.next.into(),
        alternative: guide.alternative.into(),
        alternative_status: guide.alternative_status,
        alternative_evidence: guide.alternative_evidence.into(),
    });
}

fn result_evidence(area: &str, result: &ApiResult, success: String) -> Evidence {
    if result.value.is_some() {
        verified(area, result.source.clone(), success)
    } else {
        unknown(area, result.source.clone(), result.note.clone())
    }
}
fn verified(area: &str, source: String, note: String) -> Evidence {
    Evidence {
        area: area.into(),
        status: CheckStatus::Verified,
        source,
        note,
    }
}
fn unknown(area: &str, source: String, note: String) -> Evidence {
    Evidence {
        area: area.into(),
        status: CheckStatus::Unknown,
        source,
        note,
    }
}
fn text_at(value: &Value, pointer: &str) -> String {
    value
        .pointer(pointer)
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string()
}
fn bool_at(value: &Value, pointer: &str) -> bool {
    value
        .pointer(pointer)
        .and_then(Value::as_bool)
        .unwrap_or(false)
}
fn array_at(value: Option<&Value>, pointer: &str) -> Vec<Value> {
    value
        .and_then(|value| value.pointer(pointer))
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default()
}
fn array_root(value: Option<&Value>) -> Vec<Value> {
    value.and_then(Value::as_array).cloned().unwrap_or_default()
}
fn header_u64(headers: &HeaderMap, name: &str) -> Option<u64> {
    headers.get(name)?.to_str().ok()?.parse().ok()
}
fn encode_path(path: &str) -> String {
    path.split('/')
        .map(|part| url::form_urlencoded::byte_serialize(part.as_bytes()).collect::<String>())
        .collect::<Vec<_>>()
        .join("/")
}
