# Polish round 1 — all findings closed

Polished candidate `f656a146e455b8e611af68d8b8002e0efe7c5262` from review base `0c86fd324340786b93eec78743fc7f2a7725165f`. Repair code is in `cd134aa35b507f757440008003d2fa732b54ad3f` and `de853dea2483c64577a343f34b035b44df2ff50e`.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 — Back navigation did not focus the route heading | Route focus now runs on the next animation frame after every History API navigation. Hash destinations receive focus too. Added Back and Forward regression coverage. | Playwright: `Back and Forward focus the heading for the restored route`; live values `flow.backFocus` and `flow.forwardFocus` in [`live-qa.json`](evidence/polish-1/live-qa.json); [mobile demo screenshot](evidence/polish-1/demo/screenshot-mobile.png); live `https://github-dependency-exit.sociobot.in/?demo=1`. |
| F-1-2 — SPA routes retained the home description | Each route now owns its title, description, canonical URL, Open Graph title/description/URL, and Twitter title/description. `?demo=1` is canonical; `/demo` remains a working alias. | Playwright: five generated `route … sets complete route-specific metadata` tests; live route records for `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` in [`live-qa.json`](evidence/polish-1/live-qa.json); live Privacy and Terms screenshots under `evidence/polish-1/`. |
| F-1-3 — Real 404 lacked the standard shell and metadata | The static 404 now has the shared navigation/footer, Privacy and Terms links, Param Factory attribution, build id, description, canonical, noindex, Open Graph/Twitter metadata, theme color, favicon, Apple touch icon, reduced-motion handling, and 44 px targets. Azure still returns HTTP 404 through `responseOverrides`. | Playwright: `the static 404 has complete metadata and the standard site shell` and `the deployment configuration returns the static error document with HTTP 404`; live `/missing-polish-route` record shows HTTP 404, zero axe violations, zero overflow, and zero undersized targets in [`live-qa.json`](evidence/polish-1/live-qa.json); [mobile 404 screenshot](evidence/polish-1/404/screenshot-mobile.png); live `https://github-dependency-exit.sociobot.in/missing-polish-route`. |
| F-1-4 — Two headings used unexplained metaphors | Replaced the preview heading with “See migration dependencies beyond Git history” and the caption with “A repository model showing connected migration dependencies.” Updated the copy audit. | Playwright: `landing preview names migration dependencies without design metaphors`; `flow.forbiddenWordingFound: false` in [`live-qa.json`](evidence/polish-1/live-qa.json); [mobile home screenshot](evidence/polish-1/home/screenshot-mobile.png); [copy audit](copy-audit.md). |

## Cumulative acceptance work

- The first screen retains the six-word job headline, named audience, one-click `/?demo=1` action, what happens next, and three short facts. On a cold 390 × 844 load, the action bottom was 652.22 px and horizontal overflow was zero.
- Demo mode is bundled and read-only. Reset restores the initial repository and focuses the report H1. Start for real leaves demo mode and focuses Install. Live intercepted traffic stayed first-party; localStorage and sessionStorage remained empty. Offline reload returned the populated report.
- `.factory/claims.json` has 19 claims. Every exact manifest command passed independently from a fresh remote clone of `de853dea2483c64577a343f34b035b44df2ff50e`.
- All historical regressions listed by review 1 remain covered: action-step parsing, unknown access, pagination, rate-limit stopping, JSON stdout, token exclusion, sourced evidence, documented alternatives, Sociobot metadata isolation, no-network CLI demo, checkout, 404 status, service-worker refresh, mobile targets, typecheck, rustfmt, and clippy.
- The catalog sentence is verb-first and 82 characters: “Map GitHub dependencies and write a checked migration list before changing forges.”

## Final evidence

- Fresh clone full suite: 4 Rust tests and 33 Playwright tests passed; typecheck, rustfmt, clippy, build, and `cargo package` passed.
- Production browser audit: six routes checked, zero WCAG 2 A/AA axe violations, zero unexpected console errors, zero horizontal overflow, and zero undersized visible targets.
- Production Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.4 s, CLS 0, TBT 60 ms. Report: [`lighthouse-mobile.json`](evidence/polish-1/lighthouse-mobile.json).
- Production asset equality: JS, CSS, Linux binary, and 404 CSS SHA-256 values matched the local deployment build.
- Live screenshots: [home mobile](evidence/polish-1/home/screenshot-mobile.png), [demo mobile](evidence/polish-1/demo/screenshot-mobile.png), [Privacy mobile](evidence/polish-1/privacy/screenshot-mobile.png), [Terms mobile](evidence/polish-1/terms/screenshot-mobile.png), and [404 mobile](evidence/polish-1/404/screenshot-mobile.png).

No review finding remains open.
