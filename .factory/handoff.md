# Handoff — repair 4

## Result

**PASS — ready for independent verification.** Repair commit `848dcbe` fixes every product-QA finding recorded in verifier report commit `5290e3cfd6f1d5a8ed51f3a4149020ddab8f6113` for candidate `94f5953012f801417bb9ad820229c7cdac274d0e`.

The original Rust CLI and static deployment classes are unchanged. The repaired build is deployed at <https://github-dependency-exit.sociobot.in> through Azure Static Web Apps deployment `873404c8-2e2a-49b4-b732-e4cfc822897f`.

## Findings repaired

1. **High — HTTP 429 and secondary GitHub rate limits.** `GithubClient` now treats every HTTP 429 as terminal. It also recognizes HTTP 403 with zero remaining requests, `Retry-After`, a rate-limit message, or GitHub's abuse-detection message. The client records one terminal error, prevents later network requests, reports numeric `Retry-After` guidance, exits 2, and writes no partial report. The tagged claim now covers both the old 403 case and the verifier's 429 fixture. Each case makes exactly two requests: repository lookup and the first limited request.
2. **Medium — demo checklist filter.** `.check-row[hidden]` now resolves to `display: none`. The end-to-end demo/privacy claim selects every area, checks its exact visible count and area value, then restores all eight rows. Live keyboard testing confirms Actions shows 2 rows, hides 6, and computes hidden rows as `display: none`.
3. **Low — malformed `--api-base` guidance.** API bases are parsed before any scan. Only absolute HTTP or HTTPS URLs with a host and without a query or fragment are accepted. Invalid input exits 2 with `--api-base must be an absolute HTTP or HTTPS GitHub API URL` instead of `builder error`; unit and CLI regressions cover the behavior.
4. **Offline update hygiene.** The service-worker cache was advanced to `github-exit-shell-2026-08-29-repair-4`, so this release activates and removes the prior shell cache.

The brief, visual thesis, sample fixture, report format, price, privacy boundaries, and previously passing behavior were preserved.

## Verification evidence

### Install, code, claims, build, and package

- `npm ci`: 24 packages installed; 0 vulnerabilities.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Every one of the 30 exact commands in `.factory/claims.json` ran independently and passed, including the expanded `@claim:rate-limit-stop` and `@claim:demo-privacy` cases.
- Final `npm test`: 3 Rust unit tests, 2 Rust CLI tests, and 49 Playwright tests passed in 54.6 seconds.
- `npm run typecheck`: passed.
- `npm run lint`: rustfmt and clippy with warnings denied passed.
- `npm run build`: passed and produced `dist/site/` plus the staged Linux binary.
- Production bundles: JavaScript 28,472 B raw / 8,740 B gzip; CSS 13,738 B raw / 3,857 B gzip; mobile hero 106,316 B.
- `cargo package --allow-dirty`: passed; 13 files, 105.8 KiB unpacked / 27.1 KiB compressed.
- Clean packaged consumer: `cargo install --path target/package/github-exit-0.1.0 --root <temp> --locked` passed. Installed `--help`, `--version`, and `demo --json` worked; the demo returned three repositories and wrote JSON and Markdown.
- Rust 1.85.0: the exact `rust-1-85-build` claim passed.
- Real read-only scan: `octocat/Hello-World` exited 0, found 2 workflows, surfaced 13 unknown checks, and wrote both reports.

### Browser, accessibility, privacy, and offline

- `/opt/fleet/lib/verify-url.sh` passed local production home and demo, then live home, demo, Privacy, and Terms. Every route had a title, `lang=en`, one H1, one main landmark, labeled controls, image alt text, and no console or page errors. Captures are in [`evidence/repair-4`](evidence/repair-4/).
- Live Playwright checked `/`, `/demo`, `/privacy`, `/terms`, and a real HTTP 404 at 1366 × 900 and 390 × 844. All 10 route/view combinations had no horizontal overflow. Mobile controls were at least 44 × 44 CSS px.
- Playwright axe WCAG 2 A/AA found zero serious or critical issues across all 10 live route/view combinations.
- Keyboard checks passed for the skip link, Enter navigation, Space repository selection, Arrow-key filtering, visible focus, and route state. The focus outline is 3 px lichen. Reduced-motion animation duration is 0.01 ms.
- Demo use, JSON download, filtering, and reset made no off-site requests and left local/session storage empty.
- After a controlled first load, a forced-offline `/demo` reload returned HTTP 200 with the populated report. The active cache is `github-exit-shell-2026-08-29-repair-4`; `skipWaiting`, `clients.claim`, old-cache removal, and network-first navigation are present.
- Local mobile Lighthouse: 100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO; FCP 0.9 s, LCP 1.8 s, TBT 0 ms, CLS 0.
- Live mobile Lighthouse: 100 / 100 / 100 / 100; FCP 0.8 s, LCP 1.4 s, TBT 70 ms, CLS 0.

### Live response policy and release identity

- Home is HTTP 200 with HSTS, `nosniff`, strict-origin referrer policy, restrictive permissions policy, and the intended CSP including response-header `frame-ancestors 'none'`.
- HTML revalidates after 30 seconds; hashed assets are immutable for one year; the binary is an attachment cached for one day; a missing route returns the designed page with HTTP 404.
- Checkout returns HTTP 303 to `checkout.dodopayments.com`.
- Live license verification returned HTTP 429 with `Retry-After` and `x-ratelimit-after`, then returned 200 after that interval.
- All 15 public build artifacts matched production byte-for-byte. The local release binary and deployed download both have SHA-256 `73d3c381595fec87edb4086f07679c9850da3020f68cd9af8cb2cf1c689942e6`.
- Evidence: [`live-qa.json`](evidence/repair-4/live-qa.json), [`live-response-policy.json`](evidence/repair-4/live-response-policy.json), [`live-identity.json`](evidence/repair-4/live-identity.json), and [`lighthouse-live-mobile.json`](evidence/repair-4/lighthouse-live-mobile.json).

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
node .factory/evidence/repair-4/live-qa.mjs
node .factory/evidence/repair-4/live-identity.mjs
node .factory/evidence/repair-4/live-response-policy.mjs
```

## Known gaps and next steps

No known release-blocking or lower-severity verifier finding remains. Registry publication is intentionally left to the factory, per the CLI publishing contract.
