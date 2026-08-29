# Independent verification 7 — GitHub Exit Inventory

**Verdict: FAIL — do not release.** Candidate `94f5953012f801417bb9ad820229c7cdac274d0e` was verified on 2026-08-29 UTC against <https://github-dependency-exit.sociobot.in>. Production is deployed and byte-identical to this candidate, so this is not a deployment-only failure.

The CLI does the researched inventory job in normal cases, every declared claim command passes, and the production build is accessible and fast. Two independent end-to-end checks nevertheless found release-blocking behavior: the CLI ignores GitHub HTTP 429 rate limits, and the browser demo's checklist-area filter does not hide nonmatching rows.

## Mandatory first checks

### First-read and one-click demo gate — PASS

A cold 1440 × 900 production load says:

- What it does: **“Map GitHub dependencies before you move.”**
- For whom: **“For small software teams planning a fallback…”**
- What to do first: **“Try it with sample data”**, beside **“Opens a browser report. No account or token.”**

The action opens `/?demo=1` in one click. The first demo screen is already populated with three `mosswood-labs` repositories, eight migration checks, evidence, and summary counts. The persistent banner says **“Demo — sample data, nothing is saved”** and provides **Reset demo** and **Start for real**.

### Claims gate — all declared commands PASS, but one claim is too narrowly tested

`.factory/claims.json` exists and contains 30 unique claims. After `npm ci` in the clean checkout, every exact `test` command was run separately and exited 0. Passed IDs:

`sample-demo`, `cli-demo`, `cli-demo-temp-dir`, `demo-fixture-parity`, `demo-privacy`, `browser-license-storage`, `read-only-api`, `json-export`, `paid-scope`, `dodo-hosted-checkout`, `paid-owner-scan`, `refund-revokes-license`, `public-no-token`, `local-reports`, `no-migration`, `workflow-step-syntax`, `unknown-access`, `paginated-inventory`, `rate-limit-stop`, `script-json`, `token-not-reported`, `private-token-auth`, `sourced-evidence`, `documented-alternatives`, `oauth-manual-review`, `sociobot-metadata-privacy`, `cli-demo-no-network`, `rust-1-85-build`, `binary-download-build-match`, and `ghes-api-base`.

The local run log was `/tmp/github-exit-claims-installed.azEwiO/results.tsv`. Each normal claim command ran the Rust tests before its tagged Playwright test. The MSRV claim built with Rust 1.85.0, and the binary-parity claim performed a fresh release build.

The passing `rate-limit-stop` test is incomplete. It covers only HTTP 403 with `x-ratelimit-remaining: 0`; the broader visitor-facing claim is disproved by the HTTP 429 result below.

## Release-blocking findings

### High — the CLI ignores HTTP 429 and continues after GitHub reports a rate limit

An independent local GitHub fixture returned a valid repository response, then returned HTTP `429 Too Many Requests` with `Retry-After: 60` and a GitHub-style secondary-limit message for every follow-up request.

Observed result:

- exit code: `0`;
- total requests: `12`;
- additional requests after the first 429: `10`;
- files written: `inventory.json` and `migration-checklist.md`;
- terminal summary: `Scanned 1 repositories. 13 checks need manual review.`

The client therefore neither stops nor fails safely. It keeps calling workflows, hooks, releases, branch protection, rulesets, autolinks, and five package endpoints after the rate limit. This violates the researched constraint to respect GitHub rate limits and the declared claim **“Stops when GitHub reports a rate limit.”**

Cause: `src/github.rs:504` recognizes only status 403 plus a parsed zero remaining count. It does not recognize status 429 or `Retry-After`. The claim test at `site-tests/cli-regression.spec.ts:114` exercises only the 403 variant.

Required repair: treat GitHub 429 as a terminal rate-limit response, also handle documented secondary-limit signals such as `Retry-After`, stop issuing requests immediately, return a nonzero exit, and add a tagged 429 fixture case to the claim test.

### Medium — the live demo's checklist filter has no visible effect

On the production demo, the unfiltered checklist has eight rows. Selecting **Actions** should leave the two Actions rows. It still shows all eight rows.

DOM evidence after selecting Actions:

- two Actions rows: `hidden=false`, computed `display: grid`;
- six nonmatching rows: `hidden=true`, but computed `display: grid` and still visible;
- visible row count: `8`, expected `2`.

Cause: `site/src/main.ts:200` correctly sets the `hidden` property, but the author rule `.check-row { display: grid; }` at `site/src/style.css:739` overrides the browser's hidden presentation. The existing demo privacy test selects Actions but asserts only the selected repository heading, so it does not test the filter outcome.

Required repair: preserve `[hidden] { display: none; }` for checklist rows and add an end-to-end assertion that only matching rows remain visible after each selection.

## Other product and CLI evidence

