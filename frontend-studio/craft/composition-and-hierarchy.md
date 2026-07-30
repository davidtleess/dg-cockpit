# Composition and hierarchy — the squint test, mechanised

**Curated and practised 2026-07-30.** Instrument: `tools/squint.mjs`. Applied to 014 the same hour,
where it found a real defect and the fix was verified by re-running it.

**Why this file exists, and it is not a general interest.** `tools/craft-profile.mjs` measured this
product and three category leaders on every token mechanism — type scale, weight range, chromatic
share, shadows, gradients, radii, spacing — and **none of them separates us from the category**
(`craft/craft-profile-findings.md`). Sofascore runs a flatter type scale and less colour than we do
and reads far better. So the *"not awesome"* deficit is **composition**: what dominates, what recedes,
and whether the page has a focal point at all. Nothing in the library covered it —
`craft/layout-grid.md` is responsive *mechanics* (container queries, subgrid, intrinsic sizing),
which is plumbing, not composition.

## A. The squint test — the standard check, and it is mechanisable

Blur a page until type and icons dissolve. **Whatever you still recognise first is the focal point.**
If it is not what you intended, the hierarchy is wrong; if nothing survives, there is no hierarchy at
all. Nielsen Norman recommend it as the quick check for visual hierarchy, and the reason it works is
that the blur acts as a perceptual low-pass filter, leaving only the contrasts of light/dark and
large/small that the eye resolves pre-attentively.

```
node tools/squint.mjs proposals/014-what-you-hold/prototype.html --out 014
node tools/squint.mjs https://www.sofascore.com/ --out sofa --blur 9
```

It writes a sharp and a blurred render side by side and **issues no verdict** — there is no labelled
population for "has a focal point," and inventing a threshold would repeat the two-point fit already
flagged as weak in the density gate. The artifact is the comparison; the judgement stays human.

**It sees a class of defect no other Studio instrument can.** `craft-gate` measures whether a drawing
is too dense or illegible. `craft-profile` measures which mechanisms are in use. Neither can tell you
that the brightest object on the page is the least important one.

## B. What it found on 014, first run — the finding that justifies the whole file

Squinted, the single brightest object on the page was the **position badge**: two letters, "QB", sitting
immediately beside the word "Quarterback." **The most saturated mark on the surface was the most
redundant information on it.** Meanwhile the connector between the model dot and the market dot — the
disagreement, which is the entire argument of the page and the only thing on it unavailable from any
other product — **dissolved completely.** Two coloured dots survived; the relationship between them did
not.

Both were fixed and the fix was verified by re-running the test rather than by looking once:

| | before | after |
|---|---|---|
| position badge | 34×24 solid, brightest object on the blurred page | 24×16 — halved in area, still marks the group for scanning, no longer outranks the data |
| connector | 2px at `--border-strong` (L .48), first thing to dissolve | 3px at L .60 — the disagreement now survives the blur as a segment whose **length** is the magnitude |

**The connector fix adds no channel.** Length already carried the quantity (Cleveland & McGill tier 1);
it was simply not legible. Making an existing encoding visible is craft; adding a second encoding of
the same quantity would be the error.

**The general rule this produced:** *dominance must be proportional to importance, and dominance is
measured by squinting, not by intention.* A designer knows which element matters and therefore reads it
as prominent whether or not it is. The blur removes that knowledge.

## C. Proximity before borders — Nielsen Norman, and NOT yet applied here

> Where whitespace alone creates a clear grouping, use it. Borders are usually added out of caution and
> the result is a busy, cluttered design. **Before adding lines, add space.** If two things are related,
> move them closer; if unrelated, push them apart.

Proximity is among the strongest grouping cues and **can override competing cues such as colour or
shape similarity**. Common region (a shared boundary or background) groups even across distance, which
makes it the right tool in genuinely dense layouts — and the wrong one everywhere else, because every
border is ink spent on structure rather than on data.

**Honest status: 014 has 23 horizontal rules, one per row, and this principle has NOT been tested
against it.** A rule per row may well be load-bearing for tracking a value across a wide row — that is
the case borders legitimately exist for. It is a candidate change with a real argument on both sides,
and it is recorded here as untested rather than applied, because applying a principle without testing
it on the surface is how the Carbon type ramp got imposed on a product that already had one.

## D. What this does NOT settle

The squint test finds *whether* a hierarchy exists and *what* is winning. It cannot say whether the
thing winning is worth winning — that is a question about the surface's argument, and the most
expensive failures in this engagement were wrong questions drawn well. A page can pass the squint test
brilliantly while making a point nobody needed.

## Sources

- **Nielsen Norman Group**, *Proximity Principle in Visual Design* — proximity as a grouping cue and
  its precedence over similarity: https://www.nngroup.com/articles/gestalt-proximity/
- **Nielsen Norman Group**, *The Principle of Common Region: Containers Create Groupings* — when a
  boundary is the right tool and the cost of overusing it: https://www.nngroup.com/articles/common-region/
- **Nielsen Norman Group**, *Visual Hierarchy in UX: Definition* — hierarchy, dominance, and the squint
  test as the quick check: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- **Cleveland & McGill** via `craft/graphical-perception.md` — why length is the channel worth making
  legible rather than replacing.
