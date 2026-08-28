# Independent product verification — FAIL

Verified 2026-08-28 UTC against candidate `d2d60ae480cc7531eed4f4be98970587d22ae990` and the deployed URL `https://github-dependency-exit.sociobot.in`.

## Decision

**FAIL — do not release.** The deployment is live and matches this candidate, so this is not a deployment-only problem. The CLI can produce false-complete migration inventories for ordinary GitHub data, and the advertised paid purchase cannot be completed.

## Required first checks

### Claims and demo gate

`.factory/claims.json` exists and all nine exact commands were run independently after `npm ci` from this clean checkout:

| Claim | Exact command | Result |
| --- | --- | --- |
| `sample-demo` | `npm test -- --grep @claim:sample-demo` | PASS |
| `cli-demo` | `npm test -- --grep @claim:cli-demo` | PASS |
| `demo-privacy` | `npm test -- --grep @claim:demo-privacy` | PASS |
| `read-only-api` | `npm test -- --grep @claim:read-only-api` | PASS |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS |
| `paid-scope` | `npm test -- --grep @claim:paid-scope` | PASS mechanically; live checkout fails below |
| `public-no-token` | `npm test -- --grep @claim:public-no-token` | PASS |
| `local-reports` | `npm test -- --grep @claim:local-reports` | PASS |
| `no-migration` | `npm test -- --grep @claim:no-migration` | PASS |

Cold production-page read: it says “Map what breaks before leaving GitHub,” identifies “small software teams planning a fallback,” and places “Try it with sample data” beside “Opens a browser report. No account or token.” One click opens `/demo` with a populated Mosswood Labs inventory and the persistent “Demo — sample data, nothing is saved” banner. **The mandatory first-read and one-click demo gate passes.**

## Release-blocking findings

### Critical — common GitHub Actions references are omitted

With a local API fixture containing the normal workflow lines `- uses: actions/checkout@v4` and `- uses: docker/login-action@<40-char SHA>`, `scan` exited 0 and reported `action_dependencies: 0` rather than 2. The parser only accepts a trimmed line beginning exactly `uses:`; normal workflow step syntax begins `- uses:`. This can leave a migration dependency unlisted, directly failing the product's job-to-be-done.

Fresh fixture result: expected 2 references, observed 0; all request methods were GET. Relevant implementation: `src/github.rs`, workflow-content parser around lines 101–128.

### Critical — denied metadata is presented as verified

A private-repository fixture returned one visible workflow but 403 for its contents, 404 for branch protection, and 403 for packages. The scan exited 0. Its Actions checklist says `verified` / “1 actions found”; its branch rules checklist says `verified` / “0 branch rules found”; it contains no package checklist item. Five package evidence entries are unknown, but this does not yield a migration task.

The report's promise that inaccessible data becomes an unknown rather than a silent blank is therefore false. A 404 for branch protection is not sufficient proof of absence because GitHub can use it for insufficient permission.

### High — list endpoints silently stop at 100 items

A fixture advertised 101 workflows and returned 100 on page one. The CLI made one request (`/actions/workflows?per_page=100`), never requested `page=2`, exited 0, and reported 100 workflows. Workflows, webhooks, releases, rulesets, autolinks, and packages use the same non-paginated pattern. An inventory that silently truncates a dependency class cannot support a dry run.

### High — GitHub rate-limit exhaustion does not stop the scan

After the repository lookup, a fixture returned 403 with `x-ratelimit-remaining: 0` on every request. The CLI still made 11 further requests, wrote a report, and exited 0. This violates the researched constraint to respect GitHub rate limits.

### High — `--json` cannot be consumed as JSON

`github-exit demo --json` exits 0 but writes `Report written to …` after the JSON object on stdout. `JSON.parse(stdout)` fails. The same output code path is used by `scan --json`, contradicting the documented scripting interface. Status/progress text must go to stderr when `--json` is selected.

### High — paid checkout is broken in production

The visible “Buy the team scan license” link is the specified Sociobot endpoint, but fresh live GET/redirect testing returns:

```json
{"error":"enabled factory product","status":404}
```

The advertised `$39` owner-wide scan cannot be purchased. The `paid-scope` claim only checks page copy and the href, not the checkout result or an owner-wide scan, so it is not a sufficient outcome test.

### High — mandatory mobile accessibility and layout checks fail

Fresh axe analysis of the live home page at 390 × 844 reports a serious `scrollable-region-focusable` violation for the horizontal terminal region. At the same viewport, `/demo` has 16 px horizontal overflow. Measured interactive controls below the required 44 px height include header/footer links (22–24 px), **Reset demo** (36 px), and **Start for real** (22 px). This violates the supplied accessibility baseline and the factory product contract.

