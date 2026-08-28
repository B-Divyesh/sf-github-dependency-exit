# Independent product verification — FAIL

Verified 2026-08-28 UTC against candidate `d013910192abfb37e4b79c7cce88f64008959ccf` and `https://github-dependency-exit.sociobot.in`.

## Decision

**FAIL — do not release.** The executable, browser product, production deployment, accessibility, purchase redirect, and standard quality gates all passed fresh checks. The candidate nevertheless fails the mandatory claims contract: visitor-facing guarantees remain unlisted in `.factory/claims.json` and therefore have no required observable sandbox test.

## Required first checks

### Claims and demo gate

After `npm ci` from this checkout, every exact manifest command passed independently. Logs are retained for this verification at `/tmp/gde-claims-3/<claim>.log`.

| Claim | Exact command | Result |
| --- | --- | --- |
| `sample-demo` | `npm test -- --grep @claim:sample-demo` | PASS |
| `cli-demo` | `npm test -- --grep @claim:cli-demo` | PASS |
| `demo-privacy` | `npm test -- --grep @claim:demo-privacy` | PASS |
| `read-only-api` | `npm test -- --grep @claim:read-only-api` | PASS |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS |
| `paid-scope` | `npm test -- --grep @claim:paid-scope` | PASS |
| `public-no-token` | `npm test -- --grep @claim:public-no-token` | PASS |
| `local-reports` | `npm test -- --grep @claim:local-reports` | PASS |
| `no-migration` | `npm test -- --grep @claim:no-migration` | PASS |
| `workflow-step-syntax` | `npm test -- --grep @claim:workflow-step-syntax` | PASS |
| `unknown-access` | `npm test -- --grep @claim:unknown-access` | PASS |
| `paginated-inventory` | `npm test -- --grep @claim:paginated-inventory` | PASS |
| `rate-limit-stop` | `npm test -- --grep @claim:rate-limit-stop` | PASS |
| `script-json` | `npm test -- --grep @claim:script-json` | PASS |
| `token-not-reported` | `npm test -- --grep @claim:token-not-reported` | PASS |

Cold live-page read: “Map what breaks before leaving GitHub” says the product inventories repository dependencies for “small software teams planning a fallback.” The visible first action is **Try it with sample data**, with the adjacent explanation “Opens a browser report. No account or token.” One click opens `/demo`, showing the populated Mosswood Labs inventory and persistent **Demo — sample data, nothing is saved** banner with Reset demo and Start for real. The first-read and one-click-demo gate passes.

## Release-blocking finding

### High — visitor-facing claims are not all listed and outcome-tested

The claims skill requires an entry and one tagged observable test for every statement a visitor could rely on. The following current statements have no matching claim id or dedicated sandbox outcome test:

| Location | Unlisted guarantee | Missing observable test |
| --- | --- | --- |
| Landing page, product preview | “Every checked area keeps its source.” | Run a representative scan and assert a source/evidence record for every collected area, including errors and empty results. |
| README, “What the evidence means” | “Alternatives are marked `verified` only when linked target-forge documentation supports that feature.” | Fixture/report test covering both a verified alternative with documentary evidence and an unknown alternative without it. |
| Privacy page | “Repository metadata is not sent to Sociobot.” | Full real-scan network capture asserting GitHub-only inventory traffic and that the only Sociobot request, when licensing is used, contains the license rather than repository metadata. |
| `.factory/demo.md` and landing terminal | “Neither demo calls GitHub or Sociobot” / “Demo — sample data, nothing was uploaded.” | A CLI-demo network sandbox that rejects all outbound connections while still proving both reports are written. |

The current `demo-privacy` test covers the browser demo only. Source inspection suggests the missing guarantees are currently true, but the factory contract explicitly disallows retaining untestable or unlisted promises. This is release-blocking until the copy is removed or each promise is entered in `claims.json` and tested.

## Quality and product evidence that passed

- Clean install: `npm ci` passed; `npm audit --omit=dev` reported 0 vulnerabilities.
- Full suite: `npm test` passed: 4 Rust tests and 17 Playwright tests.
- Available checks: `npm run typecheck` and `npm run lint` (rustfmt plus clippy with `-D warnings`) passed.
- Production build: exact `npm run build` passed and produced `dist/site/`, including `downloads/github-exit-linux-x86_64`. `cargo package --allow-dirty` passed.
- Clean consumer: the packaged crate was installed with `cargo install --path target/package/github-exit-0.1.0 --root <fresh-temp> --locked`; installed `--help` passed and `demo --json --output <fresh-temp>` produced parseable JSON plus `inventory.json` and `migration-checklist.md`.
- CLI behavior: fixture coverage passed for normal YAML `- uses:` actions, access-denied unknowns, list pagination past 100, immediate GitHub rate-limit stopping, GET-only traffic, no token report leakage, and JSON-only stdout. Fresh direct invalid paths (`scan` with no target, malformed `--repo`, owner scan without license, unwritable output) each exited 2 with actionable errors.
- Desktop and 390 px live browser checks: one h1, `lang=en`, `<main>`, no console/page errors, no horizontal overflow, no controls below 44 px, visible 3 px focus outline, keyboard Skip link and demo navigation, and no axe serious/critical violations on home or demo. Reduced-motion context passed.
- Browser demo: current-session requests were same-origin only; filter, repository switch, reset, and JSON download worked.
- PWA: the live worker `github-exit-shell-2026-08-28-repair-2` controlled `/demo`; offline reload returned 200 and retained “Review the sample exit inventory.” Its source versions the cache, calls `skipWaiting`, `clients.claim`, and uses network-first navigation.
- Performance: production JS is 26,559 B raw / 8,344 B gzip; CSS is 13,835 B raw / 3,866 B gzip; mobile hero is 106,316 B. Lighthouse mobile scored Performance 99, Accessibility 100, Best Practices 100, SEO 100. Lighthouse emitted a non-fatal tab-crash warning after writing the complete report.
- Privacy/policy: no analytics, third-party font/script CDN, Azure/OpenAI endpoint, or sign-in flow was observed. CSP permits only self plus the Sociobot billing endpoint for connections; HSTS, `nosniff`, strict referrer policy, and a restrictive permissions policy are live. `/missing-route` returns 404; hashed assets are immutable for one year.
- Billing and rate limit: checkout returns HTTP 303 to a Dodo session. A 60-request concurrent invalid-license burst to the Sociobot verify endpoint produced 30 × 200 and 30 × 429; the first observed indexed 429 was request 27 (concurrent ordering is inherently approximate), with `Retry-After: 2`. Invalid license recovery in the UI showed “The license is not active (invalid).”

## Deployment identity

The live page loads `index-GDq8yZ2y.js` and `index-nLGQcxz1.css`. SHA-256 comparisons exactly match the candidate production build for those assets, the downloadable Linux binary, desktop hero, mobile hero, and Open Graph image. The live binary hash is `df335468a6453e51e99e7db2b13f3a403d0f79831a5af0099ed0626f1f2d1533`. This is not a deployment-only failure.

## Required remediation

Add the four listed guarantees to `.factory/claims.json` with isolated outcome tests (or remove the statements), then rerun all claims and independent verification. No product-code defect was observed in the newly repaired functionality.
