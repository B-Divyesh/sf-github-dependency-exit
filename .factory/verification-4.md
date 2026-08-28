# Independent verification 4 — PASS

**Candidate:** `f656a146e455b8e611af68d8b8002e0efe7c5262` (`main`)

**Production URL:** https://github-dependency-exit.sociobot.in

**Verified:** 2026-08-28 UTC from a clean checkout. This report is independent of the builder's prior deployment-only report.

## Release decision

**PASS.** The candidate meets the researched brief: a local, read-only CLI inventories repository dependencies and writes JSON plus a migration checklist. The deployed site and downloadable CLI are byte-identical to the candidate build.

No product defects were found.

## Mandatory first-read and demo gate

Cold live-page read at 1440 px:

- What it does: “Map what breaks before leaving GitHub.”
- For whom: “small software teams planning a fallback”.
- First action: visible **Try it with sample data**, with the adjacent plain explanation “Opens a browser report. No account or token.”

The link opens `/demo` in one action. It immediately presents a realistic three-repository `mosswood-labs` inventory, carries the persistent “Demo — sample data, nothing is saved” banner, and has Reset demo / Start for real controls. This passes the plain-words and demo-sandbox gates.

## Required claim gate

`.factory/claims.json` exists and contains 19 claims. From the clean checkout, every listed command was run serially and passed. Full command output is retained outside the worktree at `/tmp/gde-claims-final.WAUgiy/<claim-id>.log`.

| Claim ID | Result |
| --- | --- |
| sample-demo | PASS |
| cli-demo | PASS |
| demo-privacy | PASS |
| read-only-api | PASS |
| json-export | PASS |
| paid-scope | PASS |
| public-no-token | PASS |
| local-reports | PASS |
| no-migration | PASS |
| workflow-step-syntax | PASS |
| unknown-access | PASS |
| paginated-inventory | PASS |
| rate-limit-stop | PASS |
| script-json | PASS |
| token-not-reported | PASS |
| sourced-evidence | PASS |
| documented-alternatives | PASS |
| sociobot-metadata-privacy | PASS |
| cli-demo-no-network | PASS |

This includes the observable demo/report outcome, no off-site demo traffic, GET-only GitHub scanning, denied metadata becoming unknown work, pagination, rate-limit stop, source evidence, documented alternatives, and the Sociobot metadata boundary. No unlisted marketing-like claim was found in the landing page or README.

## Clean build and CLI verification

- `npm ci`: PASS (24 packages; 0 reported vulnerabilities).
- `npm test`: PASS — 4 Rust tests and 22 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (`cargo fmt --check`, clippy with warnings denied).
- `npm run build`: PASS; generated `dist/site/` and staged the Linux binary.
- `cargo package --allow-dirty`: PASS — package verification passed; 13 files, 109.0 KiB unpacked / 27.8 KiB compressed.
- Clean consumer install: `cargo install --path /work/repo --root <fresh temp>` passed. The installed `github-exit --help` exposed `scan` / `demo`; installed `demo --json` produced parseable JSON (3 repositories, 8 checklist rows) and Markdown.
- Representative normal case: release binary `github-exit demo --output <fresh temp>` wrote both reports and said nothing was uploaded/saved outside that folder.
- Invalid-input recovery: `github-exit scan --repo not-a-valid-repo-name` exited 2 with: `--repo must use OWNER/REPO with letters, numbers, dots, dashes, or underscores.`

## Production comparison, privacy, and policies

The rebuilt candidate exactly matches production:

| Artifact | SHA-256 |
| --- | --- |
| JavaScript | `483840aba391228ffe0c384d97d276adfc716d10c88d967d612468bd7a9d1898` |
| CSS | `c4924e76a8365064f670e94963176653ba60e8150d10c7d3c13564851e374168` |
| Linux binary | `edfa6c0f4923a02221fc24cbc200067dcc5992c8a1ca9273bd57dcd21682e3ef` |

Each hash matched its file in `dist/site/` byte for byte.

- Live `/`, `/demo`, `/privacy`, and `/terms` return 200. `/missing-route` returns a designed, semantic 404 with a return link.
- First-party demo navigation made only `https://github-dependency-exit.sociobot.in` requests, with no local/session-storage keys written. The deliberate license verification sent only its license query to `https://api.sociobot.in`; it did not send repository metadata.
- No analytics, third-party fonts, scripts, Azure/OpenAI endpoints, or sign-in flow were found. There is no server-side product API other than Sociobot checkout/license verification.
- CSP limits scripts/styles/images to self and connections to self plus Sociobot; HSTS, `nosniff`, strict-origin referrer policy, and restrictive camera/microphone/geolocation permissions policy are live.
- Hashed JS/CSS use `Cache-Control: public, max-age=31536000, immutable`; HTML and the worker use 30-second revalidation. The service worker controlled `/demo`, and a reload after `context.setOffline(true)` still rendered the sample inventory and banner with no console errors.
- A direct 80-request verification-endpoint burst produced 30 HTTP 200 responses followed by 50 HTTP 429 responses. A 429 response included `Retry-After: 3` (and `x-ratelimit-after: 3`); observed threshold: 30 successful requests in this burst.
- Checkout responds 303 to the Sociobot/Dodo hosted session. No purchase was made.

## UX, accessibility, and performance

- Desktop and 390 × 844 mobile were exercised. Mobile had 0 px horizontal overflow on landing and demo; all visible interactive controls met the 44 px test used by the repository suite.
- Keyboard-only: Tab first focused Skip to main content; Enter on the primary link opened the demo. Demo repository controls and filter worked; focus remained visible. Reduced-motion media query was active.
- Live axe WCAG 2 A/AA scan found 0 serious/critical issues on landing, demo, privacy, terms, and 404. Landing/demo had no console or page errors. (Chrome necessarily reports the document’s intentional HTTP 404 status as a failed resource in its console; the 404 document itself has no script/runtime error.)
- Title, `lang=en`, exactly one main and one H1 per route, landmarks, labels, meaningful image alt, skip link, and headings all passed the live checks.
- Live static assets: 26,559 B raw JavaScript, 13,835 B CSS, 106,316 B mobile hero. These are under the stated budgets.
- Lighthouse mobile retry collected Performance **99**, Accessibility **100**, FCP **0.8 s**, LCP **1.4 s**, TBT **130 ms**, CLS **0**. Lighthouse exited nonzero only after collection because its Chromium target crashed while capturing its final full-page screenshot (`TARGET_CRASHED`); the report JSON and metrics were written. This is an environment/tooling caveat, not a page runtime error; the direct Playwright, axe, and mobile checks above passed.

## Link and route checks

All rendered product links were crawled. First-party routes and binary were 200; GitHub and Param Factory links were 200; the checkout link was the expected 303 to Dodo.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Verification commands

```sh
npm ci
# Run every exact command in .factory/claims.json independently
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
```
