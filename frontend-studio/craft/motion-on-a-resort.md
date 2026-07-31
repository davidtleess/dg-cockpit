# Motion on this product — what it is for, and what it must never touch

Studio, 2026-07-30, self-directed. Artifact: `craft/lab-003-motion.html`.
Reproduce every number here with the commands named inline.

Deepens `craft/motion-easing.md` (curated 2026-07-24), which had never been checked
against the running app. This is that check, plus the design position it forced.

---

## 1. The measurement that came first — what the app animates today

`node tools/motion-census.mjs` — ten surfaces, settled end state, 6,437 visible
elements.

| finding | value |
|---|---|
| elements carrying a live CSS transition | **0**, on every surface |
| elements running a keyframe animation | **4**, all on the front door |
| surfaces with any motion at all | **1 of 10** |

**The app is not missing a motion system. It has a good one and has not wired it up.**
`frontend/src/styles/motion.css` is Carbon-derived, cites Heer & Robertson, splits
productive from expressive, ships entrance/standard/exit curves and a
`prefers-reduced-motion` path. It defines **six** classes. A grep of the whole
frontend finds `dg-motion-*` referenced in **one** component:

```
src/what-changed/DailyWhatChanged.tsx:328   className={`dg-wc dg-motion-daily-open...`}
```

`.dg-motion-feedback`, `.dg-motion-receipt`, `.dg-motion-drawer`,
`.dg-motion-chart-stage` and — the one that matters — `.dg-motion-row-settle`,
commented *"Row sort/filter settle"*, are referenced **nowhere outside their own
definition**. That is a static fact, so "maybe it only appears in a state I did not
reach" is closed.

**Instrument honesty.** The census's first version reported zero *content* animations
on the front door and it was wrong: its shell classifier matched on class substrings,
so `[class*="shell"]` matched the app's `main.dg-shell__main` — the entire content
area — and filed all four real animations as chrome. Caught by
`node tools/motion-probe.mjs`, which exists to run the both-directions check: it
scores 92 live transitions on a page Studio knows animates, so a zero elsewhere is a
finding rather than a blind probe. Same failure family as the loading-screen and
nav-rail errors: **the instrument choosing its own population.** Fixed structurally —
`main` now always wins over an ancestor banner.

## 2. Where motion is load-bearing here, measured before it was designed

`node tools/sort-displacement.mjs --row-px 56` — the real roster, every sort the
surface offers, travel from the default order.

| group | rows held | median move | worst move | worst travel |
|---|---|---|---|---|
| QB | 5 | 1 | 3 | 168px |
| RB | 3 | 1 | 2 | 112px |
| **WR** | **12** | **2.5 – 6** | **10** | **560px** |
| TE | 3 | 1 | 2 | 112px |

Pooled: 76% of rows change position; median mover travels 2 rows; **47%** clear the
two-row bar stated *before* the reading.

**Read it honestly. 47% against a 40% threshold is not what carries this** — it is
close enough that the pooled figure alone would be a number hunting for a
conclusion. What carries it is the structure: **displacement is a function of group
size**, and only one of four groups is deep enough to lose a row in. That group is
the twelve receivers 014's own thesis is about.

**The design consequence falls out of the measurement rather than from taste:** bind
duration to travel, snapped to the app's own ladder (110 / 150 / 240 / 400ms). A
one-slot move resolves in 110ms and reads as instant; the twelve-deep reshuffle gets
400ms. One rule, and the data decides where each transition lands on it — so the
shallow groups are not a special case that has to be argued for.

## 3. The control that makes the claim falsifiable

The lab renders the same re-sort three ways on the same twelve real players, driven
by one scrubber so any frame can be inspected:

- **A · Teleport** — what ships. Rows are always on a slot, never in transit.
- **B · Cross-fade** — the common shortcut. Animated, smooth, costs exactly as long
  as C, and **worse than A**: measured at the midpoint, the brightest row is at
  **opacity 0.000**. There is no frame in which anyone can be followed.
- **C · Rows travel** — 11 of 12 rows off the row grid at the midpoint, every row at
  **opacity 1.000**.

**B is the point of the lab.** It is the control that separates *motion* from
*continuity*, and it is why "add an animation" is not the finding. Verified by
`node tools/verify-lab003.mjs` — 16/16, identical across two runs, including a rAF
frame census over a real 400ms re-sort (41 frames, worst 16.8ms, zero over budget).

## 4. The refusal — the part that stops this becoming decoration

**A row's position on screen is ordering. A mark's position inside its track is a
value.** Moving the first is navigation. Tweening the second invents data: drag the
lab's scrubber and the refused panel reads *"our 29"* — a rank the model has never
assigned Rome Odunze, held on screen for 400ms. Endpoints true, everything between
them false.

This is the app's own stated rule (*"every intermediate frame a valid data graphic"*)
and Studio's own **light the room, never the number**. It decides whether motion on
this product is craft or a defect, and it means the dumbbell dots may only ever ride
a moving row as passengers.

Also refused, for the same reason: no pulsing, no attention-seeking on a value, and
nothing animating on arrival of new data — a mark that grows into place is a
sequence of quantities nobody measured.

## 5. Reduced motion is a different device, not a shorter one

Travel is the vestibular trigger, so the substitute cannot be less travel — and it
must not be a fade, which is exactly panel B's failure. The lab's substitute: rows
are placed instantly, and **every row that moved carries a one-off marker of how far
and in which direction** (▲3 / ▼2). The information the motion was carrying — which
things changed places, and by how much — survives the removal of the movement, which
is what "substitute rather than delete" actually requires.

Verified under `reducedMotion: 'reduce'`: rows settled, no travel, 11 rows marked.

## 6. The costs, named

1. **A full reshuffle is busy mid-flight.** Nine rows cross at once and resolve by
   occlusion. The whole list is *not* readable in transit and the lab says so. What
   stays readable is the one followed row, which holds the front. That is the entire
   benefit — one player who never has to be re-found.
2. **Rows must be opaque.** Found by looking at a mid-flight screenshot *after every
   automated check had passed* — transparent rows composite, and two names render on
   top of each other as mush. Occlusion order is now declared (furthest traveller in
   front, followed row always topmost) rather than left to DOM order.
3. **The alternative was built, not imagined.** Per-row duration (equal velocity,
   different end times) is a toggle in the lab. It is more physically truthful and it
   looks worse — the list settles in pieces instead of reconfiguring as one object.
   The unified duration is the trade being accepted.
4. **No user study.** The panels demonstrate the mechanism Heer & Robertson measured;
   they do not re-measure the benefit.
5. **One roster, one day.** A deeper or shallower WR group moves the numbers.

## 7. What this does NOT become

**Not a relay.** On its own, "five of six motion classes are unwired" is a note about
dead CSS, and spending engineer credibility on that would be a bad trade. It becomes
an ask only inside a design proposal that gives the list something to re-sort — which
014 currently does not have, and which is the more interesting gap this turned up:
**standing doctrine is that views are filter+sort states over one list, and Studio's
own most recent surface shipped with no sort at all.**

---

**Tooling note, stated because it keeps being listed as open:** Playwright MCP and
Chrome DevTools MCP are still unused for real work. The frame question here was
better answered by a rAF census — deterministic, one command, reproducible — than by
a DevTools trace, and running the trace anyway to retire a checklist item would have
been tool theatre. The item stays open honestly rather than being closed falsely.
