# Landing copy audit

Audited from the rendered `/` route on 2026-08-29. Counts treat hyphenated terms and version strings as one word. Navigation, headings, labels, controls, terminal output, alt text, and footer copy are included.

## Header and first screen

| Copy | Words |
| --- | ---: |
| Skip to main content | 4 |
| GitHub Exit Inventory | 3 |
| Demo / Install / Price / Privacy | 4 |
| GitHub dependency inventory / read-only CLI | 6 |
| Map what breaks before leaving GitHub | 6 |
| For small software teams planning a fallback, this CLI finds repository dependencies and builds a checked migration list. | 18 |
| Try it with sample data | 5 |
| Opens a browser report. | 4 |
| No account or token. | 4 |
| Read-only GitHub requests | 3 |
| Reports stay in your output folder | 6 |
| $39 once; one-repository scans stay free | 6 |
| A concrete repository model with moss tracing dependency paths through its joints. | 12 |
| A repository model showing connected migration dependencies. | 7 |

## Product preview

| Copy | Words |
| --- | ---: |
| The product | 2 |
| See migration dependencies beyond Git history | 6 |
| Every checked area keeps its source. | 6 |
| Missing access becomes an unknown task instead of a silent blank. | 11 |
| Repositories 3 / Workflows 5 / Action refs 8 / Webhooks 3 / Packages 2 / Unknown 3 | 12 |
| github-exit / demo | 3 |
| github-exit demo | 2 |
| Demo — sample data, nothing was uploaded. | 7 |
| Scanned 3 repositories. | 3 |
| 3 checks need manual review. | 5 |
| Report written to /tmp/github-exit-demo-… | 5 |
| Recorded from the real bundled demo command. | 7 |
| Open the full sample report | 6 |

## Method and boundaries

| Copy | Words |
| --- | ---: |
| How it works | 3 |
| Go from API evidence to a dry-run list | 8 |
| Scan read-only metadata | 3 |
| Use one repository for free. | 5 |
| Add a fine-grained token when private metadata needs it. | 9 |
| Check every unknown | 3 |
| The report labels blocked endpoints and OAuth grant review as manual work. | 12 |
| Test the target forge | 4 |
| Use the Markdown checklist during a dry run. | 8 |
| Keep JSON for scripts and review tools. | 7 |
| Boundaries | 1 |
| It maps the move; it does not perform it | 9 |
| The CLI does not clone code, move issues, rewrite workflows, or promise forge compatibility. | 14 |
| It sends GitHub API requests from your machine. | 8 |
| Reports stay in the output folder you choose. | 8 |
| Minimum access | 2 |
| Public repositories work without a token. | 6 |
| Private scans need read access for the metadata you want checked. | 11 |

## Install, price, and footer

| Copy | Words |
| --- | ---: |
| Install | 1 |
| Run the demo before adding a token | 7 |
| github-exit demo | 2 |
| Copy command | 2 |
| Build from source with Rust 1.85 or later, or download the Linux binary from this build. | 16 |
| Download Linux binary | 3 |
| Read the source | 3 |
| $39 / One time | 3 |
| Team scan license | 3 |
| Scan every repository under one owner | 6 |
| The free command scans one repository. | 6 |
| An active license adds owner-wide scans and one combined report. | 10 |
| Buy the team scan license | 5 |
| Checkout is hosted by Dodo. | 5 |
| A refund makes the license inactive. | 6 |
| Have a license? | 3 |
| Paste it here. | 3 |
| Verify license | 2 |
| No license saved in this browser. | 6 |
| Map GitHub dependencies before a move. | 6 |
| Privacy / Terms / Built by Param Factory | 7 |
| v0.1.0 · build 2026.08 | 4 |

## Findings

- Longest sentence: 18 words.
- Sentences over 22 words: none.
- Banned words: none.
- Undefined design metaphors: none.
- First screen aloud: the job, team, sample action, local report boundary, and price fit in one short pass.
- Catalog description: 82 characters, starts with “Map”, and contains no banned words.

## Terminology

| Concept | One term |
| --- | --- |
| The executable | CLI |
| One GitHub project | repository |
| The full output | report |
| Human task output | checklist |
| Machine output | inventory JSON |
| Confirmed API result | verified |
| Blocked or incomplete result | unknown |
| Destination platform | target forge |
| Paid multi-repository feature | owner-wide scan |
| Try-out state | demo |
