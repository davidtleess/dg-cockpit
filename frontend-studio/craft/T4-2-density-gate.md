# The density gate — a pre-flight instrument, and what it is not

Built 2026-07-28, self-directed (strand 2). Runnable: `node tools/craft-gate.mjs <file.html>
[--unit <sel>] [--width N] [--json]`.

**The gap it closes.** Every surface David rejected as unreadable had passed the existing probes.
Collisions, clipping, overflow and console errors all measure whether a page is **broken**. None of
them measures whether it is **dense**. The 009 matrix scored zero on every probe and came back
*"extremely confusing and hard to read."* This measures density and legibility, against thresholds
that carry a source.

**Studio's own logged request.** 2026-07-25 session learnings, item 3: *"Budget marks before drawing.
The rejected grid was measured after the fact at 265 marks + 192 numbers over 48 cells… A pre-flight
budget would have killed both. Requested as Tier 4 of the craft library."* This is that item, built
rather than fetched — no published source measures a Studio prototype.

---

## A. The six checks and where each threshold comes from

| | Check | Threshold | Source |
|---|---|---|---|
| **C1** | Density: marks + text per 10,000px² of the repeating unit | warn 1.75, fail 3.0 | **Calibrated, not cited** — see §C |
| **C2** | Legend entries × repeating units = hue matches the reader performs | fail ≥3 entries, warn 1–2 | `colour-accessibility.md` §D (Okabe & Ito) — label on the graphic; a legend forces a match in the channel that fails |
| **C3** | Distinct hue families among data marks | fail >5 | Healey 1996 — detection "rapid and accurate" at 3 and 5 colours, "mixed" at 7 and 9 (`T4-1` §7.3) |
| **C4** | Content text below the **product's** smallest type token | fail any | `tokens.css:50-52` — the product ships `--dg-text-sm/base/lg` = **13 / 15 / 18px**. See §A2 |
| **C5** | Interactive mark size and nearest-neighbour spacing | fail <24px | WCAG 2.2 SC 2.5.8 Target Size (Minimum) |
| **C6** | Does the dominant mark's encoding channel actually vary, and use its range | fail IQR <25% of available, or constant | Ruling 2026-07-26 (compute IQR occupancy before filtering) and 2026-07-21 (measure where the variance lives before choosing an axis) |

**C6 is the one that matters most**, because it is the automated form of Studio's single
most-repeated failure — *encoding a variable that barely varies*. It reports the coefficient of
variation of the mark's channel. A mark that neither changes length nor moves is drawn n times and
encodes nothing.

---

## A2. The ruler comes from the PRODUCT — a correction made the day after the gate was built

The gate shipped with Carbon's ramp (12 / 14 / 16 / 18 …) as its type scale. Run against the live
app the next morning, it flagged **13px and 15px as "off the ramp" on every surface** — and those
are the product's **own tokens**:

```
dynasty-genius-product/frontend/src/styles/tokens.css:50-52
  --dg-text-sm:   0.8125rem  = 13px      (no rem-base override, so 1rem = 16px)
  --dg-text-base: 0.9375rem  = 15px
  --dg-text-lg:   1.125rem   = 18px
```

**This is the 2026-07-25 lane-colour violation, in a new channel, inside the very instrument built
to prevent that class of error.** David's ruling that day was that consistency with the product
outranks an internal craft-tool heuristic whenever the heuristic is not a legibility failure. It
was recorded as a rule about colour. It is not about colour — **it is about every token channel**,
and a craft tool with a rival ruler is the most durable way to get it wrong, because it converts a
one-off drift into an enforced standard.

**The rule, generalised:** a gate must measure a surface against *the product's* contract, and may
only impose an outside standard where the product has none. `--scale 13,15,18` overrides it if the
tokens ever move.

**What the correction did to the finding, and it inverted it.** With the right ruler:

| | Sizes off the ramp | Content below 13px |
|---|---|---|
| **Live app**, default screen | **1** — a 24px heading | **0** |
| 006 front door (Studio) | — | **88** |
| 009 matrix (Studio) | — | **144** |
| 011 tier ladder (Studio) | **11** (9.5, 10, 10.5, 11, 11.5, 12, 13.5, 17, 19, 21, 44) | see §E |

