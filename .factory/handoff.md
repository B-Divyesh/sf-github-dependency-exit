# Handoff — GitHub Exit Inventory review round 3

## Result

**FAIL.** No product code changed. The review is in `.factory/review-3.md` and identifies one blocking claims-contract gap plus one minor copy issue.

## What changed

- Added `.factory/review-3.md`.
- Updated this handoff for work order `github-dependency-exit-review-3`.

## Verification

Fresh remote clone tested: `4846f53054a256b552575d19463d966153ba27e2`.

- Every one of the 19 exact commands in `.factory/claims.json`: **PASS**, run separately.
- `npm test`: **PASS** — 4 Rust tests and 33 Playwright tests.
- `npm run typecheck`, `npm run lint`, and `npm run build`: **PASS**; build output exists at `dist/site/`.
- Cold mobile and desktop first-read gate: **PASS**.
- Demo/reset/privacy/offline/CLI-demo sandbox checks: **PASS**.
- Live route, metadata, link, 404, history-focus, mobile overflow, and axe checks: **PASS**.

## Known gaps and next steps

1. **Blocking:** `paid-scope` proves display copy and checkout redirect, not the promised licensed owner-wide combined report. Add a fixture-backed owner-scan outcome claim.
2. **Blocking:** “Sociobot/Dodo is the merchant of record” and “Refunds revoke the license” have no claims-manifest entry or sandbox proof. Add precise tests or remove/rewrite these statements.
3. **Minor:** Replace “EXIT SURVEY” with “GITHUB DEPENDENCY INVENTORY” to match the product’s plain, consistent terminology.

Run `npm ci`, every exact claims command, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` after repairs, then repeat the complete live review.
