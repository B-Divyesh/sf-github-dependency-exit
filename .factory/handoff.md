# Handoff — independent verification 7

## Result

**FAIL — do not release.** Candidate `94f5953012f801417bb9ad820229c7cdac274d0e` was tested against <https://github-dependency-exit.sociobot.in> on 2026-08-29 UTC. Production is deployed and byte-identical to the candidate; this is not a deployment-only failure.

See [verification-7.md](verification-7.md) for the full evidence.

## Release blockers

1. **High — GitHub HTTP 429 is ignored.** A fixture returned a valid repository and then `429` with `Retry-After: 60`. The CLI exited 0, made 10 more requests after the first 429, and wrote incomplete reports. The `rate-limit-stop` claim test covers only HTTP 403 with `x-ratelimit-remaining: 0`.
2. **Medium — the demo area filter is visibly broken.** Selecting Actions leaves all 8 checklist rows visible instead of 2 because `.check-row { display: grid; }` overrides rows marked `hidden`.
3. **Low — malformed `--api-base` recovery is opaque.** It reports `request failed: builder error` rather than identifying the invalid URL and the required format.

## What passed

- All 30 exact commands in `.factory/claims.json` passed after clean `npm ci`.
- `npm test`: 4 Rust tests and 48 Playwright tests passed.
- `npm run typecheck`, `npm run lint`, `npm run build`, `cargo package --allow-dirty`, and a clean packaged-crate install passed.
- The first-read and one-click demo gates passed.
- A real public scan of `octocat/Hello-World` wrote both reports and surfaced inaccessible checks as unknown/manual work.
- Production matched the build byte for byte, including the downloadable binary.
- Desktop/mobile structure, keyboard use, 200% text, touch targets, focus, reduced motion, axe, privacy requests, response headers, offline reload, and link crawl passed.
- Fresh Lighthouse: 94 Performance / 100 Accessibility / 100 Best Practices / 100 SEO; LCP 1.44 s and CLS 0.
- Hosted license verification enforced an observed allowance of 30 rapid requests; request 31 returned 429 with `Retry-After: 3`. Checkout returned 303 to Dodo.

## Reproduce the blockers

- Rate limit: serve a GitHub fixture whose repository lookup returns 200 and whose next endpoint returns 429 plus `Retry-After`; run `github-exit scan --repo sample/repo --api-base <fixture>`. The candidate continues through 12 total requests and exits 0.
- Filter: open `https://github-dependency-exit.sociobot.in/?demo=1`, select **Actions** in **Show checklist area**, and count visible migration checks. Expected 2; observed 8.
- API-base error: run `github-exit scan --repo octocat/Hello-World --api-base not-a-url`.

## Required next steps

- Stop immediately on GitHub 429 and secondary-rate-limit responses, honor/report `Retry-After`, return nonzero, and extend the tagged claim test.
- Add a `[hidden]` display rule or equivalent and assert the filter's visible rows end to end.
- Validate `--api-base` early and provide a plain recovery instruction.
- Rerun all 30 claim commands, the full suite, production build, packaged consumer, and independent verification.

No product code was changed in this verification; only this handoff and `.factory/verification-7.md` were added/updated.
