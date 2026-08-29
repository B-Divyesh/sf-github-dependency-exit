# Adversarial first-read review 5 — FAIL

**Reviewed:** 2026-08-29 UTC  
**Production:** <https://github-dependency-exit.sociobot.in>  
**Candidate:** `9dd092c6c82c70b805411a46600997dd5fe2f936`  
**Method:** fresh Chromium contexts at 390 × 844 and 1440 × 900; clean clone `/tmp/gde-review5-clean.ZZjamn`; no product code changed.

## Verdict

**FAIL.** The first screen, one-click sample, isolated browser demo, CLI demo, routes, links, offline behavior, visual identity, and accessibility checks work. Six findings remain. One listed claim command failed in the clean sandbox until an undeclared Rust toolchain was installed. Four other visitor-facing statements are absent from `.factory/claims.json` or promise more than the tool demonstrates. One generic section label violates the supplied plain-words rule. A PASS requires zero findings and no initially failing or unlisted claim.

## Cold first read

Before scrolling, in separate fresh contexts:

| Question | Mobile and desktop answer |
| --- | --- |
| What does this do? | It inventories GitHub dependencies and creates a migration checklist before a team changes forges. The literal headline says it maps “what breaks”; F-5-2 explains why that wording overstates the observable result. |
| For whom? | Small software teams planning a fallback. |
| What should I click first? | **Try it with sample data**. The adjacent text says it opens a browser report without an account or token. |

At 390 × 844, the primary action occupied y=617–667 and its outcome text ended at y=733. At 1440 × 900, the action occupied y=850–902, so its lower border crossed the viewport by about 2 px but the label and control remained visible and actionable. Neither viewport overflowed horizontally. The mandatory three questions can be answered without scrolling, so the first-read clarity gate passes; the honesty issue is F-5-2.

## Findings

### F-5-1 — BLOCKING — a listed claim command fails from the clean documented test setup

- **Exact quote/location:** Landing and README: “Build from source with Rust 1.85 or later.” README development instructions list `npm test` without another Rust setup step. `.factory/claims.json` lists `npm test -- --grep @claim:rust-1-85-build`.
- **Evidence:** In the clean clone, with the installed supported compiler `rustc 1.98.0`, that exact claim command exited 1: `toolchain '1.85.0-x86_64-unknown-linux-gnu' is not installed`. After the reviewer separately ran `rustup toolchain install 1.85.0 --profile minimal`, the unchanged exact command passed. All other 27 exact claim commands passed on their first run.
- **Why this fails:** The claims contract says any failing claim command is blocking. A contributor following the README on a compiler newer than 1.85 still gets a failing `npm test` because the suite silently requires a second, exact compiler version.
- **Concrete fix:** Make the prerequisite part of the declared command, for example add a documented `test:msrv` setup that installs or provisions Rust 1.85.0 and use that complete command in `claims.json`. Keep `npm test` runnable from the documented setup. Add a clear preflight error if automatic provisioning is intentionally avoided.

### F-5-2 — BLOCKING — the headline claims actual breakage, but the product inventories dependencies

- **Exact quote/location:** Landing H1 and first screen: **“Map what breaks before leaving GitHub.”** The lower boundary section says, **“The CLI does not … promise forge compatibility.”**
- **Evidence:** No `.factory/claims.json` entry promises that the CLI determines what will break. The passing tests prove read-only inventory, source evidence, unknown work, and candidate alternatives. They do not execute workloads on a target forge or predict failures.
- **Why a first-time visitor is misled:** “What breaks” reads as a compatibility result. The tool honestly produces dependencies and unknown checks, which is useful but narrower. The correction appears only after the visitor scrolls.
- **Concrete fix:** Replace the H1 with **“Map GitHub dependencies before you move”** and align the home title/metadata. Do not add a breakage claim unless a sandbox test actually runs the target workloads and observes failures.

### F-5-3 — BLOCKING — private-token and permission instructions are unlisted claims

