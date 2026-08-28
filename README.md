# GitHub Exit Inventory

GitHub Exit Inventory is a read-only CLI for small teams planning a forge fallback. It maps Actions, webhooks, packages, releases, branch rules, issue links, and app or OAuth signals. It writes an evidence-backed inventory and migration checklist without cloning code.

Live site: <https://github-dependency-exit.sociobot.in>  
One-click sample: <https://github-dependency-exit.sociobot.in/?demo=1>

## Try the bundled demo

The demo needs no account or token.

```sh
cargo run -- demo
```

The command creates a temporary folder and prints its path. The folder contains:

- `inventory.json` for scripts and review tools;
- `migration-checklist.md` for a migration dry run.

The sample covers three fictional repositories owned by `mosswood-labs`. See [.factory/demo.md](.factory/demo.md) for the sandbox contract.

## Install

Build the single binary with Rust 1.85 or later:

```sh
cargo build --release
install target/release/github-exit /usr/local/bin/github-exit
github-exit --help
```

The factory publishes release binaries after deployment. Workers do not publish packages or releases.

## Scan one repository for free

Public metadata needs no token:

```sh
github-exit scan --repo octo-org/api --output exit-report
```

For a private repository, pass a fine-grained token through the environment:

```sh
GITHUB_TOKEN=github_pat_… github-exit scan --repo octo-org/private-api --output exit-report
```

Start with repository **Metadata: read**. Add read access for Actions, administration, webhooks, and packages only when those checks matter. The report creates unknown checklist work when GitHub access is incomplete. The token is never written to a report.

Use `--json` to write one parseable inventory to stdout for a script. The CLI sends progress to stderr. It follows every page of GitHub list results and stops when GitHub reports a rate limit. Use `--api-base` for a GitHub Enterprise Server API.

## Scan an owner with a team license

A $39 one-time license enables owner-wide scans and one combined report. Buy or restore a license on the product site, then run:

```sh
GITHUB_TOKEN=github_pat_… GDE_LICENSE=sb_… github-exit scan --owner octo-org --output exit-report
```

The CLI checks the license through the Sociobot billing API. It does not send repository metadata there. Sociobot/Dodo is the merchant of record.

## What the evidence means

- `verified` means the named API endpoint returned data or a confirmed empty result.
- `unknown` means access failed or GitHub has no complete repository-scoped endpoint.
- Alternatives are marked `verified` only when linked target-forge documentation supports that feature.
- Risk points rank review work. They do not estimate migration time.

GitHub does not expose a complete repository-scoped OAuth grant list. The CLI records workflow and webhook signals, then adds a manual installation-settings check. This limitation stays visible in both report formats.

## Develop and verify

```sh
npm install
npm run dev
npm test
npm run build:site
```

`npm test` runs Rust unit and command tests plus Playwright claim and accessibility tests. `npm run build:site` creates the static deployment at `dist/site/` and stages the Linux binary at `dist/site/downloads/`.

To prepare the Rust crate without publishing it:

```sh
cargo package --allow-dirty
```

## Privacy and security

Live scans call the chosen GitHub API. Owner-wide scans also verify the supplied license with Sociobot. Browser demo data is bundled into the site and sends no data off site. Read [Privacy](https://github-dependency-exit.sociobot.in/privacy) and [Terms](https://github-dependency-exit.sociobot.in/terms).

## License

MIT. See [LICENSE](LICENSE).
