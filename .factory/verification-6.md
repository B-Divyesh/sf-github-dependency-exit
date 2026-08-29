# Independent verification 6 — GitHub Exit Inventory

**Verdict: PASS** — candidate `7305942702a28a2db3f868605b67aff5ccfd30c4` meets the researched CLI contract and the live deployment at <https://github-dependency-exit.sociobot.in> is the same build. Verified 2026-08-29 UTC.

## Mandatory first read and demo

Cold live load, before interaction, says **“Map what breaks before leaving GitHub.”** It identifies the audience as small software teams planning a fallback and says the CLI finds repository dependencies and builds a checked migration list. The first primary action is **Try it with sample data**, immediately explained as opening a browser report with no account or token.

The action opens `/?demo=1` in one click and immediately shows the populated three-repository `mosswood-labs` inventory, the persistent **Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start for real**. This passes the plain-words and demo-sandbox gates.

## Claims gate

`.factory/claims.json` exists. After `npm ci` in the initially clean candidate checkout, each of its 28 exact commands was run separately using the shipped demo/local fixtures. All passed. The documented Rust 1.85 toolchain was provisioned before the `rust-1-85-build` claim; it is an explicit product prerequisite (`rust-version = "1.85"`), and that claim then passed with `rustup run 1.85.0 cargo build --locked`.

Passed claim IDs:

`sample-demo`, `cli-demo`, `cli-demo-temp-dir`, `demo-fixture-parity`, `demo-privacy`, `browser-license-storage`, `read-only-api`, `json-export`, `paid-scope`, `dodo-hosted-checkout`, `paid-owner-scan`, `refund-revokes-license`, `public-no-token`, `local-reports`, `no-migration`, `workflow-step-syntax`, `unknown-access`, `paginated-inventory`, `rate-limit-stop`, `script-json`, `token-not-reported`, `sourced-evidence`, `documented-alternatives`, `sociobot-metadata-privacy`, `cli-demo-no-network`, `rust-1-85-build`, `binary-download-build-match`, and `ghes-api-base`.

## Local CLI, package, and build

- `npm ci` passed (24 packages; 0 audit vulnerabilities).
- `npm test` passed: 4 Rust tests and 44 Playwright tests (`test-results/.last-run.json` records `passed`).
- `npm run typecheck`, `npm run lint`, and the exact production `npm run build` all passed. `dist/site/` was produced.
- `cargo package --allow-dirty` passed and verified the publishable 0.1.0 crate.
- A clean unpacked consumer installed the package with `cargo install --path <unpacked-crate> --root <temp> --locked`. The installed `github-exit --help` worked; `demo --json --output <temp>` produced parseable three-repository JSON plus both `inventory.json` and `migration-checklist.md`. Invalid `scan --repo invalid` returned exit 2 and the actionable `OWNER/REPO` message.
- A fresh release-binary scan of the real public repository `octocat/Hello-World` exited 0, wrote both reports, found 2 workflows, and marked 13 unavailable areas as manual/unknown rather than inventing a result.

## Live deployment, privacy, and reliability

Fresh local build and production are byte-identical:

| Artifact | SHA-256 |
| --- | --- |
| `index-BmGOV2rh.js` | `68a62715021fbbf0e3bf500f3c5cfb6553a863922cfec6057052b4635732b112` |
| `index-BAWC7ySB.css` | `d913d60291bb9455625f26a83e4466997403189bbe9aea7130475c2523075574` |
| `github-exit-linux-x86_64` | `2a492f39ddaaa99e97726432859949adbcdbd9f09effbbdb3b54ce1c2bd68e7d` |

- Cold home and interactive browser-demo request logs contained only `github-dependency-exit.sociobot.in`; demo local/session storage remained empty. No analytics, third-party font/script, Azure/OpenAI endpoint, or sign-in flow was observed.
- `/`, `/demo`, `/privacy`, `/terms`, robots, and sitemap returned 200; a missing route returned HTTP 404. Checkout returned HTTP 303 to a `checkout.dodopayments.com` session.
- Live HTML/asset responses carry HSTS, `nosniff`, strict-origin referrer policy, restrictive CSP (including response-header `frame-ancestors 'none'`), and a restrictive permissions policy. Hashed JavaScript is one-year immutable; HTML revalidates in 30 seconds.
- The live service worker controlled the demo. After first load, forced-offline reload retained the sample report and demo banner with no console error.
- The only server-side product call is Sociobot license verification. A single rapid invalid-license burst produced 30 successful responses and a 429 on request 31, with `Retry-After: 3` and `x-ratelimit-after: 3`; it returned 200 after waiting four seconds. Observed allowance: 30 requests per short window.

## UX, accessibility, and performance

- `verify-url.sh` passed on live home: HTTP 200, title, `lang=en`, exactly one h1, main landmark, image alt text, labeled controls, and zero runtime console/page errors (752 ms observed load).
- Desktop and 390 x 844 mobile demo checks had no horizontal overflow or runtime errors. Keyboard Tab starts at the skip link; the lichen focus ring is a visible 3 px solid outline with 3 px offset; Enter activates the sample action. Reduced-motion context reported no active animations.
- Live axe scans at desktop and 390 px reported **zero serious or critical** findings. Axe reported two `region` findings at moderate impact only; they are non-blocking under the required serious/critical threshold.
- Production initial JS is 28,429 B raw / 8,789 B gzip; CSS is 13,835 B raw / 3,893 B gzip. Both are well below the static budget; mobile hero is 104 KiB.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

No product code was modified during this verification.
