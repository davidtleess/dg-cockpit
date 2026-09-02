# DG-128 — Rank everyone: the 8-game gate refuses 115 players we already have history for

**Layer:** 3 · **State:** todo · **Lane:** Davids-MacBook-Pro-77417 · **DG 3.0** · **backend / model · CHANGES PUBLISHED VALUES**
**Source:** David's ruling 2026-08-31 — *"rank everyone, always; confidence is a WIDTH, never an
ABSENCE. Abstention as a product behaviour is over."* It is the ONLY one of his ranking rulings
still unsatisfied, and it is the question he originally asked.

**Problem:** `468` of `12,226` served players carry a `dynasty_value_score`. On the honest
denominator — skill position, NFL roster, Sleeper-active — **`498` of `954` have nothing.**
David's own roster shows three blanks. Unranked players are then silently counted as `0.0` in
team value (`team_value_matrix.py`) and dropped from trade math.

Measured on the 2025 inference set:

    2025 rows                                  505
    below the gate (games_t < 8)               115
      with a prior-season ppg IN THE SAME ROW   72
      with TWO prior seasons                    55
      genuinely thin                            43

**So 63% of the gap needs NO new data.** The designed rescue — a Bayesian A/B blend — has fired
**0 times in 866,861 rows across 67 days**, because it requires an Engine A prior needing
draft pick+round, which the active feature table does not carry.

**Approach (David's ruling constrains this):** replace the cliff with a taper. A shrinkage
weight `w = n/(n+k)` is defined at n=0 and has no branch to fail, so no constant can null a
score. Band WIDTH comes from the availability model already in the serving path (`ee57d802`).
DG-127 is the enabler — without a games lag the taper still cannot tell a four-year pro with
one short season from a true rookie.

**⚠ The residual after the cheap fix:** the 43 genuinely thin players plus rookies need a
prior. The `contracts` table (535,660 rows, ~1.71 GB/day, **zero readers**) carries
`draft_overall` for 5,018 players and guaranteed money at 100% fill — observable for a player
with zero snaps and for UDFAs where draft capital is null by construction. That is the second
half, not the first.

**⚠ Ranking everyone has a real cost, and it is the front end's problem to solve, not the
model's:** ~500 players will carry a number that is mostly PRIOR, sitting on a list next to a
number built from seventeen games. A wide band is honest; a wide band that looks like knowledge
is not.

**Honesty law:** never present a prior-dominated estimate with the same visual authority as a
measured one.
**Done:** every Sleeper-active NFL-rostered QB/RB/WR/TE resolves to a finite score AND a finite
band, asserted by a serving-time test; no `None` reaches `team_value_matrix`; band width is
demonstrably monotone in evidence.


---

## ⚠ ENABLER LANDED 2026-09-01 (DG-127) — read these three before designing the taper

1. **`games_t_minus_1` / `_minus_2` now exist, and they are LEFT-CENSORED AT 4 GAMES.**
   `feature_assembly.py:178` drops sub-`MIN_GAMES_THRESHOLD` player-seasons before the lag join, so
   a 1-3 game prior season is written NaN/`_available = False` — byte-identical to a true rookie.
   Min observed `games_t_minus_2` on real data is 5.0. **A taper keyed on absence will shrink an
   injured veteran toward the rookie prior**, which is the exact population this ticket exists to
   rescue. `n` for the shrinkage weight must not be read off availability flags alone.

2. **The imputer guard is set OPPOSITE in training and evaluation, and this ticket is where it
   detonates.** `scripts/train_engine_b.py` fits `SimpleImputer` at :207, :309 and :387 WITHOUT
   `keep_empty_features`; `src/dynasty_genius/eval/backtest_harness.py:489` fits it WITH. The moment
   the taper adds these lags to a per-position feature set, an all-NaN slice (a thin
   position-season, an early fold) silently narrows the matrix while the bundle keeps advertising
   the full feature list. The backtest and the trained model then disagree about the input set by
   construction. Fix the flag before consuming the columns.

3. **Adding them to `ENGINE_B_BASE_FEATURES` changes David's screen.** Measured: `feature_completeness`
   moves for 229 of 505 scored players, the displayed value changes for 227, and the caveat sentence
   renders the raw string "games t minus 1" because `frontend/src/lib/copy.ts` `INPUT_NAMES` has no
   entry for the lags. Two existing tests break closed. Budget the copy-dictionary entry and the
   contract-test updates as part of this ticket, not as a surprise.

Detail and commands: `docs/agent-ledger/2026-09-01.md`.

---

## David's ruling 2026-09-01 (verbatim) — the constraint this build runs under

> Option 1 — coverage fix, no slot. Rank-everyone is a standing product ruling, not an accuracy
> claim. Two conditions. First, build the taper to a pre-committed form and don't tune it against
> the holdout. If you find yourself comparing candidate priors to see which ranks better, stop —
> that's a slot and it needs registering. Second, the band ships with the number. There's no width
> field anywhere today, so building one is part of this work, not a follow-up. A prior-dominated
> estimate must not render with the same authority as a measured one. Stop and come back to me if
> already-ranked players' values or percentiles move. I expect they will, since percentiles are
> computed over the ranked population — I want to see the size of it before it ships. I'll pick the
> five separately, not tonight.

And, on the feature table: *"wait for tomorrow morning"* — the 09:00 chain publishes it with
DG-127's lags; nobody regenerates it by hand.

## Pre-committed form — written 2026-09-01 23:55Z, BEFORE any band was computed on a real player

**The taper is the Phase 15 form as it already stands. Nothing about it changes.** Pure Engine B
at `games_t >= 8`; `w_B = n/(n+k_pos)` blend for `1 <= n < 8` with `DVS_BLEND_K` untouched;
Engine A alone at n=0. The reason the blend has never fired is not the form — it is that the
serving path never supplied the Engine A inputs (`pick`, `round`, `age`). The coverage fix is to
supply them. Extending the blend past 8 would move every measured player's value and is a
modelling change; it is not done here.

**Three things must be true for a blank to fill, not one.** (a) Engine A inputs reach the assembler
so the blend can fire. (b) The blend's B component pays the availability hurdle — it did not
(`e6e73a03` fixed it; the pure-B branch had since `ee57d802`). (c) The roster index stops dropping
the rows the blend produces — `app/services/roster_auditor.py:151-152` admits only `ENGINE_A` /
`ENGINE_B` and `:189-232` would relabel a blended veteran as an Engine A rookie. Land (a) without
(c) and the gate looks fixed while David's three blanks stay blank. Verified 2026-09-01: served
`dvs_engine` is None 11,758 / B 388 / A 80 — the drop is latent, never observed, and goes live the
moment (a) lands.

**Engine A input for a veteran is his DRAFT-year age, never his current age.** `score_prospect`
was trained on prospects aged ~20–24 (WR `feature_means.age = 22.13`, WR age coefficient −0.81/yr);
feeding a 27-year-old's current age extrapolates the rookie model to an input it never saw (one WR
fixture at games_t=4: the blend served 63.8 with current age 27 and 81.5 with draft age 22). Draft capital comes from nflverse draft picks keyed on gsis; undrafted
stays undrafted (no Engine A prior, no blend — those players are the ticket's second half, not
this one). Never impute a pick.

