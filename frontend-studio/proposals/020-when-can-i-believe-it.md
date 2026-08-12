# 020 — When can I believe it

**Status: REJECTED by David, 2026-08-09. Not iterated, not relayed. Kept for the measurement only.**

> *"useless - just a tool that makes it dynamic but adds nothing - you could easily just mark the
> axis with perpendicular week lines...not good work. stop and rethink this whole session please."*

**Why it failed, conceded in full.** The scrubber was redundant with the chart beneath it — time was
already the x-axis, and eighteen interactive states revealed what one marked axis shows at a glance.
Underneath that, the page was a replay of a season he had already lived through: it existed to prove
a finding to him rather than to help him do anything, which is the 018 fault in a third costume.
And the finding itself does not want to be a surface — *"yards per route needs 400 routes"* is
learned once and then applied forever, so the page would be worth less on day 500 than on day 1.

**The criterion he gave in its place, which is the durable part:**
*"the thing needed is surfaces that will become valuable with more and more data."*

**What survives:** the measurement below, and one correction it forces on a surface we already show
— 019's footer quotes the hobby's "yards per route stabilises at 180 routes," which measures 0.62
here. That is a footnote to fix, not a page to build.

Everything after this line is the original proposal, left unedited as written.

---

## Problem

Every surface this lane has built reads a **finished** season. So does the product, and so does
every product in the category: Sleeper, KeepTradeCut and FantasyCalc all render a week-2 rate with
exactly the authority of a week-17 rate. In September that is not a rounding error — it is the
difference between a fact and a coin toss, and nothing on any screen marks which one you are
looking at.

The cost is concrete and it lands on the reads David has already confirmed. The scouting line he
approved twice on 2026-08-08 — *"Luther Burden ran 234 routes on a 39% snap share and posted 2.79
yards per route. Elite per-route production in a part-time role."* — leads with **the least
reliable number on the board**, and the part-time role that makes the observation interesting is
the same thing that keeps the number from ever becoming trustworthy.

## Evidence

**1. Two different questions get conflated, and the answers come apart.** *Is this number
measuring something real?* (reliability) and *does it tell me what is coming?* (prediction) are not
the same, and the hobby treats them as one.

| WR/TE metric | real from | ceiling against weeks 13+ |
|---|---|---|
| routes a game | week 2 | 0.84 |
| snap share | week 2 | 0.80 |
| target share | week 3 | 0.80 |
| targets per route | 150 routes | 0.61 |
| **yards per route** | **400 routes** | **0.49** |
| yards per target | never | 0.20 |

Reliability is odd weeks against even weeks inside the window seen so far, Spearman-Brown
corrected, WR/TE 2020–2025. Prediction is weeks 1..N against a **fixed** target of weeks 13+, so
that a flat curve cannot be a rising signal eaten by a shrinking target. Controls both directions:
snap share must settle early and does; yards per carry and touchdowns per game must not and do not.

**2. The hobby's published bar for yards per route does not hold.** `craft/how-the-hobby-speaks.md`
records the Fantasy Footballers line that it *"stabilises at 180+ routes"* — quoted in 019's own
footer. Measured here on 912 player-seasons it is **0.62 at that bar**, so roughly **38% of what
separates two receivers' figures there is still sampling noise.** It does not reach 0.70 until
**400 routes**. Twelve of his fourteen receivers finished 2025 below that. Two cleared it.

**3. On his roster, the week-3 reading was wrong more often than it was right, in both
directions.** Replaying 2025: **12 of the 22 players with tape moved materially** between the week-3
cut and the late season. Five had essentially no role in week 3 and were full-time by December
(Bryant 4.7 → 29.0 routes a game, Mitchell 6.3 → 31.8, Burden 7.0 → 22.4). Three vanished (Wilson,
Kraft, Odunze). Legette ran **the most routes on the roster** through week 3 at a yards-per-route of
**0.10**; he finished at 0.94 — the number the approved scouting line quotes.

**4. Population, so his roster is not being read as special.** Among players holding a real role in
week 3, **about one in four is gone by week 13** and roughly **40% see the role move by more than
40%**. Counting the disappeared at zero rather than dropping them costs 0.07–0.32 of correlation —
the survivorship correction is material, and it was run because the uncorrected figure would have
flattered the finding.

**5. The obvious explanation was tested and REFUTED.** His roster is young (median 1 year of
experience), so the natural story is *young roles move more*. Measured by experience bucket,
**rookies' week-3 roles are more stable than veterans'** (rho 0.45 vs 0.20). The youth explanation
is dead and is not used anywhere on the surface. The surviving finding is stronger for it: this is
not a young-roster effect, it is true at every experience level.

