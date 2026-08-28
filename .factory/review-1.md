# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-28 UTC  
**Production:** https://github-dependency-exit.sociobot.in  
**Method:** Fresh Chromium contexts at 390 × 844 and 1440 × 1000; separate clean clone at /tmp/gde-review-clean.7X2VX7. No product code changed.

## Verdict

**FAIL.** The core CLI, cold first read, sample-data path, sandbox, claims, and most accessibility checks work. Four findings remain. Browser Back restores the page but leaves focus on body, which fails the required route-change focus behavior. A PASS requires zero findings.

## Cold first read

| Question | First-screen answer |
| --- | --- |
| What does it do? | “Map what breaks before leaving GitHub.” |
| For whom? | “For small software teams planning a fallback...” |
| What should I click? | **Try it with sample data** — “Opens a browser report. No account or token.” |

The 390 px page had 0 px horizontal overflow. The action was visible at y=602–652 in the 844 px viewport. It opened /demo in one click. The initial demo already showed a realistic three-repository mosswood-labs inventory, 72 review points, evidence rows, and migration checks. This gate passes.

## Findings

### F-1-1 — High — Back navigation does not focus the new route heading

- **Exact location/evidence:** Live sequence: click Demo, invoke browser Back. The URL and content return to /, but document.activeElement is BODY, not the home H1. The route announcement does update to “Map what breaks before leaving GitHub.” Forward navigation correctly focuses the demo H1. Relevant code: site/src/main.ts, popstate → render(true).
- **Why a visitor is lost:** A keyboard or screen-reader visitor who returns from Demo has no focus location on the newly rendered page. This fails the required Back-button and route-change focus behavior.
- **Concrete fix:** After the popstate render settles, focus the new H1, for example by queueing the existing focus call in requestAnimationFrame. Add a Playwright test that opens Demo, calls Back, and asserts the home H1 is focused.

### F-1-2 — Medium — SPA routes retain the home-page description

- **Exact location/evidence:** Live /demo, /privacy, and /terms each retain “Map Actions, webhooks, packages, rules, releases, and app signals before moving GitHub repositories.” In site/src/main.ts, updateMeta() updates only OG title and canonical, not description or OG/Twitter description.
- **Why a visitor is misled:** Search and social previews for Privacy and Terms describe repository scanning instead of the legal page.
- **Concrete fix:** Set title, description, canonical, OG title, and OG/Twitter description per route. For example: Privacy — GitHub Exit Inventory; “How GitHub Exit Inventory handles demo, license, and report data.” Add a route-metadata test.

### F-1-3 — Medium — The real 404 is not the required site shell or metadata set

- **Exact location/evidence:** Live /missing-route returns the correct 404 and has one H1, but lacks meta description, canonical, Open Graph/Twitter metadata, theme color, and Apple-touch icon. site/public/404.html has only a wordmark header and the footer “Map GitHub dependencies before a move.” It omits the standard navigation, Privacy/Terms, Param Factory attribution, and build identifier.
- **Why a visitor is lost:** The error page is a real route. It breaks the required consistent header/footer skeleton and has incomplete discovery metadata.
- **Concrete fix:** Preserve the static 404 status, but give 404.html the compact standard header/footer and noindex description, canonical, OG/Twitter fields, theme color, and Apple-touch link. Add a 404 structural test.

### F-1-4 — Low — Two landing headings use unexplained metaphor/jargon

- **Exact location/evidence:** The product-preview H2 says “See the exit surface, not just the git history”; the figure caption says “Repository structure, seen as accumulated load.” Neither “exit surface” nor “accumulated load” is defined or present in the terminology table.
- **Why a visitor is lost:** Heard in a heading list or read cold, these phrases do not name the report result. They make visitors translate design language before understanding the product.
- **Concrete fix:** Rewrite the H2 as **“See migration dependencies beyond Git history”** and the caption as **“A repository model showing connected migration dependencies.”**

## Demo and sandbox verification

The demo gate passes.

- Try it with sample data opened /demo in one click from fresh mobile and desktop contexts.
- The persistent banner said **Demo — sample data, nothing is saved** and included Reset demo and Start for real.
- Selecting field-console then choosing Reset demo restored trail-api, focused the H1, and retained the banner.
- Demo localStorage and sessionStorage were empty before and after reset.
- Intercepted demo requests had exactly one origin: https://github-dependency-exit.sociobot.in.
- After service-worker control, context.setOffline(true) then reload returned 200 and rendered the sample H1 and banner with no error state.
- In a fresh temporary output directory, target/debug/github-exit demo --output <temp> wrote inventory.json (3 repositories, 5 workflows, 8 checklist entries) and migration-checklist.md. It stated that no data was uploaded or saved outside that folder.