**The band.** Two new fields on the PVO and every surface that carries the score:
`dvs_band_low`, `dvs_band_high` — DVS units, clamped to [0, 100] like the score, null wherever
the score is null. The basis marker is `dvs_engine` (already served as `engine_path`
`ENGINE_B` / `BLEND_AB` / `ENGINE_A`); no new field.

Half-widths, in DVS points, from the SERVED models' own published holdout error — nothing fitted,
nothing chosen by looking at a ranking:

    sigma_B[pos] = rmse(validation_report_{pos}.json, run 20260831T204458Z, metrics_v2) / ENGINE_B_P90_PPG[pos] * 100
    sigma_A[pos] = rmse({POS}_metadata.json, run 20260502T153931Z, metrics)             / ENGINE_A_P90_PPG[pos] * 100

                 QB      RB      WR      TE
    sigma_B     22.4    22.8    20.0    23.6      (1 holdout RMSE of E[points|plays], 2022-23 holdout)
    sigma_A     40.0    20.4    32.4    23.6      (1 holdout RMSE of y24_ppg, 2021 holdout, 10-35 rows)

    measured  (dvs_engine B,     n >= 8):   DVS ± sigma_B
    prior     (dvs_engine A,     no B):     DVS ± sigma_A
    blended   (dvs_engine blend, 1<=n<8):   DVS ± sqrt( sigma_B² + ((1-w_B) · (sigma_A + |DVS_A − DVS_B|))² )

