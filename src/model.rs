use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Inventory {
    pub schema_version: String,
    pub generated_at: String,
    pub source: String,
    pub scope: String,
    pub summary: Summary,
    pub repositories: Vec<RepositoryInventory>,
    pub packages: Vec<PackageRecord>,
    pub checklist: Vec<ChecklistItem>,
    pub rate_limit: Option<RateLimit>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Summary {
    pub repositories: usize,
    pub workflows: usize,
    pub action_dependencies: usize,
    pub webhooks: usize,
    pub packages: usize,
    pub releases: usize,
    pub rules: usize,
    pub autolinks: usize,
    pub unknown_checks: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryInventory {
    pub name: String,
    pub full_name: String,
    pub visibility: String,
    pub archived: bool,
    pub default_branch: String,
    pub issues_enabled: bool,
    pub url: String,
    pub workflows: Vec<Workflow>,
    pub action_dependencies: Vec<ActionDependency>,
    pub webhooks: Vec<Webhook>,
    pub releases: Vec<ReleaseRecord>,
    pub branch_rules: Vec<BranchRule>,
    pub autolinks: Vec<Autolink>,
    pub app_oauth_references: Vec<IntegrationReference>,
    pub evidence: Vec<Evidence>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub name: String,
    pub path: String,
    pub state: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionDependency {
    pub uses: String,
    pub workflow: String,
    pub pinned_to_commit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Webhook {
    pub id: u64,
    pub active: bool,
    pub events: Vec<String>,
    pub target_host: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReleaseRecord {
    pub tag: String,
    pub draft: bool,
    pub prerelease: bool,
    pub assets: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchRule {
    pub name: String,
    pub kind: String,
    pub enforcement: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Autolink {
    pub prefix: String,
    pub target_template: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationReference {
    pub kind: String,
    pub name: String,
    pub evidence: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageRecord {
    pub repository: String,
    pub name: String,
    pub package_type: String,
    pub visibility: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub area: String,
    pub status: CheckStatus,
    pub source: String,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum CheckStatus {
    Verified,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub repository: String,
    pub area: String,
    pub status: CheckStatus,
    pub finding: String,
    pub next_step: String,
    pub alternative: String,
    pub alternative_status: CheckStatus,
    pub alternative_evidence: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimit {
    pub remaining: u64,
    pub limit: u64,
    pub reset_unix: u64,
}
