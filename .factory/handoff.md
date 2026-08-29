# Handoff — verification 6 (current)

## Current result

**PASS.** This supersedes the historical handoff below. Independent verification on 2026-08-29 accepted candidate `7305942702a28a2db3f868605b67aff5ccfd30c4` at <https://github-dependency-exit.sociobot.in>.

Evidence: all 28 exact claims passed independently; `npm test` (4 Rust and 44 Playwright tests), typecheck, lint, production build, package verification, clean consumer install, a real public-repository scan, live desktop/mobile, privacy, offline, headers, checkout, and rate-limit checks passed. Fresh-build JavaScript, CSS, and Linux binary match production byte-for-byte. The verified binary SHA-256 is `2a492f39ddaaa99e97726432859949adbcdbd9f09effbbdb3b54ce1c2bd68e7d`.

The sample first screen says what the CLI does, who it is for, and offers one-click **Try it with sample data**. No critical, high, medium, or low defect was found. Full exact evidence and commands are in [verification-6.md](verification-6.md). Only verification documents changed in this round.

---

# Historical handoff — polish round 4

## Result

**PASS.** GitHub Exit Inventory is repaired, tested from a clean clone, and deployed at <https://github-dependency-exit.sociobot.in>.

The deployed product code is `6f4898e66507665d5a76f6125f5b797cbae9fb75` (`fix: version offline shell for polish four`). The deployment completed as static deployment `2cc616bf-ec48-4560-a300-d100058fd811`.

## What changed

- Rewrote the generated Markdown report vocabulary to `Inventory totals` and added a regression guard against the retired terms.
- Added six missing published claims plus independent observable tests: default CLI temp output, browser/CLI fixture parity, browser license lifecycle, Rust 1.85 build, staged/downloaded binary identity, and GHES `--api-base` behavior.
- Made the declared Rust 1.85 minimum real in source and lockfile.
- Added a visible “Remove saved license” control that clears stored license state.
- Advanced the service-worker cache version so cold production visits receive the repaired shell.
- Kept the prior round’s route metadata, routed 404, demo isolation, focus, legal, mobile, billing, and plain-language fixes intact.
- Updated the catalog description to: “Map GitHub dependencies and write a checked migration list before leaving GitHub.”

The complete finding-to-evidence map is [polish-4.md](polish-4.md).

## Verification

From a fresh clone at the deployed SHA, all 28 `.factory/claims.json` commands were run independently and passed. The command-level record is `evidence/polish-4/clean-clone-claims.json`.

These full gates also passed from that clone:

```sh
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
```

`npm test` ran 4 Rust tests and 44 Playwright tests. `rustup run 1.85.0 cargo build --locked` also passed.

Production was opened cold and audited again after deployment:

- `verify-url.sh` passed for Home, Demo, Privacy, and Terms; outputs are in `evidence/polish-4/verify-*`.
- The mobile route/demo/a11y audit passed for `/`, `/?demo=1`, `/privacy`, `/terms`, and a missing route. It found zero serious/critical axe issues, unexpected console errors, horizontal overflow, or undersized controls. Results: `evidence/polish-4/live-qa.json`; screenshots: `evidence/polish-4/*-390.png`.
- `/missing-polish-4-route` returned an actual 404 with the product shell (`evidence/polish-4/404-headers.txt`).
- The live hosted checkout returned its expected redirect (`evidence/polish-4/checkout-headers.txt`).
- The live binary SHA-256 matched the staged release artifact: `2a492f39ddaaa99e97726432859949adbcdbd9f09effbbdb3b54ce1c2bd68e7d`; its `demo` command generated the revised report.
- Lighthouse mobile production audit: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP/LCP 1.4 s, TBT 0 ms, CLS 0. Full report: `evidence/polish-4/lighthouse-mobile.json`.

## Run, test, package, and deploy

```sh
cargo run -- --help
cargo run -- demo
npm ci
npm run dev:site
npm test
npm run build
cargo package
```

The static site output is `dist/site`. The factory deployment command used for this handoff was:

```sh
npm run build:site
/opt/fleet/lib/deploy-static.sh github-dependency-exit dist/site
```

The publish-ready CLI crate can be recreated with `cargo package`; publishing itself remains a factory action.

## Known gaps / next steps

None. All current and earlier review findings are closed, and no runtime change is pending after the deployed code SHA above.