**The app respects its own type scale. Studio's prototypes do not.** The original write-up of this
finding — "C4 fires on every surface including the app's" — was an artifact of the wrong ruler and
is withdrawn. The corrected version is sharper and points the other way: *Studio* sets content
smaller than anything the product ships, and "all the visuals are very small" (David, 2026-07-23)
is a Studio defect, not an inherited one.

**One honest caveat the correction surfaced.** C4's content/label split is "is the text inside a
repeating unit." On a page with no repeating unit — a single large chart, like 011 — there is no
basis for the split, everything falls to "label," and the finding is understated. The gate now says
so in the output rather than reporting a quiet warn.

---

## B. Four calibration bugs found by testing the gate against labelled work

The first version failed the **approved** front door 5×FAIL while the **rejected** matrix scored
1×FAIL. Every one of those was the instrument's fault, and each is a reusable lesson.

1. **`getComputedStyle(div).fill` computes to opaque black on HTML elements.** Reading it on a CSS
   mark painted every lane colour grey, and C3 passed a two-lane chart at "0 hue families." Colour
   must be read from `backgroundColor` for HTML marks and `fill` only for SVG geometry. Related:
   parse colour through a 1×1 canvas, never a regex — the app's tokens are OKLCH and Chrome
   serialises computed colour in its authored space, so `rgb()` matching silently returns null.
2. **A mark inside a clickable row is not itself a 24px target.** WCAG 2.5.8 scopes to the *target*;
   the row is the target. Interactivity must be the mark's **own**, not inherited from an ancestor.
3. **10–11px is a legitimate LABEL size.** The 009 matrix was convicted for setting *content* —
   player names, counts — at 11px 192 times. An eyebrow, a caption or a footnote at 10px is the
   ramp working as designed. Content = text inside a repeating unit.
4. **Channel inference is fooled twice.** A filled dot and a hollow ring are two *sizes* but one
   categorical style — few distinct sizes means the mark encodes by **position**, so measuring its
   length range is a category error. And one tag serving several roles (band + bar + tick) is a
   mixed population whose IQR means nothing; the gate declines the verdict rather than issuing a
   confident wrong one. Chrome — a mark constant in size *and* offset across every unit — is skipped
   entirely, because a plot frame encodes nothing by design.

**The general lesson, and it is the same one David has been enforcing on the design work:** an
instrument that has not been tested against known-good and known-bad cases is an opinion generator.
The gate's first honest act was failing its own validation.

---

## C. C1's threshold is fitted to two points — treat it accordingly

Density is marks per unit **area**, not per unit. A 214×65px matrix cell holding five marks is a
puzzle; a 1090×56px table row holding six is not. Comparing raw counts convicts the wrong one.

The warn/fail values are fitted to exactly two labelled examples — the 009 matrix cell (≈3.95,
rejected) and the 006 front-door row (≈2.13, approved). **Two points is a weak fit.** The number is
a prompt to look, never a verdict. The *mechanism* is cited (`T4-1` §7.5 — emphasis is zero-sum
within a feature map, so every added mark weakens every existing one); the *cut-point* is not.

---

## D. Validation — the gate against work whose verdict is already known

| Surface | David's verdict | Gate | Reads |
|---|---|---|---|
| 009 `matrix.html` | **REJECTED** "extremely confusing and hard to read" | 3 fail, 1 warn | density **3.95** (worst measured), 3-entry legend × 48 units = 144 lookups, 144 sub-12px content nodes, 164 marks under 9px at 5.8px spacing |
| 009 `matrix-v2.html` | **REJECTED** "extremely disproportionate… needle in a haystack" | 1 fail, 2 warn | C6 IQR **15.2%** of the 214px available, ink **4.3%** — reproduces both hand-measured figures |
| 006 `frontdoor.html` | **APPROVED** "this is awesome" | 1 fail, 2 warn | density 2.13, C6 position-encoded at 25.8% — passes |
| 004 `prototype.html` (v4) | **KEPT** "this is pretty cool" | 1 fail | density **1.60**, lowest measured |
| 008 `prototype.html` | **CLOSED**, did not land | 3 fail | flagged — but 008 failed on *domain*, not craft. Coincidence, not credit. |
| 011 `prototype.html` | direction checkpoint | 0 fail, 1 warn | mostly SKIP — it is a chart page, not a repeated-unit page (see §F) |