## Claims verification

.factory/claims.json contains 19 entries. From the clean clone, every exact listed command ran separately and passed. Logs are at /tmp/gde-review-1-claims/ outside the worktree.

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

Landing/README reliance claims map to the relevant manifest entries: one-click/no-token demo; read-only/no migration/public scanning; local reports/JSON; paid free scope; unknown access/source evidence/alternatives/pagination/rate limits/token handling; and browser/CLI/Sociobot privacy. No additional reliance claim requiring a manifest entry was found.

## Earlier-review regression check

There are no earlier .factory/review-*.md or .factory/polish-*.md files. I read verification.md through verification-4.md and the prior handoff. Earlier reports had no stable F-* IDs.

| Earlier finding | Fresh confirmation |
| --- | --- |
| Normal - uses: Action steps were omitted | Fixed: workflow-step-syntax PASS. |
| Denied metadata became false verified or omitted work | Fixed: unknown-access PASS. |
| Lists stopped at 100 | Fixed: paginated-inventory PASS. |
| JSON polluted stdout | Fixed: script-json PASS. |
| Rate limiting did not stop scans | Fixed: rate-limit-stop PASS. |
| Paid checkout was broken | Fixed: paid-scope PASS; live checkout returned expected 303 without purchase. |
| Mobile axe, overflow, undersized targets | Fixed: fresh 390 px checks had 0 overflow; axe had no WCAG 2 A/AA violations on all five routes. |
| TypeScript, rustfmt, or clippy failed | Fixed: npm run typecheck and npm run lint PASS. |
| Bad routes returned 200 | Fixed: /missing-route returned 404. |
| Service worker could keep old shell | Fixed: worker claimed client; offline /demo reload passed. |
| Missing source-evidence claim | Fixed: sourced-evidence PASS. |
| Missing documented-alternatives claim | Fixed: documented-alternatives PASS. |
| Missing Sociobot metadata-boundary claim | Fixed: sociobot-metadata-privacy PASS. |
| Missing no-network CLI-demo claim | Fixed: cli-demo-no-network PASS. |

Historical findings are fixed. F-1-1 through F-1-4 are new full-review findings.

## Structure, links, accessibility, and leverage

- /, /demo, /privacy, and /terms returned 200; /missing-route returned 404. Rendered product routes/download/source/factory links returned 200; checkout returned expected 303 to hosted Dodo checkout.
- The four SPA routes have one H1 and one main, lang=en, a visible skip link, 0 mobile overflow, favicon, canonical URL, and expected title pattern. The 404 omissions are F-1-3.
- Fresh axe WCAG 2 A/AA scans reported no violations on /, /demo, /privacy, /terms, or 404. Landing and demo had no console/page errors.
- The concrete/moss art, 3 px rules, stepped report labels, palette, and motion policy match .factory/design.md and are product-specific, not a generic SaaS template.
- The brief does not imply an AI feature. JSON and Markdown exports already cover the obvious import/export expectation; adding AI would be decorative.

## Copy audit

Counts use whitespace-delimited words; hyphenated compounds count once. No landing or README sentence exceeds 22 words. The only wording flags are F-1-4. Buttons that act on a result use verbs: Try it with sample data, Download sample JSON, Verify license, and Reset demo. Navigation labels are not result actions.

### Landing prose, headings, and controls

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
| Repository structure, seen as accumulated load. | 6 — F-1-4 |
| The product | 2 |
| See the exit surface, not just the git history | 9 — F-1-4 |
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
| Have a license? Paste it here | 6 |
| Verify license | 2 |
| No license saved in this browser. | 6 |
| Map GitHub dependencies before a move. | 6 |
| Demo / Install / Price / Privacy / Terms / Skip to main content | 12 |

### README sentences and labels

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

## Commands run

- npm ci in the clean clone.
- Every exact command in .factory/claims.json separately: 19/19 PASS.
- npm test, npm run build, cargo package --allow-dirty, npm run typecheck, and npm run lint: PASS.

## What would make this perfect

Fix the Back-focus timing, supply route-specific metadata, make the 404 a complete site shell, and replace the two metaphorical headings with direct migration-report language. Then repeat this entire cold-start, claims, offline, CLI, route, copy, link, and accessibility checklist.

