# The composition deficit — measured, 2026-08-08

**Origin:** David, after rejecting 018: *"i just think your design principles are off - please go
learn some new techniques."* This is the measurement that followed, and it converts that judgement
into named channels with numbers.

## The instrument

`tools/composition-profile.mjs`. It measures SPATIAL WEIGHT, which `craft-profile.mjs` cannot see —
block mass, figure/ground layers, identity imagery, chromatic area, radii — on the first screenful,
because hierarchy is a first-impression property.

**It had a defect on first run and the defect was in Studio's favour to ignore:** the colour parser
regex-matched `rgb()` only, so every `oklch()` background — i.e. every token this product ships —
parsed as transparent. Studio's own pages reported **0 ground layers and 0% chroma** while the
rgb-based reference sites measured correctly. **The instrument was choosing its own population
through colour syntax.** Fixed by resolving any colour through a canvas; validated by asserting
oklch resolves (`oklch(0.72 0.13 75)` → `[212,152,56,1]`). **A number reported to David before the
fix (0 ground layers) was wrong and was corrected to him in the same session.**

## The measurement

| | blocks | biggest÷median block | ground | identity marks | chroma area | type contrast |
|---|---|---|---|---|---|---|
| Baseball Savant *(David rates it)* | 13 | **91.5** | 1 | 26 | 0% | 3.43 |
| FotMob | 23 | 10.5 | 4 | 26 | 0% | 1.36 |
| Sofascore | 9 | 5.5 | 4 | 36 | 18% | 1.29 |
| **Studio 017** | 1 | **1.00** | 1 | **0** | 0% | 1.38 |
| **Studio 018** (rejected) | 3 | **1.00** | 1 | **0** | 0% | 1.38 |
| Studio lab-005 (after) | 12 | 16.2 | 3 | 0 | 1% | 2.31 |

## What it says

1. **Every block on a Studio page is the same size — a ratio of exactly 1.00.** The category runs
   5.5× to 91.5×. This is the hierarchy channel Studio does not use at all, and it is the one the
   bento literature names: *tile area encodes importance; the layout itself says where to look.*
2. **Type scale was never the deficit.** Studio's 1.38 sits between Sofascore's 1.29 and FotMob's
   1.36 — inside the category's range. This independently re-confirms the 2026-07-30 `craft-profile`
   finding, which was recorded and then not acted on for nine days because nothing here could
   measure the thing it implied.
3. **Identity imagery is the only channel every reference uses and Studio uses none of** (26–36
   nodes against 0). The app's headshot cache is absent and requests 404, so photographs are an
   engineering ask; a team-coloured identity tile is the available substitute and is *colour mass,
   not imagery* — the instrument correctly still scores lab-005 at 0 and that is honest.
4. **Two viable strategies exist in the category, not one.** Savant: one ground, enormous block
   mass, big type, imagery. FotMob/Sofascore: four grounds, flat type, moderate mass, imagery.
   Both work. Neither looks like a broadsheet.

## The named diagnosis

The `frontend-design` skill lists the three looks AI-generated design clusters into. The third is
*"a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like
columns."* **That is a literal description of all eighteen surfaces this studio has shipped.** The
deficit was never taste applied badly; it was one layout applied eighteen times.

## The architecture that names how 018 failed

SGX's **bite / snack / meal**: the Bite is a single insight requiring zero cognitive effort, the
Snack explains it, the Meal is full depth for whoever wants it. **018 was all Meal.** Its first
screenful was a population-statistics figure about 1,154 anonymous player-seasons answering
*is this metric reliable?* Their listed failure patterns read as a review of it: *equal visual
weight across all metrics; raw statistics without interpretive narrative; meaning requiring expert
effort rather than immediate revelation.*

## Practised in `craft/lab-005-composition.html`

Bite = the count (3 of 14 had a weekly starter's job). Snack = a **depth chart**, the artifact this
hobby actually thinks in, stacked by what the tape says the job was worth rather than by where the
team lists him. Meal = the table, present but collapsed.
**Held inside the product's contract deliberately:** radius stays at the shipped 6px, not the
category's 12–16; the three ground layers used are the ones `tokens.css` already ships. **One
declared extension:** a 76px display numeral, since the product ships no scale above 18px.
**One collision named:** team colour as identity spends the surface's single categorical hue
channel, so the model/market lanes must go neutral here — that is the colour constitution's own
rule, not a violation of it, but it means this form cannot also carry the two-lane comparison.

**The bug the drawing caught that the data did not:** the Bite counted 3 full seasons above the
starter line while the receivers column visibly drew 4 names above it — Garrett Wilson clears it in
7 games. The picture and the number contradicted each other; Wilson is now named explicitly.
