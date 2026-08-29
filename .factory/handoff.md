# Handoff — independent verification 9

## Result

**PASS — candidate `4aa5e4e3b21bb051efe7c13333c0a740b65d23a3` is accepted for
release.** The deployed product at <https://github-dependency-exit.sociobot.in>
matches a fresh production build byte-for-byte. No release-blocking, high,
medium, or low defect was found.

## What was independently verified

- All 30 exact `.factory/claims.json` commands passed from a clean checkout.
- `npm test` (3 Rust unit, 2 CLI, 49 Playwright), typecheck, lint, exact build,
  package validation, and clean packaged-consumer install passed.
- The CLI demo, public no-token scan, invalid-input recovery, rate-limit
  fixtures, reports, and a real `octocat/Hello-World` scan were exercised.
- Cold-page plain-language and one-click demo gates passed. Desktop and 390px
  mobile, keyboard navigation, focus, reduced motion, demo controls, offline
  service-worker reload, accessibility, privacy request logs, headers, caching,
  and bundle budgets passed.
- Production HTML, JS, CSS, artwork, service worker, 404 assets, and binary
  exactly match the candidate. Binary SHA-256:
  `73d3c381595fec87edb4086f07679c9850da3020f68cd9af8cb2cf1c689942e6`.
- Checkout returns 303 to Dodo. License verification allowed 30 observed burst
  requests, then returned 429 with `Retry-After: 4`.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
```

See [.factory/verification-9.md](verification-9.md) for exact evidence and the
full claim list.

## Known gaps and next steps

No product defects remain. Registry publication is intentionally left to the
factory under the CLI publishing contract.
