# Independent verification 5 — GitHub Exit Inventory

## Verdict

**PASS** for candidate `8ac3e17d9a0ffc7146f4a928d680262c48246b2e` at <https://github-dependency-exit.sociobot.in> (verified 2026-08-29 UTC).

No release-blocking defect was found. The deployed JavaScript, CSS, and Linux binary SHA-256 values exactly match a fresh local production build of this candidate.

## Cold first read

The first screen says: “Map what breaks before leaving GitHub.” It identifies the audience as small software teams planning a fallback, explains that the CLI finds repository dependencies and builds a checked migration list, and presents **Try it with sample data** as the first action. The adjacent explanation says it opens a browser report without an account or token. The action opens `?demo=1` in one click and immediately shows a populated three-repository migration inventory. This meets the plain-words and demo-sandbox acceptance checks.

## Required claims

`npm ci` completed from the candidate checkout. Every exact command declared in `.factory/claims.json` was then run independently against the shipped demo entry point: **22/22 passed**.

| Claim IDs passed |
| --- |
| `sample-demo`, `cli-demo`, `demo-privacy`, `read-only-api`, `json-export`, `paid-scope`, `dodo-hosted-checkout`, `paid-owner-scan`, `refund-revokes-license`, `public-no-token`, `local-reports` |
| `no-migration`, `workflow-step-syntax`, `unknown-access`, `paginated-inventory`, `rate-limit-stop`, `script-json`, `token-not-reported`, `sourced-evidence`, `documented-alternatives`, `sociobot-metadata-privacy`, `cli-demo-no-network` |

The manifest exists, each listed command passed, and the suite guard confirms one tagged test per claim. A review of the landing copy and README found the visitor-facing operational claims represented by this manifest; no unlisted reliance claim was found.

## Local build and CLI QA

- `npm test`: **PASS** — 4 Rust unit/integration tests and 38 Playwright tests.
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS** (`cargo fmt --check`, clippy with warnings denied).
- `npm run build`: **PASS**; emitted `dist/site/`.
- `cargo package --allow-dirty`: **PASS**; verified the package (13 files; 109.3 KiB uncompressed, 28.0 KiB compressed).
- Clean-consumer check: `cargo install --path . --root <temp> --locked` installed the public `github-exit` command. `--help` worked; `demo --json` produced valid JSON plus non-empty `inventory.json` and `migration-checklist.md` (3 repositories, 3 unknown checks, bundled/no-network source).
- Invalid recovery: installed CLI `scan --repo bad/repo/name` exited 2 with the documented `OWNER/REPO` validation message.
- Normal real job: an unauthenticated public scan of `octocat/Hello-World` exited 0, wrote both report formats, and returned a one-repository inventory with evidence. It correctly left unavailable areas as 13 manual/unknown checks rather than inventing results.

## Live deployment QA

- Build identity: local and live SHA-256 values matched for `index-BkE6SPy5.js` (`ac39…6589`), `index-BF257s7Y.css` (`36c0…ddb7`), and `github-exit-linux-x86_64` (`edfa…e3ef`).
- Fresh browser request log for home → one-click demo contained only the product origin (document, first-party JS, CSS, and artwork). Demo data made no GitHub, Sociobot, analytics, font-CDN, or other third-party request.
- `verify-url.sh` passed for `/` and `/?demo=1`: HTTPS 200, title, `lang=en`, one `<h1>`, `<main>`, all image alt attributes, labeled controls, and no console/page errors.
- The browser demo has the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**. A service worker became active; after forcing offline, `?demo=1` reloaded with HTTP 200 and the populated sample report. `registration.update()` completed.
- Desktop and 390 px mobile have no horizontal overflow. At 200% text, `/`, demo, Privacy, Terms, and 404 each remained within the 390 px viewport. Keyboard tab order reaches the skip link and sample action; Enter opens the demo. The product’s lichen focus ring is visible (`3px` solid outline plus ink offset). Reduced-motion CSS reduces animations to `0.00001s`.
- Live axe WCAG 2 A/AA audit found **zero serious or critical issues** on `/`, `?demo=1`, `/privacy`, `/terms`, and an HTTP 404 route. No console or page errors were observed.
- Header/caching check: HTML and service worker use `max-age=30`; hashed JS is `max-age=31536000, immutable`. The site sends HSTS, `nosniff`, strict referrer policy, restrictive CSP including response-header `frame-ancestors 'none'`, and a permissions policy.
- All rendered same-origin links returned 200. The checkout endpoint returned **303** to `checkout.dodopayments.com`.
- The Sociobot license-verification API was the only product server-side endpoint. In a single rapid client probe, 30 invalid-license verification requests succeeded; request 31 returned **429** with `Retry-After: 3` (and `x-ratelimit-after: 3`). No sign-in flow exists.
- Bundle budget: 28,008 B initial JS (8.67 KiB gzip), 13,902 B CSS (3.87 KiB gzip), 106,316 B mobile hero, and 294,430 B desktop hero. All are within the stated budgets.
- Fresh mobile Lighthouse retry: **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; FCP 0.9 s, LCP 1.5 s, TBT 120 ms, CLS 0.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Scope note

This is a static CLI landing page plus a local Rust CLI. It has no product-owned backend or persistence service to test beyond the documented Sociobot license verification call. No code was changed during this verification; only this report and the handoff were added.
