# Studio proposals — status

## Current

| Item | State |
|---|---|
| **006 State of your franchise** (real front door built) | **Full front door built 2026-07-22 (`frontdoor.html`), awaiting David's review.** Real data throughout. Hero = franchise verdict ("A rebuild, still early", measured-honest voice per ruling) + standing (12/12 value & starters, 3rd-youngest, 16 picks) + positional-shape bars. "What you hold" = **position groups QB→RB→WR→TE** (per David's team-page ruling), each header carrying its thesis (QB=the bet; RB=Jeanty+Henderson; WR=14-deep surplus/currency; TE=the hole), rows show our-vs-market positional rank + trajectory + market sparkline, **click any row → the July-15 approved player card inline** (our-vs-market lanes, percentile-in-pool bars w/ raw rank, comparables on each board, in-season placeholder). Lower: derived "your board this month" + demoted market feed. One interactive page, position-grouped, thesis-driven. Clean at mobile/tablet/desktop, 0 console errors. Stale-standing-data (Jun 23) flagged honestly on-surface. Skeleton (`wireframe.html`) preserved. **v2 2026-07-22 per David feedback ("we can work with this"): (1) card de-cluttered from 4 numbers to 2 — rank as the raw number at each percentile bar's end, overall moved to prose; (2) row's abstract gap-bar replaced with a dumbbell on the position's pool scale (best-left, our dot vs market dot, connector=disagreement) — standing + disagreement now read at a glance. Direction confirmed "heading in the right direction." **v3 2026-07-23: lower two regions reworked with the same lens — "Your board this month" now names concrete moves (sell chips Wilson/Burden/Odunze, cut Rasheen Ali, Dart leads the QB bet) instead of static advice; "What's moving" is now a consistent instrument pairing each 7-day market move with our-vs-market rank ("read the gap, not the arrow") rather than a bare change log. Front door regions 1–4 now all thesis-driven. Clean at all breakpoints. **DUMBBELL SCALE FLIPPED 2026-07-23 — best=right/worst=left (#1 far right), per David (Savant convention). RANK-AXIS CONVENTION LOGGED in DAVID.md.** **"YOUR BOARD THIS MONTH" REGION PULLED BACK FOR REWORK 2026-07-23:** David rejected shallow prescriptions ("sell Garrett Wilson" reasoned only from WR surplus) — proven indefensible (we don't even model Wilson; he's near a 29-day low not a high; window argues hold; he's the best WR). Region must become **decision-support not decision-making** — assemble the deep case (window alignment, our-vs-market, value trajectory, replacement), no verdicts. David's steer: "lean HEAVILY on the decision data — evidence, combination of factors, reasoning — then softer earned tagging, not prescription." **REBUILT 2026-07-23 as evidence cards:** each real decision (Garrett Wilson, Rasheen Ali, the QB bet) assembles the bearing factors (window alignment, our-view-vs-market, value trajectory over available history, replacement) + a "The read" synthesis + a soft neutral lean tag ("lean: hold" / "lean: cut candidate" / "unresolved") — never a command, tags un-colored. Wilson (the wrongly-recommended sell) now correctly reads lean:hold with the full case. Clean all breakpoints, 0 errors. Principle logged in DAVID.md as a top governing rule. |
| **005 Where we stand** (proposal + RELAY + prototype) | **DESIGN REJECTED by David 2026-07-22 (v1 and v2 both).** "Really bad… awful visual experience": two long parallel lists, no interactivity, drift column backwards + verdict-colored. Root causes recorded in DAVID.md (designed from data not the question ladder; violated ≥3 standing rulings; over-built before validating IA). **The analysis survives** — frozen model (25 days), no published overall rank, superflex contamination, the age-artifact finding, and the 004 N0 withdrawal are all sound and belong in the RELAY. **The design restarts** from one interactive filterable list defaulted to My Roster. RELAY still NOT authorised to cross. Next step gated on David confirming the corrected design direction before any rebuild. |
| **004 Us against the market** (proposal + RELAY + 4 prototypes) | **v4 KEPT by David 2026-07-21** ("pretty cool — we can keep this and iterate later"). Parked, not finished. **RELAY CROSSED to the crew 2026-07-21, confirmed by David directly. Awaiting verdicts.** |
| 000 first impressions + RELAY | Crossed. Verdicts were still outbound at last session close. |
| 001 Morning Tape + grounded analysis layer | Crossed. Verdicts still outbound at last close. |
| 001b RELAY addendum (rank-first defaults, N1–N8) | Crossed 2026-07-15, **fully accepted** same-day (disposition at foot of file). |
| 003 League data freshness (F1–F4) | Crossed 2026-07-15, **fully accepted** same-day (disposition at foot of file). |
| 002 question ladder / IA | Written 2026-07-15 from the dynasty-strategy deep research. |

