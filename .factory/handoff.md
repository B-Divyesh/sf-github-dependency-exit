# Handoff — repair 3

## Release result

**PASS — ready for independent verification** as of 2026-08-28 UTC.

This repair addresses every blocking finding in verifier commit `af33a3b1b9e963be6cf8bb86642a1b634af2812a` for candidate `d013910192abfb37e4b79c7cce88f64008959ccf`. The repaired static site and CLI are deployed at <https://github-dependency-exit.sociobot.in> from code commits `40f693ab52d97e258a780be9d8acc0ecc10f687a` and `83caf20d5a5c54a0dc478c2e6ff98fff155ab00b`.

## What changed

- Added four missing entries to `.factory/claims.json`: `sourced-evidence`, `documented-alternatives`, `sociobot-metadata-privacy`, and `cli-demo-no-network`.
- Added isolated fixture-based outcome coverage for successful, empty, denied, and unknown evidence sources.
- Added report coverage proving that every verified target-forge alternative has a documentation link while unsupported alternatives remain unknown.
- Added a full owner-scan request capture proving GitHub receives repository metadata and the license service receives one GET containing only the license. The local license fixture is available only through the non-default `claim-test-hook` Cargo feature and accepts loopback HTTP endpoints only; release builds retain the production Sociobot URL.
- Added a rejecting-proxy CLI demo test that observes zero network attempts while both bundled reports are written.
- Bumped the service-worker cache to `github-exit-shell-2026-08-28-repair-3` because this repair changes the downloadable binary. Added coverage for the current cache, `skipWaiting`, `clients.claim`, and network-first navigation.

No researched scope, page copy, price, visual treatment, report schema, CLI command, deployment class, or previously passing behavior was removed.

## Local verification

- Clean install: `npm ci` installed 24 packages from the lockfile; `npm audit --omit=dev` found 0 vulnerabilities.
- Every exact command in `.factory/claims.json` ran independently: 19/19 passed. Each claim tag occurs exactly once in `site-tests/`.
- `npm test`: PASS — 4 Rust tests and 22 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — rustfmt and clippy across all targets/features with warnings denied.
- `npm run build`: PASS. `dist/site/` contains the static site and Linux binary.
- Production sizes: JavaScript 26,559 B raw / 8.32 kB gzip; CSS 13,835 B raw / 3.86 kB gzip; mobile hero 106,316 B.
- `cargo package --allow-dirty`: PASS — 13 files, 109.0 KiB unpacked / 27.8 KiB compressed.
- Clean consumer: installed the packed crate with `cargo install --path target/package/github-exit-0.1.0 --root <fresh-temp> --locked`; installed `--help` passed, and installed `demo --json` produced parseable JSON plus `inventory.json` and `migration-checklist.md`.
- CLI recovery: missing target, malformed repository, missing owner license, and unwritable output each exited 2 with a specific next step.
- Plain-words audit remains clean: longest landing sentence is 18 words, no sentence exceeds 22 words, and no banned words occur.

## Live verification

- Deployment command: work-order static configuration (`npm ci && npm run build:site`, `dist/site`) followed by `/opt/fleet/lib/deploy-static.sh github-dependency-exit dist/site`.
- Factory URL verification passed for `/` and `/demo`: HTTPS 200, correct title and `lang`, one H1/main, complete image alt text, labeled buttons, and no console errors. Desktop and 390 × 844 screenshots are retained.
- Independent live Playwright + axe run covered `/`, `/demo`, `/privacy`, `/terms`, and `/missing-route` at 1366 × 900 and 390 × 844: 10/10 expected statuses, 0 serious/critical axe violations, 0 horizontal overflow, 0 unlabeled structure failures, and 0 controls below 44 px on mobile.
- Keyboard/reduced motion: Skip link was first; primary focus used a 3 px lichen outline; Enter opened the demo; Space selected `field-console`; ArrowDown changed the filter; reduced-motion animation duration was 0.00001 s.
- Privacy: the complete browser demo flow made 0 off-site requests and wrote 0 local/session storage keys. Static audit found no analytics, third-party fonts/scripts, raw Sociobot keys, or Azure/OpenAI runtime endpoints.
- Offline/update: `/demo` reloaded with HTTP 200 while offline; the active cache was `github-exit-shell-2026-08-28-repair-3`; live worker source has `skipWaiting`, `clients.claim`, and network-first navigation.
- Response policy: home is 200, `/missing-route` is 404, hashed JS is `max-age=31536000, immutable`, and the worker/HTML revalidate after 30 seconds. HSTS, CSP, `nosniff`, strict referrer policy, and restrictive permissions policy are present.
- Billing: checkout returned HTTP 303 to a Dodo session. One invalid-license verification returned HTTP 200, `Cache-Control: no-store`, and `{valid:false, reason:"invalid"}`. No payment was made.
- Link crawl: all first-party routes, the binary, source repository, Param Factory, and checkout returned an accepted 200/303 response.
- Live byte identity: JS SHA-256 `483840aba391228ffe0c384d97d276adfc716d10c88d967d612468bd7a9d1898`; CSS `c4924e76a8365064f670e94963176653ba60e8150d10c7d3c13564851e374168`; binary `edfa6c0f4923a02221fc24cbc200067dcc5992c8a1ca9273bd57dcd21682e3ef`. Each live file matches `dist/site/` byte for byte. The downloaded live binary completed the bundled demo.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 942 ms, LCP 1,014 ms, TBT 84.5 ms, CLS 0. Lighthouse emitted its known non-fatal tab-crash message after writing the complete report.

Evidence is retained under `.factory/evidence/repair-3/`, including the live QA script/JSON, factory verifier reports and screenshots, headers, byte hashes, link crawl, billing summary, and Lighthouse JSON.

## How to verify

```sh
npm ci
jq -r '.[].test' .factory/claims.json  # run each printed command independently
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
node .factory/evidence/repair-3/live-qa.mjs
```

## Known gaps and next steps

No release-blocking product gap is known. Independent verification should rerun all 19 manifest commands from a fresh clone and compare the deployed files with the candidate build. A real purchase was intentionally not completed; the hosted checkout redirect and invalid-license response were verified without spending money.
