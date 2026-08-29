# Adversarial first-read review 4 — FAIL

**Reviewed:** 2026-08-29 UTC

**Production:** <https://github-dependency-exit.sociobot.in>

**Method:** fresh Chromium contexts at 390 × 844 and 1440 × 1000; clean clone `/tmp/gde-review4-clean.fAg7Eo` at `87a1535f2a490b4bf861f25a5788b588efc6a9bb`; no product code changed.

## Verdict

**FAIL.** The cold landing page, one-click browser demo, CLI demo, storage isolation, offline reload, listed claim commands, routes, links, build, and accessibility checks pass. Two blocking findings remain. The Markdown report still uses the earlier undefined heading “Exit surface,” so F-1-4 was only fixed on the landing page. Several specific live and README promises also have no matching claim entry and observable tagged test. PASS requires zero findings and no untested claim.

## Cold first read

Before scrolling, in separate fresh mobile and desktop contexts:

| Question | First-read answer |
| --- | --- |
| What does this do? | It maps GitHub repository dependencies that can complicate leaving GitHub, then builds a checked migration list. |
| For whom? | Small software teams planning a fallback. |
| What should I click first? | **Try it with sample data**. The adjacent text says it opens a browser report without an account or token. |

At 390 px, the primary action occupied y=616.9–667.2 in the 844 px viewport. At 1440 px it was also visible without scrolling. The headline, audience sentence, action, and outcome text were readable in both contexts, with no horizontal overflow. This mandatory gate passes.

## Findings

### F-4-1 / F-1-4 reopened — BLOCKING — the undefined “exit surface” heading remains in the actual report

- **Exact quote/location:** Fresh CLI demo output `/tmp/github-exit-demo-9680-1787995633/migration-checklist.md`, line 9: **“## Exit surface”**. Source: `src/report.rs:12`. The public browser demo directs visitors to the same CLI demo and the README tells them to generate this Markdown report.
- **Prior finding:** F-1-4 required removal of unexplained “exit surface” language. `.factory/polish-1.md` and `.factory/polish-3.md` say the wording was removed, but their regression test checks only rendered landing-page text. The exact term remains in the shipped report generator. This is a half-fix of F-1-4, so the historical finding is blocking again.
- **Why a user is lost:** “Exit surface” does not name the table beneath it. A reader opening the primary migration deliverable must infer that it means inventory totals. The heading also conflicts with the documented terminology table, which uses **inventory**, **report**, and **checklist**.
- **Concrete fix:** Rename the heading to **“Inventory totals”**. Add a report assertion that the Markdown contains `## Inventory totals` and contains no case-insensitive `exit surface` or `accumulated load`. Extend the plain-word regression search beyond the browser DOM to generated CLI reports.

### F-4-2 — BLOCKING — specific operational and privacy claims have no matching claims-manifest coverage

- **Exact quotes/locations:**
  - README, bundled demo: **“The command creates a temporary folder and prints its path.”** The `cli-demo` tagged test always supplies `--output`, so it never observes the documented default command creating and reporting its own temporary folder.
  - Live `/demo`: **“This browser report uses the same data as `github-exit demo`.”** The browser and CLI tests check their samples separately; no test compares the two outputs.
  - Live `/privacy`: **“If you paste a license, this browser stores the token and its last verification result.”** No manifest entry or tagged test submits the form and asserts the two documented storage keys and verification request.
  - Landing Install and README: **“Build from source with Rust 1.85 or later”** / **“Build the single binary with Rust 1.85 or later.”** The clean build used Rust 1.98.0. No manifest claim runs the minimum supported 1.85 toolchain.
  - Landing Install: **“download the Linux binary from this build.”** The link resolves, but no tagged claim proves the downloaded executable is the binary staged by the current build.
  - README: **“Use `--api-base` for a GitHub Enterprise Server API.”** Local fixtures prove that the option changes the base URL; no claim declares a supported GitHub Enterprise Server version or runs against a representative fixture for one.
