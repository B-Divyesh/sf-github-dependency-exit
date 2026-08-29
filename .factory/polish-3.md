# Polish round 3 — all findings closed

Polished released candidate `d60ef7e075a79aa4e9fa6a461743e6b287d78325` from review base `6f298d5598af24e5c271a3273f37ca099bb151c3`. Product repairs are in `82a9a00`, test isolation in `7c1cd43`, and 200% text reflow in `68af341`.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — Back navigation did not focus the restored heading | Retained the animation-frame route focus behavior and Back/Forward coverage. | Playwright: `Back and Forward focus the heading for the restored route`; live `historyFocus` in [`live-qa.json`](evidence/polish-3/live-qa.json); [home screenshot](evidence/polish-3/home/screenshot-mobile.png); live `/` and `/?demo=1`. |
| F-1-2 — SPA routes retained home metadata | Retained route-owned title, description, canonical, Open Graph, and Twitter metadata for home, both demo URLs, Privacy, and Terms. | Playwright: five `route … sets complete route-specific metadata` cases; 12 cold live route/viewport records in [`live-qa.json`](evidence/polish-3/live-qa.json); [Privacy screenshot](evidence/polish-3/privacy/screenshot-mobile.png) and [Terms screenshot](evidence/polish-3/terms/screenshot-mobile.png). |
| F-1-3 — 404 lacked the standard shell and metadata | Retained the static HTTP 404, complete metadata, shared navigation/footer, legal links, factory attribution, and build id. | Playwright: `the static 404 has complete metadata and the standard site shell` plus deployment-config status test; live status 404 and zero axe violations in [`live-qa.json`](evidence/polish-3/live-qa.json); [404 screenshot](evidence/polish-3/404/screenshot-mobile.png); live `/missing-polish-3-route`. |
| F-1-4 — Landing headings used undefined metaphors | Retained “See migration dependencies beyond Git history” and the direct repository-model caption. | Playwright: `landing preview names migration dependencies without design metaphors`; [home screenshot](evidence/polish-3/home/screenshot-mobile.png); live `/`. |
| F-3-1 — Paid outcome was untested and billing assertions were unlisted | Split paid copy into four precise claims. Added a no-spend billing fixture that accepts a test license, scans two owner repositories, and asserts one JSON and Markdown report. Added a refunded fixture that stops before GitHub and gives recovery guidance. Replaced the unprovable merchant statement with the tested “Checkout is hosted by Dodo.” | Playwright: `the paid tier has one price… @claim:paid-scope @claim:dodo-hosted-checkout`, `an active license writes one owner-wide report… @claim:paid-owner-scan`, and `a refunded license stops an owner-wide scan… @claim:refund-revokes-license`; all exact manifest commands passed from clean remote clone `68af341`; [price screenshot](evidence/polish-3/price-mobile.png); live `/#price`, `/terms`, and checkout 303 recorded in [`live-qa.json`](evidence/polish-3/live-qa.json). The deployed binary hash matches the tested build in [`asset-sha256.txt`](evidence/polish-3/asset-sha256.txt). |
| F-3-2 — “Exit survey” was not a stable product term | Replaced it with “GitHub dependency inventory / read-only CLI” and updated the copy audit and terminology check. | Playwright: `the first-screen label uses the product inventory term`; live `firstScreen.eyebrow` and `oldWordingCount: 0` in [`live-qa.json`](evidence/polish-3/live-qa.json); [home screenshot](evidence/polish-3/home/screenshot-mobile.png); live `/`. |

Review 2 was a pass and introduced no finding IDs.

## Earlier unnumbered findings

Every older issue in `verification.md` through `verification-4.md` remains closed:

| Earlier issue | Current evidence |
| --- | --- |
| Normal `- uses:` Actions steps were omitted | `@claim:workflow-step-syntax` passes. |
| Denied metadata could look verified or disappear | `@claim:unknown-access` passes. |
| GitHub list results stopped at 100 | `@claim:paginated-inventory` passes. |
| JSON stdout contained progress text | `@claim:script-json` passes. |
| Scans continued after rate exhaustion | `@claim:rate-limit-stop` passes. |
| Token or repository metadata could cross a privacy boundary | `@claim:token-not-reported` and `@claim:sociobot-metadata-privacy` pass. |
| Source evidence, documented alternatives, and no-network CLI demo were unlisted | `@claim:sourced-evidence`, `@claim:documented-alternatives`, and `@claim:cli-demo-no-network` pass. |
| Checkout did not resolve | `@claim:dodo-hosted-checkout` passes; live checkout returns 303 to `checkout.dodopayments.com`. |
| Mobile overflow, 200% text overflow, terminal focus, and small targets | Normal mobile checks and the new `text enlarged to 200 percent keeps every route within the mobile viewport` pass; live [text-200.json](evidence/polish-3/text-200.json) records zero overflow on five routes. |
| TypeScript, rustfmt, and clippy failed | `npm run typecheck` and `npm run lint` pass from the clean clone. |
| Unknown routes returned 200 | Live missing route returns 404; see [`404/headers.txt`](evidence/polish-3/404/headers.txt). |
| Service-worker updates could remain stale | Cache is versioned `github-exit-shell-2026-08-29-polish-3`, claims clients immediately, and uses network-first navigation; offline demo reload passes. |

## Final evidence

- Fresh remote clone `/tmp/gde-polish3-release.O5lOAP` at `68af341f84c574368538c6b172e9f6f4ced23275`: all 22 exact `.factory/claims.json` commands passed independently.
- The same clone: `npm test` passed 4 Rust tests and 38 Playwright tests; `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --allow-dirty` passed.
- Live route audit: 12 desktop/mobile records across `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and a real 404; zero WCAG 2 A/AA axe violations, console errors, mobile overflow, missing alt text, or undersized controls. See [`live-qa.json`](evidence/polish-3/live-qa.json).
- Live demo: one click to `/?demo=1`; populated report, persistent banner, reset focus, isolated real-data sentinel, no browser writes, same-origin requests only, and offline HTTP 200 reload.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.4 s, TBT 30 ms, CLS 0. See [`lighthouse-mobile.json`](evidence/polish-3/lighthouse-mobile.json).
- Initial assets: JavaScript 28,008 B, CSS 13,902 B, mobile hero 106,316 B. Live JS, CSS, and binary hashes match the deployment build.
- Production: <https://github-dependency-exit.sociobot.in>.

No blocking, high, medium, low, or minor finding remains open.
