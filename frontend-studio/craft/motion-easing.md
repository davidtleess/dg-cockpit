# Motion and easing — tokens, not vibes

Pulled 2026-07-24 (Tower) against Tier 2 §7 of `CRAFT-LIBRARY.md`, which deepens
`007-disclosure-motion/motion-lab.html`. Sources free: Material 3 and IBM Carbon publish their motion
**token values** in open-source repos (Apache-2.0) — the numbers below are read from source, because
both rendered doc sites are JS-only and do not serve their tables to a fetch. Plus MDN, the Chrome
CSS docs, and the W3C Understanding documents.

**One source failed and is not cited:** Apple's HIG *Motion* page is client-rendered and returned no
content to any fetch route tried. Nothing in this file is attributed to Apple. If the HIG matters
later it needs a human read.

## A. Easing is a small closed set of named curves — here they are, exactly

*Material 3 `md-sys-motion` tokens, v0.192 (material-web, Apache-2.0).*

| Token | Curve |
|---|---|
| `easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `easing-standard-decelerate` | `cubic-bezier(0, 0, 0, 1)` |
| `easing-standard-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` |
| `easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` |
| `easing-emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` |
| `easing-emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` |
| `easing-legacy` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `easing-linear` | `cubic-bezier(0, 0, 1, 1)` |

*IBM Carbon `@carbon/motion` (Apache-2.0)* — same idea, organised as **event × mode**:

| Event | productive | expressive |
|---|---|---|
| standard | `cubic-bezier(0.2, 0, 0.38, 0.9)` | `cubic-bezier(0.4, 0.14, 0.3, 1)` |
| entrance | `cubic-bezier(0, 0, 0.38, 0.9)` | `cubic-bezier(0, 0, 0.3, 1)` |
| exit | `cubic-bezier(0.2, 0, 1, 0.9)` | `cubic-bezier(0.4, 0.14, 1, 1)` |

**Read the control points and the rule falls out:**

- **Entrance / decelerate** curves start at `x₁ = 0` — no initial ease-in. The element is already
  moving when it appears and **settles** into place.
- **Exit / accelerate** curves end at `x₂ = 1` — the element **leaves at speed** and is not eased
  into its own disappearance.
- **Standard** curves are eased at both ends, for elements that move *within* the view.

**Do:** every transition declares which of the three events it is, and takes the matching curve from
the token set. **Rules out:** `ease-in-out` (or bare `ease`) applied to everything. That is the
standard curve used for all three events, so entrances feel sluggish to start and exits linger — the
single most common reason a UI reads as "slow" while every duration is nominally short.

## B. Duration is a ladder, and the rungs exist so you can express proportion

*Material 3 `md-sys-motion` duration tokens (source):* `short1–4` = **50, 100, 150, 200ms**;
`medium1–4` = **250, 300, 350, 400ms**; `long1–4` = **450, 500, 550, 600ms**;
`extra-long1–4` = **700, 800, 900, 1000ms**.

*Carbon `@carbon/motion` durations (source):* `fast-01` **70ms**, `fast-02` **110ms**,
`moderate-01` **150ms**, `moderate-02` **240ms**, `slow-01` **400ms**, `slow-02` **700ms**.

Two things worth noticing. First, **the working range for product UI is 70–400ms**; everything above
`long` is for full-screen or hero motion, and both systems put most of their resolution below 400ms.
Second, Material's rungs are 50ms apart *on purpose* — the granularity exists so that duration can
scale with the distance travelled, which is Material's stated principle on
`m3.material.io/styles/motion/easing-and-duration`: **larger movement, longer duration.**
(That page is JS-rendered; the principle is quoted from its indexed summary, not a direct fetch.)

**Do:** bind duration to travel distance and element size, from the ladder.
**Rules out:** one global `--transition: 200ms` for a chip, a panel and a full-screen sheet. Same
time over three very different distances means three different velocities, which is why the big one
looks frantic and the small one looks laggy.

## C. Carbon's productive/expressive split is the rule a dense product surface needs

Carbon ships **two curve families for the same event**: *productive* for repeated, task-focused
motion and *expressive* for moments meant to be noticed. Compare `standard`:
productive `(0.2, 0, 0.38, 0.9)` is tighter and lands sooner; expressive `(0.4, 0.14, 0.3, 1)` has a
slower start and a longer, softer settle.

Material draws the same line with `standard` vs `emphasized`, reserving emphasized for prominent
moments rather than everyday interaction.

**Do:** classify every animation before choosing a curve. A table row expanding, a value updating, a
tooltip appearing — things the user will see **hundreds of times** — are *productive*: short
duration, tight curve. A first reveal of a new surface can be *expressive*.
**Rules out:** expressive/emphasized easing on repeating motion. A flourish is charming once and
attritional at the fiftieth repetition, and this is a taste failure with a token-level fix.

## D. Cubic-bezier cannot do springs — and `linear()` can

*Chrome for Developers, "Create complex animation curves in CSS with the linear() easing function",
developer.chrome.com/docs/css-ui/css-linear-easing-function; MDN `<easing-function>`.*

A cubic-bezier is a cubic polynomial with four control points. **Bounce and overshoot are not cubic
curves**, so no cubic-bezier can express them — not approximately, at all. `linear()` sidesteps this
by interpolating between an arbitrary list of stops:

```css
/* a spring sampled into stops; positions optional, otherwise equidistant */
animation-timing-function: linear(0, 0.25 25% 75%, 1);
```

You sample a real spring equation (mass, stiffness, damping) into dozens of points and hand the
result to `linear()` — true spring motion, in CSS, no runtime JS. Chrome DevTools 114+ edits these
visually. The trade is precision for expressiveness: doubling the stop count is usually enough for
smoothness.

**When a spring is actually right** (and when it is not): reach for a spring when the motion must
stay attached to a gesture, **survive interruption, or preserve velocity**. Use cubic-bezier for
discrete state changes with a defined start and end. **Rules out:** springing colour or opacity —
overshoot on a non-spatial property has nothing to overshoot *into*, and it just reads as a flicker.

## E. Interruption is the hard problem — prefer transitions to keyframes

There is no guarantee an element completes its animation; the state can change halfway. **CSS
transitions interrupt gracefully** (they re-target from the current computed value); keyframe
animations restart or fight.

**Do:** drive motion from state (`transition` on a class/attribute change) rather than firing
keyframe animations imperatively, anywhere the underlying value can change mid-flight — live scores,
streaming values, a chart re-rendering on new data.
**Rules out:** a keyframed "count-up" or "flash" on a value that updates on a poll. Two updates
inside the animation window and the user sees a stutter or a stale number.

## F. `prefers-reduced-motion` — substitute, do not delete

*MDN, `@media (prefers-reduced-motion)`.*

The signal is an **accessibility need, not a taste preference**: "animations such as scaling or
panning large objects can be vestibular motion triggers." MDN's own worked example does not remove
the animation — it **replaces a scale-pulse with an opacity dissolve**, keeping the feedback and
dropping the travel.

```css
.row { transition: transform var(--dur-fast-02) var(--ease-standard-productive); }