- **Why a user is misled:** These statements describe observable setup, data parity, storage, compatibility, and artifact provenance. A visitor can rely on them, but `.factory/claims.json` has no exact entry whose tagged sandbox test proves the promised outcome. Manual success in this review does not satisfy the product contract that every published claim is continuously tested.
- **Concrete fix:** Add narrowly scoped entries and one tagged test each: `cli-demo-temp-dir` (run exactly `github-exit demo`, parse its printed path, assert both files); `demo-fixture-parity` (deep-compare browser JSON with `github-exit demo --json`); `browser-license-storage` (intercept verification, submit a fixture token, assert the two keys and clearing behavior); `rust-1-85-build`; `binary-download-build-match`; and `ghes-api-base` with a named supported GHES fixture. If GHES support or minimum-version testing is not intended, rewrite those sentences to the narrower behavior that is tested.

## Landing and README copy audit

Counts use visible words; punctuation separators are not words and hyphenated compounds count once. Headings, labels, controls, terminal text, alt text, and prose are included because each must make sense when read out of context. No landing or README item exceeds 22 words. No banned marketing adjective appears. Result actions use verbs. The copy-only flag found during the product flow is F-4-1 in the generated report, which is outside these two surfaces.

### Landing page

| Copy | Words | Review |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| GitHub Exit Inventory | 3 | — |
| Demo / Install / Price / Privacy | 4 | — |
| GitHub dependency inventory / read-only CLI | 6 | — |
| Map what breaks before leaving GitHub | 6 | — |
| For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list. | 18 | — |
| Try it with sample data | 5 | Result-naming verb. |
| Opens a browser report. | 4 | — |
| No account or token. | 4 | Covered by `sample-demo`. |
| Read-only GitHub requests | 3 | Covered by `read-only-api`. |
| Reports stay in your output folder | 6 | Covered by `local-reports`. |
| $39 once; one-repository scans stay free | 6 | Covered by `paid-scope`. |
| A concrete repository model with moss tracing dependency paths through its joints. | 12 | Useful image alt text. |
| A repository model showing connected migration dependencies. | 7 | — |
| The product | 2 | — |
| See migration dependencies beyond Git history | 6 | — |
| Every checked area keeps its source. | 6 | Covered by `sourced-evidence`. |
| Missing access becomes an unknown task instead of a silent blank. | 11 | Covered by `unknown-access`. |
| Repositories 3 / Workflows 5 / Action refs 8 / Webhooks 3 / Packages 2 / Unknown 3 | 12 | Sample values. |
| github-exit / demo | 3 | — |
| github-exit demo | 2 | — |
| Demo — sample data, nothing was uploaded. | 7 | Covered by `cli-demo-no-network`. |
| Scanned 3 repositories. | 3 | Sample value. |
| 3 checks need manual review. | 5 | Sample value. |
| Report written to /tmp/github-exit-demo-… | 5 | Sample output. |
| Recorded from the real bundled demo command. | 7 | Covered by `cli-demo`. |
| Open the full sample report | 6 | Result-naming verb. |
| How it works | 3 | — |
| Go from API evidence to a dry-run list | 8 | — |
| Scan read-only metadata | 3 | — |
| Use one repository for free. | 5 | Covered by `paid-scope`. |
| Add a fine-grained token when private metadata needs it. | 9 | — |
| Check every unknown | 3 | — |
| The report labels blocked endpoints and OAuth grant review as manual work. | 12 | Covered by `unknown-access`. |
| Test the target forge | 4 | — |
| Use the Markdown checklist during a dry run. | 8 | — |
| Keep JSON for scripts and review tools. | 7 | Covered by `cli-demo` and `script-json`. |
| Boundaries | 1 | — |
| It maps the move; it does not perform it | 9 | — |
| The CLI does not clone code, move issues, rewrite workflows, or promise forge compatibility. | 14 | Covered by `no-migration`. |
| It sends GitHub API requests from your machine. | 8 | Covered by `read-only-api`. |
| Reports stay in the output folder you choose. | 8 | Covered by `local-reports`. |
| Minimum access | 2 | — |
| Public repositories work without a token. | 6 | Covered by `public-no-token`. |
| Private scans need read access for the metadata you want checked. | 11 | — |
| Install | 1 | — |
| Run the demo before adding a token | 7 | — |
| github-exit demo | 2 | — |
| Copy command | 2 | Result-naming verb. |
| Build from source with Rust 1.85 or later, or download the Linux binary from this build. | 16 | F-4-2. |
| Download Linux binary | 3 | Result-naming verb. |
| Read the source | 3 | Result-naming verb. |
| $39 / One time | 3 | Covered by `paid-scope`. |
| Team scan license | 3 | — |
| Scan every repository under one owner | 6 | Covered by `paid-owner-scan`. |
| The free command scans one repository. | 6 | Covered by `paid-scope`. |
| An active license adds owner-wide scans and one combined report. | 10 | Covered by `paid-owner-scan`. |
| Buy the team scan license | 5 | Result-naming verb. |
| Checkout is hosted by Dodo. | 5 | Covered by `dodo-hosted-checkout`. |
| A refund makes the license inactive. | 6 | Covered by `refund-revokes-license`. |
| Have a license? | 3 | — |
| Paste it here. | 3 | — |
| Verify license | 2 | Result-naming verb. |
| No license saved in this browser. | 6 | Initial state. |
| Map GitHub dependencies before a move. | 6 | — |
| Privacy / Terms / Built by Param Factory | 7 | — |
| v0.1.0 · build 2026.08 | 4 | — |

