# Typography and type scale — how a scale is specified

Pulled 2026-07-24 (Tower) against Tier 2 §4 of `CRAFT-LIBRARY.md`. All sources free: Butterick is
free to read online; the Bringhurst-applied web edition is free; Material 3 and IBM Carbon publish
their token *values* in open-source repos (Apache-2.0), which is where the numbers below come from —
the rendered doc pages are JS-heavy and do not serve the tables.

Written against one failure mode: **picking sizes ad hoc per surface.** A scale is a specification
you can violate and detect. A pile of chosen sizes is not.

## A. Don't compose without a scale — and state the scale as a formula

*Bringhurst, "The Elements of Typographic Style Applied to the Web", webtypography.net — §3 "Rhythm
and Proportion": "Don't compose without a scale." Also "Choose a basic leading that suits the
typeface, text and measure" and "Add and delete vertical space in measured intervals."*

The two systems worth copying both define the ramp **generatively**, not by taste:

- **Carbon** (`@carbon/type/scss/_scale.scss`, Apache-2.0) is a recurrence relation:
  `Y₁ = 12px`, `Yₙ = Yₙ₋₁ + (⌊(n−2)/4⌋ + 1) × 2`. Steps 1–17 are
  **12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 54, 60, 68, 76, 84, 92** px.
  Note the shape: **2px increments through the working range (12→20), widening only above it.**
  A dense data UI lives almost entirely in steps 1–5, where the ramp is deliberately fine-grained.
- **Material 3** (`md-sys-typescale` tokens, v0.192) is a fixed 15-slot table addressed by **role**,
  not by size: `display/headline/title/body/label` × `large/medium/small`.

**Do:** define the ramp once as a formula or a table, emit it as tokens, and then *only ever address
type by token name*. **Rules out:** `font-size: 13px` appearing anywhere in a component. If 13px is
needed, either it is a scale step or the scale is wrong — those are the only two options, and both
are decided centrally.

## B. Address type by role, not by size — the token naming is the load-bearing part

*Material 3 token convention: `--md-sys-typescale-<role>-<size>-<property>`, properties
`font | size | line-height | weight | tracking` (material-web.dev/theming/typography).*

The full M3 table, exact values (rem; ×16 for px):

| Role | size | line-height | tracking | weight |
|---|---|---|---|---|
| display-large | 3.5625 | 4 | −0.015625 | regular |
| display-medium | 2.8125 | 3.25 | 0 | regular |
| display-small | 2.25 | 2.75 | 0 | regular |
| headline-large | 2 | 2.5 | 0 | regular |
| headline-medium | 1.75 | 2.25 | 0 | regular |
| headline-small | 1.5 | 2 | 0 | regular |
| title-large | 1.375 | 1.75 | 0 | regular |
| title-medium | 1 | 1.5 | 0.009375 | medium |
| title-small | 0.875 | 1.25 | 0.00625 | medium |
| body-large | 1 | 1.5 | 0.03125 | regular |
| body-medium | 0.875 | 1.25 | 0.015625 | regular |
| body-small | 0.75 | 1 | 0.025 | regular |
| label-large | 0.875 | 1.25 | 0.00625 | medium |
| label-medium | 0.75 | 1 | 0.03125 | medium |
| label-small | 0.6875 | 1 | 0.03125 | medium |

Two roles can share a size (title-medium and body-large are both 1rem) and still differ in weight and
tracking. **That is the point:** role carries the semantic, size does not.
**Rules out:** "make it 14px medium" as a design instruction. The instruction is "label-large".

## C. Every line-height in the scale snaps to a 4px module

Read the line-height column: **1rem, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3.25, 4** — every value is
a multiple of `0.25rem` (4px), with no exceptions across all fifteen M3 roles. Carbon reaches the
same place from the other side, expressing line-height as a **unitless ratio** that lands on whole
pixels: 12px/1.33333 = 16px, 14px/1.28572 = 18px, 16px/1.5 = 24px, 32px/1.25 = 40px
(`@carbon/type/scss/_styles.scss`).

**Do:** compute the line-height, round it to the 4px module, then store the *rounded* value as the
token. This is what makes a table row height, an icon box and a text block share one rhythm without
per-component nudging. **Rules out:** `line-height: 1.4` applied globally — at 13px that is 18.2px,
which snaps to nothing and puts every row on a fractional baseline.

## D. Tracking is a function of size, and the sign flips

