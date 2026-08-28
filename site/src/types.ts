export type Status = 'verified' | 'unknown';
export interface Inventory {
  schema_version: string;
  generated_at: string;
  source: string;
  scope: string;
  summary: Record<'repositories'|'workflows'|'action_dependencies'|'webhooks'|'packages'|'releases'|'rules'|'autolinks'|'unknown_checks'|'risk_points', number>;
  repositories: Repository[];
  packages: Array<{ repository: string; name: string; package_type: string; visibility: string }>;
  checklist: Checklist[];
}
export interface Repository {
  name: string; full_name: string; visibility: string; archived: boolean; default_branch: string; issues_enabled: boolean; url: string;
  workflows: Array<{name: string; path: string; state: string; url: string}>;
  action_dependencies: Array<{uses: string; workflow: string; pinned_to_commit: boolean}>;
  webhooks: Array<{id: number; active: boolean; events: string[]; target_host: string}>;
  releases: Array<{tag: string; draft: boolean; prerelease: boolean; assets: number}>;
  branch_rules: Array<{name: string; kind: string; enforcement: string}>;
  autolinks: Array<{prefix: string; target_template: string}>;
  app_oauth_references: Array<{kind: string; name: string; evidence: string}>;
  evidence: Array<{area: string; status: Status; source: string; note: string}>;
}
export interface Checklist {
  repository: string; area: string; status: Status; finding: string; next_step: string;
  alternative: string; alternative_status: Status; alternative_evidence: string;
}
