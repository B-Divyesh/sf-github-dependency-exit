# Adversarial first-read review 3 — FAIL

**Reviewed:** 2026-08-29 UTC  
**Production:** <https://github-dependency-exit.sociobot.in>  
**Method:** fresh Chromium contexts at 390 × 844 and 1440 × 1000; fresh clean clone at `/tmp/gde-review3-clean.JKlpXp` at `4846f53054a256b552575d19463d966153ba27e2`; no product code changed.

## Verdict

**FAIL.** The cold first read, one-click demo, isolated demo storage, CLI demo, routes, visual identity, accessibility checks, and all 19 listed commands pass. The paid claim is not tested through the promised owner-wide outcome, and the paid page contains billing assertions with no claims-manifest entries. This is blocking under the claims contract. A small copy issue also remains. PASS requires zero findings.

## Cold first read

Before scrolling, in separate fresh 390 px and desktop contexts:

| Question | First-read answer |
| --- | --- |
| What does this do? | It maps GitHub dependencies that could break before a team leaves GitHub, then builds a migration checklist. |
| For whom? | Small software teams planning a fallback. |
| What should I click first? | **Try it with sample data**; it says this opens a browser report without an account or token. |

At 390 px, the primary action was fully visible at y=601.9–652.2 in an 844 px viewport, with zero horizontal overflow. At 1440 × 1000 it was visible at y=850.3–902.2. Both screens answer the mandatory questions without scrolling, so the first-read gate passes.

## Findings

### F-3-1 — BLOCKING — paid outcome is untested and billing assertions are unlisted

- **Exact quote/location:** Landing price section: “The free command scans one repository. The license adds owner-wide scans and one combined report.” The same scope appears in `.factory/claims.json` as `paid-scope`: “$39 once for owner-wide scans; one-repository scans stay free.” The price and Terms pages say, “Sociobot/Dodo is the merchant of record. Refunds revoke the license.” README repeats, “Sociobot/Dodo is the merchant of record.”
- **Evidence:** The only tagged test, `site-tests/product.spec.ts` `@claim:paid-scope`, checks the displayed `$39`, the free-repository sentence, the checkout href, and a `303` redirect to Dodo. It never runs `github-exit scan --owner …` with a valid license, never observes a combined report, and never checks that a refunded license becomes invalid. `claims.json` has no entries for merchant-of-record or refund revocation. The fresh checkout request did return `303` to a Dodo session, but that proves only the redirect.
- **Why this fails:** A visitor deciding whether to pay is relying on the owner-wide capability and refund consequence. The required claim test does not assert the main paid result, and the two billing statements have no claim entry or sandbox proof. The claims contract makes an untested or unlisted visitor-reliant claim release-blocking.
- **Concrete fix:** Add a `paid-owner-scan` claim whose tagged sandbox test uses the billing fixture to accept a test license, executes an owner scan, and asserts one combined report contains all fixture repositories. Add a separate `refund-revokes-license` claim whose fixture marks the same license refunded and asserts owner scanning fails with an actionable message. If merchant-of-record status cannot be proved in this repository’s sandbox, replace it with the testable “Checkout is hosted by Dodo” or remove it. Update the page, README, and manifest to match the tested wording.

### F-3-2 — Minor — “Exit survey” is not a plain, stable product term

- **Exact quote/location:** Landing eyebrow, before the H1: “EXIT SURVEY / READ-ONLY CLI”.
- **Why this loses clarity:** “Exit survey” could mean an employee offboarding questionnaire. It is neither the product name nor a term in the published terminology table, which calls the output an **inventory**. On a first phone screen it adds a label that must be translated before the headline clarifies it.
- **Concrete fix:** Replace it with **“GITHUB DEPENDENCY INVENTORY / READ-ONLY CLI”**. This names the product work directly and matches the README and terminology table.

## Copy audit