where `DVS_A`, `DVS_B` are the two components exactly as they enter the blend (B already
hurdle-adjusted and clamped). Read: the measured model's error is always carried; on top of it,
the share of the prior's error and of the two engines' disagreement that the sample has not yet
resolved, combined root-sum-square as independent error terms conventionally are.

Properties, by construction rather than by inspection: the blended band is strictly wider than
the measured band for the same position (by the second term, > 0 whenever w_B < 1); it narrows
monotonically as n grows (d/dw < 0); it tends to the measured band as w_B → 1. The width is a
1-RMSE band — roughly a 68% interval if errors were normal — and it is NOT scaled by P(plays),
which leaves it wider than the arithmetic would give (conservative; P carries its own model error
that this absorbs in part). It says plainly that a measured Engine B player sits at ±20–23 points
of a 100-point scale: that is the served model's published error, and the band's job is to show
it, not to shrink it.

The only cliff left is the one the Phase 15 form already has at n=8 (the point estimate jumps
from the w_B=7/12 blend to pure B; `test_bayesian_bridge_monotonicity` bounds it at 20). The band
narrows across the same boundary by `sqrt(sigma_B² + (5/12·(sigma_A+|A−B|))²) − sigma_B`. Stated,
not smoothed: smoothing it means changing the taper, which is the slot David did not open.

**Rule for this section:** if a measured number makes any line above look wrong, the line is
amended IN A NEW DATED SECTION with the number that prompted it — never edited in place, and never
by trying a second form to see which reads better.

## Measurement plan (what David sees before anything ships)

Baseline vs DG-128 on the SAME input, same day, same partition. Both runs use a pre-filter to the
latest feature season per player because production's `training_eligible == False` partition
carries 1,143 rows / 29 duplicated players and trips `engine_b_prediction_conflict` at
`build_universe_pvo_batch.py:285` (the 09:00 / 11:30 / 14:00 refreshes all exit 1 on it today;
no fix is written or owned as of 23:50Z). The writeup will say so: the baseline is produced under
a pre-filter production does not have. Per-player diff, joined on `sleeper_player_id`: DVS, xVAR,
both percentiles, `engine_path` transitions, entered/exited-ranked, band widths by basis.
Expected: ranked population 468 → ~583; every position percentile moves because the denominator
does. That size is what he asked to see.

Known before running: the fix fills Garrett Wilson and Braelon Allen; it does not fill Tank Dell,
who has no 2025 feature row at all (`feature_assembly.py:177` floors at 4 games before the lag
join) — a censoring question for the second half. Bo Melton is unscored because the crosswalk
carries him as CB, not because of the gate.

---

## Build log 2026-09-01 evening — what is on `ticket/DG-128`, and two corrections to the sections above

