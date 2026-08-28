mod github;
mod model;
mod report;

use chrono::Utc;
use clap::{Parser, Subcommand};
use github::{GithubClient, finalize};
use model::{Inventory, Summary};
use reqwest::blocking::Client;
use serde_json::Value;
use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::time::Duration;

const DEMO_JSON: &str = include_str!("../examples/demo/inventory.json");
const BILLING_BASE: &str = "https://api.sociobot.in/api/v1";

#[derive(Parser)]
#[command(name = "github-exit", version, about = "Inventory GitHub dependencies before planning a move", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Scan one repository or every visible repository owned by an account
    Scan {
        /// Repository in OWNER/REPO form. The free scan accepts one.
        #[arg(long, conflicts_with = "owner")]
        repo: Option<String>,
        /// Organization or user to scan. Requires a paid license.
        #[arg(long, conflicts_with = "repo")]
        owner: Option<String>,
        /// GitHub token. Prefer the GITHUB_TOKEN environment variable.
        #[arg(long)]
        token: Option<String>,
        /// Paid license. Prefer the GDE_LICENSE environment variable.
        #[arg(long)]
        license: Option<String>,
        /// Directory for inventory.json and migration-checklist.md.
        #[arg(short, long, default_value = "github-exit-report")]
        output: PathBuf,
        /// Print the inventory JSON to stdout.
        #[arg(long)]
        json: bool,
        /// GitHub API base URL. Useful for GitHub Enterprise Server.
        #[arg(long, default_value = "https://api.github.com")]
        api_base: String,
    },
    /// Write a realistic sample report without a network request
    Demo {
        /// Output directory. When omitted, a new temporary directory is used.
        #[arg(short, long)]
        output: Option<PathBuf>,
        /// Print the sample inventory JSON to stdout.
        #[arg(long)]
        json: bool,
    },
}

fn main() -> ExitCode {
    match run(Cli::parse()) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("github-exit: {error}");
            ExitCode::from(2)
        }
    }
}

fn run(cli: Cli) -> Result<(), String> {
    match cli.command {
        Command::Demo { output, json } => {
            let inventory: Inventory = serde_json::from_str(DEMO_JSON)
                .map_err(|e| format!("Bundled demo data is invalid: {e}"))?;
            let directory = output.unwrap_or_else(|| {
                env::temp_dir().join(format!(
                    "github-exit-demo-{}-{}",
                    std::process::id(),
                    Utc::now().timestamp()
                ))
            });
            write_report(&directory, &inventory)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&inventory).unwrap());
            }
            eprintln!("Demo — sample data, nothing was uploaded or saved outside this folder.");
            eprintln!("Report written to {}", directory.display());
            Ok(())
        }
        Command::Scan {
            repo,
            owner,
            token,
            license,
            output,
            json,
            api_base,
        } => {
            if repo.is_none() && owner.is_none() {
                return Err("Choose --repo OWNER/REPO or --owner OWNER. Run `github-exit demo` to try sample data.".into());
            }
            let token = token.or_else(|| env::var("GITHUB_TOKEN").ok());
            let mut client = GithubClient::new(&api_base, token.as_deref())?;
            let (scope, repositories) = if let Some(repo) = repo {
                validate_repo(&repo)?;
                (repo.clone(), vec![client.repository(&repo)?])
            } else {
                let owner = owner.unwrap();
                validate_owner(&owner)?;
                let license = license.or_else(|| env::var("GDE_LICENSE").ok()).ok_or_else(|| "Owner-wide scans require a license. Use --repo for a free scan or buy once at https://github-dependency-exit.sociobot.in/#price".to_string())?;
                verify_license(&license)?;
                let repos = client.owner_repositories(&owner)?;
                if repos.is_empty() {
                    return Err(format!(
                        "GitHub returned no repositories for {owner}. Check the owner name and token access."
                    ));
                }
                (owner, repos)
            };
            let mut inventories = client.scan_repositories(repositories, &scope);
            if let Some(error) = client.rate_limit_error() {
                return Err(error.to_string());
            }
            let names = inventories
                .iter()
                .map(|r| r.full_name.clone())
                .collect::<HashSet<_>>();
            let owner_name = scope.split('/').next().unwrap_or(&scope);
            let (packages, package_evidence) = client.packages(owner_name, &names);
            if let Some(error) = client.rate_limit_error() {
                return Err(error.to_string());
            }
            if let Some(first) = inventories.first_mut() {
                first.evidence.extend(package_evidence);
            }
            let inventory = finalize(Inventory {
                schema_version: "1.0".into(),
                generated_at: Utc::now().to_rfc3339(),
                source: api_base,
                scope,
                summary: Summary::default(),
                repositories: inventories,
                packages,
                checklist: vec![],
                rate_limit: client.rate_limit,
            });
            write_report(&output, &inventory)?;
            if json {
                println!("{}", serde_json::to_string_pretty(&inventory).unwrap());
            }
            eprintln!(
                "Scanned {} repositories. {} checks need manual review.",
                inventory.summary.repositories, inventory.summary.unknown_checks
            );
            eprintln!("Report written to {}", output.display());
            Ok(())
        }
    }
}

