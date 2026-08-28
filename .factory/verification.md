# Independent product verification — FAIL

Verified on 2026-08-28 (UTC).

- Candidate: `3f6a6216a5b5a04dca1120babd862cc82c8bdfe6`
- Live URL: `https://github-dependency-exit.sociobot.in`
- Work order: `github-dependency-exit-verify-1`
- Final result: **FAIL — do not release**

The live deployment is present and byte-for-byte matches the candidate build. This is not only a deployment failure. The candidate can silently omit common GitHub Action references and records some unreadable dependency areas as verified. That breaks the researched job-to-be-done and its success measure.

## Release-blocking findings

### Critical — normal Actions syntax is silently omitted

A local GitHub API fixture returned a workflow containing normal step syntax (`- uses: actions/checkout@v4` and a commit-pinned external action). The scan exited 0 but reported `action_dependencies: 0`. The parser only accepts a trimmed line starting exactly with `uses:`; normal list-item syntax starts with `- uses:`. This can produce the precise failure the product promises to prevent: an unlisted dependency in a migration dry run.

Evidence: `evidence/verification-1/cli-independent-qa.json`; implementation at `src/github.rs:107-119`.

### Critical — access failures can become false “verified” results

In a private-repository fixture, the workflow list was readable but fetching the workflow file returned 403. The report still marked Actions `verified`, said `1 actions found`, and recorded no warning that workflow contents were unreadable. A branch-protection request returning `404 Not Found` was also labeled `verified` with “no default branch protection returned,” although 404 can represent missing permission. Five package checks correctly became unknown evidence, but no package task appeared in the migration checklist.

This violates the claim that denied metadata becomes an unknown rather than a silent blank.

Evidence: `evidence/verification-1/unknown-access-qa.json`; implementation at `src/github.rs:101-128`, `149-159`, and `224-259`.

### High — inventories silently stop at 100 items

The API fixture advertised 101 workflows and provided a next page. The CLI requested only `?per_page=100`, never requested page 2, exited 0, and reported 100. The same non-paginated pattern is used for workflows, webhooks, releases, rulesets, autolinks, and package lists.

Evidence: `evidence/verification-1/pagination-qa.json`.

### High — paid purchase is broken live

The first-party buy action links to the required Sociobot endpoint, but a fresh GET returned HTTP 404:

```json
{"error":"enabled factory product","status":404}
```

The advertised `$39` owner-wide scan therefore cannot be purchased. The `paid-scope` claim test only checks displayed copy and the href; it does not exercise checkout or an owner-wide scan, so it is a false-positive claim test.

Evidence: `evidence/verification-1/checkout-response.txt` and `evidence/verification-1/link-crawl.log`.

### High — `--json` is not valid JSON output

`github-exit demo --json` exits 0 but appends `Report written to …` to stdout after the JSON document. `JSON.parse(stdout)` fails, contradicting the documented scripting interface. The same code path exists for `scan --json`.

Evidence: `evidence/verification-1/cli-independent-qa.json`.

### High — the CLI keeps calling GitHub after rate exhaustion

After a fixture returned HTTP 403 with `x-ratelimit-remaining: 0`, the CLI made 11 more API requests and exited 0. It records the limit but does not stop or wait, contrary to the brief's “respect GitHub rate limits” constraint.

Evidence: `evidence/verification-1/github-rate-limit-qa.json`.

### High — mandatory mobile accessibility gate fails

Independent axe at 390 px found one serious `scrollable-region-focusable` violation on the home page: the horizontally scrollable terminal `<pre>` cannot receive keyboard focus. The demo is also 16 CSS px wider than the viewport because a long evidence URL does not wrap. A 200% text-only resize produced 405 px of demo overflow. Header/footer links, “Start for real,” and “Reset demo” measure 22–36 px high, below the required 44 px touch target.

Evidence: `evidence/verification-1/axe-mobile-home.json`, `mobile-overflow.json`, `text-200.json`, and `live-browser-qa.json`.

### High — available static quality checks fail

- TypeScript check: FAIL, `site/src/main.ts:162` (`EventTarget` is not assignable to `HTMLFormElement`).
- `cargo fmt --check`: FAIL; source is not rustfmt-clean.
- `cargo clippy --all-targets --all-features -- -D warnings`: FAIL with `collapsible_if` and `too_many_arguments`.
- `cargo check --all-targets`: PASS.

Evidence: `evidence/verification-1/tsc.log`, `cargo-fmt.log`, `cargo-clippy.log`, and `cargo-check.log`.

### Medium — claims inventory does not cover relied-on promises

All nine commands listed in `.factory/claims.json` pass, but the manifest/test mapping does not prove several visitor-facing promises. Examples include “GitHub returns an unknown check when the token cannot read an endpoint” (demonstrably false), “Use `--json` … for a script” (false), “The token is never written to a report,” “The CLI has no telemetry,” and “the demo needs … no network request.” The paid claim asserts only text and an href, not the paid outcome. Under the claims contract, unlisted or non-outcome claim tests are release blocking.

### Medium — missing routes return a success status

`/missing-route` renders a styled not-found screen but returns HTTP 200, not 404. The deployment config explicitly rewrites 404 to the SPA with `statusCode: 200`.

Evidence: `evidence/verification-1/headers.log` and `live-browser-qa.json`.

### Medium — update caching is unsafe

The service worker uses a fixed `github-exit-v1` cache and cache-first navigation without `skipWaiting`/client takeover. Stable-name images under `/assets/` are served with `max-age=31536000, immutable`. A future deployment can leave existing visitors on the old shell or old art unless both cache version and asset names change.

## Mandatory first-read and demo gate

**PASS.** Cold desktop and 390 px loads answer all three required questions in plain words:

- What: “Map what breaks before leaving GitHub.”
- For whom: small software teams planning a fallback.
- First action: “Try it with sample data,” beside “Opens a browser report. No account or token.”

Clicking once opens `/demo`, immediately shows the populated Mosswood Labs report, and displays “Demo — sample data, nothing is saved.”

Evidence: `evidence/verification-1/live-home-desktop.json`, `evidence/verification-1/live-home-mobile.json`, and `evidence/verification-1/claims/sample-demo.log`.

## Claims manifest results

Every exact command from `.factory/claims.json` was run separately from the initially clean candidate checkout through the shipped demo/local API entry points.

| Claim | Exact test result | Evidence |
| --- | --- | --- |
| `sample-demo` | PASS | `evidence/verification-1/claims/sample-demo.log` |
| `cli-demo` | PASS | `evidence/verification-1/claims/cli-demo.log` |
| `demo-privacy` | PASS | `evidence/verification-1/claims/demo-privacy.log` |
| `read-only-api` | PASS | `evidence/verification-1/claims/read-only-api.log` |
| `json-export` | PASS | `evidence/verification-1/claims/json-export.log` |
| `paid-scope` | PASS mechanically; inadequate outcome coverage and live outcome fails | `evidence/verification-1/claims/paid-scope.log`, `evidence/verification-1/link-crawl.log` |
| `public-no-token` | PASS | `evidence/verification-1/claims/public-no-token.log` |
| `local-reports` | PASS | `evidence/verification-1/claims/local-reports.log` |
| `no-migration` | PASS | `evidence/verification-1/claims/no-migration.log` |

## Build, test, package, and end-to-end evidence

- Clean install: `npm ci` PASS; zero audit vulnerabilities.
- Full suite: `npm test` PASS — 4 Rust tests and 12 Playwright tests.
- Exact production build: `npm run build` PASS; `dist/site/` produced.
- Bundle: JS 26.47 KB raw / 8.29 KB gzip; CSS 13.61 KB raw / 3.81 KB gzip; mobile hero 106.3 KB. Budgets pass.
- Package: `cargo package --allow-dirty` PASS; clean package install PASS; installed `--help` and `demo` PASS.
- Live binary: version 0.1.0; demo wrote JSON and Markdown.
- Real GitHub public-repository scan: exit 0, one repository scanned, JSON and Markdown written. It exposed six unknown checks and also illustrated the missing package checklist task.
- Invalid input/recovery: missing target, malformed repo, missing owner license, and unwritable output all returned exit code 2 with actionable messages.

Evidence: `evidence/verification-1/npm-test.log`, `npm-build.log`, `npm-audit.log`, `cargo-package.log`, `cargo-install.log`, `installed-help.log`, `installed-demo.log`, `live-binary.log`, `real-scan-summary.json`, and `cli-independent-qa.json`.

## Deployment identity, browser, privacy, and policies

- Deployment identity: PASS. HTML, hashed JS/CSS, all original images, metadata files, service worker, and downloadable binary match the candidate production build byte-for-byte. The live binary SHA-256 is `b9e1263f47f73a966ae507d22ab595d7d679f1ad4641a19f55ed225ea9ddce7c`.
- Live routes `/`, `/demo`, `/privacy`, and `/terms`: 200 with HSTS, CSP, `nosniff`, referrer policy, and permissions policy.
- Console/page/request errors: none on tested routes at desktop and 390 px.
- Browser demo privacy: only same-origin requests during demo use; no storage is written in demo mode.
- License flow: the query token is stripped, stored only under documented namespaced keys, and only the token is sent to Sociobot verification. An invalid token fails clearly.
- No analytics, third-party fonts/scripts, Azure keys, or model calls were found.
- Sign-in/Entra: not applicable; there is no sign-in.
- Product-owned server/backend concurrency and persistence: not applicable; this is a static site plus local CLI.
- Billing verification rate limit: PASS. In a 120-request burst, 31 returned 200 and 89 returned 429. Every 429 included `Retry-After` (observed 0–4 seconds); the first indexed 429 was request 23 under concurrency.
- Offline reload: PASS after service-worker control for `/demo` and `/privacy`; see update-caching finding above.

Evidence: `evidence/verification-1/deployment-match.log`, `headers.log`, `live-browser-qa.json`, `license-flow.json`, `privacy-static-audit.log`, `rate-limit.log`, and `offline-qa.json`.

## Accessibility and performance controls that passed

- Semantic title/lang/main/one-H1/alt checks passed on home and demo with the factory verifier.
- Axe had no serious/critical findings on all desktop routes or mobile demo/privacy/terms/not-found.
- Keyboard: skip link is first, focus ring is visible, Enter opens the demo, Space changes repository, arrow keys change the filter, and reset restores the filter.
- Reduced motion collapses the only animation to 0.01 ms.
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.4 s, TBT 180 ms, CLS 0; 117 KiB transferred.

## Required next steps

1. Parse workflow YAML correctly and propagate every workflow-content failure as unknown evidence/checklist work.
2. Distinguish permission failures from confirmed absence; never label ambiguous 404s verified. Add package-unknown checklist items.
3. Paginate every list endpoint and add boundary tests over 100 items.
4. Stop or defer requests immediately when GitHub rate capacity is exhausted.
5. Make `--json` stdout a single JSON document; send status text to stderr.
6. Register/enable the Sociobot paid product, then add an end-to-end checkout/license/owner-scan claim test.
7. Fix the serious axe issue, 390 px demo overflow, 200% reflow, and all sub-44 px targets; run axe at mobile as well as desktop.
8. Make TypeScript, rustfmt, and clippy checks pass and add them to the standard test script.
9. Correct the claims inventory and tests so each promise is exercised as an observable outcome.
10. Return a real 404 and version the service-worker shell/assets safely.