- **Exact quotes/locations:** Landing: “Add a fine-grained token when private metadata needs it” and “Private scans need read access for the metadata you want checked.” README: “For a private repository, pass a fine-grained token through the environment,” “Start with repository Metadata: read,” and the sentence naming Actions, administration, webhook, and package permissions.
- **Evidence:** `claims.json` has `token-not-reported`, but its test supplies `--token`; it does not test the documented `GITHUB_TOKEN` environment path or a private endpoint that requires an Authorization header. `unknown-access` tests denied fixture responses, not the published permission guidance.
- **Why a visitor is misled:** This is the real setup path for private repositories. A user can rely on it, but the claims manifest cannot currently prove that the documented environment variable is sent correctly or that the stated access advice produces the described result.
- **Concrete fix:** Add a `private-token-auth` claim and tagged fixture test that rejects an unauthenticated request, accepts `GITHUB_TOKEN`, asserts the Bearer header, and confirms a private report is written. Rewrite the scope advice to the testable **“Grant only the GitHub read permissions needed for your selected checks; unreadable checks appear as unknown.”**

### F-5-4 — BLOCKING — the OAuth limitation and two-format visibility promise are unlisted

- **Exact quote/location:** README: **“GitHub does not expose a complete repository-scoped OAuth grant list.”** It then says, **“This limitation stays visible in both report formats.”** Landing says OAuth grant review becomes manual work.
- **Evidence:** The sample and source contain an OAuth unknown, but no claims entry owns this promise. `cli-demo` checks that files exist and that Markdown contains an unknown; it does not assert the OAuth limitation in both JSON and Markdown. `unknown-access` covers Actions, branch rules, and packages.
- **Why a visitor is misled:** This limitation determines whether a migration checklist is complete. The external API-absence statement and the output behavior are presented as proven facts without the required named test.
- **Concrete fix:** Use product-centered wording: **“The CLI cannot enumerate every app and OAuth grant, so both reports add a manual installation-settings check.”** Add an `oauth-manual-review` claim whose fixture asserts that exact unknown and next step in both output formats.

### F-5-5 — BLOCKING — “risk points rank review work” is unlisted and the output does not rank items

- **Exact quote/location:** README: **“Risk points rank review work.”** Browser demo: “72 review points.” Generated Markdown: **“Risk points rank review work only.”**
- **Evidence:** No claims entry defines or tests risk points. `src/github.rs` computes one aggregate number; neither browser nor Markdown orders checklist items by that score. The only qualification is that the number is not a time estimate.
- **Why a visitor is misled:** “Rank” implies a comparative ordering a team can use. The product shows one unexplained aggregate, so a visitor cannot tell why 72 matters or which work should come first.
- **Concrete fix:** Prefer removing the score because the brief does not require it. Otherwise rename it **“review score,”** publish the exact formula beside it, add fixture tests for the number and ordering, and avoid the verb “rank” unless the interface actually orders work.

### F-5-6 — Minor — “THE PRODUCT” is a generic decorative section label

- **Exact quote/location:** Landing, directly before “See migration dependencies beyond Git history”: **“THE PRODUCT.”**
- **Why a first-time visitor loses information:** The supplied plain-words rule rejects decorative labels that could appear unchanged on another product. This label does not name the section; the adjacent H2 does.
- **Concrete fix:** Delete the label or replace it with **“SAMPLE MIGRATION REPORT.”**

## Copy audit

Counts follow the repository audit convention: visible words, with hyphenated compounds and version/path tokens counted once. Punctuation-only separators do not count. No item exceeds 22 words and no banned marketing adjective appears. Buttons use result-naming verbs. The flagged rows below require the rewrites in the findings.

### Landing page

