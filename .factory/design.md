# Visual thesis: concrete remembers; moss finds the seams

GitHub Exit Inventory uses a **brutalist concrete and moss** system. Repository data appears as heavy, numbered slabs. Integration paths cross those slabs like moss in expansion joints. The weight fits migration work: the team is measuring accumulated structure, not buying an airy promise. The green growth suggests a practical route out without implying that migration is automatic.

## Palette

The site is intentionally single-mode, like a marked-up field report on a concrete workbench.

| Token | Value | Use |
| --- | --- | --- |
| `--concrete` | `#d8d3c7` | page ground |
| `--paper` | `#f1eee5` | readable report surfaces |
| `--ink` | `#171a16` | primary text and hard borders |
| `--dust` | `#66685f` | secondary text (7:1 on paper) |
| `--moss` | `#31552f` | links, confirmed paths |
| `--lichen` | `#d9ec69` | primary action and focus |
| `--rust` | `#91391f` | warnings and blocked paths |
| `--chalk` | `#fffdf5` | text on dark surfaces |

No gradients. Color never carries state alone; labels and symbols repeat every meaning.

## Type

- Display: `Arial Black`, `Arial Narrow Bold`, system sans-serif. Compressed, blunt headings behave like stamped crate labels.
- Body: `Arial`, `Helvetica`, system sans-serif. It is familiar at report-reading sizes and requires no font request.
- Data may use the system monospace stack. Tabular figures align repository counts and risk totals.

The hero title uses a tight measure and an irregular stepped line break on wide screens. Body text stays under 70 characters.

## Spacing and shape

The base unit is 8 px. Common intervals are 8, 16, 24, 40, 64, and 96 px. Sections alternate between open concrete and inset paper, with 3 px black rules instead of soft card shadows. Buttons and report panels use square corners. Small clipped corners suggest survey tags without borrowing a generic component library.

The mobile layout stacks the terminal before secondary proof. It drops decorative coordinates, never controls or report evidence. Every target is at least 44 px.

## Interaction and motion

The signature motion is **survey reveal**: a vertical moss line grows once while adjacent report rows appear in sequence over 240 ms. Buttons move 2 px like physical keys. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and sequencing stop; state changes remain instant and fully visible.

Focus is a 3 px lichen outline with a 3 px ink offset. Links are visibly underlined. Loading, empty, error, offline, demo, valid-license, and revoked-license states use plain status labels.

## Original asset plan and provenance

One generated editorial hero image shows a cutaway of stacked concrete repository blocks with moss tracing cables and release tags through the cracks. It contains no words, logos, user interfaces, or trademarked marks. The art explains the core concept rather than filling space. A high-contrast crop becomes the Open Graph image. The favicon and tiny dependency-node mark are hand-made SVG geometry in this repository.

Generation prompt (factory image deployment, 2026-08-28):

> Use case: stylized-concept. Asset type: wide landing-page hero illustration. Primary request: an editorial architectural cutaway showing five heavy brutalist concrete blocks as software repositories, with thin living moss and lichen paths following joints between blocks and connecting small unlabeled metal release tags, webhook cables, branch gates, and package crates. Scene: isolated model on a warm concrete drafting table. Style: tactile architectural maquette photographed like a 1970s infrastructure survey, realistic rough aggregate, oxidized steel, restrained screen-print grain. Composition: wide 3:2 landscape, structure weighted to the right, calm negative space on the left, slightly elevated orthographic view. Lighting: hard overcast side light, serious and legible. Palette: warm concrete, charcoal ink, deep forest moss, acid lichen, small rust accents. Constraints: no text, no letters, no logos, no GitHub mascot, no people, no glossy 3D, no gradients, no watermark.

The image is generated with `/opt/fleet/lib/gen-image.sh`, then locally cropped and encoded to WebP. The generated asset is original project artwork. Runtime assets contain no third-party material.
