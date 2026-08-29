# Adversarial first-read review 6 — PASS

Reviewed 2026-08-29 UTC against production at https://github-dependency-exit.sociobot.in. Used fresh Chromium contexts at 390 × 844 and 1440 × 1000, plus clean checkout /tmp/gde-review6-clean.aET7WB. No product code changed.

## Verdict

PASS. There are no blocking or minor findings. The first screen explains the job, audience, and first action. The demo is populated and isolated. All declared claims and project gates passed from the clean checkout. Earlier findings remain fixed.

## Cold first read

| Question | Answer before scrolling |
| --- | --- |
| What does this do? | It maps GitHub dependencies before a move and produces a checked migration list. |
| For whom? | Small software teams planning a fallback. |
| What should I click first? | Try it with sample data; it opens a browser report with no account or token. |

At 390 px the complete action was visible at y=523–573 of 844 px. At 1440 px it was visible at y=709–761 of 1000 px. There was no horizontal overflow or console error.

## Copy audit

Word counts are whitespace-delimited. Hyphenated terms and commands count once. No landing or README item exceeds 22 words. No unexplained jargon for the developer-team audience, banned marketing adjective, inconsistent term, vague slogan, or non-result-naming action was found. There are no copy findings or proposed rewrites.

### Landing copy

| Copy | Words |
| --- | ---: |
| Skip to main content | 4 |
| GitHub Exit Inventory | 3 |
| Demo / Install / Price / Privacy | 4 |
| GitHub dependency inventory / read-only CLI | 6 |
| Map GitHub dependencies before you move | 6 |
| For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list. | 18 |
| Try it with sample data | 5 |
| Opens a browser report. | 4 |
| No account or token. | 4 |
| Read-only GitHub requests | 3 |
| Reports stay in your output folder | 6 |
| $39 once; one-repository scans stay free | 6 |
| A concrete repository model with moss tracing dependency paths through its joints. | 12 |
| A repository model showing connected migration dependencies. | 7 |
| Sample migration report | 3 |
| See migration dependencies beyond Git history | 6 |
| Every checked area keeps its source. | 6 |
| Missing access becomes an unknown task instead of a silent blank. | 11 |
| Repositories / Workflows / Action refs / Webhooks / Packages / Unknown | 12 |
| github-exit / demo | 3 |
| github-exit demo | 2 |
| Demo — sample data, nothing was uploaded. | 7 |
| Scanned 3 repositories. | 3 |
| 3 checks need manual review. | 5 |
| Report written to /tmp/github-exit-demo-… | 5 |
| Recorded from the real bundled demo command. | 7 |
| Open the full sample report | 6 |
| How it works | 3 |
| Go from API evidence to a dry-run list | 8 |
| Scan read-only metadata | 3 |
| Use one repository for free. | 5 |
| Set a fine-grained token with GITHUB_TOKEN for private metadata. | 10 |
| Check every unknown | 3 |
| The report adds a manual installation-settings check for app and OAuth grants. | 12 |
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
| Grant only the GitHub read permissions needed for your selected checks. | 11 |
| Unreadable checks appear as unknown. | 5 |
| Install | 1 |
| Run the demo before adding a token | 7 |
| Copy command | 2 |
| Build from source with Rust 1.85 or later, or download the Linux binary from this build. | 16 |
| Download Linux binary | 3 |
| Read the source | 3 |
| $39 / One time | 3 |
| Team scan license | 3 |
| Scan every repository under one owner | 6 |
| The free command scans one repository. | 6 |
| An active license adds owner-wide scans and one combined report. | 10 |
| Buy the team scan license | 5 |
| Checkout is hosted by Dodo. | 5 |
| A refund makes the license inactive. | 6 |
| Have a license? Paste it here | 6 |
| Verify license | 2 |
| Remove saved license | 3 |
| No license saved in this browser. | 6 |
| Map GitHub dependencies before a move. | 6 |
| Privacy / Terms / Built by Param Factory | 7 |
| v0.1.0 · build 2026.08 | 4 |

### README copy