Counts use whitespace-delimited words; hyphenated compounds count once. The following includes reader-visible landing headings, prose, fact lines, controls, and terminal text, then every README prose sentence. No string exceeds 22 words. Aside from F-3-2, no banned marketing adjective, unexplained metaphor, inconsistent term, or non-result-naming action control was found. Technical terms such as API, OAuth, token, and target forge are necessary for the stated developer-team audience and are explained by context.

### Landing page

| Copy | Words | Review |
| --- | ---: | --- |
| Exit survey / read-only CLI | 5 | F-3-2 |
| Map what breaks before leaving GitHub | 6 | — |
| For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list. | 18 | — |
| Try it with sample data | 5 | — |
| Opens a browser report. | 4 | — |
| No account or token. | 4 | — |
| Read-only GitHub requests | 3 | — |
| Reports stay in your output folder | 6 | — |
| $39 once; one-repository scans stay free | 6 | F-3-1 claim scope |
| A concrete repository model with moss tracing dependency paths through its joints. | 12 | — |
| A repository model showing connected migration dependencies. | 7 | — |
| The product | 2 | — |
| See migration dependencies beyond Git history | 6 | — |
| Every checked area keeps its source. | 6 | — |
| Missing access becomes an unknown task instead of a silent blank. | 11 | — |
| Demo — sample data, nothing was uploaded. | 7 | — |
| Scanned 3 repositories. | 3 | — |
| 3 checks need manual review. | 5 | — |
| Report written to /tmp/github-exit-demo-… | 5 | — |
| Recorded from the real bundled demo command. | 7 | — |
| Open the full sample report | 6 | — |
| How it works | 3 | — |
| Go from API evidence to a dry-run list | 8 | — |
| Scan read-only metadata | 3 | — |
| Use one repository for free. | 5 | — |
| Add a fine-grained token when private metadata needs it. | 9 | — |
| Check every unknown | 3 | — |
| The report labels blocked endpoints and OAuth grant review as manual work. | 12 | — |
| Test the target forge | 4 | — |
| Use the Markdown checklist during a dry run. | 8 | — |
| Keep JSON for scripts and review tools. | 7 | — |
| Boundaries | 1 | — |
| It maps the move; it does not perform it | 9 | — |
| The CLI does not clone code, move issues, rewrite workflows, or promise forge compatibility. | 14 | — |
| It sends GitHub API requests from your machine. | 8 | — |
| Reports stay in the output folder you choose. | 8 | — |
| Minimum access | 2 | — |
| Public repositories work without a token. | 6 | — |
| Private scans need read access for the metadata you want checked. | 11 | — |
| Install | 1 | — |
| Run the demo before adding a token | 7 | — |
| Copy command | 2 | — |
| Build from source with Rust 1.85 or later, or download the Linux binary from this build. | 16 | — |
| Download Linux binary | 3 | — |
| Read the source | 3 | — |
| Team scan license | 3 | — |
| Scan every repository under one owner | 6 | F-3-1 claim scope |
| The free command scans one repository. | 6 | F-3-1 claim scope |
| The license adds owner-wide scans and one combined report. | 9 | F-3-1 |
| Buy the team scan license | 5 | — |
| Sociobot/Dodo is the merchant of record. | 6 | F-3-1 |
| Refunds revoke the license. | 4 | F-3-1 |
| Have a license? | 3 | — |
| Paste it here. | 3 | — |
| Verify license | 2 | — |
| No license saved in this browser. | 6 | — |
| Map GitHub dependencies before a move. | 6 | — |

### README