### README

| Copy | Words | Review |
| --- | ---: | --- |
| GitHub Exit Inventory | 3 | Title. |
| GitHub Exit Inventory is a read-only CLI for small teams planning a forge fallback. | 14 | — |
| It maps Actions, webhooks, packages, releases, branch rules, issue links, and app or OAuth signals. | 15 | Covered by `sourced-evidence` and `unknown-access`. |
| It writes an evidence-backed inventory and migration checklist without cloning code. | 11 | Covered by `cli-demo`, `local-reports`, and `no-migration`. |
| Live site | 2 | — |
| One-click sample | 2 | — |
| Try the bundled demo | 4 | Section heading. |
| The demo needs no account or token. | 7 | Covered by `cli-demo`. |
| The command creates a temporary folder and prints its path. | 10 | F-4-2. |
| The folder contains: | 3 | — |
| inventory.json for scripts and review tools | 6 | — |
| migration-checklist.md for a migration dry run | 6 | — |
| The sample covers three fictional repositories owned by mosswood-labs. | 9 | Covered by `cli-demo`. |
| See .factory/demo.md for the sandbox contract. | 6 | — |
| Install | 1 | Section heading. |
| Build the single binary with Rust 1.85 or later: | 9 | F-4-2. |
| The factory publishes release binaries after deployment. | 7 | Release-process note. |
| Workers do not publish packages or releases. | 7 | Contributor constraint. |
| Scan one repository for free | 5 | Section heading. |
| Public metadata needs no token: | 5 | Covered by `public-no-token`. |
| For a private repository, pass a fine-grained token through the environment: | 11 | — |
| Start with repository Metadata: read. | 5 | — |
| Add read access for Actions, administration, webhooks, and packages only when those checks matter. | 14 | — |
| The report creates unknown checklist work when GitHub access is incomplete. | 11 | Covered by `unknown-access`. |
| The token is never written to a report. | 8 | Covered by `token-not-reported`. |
| Use --json to write one parseable inventory to stdout for a script. | 12 | Covered by `script-json`. |
| The CLI sends progress to stderr. | 6 | Covered by `script-json`. |
| It follows every page of GitHub list results and stops when GitHub reports a rate limit. | 16 | Covered by `paginated-inventory` and `rate-limit-stop`. |
| Use --api-base for a GitHub Enterprise Server API. | 8 | F-4-2. |
| Scan an owner with a team license | 7 | Section heading. |
| An active $39 one-time license adds owner-wide scans and one combined report. | 12 | Covered by `paid-scope` and `paid-owner-scan`. |
| Buy or restore a license on the product site, then run: | 11 | — |
| The CLI checks the license through the Sociobot billing API. | 10 | Covered by `paid-owner-scan` and `sociobot-metadata-privacy`. |
| It does not send repository metadata there. | 7 | Covered by `sociobot-metadata-privacy`. |
| Checkout is hosted by Dodo. | 5 | Covered by `dodo-hosted-checkout`. |
| A refund makes the license inactive. | 6 | Covered by `refund-revokes-license`. |
| What the evidence means | 4 | Section heading. |
| verified means the named API endpoint returned data or a confirmed empty result. | 13 | Covered by `sourced-evidence`. |
| unknown means access failed or GitHub has no complete repository-scoped endpoint. | 11 | Covered by `unknown-access`. |
| Alternatives are marked verified only when linked target-forge documentation supports that feature. | 12 | Covered by `documented-alternatives`. |
| Risk points rank review work. | 5 | — |
| They do not estimate migration time. | 6 | — |
| GitHub does not expose a complete repository-scoped OAuth grant list. | 10 | Limitation, represented as unknown work. |
| The CLI records workflow and webhook signals, then adds a manual installation-settings check. | 13 | Covered by `unknown-access`. |
| This limitation stays visible in both report formats. | 8 | Covered by `cli-demo`. |
| Develop and verify | 3 | Section heading. |
| npm test runs Rust unit and command tests plus Playwright claim and accessibility tests. | 14 | Verified in this review. |
| npm run build:site creates the static deployment at dist/site/ and stages the Linux binary at dist/site/downloads/. | 16 | Verified in this review. |
| To prepare the Rust crate without publishing it: | 8 | — |
| Privacy and security | 3 | Section heading. |
| Live scans call the chosen GitHub API. | 7 | Covered by `read-only-api`. |
| Owner-wide scans also verify the supplied license with Sociobot. | 9 | Covered by `paid-owner-scan` and `sociobot-metadata-privacy`. |
| Browser demo data is bundled into the site and sends no data off site. | 14 | Covered by `demo-privacy`. |
| Read Privacy and Terms. | 4 | — |
| License | 1 | Section heading. |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

