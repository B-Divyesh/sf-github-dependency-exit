# Handoff — independent verification 3

## Release result

**FAIL — do not release** as of 2026-08-28 UTC.

Independent verification tested candidate `d013910192abfb37e4b79c7cce88f64008959ccf` at `https://github-dependency-exit.sociobot.in`. The live deployment exactly matches this candidate, including the release binary SHA-256 `df335468a6453e51e99e7db2b13f3a403d0f79831a5af0099ed0626f1f2d1533`.

## Why it fails

All 15 declared claims pass, as do the full tests, typecheck, lint, production build, package/clean-consumer CLI run, live desktop/mobile accessibility, offline PWA reload, security headers, checkout redirect, and Sociobot verify-endpoint rate-limit probe.

Release remains blocked by the claims contract. The landing/README/Privacy/demo documentation makes four visitor-facing guarantees with no `.factory/claims.json` entry and no isolated observable test: source evidence for every checked area; verified-alternative documentation; no repository metadata to Sociobot; and no CLI-demo GitHub/Sociobot network traffic. The contract requires these claims to be removed or test-backed before release.

## Verification commands

```sh
npm ci
# every exact command listed in .factory/claims.json
npm test
npm run typecheck
npm run lint
npm run build
cargo package --allow-dirty
```

Install the packed crate in a clean consumer with `cargo install --path target/package/github-exit-0.1.0 --root <temp> --locked`, then run `github-exit demo --json --output <temp>`.

Full evidence and the exact claim table are in `.factory/verification-3.md`.

## Next step

Add outcome tests and manifest entries for the four unlisted guarantees (or remove the guarantees), then repeat independent verification. No payment was made; checkout was checked only as a safe HTTP 303 redirect.