### High — available type/lint/format checks fail

- `npx tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --resolveJsonModule --allowSyntheticDefaultImports site/src/main.ts site/src/types.ts`: FAIL — `site/src/main.ts:162`, `EventTarget` is not assignable to `HTMLFormElement`.
- `cargo fmt --check`: FAIL — Rust sources are not rustfmt-clean.
- `cargo clippy --all-targets --all-features -- -D warnings`: FAIL — `collapsible_if` at `src/github.rs:105` and `too_many_arguments` at `src/github.rs:253`.

### Medium — claims coverage is materially inadequate

Every listed claim test passes, but user-reliant promises in the page/README are unlisted or not tested as outcomes. Examples are “GitHub returns an unknown check when the token cannot read an endpoint” (fresh fixture disproves it), “Use `--json` … for a script” (false), “The token is never written to a report,” “The CLI has no telemetry,” and the no-network CLI demo statement. The paid claim tests copy and a URL, while the promised paid outcome is unavailable. Under the claims contract, this is release-blocking until claims are removed or their observable outcomes are tested.

### Medium — bad routes return HTTP 200

`https://github-dependency-exit.sociobot.in/missing-route` renders a styled not-found page but returns HTTP 200. `site/public/staticwebapp.config.json` rewrites the 404 override to `index.html` with `statusCode: 200`; this contradicts the routing requirement for a real 404 response.

### Medium — service-worker updates can remain stale

The service worker has fixed cache name `github-exit-v1`, cache-first navigation, and no `skipWaiting` or client takeover. The shell can remain old after an update until a future code change manually changes the cache constant. Offline reload succeeds, but update behavior is unsafe.

## Checks that passed

- `npm ci`: PASS; `npm audit --omit=dev`: 0 vulnerabilities.
- Full suite `npm test`: PASS — 4 Rust tests and 12 Playwright tests.
- Exact `npm run build`: PASS; `dist/site/` contains the static deployment and `downloads/github-exit-linux-x86_64`.
- `cargo check --all-targets`: PASS.
- `cargo package --allow-dirty`: PASS. The packaged crate was unpacked into a fresh temporary consumer, installed using `cargo install --path … --root …`, and its installed `--help` and `demo --output` paths passed; demo produced both `inventory.json` and `migration-checklist.md`.
- Normal/invalid CLI handling: missing target, malformed repository, missing owner license, and unwritable output all exit 2 with actionable messages. The local fixture confirms scan requests are GET only.
- Browser demo has no off-site requests; no console or page errors appeared on `/`, `/demo`, `/privacy`, `/terms`, or `/missing-route` at 390 px. The cold demo sample, JSON download, reset control, keyboard Skip link / Enter / Space / Arrow flow, visible focus ring, and reduced-motion mode passed.
- Offline reload passed after service-worker control for `/demo` and `/privacy`; cache name observed: `github-exit-v1`.
- Static budgets pass: initial JS 26,471 bytes raw, CSS 13,610 bytes raw, mobile image 106,316 bytes raw.
- Live headers include HSTS, CSP, `nosniff`, referrer policy, and permissions policy. No analytics, third-party CDN scripts/fonts, raw Azure keys, or sign-in flow were found. Entra is not applicable.
- The Sociobot verification endpoint rate-limits: a fresh 60-request simultaneous invalid-license burst yielded 29 × 200 and 31 × 429. The first observed indexed 429 was request 14; every 429 included `Retry-After: 0`.

## Deployment identity

The live HTML references `index-vs0fQwmo.js` and `index-C3F2ElWN.css`. Fresh SHA-256 comparisons match the candidate build for both files, the downloadable Linux binary, and all three product images tested. The live binary hash is `b9e1263f47f73a966ae507d22ab595d7d679f1ad4641a19f55ed225ea9ddce7c`. The live deployment therefore matches this candidate.

## Required remediation before reconsideration

1. Parse valid workflow YAML/step `uses` syntax and make every unreadable workflow-content result unknown checklist work.
2. Treat permission-ambiguous 404s as unknown, and create checklist entries for package access failures.
3. Paginate every list endpoint and add >100-item boundary tests.
4. Stop/defer immediately after rate exhaustion and test it.
5. Keep `--json` stdout strictly JSON.
6. Register/enable the Sociobot product; add checkout, license verification, and owner-scan outcome coverage.
7. Resolve the mobile axe violation, overflow, and all undersized touch targets.
8. Make TypeScript, rustfmt, and clippy clean; include them in the standard quality gate.
9. Add outcome tests for every visitor-facing claim, or remove unsupported copy.
10. Return a real HTTP 404 and version/take over service-worker updates safely.
