use assert_cmd::Command;
use predicates::prelude::*;

#[test]
fn demo_writes_both_reports() {
    let temp = tempfile::tempdir().unwrap();
    Command::cargo_bin("github-exit").unwrap()
        .args(["demo", "--output", temp.path().to_str().unwrap()])
        .assert().success().stdout(predicate::str::contains("Report written to"));
    assert!(temp.path().join("inventory.json").exists());
    assert!(temp.path().join("migration-checklist.md").exists());
    let report = std::fs::read_to_string(temp.path().join("migration-checklist.md")).unwrap();
    assert!(report.contains("unknown"));
    assert!(report.contains("Forgejo Actions"));
}

#[test]
fn missing_scan_target_has_a_useful_error() {
    Command::cargo_bin("github-exit").unwrap().arg("scan").assert()
        .code(2).stderr(predicate::str::contains("Choose --repo OWNER/REPO"));
}