@media (prefers-reduced-motion: reduce) {
  .row { transition: opacity var(--dur-fast-01) linear; transform: none; }
}
```

**Do:** default to full motion, then define a reduce path per pattern that preserves the *information*
the motion carried (that something changed, and which thing) while removing translation, scale and
parallax.
**Rules out:** the blanket `@media (prefers-reduced-motion: reduce) { *, *::before, *::after {
animation: none !important; transition: none !important; } }` snippet. It is the common shortcut and
it silently deletes state-change feedback for exactly the users least able to reconstruct it — and
it is a stronger response than the criterion asks for.

## G. Two success criteria that apply directly to a live data surface

*W3C Understanding SC 2.3.3 and SC 2.2.2, w3.org/WAI/WCAG22/Understanding/.*

- **SC 2.3.3 Animation from Interactions (AAA):** "Motion animation triggered by interaction can be
  disabled, unless the animation is essential to the functionality or the information being
  conveyed." Parallax and decorative transitions must be switchable off; motion that *is* the
  information is exempt.
- **SC 2.2.2 Pause, Stop, Hide (A):** applies to animation the page starts **automatically**, not in
  response to user action — moving or **auto-updating** content that runs more than five seconds must
  be pausable, stoppable, or hideable.

**The one that bites this product:** a live-updating ticker or an auto-refreshing table is
auto-updating content under 2.2.2. It needs a pause affordance, and 2.2.2 is a **Level A**
criterion — the floor, not an aspiration. **Rules out:** an always-on live feed with no way to
freeze it while reading.

## H. The load-bearing takeaway

**Motion is four tokens and one classification, decided before any CSS is written:** which event
(entrance / standard / exit), which register (productive or expressive), which duration rung — chosen
from travel distance, not habit — and what the reduce-motion substitute is. Both Material and Carbon
converge on the same structure from different starting points, which is the strongest available
evidence that the structure, not the specific curves, is the thing to copy. A UI that feels wrong
almost never has the wrong *curve*; it has one curve doing three jobs.