| Copy | Words |
| --- | ---: |
| GitHub Exit Inventory | 3 |
| GitHub Exit Inventory is a read-only CLI for small teams planning a forge fallback. | 14 |
| It maps Actions, webhooks, packages, releases, branch rules, issue links, and app or OAuth signals. | 15 |
| It writes an evidence-backed inventory and migration checklist without cloning code. | 11 |
| Live site | 2 |
| One-click sample | 2 |
| Try the bundled demo | 4 |
| The demo needs no account or token. | 7 |
| The command creates a temporary folder and prints its path. | 10 |
| The folder contains | 3 |
| inventory.json for scripts and review tools | 5 |
| migration-checklist.md for a migration dry run | 5 |
| The sample covers three fictional repositories owned by mosswood-labs. | 9 |
| See .factory/demo.md for the sandbox contract. | 6 |
| Install | 1 |
| Build the single binary with Rust 1.85 or later. | 9 |
| The factory publishes release binaries after deployment. | 7 |
| Workers do not publish packages or releases. | 7 |
| Scan one repository for free | 6 |
| Public metadata needs no token. | 5 |
| For a private repository, set a fine-grained token with GITHUB_TOKEN. | 10 |
| Grant only the GitHub read permissions needed for your selected checks. | 11 |
| Unreadable checks appear as unknown. | 5 |
| The token is never written to a report. | 8 |
| Use --json to write one parseable inventory to stdout for a script. | 12 |
| The CLI sends progress to stderr. | 6 |
| It follows every page of GitHub list results and stops when GitHub reports a rate limit. | 16 |
| Use --api-base with a GitHub Enterprise Server 3.14 REST API endpoint. | 11 |
| Scan an owner with a team license | 7 |
| An active $39 one-time license adds owner-wide scans and one combined report. | 12 |
| Buy or restore a license on the product site, then run. | 10 |
| The CLI checks the license through the Sociobot billing API. | 10 |
| It does not send repository metadata there. | 7 |
| Checkout is hosted by Dodo. | 5 |
| A refund makes the license inactive. | 6 |
| What the evidence means | 4 |
| verified means the named API endpoint returned data or a confirmed empty result. | 13 |
| unknown means access failed or GitHub has no complete repository-scoped endpoint. | 11 |
| Alternatives are marked verified only when linked target-forge documentation supports that feature. | 12 |
| The CLI cannot enumerate every app and OAuth grant, so both reports add a manual installation-settings check. | 17 |
| Develop and verify | 3 |
| npm test provisions Rust 1.85.0 when needed, then runs Rust unit and command tests plus Playwright claim and accessibility tests. | 20 |
| npm run test:msrv -- --grep @claim:rust-1-85-build runs the minimum-version claim alone. | 11 |
| npm run build:site creates the static deployment at dist/site/ and stages the Linux binary at dist/site/downloads/. | 16 |
| To prepare the Rust crate without publishing it | 8 |
| Privacy and security | 3 |
| Live scans call the chosen GitHub API. | 7 |
| Owner-wide scans also verify the supplied license with Sociobot. | 9 |
| Browser demo data is bundled into the site and sends no data off site. | 14 |
| Remove a saved browser license from the Price section. | 10 |
| Read Privacy and Terms. | 4 |
| License | 1 |
| MIT. | 1 |
| See LICENSE. | 2 |

The terminology table remains accurate: CLI, repository, report, checklist, inventory JSON, verified, unknown, target forge, owner-wide scan, and demo each have one meaning. The direct visitor-facing claims map to named manifest entries, including demo behavior/privacy, CLI output, local reports, read-only requests, no migration, private-token access, unknown work, source evidence, OAuth manual review, pricing/license outcomes, Dodo checkout, Rust support, binary identity, and GHES support. No unlisted reliance claim was found.

## Demo and sandbox

- Clicking Try it with sample data in a fresh mobile context opened /?demo=1 in one click and immediately rendered the three realistic mosswood-labs repositories, summary counts, evidence, and migration checks.
- The persistent banner read “Demo — sample data, nothing is saved” and included Reset demo and Start for real.
- Filtering one checklist area reduced visible checks from eight to two. Reset demo restored all eight checks, kept the banner, and focused the demo H1.
- Local storage and session storage were both empty before and after that flow. The request log contained only https://github-dependency-exit.sociobot.in.
- After service-worker control, offline reload of the demo returned HTTP 200 and rendered the sample H1 and banner.
- The declared CLI demo claims passed from a fresh temporary directory. They verify JSON and Markdown output, a printed temporary directory, browser/CLI fixture parity, and no GitHub or Sociobot requests.

## Claims verification

.factory/claims.json has 30 entries. I ran every exact test command, individually and unmodified, in the clean checkout. All passed.