Ten commits on top of `origin/main` (`3bc9ecd2`, DG-132). Nothing landed; nothing served has
changed. Each step was RED→GREEN with a named test. Backend at the branch head: 6676 passed /
32 skipped. Frontend: 629 passed, tsc clean, biome clean on touched files.

    9538b92d  train: every SimpleImputer keeps an all-NaN fit column (enabler note 2). Numerically
              identical predictions; takes effect at the next HAND-RUN retrain only — no scheduler
              runs train_engine_b.py. Latent today (all four 08-31 bundles are width-aligned).
    e6e73a03  the blend's B component pays the availability hurdle (it did not; the pure-B branch
              had since ee57d802). A alone is not discounted — its training outcomes hold the busts.
    e2130f11  Engine A reads `age_at_nfl_entry` for a veteran, never `age`; no fallback, no prior
              without it (the DG-021 caveat says so).
    2630164d  resources/draft_capital/: one-shot, content-hashed nflverse draft_picks snapshot,
              2000-2026 QB/RB/WR/TE — 2165 rows, 2055 indexed by gsis, 110 without a gsis, 0
              conflicts. Read offline; nothing imputed.
    fbbefa36  the batch setdefaults pick / round / age_at_nfl_entry per veteran from the snapshot,
              keyed on the CROSSWALK's gsis (the served PVO's `identity_ids.gsis_id` is None — do
              not try to join off the artifact). Coverage counted in the batch report.
    d7e97e03  dvs_band_low / dvs_band_high on the PVO, the pre-committed form verbatim; sigma
              provenance tested from the tracked reports, not asserted.
    1dd9a20e  band on every surface (universe row → roster index → RosterAuditPlayer /
              PlayerModelLane → OpenAPI + generated client); the roster index admits BLEND_AB.
    70fb424b  every PVO's source_versions pins dvs_band_sigma_run_b / _a.
    c8db09d5  the blend caveat is the token `engine_ab_blend_low_sample:games=N`; the sentence
              lives in copy.ts ("Only N pro games on record, so his number leans partly on his
              draft pedigree — the range around it is wider for that").
    4b78fa66  frontend: "range L to H" under the roster score; a "Likely range" fact on the player
              page; "Scored by" names the basis; a prior-touched score renders muted, not bold.

**Correction 1 — LANE and BASIS are two things, and the pre-committed section conflated them.**
It says the basis marker "is `dvs_engine` (already served as `engine_path`)". They differ:
`engine_path` is the LANE a row lives in (ENGINE_A = current-draft rookie row, ENGINE_B =
active-player row, BLEND_AB = both contributed) and is what the roster auditor keys eligibility
on; `dvs_engine` (A / B / blend) is the BASIS — what produced the number — and the band rides on
it. I tried reordering `_route_from_pvo` to read `dvs_engine` first; the phase-17 test
`test_active_engine_b_row_with_engine_a_dead_window_provenance_routes_engine_b` failed and it is
right: an active row with a dead-window A provenance must still route ENGINE_B. Reverted;
`_route_from_pvo` is byte-identical to main. What changed instead: the auditor treats
`{ENGINE_B, BLEND_AB}` as the veteran lanes, and `PlayerModelLane` gained `dvs_engine` (so "no new
field" holds for the PVO, not for the player-detail response — disclosed in the OpenAPI regen).
Pinned by `tests/contract/test_dg128_band_reaches_the_surfaces.py::
test_engine_path_is_the_lane_and_dvs_engine_is_the_basis`.

Also true and worth knowing: the feature table floors at `games_t >= 4`, so n = 0 never occurs
for a veteran and a pure-A veteran (`dvs_engine A` on an ENGINE_B lane) is unreachable in current
data. The auditor still handles it (veteran-ness keyed on the lane; basis defaults to the lane's
engine only when a score exists). The tracked seed `app/data/valuation/universe_pvo_latest.json`
(2026-06-27) shows ENGINE_B rows with `dvs_engine "A"` — an older assembler's output, not what is
served; do not read it as live. Served runtime artifact 09-01 06:02: 9404 PRE_MODEL · 2238
INACTIVE · 388 ENGINE_B scored · 115 ENGINE_B with a null score · 70 + 10 ENGINE_A prospects · 1
UNRESOLVED_IDENTITY.

**Correction 2 — the taper as pre-committed does NOT read DG-127's lags.** n is `games_t`, this
season only, exactly as Phase 15 stood. Enabler note 1 (an injured veteran shrinks toward the
rookie prior) is therefore a property of the form David ruled on, not something this build
avoids. Making n count prior seasons' games is a different form — a hypothesis slot, not this
ticket. Consequence for the schedule: tomorrow's feature table changes nothing in DG-128's
arithmetic, so the measurement can run against the table the chain already published today
(features_runtime 09-01 09:00, 505 rows for 2025, 115 below the gate: games_t 4 → 34, 5 → 29,
6 → 31, 7 → 21). David's "wait for tomorrow morning" forbade hand-regenerating; it did not
require the lags.

**The size of what this ticket closes, stated before the measurement so it cannot be softened
after:** of the 115 gated rows, the fix fills those with a draft row AND a draft-season age —
about 76; ~39 are undrafted and stay blank (no prior exists for them yet). Of the ~498 addressable
blanks, the other ~380 have no 2025 row at all (fewer than 4 games, or none — Tank Dell is one),
which the 4-game floor removes before any model sees them. **This ticket closes roughly 76 of
498 blanks.** The rest are the second half: a UDFA/contract prior, and whether the floor moves.

**De-emphasis is keyed on the basis, so the 80 draft-class rookies render muted too** (their
number is 100% prior). That is a product choice David has not been asked yet.

**Two blockers outside this lane before any of it reaches a screen:** the 09:00 PVO step fails on
`engine_b_prediction_conflict` (09-01 09:00:44 and every refresh since; the board names lane
davidleess-a0 for the partition fix; no fix verified by me), and the trunk is two commits behind
origin with the API up since 08-31 08:18 — pull + restart are sequenced after that fix.

**Still to do in this lane:** measurement (baseline vs branch, same table, per-player diff — the
size in front of David before anything lands) · ultracode review workflow · land · closeout
audited by independent agents before he reads it.