**6. The time axis is earned, not assumed.** 004 v3 failed because it spent an axis on a dimension
that barely varied. Measured first here: between week 3 and December a receiver's routes a game
moves with a standard deviation of **8.08**, against a spread across all receivers of **7.31**.
**A player moves as much as players differ.**

## Proposal

The scouting line gets a clock, and the surface knows what it does not know yet.

- **A week scrubber** replaying 2025 week by week. Everything on the page is computed at that cut —
  no future data leaks in, and the unplayed part of the season is drawn as shaded ground rather
  than left blank.
- **One small multiple per player**, all on one fixed scale per position group that **never
  rescales as the clock moves**, with the position's published bar at the same height in every
  panel. Small multiples rather than one shared chart because fourteen lines on one axis was
  spaghetti at the left edge, and because the condition that killed the last attempt at them —
  flat trend lines — was measured absent first.
- **A route bank per receiver**: routes accumulated on a shared 0–560 scale with ticks at 150 and
  400. This is the only confidence mark on the page.
- **Reads that state what they are short of instead of hiding it.** A rate below its threshold is
  not deleted — it renders with `needs 188 more routes` beside it. Absence renders as missing,
  never as zero, and never as certainty.
- **A delta line per player** — what changed since last week, including *"did not play in week 9"*
  rather than a `+0.0` that would read as "nothing changed".

**The deliberate refusal, which is what keeps it from becoming decoration:** snap share, routes a
game and touches a game get **no confidence mark at all, ever**. They measure 0.88–0.90 reliable
from the second game. Marking everything would make the mark mean nothing where it belongs.

## Prototype

`proposals/020-when-can-i-believe-it/index.html`; data from `build.py`. Serve with
`node tools/serve020.mjs <dir> 8782` — never `python3 -m http.server`, which caches and put a blank
page in front of the client on 2026-08-07. `serve020.mjs` also refuses an unlisted file extension
loudly rather than guessing a MIME type, which is how a module failed silently on 2026-08-09.

**Verified** (`node tools/shot020.mjs`), at weeks 3 / 9 / 18 and at 1440 / 390:

- 0 console errors · 0 page overflow · 0 clipped SVG text · 0 text-on-text collisions · 0 text
  under 13px as rendered
- **Failure state fired and cleared in both directions**: broken data → 880 visible characters
  reading *"This page failed to draw — a fault, not an empty result"*; restored → 12,092.
- Keyboard: slider is the first tab stop and drives the clock with arrows; 36 of 36 figures carry
  an `aria-label` naming the player and his value.
- Mobile 390px measured in the DOM (`scrollWidth == clientWidth`), not judged from a headless
  screenshot — the phantom-overflow time-sink of 2026-07-24.
- Both analysis tools and the render are **deterministic across two runs**.

## Costs

- **It is a long page: 7.7 screenfuls at 1440×900, 8.05 at the end of the season.** For comparison
  on the same instrument, the approved 006 front door is 4.64 and the rejected 014 is 3.84. This is
  the cost I am least comfortable with. It is long because it shows all 22 players rather than the
  interesting ones, which is deliberate — but the length is real and it is David's call whether it
  earns itself.
- **No market or model lane.** Standing doctrine says both lanes appear on every surface. I left
  them off on purpose: this page is about whether a *tape* number is readable yet, and a price is
  not a tape number — adding it would be addition-by-doctrine, the 018 failure. The genuinely
  interesting two-lane question here — *does the market overreact to week-3 efficiency?* — cannot
  be answered: market history reaches back only to 2026-06-24, so there is no 2025 to test it on.
- **The thresholds are measured for WR/TE only.** Backs get no confidence mark because touches are
  reliable early; quarterbacks get none because I did not measure a QB equivalent. Stated, not
  papered over.
- **2025 tape in August 2026.** A role can be reassigned in camp, and the app's depth-chart feed
  has been static since 2026-03-14 (relay 017 R4).
- **This is a replay, not a live surface.** It demonstrates what the mechanism does; wiring it to a
  live season is an engineering question I have not costed.

## Open questions

1. Does `needs 188 more routes` read as useful honesty or as the tool making excuses?
2. Is the route bank the right mark for "how much evidence is there", or should sample size ride
   inside the number itself (an interval) rather than beside it?
3. The page shows all 22 players every week. Should a week where nothing moved collapse to the
   handful that did — or is that exactly the manufactured protagonist ruled out on 2026-07-21?

## No relay

Nothing here is an engineering defect. The one engineering-shaped fact — that the usage stores
backing all of this are served by no route — is already **017 R3**, authored and unauthorised. I am
not writing a second brief to restate it.