| Copy | Words | Review |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| GitHub Exit Inventory | 3 | — |
| Demo / Install / Price / Privacy | 4 | Navigation. |
| GitHub dependency inventory / read-only CLI | 5 | — |
| Map what breaks before leaving GitHub | 6 | F-5-2. |
| For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list. | 18 | Covered by inventory/checklist claims. |
| Try it with sample data | 5 | Result-naming action; `sample-demo`. |
| Opens a browser report. | 4 | `sample-demo`. |
| No account or token. | 4 | `sample-demo`. |
| Read-only GitHub requests | 3 | `read-only-api`. |
| Reports stay in your output folder | 6 | `local-reports`. |
| $39 once; one-repository scans stay free | 6 | `paid-scope`. |
| A concrete repository model with moss tracing dependency paths through its joints. | 12 | Useful alt text. |
| A repository model showing connected migration dependencies. | 7 | — |
| The product | 2 | F-5-6. |
| See migration dependencies beyond Git history | 6 | — |
| Every checked area keeps its source. | 6 | `sourced-evidence`. |
| Missing access becomes an unknown task instead of a silent blank. | 11 | `unknown-access`. |
| Repositories 3 / Workflows 5 / Action refs 8 / Webhooks 3 / Packages 2 / Unknown 3 | 12 | Sample values. |
| github-exit / demo | 2 | Terminal label. |
| github-exit demo | 2 | Command. |
| Demo — sample data, nothing was uploaded. | 6 | `cli-demo-no-network`. |
| Scanned 3 repositories. | 3 | Sample value. |
| 3 checks need manual review. | 5 | Sample value. |
| Report written to /tmp/github-exit-demo-… | 4 | `cli-demo-temp-dir`. |
| Recorded from the real bundled demo command. | 7 | `cli-demo`. |
| Open the full sample report | 6 | Result-naming action. |
| How it works | 3 | Clear section label. |
| Go from API evidence to a dry-run list | 8 | — |
| Scan read-only metadata | 3 | — |
| Use one repository for free. | 5 | `paid-scope`. |
| Add a fine-grained token when private metadata needs it. | 9 | F-5-3. |
| Check every unknown | 3 | — |
| The report labels blocked endpoints and OAuth grant review as manual work. | 12 | F-5-4 for OAuth coverage. |
| Test the target forge | 4 | — |
| Use the Markdown checklist during a dry run. | 8 | — |
| Keep JSON for scripts and review tools. | 7 | `cli-demo`, `script-json`. |
| Boundaries | 1 | Clear section label. |
| It maps the move; it does not perform it | 9 | — |
| The CLI does not clone code, move issues, rewrite workflows, or promise forge compatibility. | 14 | `no-migration`; also conflicts with F-5-2 wording. |
| It sends GitHub API requests from your machine. | 8 | `read-only-api`. |
| Reports stay in the output folder you choose. | 8 | `local-reports`. |
| Minimum access | 2 | — |
| Public repositories work without a token. | 6 | `public-no-token`. |
| Private scans need read access for the metadata you want checked. | 11 | F-5-3. |
| Install | 1 | Clear section label. |
| Run the demo before adding a token | 7 | — |
| github-exit demo | 2 | Command. |
| Copy command | 2 | Result-naming action. |
| Build from source with Rust 1.85 or later, or download the Linux binary from this build. | 16 | F-5-1; `binary-download-build-match` passed. |
| Download Linux binary | 3 | Result-naming action. |
| Read the source | 3 | Result-naming action. |
| $39 / One time | 3 | `paid-scope`. |
| Team scan license | 3 | — |
| Scan every repository under one owner | 6 | `paid-owner-scan`. |
| The free command scans one repository. | 6 | `paid-scope`. |
| An active license adds owner-wide scans and one combined report. | 10 | `paid-owner-scan`. |
| Buy the team scan license | 5 | Result-naming action. |
| Checkout is hosted by Dodo. | 5 | `dodo-hosted-checkout`. |
| A refund makes the license inactive. | 6 | `refund-revokes-license`. |
| Have a license? | 3 | — |
| Paste it here. | 3 | — |
| Verify license | 2 | Result-naming action. |
| Remove saved license | 3 | Result-naming action. |
| No license saved in this browser. | 6 | Initial state. |
| Map GitHub dependencies before a move. | 6 | — |
| Privacy / Terms / Built by Param Factory | 7 | Footer links. |
| v0.1.0 · build 2026.08 | 3 | Build label. |

### README