## 004 — what it is (one line)

Ranking daily market movement by size of move is, measurably, ranking it by cheapness; this proposes
ranking every move against that player's own normal day instead, and lets the surface say "nothing
happened" when nothing did.

**Evidence base (all reproducible):** 404 players × 28 days from `app/data/fc_forward_capture.db`.
Volatility runs 28× from cheap to expensive (−0.709 Spearman vs. log value) and is a stable player
property (0.913 split-half). Dollar-ranking and signal-ranking overlap only 3.6/10 in the top ten,
averaged over 14 straight days, with a different #1 on 13 of 14. FantasyCalc ships `displayTrend`
(true for 26 of 463) plus trade frequency and roster percent; the capture retains none of the three.

**Prototype:** `004-noise-floor/prototype.html` — self-contained, real data, app tokens and typefaces,
inline row expansion, no red/green outside the standing rank-arrow ruling.

**Revised twice by client review.** v1 was market-only — David called it on practicality ("should I
really be ACTING on those signals?") and on the missing model-vs-market juxtaposition. v2 added both
lanes and immediately falsified v1's headline (Omar Cooper: we 75th, market 76th — a non-event). v3
removed the narrative headline entirely after David asked for a consistent instrument rather than a
daily protagonist, and replaced it with a fixed state strip plus small-multiple gap-over-time cards
on one shared scale. Full revision log at the foot of the proposal; all three prototypes preserved.

**Biggest finding, surfaced only by the consistent view — filed as relay item N0 (High):** the
model-market divergence is systematic by position. Median gap +13.6 for TEs, −10.8 for QBs, with the
QB distribution nearly one-sided. Plausibly a superflex scaling artifact (market is pulled at
numQbs=2) rather than an analytical edge. Engineering question, not a design one.

**Revised four times in one session.** v1 market-only → v2 added the model-vs-market juxtaposition →
v3 replaced the narrative headline with a consistent instrument → v4 removed time from the overview
and faceted by position. Full revision log at the foot of the proposal; all four prototypes preserved
so the reasoning is auditable.

**Relay status:** 004 crossed 2026-07-21 (David confirmed directly). Six items; **N0 — the QB/TE
position skew and whether it is a Superflex scaling artifact — is the one to watch**, because the
answer determines whether anything built on the model-vs-market comparison is measuring analysis or
league settings. Log dispositions at the foot of `004-RELAY.md` when verdicts land.

**Parked, awaiting David:**
1. Whether a *daily* surface earns its place at all — 22 of 23 roster gaps moved ≤8 points across 10
   captures, so the disagreement is structural, not daily. Asked twice; unanswered.
3. Whether position is the right cut for the overview, or the roster wants slicing another way.

## Carried forward from 2026-07-15 (unchanged, still open)

1. Prototype rework of the 001 morning-tape artifact to the corrected xVAR model-rank basis
   (per-lane denominators, "gap" not "opportunities", honest tie rendering). **Not started in code.**
2. Scouting-view proposal (question 6) from `assets/league-pulse-capture-2026-07-15.json`.
3. Tier-boundary derivation analysis — prose ladder is client-mandated, gated on calibration.
4. Crew verdicts on 000 and 001 still outbound.
5. Bo Nix live-ownership verification (market QB12 / model QB4 / FA per the Jun 23 artifact).

## 005 — what it is (one line)

The app has no rankings list, which is the one surface every product in this category leads with;
this builds it with both lanes in rank space, and reports that our lane has been frozen for 25 days
and has no agreed definition of "our rank."

**Evidence base (all reproducible):** `model_forward_capture.db` across 29 days — last day with any
`dynasty_value_score` change was 2026-06-27; 0 of 581 scores and 0 of 12,200 projections changed
overnight; live `/api/league/what-changed` returns `daily_diff.model.deltas: []` with status
`vintage_changed_no_score_delta`. Market re-ranked 370 of 452 the same night. Top-25 position mix:
ours 3 QB / 15 RB / 7 WR / 0 TE (xVAR basis) or 1/6/6/12 (DVS basis) against the market's 9/7/7/2.
Age gap monotone within Engine B (−22 → +28) and within every position.

**Prototype:** `005-where-we-stand/prototype.html` — 340 players, both lanes, fixed-scale gap track
per row, position-faceted age instrument, inline row expansion. Palette validated (all checks pass).

## Notes on the product, observed 2026-07-21

Shipped since 2026-07-14: headshots now render throughout; per-row 28-point sparklines exist;
`/api/health` returns 200 (was 503); capture health is 28/28 days with zero gaps on both stores.
Still open from the briefing's defect list: Movement history card still reads "Series pending" while
sparklines render beside it (filed as 004 N6).
