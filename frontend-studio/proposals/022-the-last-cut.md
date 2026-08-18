# 022 — The last cut

**Status: built, self-checked, delivered to David 2026-08-17. No relay authored — held until he
reacts.** Prototype: `proposals/022-the-last-cut/index.html` (serve: `node tools/serve022.mjs`,
build: `python3 tools/last-cut-build.py`).

## Problem

The roster has carried 27 players against a cap of 26 since June, and the app has said "1 cut
required" the whole time — as a static fact with no clock. It is now August 17. The NFL cuts to
53-man rosters on **Aug 30** (verified against league sources 2026-08-17), Week 1 opens **Sep 9**,
and the cut stops being deferrable. Meanwhile August camp battles are violently repricing exactly
the players the cut decision is between: of the 13 roster players the model prices below
replacement, **8 moved ≥10% in the market this month** (Gabriel −76.6%, Bryant +49.3%, Mac Jones
−38%, Ayomanor +30.7%, Theo Johnson −29.8%), and the market **stopped pricing Rasheen Ali entirely
on Aug 14** — the app's #1 cut candidate, delisted three days before this proposal, invisible to
every surface.

The app's Roster Capacity screen (evidence:
`proposals/022-the-last-cut/evidence-roster-capacity-2026-08-17.png`, captured live today):

- **One lane.** The cut table is model-only — raw xVAR, a unit no practitioner says. No market
  value, no rank, no movement, no listing status. The product's own doctrine (our view beside the
  market's, on every surface) is violated by its own cut table.
- **No calendar.** Nothing on the surface says when the cut is due or what resolves before it.
- **Renders nearly illegibly** — the candidate table draws at ghost opacity, followed by ~31 lines
  of "range unavailable" for positions this league does not roster (CB, DL, ILB, LS…).
- **Frozen in shape since June.** Same numbers, same order, while the decision's inputs move daily.

## Evidence

- All movement figures computed from the app's own daily FantasyCalc capture
  (`fc_forward_capture.db`, 55 days, 2026-06-24 → 2026-08-17) joined to
  `universe_market_divergence_latest.json` (both lanes + ownership). Reproduce: `python3
  tools/last-cut-build.py` prints the full table.
- The model is **frozen in camp**: across 468 scored players the largest August DVS change is 0.1
  (two players). The model learns from games; there are none. So every August reprice is market
  information the model cannot have — which is precisely why the cut table needs the second lane.
- Ali delisting: priced on 35 of 51 capture days, last value 10 (RB110), no row since 08-14 —
  detector convicts Ali, clears Gabriel (both directions).
- Sleeper league state: preseason week 2; taxi full (Mendoza, Cooper — rookies-only slots), IR
  full (Wilson, Kraft, Bell, Allen). 21 bodies for 20 active slots.

## Proposal

A calendar-anchored cut surface — "The last cut" — replacing the static capacity table's job for
August (and, in-season, the drop/waiver version of the same decision):

1. **The clock** (hero): one cut due before Week 1; runway strip today → cutdown 8/30 → kickoff
   9/9; a fixed-shape instrument line (bubble count, ≥10% movers, unpriced count) that renders the
   same shape on a quiet day — no manufactured protagonist.
2. **The bubble on the tape**: 13 small multiples — every below-replacement player's full 55-day
   market price on ONE shared value scale (so a flat cheap line honestly reads "nothing at
   stake"), each panel carrying the app's cut order, the August move with rank-arrow idiom, the
   current value direct-labeled at the line's end (KTC convention), and the un-run runway to the
   two date-rules. **A delisted player's line ends** — with a terminal ring and "unpriced since" —
   absence drawn as an ending, never carried forward.
3. **Six evidence cards** ("calls worth weighing" pattern, confirmed 2026-07-23): market now /
   the two boards (dumbbell, best-right) / August drift (toward or away from our board) / the
   wire (best unrostered player at the position, priced). A soft, uncolored, rule-produced lean —
   the rules printed in the methodology so they can be argued with.
4. **The refusal**: the 14 above-replacement players are named as out of scope, with both August
   extremes stated; Tank Dell named as the boundary case the mechanical rule cannot place; the
   IR-return condition (crunch grows past one cut) stated as a condition, not a fact.

## Prototype

`proposals/022-the-last-cut/index.html` — live data, product tokens (generated sheet, not
transcribed), error state verified in both directions (healthy 7,255 chars / broken 357 chars
naming the fault / restored), census 13/13, overflow 0 both edges, text collisions 0, console
errors 0, no horizontal scroll, deterministic build (hash-identical across runs).

## Costs (honest)

- **Seasonality.** The acute deadline framing is an August surface. The instrument under it
  (below-replacement bubble × daily two-lane reprice × wire replacement) is the in-season
  drop/waiver decision too, but that continuity is asserted, not demonstrated.
- **The lean rules are simple threshold rules** and lie at boundaries the way all thresholds do
  (Legette at +17.7% but only 4 ranks climbed stays "unresolved"). They are printed on-surface so
  the boundary cases are arguable; still, a rule this simple can misclassify.
- **Market percentiles are computed against the priced pool**, which shrinks as players delist —
  a rank among the priced is not a rank among all players. Stated in the methodology.
- **The cutdown/kickoff dates are hand-verified external facts** (Aug 30 / Sep 9), not data the
  pipeline can refresh. If the surface shipped, those dates need a source of truth.
- **One panel's "toward/away" drift compares Aug 1 vs today only** — two endpoints, not a path.

## Open questions

1. Does the calendar-anchored framing earn the front-door feed slot for the next 23 days, or is
   this a Roster Capacity replacement only?
2. Should the lean tags survive at all, or is the factor grid alone the right dial setting?
3. The IR-return condition (Wilson/Kraft healthy → crunch grows) is knowable from Sleeper slot
   rules + league settings — worth an engineering ask to compute it live?
