# Handoff — adversarial first-read review 4

## Result

**FAIL.** Review 4 was completed against <https://github-dependency-exit.sociobot.in> and commit `87a1535f2a490b4bf861f25a5788b588efc6a9bb`. No product code was changed. The full report is [review-4.md](review-4.md).

## What was done

- Tested cold landing views in fresh 390 × 844 and 1440 × 1000 Chromium contexts.
- Audited every landing and README copy item with word counts.
- Exercised the one-click browser demo, reset, exit, storage isolation, request isolation, and offline reload.
- Ran the real CLI demo from a fresh temporary directory and inspected both report formats.
- Ran all 22 exact `.factory/claims.json` commands independently from clean clone `/tmp/gde-review4-clean.fAg7Eo`.
- Rechecked every earlier review finding against production and source.
- Checked route metadata, 404 behavior, focus restoration, links, console output, mobile overflow, touch targets, and WCAG 2 A/AA axe results.
- Ran the factory URL verifier on Home, Demo, Privacy, and Terms.
- Ran the complete test, typecheck, lint, build, and crate-package gates from the clean clone.

## Verification result

- 22/22 listed claim commands: PASS.
- `npm test`: PASS — 4 Rust tests and 38 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/site/` produced.
- `cargo package --allow-dirty`: PASS.
- Live route/accessibility audit: 12 route/viewport combinations passed with zero axe violations or unexpected console errors.
- Live link crawl: 11 landing links resolved; checkout returned the expected hosted-session redirect.
- Browser demo privacy/offline checks: PASS.
- CLI demo: PASS; wrote 3-repository JSON and Markdown reports.

## Findings left for repair

1. **F-4-1 / F-1-4 reopened — blocking:** `src/report.rs` still emits the undefined heading `## Exit surface`. Rename it to `## Inventory totals` and add generated-report regression coverage.
2. **F-4-2 — blocking:** specific published claims lack matching claims-manifest entries and tagged observable tests: default temporary CLI output, browser/CLI sample parity, browser license storage, Rust 1.85 minimum support, downloaded-binary build identity, and GitHub Enterprise Server behavior.

## Evidence

- Review: `.factory/review-4.md`
- Independent claim log: `/tmp/gde-review4-claims.log`
- Clean clone: `/tmp/gde-review4-clean.fAg7Eo`
- Cold screenshots: `/tmp/gde-review4-mobile.png`, `/tmp/gde-review4-desktop.png`
- URL verifier outputs: `/tmp/gde-review4-verify-{home,demo,privacy,terms}`
- CLI output: `/tmp/github-exit-demo-9680-1787995633`

Temporary evidence paths are outside the repository and are not deployment artifacts.