| Copy | Words | Review |
| --- | ---: | --- |
| GitHub Exit Inventory | 3 | Title. |
| GitHub Exit Inventory is a read-only CLI for small teams planning a forge fallback. | 14 | — |
| It maps Actions, webhooks, packages, releases, branch rules, issue links, and app or OAuth signals. | 15 | `sourced-evidence`, `unknown-access`. |
| It writes an evidence-backed inventory and migration checklist without cloning code. | 11 | `cli-demo`, `local-reports`, `no-migration`. |
| Live site | 2 | Label. |
| One-click sample | 2 | Label. |
| Try the bundled demo | 4 | Heading. |
| The demo needs no account or token. | 7 | `cli-demo`. |
| The command creates a temporary folder and prints its path. | 10 | `cli-demo-temp-dir`. |
| The folder contains: | 3 | — |
| inventory.json for scripts and review tools | 6 | `cli-demo`. |
| migration-checklist.md for a migration dry run | 6 | `cli-demo`. |
| The sample covers three fictional repositories owned by mosswood-labs. | 9 | `cli-demo`. |
| See .factory/demo.md for the sandbox contract. | 6 | Contributor instruction. |
| Install | 1 | Heading. |
| Build the single binary with Rust 1.85 or later: | 9 | F-5-1. |
| The factory publishes release binaries after deployment. | 7 | Release-process note. |
| Workers do not publish packages or releases. | 7 | Contributor constraint. |
| Scan one repository for free | 5 | Heading. |
| Public metadata needs no token: | 5 | `public-no-token`. |
| For a private repository, pass a fine-grained token through the environment: | 11 | F-5-3. |
| Start with repository Metadata: read. | 5 | F-5-3. |
| Add read access for Actions, administration, webhooks, and packages only when those checks matter. | 14 | F-5-3. |
| The report creates unknown checklist work when GitHub access is incomplete. | 11 | `unknown-access`. |
| The token is never written to a report. | 8 | `token-not-reported`. |
| Use --json to write one parseable inventory to stdout for a script. | 12 | `script-json`. |
| The CLI sends progress to stderr. | 6 | `script-json`. |
| It follows every page of GitHub list results and stops when GitHub reports a rate limit. | 16 | `paginated-inventory`, `rate-limit-stop`. |
| Use --api-base with a GitHub Enterprise Server 3.14 REST API endpoint. | 11 | `ghes-api-base`. |
| Scan an owner with a team license | 7 | Heading. |
| An active $39 one-time license adds owner-wide scans and one combined report. | 12 | `paid-scope`, `paid-owner-scan`. |
| Buy or restore a license on the product site, then run: | 11 | — |
| The CLI checks the license through the Sociobot billing API. | 10 | `paid-owner-scan`, `sociobot-metadata-privacy`. |
| It does not send repository metadata there. | 7 | `sociobot-metadata-privacy`. |
| Checkout is hosted by Dodo. | 5 | `dodo-hosted-checkout`. |
| A refund makes the license inactive. | 6 | `refund-revokes-license`. |
| What the evidence means | 4 | Heading. |
| verified means the named API endpoint returned data or a confirmed empty result. | 13 | `sourced-evidence`. |
| unknown means access failed or GitHub has no complete repository-scoped endpoint. | 11 | `unknown-access`; OAuth-specific wording is F-5-4. |
| Alternatives are marked verified only when linked target-forge documentation supports that feature. | 12 | `documented-alternatives`. |
| Risk points rank review work. | 5 | F-5-5. |
| They do not estimate migration time. | 6 | F-5-5. |
| GitHub does not expose a complete repository-scoped OAuth grant list. | 10 | F-5-4. |
| The CLI records workflow and webhook signals, then adds a manual installation-settings check. | 13 | F-5-4. |
| This limitation stays visible in both report formats. | 8 | F-5-4. |
| Develop and verify | 3 | Heading. |
| npm test runs Rust unit and command tests plus Playwright claim and accessibility tests. | 14 | F-5-1 for undeclared prerequisite. |
| npm run build:site creates the static deployment at dist/site/ and stages the Linux binary at dist/site/downloads/. | 16 | Verified by build and `binary-download-build-match`. |
| To prepare the Rust crate without publishing it: | 8 | — |
| Privacy and security | 3 | Heading. |
| Live scans call the chosen GitHub API. | 7 | `read-only-api`, `ghes-api-base`. |
| Owner-wide scans also verify the supplied license with Sociobot. | 9 | `paid-owner-scan`, `sociobot-metadata-privacy`. |
| Browser demo data is bundled into the site and sends no data off site. | 14 | `demo-privacy`. |
| Read Privacy and Terms. | 4 | — |
| License | 1 | Heading. |
| MIT. | 1 | Confirmed by `LICENSE`. |
| See LICENSE. | 2 | — |

