# Adversarial first-read review 2 — PASS

**Reviewed:** 2026-08-28 UTC  
**Production:** <https://github-dependency-exit.sociobot.in>  
**Method:** Fresh Chromium contexts at 390 × 844 and 1440 × 1000; a clean clone at `/tmp/gde-review2-clean.4kDHnm`; no product code changed.

## Verdict

**PASS.** There are zero blocking or minor findings. The cold landing page names the job, audience, and first action; the sample is a real isolated demo; all manifest claims passed; earlier findings remain fixed; and the live site meets the route, metadata, accessibility, privacy, and link checks.

## Cold first read

Before scrolling, at both widths:

| Question | First-read answer |
| --- | --- |
| What does this do? | It maps GitHub dependencies that could break before a team moves away from GitHub, then makes a migration checklist. |
| For whom? | Small software teams planning a fallback. |
| What should I click first? | **Try it with sample data**. It says it opens a browser report with no account or token. |

At 390 px the headline, audience, primary action, and its explanation are visible without scrolling. The action occupies y=602–652 in an 844 px viewport; page width is exactly 390 px (no horizontal overflow). Desktop presents the same answer and primary action on the first screen. This passes the mandatory first-read gate.

## Copy audit

Counts are whitespace-delimited; hyphenated terms count as one word. The landing strings below are the rendered `/` route. No sentence exceeds 22 words, contains a banned marketing adjective, uses inconsistent terminology, or needs a rewrite. Result-naming controls use verbs; navigation labels are navigation rather than result actions.

### Landing page

| Copy | Words |
| --- | ---: |
| Exit survey / read-only CLI | 5 |
| Map what breaks before leaving GitHub | 6 |
| For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list. | 18 |
| Try it with sample data | 5 |
| Opens a browser report. | 4 |
| No account or token. | 4 |
| Read-only GitHub requests | 3 |
| Reports stay in your output folder | 6 |
| $39 once; one-repository scans stay free | 6 |
| A concrete repository model with moss tracing dependency paths through its joints. | 12 |
| A repository model showing connected migration dependencies. | 7 |
| The product | 2 |
| See migration dependencies beyond Git history | 6 |
| Every checked area keeps its source. | 6 |
| Missing access becomes an unknown task instead of a silent blank. | 11 |
| Recorded from the real bundled demo command. | 7 |
| Open the full sample report | 6 |
| How it works | 3 |
| Go from API evidence to a dry-run list | 8 |
| Scan read-only metadata | 3 |
| Use one repository for free. | 5 |
| Add a fine-grained token when private metadata needs it. | 9 |
| Check every unknown | 3 |
| The report labels blocked endpoints and OAuth grant review as manual work. | 12 |
| Test the target forge | 4 |
| Use the Markdown checklist during a dry run. | 8 |
| Keep JSON for scripts and review tools. | 7 |
| Boundaries | 1 |
| It maps the move; it does not perform it | 9 |
| The CLI does not clone code, move issues, rewrite workflows, or promise forge compatibility. | 14 |
| It sends GitHub API requests from your machine. | 8 |
| Reports stay in the output folder you choose. | 8 |
| Minimum access | 2 |
| Public repositories work without a token. | 6 |
| Private scans need read access for the metadata you want checked. | 11 |
| Install | 1 |
| Run the demo before adding a token | 7 |
| Copy command | 2 |
| Build from source with Rust 1.85 or later, or download the Linux binary from this build. | 16 |
| Download Linux binary | 3 |
| Read the source | 3 |
| Team scan license | 3 |
| Scan every repository under one owner | 6 |
| The free command scans one repository. | 6 |
| The license adds owner-wide scans and one combined report. | 9 |
| Buy the team scan license | 5 |
| Sociobot/Dodo is the merchant of record. | 6 |
| Refunds revoke the license. | 4 |
| Have a license? | 3 |
| Paste it here. | 3 |
| Verify license | 2 |
| No license saved in this browser. | 6 |
| Map GitHub dependencies before a move. | 6 |

### README

| Copy | Words |
| --- | ---: |
| GitHub Exit Inventory is a read-only CLI for small teams planning a forge fallback. | 14 |
| It maps Actions, webhooks, packages, releases, branch rules, issue links, and app or OAuth signals. | 15 |
| It writes an evidence-backed inventory and migration checklist without cloning code. | 11 |
| Live site: | 2 |
| One-click sample: | 2 |
| The demo needs no account or token. | 7 |
| The command creates a temporary folder and prints its path. | 10 |
| The folder contains: | 3 |
| The sample covers three fictional repositories owned by mosswood-labs. | 9 |
| See .factory/demo.md for the sandbox contract. | 6 |
| Build the single binary with Rust 1.85 or later: | 9 |
| The factory publishes release binaries after deployment. | 7 |
| Workers do not publish packages or releases. | 7 |
| Public metadata needs no token: | 5 |
| For a private repository, pass a fine-grained token through the environment: | 11 |
| Start with repository Metadata: read. | 5 |
| Add read access for Actions, administration, webhooks, and packages only when those checks matter. | 14 |
| The report creates unknown checklist work when GitHub access is incomplete. | 11 |
| The token is never written to a report. | 8 |
| Use --json to write one parseable inventory to stdout for a script. | 12 |
| The CLI sends progress to stderr. | 6 |
| It follows every page of GitHub list results and stops when GitHub reports a rate limit. | 16 |
| Use --api-base for a GitHub Enterprise Server API. | 8 |
| A $39 one-time license enables owner-wide scans and one combined report. | 11 |
| Buy or restore a license on the product site, then run: | 11 |
| The CLI checks the license through the Sociobot billing API. | 10 |
| It does not send repository metadata there. | 7 |
| Sociobot/Dodo is the merchant of record. | 6 |
| verified means the named API endpoint returned data or a confirmed empty result. | 13 |
| unknown means access failed or GitHub has no complete repository-scoped endpoint. | 11 |
| Alternatives are marked verified only when linked target-forge documentation supports that feature. | 12 |
| Risk points rank review work. | 5 |
| They do not estimate migration time. | 6 |
| GitHub does not expose a complete repository-scoped OAuth grant list. | 10 |
| The CLI records workflow and webhook signals, then adds a manual installation-settings check. | 13 |
| This limitation stays visible in both report formats. | 8 |
| Live scans call the chosen GitHub API. | 7 |
| Owner-wide scans also verify the supplied license with Sociobot. | 9 |
| Browser demo data is bundled into the site and sends no data off site. | 14 |
| Read Privacy and Terms. | 4 |

