# Handoff — GitHub Exit Inventory polish round 1

## Result

**PASS.** All four findings in `.factory/review-1.md` are fixed, every historical regression remains covered, and the final static build is live at <https://github-dependency-exit.sociobot.in>.

The product remains a Rust single-binary CLI with a Vite static landing and browser demo. The concrete-and-moss identity, generated original artwork, artifact class, and deployment class are unchanged.

## What changed

- Made `/?demo=1` the visible and documented one-click sample path while preserving `/demo` as an alias.
- Kept demo data isolated from saved license state; added reset, exit, storage, first-party network, and offline tests.
- Fixed History API Back and Forward focus on the new route H1 and hash-target focus when leaving demo mode.
- Added complete route-specific title, description, canonical, Open Graph, and Twitter metadata.
- Rebuilt the static 404 as the standard product shell while preserving a real HTTP 404 response.
- Replaced “exit surface” and “accumulated load” with direct migration-dependency wording.
- Updated the service-worker cache version and preloaded the `?demo=1` shell.
- Updated `.factory/claims.json`, `.factory/demo.md`, `.factory/copy-audit.md`, README, sitemap, and the 82-character verb-first catalog description.
- During the cold live audit, corrected the last mobile 404 navigation target to 44 px and redeployed.

The exact finding-to-change-to-evidence map is in [`.factory/polish-1.md`](polish-1.md).

## Verification

Final code commit tested from fresh remote clone: `de853dea2483c64577a343f34b035b44df2ff50e`.

- Every one of the 19 exact commands in `.factory/claims.json`: **PASS**, run separately.
- `npm test`: **PASS** — 4 Rust tests and 33 Playwright browser/integration/claim/accessibility tests.
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS** — rustfmt and clippy with warnings denied.
- `npm run build`: **PASS** — `dist/site/` produced; JS 28.00 kB raw/8.66 kB gzip and CSS 13.84 kB raw/3.86 kB gzip.
- `cargo package`: **PASS** — 109.0 KiB package, 27.8 KiB compressed, then compiled successfully.
- Browser privacy/offline: **PASS** — demo requests used only the product origin, browser storage stayed empty, and a service-worker-controlled offline reload returned the populated demo.
- Accessibility: **PASS** — Playwright axe found zero WCAG 2 A/AA violations on home, both demo URLs, Privacy, Terms, and the true 404; all had one H1/main, no missing alt text, no mobile overflow, and 44 px visible controls.
- Live routing: `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200; `/missing-polish-route` returned 404 with the complete static error shell.
- Lighthouse mobile: **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; LCP 1.4 s, CLS 0, TBT 60 ms.
- Deployment integrity: live JS `303612…f5e2`, CSS `c4924e…168`, binary `edfa6c…3ef`, and 404 CSS `7be3f1…072e` matched local SHA-256 hashes.
- Link crawl: all first-party, source, factory, and download links returned 200; the Sociobot checkout returned the expected 303.

Evidence is under [`.factory/evidence/polish-1/`](evidence/polish-1/), especially [`live-qa.json`](evidence/polish-1/live-qa.json), [`lighthouse-mobile.json`](evidence/polish-1/lighthouse-mobile.json), and the live screenshots.

## Deployment

- Work order: `github-dependency-exit-polish-1`
- Configuration: static; `npm ci && npm run build:site`; deploy `dist/site`
- Production deployment ID: `a9584840-2607-4b36-b2ef-ff07681f2ec0`
- Cold production recheck: 2026-08-28 18:20 UTC

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package
```

## Known gaps and next steps

None within the brief, cumulative reviews, or this work order.
