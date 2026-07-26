# Layout, grid and spacing — primitives before breakpoints

Pulled 2026-07-24 (Tower) against Tier 2 §5 of `CRAFT-LIBRARY.md`. Sources: MDN (CC-BY-SA), the CSS
specs, Material 3 / Android adaptive docs, and IBM Carbon's open-source grid and layout packages
(Apache-2.0 — the token values below are read from source, not from the rendered doc pages).
**Every Layout note:** the *Rudiments* and several layout chapters are free; **"The Grid" chapter is
paywalled**, so §F uses the free MDN documentation of the same technique instead.

Written against two failure modes: **label collisions** and **components that only work at the width
they were designed at.**

## A. The component's container is the thing that changed — query it, not the viewport

*MDN, "CSS container queries", developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries.*

```css
.panel { container: card / inline-size; }        /* name / type */

@container card (width > 40rem) {
  .stat { grid-template-columns: 2fr 1fr; }
}
.stat h2 { font-size: max(1rem, 0.9rem + 2cqi); }  /* cqi = 1% of container inline size */
```

- `container-type: inline-size` is the default choice — it applies layout, style and inline-size
  containment. `size` requires both dimensions to be containable and is rarely what you want.
- Units: `cqw cqh cqi cqb cqmin cqmax`. `cqi` (1% of the container's inline size) is the workhorse.
- **The limitation that bites:** *a container cannot query itself.* Queries apply only to
  descendants. So the element you style is always one level inside the element you measure.
  Plan for the extra wrapper before you discover it.

**Do:** any component that appears in more than one column width — a stat tile, a player card, a
trade row — declares its own container and adapts on its own measurements.
**Rules out:** a media query used to fix a component. A viewport breakpoint says nothing about how
wide *this instance* is; the same card in a sidebar and in a full-width panel gets the same wrong
answer. Media queries are for *page shell* decisions only (§D).

## B. Layout primitives, not layouts — the Every Layout thesis

*Every Layout, free chapters: every-layout.dev/rudiments/axioms, /layouts/ (index), /layouts/switcher.*

The claim: you are "writing programs for generating visual artifacts", so layout should be a small
set of named, composable primitives with one job each, applied as **axioms with exceptions** rather
than per-component decisions. The catalogue:

**Stack** (vertical rhythm between siblings) · **Box** (padding + containment) · **Center**
(horizontal centring with a measure) · **Cluster** (wrapping row of unequal chips, "laid out like
words in a paragraph") · **Sidebar** (two panes that collapse to stacked) · **Switcher** (n columns
→ n rows at a content threshold) · **Cover** (dominant centre, optional header/footer) ·
**Grid** (equal cells) · **Frame** (fixed aspect ratio) · **Reel** (horizontally scrolling row) ·
**Imposter** (overlay) · **Icon** (icon sized and aligned to its adjacent text).

**Do:** name your primitives and build surfaces by composing them. A dense sports surface is
overwhelmingly Stack + Cluster + Sidebar + Reel; almost nothing needs a bespoke layout.
**Rules out:** margins declared on components. A component should not know what is above it —
spacing between siblings belongs to the Stack, i.e. the parent's `gap`.

## C. The Switcher — an intrinsic breakpoint with no breakpoint

*every-layout.dev/layouts/switcher (free chapter).*

```css
.switcher { display: flex; flex-wrap: wrap; gap: 1rem; --threshold: 30rem; }
.switcher > * { flex-grow: 1; flex-basis: calc((var(--threshold) - 100%) * 999); }
```

When the container exceeds the threshold the calc goes negative, CSS discards the invalid
`flex-basis`, and `flex-grow: 1` shares the row. When it is narrower the value becomes enormous and
each child claims its own line. One rule, two states, no query — the chapter calls this a *quantum
layout*. Pair with a quantity query to force the vertical state at **five or more children**.

**Why keep it now that container queries ship:** it needs no wrapper, no container declaration, and
no named container — so it is the cheapest correct answer for the 80% case of "two or three panes
that should stack when cramped".

## D. Viewport breakpoints are for the *shell*, and there are five of them

*Material 3 / Android window size classes,
developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes.*

| Width class | Range | Implication |
|---|---|---|
| Compact | < 600dp | single column |
| Medium | 600–839dp | two panes become viable |
| Expanded | 840–1199dp | multi-pane |
| Large | 1200–1599dp | multi-pane, more content areas |
| Extra-large | ≥ 1600dp | desktop; optimise for the extra space |

Height classes: Compact < 480dp, Medium 480–899dp, Expanded ≥ 900dp. **The non-obvious rule:**
*compact height forbids two panes even at medium width* — a phone or foldable in landscape is wide
and short, and a two-pane layout there is worse than one column.

**Rules out:** treating "wide" as "roomy". Width and height classes are independent tests.

## E. Spacing is a token set on an 8px basis, and the ramp is not linear

*IBM Carbon, `@carbon/layout` spacing tokens (Apache-2.0) and `@carbon/grid/scss/_config.scss`.*

`spacing-01…13` = **2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160** px
(0.125 / 0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 2.5 / 3 / 4 / 5 / 6 / 10 rem).

Read the shape: **fine at the bottom (2/4/8/12/16), coarse at the top.** Dense UI spends its whole
budget in tokens 01–05, which is exactly where the ramp gives you resolution.

The 16-column grid, from source: gutter **32px** (condensed **1px**), and breakpoints
`sm 320px / 4 col / 0 margin`, `md 672px / 8 col / 16px`, `lg 1056px / 16 col / 16px`,
`xlg 1312px / 16 col / 16px`, `max 1584px / 16 col / 24px`.

**Do:** every gap, pad and inset comes from the token set. **Rules out:** `padding: 10px` — 10 is not
on the ramp, and one off-ramp value is how a spacing system stops being checkable. Also rules out
"just add a bit of margin here": the fix is a different token, or a different primitive.

## F. Intrinsic sizing — the responsive grid that needs no breakpoints

*MDN, `grid-template-columns`, `minmax()`, `min()`; CSS Grid Level 1. (Every Layout's Grid chapter
covers the same technique but is paid — this is the free equivalent.)*

```css
.grid {
  display: grid;
  gap: var(--space-05);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
}
```

- `auto-fit` + `minmax` = the column count is derived from available space, not declared.
- **`min(100%, 18rem)` is not optional.** A bare `minmax(18rem, 1fr)` **overflows** any container
  narrower than 18rem, because the track floor is absolute. This single omission is a recurring
  source of horizontal scroll on small screens.
- `auto-fit` collapses empty tracks (stretching real items); `auto-fill` keeps them. For a variable
  number of cards, `auto-fit`.

**Rules out:** a fixed 12-column grid with per-breakpoint span classes for card collections. Spans
are right for the *page shell*, wrong for a collection whose length is data-dependent.

## G. Subgrid — the fix for ragged card internals

*MDN, "Subgrid", developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid.*

A nested grid normally invents its own tracks, so three cards in a row each align their internals to
themselves — headers, values and footers land at three different heights. `grid-template-rows:
subgrid` makes the child adopt the parent's tracks, so **every card's label row, value row and
footnote row line up across the row**. Parent `gap` and named lines are inherited; the child may add
its own line names, and may override `row-gap`.

**Do:** for any repeated card/tile with more than one internal band, put the collection on a grid and
let each card subgrid its rows.
**Rules out:** fixed heights on card sections to force alignment — the technique that produces
clipped text the moment a string gets longer (see `typography.md` §G).

## H. The automatic minimum size — the real cause of most overflow bugs

*CSS Flexbox Level 1 §4.5 and CSS Grid Level 1: a flex item's and grid item's `min-width`/
`min-height` compute to **`auto`**, meaning "do not shrink below your content's minimum size".*

A long, unbroken string — a player name, a URL, a wide table — therefore forces its track *wider than
its share*, pushing siblings out and producing overflow or collision rather than wrapping.

**The fix, and it is a one-liner:** `min-width: 0` (or `min-inline-size: 0`) on the flex/grid child
that contains the text, plus `overflow-wrap: anywhere` where words can be arbitrarily long.

**Do:** treat `min-width: 0` as part of the definition of any text-bearing flex/grid child.
**Rules out:** diagnosing this as a text bug. It is a sizing default, it is spec-mandated, and no
amount of font or padding tuning reaches it.

## I. The load-bearing takeaway

**Breakpoints describe the window; primitives describe the component.** Every layout defect in a
dense product surface is one of three things: a component asking the viewport a question only its
container can answer (§A), a spacing value that is not on the ramp (§E), or a child that could not
shrink because nobody set `min-width: 0` (§H). Ship the three checks and the class of bug closes.
