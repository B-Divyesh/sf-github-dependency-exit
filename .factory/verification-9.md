# Independent verification 9 — GitHub Exit Inventory

**Verdict: PASS — release candidate accepted.**

Verified 2026-08-29 UTC from a clean checkout at
`4aa5e4e3b21bb051efe7c13333c0a740b65d23a3` against
<https://github-dependency-exit.sociobot.in>. This is fresh evidence, not a
retest of the builder's report.

## Mandatory first-read and demo gate

A cold production load says **“Map GitHub dependencies before you move”**; it
identifies **small software teams planning a fallback** and puts **Try it with
sample data** beside “Opens a browser report. No account or token.” It therefore
answers what it does, for whom, and what to click first in plain words.

The action opens `/?demo=1` in one click. That screen is already populated with
the realistic three-repository `mosswood-labs` inventory and has the persistent
**Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start for
real**. The plain-words and demo-sandbox gates pass.

## Claims contract — PASS

`.factory/claims.json` exists. After `npm ci` (24 packages, 0 vulnerabilities),
all **30 exact commands** were run separately and serially from the clean
checkout; every one passed. Per-claim output is retained at
`/tmp/gde-claims-9.4Gzr7E/` in the verifier container.

Passed IDs: `sample-demo`, `cli-demo`, `cli-demo-temp-dir`,
`demo-fixture-parity`, `demo-privacy`, `browser-license-storage`,
`read-only-api`, `json-export`, `paid-scope`, `dodo-hosted-checkout`,
`paid-owner-scan`, `refund-revokes-license`, `public-no-token`,
`local-reports`, `no-migration`, `workflow-step-syntax`, `unknown-access`,
`paginated-inventory`, `rate-limit-stop`, `script-json`, `token-not-reported`,
`private-token-auth`, `sourced-evidence`, `documented-alternatives`,
`oauth-manual-review`, `sociobot-metadata-privacy`, `cli-demo-no-network`,
`rust-1-85-build`, `binary-download-build-match`, and `ghes-api-base`.

## Local build, package, and CLI — PASS

- `npm test` passed: 3 Rust unit tests, 2 CLI tests, and 49 Playwright tests.
- `npm run typecheck`, `npm run lint`, and exact production `npm run build`
  passed and produced `dist/site/`.
- `cargo package --allow-dirty` passed (13 files; 105.8 KiB unpacked, 27.0 KiB
  compressed). The unpacked package installed in a clean consumer with
  `cargo install --path target/package/github-exit-0.1.0 --root <temp> --locked`.
  Installed `--help`, `--version`, and `demo --json --output <temp>` worked,
  producing the three-repository JSON and Markdown reports.
- Invalid recovery works: `--repo bad/repo/name` and `--api-base not-a-url`
  both exit 2 with actionable guidance.
- A no-token release-binary scan of real public `octocat/Hello-World` exited 0,
  wrote both reports, found two workflows, and recorded 13 inaccessible areas
  as manual/unknown work. GitHub reported 4,970 of 5,000 requests remaining.

## Live browser, privacy, accessibility, and PWA — PASS

- `/opt/fleet/lib/verify-url.sh` passed for `/`, `/?demo=1`, `/privacy`, and
  `/terms`: HTTPS 200, title, `lang=en`, one H1, main landmark, alt text,
  labeled controls, and no console/page errors.
- Fresh Playwright checks at 1366 × 900 and 390 × 844 covered `/`, `/demo`,
  `/privacy`, `/terms`, and the real 404. All valid routes were error-free and
  had no horizontal overflow. axe WCAG 2 A/AA found **zero serious or critical
  findings** on home, demo, privacy, and terms at both sizes.
- Keyboard behavior passed: the first Tab focuses the skip link with its 3px
  lichen outline, Enter reaches `#main`, and the demo filter works with
  Arrow/Enter keys and visible focus. Selecting Actions shows 2 rows and hides
  the other 6 with `display: none`. Reduced-motion styles set motion duration
  to `0.00001s`.
- A fresh home-to-demo request log contained only the product origin
  (document, first-party JS/CSS, and artwork). No analytics, font CDN, GitHub,
  Sociobot, or other third-party request occurred; demo localStorage and
  sessionStorage remained empty.
- The service worker was active, `registration.update()` completed, and a
  forced-offline `?demo=1` reload returned HTTP 200 with the populated report.
- Live mobile Lighthouse: **99 Performance / 100 Accessibility / 100 Best
  Practices / 100 SEO**; FCP 0.9 s, LCP 1.0 s, TBT 150 ms, CLS 0. Its completed
  JSON is `/tmp/gde-lighthouse-9.json`; Chrome crashed during Lighthouse
  shutdown after results were written, an environment-only runner event.

## Deployment identity, headers, caching, and rate limits — PASS

All 15 publicly served artifacts from the fresh `dist/site/` build matched
production byte-for-byte, including HTML, JS, CSS, artwork, service worker, 404
assets, and the Linux binary. The local/downloaded binary SHA-256 is
`73d3c381595fec87edb4086f07679c9850da3020f68cd9af8cb2cf1c689942e6`.

Home responses contain HSTS, `nosniff`, strict-origin referrer policy,
permissions policy, and a response-header CSP with `frame-ancestors 'none'`.
HTML and the service worker revalidate after 30 seconds; hashed JS/CSS are
one-year immutable; the binary is cached one day. Robots and sitemap return
200; an unknown route returns the designed HTTP 404.

The actual checkout endpoint returned 303 to
`checkout.dodopayments.com`. The product-unlock verification endpoint accepted
30 successive invalid-token requests and returned **429 Too Many Requests** on
request 31 with `Retry-After: 4`: observed burst allowance is 30 and retry
guidance is enforced. There is no sign-in flow.

Bundle evidence: JS 28,472 B raw / 8,740 B gzip; CSS 13,738 B raw / 3,857 B
gzip; mobile hero 106,316 B; desktop hero 294,430 B.

## Defects by severity

None. The expected browser network message when intentionally loading the HTTP
404 route is not an application console defect; all valid routes were clean.