Both systems, independently, do the same thing:

- **M3:** small type gets *positive* tracking (label-small 11px → +0.5px; body-small 12px → +0.4px),
  large type gets *negative* (display-large 57px → −0.25px), mid-range is 0.
- **Carbon:** `letter-spacing: 0.32px` at 12px, `0.16px` at 14px, `0` at 16px and above.

**Do:** bind tracking to the scale step in the token, never set it per-component. At 11–12px in a
dense dark UI this is the difference between a legible metric label and a smear.
**Rules out:** a single `letter-spacing` for the whole app, and "add letterspacing to make it look
premium" applied to body copy.

## E. Butterick's four variables — the ones that actually decide readability

*Butterick, "Practical Typography", practicaltypography.com/summary-of-key-rules.html (free online).
"The four most important factors": **point size, line spacing, line length, font choice.**

- **Point size:** "10–12 points in printed documents, **15–25 pixels on the web**." A 16px body is
  the *bottom* of his web range, not the middle.
- **Line spacing:** **120–145% of the point size.** M3's 16/24 = 150% sits just above it; Carbon's
  14/18 = 129% sits in the middle. Both are defensible; 100–115% is not.
- **Line length:** **45–90 characters including spaces.**
- **Font choice:** the largest single visible improvement is using a real text face; he specifically
  warns off system defaults, Times New Roman and Arial.

Other rules that survive into product UI: **all-caps needs 5–12% extra letterspacing** and should not
run past one line; **never underline except links**; use real ellipsis and true quotes; use
first-line indent *or* paragraph spacing, never both. **Rules out:** an uppercase table header with
default tracking (his rule 9), and 11px body text (below his floor by a wide margin) — 11px is a
*label* size in M3, used at medium weight, and it is the smallest slot the entire scale contains.

## F. Measure is an axiom, and the unit is `ch`

*Every Layout, "Axioms" (free chapter), every-layout.dev/rudiments/axioms.*

> "the measure should never exceed 60ch"

Enforced as an exception-based rule rather than a per-component decision:

```css
:root { --measure: 60ch; }
* { max-inline-size: var(--measure); }
html, body, div, header, nav, main, footer { max-inline-size: none; }
```

The argument for `ch` over `px` is the one that matters: "there is no relationship between character
length and pixel width", so a px max-width silently breaks the measure the moment the font-size
changes. `ch` re-derives itself. **Rules out:** `max-width: 640px` on a prose block whose type scales.

## G. The clipped-text defect has a spec, and it is a testable one

*WCAG 2.2 SC 1.4.12 Text Spacing, w3.org/WAI/WCAG22/Understanding/text-spacing.html.*

Content must survive a user applying **all four** of: line height **1.5×** font size; paragraph
spacing **2×**; letter spacing **0.12×**; word spacing **0.16×** — with **no vertical cutoff, no
horizontal truncation, and no overlap**.

This is the standing test for every shipped label-collision and clipped-text bug. Apply the four
overrides in devtools on the densest surface; anything that clips was already broken, the user just
found it first.

**Do:** let text containers size to content (`min-height`, never `height`), and never pin a text
element's box to a value derived from today's string.
**Rules out:** fixed-height stat tiles, `overflow: hidden` used as a layout tool, and single-line
truncation on a value the user is expected to *read* (truncation is acceptable for identity, e.g. a
long player name with a title attribute; it is never acceptable for a number).

## H. Numerals: the two settings a data UI cannot skip

*CSS Fonts Level 4 `font-variant-numeric` (MDN: Web/CSS/font-variant-numeric).*

- **`tabular-nums`** — fixed advance width per digit, so columns of numbers align and a value that
  ticks from 99 to 100 does not shift the row. Mandatory in any table, stat tile, or live value.
- **`slashed-zero`** where 0/O confusion is possible in IDs.
- Proportional (default) numerals are correct in *running prose only*.

**Rules out:** a right-aligned numeric column in a proportional face — the alignment is a lie that
holds only until the digits change.

## I. The load-bearing takeaway

**A type scale is a specification with three coupled columns — size, line-height, tracking — indexed
by role.** Carbon proves the ramp can be a formula; Material 3 proves the addressing should be
semantic; both prove line-height snaps to a 4px module and tracking is a function of size. The
failure mode is never "wrong size". It is *addressing type by size at all*, which makes every
subsequent surface a fresh negotiation and guarantees drift.
