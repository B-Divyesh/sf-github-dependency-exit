# Handoff — polish round 5

## Result

PASS. The adversarial-review-five repair is in `d9514447f1887f46909d49d245134f508102d379`, with clean-clone claim evidence in `0a70879deddfa721f6cbd1e44eaac086a1c77190`. It is deployed to <https://github-dependency-exit.sociobot.in> through static deployment `ddea4c34-0c1e-4049-8b7a-326543238ee5`.

The repair makes the Rust 1.85 claim self-provisioning; rewrites the first-screen job statement; gives private-token and OAuth manual-review behavior dedicated observable claims; removes the unsupported review score; replaces the generic section label; and preserves the isolated one-click browser and CLI demos.

## Run and verify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
```

For the precise minimum-Rust claim, run:

```bash
npm run test:msrv -- --grep @claim:rust-1-85-build
```

That command automatically installs Rust 1.85.0 through rustup if it is absent. All 30 exact claim commands from `.factory/claims.json` passed independently from a fresh no-local clone; see [`clean-clone-claims.txt`](evidence/polish-5/clean-clone-claims.txt). The stricter absent-toolchain run is documented in [`msrv-provisioning.txt`](evidence/polish-5/msrv-provisioning.txt).

The complete suite also passed from that clean clone: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo package --allow-dirty`. The build produces `dist/site`; `cargo package --allow-dirty` leaves a ready-to-publish crate without publishing it.

## Production evidence

- Production URL: <https://github-dependency-exit.sociobot.in>
- Direct demo: <https://github-dependency-exit.sociobot.in/?demo=1>
- Cold live audit: [`live-qa.json`](evidence/polish-5/live-qa.json) — home/demo/legal/404 title, metadata, one H1/main, focus history, demo reset/storage isolation, no off-site demo requests, offline demo reload, and zero serious/critical axe findings.
- Link crawl: [`live-links.json`](evidence/polish-5/live-links.json) — local routes/download return 200 and checkout returns the expected Dodo 303.
- Headers: [`live-home-headers.txt`](evidence/polish-5/live-home-headers.txt) — CSP includes response-header `frame-ancestors 'none'`, with nosniff and Referrer Policy.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.8 s, TBT 20 ms, CLS 0 in [`lighthouse-mobile.json`](evidence/polish-5/lighthouse-mobile.json).

## Product notes

- The website is the static documentation/demo companion for the Rust CLI. `npm run build:site` writes the deployment to `dist/site` and stages the Linux binary at `dist/site/downloads/github-exit-linux-x86_64`.
- Browser demo mode is one-click at `?demo=1`, uses bundled sample data, keeps no browser storage, shows the persistent reset/start-for-real banner, and remains usable after the first online visit when offline. CLI `github-exit demo` uses the same shipped sample in a temporary directory.
- The catalog description is now: “Map GitHub dependencies before changing forges.”
- The full finding-by-finding closure is in [`polish-5.md`](polish-5.md).

## Known gaps

None. No finding of any severity is deferred.
