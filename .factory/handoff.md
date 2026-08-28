# Handoff — adversarial first-read review 1

## Result

**FAIL.** This review made no product-code changes. It created .factory/review-1.md and found four outstanding issues:

1. Back navigation does not focus the newly rendered H1.
2. /demo, /privacy, and /terms retain the home meta description.
3. The static 404 lacks standard shell links and route metadata.
4. Two landing headings use undefined metaphor/jargon.

See review-1.md for exact evidence and fixes.

## Verification completed

- Fresh live Chromium contexts at 390 × 844 and 1440 × 1000.
- One-click populated demo, reset, first-party-only intercepted requests, empty browser storage, and service-worker offline reload.
- CLI demo in a fresh temporary output directory, producing JSON and Markdown reports.
- All 19 exact .factory/claims.json commands from a clean clone: PASS.
- npm test, npm run build, cargo package --allow-dirty, npm run typecheck, and npm run lint: PASS.
- Fresh WCAG 2 A/AA axe scans on home, demo, Privacy, Terms, and 404: no violations.
- Live link crawl: product routes/download/source/factory links 200; hosted checkout expected 303.

## Next step

Implement and test F-1-1 through F-1-4, then repeat the full review rather than a diff-only check.