| Copy | Words | Review |
| --- | ---: | --- |
| GitHub Exit Inventory is a read-only CLI for small teams planning a forge fallback. | 14 | — |
| It maps Actions, webhooks, packages, releases, branch rules, issue links, and app or OAuth signals. | 15 | — |
| It writes an evidence-backed inventory and migration checklist without cloning code. | 11 | — |
| Live site: | 2 | — |
| One-click sample: | 2 | — |
| The demo needs no account or token. | 7 | — |
| The command creates a temporary folder and prints its path. | 10 | — |
| The folder contains: | 3 | — |
| The sample covers three fictional repositories owned by mosswood-labs. | 9 | — |
| See .factory/demo.md for the sandbox contract. | 6 | — |
| Build the single binary with Rust 1.85 or later: | 9 | — |
| The factory publishes release binaries after deployment. | 7 | — |
| Workers do not publish packages or releases. | 7 | — |
| Public metadata needs no token: | 5 | — |
| For a private repository, pass a fine-grained token through the environment: | 11 | — |
| Start with repository Metadata: read. | 5 | — |
| Add read access for Actions, administration, webhooks, and packages only when those checks matter. | 14 | — |
| The report creates unknown checklist work when GitHub access is incomplete. | 11 | — |
| The token is never written to a report. | 8 | — |
| Use --json to write one parseable inventory to stdout for a script. | 12 | — |
| The CLI sends progress to stderr. | 6 | — |
| It follows every page of GitHub list results and stops when GitHub reports a rate limit. | 16 | — |
| Use --api-base for a GitHub Enterprise Server API. | 8 | — |
| A $39 one-time license enables owner-wide scans and one combined report. | 11 | F-3-1 |
| Buy or restore a license on the product site, then run: | 11 | — |
| The CLI checks the license through the Sociobot billing API. | 10 | — |
| It does not send repository metadata there. | 7 | — |
| Sociobot/Dodo is the merchant of record. | 6 | F-3-1 |
| verified means the named API endpoint returned data or a confirmed empty result. | 13 | — |
| unknown means access failed or GitHub has no complete repository-scoped endpoint. | 11 | — |
| Alternatives are marked verified only when linked target-forge documentation supports that feature. | 12 | — |
| Risk points rank review work. | 5 | — |
| They do not estimate migration time. | 6 | — |
| GitHub does not expose a complete repository-scoped OAuth grant list. | 10 | — |
| The CLI records workflow and webhook signals, then adds a manual installation-settings check. | 13 | — |
| This limitation stays visible in both report formats. | 8 | — |
| npm test runs Rust unit and command tests plus Playwright claim and accessibility tests. | 12 | — |
| npm run build:site creates the static deployment at dist/site/ and stages the Linux binary at dist/site/downloads/. | 15 | — |
| Live scans call the chosen GitHub API. | 7 | — |
| Owner-wide scans also verify the supplied license with Sociobot. | 9 | F-3-1 paid-flow coverage |
| Browser demo data is bundled into the site and sends no data off site. | 14 | — |
| Read Privacy and Terms. | 4 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

The terminology table remains internally consistent for **CLI**, **repository**, **report**, **checklist**, **inventory JSON**, **verified**, **unknown**, **target forge**, **owner-wide scan**, and **demo**. F-3-2 is the only landing term outside that vocabulary that needs a rewrite.

## Demo and sandbox

The demo gate passes.

- A fresh mobile click on **Try it with sample data** opened `/?demo=1` in one action.
- The first rendered screen already showed the realistic `mosswood-labs/trail-api` report: 3 repositories, 5 workflows, 8 action references, 3 webhooks, 2 packages, and 3 unknown checks.
- The persistent banner reads **Demo — sample data, nothing is saved** and includes **Reset demo** and **Start for real**.
- Selecting `field-console`, then choosing Reset demo restored `trail-api`; the banner remained and no browser storage was written.
- The fresh demo request log contained only `https://github-dependency-exit.sociobot.in`; localStorage and sessionStorage were empty before and after the flow. Demo mode did not read or alter a sentinel real-data namespace in the repository test suite.
- After service-worker control, an offline reload returned HTTP 200 with the populated sample H1 and banner, with no console error.
- In a fresh temporary directory, the claim-tested `github-exit demo --output <folder>` flow wrote `inventory.json` and `migration-checklist.md`. The CLI no-network claim tests it with all standard proxy variables pointed at a rejecting fixture.

