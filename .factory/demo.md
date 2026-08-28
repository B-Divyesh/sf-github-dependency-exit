# Demo sandbox

- Browser URL: `https://github-dependency-exit.sociobot.in/demo` or local `http://127.0.0.1:4173/demo`.
- CLI command: `github-exit demo`. Add `--output <folder>` for a fixed destination.
- Sample: three repositories owned by fictional `mosswood-labs`, five workflows, three webhooks, two packages, fourteen releases, four rules, and explicit OAuth unknowns.
- Reset: choose **Reset demo** in the browser. Run the CLI command again for a new temporary folder.
- Storage: the browser demo has no storage namespace because it does not write browser data. License data uses `sb_license:github-dependency-exit`, outside demo mode. The CLI writes only inside the printed temporary folder.
- Network: browser demo data is compiled into the first-party JavaScript. CLI demo data is compiled into the binary. Neither demo calls GitHub or Sociobot.