| Claim ID | Result |
| --- | --- |
| sample-demo | PASS |
| cli-demo | PASS |
| cli-demo-temp-dir | PASS |
| demo-fixture-parity | PASS |
| demo-privacy | PASS |
| browser-license-storage | PASS |
| read-only-api | PASS |
| json-export | PASS |
| paid-scope | PASS |
| dodo-hosted-checkout | PASS |
| paid-owner-scan | PASS |
| refund-revokes-license | PASS |
| public-no-token | PASS |
| local-reports | PASS |
| no-migration | PASS |
| workflow-step-syntax | PASS |
| unknown-access | PASS |
| paginated-inventory | PASS |
| rate-limit-stop | PASS |
| script-json | PASS |
| token-not-reported | PASS |
| private-token-auth | PASS |
| sourced-evidence | PASS |
| documented-alternatives | PASS |
| oauth-manual-review | PASS |
| sociobot-metadata-privacy | PASS |
| cli-demo-no-network | PASS |
| rust-1-85-build | PASS |
| binary-download-build-match | PASS |
| ghes-api-base | PASS |

## Earlier findings regression check

I read every earlier review, polish report, and handoff. Each stable finding was checked in both the shipped source and production behavior.

| Earlier finding | Fresh confirmation |
| --- | --- |
| F-1-1 | Demo → Back focuses and announces the home H1; Forward focuses and announces the demo H1. |
| F-1-2 | Home, demo, Privacy, Terms, and 404 have their own title, description, canonical, OG, and Twitter metadata. |
| F-1-3 | An unknown live path returns HTTP 404 with the designed shared header/footer, legal links, metadata, icons, and return action. |
| F-1-4 / F-4-1 | “Exit surface” and “accumulated load” are absent from the landing and a fresh Markdown report; the report uses Inventory totals. |
| F-3-1 | Price, Dodo checkout, active owner scan, refund revocation, and browser-license storage/removal all have passing observable claims. |
| F-3-2 | Current production/source use GitHub dependency inventory, not Exit survey. |
| F-4-2a | github-exit demo creates and prints a temporary output directory. |
| F-4-2b | Browser download and CLI demo use the same fixture. |
| F-4-2c | Browser license behavior is fixture-tested and can remove both local keys. |
| F-4-2d / F-5-1 | The documented command provisions Rust 1.85.0 when absent; its exact claim passes. |
| F-4-2e | The staged Linux binary matches the site release binary. |
| F-4-2f | The GHES 3.14 --api-base fixture passes. |
| F-5-2 | The current H1 says Map GitHub dependencies before you move. |
| F-5-3 | Private token authentication and minimum read-permission guidance are covered by private-token-auth. |
| F-5-4 | The app/OAuth manual-review limitation is covered by oauth-manual-review. |
| F-5-5 | Unsupported risk-point ranking wording and output are absent. |
| F-5-6 | The generic THE PRODUCT label is replaced by Sample migration report. |

The earlier unnumbered issues—normal Actions syntax, denied metadata, pagination, rate-limit stopping, JSON-only stdout, token exclusion, sourced evidence, documented alternatives, Sociobot metadata isolation, no-network CLI demo, offline reload, checkout redirect, mobile reflow, target sizes, and format/type checks—also pass through the dedicated claim or live checks above.

## Structure, accessibility, links, and visual identity

- /, /?demo=1, /demo, /privacy, and /terms returned 200. An unknown route returned 404. Product routes had one h1, one main, lang=en, a description, canonical URL, OG/Twitter metadata, favicon, and Apple icon.
- All rendered links crawled successfully: internal pages, download, source, Param Factory, and Dodo checkout. The checkout endpoint returned a 303 to checkout.dodopayments.com.
- Fresh 390 px axe checks on home, demo, Privacy, Terms, and 404 found zero WCAG 2 A/AA violations; no route overflowed horizontally. Live console-error listeners were empty on product routes. Focus moves to the destination H1 on Back and Forward and the polite live region announces it.
- The concrete/moss cutaway, hard survey rules, stamped labels, square controls, lichen focus treatment, and reduced-motion survey reveal match .factory/design.md. This is product-specific visual work rather than a generic SaaS template.
- The brief implies no missing AI workflow. The necessary exports already exist as inventory JSON and a Markdown checklist. Adding AI would be decorative.

## Final quality gates

The following all passed from the clean checkout:

~~~
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
~~~

npm test completed 5 Rust tests and 49 Playwright tests. npm run build created dist/site, staged the executable at dist/site/downloads/github-exit-linux-x86_64, and produced a 28 KB JavaScript asset.

## What would make this perfect

No additional product behavior or copy change is required by this review. Keep the claim commands, cold mobile demo check, and release-binary identity check in the release process so this state remains verified.
