# Studio craft library — the pull list

**Purpose.** Studio's conversation resets; a file does not. `proposals/006-state-of-franchise/dataviz-principles.md`
already proved the pattern — written once, re-read sessions later, and it changed the work. This
extends that to the rest of the craft.

**Ownership.** Studio curates this list; David deliberately does not. Tower does the fetching.
Authorised by David 2026-07-24 (standing offer, via Tower). Restated to disk 2026-07-24 after the
first reply scrolled out of view.

**Limits David set.** Nothing paywalled or pirated. **Craft only** — how a product is *built* and
*animated*, never what a product chose to prioritise.

**How to store what comes back.** One subject per file under `craft/`, distilled to *cited
principles Studio can act on* — the `dataviz-principles.md` format, not raw dumps. A 4KB file of
rules with sources beats a 400KB scrape; Studio must be able to re-read the whole library in a
session start.

---

## Tier 1 — the gaps that caused real failures

These are ranked by damage done, not by interest.

### 1. Uncertainty and distribution visualization — **highest priority**
*Why: on 2026-07-24 Studio collapsed a draft pick — an option with a fat right tail — into an
average, four separate ways (cost per hit, expected hits, value per pick, hit rate). David:
"you gotta have a serious epiphany." The tail is the value, and Studio had no vocabulary for
drawing it.*

- Hullman, Kay et al. — **hypothetical outcome plots**; "When (ish) is my bus?"
- Kay et al. — **quantile dotplots**
- Correll & Gleicher — **"Error Bars Considered Harmful"**
- Uncertainty-shading practice (already partially captured in `dataviz-principles.md` §D)
- Anything on **icon arrays / frequency framing** for probability communication
- **Fan charts, gradient/violin/ridgeline forms** — showing a distribution rather than its mean

### 2. Graphical perception — the primary sources, not Studio's secondhand citations
*Why: Studio cites Cleveland–McGill and Mackinlay constantly, from memory, and still shipped an
inverted encoding ("shorter is better") in July 2026.*

- **Cleveland & McGill 1984**, "Graphical Perception" (*JASA*)
- **Mackinlay 1986**, "Automating the Design of Graphical Presentations" (*ACM TOG*)
- **Heer & Bostock 2010**, crowdsourced replication of the effectiveness rankings
- Munzner, *Visualization Analysis and Design* — the channel-effectiveness chapter, if a free
  lecture version exists

### 3. Metric validity — when a derived number is nonsense
*Why: Studio built a hero chart on price ÷ binary-hit-rate, having already written the footnote
explaining why that metric was invalid. The failure was not the drawing; it was the arithmetic.*

- **Bergstrom & West, *Calling Bullshit*** — course materials are free; the ratio, base-rate and
  denominator sections are exactly this
- **Simpson's paradox**, base-rate neglect, normalization traps
- Guidance on **rates vs counts vs ratios**, and when a ratio hides the tail
- Anything on **selection bias in retrospective sports/outcome studies**

---

## Tier 2 — systematic craft Studio leans on but does not own

*Why: Studio reused the approved 006 visual language this session rather than re-deriving it, and
said so. That is fine once; it is not a system.*

### 4. Typography and type scale
- **Butterick, *Practical Typography*** (free online)
- **"The Elements of Typographic Style Applied to the Web"** (free)
- **Material 3** type system; **IBM Carbon** type tokens — for how a scale is *specified*

### 5. Layout, grid and spacing
- **Material 3** layout and adaptive breakpoints
- **IBM Carbon** grid
- **Every Layout** — the layout-primitive idea (free articles only)
- Modern CSS layout primitives: container queries, subgrid, intrinsic sizing

### 6. Colour and accessibility
- **APCA** and WCAG 2.x/3 contrast models — and where they disagree
- Practical **OKLCH/LCH** for building ramps (the app's tokens are already OKLCH)
- **ColorBrewer** — the *rationale*, not just the swatches
- **CVD guidance specific to charts**; forced-colors / high-contrast modes

### 7. Motion and easing
*Studio already built `007-disclosure-motion/motion-lab.html`; this deepens it.*
- **Material 3 motion** — easing and duration tokens, choreography, the "why" behind the values
- **Apple HIG** motion guidance
- **Spring vs cubic-bezier** — when each is right
- `prefers-reduced-motion` practice; the Web Animations API and CSS spec references

---

## Tier 3 — craft captures of products Studio rates

Encodings, layout and interaction only — never product strategy.

- **Baseball Savant** player pages *(David-endorsed reference, 2026-07-15)* — the percentile
  sliders, the identity-dense bio header, the raw/percentile/visual triple read
- **Stripe** docs and dashboard — density with hierarchy
- **Linear** — motion discipline and keyboard-first interaction
- **Sofascore** — live sports density on small screens
- **Sleeper** — the category's own conventions (Studio's standing "copy the category's structure"
  doctrine, 2026-07-15)