The repository's `.factory/copy-audit.md` matches this rendered audit and its terminology table keeps **CLI**, **repository**, **report**, **checklist**, **inventory JSON**, **verified**, **unknown**, **target forge**, **owner-wide scan**, and **demo** consistent. Technical terms occur only where the developer-team audience needs the exact GitHub concept; none prevents the first-screen job or action from being understood.

## Demo and sandbox

- A fresh click on **Try it with sample data** opened `/?demo=1` in one action.
- The first demo screen immediately showed a realistic `mosswood-labs/trail-api` report: 3 repositories, 5 workflows, 8 action references, 3 webhooks, 2 packages, and 3 unknown checks.
- The persistent banner reads **Demo — sample data, nothing is saved** and supplies **Reset demo** and **Start for real**.
- Switching to `field-console`, then choosing Reset demo, restored `trail-api`, retained the banner, and focused the demo H1.
- Local storage and session storage were empty before and after the flow. The request log contained only `https://github-dependency-exit.sociobot.in`.
- Download sample JSON produced `github-exit-sample-inventory.json` with 3 repositories and 5 workflows.
- After service-worker control, an offline reload of `?demo=1` returned 200 and rendered the sample report and banner without a console error.
- In a fresh temporary directory, `cargo run --quiet -- demo --output <temp>` wrote `inventory.json` (3 repositories, 5 workflows, 8 checklist rows, 3 unknown checks) and `migration-checklist.md`. It uses the bundled sample and does not touch real browser or GitHub data.

## Claims

`.factory/claims.json` contains 19 entries. Each exact listed command was run serially from the clean clone; all passed. `npm test` also passed in that clone (4 Rust tests and 33 Playwright tests).

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

The landing and README claims map to these entries: sample entry/no-token, read-only and no migration, local JSON/Markdown reports, public scan scope, owner-wide paid scope, unknown handling, workflow parsing, pagination, rate limiting, token exclusion, source evidence, documented alternatives, and browser/CLI/Sociobot privacy. No unlisted visitor-reliant claim was found.

## Earlier findings regression check

I read `.factory/review-1.md`, `.factory/polish-1.md`, every `.factory/verification*.md`, and the prior handoff. All earlier independent defects were retested through the final claim suite or live behavior. The four stable review findings are fixed in both code and production:

| Earlier ID | Fresh confirmation |
| --- | --- |
| F-1-1 | Demo → Back focuses the home H1 and announces it; Forward focuses the demo H1. |
| F-1-2 | Home, demo, Privacy, and Terms have distinct rendered title, description, canonical, OG, and Twitter metadata. |
| F-1-3 | A missing path returns HTTP 404 and uses the designed full header/footer shell, metadata, favicon, and Apple touch icon. |
| F-1-4 | The landing uses “See migration dependencies beyond Git history” and “A repository model showing connected migration dependencies”; the prior undefined metaphors are absent. |

The older verification findings for normal Actions syntax, denied metadata, pagination, rate-limit stopping, JSON stdout, token exclusion, source/alternative evidence, Sociobot metadata isolation, no-network CLI demo, checkout, 404 behavior, service-worker refresh, TypeScript/rustfmt/clippy, mobile reflow, and touch targets are covered by the passing tests and fresh live checks. No earlier finding is merely marked fixed or regressed.

## Structure, links, accessibility, privacy, and leverage

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns 404. All have `lang=en`, one `main`, one H1, a skip link, canonical metadata, favicon, Apple touch icon, and the shared header/footer with Privacy and Terms.
- Route-change focus and `aria-live` announcements work for History API navigation, Back, and Forward. No dead rendered links were found: first-party pages, binary, repository, factory site, and checkout resolved successfully (checkout reaches its hosted flow).
- Mobile axe WCAG 2 A/AA scans found zero violations on home, demo, Privacy, Terms, and 404. There was no 390 px horizontal overflow and no unexpected console error on product routes. The expected browser network error for a deliberate HTTP 404 is not a page runtime error.
- The concrete/moss palette, hard report rules, stepped type, original cutaway art, and reduced-motion survey reveal match `.factory/design.md`. The site is visibly product-specific rather than a generic SaaS template.
- The brief is fulfilled by a local CLI plus JSON/Markdown output. An AI feature would not improve the concrete inventory job and would be decorative; import/export is already supplied by report files and sample JSON.

## What would make this perfect

Keep the current verification coverage and rerun this complete cold-read, claim, demo, offline, route, link, and accessibility pass on each release. No corrective product work is identified in this round.