Terminology is otherwise consistent: **CLI**, **repository**, **report**, **checklist**, **inventory JSON**, **verified**, **unknown**, **target forge**, **owner-wide scan**, and **demo**. The generated “Exit surface” heading is the exception.

## Demo and sandbox

The browser and CLI demo gates pass.

- A fresh mobile click on **Try it with sample data** opened `/?demo=1` in one action.
- The first demo render already showed `mosswood-labs/trail-api`, three repositories, five workflows, eight action references, three webhooks, two packages, and three unknown checks.
- The persistent banner read **Demo — sample data, nothing is saved** and exposed **Reset demo** and **Start for real**.
- Selecting `field-console` and resetting restored `trail-api`, retained the banner, and focused the report H1.
- A preloaded real-license sentinel and verdict remained byte-for-byte unchanged through demo use and reset.
- Local and session storage stayed empty in a fresh demo context. Every request during the demo flow used `https://github-dependency-exit.sociobot.in`; no third-party request occurred.
- Leaving the demo removed the banner, opened `/#install`, and focused the Install section.
- After service-worker control, an offline reload returned 200 and retained the populated report and banner.
- Running the real binary as `github-exit demo` from a fresh temporary working directory created `/tmp/github-exit-demo-9680-1787995633`, printed that path, and wrote JSON plus Markdown. The JSON contained 3 repositories, 5 workflows, 8 checklist rows, and 3 unknown checks.
- The emitted Markdown exposed F-4-1.

## Claims verification

`.factory/claims.json` contains 22 entries. Every exact command was run independently from the clean clone. All listed commands passed; F-4-2 covers claims published without entries.

| Claim ID | Result |
| --- | --- |
| sample-demo | PASS |
| cli-demo | PASS |
| demo-privacy | PASS |
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
| sourced-evidence | PASS |
| documented-alternatives | PASS |
| sociobot-metadata-privacy | PASS |
| cli-demo-no-network | PASS |

Per-command output is in `/tmp/gde-review4-claims.log`, outside the worktree.

## Earlier-finding regression check