## Claims

All 19 commands were executed separately from the fresh clone. Every listed command exited 0; the per-command log is `/tmp/gde-review3-claims.log` outside the worktree.

| Claim ID | Result |
| --- | --- |
| sample-demo | PASS |
| cli-demo | PASS |
| demo-privacy | PASS |
| read-only-api | PASS |
| json-export | PASS |
| paid-scope | PASS mechanically; outcome coverage is F-3-1 |
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

The listed browser/CLI/privacy claims are covered by matching observable fixtures. F-3-1 is the exception: the `paid-scope` fixture verifies price and checkout availability but not its owner-wide scan result; merchant and refund claims have no entries.

## Earlier-review regression check

Read all earlier `.factory/review-*.md`, `.factory/polish-*.md`, `.factory/verification*.md`, `.factory/handoff.md`, plus the current brief, design, demo contract, and claims manifest. The first two stable review IDs are fixed live and in code:

| Earlier ID | Fresh confirmation |
| --- | --- |
| F-1-1 | Demo → Back focused the home H1; the live region announced it. |
| F-1-2 | Home, demo, Privacy, and Terms had distinct title, description, canonical, OG, and Twitter metadata. |
| F-1-3 | An unknown production path returned HTTP 404 with the designed shared shell and metadata. |
| F-1-4 | The former “exit surface” and “accumulated load” copy is absent. |

The earlier verification issues covering normal Actions syntax, denied metadata, pagination, rate-limit stopping, JSON stdout, token exclusion, source/alternative evidence, Sociobot metadata isolation, CLI-demo network isolation, checkout availability, 404 behavior, service-worker refresh, mobile reflow/targets, TypeScript, rustfmt, and clippy are all covered by the fresh passing tests or live checks. The earlier general claims-coverage concern is **not fully fixed**: F-3-1 confirms the paid outcome and related billing statements are still not covered as required.

## Structure, access, links, and leverage

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200. `/review-three-missing` returned the designed static 404. All product routes had `lang=en`, exactly one main and one H1, expected titles, a description, canonical, OG/Twitter image metadata, favicon, Apple touch icon, skip link, shared header/footer, Privacy and Terms links, and route-change focus/live announcement behavior.
- The production 404’s browser console necessarily recorded its HTTP 404 resource status. No product-route runtime or script error appeared on home, demo, privacy, or terms.
- All rendered navigational, download, source, factory, and checkout destinations resolved: first-party pages/download and external source/factory URLs returned 200; checkout returned 303 to a Dodo hosted session and then 200. The deliberately tested missing route is excluded from the no-dead-link result.
- Fresh mobile axe WCAG 2 A/AA scans found no violations on home, demo, legacy demo, Privacy, Terms, or the designed 404. Home/demo had zero horizontal overflow. Keyboard Tab reached the skip link first; the primary link and demo controls worked.
- The concrete/moss cutaway, stamped typography, hard rules, palette, focus treatment, and reduced-motion policy match `.factory/design.md` and are visibly unlike a generic SaaS template.
- The brief is satisfied by a local CLI and JSON/Markdown outputs. AI would not improve this deterministic evidence-inventory job; import/export is already present. No decorative AI feature or embedded provider key is present.

## Quality checks run

From the clean clone:

```sh
npm ci
# every exact command from .factory/claims.json, separately
npm test
npm run typecheck
npm run lint
npm run build
```

All passed. `npm test` reported 4 Rust tests and 33 Playwright tests; `npm run build` produced `dist/site/`.

## What would make this perfect

Prove the paid feature rather than only its price and redirect: test a successful owner-wide combined report and a refunded-license rejection through a no-spend fixture, then give every remaining billing statement a precise claim entry or delete it. Replace “Exit survey” with the inventory term used everywhere else. Repeat the complete cold-read, demo, privacy/offline, claims, CLI, route, link, and accessibility review after that repair.