Terminology is otherwise consistent: **CLI**, **repository**, **report**, **checklist**, **inventory JSON**, **verified**, **unknown**, **target forge**, **owner-wide scan**, and **demo**. There are no sentences over 22 words. F-5-2 through F-5-6 are the copy/claim flags and include concrete rewrites.

## Demo and sandbox

The browser and CLI demo behavior passes.

- A fresh mobile click on **Try it with sample data** opened `/?demo=1` in one action.
- The first rendered demo screen already showed `mosswood-labs/trail-api`, 3 repositories, 5 workflows, 8 action references, 3 webhooks, 2 packages, and 3 unknown checks.
- The persistent banner read **Demo — sample data, nothing is saved** and exposed **Reset demo** and **Start for real**.
- Selecting `field-console`, filtering Actions, and resetting restored `trail-api`, retained the banner, and focused the demo H1.
- In a direct fresh demo context, preloaded real-data and license sentinels remained byte-for-byte unchanged. Session storage stayed empty. The only requests were the demo document plus first-party JS and CSS.
- After service-worker control, offline reload returned 200 with the populated report and banner and no console error.
- Running the clean-clone binary from a fresh temporary working directory with exactly `github-exit demo` created `/tmp/github-exit-demo-9846-1788021699`, printed the path, and wrote JSON and Markdown. The inventory contained 3 repositories and 8 checklist rows. The generated report used `Inventory totals`; the retired metaphors were absent.

## Claims verification

All 28 exact commands from `.factory/claims.json` were run independently in the clean clone. F-5-1 records the one initial failure. The compatibility behavior passed only after the reviewer installed the undeclared toolchain and reran the same command.

| Claim ID | First clean run |
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
| sourced-evidence | PASS |
| documented-alternatives | PASS |
| sociobot-metadata-privacy | PASS |
| cli-demo-no-network | PASS |
| rust-1-85-build | **FAIL** — exact 1.85.0 toolchain absent; PASS only after manual install |
| binary-download-build-match | PASS |
| ghes-api-base | PASS |

F-5-2 through F-5-5 are claim-like live/README statements without adequate manifest entries. They fail the cross-check even though the 27 other listed commands pass.

## Earlier-finding regression check

Every earlier review, polish record, verification record, and handoff was read. The earlier product defects remain fixed in live behavior and code; none is reopened.