I read `.factory/review-1.md`, `review-2.md`, `review-3.md`, `polish-1.md`, `polish-3.md`, and the prior handoff, then checked production and code.

| Earlier ID | Fresh result |
| --- | --- |
| F-1-1 — Back navigation focus | **Fixed.** Demo → Back focused the home H1; Forward focused the demo H1. The live region updated. |
| F-1-2 — route-specific descriptions | **Fixed.** Home, both demo URLs, Privacy, and Terms have distinct title, description, canonical, Open Graph, and Twitter metadata. |
| F-1-3 — incomplete 404 shell | **Fixed.** An unknown live path returned HTTP 404 with the shared header/footer, legal links, metadata, icons, build id, and a route home. |
| F-1-4 — unexplained “exit surface” copy | **REOPENED as F-4-1.** The landing phrases are gone, but `src/report.rs` still emits `## Exit surface` into the primary Markdown deliverable. |
| F-3-1 — paid result and refund behavior untested | **Fixed.** `paid-owner-scan`, `refund-revokes-license`, `paid-scope`, and `dodo-hosted-checkout` all passed observable fixture tests. |
| F-3-2 — “Exit survey” terminology | **Fixed.** Production uses “GitHub dependency inventory”; the old phrase is absent from rendered copy and product source. |

Earlier unnumbered issues for ordinary Actions syntax, denied metadata, pagination, rate-limit stopping, JSON stdout, token exclusion, evidence sources, documented alternatives, Sociobot metadata isolation, demo network isolation, checkout availability, service-worker updates, 200% text reflow, targets, TypeScript, rustfmt, and clippy remain covered by passing tests and fresh live checks.

## Structure, links, accessibility, and visual identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200. A missing route returned the designed HTTP 404.
- At desktop and mobile widths, every checked route had `lang=en`, exactly one H1, exactly one main landmark, complete route metadata, favicon and Apple touch icon, no missing alt text, no horizontal overflow, and no unexpected console error.
- Fresh Playwright axe WCAG 2 A/AA scans found zero violations on 12 route/viewport combinations. The factory URL verifier separately passed Home, Demo, Privacy, and Terms with zero console errors.
- Keyboard focus reached the skip link first. The primary action worked with Enter. Back/Forward and demo reset placed focus on the restored heading.
- The landing crawl resolved 11 unique rendered links. First-party pages, binary, source, and factory links returned 200; checkout returned the expected 303 to `checkout.dodopayments.com`. Demo and 404-specific return links also worked in the interaction flow.
- The CSP is delivered as a response header, allows only the declared site and billing connection, and contains `frame-ancestors 'none'`. Robots and sitemap files exist. Deep links and the browser Back button work.
- The concrete-and-moss cutaway, hard rules, stamped type, clipped geometry, palette, and restrained motion match `.factory/design.md`. The site does not present as a generic centered SaaS template.
- The production build emitted 8.67 kB gzip JavaScript and 3.87 kB gzip CSS. The initial JavaScript remains below the static-product budget.

## Missed leverage

No AI feature is warranted. The core job is deterministic inventory and evidence capture; model output would weaken provenance. JSON and Markdown already provide the expected machine and human exports. No decorative AI control, embedded provider key, or direct Azure endpoint is present.

## Other verification

From the clean clone:

```text
npm test                         PASS — 4 Rust and 38 Playwright tests
npm run typecheck               PASS
npm run lint                    PASS
npm run build                   PASS — dist/site produced
cargo package --allow-dirty     PASS — 13 files, 28.0 KiB compressed
```

The working review did not modify product code.

## What would make this perfect

Rename the generated report heading to **Inventory totals** and guard every generated report against the old metaphor. Add exact manifest claims and tagged sandbox tests for default CLI temporary output, browser/CLI sample parity, browser license storage, the Rust 1.85 minimum, deployed-binary build identity, and the stated GitHub Enterprise Server behavior—or narrow those published statements. Then rerun this complete cold-read, copy, demo, privacy, claim, CLI, route, link, accessibility, and history review from a clean clone. Nothing else should remain when those checks pass.
