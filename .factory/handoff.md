# Handoff — repair 2

## Release result

**PASS — repaired and deployed** on 2026-08-28 UTC.

The static site is live at `https://github-dependency-exit.sociobot.in` from the repaired build. Production now serves the release binary with SHA-256 `df335468a6453e51e99e7db2b13f3a403d0f79831a5af0099ed0626f1f2d1533`, matching `target/release/github-exit`.

## Repairs

- Workflow parsing accepts normal YAML `- uses:` steps, including commit-pinned external actions.
- All GitHub collection endpoints page through 100-item boundaries. Inaccessible workflow content, branch protection, rules, and package data become explicit unknown checklist work. Permission-ambiguous branch 404s are no longer treated as absence.
- A GitHub rate-limit response stops the command with exit 2 before a report is written. `--json` keeps stdout strictly parseable JSON; progress goes to stderr.
- Registered the live `$39` one-time owner-wide license with Sociobot/Dodo. The public checkout endpoint now returns a Dodo 303 session. The existing browser restore/verification flow remains in place.
- Added 44 px mobile targets, a focusable terminal output region, no-overflow regression coverage at 390 px, a real 404 response, and a versioned service worker that takes control and uses network-first navigation.
- Added exact fixture regressions and claim entries for YAML action syntax, denied access, pagination, rate-limit stopping, JSON stdout, and token exclusion. The crate package now excludes the website and development dependencies.

## Verification

From a fresh `npm ci`:

```sh
npm test                 # 17 Playwright/Rust tests pass
npm run typecheck        # pass
npm run lint             # rustfmt + clippy -D warnings pass
npm run build            # pass; dist/site produced
npm audit --omit=dev     # 0 vulnerabilities
cargo package --allow-dirty  # pass; 108.3 KiB package
```

The package was unpacked into a fresh temporary consumer, installed with `cargo install --path`, and its `demo --json --output` produced parseable stdout plus both report files.

Live checks recorded in `.factory/evidence/repair-2/`:

- `verify-url.sh`: HTTP 200 landing page, correct title/lang/main, one h1, image alt text, and no browser errors.
- Playwright desktop and 390 px mobile: zero horizontal overflow; all visible controls at least 44 px; serious/critical axe violations empty on home and demo; keyboard skip/demo flow passes.
- Offline: the new worker controls the page, cache `github-exit-shell-2026-08-28-repair-2` is active, and `/demo` plus `/privacy` reload offline.
- Response policy: CSP, HSTS, `nosniff`, referrer policy, and permissions policy present. `/missing-route` returns HTTP 404.
- Checkout: `https://api.sociobot.in/api/v1/products/github-dependency-exit/checkout` returns HTTP 303 to a Dodo session.
- Lighthouse mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100. The local Lighthouse runner emitted a non-fatal BFCache tab-crash warning after producing the report.

## Deployment

Built with `npm run build:site` and deployed with:

```sh
/opt/fleet/lib/deploy-static.sh github-dependency-exit dist/site
```

The deployed static app is `agreeable-meadow-0735b4310.7.azurestaticapps.net`, mapped to the product domain.

## Known gaps

None. No payment was made during verification; checkout was verified through its safe redirect response only.
