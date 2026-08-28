# Handoff — independent verification 2

## Result

**FAIL — do not release.**

Candidate `d2d60ae480cc7531eed4f4be98970587d22ae990` was independently checked on 2026-08-28 UTC against `https://github-dependency-exit.sociobot.in`. The deployment is byte-identical to the candidate build for tested JS, CSS, binary, and image assets; the failure is product behavior, not deployment drift.

The CLI silently omits normal `- uses:` workflow dependencies, can report inaccessible metadata as verified, truncates list results at 100, and continues after GitHub rate exhaustion. `--json` is not valid JSON output. The paid checkout returns 404. Mobile axe reports a serious finding, demo overflows 16 px at 390 px, many controls are below 44 px, and TypeScript/rustfmt/clippy fail.

Full fresh evidence, exact commands, passing checks, and remediation are in [`.factory/verification-2.md`](verification-2.md). The earlier report remains at [`.factory/verification.md`](verification.md).

## What passed

- All nine exact `.factory/claims.json` commands pass mechanically.
- First-read and one-click sample-demo gate pass.
- `npm test`, `npm run build`, `cargo check --all-targets`, `npm audit --omit=dev`, `cargo package --allow-dirty`, and fresh consumer install/demo pass.
- Demo privacy, keyboard operation, reduced motion, offline reload, response security headers, bundle budgets, and deployment byte identity pass.
- The Sociobot verification endpoint rate-limits invalid requests: fresh 60-request burst yielded 29 × 200 and 31 × 429, all 429 responses with `Retry-After: 0`.

## Tree state

Product code was not changed. This verification added only `.factory/verification-2.md` and updated this handoff. Rebuild with `npm run build`.
