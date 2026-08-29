# Polish round 4 — all findings closed

Repair scope: release candidate `87a1535f2a490b4bf861f25a5788b588efc6a9bb`, using every finding in `review-4.md` and the earlier review and polish records. Product changes shipped in `b79765922e079faa4c58761530b12ffba7d4c979`, `3d5b1ca`, and `6f4898e66507665d5a76f6125f5b797cbae9fb75`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — Back/Forward focus | Route navigation restores focus to the destination heading and announces the change. | `npm test` — `Back and Forward focus the heading for the restored route`; live check in `evidence/polish-4/live-qa.json` (`history-focus`); `evidence/polish-4/home-390.png`. |
| F-1-2 — route metadata | Each route supplies a distinct plain-language title, description, canonical URL, and heading. | `npm test` — `route … sets complete route-specific metadata`; live checks for `/`, `/?demo=1`, `/privacy`, and `/terms` in `evidence/polish-4/live-qa.json`; URL verifier outputs under `evidence/polish-4/verify-*`. |
| F-1-3 — static 404 | Added the complete branded 404 shell, title, heading, return link, and Static Web Apps 404 rewrite. | `npm test` — `the static 404 has complete metadata and the standard site shell` and `the deployment configuration returns the static error document with HTTP 404`; live `https://github-dependency-exit.sociobot.in/missing-polish-4-route` returned 404 (`evidence/polish-4/404-headers.txt`); `evidence/polish-4/not-found-390.png`. |
| F-1-4, reopened as F-4-1 — report wording | Replaced generated Markdown heading `Exit surface` with `Inventory totals`; regression rejects the old review term and `accumulated load`. | `cargo test demo_writes_both_reports`; `npm test -- --grep @claim:cli-demo-temp-dir`; live downloaded binary demo report checked after SHA match. |
| F-3-1 — billing outcomes and claims | Preserved the hosted Sociobot checkout flow, visible one-time-price outcome, license save/verification feedback, restore field, and quiet invalid-license notice. | `npm test -- --grep @claim:paid-scope`, `@claim:paid-owner-scan`, `@claim:refund-revokes-license`, and `@claim:browser-license-storage`; live checkout redirect in `evidence/polish-4/checkout-headers.txt`; live license flow in `live-qa.json`. |
| F-3-2 — exit-survey terminology | Preserved plain, consistent migration language across the product, report, README, and samples. | `npm test` — `the first-screen label uses the product inventory term`; `npm run lint`; `.factory/copy-audit.md`. |
| F-4-2a — default CLI temporary output | Added claim `cli-demo-temp-dir` and an observable integration test for default `github-exit demo`: it creates a temporary directory and prints its path. | `npm test -- --grep @claim:cli-demo-temp-dir`; clean-clone claim log `evidence/polish-4/clean-clone-claims.json`; live downloaded binary execution. |
| F-4-2b — browser/CLI fixture parity | Browser demo JSON download and CLI demo JSON now compare against the same shipped fixture. | `npm test -- --grep @claim:demo-fixture-parity`; clean-clone claim log; `evidence/polish-4/demo-flow-mobile.png`. |
| F-4-2c — browser license storage/removal | Added claims and tests for storing the returned license, verifying it through the billing endpoint, and removing both local storage values. | `npm test -- --grep @claim:browser-license-storage`; clean-clone claim log; live `license-storage` check in `evidence/polish-4/live-qa.json`. |
| F-4-2d — Rust 1.85 support | Declared `rust-version = "1.85"`, made the source 1.85-compatible, and resolved the lockfile dependency floor. | `npm test -- --grep @claim:rust-1-85-build`; `rustup run 1.85.0 cargo build --locked`; clean-clone claim log. |
| F-4-2e — staged/download binary identity | Added a release-build staging test that compares the deployed binary hash with the release artifact. | `npm test -- --grep @claim:binary-download-build-match`; live SHA-256 match `2a492f39ddaaa99e97726432859949adbcdbd9f09effbbdb3b54ce1c2bd68e7d`. |
| F-4-2f — GitHub Enterprise Server | Added a named GHES 3.14 fixture test for `--api-base`, including its `/api/v3` request path. | `npm test -- --grep @claim:ghes-api-base`; clean-clone claim log. |
| Earlier offline shell finding | Advanced the service-worker cache version to the polish-4 release so a cold visit obtains this repaired shell. | `npm test` — `the service worker activates the current shell and refreshes navigations` and `the sample report reloads offline after the first visit`; live `sw.js` says `github-exit-shell-2026-08-29-polish-4`; `live-qa.json` (`offline-demo`). |

## Final verification

- Fresh clone at final code SHA `6f4898e66507665d5a76f6125f5b797cbae9fb75`: all 28 commands in `.factory/claims.json` passed independently. The machine-readable log is `evidence/polish-4/clean-clone-claims.json`.
- Full clean-clone gates passed: `npm test` (4 Rust + 44 Playwright tests), `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --allow-dirty`.
- Production cold audit passed on `/`, `/?demo=1`, `/privacy`, `/terms`, and the 404 route at 390 × 844: no serious or critical axe findings, no unexpected console errors, no horizontal overflow, and no undersized controls. See `evidence/polish-4/live-qa.json` and the six `*-390.png` screenshots.
- Factory URL verifier passed for Home, Demo, Privacy, and Terms. See `evidence/polish-4/verify-home`, `verify-demo`, `verify-privacy`, and `verify-terms`.
- Lighthouse mobile production audit: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4 s, LCP 1.4 s, TBT 0 ms, CLS 0. See `evidence/polish-4/lighthouse-mobile.json`.

No review finding remains open.