fn write_report(directory: &Path, inventory: &Inventory) -> Result<(), String> {
    fs::create_dir_all(directory)
        .map_err(|e| format!("Could not create {}: {e}", directory.display()))?;
    let json = serde_json::to_string_pretty(inventory)
        .map_err(|e| format!("Could not encode the report: {e}"))?;
    fs::write(directory.join("inventory.json"), format!("{json}\n"))
        .map_err(|e| format!("Could not write inventory.json: {e}"))?;
    fs::write(
        directory.join("migration-checklist.md"),
        report::markdown(inventory),
    )
    .map_err(|e| format!("Could not write migration-checklist.md: {e}"))?;
    Ok(())
}

fn verify_license(license: &str) -> Result<(), String> {
    let url = format!(
        "{BILLING_BASE}/products/github-dependency-exit/verify?license={}",
        url::form_urlencoded::byte_serialize(license.as_bytes()).collect::<String>()
    );
    let response = Client::builder()
        .timeout(Duration::from_secs(12))
        .build()
        .map_err(|e| e.to_string())?
        .get(url)
        .send()
        .map_err(|_| {
            "The license could not be checked. Check your connection, then run again.".to_string()
        })?;
    let body: Value = response
        .json()
        .map_err(|_| "The license service returned an unreadable response.".to_string())?;
    if body.get("valid").and_then(Value::as_bool) == Some(true) {
        Ok(())
    } else {
        Err(format!(
            "The license is not active ({}). Paste an active license or use --repo.",
            body.get("reason")
                .and_then(Value::as_str)
                .unwrap_or("invalid")
        ))
    }
}

fn validate_repo(value: &str) -> Result<(), String> {
    let parts = value.split('/').collect::<Vec<_>>();
    if parts.len() != 2 || parts.iter().any(|p| !valid_name(p)) {
        return Err(
            "--repo must use OWNER/REPO with letters, numbers, dots, dashes, or underscores."
                .into(),
        );
    }
    Ok(())
}
fn validate_owner(value: &str) -> Result<(), String> {
    if valid_name(value) {
        Ok(())
    } else {
        Err("--owner may contain letters, numbers, dots, dashes, or underscores.".into())
    }
}
fn valid_name(value: &str) -> bool {
    !value.is_empty()
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn demo_fixture_is_valid_and_has_unknown_oauth_check() {
        let inventory: Inventory = serde_json::from_str(DEMO_JSON).unwrap();
        assert_eq!(inventory.summary.repositories, 3);
        assert!(
            inventory
                .checklist
                .iter()
                .any(|item| item.area == "GitHub Apps and OAuth"
                    && item.status == model::CheckStatus::Unknown)
        );
    }
    #[test]
    fn validates_repo_names() {
        assert!(validate_repo("acme/api").is_ok());
        assert!(validate_repo("https://github.com/acme/api").is_err());
    }
}
