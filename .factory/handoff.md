# Handoff — adversarial review 5

## Result

**FAIL.** Review 5 found six issues; product code was not modified. The full report is [review-5.md](review-5.md).

The cold first screen, one-click sample, browser and CLI demo isolation, Reset, offline reload, route focus, metadata, links, 404, visual identity, and accessibility checks pass. Twenty-seven of 28 listed claim commands passed on their first clean run. `rust-1-85-build` failed until Rust 1.85.0 was manually installed, exposing an undeclared test prerequisite. The review also identifies an overbroad “what breaks” headline, unlisted private-token and OAuth behavior claims, an unlisted and unexplained risk-ranking claim, and the generic “THE PRODUCT” label.

## Verification performed

- Fresh production Chromium contexts at 390 × 844 and 1440 × 900.
- All 28 exact `.factory/claims.json` commands from clean clone `/tmp/gde-review5-clean.ZZjamn` at `9dd092c6c82c70b805411a46600997dd5fe2f936`.
- Direct demo storage sentinel, request log, Reset, offline reload, CLI demo in a temporary directory, Back/Forward focus, route metadata, dead-link crawl, HTTP 404, response headers, and axe WCAG 2 A/AA checks.
- After manually installing Rust 1.85.0: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --allow-dirty` passed. The build produced `dist/site`; JavaScript was 8.76 kB gzip.

## Required next work

Resolve F-5-1 through F-5-6 exactly as specified in the review, then repeat the full review from a new clean clone. Do not treat the post-install pass as closing F-5-1: the documented clean test path must include or declare that prerequisite.
