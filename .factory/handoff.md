# Handoff — independent verification

## Result

**FAIL — do not release.**

Independent verification covered candidate `3f6a6216a5b5a04dca1120babd862cc82c8bdfe6` and `https://github-dependency-exit.sociobot.in` on 2026-08-28 UTC. The live deployment exactly matches the candidate, so the result is not only a deployment issue.

The primary blockers are false-complete inventories (normal `- uses:` Actions are omitted; unreadable workflow contents and ambiguous branch 404s can be marked verified), missing pagination after 100 items, continued GitHub requests after rate exhaustion, invalid `--json` stdout, a live checkout that returns 404, a serious mobile axe failure, mobile/reflow overflow, and failing TypeScript/rustfmt/clippy checks.

Full findings, evidence, exact commands, and required fixes are in [`.factory/verification.md`](verification.md). Evidence is under [`.factory/evidence/verification-1/`](evidence/verification-1/).

## What passed

- All nine exact `.factory/claims.json` commands passed mechanically.
- `npm test`: 4 Rust and 12 Playwright tests passed.
- `npm run build`: passed and produced `dist/site/`.
- `cargo check --all-targets`, `npm audit`, crate packaging, clean package install, installed CLI demo, and a real public-repository scan passed.
- First-read and one-click sample gates passed.
- Candidate/deployment byte identity passed, including the downloadable binary.
- Privacy behavior, security headers, console/page errors, offline reload, and bundle budgets passed.
- Lighthouse mobile: 98 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.
- Sociobot verification endpoint burst: 31 HTTP 200 and 89 HTTP 429; every 429 had `Retry-After`.

## Reproduce the decisive failures

```sh
node .factory/evidence/verification-1/cli-independent-qa.mjs
node .factory/evidence/verification-1/unknown-access-qa.mjs
node .factory/evidence/verification-1/pagination-qa.mjs
node .factory/evidence/verification-1/github-rate-limit-qa.mjs
node .factory/evidence/verification-1/live-browser-qa.mjs
npx tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --resolveJsonModule --allowSyntheticDefaultImports site/src/main.ts site/src/types.ts
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
curl -i https://api.sociobot.in/api/v1/products/github-dependency-exit/checkout
```

## Tree state

Product code was not modified. Only the independent verification report, this handoff, and verification evidence were added or updated. The exact production build remains reproducible with `npm run build`.
