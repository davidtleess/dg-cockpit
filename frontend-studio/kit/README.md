# studio-kit

The primitives Studio rebuilds on every surface, plus the checkers that prove they hold.

Built 2026-07-28 on David's word: *"build the component kit yourself."*

```
kit/
  build-tokens.mjs        GENERATES the token block from the product's tokens.css
  studio-kit.tokens.css   generated — do not hand-edit
  studio-kit.tokens.json  the manifest the checkers read their rules from
  studio-kit.css          the primitives
  studio-kit.js           the behaviours
  fixtures.html           labelled good AND bad specimens
  verify.mjs              asserts every checker reproduces its label, both directions
  ADOPTIONS.md            what was taken from outside, and why it beat the alternative
```

## Use it

```html
<link rel="stylesheet" href="../../kit/studio-kit.tokens.css">
<link rel="stylesheet" href="../../kit/studio-kit.css">
<body class="sk"> … </body>
<script type="module">
  import { tip, sortableTable, stagger, dodge, bar, absent, fmt } from '../../kit/studio-kit.js';
</script>
```

```bash
node kit/build-tokens.mjs            # regenerate tokens from the product
node kit/build-tokens.mjs --check    # fail loudly if they have drifted
node kit/verify.mjs                  # run the checkers against the fixtures
node kit/verify.mjs <surface.html>   # …and then over a real surface
```

## Why it exists

Studio hand-rebuilds a tooltip, a chip, a sortable table, a bar-with-track, an interval mark and a
hatch pattern on every prototype, from an empty `<style>`. 011 arrived at **fourteen type sizes**
that way; 012 began by repeating it. Every hand-roll is a chance to reintroduce a bug already fixed
once — a dodge rule keyed to a magic constant, a value label that overflowed its column, an axis
annotation that collided with a row name.

**The kit carries no aesthetic of its own.** Every colour, type step and space step comes from
`studio-kit.tokens.css`, which is *generated* from the product. If the kit looks like anything, that
something is Dynasty Genius.

## What it makes structural

Each of these was bought with a rejection, and each is now a property of the code rather than a
judgement call made per surface:

| Rule | Where it came from | How the kit enforces it |
|---|---|---|
| ≥24px hit targets on small marks | WCAG 2.5.8 — **shipped as a failure on two consecutive surfaces**, reasoned past both times | `.sk-mark::after` expands the *target*; the *visual* mark stays countable |
| No content below the product's 13px floor | the 009 matrix: 192 numbers set at label size | `type` checker, floor read from the product's own tokens |
| One visual + one number, never two numbers | David, 2026-07-22 | `.sk-bar` puts the figure in its own cell; `.sk-figure` is the single readout |
| Absence is hatched, never blank | 2026-07-28: *"never traded in four seasons"* against a manager who had been there two | `absent()` — a blank stretch reads as inactivity, a different claim |
| A reference line labels itself, on the graphic | 2026-07-26 hover ruling; a header is a key | `.sk-refline` ships with `.sk-refline-label` |
| Green/red on rank movement ONLY | 2026-07-15 escalation ruling | `fmt.rankMove()` is the only coloured helper |
| Lane hues are constitutional | 2026-07-25 | `.sk-dumbbell-dot[data-lane]` reads them from the generated tokens, plus a CVD shape cue |
| No gradients, no elevation shadows | measured 2026-07-28: the product renders **zero of either**; a prototype had 138 and 8 | `vocab` checker; hatch patterns exempt because they encode missing data |
| One motion curve per event, reduced-motion **substitutes** | `craft/motion-easing.md`, curated and never applied until tonight | `--sk-ease-in/move/out`; the reduce path removes travel, not feedback |

## The checkers are tested in both directions

This is the part that makes the kit trustworthy in a way its predecessor was not. On 2026-07-28 the
density gate scored an **approved** surface at 5 FAIL and a **rejected** one at 1 FAIL — backwards —
because it had never met a case whose verdict was known. The same night it reported a check *passing*
that had failed all evening, because marks that gained a gradient dropped out of the population it
counted.

So every checker must clear a known-good **and** convict a known-bad:

```
[ ok ] hit     expected pass got pass   kit marks              5 targets, 0 under 24px
[ ok ] hit     expected fail got fail   hand-rolled marks      5 targets, 5 under 24px
…
10 agreed, 0 disagreed
TRUSTED (convicted a known-bad AND cleared a known-good): hit, type, legend, vocab
ONE-SIDED (no bad specimen yet — verdicts are provisional): census, chrome
```

A checker with no bad specimen is reported **ONE-SIDED** and its verdicts are labelled provisional.
One that fails its own specimen is **SUPPRESSED** and does not get to speak about real surfaces.

## Its first real reading

Run against `proposals/012-league-pulse/prototype.html`, the surface built the night before the kit:

```
[FAIL] hit     118 targets, 110 under 24px
[ ok ] type    0 content nodes below 13px
[ ok ] legend  0 legend blocks
[ ok ] vocab   0 non-hatch gradients, 0 elevation shadows, off-scale radii []
```

That `hit` failure is the finding Studio spent an entire evening reasoning past. It is now a hard
fail from a checker proven in both directions — which is the whole point.

## Honest state

- **Seven checkers; five trusted, two one-sided.** `census` and `chrome` need bad specimens.
- **`semantics` reads the aria tree**, adopted from Playwright MCP's technique without installing
  anything. It is a different sense from the rest: `hit` asks whether a target can be pressed,
  `semantics` asks whether pressing it means anything. It found an unlabelled `<select>` on 012
  within an hour of existing.
- **No screenshot diffing yet.** Visual regressions are still caught by eye, and the eye pass has
  caught four defects no DOM probe could see — it is not optional and not redundant.
- **Nothing has been retrofitted.** 012 predates the kit and does not declare mark roles, which is
  why `census` and `chrome` read zero over it.
- **`d3-scale` is decided but not installed** (see `ADOPTIONS.md` A2).
- **NOTHING RUNS.** These are two scripts invoked by hand. No process, no watcher.
- **NO SURFACE USES THE KIT.** 012 predates it; 1 of 8 JS exports has ever executed. Until a real
  board is built out of these pieces, the kit is a claim.
- **The outward search has BEGUN, not finished** — two searches on 2026-07-28.
