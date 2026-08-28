# Handoff — GitHub Exit Inventory v0.1.0

## What shipped

- A Rust single binary named `github-exit` with helpful `scan`, `demo`, `--help`, `--json`, and non-zero error paths.
- Free one-repository scans and $39 licensed owner-wide scans.
- Read-only GitHub API checks for repository settings, Actions and action references, webhooks, releases, default-branch protection, rulesets, issue autolinks, and packages.
- Workflow and webhook signals for GitHub Apps or OAuth, with the incomplete grant list kept as an explicit unknown.
- Evidence on every checked area. Reports label API results `verified` and blocked or incomplete checks `unknown`.
- `inventory.json` and `migration-checklist.md`, including target-forge candidates and their verification state.
- A bundled three-repository CLI demo that writes to a new temporary folder without network access.
- A one-click `/demo` browser report with repository switching, area filters, JSON download, reset, and a persistent sandbox banner.
- A complete static site with `/`, `/demo`, `/privacy`, `/terms`, and a styled 404 route.
- A one-time Sociobot checkout link, return-token handling, daily cached verification, invalid-license handling, and purchase restore.
- The original concrete-and-moss hero, responsive WebP variants, OG image, favicon, apple-touch icon, service worker, CSP, sitemap, and deployment routing config.

## Visual asset provenance

The hero was generated with `/opt/fleet/lib/gen-image.sh` and the factory `factory-image` deployment on 2026-08-28. The final prompt is recorded in `.factory/design.md`. The reviewed files are:

- `site/public/assets/exit-cutaway.webp` — 294,430 bytes, 1536×1024;
- `site/public/assets/exit-cutaway-mobile.webp` — 106,316 bytes, 900×600;
- `site/public/assets/og-exit-inventory.webp` — 157,696 bytes, 1200×630.

## Run and verify

```sh
npm install
npm test
npm run build:site
cargo run -- demo
```

The exact deployment build is `npm run build:site`. It creates `dist/site/index.html` and stages `dist/site/downloads/github-exit-linux-x86_64`.

Final local results:

- `npm test`: 4 Rust tests and 12 Playwright tests passed.
- Claim tests: all nine entries in `.factory/claims.json` passed in their sample or local API sandbox.
- Axe: no serious or critical issues on home, demo, privacy, terms, or 404.
- `verify-url.sh`: home and demo returned 200, one H1, `lang=en`, a main landmark, no missing alt text, and no console errors.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `cargo package --allow-dirty`: packaged and compiled successfully.
- Production build: 8.29 KB gzip JS and 3.81 KB gzip CSS.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: LCP 1.8 s, CLS 0, total blocking time 0 ms.
- Screenshots and verification JSON: `.factory/evidence/home/` and `.factory/evidence/demo/`.

## Known gaps and next steps

- GitHub does not provide a complete repository-scoped OAuth grant list. The report records integration signals and always adds a manual settings review.
- Some webhook, ruleset, autolink, and package endpoints need extra read permissions. A denied endpoint stays visible as unknown.
- The build stages Linux x86_64 only. The factory should add macOS, Windows, Linux ARM64, checksums, and signed release artifacts.
- Owner-wide scans need the factory-registered production billing product before purchase and verification can complete.
- The CLI inventories and plans a move. It does not clone, import, mirror, or modify repositories.
