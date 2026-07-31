# The falsifiability test — what separates the surfaces David keeps from the ones he doesn't

**2026-07-30 evening, self-directed.** Four hypotheses tested, three refuted, one survived. Every
number below is reproducible with the command beside it.

---

## The question

Three surfaces in a row landed at *"missing the mark"* (012), *"not bad, not awesome"* (013), and
*"im not really seeing anything here - not telling me anything -- very long page… i feel like i have
whiplash"* (014). Every measurable check passed on all three. The session opened on the assumption —
stated to David in the pane before any measurement — that the deficit was **pacing at page scale**:
that Studio builds long scrolling documents and the category does not.

That assumption was wrong, and so were the two that replaced it.

## H1 — extent. REFUTED.

`node tools/screenfuls.mjs <page> --out <dir>` captures a page as discrete viewport-height slices at
1440×900 and reports its height in screens.

| page | David's reaction | screens |
|---|---|---|
| 013 who do I call | "not bad, not awesome" | 2.41 |
| the app's own front door | — | 3.22 |
| **014 what you hold** | **"very long page"** | **3.84** |
| **006 front door** | **"this is awesome"** | **4.64** |
| FantasyCalc | — | 4.17 |
| Sofascore | — | 6.92 |
| she-displaced (David's reference) | "cool ways to visualize data" | 10.52 |
| 012 league pulse | "missing the mark" | 10.74 |

**The page he called long is shorter than the page he called awesome, shorter than every category
leader, and less than a third the length of the site he sent as a good example.** "Very long" is a
report of a feeling, not a measurement — so shortening is not the fix, and would not have been.

## H2 — column structure. REFUTED by looking.

Sofascore runs a spine-and-rail composition: a long repetitive fixture list in one column, a stack of
differently-shaped modules in the other, so length and monotony are decoupled. Attractive theory.
**006 — the surface David called "awesome" — is a single column of repeated rows, exactly like 014.**
The mechanism cannot separate them.

## H3 — row distinguishability. REFUTED by measurement.

Built `tools/row-variance.mjs`: finds a page's repeated row groups, rasterises each row, blurs until
type dissolves (so two rows differing only in *spelling* do not register as differing in
*appearance*), downsamples to a 64×8 luminance grid, and reports the mean pairwise distance.

Both directions first, on fixtures: `kit/gate-fixtures/rows-identical.html` scores **0.00**;
`rows-distinct.html` scores **1.07**; identical across two runs.

| surface | reaction | glance distance |
|---|---|---|
| 006 front door | "this is awesome" | **0.36** |
| 014 what you hold | "not telling me anything" | **0.34** |
| 013 | "not bad, not awesome" | 0.41 |
| 012 | "missing the mark" | 0.38 |

**Statistically indistinguishable.** 006's rows carry headshots and sparklines and 014's do not, which
is a real difference — it just is not the one that decides his reaction. *The instrument was not
tuned until it said something more convenient.*

## H4 — what the words claim. SURVIVED.

Census every rendered string of ≥3 words on a surface, in document order, and read them.

**The live app's front door: 42 strings. Every one is a label, a description of the surface itself, a
disclaimer, a feed status, or a count.**

> "A daily delta surface (what changed since the prior snapshot); no verdict, no nominated move." ·
> "Descriptive only — not decision-grade." · "Feed status: ok" · "Market source: fantasycalc_overlay" ·
> "Where the roster stands right now — the backdrop for today's movement, not the movement itself." ·
> "Starting lineup value: 97.39" · "Weekly lineup strength: 97.39" · "Total players: 27"

**Not one sentence on the screen David opens every morning could turn out to be wrong.**

Now the two surfaces of Studio's own, on the same test:

- **006, approved.** *"Last in the league in what you can start today — top of it in the youth and
  picks you're building with. The season's whole job is turning the second into the first."* Group
  headers: *"Your surplus — and your currency… That's not a strength, it's trade ammunition."* ·
  *"The hole. Worst room in the league, three bodies."*
- **014, rejected.** Opens with **a methodology note about rank comparability** — *"23 of your 27
  players… because a rank from a list of 468 and a rank from a list of 399 are not the same
  measurement"* — then counts: *"Of the 5 you hold, 1 are inside that starting 21 on our board and 2
  on the market's."*

### The test, in one line

**Ask of each sentence: could the product be wrong about this?**

A count cannot be wrong; it reports a thing that is what it is, and he can get it from Sleeper. A
methodology note cannot be wrong. A claim can be wrong — and that is the whole of its value, because
it is the only sentence that spends the model's opinion, which is the only thing here no other
product has.

This is not new doctrine. It is David's own governing method (2026-07-22) — *does it carry a thesis
about the user's situation, or does it merely display his data?* — arrived at from the opposite
direction, by measurement, after three composition theories died.

### The trap it names, and Studio walked into it twice

On 2026-07-22 Studio found it had **inherited the app's structure** — building a monitoring feed as a
front door because the app's default screen is one. Tonight's finding is that Studio then inherited
**the app's voice**: methodology, provenance, disclaimers, counts. The product confuses *"we render no
verdicts"* with *"we make no claims."* Its descriptive doctrine forbids **prescription** — buy, sell,
cut. It does not forbid a falsifiable **description**. *"Worst room in the league, three bodies"*
prescribes nothing and David approved it.

---

## What David's reference contributed

`https://she-displaced.vercel.app/` — sent mid-session as *"cool ways to visualize data."* Every
figure on it carries the same three-part header, without exception:

1. a **kicker** naming the category — RANK SHIFT · RIVER OF RISK
2. a **title that names a concept, not a metric** — "The Gender Penalty", not "Gender delta by country"
3. a **decoder line** — *"Stream thickness = people affected"* · *"Left = vulnerability rank · Right =
   SDRS rank after adding gender"*
4. and **the highlight rule stated out loud** — *"Top 7 movers — gender amplifies risk most"*

That fourth one is a device Studio has never used. Studio highlights things and never says why.

It also answers the length complaint properly: 10.5 screens, and navigable because it is **chaptered**
— seven numbered sections, a persistent nav showing which one you are in, and background inversion
between them. Not shorter. **Positioned.**

## The form it pointed at

Its slope chart is the fix for a problem measured earlier the same evening. Looking at screen 3 of 014
— ten receiver rows — every dumbbell connector is short and sits in the same narrow band. **The
disagreement does not read across a group**, which is the exact question put to David on 2026-07-30
that he never answered. Studio now has its own answer: no.

A dumbbell gives each player a private track, so twelve of them never compose into a picture. A slope
chart puts both boards on **one shared scale** and draws the crossings — disagreement becomes slope,
and magnitude becomes a segment the eye reads without a legend. Shared scales is the through-line
already identified on 2026-07-23 (the literature's first rule, the confirmed 004 N4, and the flagged
sparkline flaw — one fix, three surfaces).

**Demonstrated in `craft/lab-004-the-claim-and-the-crossing.html`**, built by
`craft/build-lab004.mjs` from the real 014 data. Twelve receivers drawn both ways side by side, with a
**Squint** control that blurs both at once, and the same figure headed three ways — metric label /
methodology / claim.

**The honest cost, having tested it:** the slope chart drops what the row carried — age, value, tier,
named neighbours. It answers a group question and cannot answer a player question. It does not
replace the row; it is what belongs *above* it. And it only works because both boards rank the same
337 shared players; on any other pair of lists the two scales are not the same measurement.

## Defects caught in this lab by looking, not by checks

1. **The chart rendered at ~0.7 scale** because its viewBox was wider than its column — an SVG at
   `width:100%` scales its whole coordinate system, so every label landed near 8px. This is David's
   *"all the visuals are very small"* (2026-07-23) recommitted, and it is a **geometry bug, not a
   taste call.** Fixed by binding viewBox width to the panel's true usable width.
2. **Two of the three gap labels shared a midpoint** and rendered as text on text — the same mush
   defect caught on 2026-07-30. Fixed with de-collision plus `paint-order: stroke`.
3. A `paint-order` fix was **described in a code comment before it was actually applied.** Caught on
   re-read. A comment is not an implementation.

## Reproduce

```
node tools/screenfuls.mjs <url|path> --out <dir>      # extent, as discrete screenfuls
node tools/row-variance.mjs <url|path>                # glance-distinguishability of repeated rows
node tools/row-variance.mjs kit/gate-fixtures/rows-identical.html   # must read 0.00
node tools/row-variance.mjs kit/gate-fixtures/rows-distinct.html    # must read clearly above 0
node craft/build-lab004.mjs                           # rebuilds the lab from the real data
```

## What is NOT concluded

- Row individuation (faces, sparklines) is not shown to be worthless — only that it does not decide
  David's reaction. 006 has it and 014 does not, and the instrument reads them the same.
- The category snapshots are one viewport, one load, one night, on live third-party sites.
  **KeepTradeCut was again behind its "Your Thoughts?" modal** — caught by looking this time, and its
  slices are unusable. It was tabulated as contaminated on 2026-07-30 too; that page needs the modal
  dismissed before it is ever measured again.
- The slope chart is a **first cut**. It has not been through the craft gate, the palette validator,
  keyboard verification, or a reduced-motion pass.
