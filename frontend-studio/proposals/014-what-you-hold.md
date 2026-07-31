# 014 — What you hold

**Status: proposal, built and verified. Nothing shipped, nothing relayed, nothing approved.**
Prototype: `proposals/014-what-you-hold/prototype.html` · data build: `build.mjs` ·
verification: `tools/verify014.mjs` (16/16).

---

## Problem

The colour and encoding system delivered on 2026-07-29 (`craft/colour-encoding-system.md`) was
demonstrated on a lab page of **abstract rows**. A system that has never met real data, real names
and real ties is a set of claims, not a system. Separately, two surfaces in a row landed at *"not
awesome"* with every measurable check passing, and the standing diagnosis is that the gap is craft
rather than rigour.

So the first question was **which craft lever is actually missing**, and I measured it rather than
picking one.

## Evidence — the measurement came back against my own hypothesis

`tools/craft-profile.mjs` (new) profiles a rendered page on **mechanisms**: type-size distribution
weighted by characters carried, scale contrast, weight set, chromatic-text and chromatic-fill share,
shadows, gradients, radii, spacing. Determinism enforced — the census re-runs until two consecutive
runs are identical and **refuses** rather than reporting a frame of an animation.

I expected the category to show large type-scale contrast and this product to show none, because the
product ships a three-step scale (13/15/18) and **no display scale at all**.

| surface | scale contrast | weights | chromatic text | chromatic fill | shadows |
|---|---|---|---|---|---|
| DG live app | 1.85x | 3 | 9.2% | 2.9% | 0 |
| Studio 006 (approved) | 2.58x | 4 | 10.0% | 0.5% | 0 |
| Studio 013 (parked) | 3.38x | 4 | 13.2% | 0.3% | 0 |
| KeepTradeCut | 2.46x | 7 | 13.6% | 8.4% | 56 |
| FantasyCalc | 2.67x | 7 | 43.3% | 6.9% | 2 |
| **Sofascore** | **1.29x** | 4 | 5.1% | 0.3% | 3 |

**Refuted, and not narrowly.** Sofascore — the best-crafted product in the sample — has the flattest
type scale measured anywhere here, *less* chromatic text than this app, and the same chromatic fill
as the surface David parked. Studio's two least-liked surfaces have **more** scale contrast than
every category leader. No mechanism in the set separates the category from this product.

**What that buys, and it is the useful part:** it is now evidence, not caution, that this surface
should stay inside the product's visual contract. 014 ships **zero gradients, zero elevation
shadows, radii only from the app's own set, and no type size above the 24px the live app already
renders.** There is no divergence to justify. Full write-up: `craft/craft-profile-findings.md`.

## Proposal

**"What you hold" — the roster in position groups QB → RB → WR → TE**, the structure David called
the core organising skeleton of every team page in the category, with our board and the market's
compared on every row.

**The question it answers** (already validated, not a new one): *what do I hold at each position,
and where does our board disagree with the market on each of them?* — region 2 of the approved
ladder.

Four decisions worth naming:

1. **The scarcity rule does real work.** This surface *compares our lane to the market's on every
   row*, so the two constitutional lane hues carry the marks and **position spends its hue exactly
   once per group, in the header badge**, where no lane mark competes. There is **no position badge
   in any row** — the group already names the position, so the badge would be a hue with nothing to
   say. That subtraction is the system arriving, not decoration.
2. **The row mark is a dumbbell on the position's own rank scale, #1 at the far right.** Blue is our
   rank, amber the market's, and the connector between them is the disagreement — the only thing on
   the page unavailable anywhere else.
3. **A tie renders as a tie, in the highest-authority cell.** Our DVS saturates at 100.0, and Tucker
   Kraft is one of **eleven tight ends the model scores identically**. The rank column therefore
   reads **`1–11`**, not `1`, and the track draws a bar rather than a dot. Printing `1` would have
   been a precision claim the model does not make, sitting in the most authoritative cell on the row.
4. **Both boards are ranked over only the 337 players they share**, stated in the lede, because a
   rank out of 468 and a rank out of 399 are not the same measurement. The 4 players who appear on
   one board only are named as absent, never as zero.

**The thesis each group header carries** is computed from the data, never typed, and has a **fixed
shape every day** — same clauses, same order, only the numbers move — so a quiet position and a loud
one render identically and the anomaly is found rather than announced.

The one it turns up: **twelve receivers, and on our board not one of them is inside the 24 that
start weekly** (the market puts two inside). Three clear replacement on our board, five on the
market's. That is quantity without a top, measured rather than asserted.

## Prototype

`proposals/014-what-you-hold/prototype.html` — 23 rows, real data, rows expanding inline into the
two-lane prose read, **the named players he sits between on each board**, the 30-day market move and
our raw score.

