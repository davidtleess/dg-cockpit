# Premium surface technique — why Studio's work reads as a terminal, and the fix

**Curated 2026-07-29, from outward research + a built lab.** Practice artifact:
`craft/lab-001-depth-and-hierarchy.html` — every technique below is implemented there twice, once on
chrome where it is craft and once on a data mark where it is a defect.

**Why this file exists, and it is not a general interest.** Two surfaces in a row (012, 013) landed at
David's *"not awesome"* with every measurable check passing. Defensible is not compelling. The gap is
not rigour — the gap is that Studio's surfaces are flat and monochrome, because it drew the wrong
conclusion from one true fact: *the product renders zero gradients and zero elevation shadows,
therefore use no depth and almost no colour anywhere.* **Those are two different statements.** David
said so on 2026-07-28 ("colours and better visuals and animations"); Studio half-fixed it and then
reconciled it away.

---

## The one rule this produced

> **Light the room, never the number.**
>
> Elevation, lit edges, tinted ramps, spring overshoot and scale contrast belong to **containers,
> chrome and type**, where they compete with no quantity. The moment any of them touches a mark whose
> **length, position or count** carries a value, it becomes a second visual channel arguing with the
> first — and the reader cannot know which to believe.

This is the operational form of the principle already in `CLAUDE.md` ("colour the atmosphere, keep the
data honest"). What was missing was the *technique list* to execute it.

---

## The techniques, with the boundary attached

| # | technique | value | on the room | on a data mark |
|---|---|---|---|---|
| 1 | **Elevation is a lightness step, not a shadow** | 4–8% L per layer, 4–5 layers | **adopt** | **never** — lightness is already a magnitude channel |
| 2 | **Border in the shadow layer**: `box-shadow: 0 0 0 1px` low alpha | no box-model space, survives radius, animatable | **adopt** | no — reads as a second outline, thickens apparent size |
| 3 | **Inset lit top edge**: `inset 0 1px 0 rgba(255,255,255,.06–.09)` | cheapest "this is an object" cue that exists | **adopt** | **never** — adds apparent height the value lacks |
| 4 | **Tinted neutrals** — chroma .013–.017, never 0 | chroma 0 reads dead | **adopt** | yes, as the *ground* only (encodes nothing) |
| 5 | **Scale contrast** — 4–6 sizes with real distance (44 vs 13) | a verdict cannot lead at body size | **adopt, declared** | n/a |
| 6 | **Six microstates** — default, hover, focus, active, disabled, loading | focus ≠ hover | **adopt, non-negotiable** | yes |
| 7 | **Spring overshoot** (`linear()`, ~1.8%) | reads physical rather than mechanical | **adopt on chrome** | **never** — shows a value never held, even for 200ms |
| 8 | **Gradient fill / glow** | — | only where it encodes **missing data** (hatch) | **never** — makes a bar's end ambiguous, adds apparent length |

## The specifics worth not re-deriving

- **The dark-mode elevation ramp Studio now uses in the lab**, tinted at hue 258:
  `.17 → .21 → .245 → .28 → .32` for page → card → row → popover → tooltip. The product ships **two**
  surfaces (`.20`, `.24`); that is why every Studio surface reads as one plane with lines drawn on it.
- **A shadow is invisible on a dark surface.** This is the whole reason the product's "zero box-shadow"
  observation is not evidence against depth — the technique dark UIs use *instead* is luminance, which
  the product also does not use.
- **The lit edge is the single highest-yield line of CSS** in the list. One inset highlight turns a
  painted rectangle into a surface catching light from above, and it costs no colour, no motion, and
  nothing the data uses.
- **Hairlines at low alpha** (`color-mix(in oklch, white 8%, transparent)`) rather than a solid border
  token: the edge reads as an edge, not as a drawn line.
- **Type**: 4–6 sizes maximum, modular. Optical alignment for headlines, **tabular numerals for data**,
  mono for data only — prose in the body face (the 2026-07-28 finding that IBM Plex Mono was carrying
  labels, captions and prose is the same failure from the type side).

## Sources

Fetched 2026-07-29. Craft only, per David's standing limit — how a product is built and animated,
never what it chose to prioritise.

- Dark-mode elevation by lightness step, 4–5 layers: Atlassian *Elevation* foundations; Material dark
  theme; syntheses at uxcel and colorarchive.
- Shadow-as-border, multi-layer shadow stacks, inner-ring highlight, tinted neutrals, hairlines at
  0.5–1px low alpha, six required microstates: *How Stripe, Linear, and Vercel Ship Premium UI*
  (mantlr) and the Vercel design-system write-ups. **Note honestly:** the mantlr piece deliberately
  gives no hex values or timings — it argues the numbers are downstream of principles. The concrete
  values above therefore come from the design-system sources and from the lab, not from it.
- Motion curves and the three-job split (entrance / standard / exit): `craft/motion-easing.md`
  (Material 3 + Carbon), already curated 2026-07-24 and **still largely unapplied**.

## What this does NOT settle

- **Whether the product should adopt any of it.** Divergence is a cost, and it is paid once in tokens
  across every surface — never on one page. The lab exists so Studio knows *what it would be arguing
  for* before it argues. Nothing here is proposed.
- **Whether it fixes the actual gap.** "Not awesome" may not be about depth at all; David has not said.
  This addresses the deficiency Studio can name and measure. Treat it as one hypothesis with a built
  artifact behind it, not as the answer.