The ordering tracks the verdicts on the four surfaces where density was the issue. That is the
weakest form of validation there is — six examples, all Studio's own, graded by one reader — but it
is more than the previous probes ever had.

---

## D2. Run against the live app — the test that it is an instrument, not a toy

`node tools/craft-gate.mjs "http://127.0.0.1:8000/?surface=..."` works on the running product, which
matters: everything in §D is Studio marking its own homework.

- **Daily What-Changed** — player row 705×41px, density **4.15**, the highest figure measured
  anywhere including the rejected matrix. **Do not over-read this:** the calibration points are a
  chart cell and a chart row, and this is a *text table* row, where marks+text per area behaves
  differently. It says "go and look," not "this is worse than the thing David rejected."
- **Hue count exactly at the ceiling** — 5 families in the data region (amber, blue, red, green,
  cyan), which is Healey's outer bound for reliable search, not a comfortable place to sit.
- **30 failed requests on every load of the default screen** — all `/assets/headshots/*.jpg` 404s.
  This is the known briefing §5 defect, now with a number on it.
- **Roster Audit, Roster Capacity and League Pulse return "no repeating unit" and zero data marks.**
  They are text tables end to end. Consistent with the 009 finding that League Pulse renders as a
  43,634-pixel key/value dump.

**Two limitations this run exposed, both real:**
1. **C6 measures bounding boxes, so it cannot read a path-shaped mark.** Twenty sparklines with
   identical boxes classify as chrome even though the line inside each one varies. Whether those
   sparklines share a scale — the confirmed 004 N4 defect — is invisible to this gate.
2. **A surface with no marks returns mostly SKIP**, which reads like a pass and is not one. Absence
   of marks is a finding in its own right; the gate reports it but does not grade it.

---

## E. The one finding the gate produced immediately

**Restated after the §A2 ruler correction — the finding survived it and got sharper.**

**C4 fires on every surface Studio has built, approved ones included, and on none of the app's**:
144 sub-13px *content* nodes in the matrix, 88 in the front door, 55 in 004, 32 in 008 — against
**zero** on the live app's default screen. And 011, the most recent, carries **14 distinct type
sizes, 11 off the product's three tokens** (9.5, 10, 10.5, 11, 11.5, 12, 13.5, 17, 19, 21, 44),
which is precisely the failure `typography.md` §A was written against: *"picking sizes ad hoc per
surface. A scale is a specification you can violate and detect. A pile of chosen sizes is not."*

This was **not** tuned away to make Studio's approved work pass. David said *"all the visuals are
very small"* on 2026-07-23; with the product's own ruler it is now clear that is a **Studio** habit
and not one inherited from the app. Real, systematic, measurable, and mine to fix.

---

## F. What this gate cannot see — print this before trusting a green run

1. **Whether the question is worth asking.** 008 and 010 were closed after seven and six versions,
   with the craft improving every time and the outcome not. Both were well-drawn answers to
   questions David had not agreed to. **A clean gate is not a reason to build.**
2. **Whether the units are the hobby's own.** The 010 diagnosis — *"if a number on the surface is
   one no dynasty manager would ever say out loud, it will not speak"* — is invisible here.
3. **Structure.** A stray `grid-row: span 2` shifted every row of the 009 matrix by one cell and
   passed every automated probe. **The screenshot pass is not optional and is not redundant with
   this.**
4. **Whether a number is true.** Nothing here validates the data behind a mark.
5. **Pages that are not built from a repeating unit.** C1/C6 need a repeated container holding ≥2
   marks; a single large chart returns SKIP. Pass `--unit` to override, and annotate data marks with
   `data-encodes="length|position"` to make C6 exact rather than inferred.
6. **Layout at one width only.** Density is width-dependent; run it at more than one `--width`.
