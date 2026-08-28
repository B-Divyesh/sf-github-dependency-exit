use crate::model::{CheckStatus, Inventory};
use std::fmt::Write;

pub fn markdown(inventory: &Inventory) -> String {
    let mut out = String::new();
    writeln!(out, "# GitHub exit inventory: {}\n", inventory.scope).unwrap();
    writeln!(out, "Generated: `{}`  ", inventory.generated_at).unwrap();
    writeln!(out, "Source: `{}`  ", inventory.source).unwrap();
    writeln!(out, "Schema: `{}`\n", inventory.schema_version).unwrap();
    writeln!(out, "> Read-only evidence report. An unknown check needs manual review; it is not proof that a dependency is absent.\n").unwrap();

    writeln!(out, "## Exit surface\n").unwrap();
    writeln!(out, "| Repositories | Workflows | Actions | Webhooks | Packages | Releases | Rules | Unknown checks | Risk points |").unwrap();
    writeln!(
        out,
        "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"
    )
    .unwrap();
    let s = &inventory.summary;
    writeln!(
        out,
        "| {} | {} | {} | {} | {} | {} | {} | {} | {} |\n",
        s.repositories,
        s.workflows,
        s.action_dependencies,
        s.webhooks,
        s.packages,
        s.releases,
        s.rules,
        s.unknown_checks,
        s.risk_points
    )
    .unwrap();
    writeln!(
        out,
        "Risk points rank review work only. They are not a migration-time estimate.\n"
    )
    .unwrap();

    writeln!(out, "## Migration checklist\n").unwrap();
    for item in &inventory.checklist {
        let mark = if item.status == CheckStatus::Verified {
            "[ ]"
        } else {
            "[?]"
        };
        writeln!(
            out,
            "- {} **{} · {}** — {}",
            mark, item.repository, item.area, item.finding
        )
        .unwrap();
        writeln!(out, "  - Next: {}", item.next_step).unwrap();
        writeln!(
            out,
            "  - Candidate: {} — **{}**",
            item.alternative,
            status(&item.alternative_status)
        )
        .unwrap();
        writeln!(out, "  - Evidence: {}\n", item.alternative_evidence).unwrap();
    }

    writeln!(out, "## Repository evidence\n").unwrap();
    for repo in &inventory.repositories {
        writeln!(out, "### {}\n", repo.full_name).unwrap();
        writeln!(
            out,
            "`{}` · default `{}` · issues {}\n",
            repo.visibility,
            repo.default_branch,
            if repo.issues_enabled {
                "enabled"
            } else {
                "disabled"
            }
        )
        .unwrap();
        for evidence in &repo.evidence {
            writeln!(
                out,
                "- **{} · {}** — {} (`{}`)",
                evidence.area,
                status(&evidence.status),
                evidence.note,
                evidence.source
            )
            .unwrap();
        }
        if !repo.action_dependencies.is_empty() {
            writeln!(out, "\nActions used:").unwrap();
            for action in &repo.action_dependencies {
                writeln!(
                    out,
                    "- `{}` in `{}`{}",
                    action.uses,
                    action.workflow,
                    if action.pinned_to_commit {
                        " (commit pinned)"
                    } else {
                        ""
                    }
                )
                .unwrap();
            }
        }
        if !repo.app_oauth_references.is_empty() {
            writeln!(out, "\nApp and OAuth signals:").unwrap();
            for reference in &repo.app_oauth_references {
                writeln!(
                    out,
                    "- **{}:** {} — {}",
                    reference.kind, reference.name, reference.evidence
                )
                .unwrap();
            }
        }
        writeln!(out).unwrap();
    }
    out
}

fn status(status: &CheckStatus) -> &'static str {
    match status {
        CheckStatus::Verified => "verified",
        CheckStatus::Unknown => "unknown",
    }
}