- Clean install: `npm ci` passed; 24 packages installed and 0 vulnerabilities reported. `npm audit --omit=dev` also reported 0 vulnerabilities.
- Full suite: `npm test` passed — 4 Rust tests and 48 Playwright tests.
- Static checks: `npm run typecheck` and `npm run lint` passed, including rustfmt and clippy with warnings denied.
- Exact production build: `npm run build` passed and created `dist/site/` with the staged Linux binary.
- Packaging: `cargo package --allow-dirty` passed; 13 files, 103.8 KiB unpacked / 26.6 KiB compressed.
- Clean consumer: the unpacked packaged crate installed with `cargo install --path target/package/github-exit-0.1.0 --root <temp> --locked`. Installed `--help` and `--version` worked. `demo` created a printed temporary directory containing both reports. `demo --json` produced parseable JSON with 3 repositories and 8 checklist rows.
- Invalid input: missing target, malformed repository, empty owner, conflicting owner/repository, owner scan without a license, invalid API base, and unwritable output all exited 2 without a panic. The invalid API-base message is noted below.
- Real public scan: an unauthenticated installed-package scan of `octocat/Hello-World` exited 0, wrote JSON and Markdown, found 2 workflows, and surfaced 13 inaccessible checks for manual review.

## Production, privacy, billing, and reliability

- Candidate/live identity: rebuilt `index.html`, JS, CSS, service worker, 404 page/CSS, robots, sitemap, icons, all three product images, and the Linux download matched production byte for byte.
- Key SHA-256 values: JS `6f3b29cbfd7becffd5a2e6b72b1ca0aa2595c7dbc55343f554dd21a0fc5a5eb0`; CSS `46cd947799a047e8b7c240ecd1944a9857cc5bcd69b35464de4fbf02fac4a7b7`; binary `505dc109e146a2965f09868d6a4f8d95239decdfb94b95d4d01d51456ed018c4`.
- Cold home and the complete demo interaction made same-origin requests only. Demo local and session storage remained empty before and after repository selection, filtering, download, and reset.
- License verification sent only the license query to `api.sociobot.in`. Empty input produced recovery guidance; an invalid license was shown as inactive; removal cleared both stored keys; a returned `?license=` token was stored and stripped from the address bar.
- Hosted API allowance: 30 rapid invalid-license verification requests returned 200; request 31 returned 429 with `Retry-After: 3` and `x-ratelimit-after: 3`. The observed short-window allowance is 30 requests per client. Checkout returned 303 to a `checkout.dodopayments.com` session.
- No analytics, third-party font/script, Azure/OpenAI call, or sign-in flow was found. Entra validation is not applicable because the product has no sign-in.
- Security headers include HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and a CSP with response-header `frame-ancestors 'none'`. HTML and the service worker revalidate after 30 seconds; hashed assets are immutable for one year.
- All rendered links returned 200, except the expected checkout 303. A missing route returned a designed HTTP 404.
- Service-worker update completed. After first load, a forced-offline demo reload returned the cached sample report and banner with no runtime error.

## Accessibility, responsive behavior, and performance

- `/opt/fleet/lib/verify-url.sh` passed the live home: title, `lang=en`, one h1, main landmark, image alt text, labeled controls, and no console/page errors.
- Independent axe WCAG 2 A/AA scans found zero serious or critical findings on home, demo, Privacy, Terms, and 404 at both 1440 px and 390 px.
- Every visible link, button, input, and select measured at least 44 × 44 CSS px. No route overflowed at 390 px or at 200% text.
- Keyboard order starts with the visible skip link. Activating it makes the next Tab land on the first main action. The sample action opens the demo with Enter. Focus uses a 3 px lichen outline plus 3 px offset. Back/forward focus restoration passed in the suite.
- Reduced-motion mode produced no active animations. Desktop and mobile screenshots showed the intended concrete/moss design without layout loss.
- Initial JS is 28,472 B raw / 8,741 B gzip; CSS is 13,706 B raw / 3,846 B gzip; no fonts ship; mobile hero is 106,316 B. All bundle budgets pass.
- Fresh mobile Lighthouse: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 0.88 s, LCP 1.44 s, TBT 300 ms, CLS 0.

## Lower-severity finding

### Low — malformed `--api-base` produces opaque recovery text

`github-exit scan --repo octocat/Hello-World --api-base not-a-url` exits 2, but says `GitHub did not return octocat/Hello-World. request failed: builder error`. The CLI should reject a malformed base URL before scanning and tell the user to provide an absolute GitHub API URL. This does not change the FAIL decision above.

## Defects by severity

- Critical: none.
- High: 1 — HTTP 429 rate limits are ignored.
- Medium: 1 — the demo area filter does not filter.
- Low: 1 — invalid API-base recovery text is opaque.

No product code was modified during verification.