- **Vercel/Geist**, **Radix** — component-level construction

---

## Raised separately: out of scope as written, and Studio's biggest weakness

On 2026-07-24 David corrected Studio on dynasty fundamentals **four times in one session** — the
rookie-draft-vs-startup distinction, the real roster rules (IR/taxi, offseason over-limit
allowance), first-round rookie-pick value, and the recency premium on pick years. Every one was a
domain error, not a craft error, and each cost a rebuilt surface.

That is **subject-matter fluency, not craft**, so it sits outside the brief as written. Studio
flagged it rather than smuggling it in. If David rules it in scope, the useful pulls are:

- Empirical **dynasty rookie-pick outcome studies** with stated methodology and sample size
  (the NBC Sports/Rotoworld n=504 study is the current best; **StatChasers' rookie hit-rate
  explorer** blocked automated fetching and would be the single most useful item on this whole page)
- **NFL draft capital → fantasy production** research
- The **dynasty trade calendar** — seasonal value cycles for picks and for veterans
- Public **historical rookie-draft ADP and outcome datasets** (nflverse and similar), which would let
  Studio derive distributions itself from one source instead of citing two that cannot be fused

**Studio's own note:** item 1 of Tier 1 and the last bullet above are the same problem from two
directions. A single dataset Studio can compute on would solve the fat-tail question outright,
because the reason the tail is currently stranded in prose is that the two available sources use
different definitions and cannot honestly be stacked into one mark.

---

---

## Tier 4 — the second pull list, curated 2026-07-25

*Ranked by damage done today, not by interest. Every item traces to a specific failure on the record.*

### 1. Preattentive processing and visual search — **highest priority**
*Why: David's standing demand is "I'll recognize the anomalies and outliers — I just need the mechanism
and design so I can SEE it." On 2026-07-25 Studio shipped a 48-cell grid in which nothing popped, and
then a second one where the fix was found by intuition rather than by method. "Will he see it" is
literally a visual-search question and Studio owns zero sources on it.*

- Which channels are **preattentive** (pop out in constant time) versus which force **serial search**
- How **set size** and **distractor similarity** change search time — the maths behind "48 cells is too
  many to scan"
- **Feature integration** and how many channels can be combined before pop-out collapses
- **Change blindness** — what a reader misses between two states of the same display
- Healey & Enns' perception-for-visualization survey and Treisman's feature-integration work are the
  canonical free entry points

### 2. Matrix and small-multiple displays, and the discipline of REORDERING
*Why: Studio has now built a 12×4 team-by-position matrix twice and failed twice. Reordering rows and
columns so structure emerges is a stable, non-editorial rule — it makes the interesting cell visible
without Studio flagging anything, which is exactly the constraint David has set.*

- **Bertin, the reorderable matrix / permutation matrix** — the origin of matrix-as-instrument and of
  "the image" that can be taken in at one glance
- **Seriation and matrix reordering** algorithms and their rationale
- **Small multiples / trellis display** — Tufte's formulation and Cleveland's trellis work
- When a matrix beats a scatter, and when it is just a table with paint on it

### 3. Progressive disclosure at scale — the formal version
*Why: every surface Studio builds has a collapsed state and an expanded state, and Studio has been
deciding the split by feel. There is a canon here and Studio has never cited it.*

- **Shneiderman's visual information-seeking mantra** — overview first, zoom and filter, details on
  demand — and the task taxonomy behind it
- **Focus + context** techniques, and honest guidance on when they hurt
- What belongs in a **tooltip** versus on the surface versus behind an expansion

### 4. Density budgeting and layered reading
*Why: Studio's failure mode is putting everything at one level. The rejected grid carried 265 marks and
192 numbers with no answer to "what reads first."*

- **Layering and separation**, data density, and the "smallest effective difference" as working method
- Practical technique for designing a display that answers at a **glance**, at a **scan**, and at a
  **study** — three reading distances, deliberately
- Anything that gives a *pre-flight budget* (marks per cell, elements per screen) rather than a
  post-hoc critique

