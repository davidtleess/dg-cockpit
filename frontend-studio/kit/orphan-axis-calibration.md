# orphan-axis — calibration record

**Built 2026-08-07** after David looked at proposal 017 and said:

> *"it says 'week' on the bottom axis and nothing on the left axis"*

The tick numbers were rendering. What was missing was a **label attached to them**. Studio had
written one and placed it as prose above the plot, where it read as another sentence in the
paragraph. **The craft gate, palette validator, squint test, keyboard pass, collision census and
geometry audit all passed that page.** Every one of them measures marks, contrast, targets or
overlap. None can see an unlabelled axis.

## What it tests

A group of aligned numbers is a claim about a quantity. The reader must be able to name that
quantity **without leaving the figure**. An explanation elsewhere on the page is not attachment;
distance is the test.

This is `CLAUDE.md` principle 4 — *"a mark standing for one real entity must be able to name that
entity"* — applied one level up, to the axis rather than to the mark.

## Both directions, on the same figure

`kit/gate-fixtures/axis-orphaned.html` and `axis-labelled.html` are the same chart. The orphaned one
carries a correctly-labelled x-axis and a y-axis whose only label is prose above the plot — the exact
shape of the 017 defect.

| specimen | y-axis | x-axis | verdict |
|---|---|---|---|
| `axis-orphaned` | nearest word **320px** away | "week" at **0px** | **FAIL y, pass x** |
| `axis-labelled` | "fantasy points per game" at **7px** | "week" at **0px** | pass both |

**It convicts the y and clears the x on the same figure** — the discrimination David made by eye.
Identical output across two runs (md5 of `--json`).

## The threshold

`ATTACH_PX = 46`. Chosen because the two specimens sit at **7px** and **320px** — a 45× gap, so the
threshold is not doing delicate work and no result in this record turns on its exact value. It was
not tuned to produce an answer.

## Known blind spots — stated, because the population test found them

Run across the eight figures this studio has produced, only **one** (017) contained an axis this tool
can see. That is not a clean sweep; it is narrow coverage, and the reasons differ:

1. **HTML/CSS figures are invisible.** The tool only looks inside `<svg>`. `016-silent-lane/figure.html`
   contains **0 SVGs** and was not examined at all. **This is a genuine hole**, not a pass.
2. **Correctly skipped, verified by probing rather than assumed:**
   - `lab-004` has 16 SVG text nodes and **0 numeric** — a slope chart with direct labels and no
     numeric axis. There is nothing for an axis check to measure.
   - `006-frontdoor` has 51 numeric text nodes spread one-per-SVG across **55 separate SVGs**. Those
     are individual marks, not aligned tick groups. Correct to skip.
3. **It tests attachment, not comprehension.** A label reading `xVAR_pct_norm` sitting 7px from its
   ticks passes here and is still unreadable. Having a name is mechanical; naming it well is a
   judgement and no instrument in this kit makes it.

## The larger limitation, which is the honest headline

This closes one hole in a wall that is mostly hole. Everything in `kit/` and `tools/` measures the
**drawing** — marks, hues, contrast, targets, collisions, geometry, density. **Nothing measures
whether a reader can understand the figure.** On 2026-08-07 that gap cost three rounds of David's
attention on a single axis, and every one of those faults was visible in the first screenshot Studio
rendered. Studio read that screenshot for defects it already had names for and never asked the naive
question: *if I knew nothing, could I read this?*

**The instruments train the looking, and the looking narrows to what the instruments measure.** This
tool makes one comprehension failure mechanical. The rest still require a person, and David is
currently the only one.