| Earlier finding | Fresh confirmation |
| --- | --- |
| F-1-1 — Back navigation focus | Fixed: Demo → Back focused the home H1; Forward focused the demo H1; the live region updated. |
| F-1-2 — route-specific metadata | Fixed: home, both demo URLs, Privacy, and Terms have distinct title, description, canonical, OG, and Twitter metadata. |
| F-1-3 — incomplete 404 | Fixed: a missing live path returned HTTP 404 with the standard shell, metadata, icons, legal links, and return action. |
| F-1-4 / F-4-1 — undefined report metaphors | Fixed: live copy and a fresh generated Markdown report use `Inventory totals`; `exit surface` and `accumulated load` are absent from product source/output. |
| F-3-1 — paid result/refund not tested | Fixed: `paid-owner-scan`, `refund-revokes-license`, `paid-scope`, and `dodo-hosted-checkout` passed. |
| F-3-2 — “Exit survey” term | Fixed: live/source copy uses “GitHub dependency inventory”; the old term is absent from product code. |
| F-4-2a — default temporary demo output | Fixed: `cli-demo-temp-dir` passed and the real command was rerun from a fresh temp directory. |
| F-4-2b — browser/CLI fixture parity | Fixed: `demo-fixture-parity` passed. |
| F-4-2c — browser license storage/removal | Fixed: `browser-license-storage` passed. |
| F-4-2d — Rust 1.85 compatibility | Product compatibility is fixed: it builds after 1.85 is installed. F-5-1 is a new clean-test setup failure, not a source compatibility regression. |
| F-4-2e — staged/download binary identity | Fixed: `binary-download-build-match` passed. |
| F-4-2f — GHES 3.14 API base | Fixed: `ghes-api-base` passed. |
| Ordinary `- uses:` Actions were omitted | Fixed: `workflow-step-syntax` passed. |
| Denied metadata could appear verified or disappear | Fixed: `unknown-access` passed. |
| GitHub lists stopped at 100 | Fixed: `paginated-inventory` passed. |
| JSON stdout contained progress | Fixed: `script-json` passed. |
| Scans continued after rate exhaustion | Fixed: `rate-limit-stop` passed. |
| Token or repository metadata could cross privacy boundaries | Fixed: `token-not-reported` and `sociobot-metadata-privacy` passed. |
| Source evidence, documented alternatives, and no-network CLI demo lacked proof | Fixed: all three named claims passed. |
| Checkout did not resolve | Fixed: live checkout returned 303 to `checkout.dodopayments.com`; the claim passed. |
| Mobile overflow, 200% text reflow, terminal focus, and small targets | Fixed: full Playwright suite passed; fresh live routes had zero overflow, zero undersized visible controls, and zero axe violations. |
| TypeScript, rustfmt, or clippy failed | Fixed: typecheck and lint passed in the clean clone. |
| Unknown routes returned 200 | Fixed: `/review-5-missing` returned the designed HTTP 404. |
| Service worker could retain an old shell | Fixed: the service-worker regression passed; fresh offline demo reload passed. |

## Structure, links, accessibility, and visual identity

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200. `/review-5-missing` returned the designed 404.
- Across mobile and desktop, every route had `lang=en`, one `main`, one H1, a plain route title, description, canonical, OG image, favicon, Apple touch icon, no missing alt text, no horizontal overflow, and no undersized visible interactive target.
- Fresh Playwright axe WCAG 2 A/AA scans reported zero violations across 12 route/viewport combinations. Product routes logged no console or page errors. The missing route logged only its expected 404 resource status.
- Back/Forward focus, route announcements, deep links, Reset demo focus, and Start for real behavior passed.
- The crawl resolved every rendered product, download, source, factory, legal, and checkout link. Product/source/factory targets returned 200; checkout returned the expected 303 to a hosted Dodo session. The only 404 was the deliberate missing-route probe.
- Live response headers include CSP, `frame-ancestors 'none'`, `X-Content-Type-Options`, Referrer Policy, Permissions Policy, and HSTS. `robots.txt`, `sitemap.xml`, the static 404, and SPA rewrites are present.
- The concrete-and-moss cutaway, hard rules, stamped type, clipped geometry, palette, and restrained motion match `.factory/design.md`. The result is distinct from a generic SaaS template.
- The production build emits 8.76 kB gzip JavaScript and 3.89 kB gzip CSS, below the static-product budget.

## Missed leverage

No AI feature is warranted. This job depends on deterministic API evidence and visible unknowns; generated advice would weaken provenance. JSON and Markdown provide the expected machine and human exports. No decorative AI action, provider key, or Azure endpoint is present. The missing leverage is not another feature: it is making the existing private-auth, OAuth limitation, and review-score behavior precise and tested.

## Other verification

After manually provisioning Rust 1.85.0, these clean-clone gates passed:

```text
npm test                     PASS — 4 Rust and 44 Playwright tests
npm run typecheck           PASS
npm run lint                PASS
npm run build               PASS — dist/site produced
cargo package --allow-dirty PASS
```

## What would make this perfect

Make the exact Rust 1.85 claim command self-contained or declare its prerequisite; replace the breakage headline with the dependency job the CLI proves; add named sandbox claims for private environment-token authentication and the OAuth manual-review behavior; remove or fully define and test the unexplained risk score; and delete or rename “THE PRODUCT.” Then rerun every claim from a new clean clone and repeat the cold mobile/desktop, demo-isolation, offline, route, link, copy, and accessibility checks. Nothing else should remain.