**PARTLY DISCHARGED 2026-07-28 — Studio built the pre-flight budget rather than waiting for a fetch,
because no published source measures a Studio prototype.** `tools/craft-gate.mjs` + `craft/T4-2-density-gate.md`:
six checks (density per unit area, legend re-application load, hue count, sub-ramp content type,
hit-target size, and whether the dominant mark's channel actually varies), validated against six
prototypes whose verdicts David has already given. **Still wanted from this item:** the layered-reading
canon — glance / scan / study as a deliberate three-distance design method — which the gate does not
touch and Studio still does by feel.

---

**Still unruled, and Studio is re-raising it once because David asked:** dynasty subject-matter fluency
(empirical rookie-pick outcome studies, draft-capital-to-production research, the trade calendar,
public historical datasets Studio could compute on directly). It sits outside "craft only" as written.
It also caused more rejected work than any craft gap — the 008 thread died of domain error, not of
drawing. **David's call, and a "no" is a fine answer; it does not need revisiting again.**

---

## Tier 5 — DYNASTY DOMAIN FLUENCY (approved by David 2026-07-25: *"i agree - domaine fluency is fine"*)

*Studio curates; Tower fetches. Craft-library limits still apply — nothing paywalled or pirated, and
never another product's priorities. Domain knowledge is the game itself, not anyone's doctrine.*

Ranked by damage done. Every item traces to a specific rejected piece of work.

### 1. Public historical datasets Studio can COMPUTE on — **highest priority by far**
*Why: this is the item that converts Studio from a citer of two incompatible studies into a measurer.
On 2026-07-24 the fat tail of a draft pick was stranded in prose precisely because the two available
sources defined "hit" differently and could not honestly be fused into one mark.*

- **nflverse** (`nflreadr` / `nflfastR` / `nfl_data_py`) — player-season stats, NFL draft data, rosters,
  snap counts, participation. Open data, documented schema.
- Open **historical dynasty/rookie ADP** series, if any exist without a licence
- Anything that lets Studio derive an **outcome distribution** first-hand rather than quoting a mean

### 2. Replacement level and positional scarcity — the actual methodology
*Why: on 2026-07-25 Studio hand-rolled a replaceability measure, ranked on `gain − cost`, and it came
out a **constant** (910, 910, 910) because it was measuring a team-pair difference rather than anything
about the player. Studio caught it before drawing, but only just. There is established methodology here
and Studio was improvising.*

- **VOR / VORP** in fantasy football: how replacement level is properly defined for a given roster
  format and league size, and the competing conventions
- **Positional scarcity** and why the baseline choice changes every downstream ranking
- Marginal-value / opportunity-cost framing for lineup slots (FLEX and SUPER_FLEX especially)

### 3. Superflex-specific positional value
*Why: this league is 12-team superflex and Studio has been reasoning with generic 1QB intuitions. It is
also live to relay 004's still-open N0 position-skew question — whether our model mis-prices QBs or the
ranking pool does.*

- How the second-QB requirement **reprices quarterbacks** against 1QB formats, with numbers
- Positional value curves for **2QB / superflex**, and how deep the startable QB pool really runs

### 4. Trade structure: the consolidation premium and how calculators mislead
*Why: Studio has been treating market values as **additive**, which is exactly wrong for the
many-good-pieces-into-one-great-piece move that David's roster shape implies. On 2026-07-25 Studio
measured "no gains from trade" using additive lineup value and David immediately supplied the mechanism
the test could not see.*

- The **consolidation premium** / 2-for-1 discount: why the best player in a package is worth more than
  the sum of its parts, quantified if anyone has
- How dynasty **trade calculators are constructed**, and their documented systematic biases
- **Replaceability as the driver of what actually gets traded** — David's own 2026-07-25 refinement:
  a starter with a satisfactory backfill is more available than a bench player
- The **seasonal trade calendar** — when picks are cheap, when veterans peak

### 5. Empirical rookie-pick outcome distributions
*Why: the 008 thread died partly on this. Studio needs the distribution, not the mean.*

- Hit-rate-by-slot-and-round studies with **stated methodology, sample size, era and scoring format**
- The NBC Sports/Rotoworld n=504 study (2010–17, 12-team PPR) is the current best single source;
  **StatChasers' rookie hit-rate explorer blocked automated fetching** and would still be the single
  most useful item on this page

### 6. Aging curves by position, methodologically stated
*Why: Studio drew a production window as a straight line, conceded to David that it was misleading, and
then rebuilt it from blog-post priors (4for4, Dynasty Edge, Fantasy Points) with no sample sizes.*

- Position-by-position aging curves with **sample size and method disclosed**
- How **survivorship bias** distorts naive aging curves, and the corrections used against it

## Tier 6 — HOW AN AI AGENT BUILDS FRONT-ENDS (requested by David 2026-07-28)

David, at close: *"i would be curious if there are things in your craft set that talk about how to
build front-ends as an AI agent - things like design templates or tools - connectors, etc."*

**Studio's honest audit of its own craft set, in answer: there is nothing of this kind in it.** All
twelve files in `craft/` are *principles and critique* — how to judge an encoding, a type scale, a
colour pair, a density. Tier 5 is domain knowledge. **Zero of it is build infrastructure**, and the
one tool Studio owns (`tools/craft-gate.mjs`) it wrote itself, in one evening, and has already caught
misreporting twice.

**Why this gap costs more for an agent than it would for a human designer.** Three failure modes, all
evidenced tonight:

1. **Studio re-derives every primitive from scratch, every surface.** Tonight it hand-built a tooltip,
   a chip, a pill filter, a sortable table, a bar with a track, an interval whisker with end caps, a
   dodged timeline and a hatch pattern — in raw CSS, from nothing. 011 did the same and arrived at
   **14 type sizes**; 012 began by repeating that. A human reaches for a kit; Studio retypes the kit,
   badly, and reintroduces bugs it has already fixed once (the hard-coded dodge constant, the label
   that overflowed its column, the axis label that collided).
2. **Studio cannot see well, so it must measure.** The screenshot pass keeps catching what DOM probes
   cannot (a `grid-row: span 2` that shifted every row; a mark overlapping a rail). Tooling that
   *measures* is therefore worth disproportionately more to an agent than tooling that *shows* — which
   is exactly why the density gate paid for itself in one day, and exactly why its two failures
   (convicting chrome, losing marks that gained a gradient) matter so much.
3. **Studio has no persistent component memory across surfaces.** Every prototype starts from an empty
   `<style>`. That is why the same defects recur and why consistency with the product had to be
   rediscovered by measurement tonight rather than being structurally impossible to get wrong.

**The pull list, in priority order. Studio curates; Tower fetches; David does not.**

### 1. A Studio component kit — **highest priority by far**
*Not a reference to read: a file to import.* One `studio-kit.css` + a tiny JS module holding the
primitives Studio rebuilds every time — surface, row, chip, pill filter, sortable table head, tooltip,
bar-with-track, interval mark, unit-chart cell, hatch-for-missing-data, focus ring. **Built from the
product's own tokens verbatim**, so consistency is structural rather than something Studio has to
remember. This alone would have prevented most of tonight's rework.

### 2. Headless accessible primitives (Radix UI, React Aria / ARIA Authoring Practices)
*Why: Studio has now shipped WCAG 2.5.8 target-size failures on two consecutive surfaces and reasoned
its way to an exception each time.* Headless libraries encode focus management, roving tabindex,
listbox/dialog/tooltip semantics and hit-target conventions that Studio currently re-derives per
surface. Even if the product hand-writes its CSS, **the behaviour spec is the transferable part.**

### 3. A charting substrate, and the argument for and against one
*Why: every mark on 012 is an absolutely-positioned `<div>` whose x is computed by hand — which is the
direct cause of the dodge bug, the overflow bug and the collision bug.* Wanted: **Observable Plot** and
**Visx** (scale/axis/shape primitives without a chart-template straitjacket), plus the honest
counter-case for staying hand-rolled given the product ships **no charting dependency at all**. The
decision matters more than the library.

### 4. Design-token tooling and the token-contract discipline
*Why: the 2026-07-25 lane-colour drift, the 2026-07-28 rival-ruler error, and tonight's 138-gradient
divergence are all one failure — a surface authoring values the product does not own.* Wanted: Style
Dictionary / Tokens Studio, and the practice of **generating** a prototype's token block from the
product's `tokens.css` rather than transcribing it.

### 5. Visual regression and screenshot diffing as a standing harness
*Why: Studio's checks are all written fresh per surface, and its own gate silently changed what it was
counting.* Wanted: Playwright's `toHaveScreenshot` workflow, perceptual diffing, and — critically —
**how to test a measuring instrument against labelled known-good and known-bad cases**, which is the
discipline the gate is missing. (The product ships a visual-craft audit with a baseline; Studio has
**deliberately not read it** under the fresh-eyes covenant.)

### 6. Connectors worth having, assessed not assumed
Figma MCP (design-file → tokens/specs), and any local-first component-inspection tooling. **Studio's
honest view: connectors rank below items 1–3.** The bottleneck is not access to more design input; it
is that Studio rebuilds primitives from nothing and cannot see its own output well.

### 7. The literature on AI-agent front-end practice, if it exists
Studio does not know that a serious body of work here exists, and would rather be told it does not
than be handed blog posts. **If the honest answer is "nobody has written this down yet," that is worth
knowing** — it would make items 1–5 Studio's own to author rather than to fetch.

## Status

| Tier | State |
|---|---|
| 1 — uncertainty, perception, metric validity | **landed 2026-07-24**, in use |
| 2 — type, layout, colour, motion | **landed 2026-07-24**, and they diagnosed the 2026-07-25 grid failure |
| 3 — craft captures | queued, still wanted but lower priority than Tier 4 |
| **4 — visual search, matrices, disclosure, density** | **requested 2026-07-25** |
| **5 — dynasty domain fluency** | **APPROVED by David 2026-07-25; list curated, Tower fetching** |
| **6 — how an agent builds front-ends** | **REQUESTED by David 2026-07-28; list curated, nothing fetched.** Items 1–2 are things Studio could largely *author* rather than fetch. |
