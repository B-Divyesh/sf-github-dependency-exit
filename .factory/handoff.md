# Handoff — GitHub Exit Inventory polish round 3

## Result

**PASS.** Every finding from review rounds 1–3 and every earlier verification report is fixed and rechecked. The repaired static site and CLI are live at <https://github-dependency-exit.sociobot.in>.

## What changed

- Added `paid-owner-scan`: a local billing fixture accepts a test license, the CLI scans two owner repositories, and one JSON plus Markdown report must contain both.
- Added `refund-revokes-license`: a refunded fixture must stop the owner scan before any GitHub request and print recovery guidance.
- Split price/free scope and Dodo-hosted checkout into explicit claims. `.factory/claims.json` now has 22 unique entries and a suite guard requires exactly one tagged test per claim.
- Removed the unprovable merchant-of-record sentence. Landing, Terms, and README now use the tested wording “Checkout is hosted by Dodo” and explain that a refund makes the license inactive.
- Replaced “Exit survey” with “GitHub dependency inventory” on the first screen.
- Removed a Playwright race that could rebuild the shared CLI without its fixture hook during paid tests.
- Added heading wrapping and grid min-size rules so home, demo, Privacy, Terms, and 404 have zero horizontal overflow at 200% text.
- Advanced the service-worker cache to `github-exit-shell-2026-08-29-polish-3`.
- Updated the catalog sentence and complete landing copy audit. The concrete-and-moss visual system, original artwork, CLI artifact class, and static deployment class remain unchanged.

## Verification

Clean remote clone: `/tmp/gde-polish3-release.O5lOAP` at implementation commit `68af341f84c574368538c6b172e9f6f4ced23275`.

- Every exact command in `.factory/claims.json`: **22/22 PASS**, each run independently.
- `npm test`: **PASS** — 4 Rust tests and 38 Playwright unit/integration/browser/accessibility/privacy/offline tests.
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS** (`cargo fmt --check`; clippy with warnings denied).
- `npm run build`: **PASS**; output at `dist/site/`.
- `cargo package --allow-dirty`: **PASS**; package contains 13 files, 109.3 KiB uncompressed and 28.0 KiB compressed.
- Installed packaged CLI smoke test: `--help` passed; `demo` wrote `inventory.json` and `migration-checklist.md`.
- Work-order build `npm ci && npm run build:site`: **PASS**.
- Deployment `/opt/fleet/lib/deploy-static.sh github-dependency-exit dist/site`: **PASS** to the production custom domain.
- `verify-url.sh`: **PASS** for `/`, `/?demo=1`, `/privacy`, and `/terms`; no console errors and required title/lang/main/alt/button checks passed.
- Cold Playwright production audit: **PASS** on 12 desktop/mobile route combinations, including `/demo` and a true HTTP 404. All had one H1, one main, correct route metadata, zero WCAG 2 A/AA axe violations, zero mobile overflow, and no undersized visible controls.
- Demo production audit: **PASS** for one-click entry, populated sample, banner, reset, Start for real, storage isolation, same-origin-only traffic, and offline reload.
- History navigation: **PASS**; Back focuses the home H1 and Forward focuses the demo H1.
- 200% text: **PASS** with zero horizontal overflow on home, demo, Privacy, Terms, and 404.
- Link crawl: **PASS** for 11 rendered links; checkout returns 303 to a Dodo-hosted session.
- Lighthouse mobile: **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 0.8 s, LCP 1.4 s, TBT 30 ms, CLS 0.
- Budget: initial JavaScript 28,008 B, CSS 13,902 B, mobile hero 106,316 B.
- Deployment identity: live JavaScript, CSS, and Linux binary SHA-256 values match the local deployment build.

Evidence and screenshots are under [`.factory/evidence/polish-3`](evidence/polish-3/). The finding-by-finding map is [`.factory/polish-3.md`](polish-3.md).

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
```

## Known gaps and next steps

None. Registry publication remains a factory release operation and was intentionally not performed from this repair work order.