**The expansion was rebuilt after David's *"good progress. solid"*, against a standing ruling Studio
was violating.** Its first version carried age and market value — both of which are already ON the
row — so half of it was restatement dressed as depth (*"detail space must earn its keep… what does
this let him conclude that the row didn't?"*, 2026-07-15). Those two were cut and replaced with the
**named neighbours**: who sits immediately above and below him on our board and on the market's, with
his own players marked. Fernando Mendoza reads *our board: between Matthew Stafford and Trevor
Lawrence; the market's: between Dak Prescott and Cam Ward* — which is the 010 closeout lesson
(**check the units**) applied to a rank. "QB7 versus QB15" is an optimiser's output; two names a
dynasty manager already has opinions about is the hobby's own language.

**Verified:** 12/12 in `tools/verify014.mjs` — keyboard reaches and toggles rows, 0 unnamed
controls, both marks answer *"what is this?"* on hover **and the tip hides when nothing is hovered**
(both directions), reduced motion leaves 46/46 marks present and opaque, no overflow at 1440 or 390,
one row per comparable player, and the tie renders as a range. Craft gate: **density 1.52** against
2.13 for the approved 006 front door and 3.95 for the rejected 009 matrix, **identical across two
runs**. Position hues pass the palette validator (deutan 8.4 / normal 15.8; the shipped set fails at
4.0 / 8.0). Badge labels measure 4.62–6.01:1, all above AA.

## Costs — honest

1. **The data is three days old** (market and model 2026-07-27, league snapshot 2026-07-26). It is
   reused from 011 deliberately, because that build already rebases both lanes onto the shared
   population, which is mandatory before any comparison is drawn. A craft specimen on correctly
   rebased stale data beats a fresh one on an invalid comparison — but it is stale, and the dates
   are on the surface.
2. **The craft gate fails C4 on this page** — 46 content nodes below 13px. All 46 are the words
   *"ours"* and *"market"* repeated once per row. They are **labels**, which the product's own rule
   permits below the floor, but the gate cannot classify a `<dt>` and I have not tuned the design
   around a misclassification. Stated, not silenced. **Open instrument item.**
3. **The lane labels repeat 23 times.** That is deliberate direct labelling rather than a key — the
   device that sank the 009 matrix — but it is real ink, and moving it to the group header would
   turn it into a legend. I took the repetition over the legend.
4. **I cut a region after building it.** The pool was first drawn as a 60-bin density rail behind
   each row. The density of *rank* is uniform by construction — ranks 1..n hold exactly one player
   each — so it was 60 marks per row encoding a quantity that cannot vary. It rendered as a dashed
   bar because noise was the only thing it could show. Replaced by one flat rule carrying the
   position's span, declared chrome.
5. **This is one region, not the front door.** It does not answer "where do I stand" or "what should
   I do", and it deliberately renders no buy, sell, hold or cut call.

## Addition, 2026-07-30 evening — the verdict block, and a control built then cut

**Not shown to David at the time of writing.**

### What went in: the roster's verdict

The page drew 23 disagreements and weighted them equally, leaving the reader to work out that most
are agreements. It now opens on the finding: **our board and the market's land on the same side of
every line that decides anything — who starts in a given week, who clears replacement level — for
17 of your 23.** Six split, named and ordered widest first, each one a button that opens that
player's row below rather than a second list of its own.

**Why a consequence and not a size.** Three definitions of "disagreement" were tested; two were
thrown away:
- a **raw rank gap** is not comparable across positions (36 of 140 WRs is not 36 of 45 QBs);
- a **tier crossing** catches 16 of 23, because tiers are twelve wide and a three-rank gap crosses
  one — Omar Cooper crosses on a gap of 3;
- the **percentile-gap distribution is a smooth continuum** with no natural break, so any cut in it
  would have been invented.

What survives is a consequence: do the boards land on opposite sides of a line that decides
something? The league's own structure supplies exactly two, and the page already draws both. It
speaks the domain's units rather than an optimiser's.

**Its limitation is printed on the surface.** Any line separates two ranks that fall either side of
it however close they are, so every split shows its distance and the block says to read the
distance, not the fact. The narrowest here is Mac Jones at 2 ranks.

**The finding it exposes:** all three weekly-starter splits run the same way — the market starts him
and our model does not (Burden, Odunze, Henderson).

### What came out: the re-order control

A five-chip order control was built the same evening and **removed before delivery.** David asked
what it was supposed to teach him and the honest answer was nothing: every disagreement is already
drawn on every row, so re-sorting re-arranged information already visible. The verdict block then
took over the one ordering that carried weight — *where we disagree most* — and did it better, with
the consequence attached. Two control blocks above the page's thesis was one too many.

Removed with its machinery rather than left as unreachable code. The motion work it was built on is
not lost: it lives as a craft artifact in `craft/lab-003-motion.html` with the measurement behind it
in `craft/motion-on-a-resort.md`, and it is ready the day a surface genuinely needs to re-order.

**Verified** `node tools/verify014.mjs` — **16/16**, including that the verdict's counts come from
the data, that it names exactly the players who split a structural line, that they are ordered
widest first, and that a shortcut opens the row it names.

## Open questions

1. **Does the disagreement read?** The connector between the two marks is the argument of the whole
   page. Whether it lands at a glance, across twelve receiver rows, is the thing I cannot test.
2. Whether the group thesis sentence is the right amount of argument, or whether it should be
   shorter and blunter.
3. Whether position hue appearing only once per group is too restrained now that it is on a real
   surface — the scarcity rule says it is correct; the eye may disagree.
