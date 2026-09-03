# DG-128 — Rank everyone: the 8-game gate refuses 115 players we already have history for

**Layer:** 3 · **State:** done · **Lane:** Davids-MacBook-Pro-77417 · **DG 3.0** · **backend / model · CHANGES PUBLISHED VALUES**
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

## Build log 2026-09-01 late — the σ pin fails closed; one proposed candidate registered

**`f2341aad` — the band refuses runs the served models did not come from.** Answering the DG-132
lane's question (were σ_B/σ_A computed against the bundles `v2_manifest.json` points at, not
`backtest_result_*.json`?) verified: manifest → `20260831T204458Z` for all four positions =
`ENGINE_B_SIGMA_RUN`; tracked `latest.json` `model_version` → `20260502T153931Z` =
`ENGINE_A_SIGMA_RUN`; `dvs_band.py` reads no backtest file. But only the A pin was checked, and
only at test time — the B pin was a sentence in a docstring. `assert_band_sigma_runs_match_served_models()`
now reads the two pointers the scorers load and stops `_active_pvos_from_engine_b` before it
scores a row: `dvs_band_sigma_run_stale:<pos>:<run>` · `dvs_band_sigma_run_stale:A:<run>` ·
`dvs_band_sigma_pointer_missing`. A position the manifest leaves at `None` is skipped (no B score,
no band). Seven tests, red first; backend 6683 passed / 32 skipped. Consequence for a future
retrain: promoting a manifest without moving the pin AND the σ constants halts the 09:00 chain at
`run_pvo_refresh` with a bare token — loud by design.

**Correction 3 — the partition fix is DG-133, not lane a0.** `tickets/DG-133-the-inference-
partition-is-selected-by-the-wrong-flag.md` exists on the board (filed by the DG-132 lane,
`davidleess-0b`); the "lane davidleess-a0" attribution in the section above was wrong. DG-128 does
not touch `build_universe_pvo_batch.py:190` or `roster_auditor.py:636`; it rebases onto DG-133
before the measurement. Awaiting David's confirmation of the owner.

**Registered as PROPOSED, not built, not compared:** *n counts the last three seasons' games*
(the taper's n reads `games_t + games_t_minus_1 + games_t_minus_2` instead of this season only).
It would stop an injured veteran with two full prior seasons from shrinking toward the draft-day
picture. It is a different pre-committed form, so it is a hypothesis slot under David's ruling —
listed here so the candidate exists on paper with a date before anyone is tempted to try it
against a ranking. Nothing in this lane has computed it.

**Housekeeping:** `frontend/openapi.json` regenerated both times via `npm --prefix frontend run
openapi-gen`, never edited by hand. Branch head `f2341aad`, 11 commits over `origin/main`
`3bc9ecd2`.

## Build log 2026-09-02 — rebased onto DG-133, the measurement re-run through the real selector, and what its audit corrected

**Rebase.** `ticket/DG-128` rebased onto `origin/main` `f8995d3d` (DG-133, `davidleess-0b`) —
head `fde9a5ca`, 12 commits, no conflicts. Worktree suite: 6759 passed / 33 skipped / 1 failed;
the one failure is the intentional RED test below. No reader file carries the spelling DG-133's
contract test scans for.

**Measurement, run twice, identical.** The harness (scratchpad `dg128-measure/harness.py`,
`harness2.py`) calls the producer's own `_active_pvos_from_engine_b` in two trees against the same
feature table, availability fit and σ pins — read-only, and `find -newer` confirms nothing under
either tree's `app/data` was written. Run 1 (09-01 late): baseline `3bc9ecd2` vs `e1eda9b5`, the
feature slice pre-filtered to `feature_season == 2025` (505 rows). Run 2 (09-02, after the rebase):
baseline `f8995d3d` vs `fde9a5ca`, the FULL 3,384-row runtime table, each tree's own DG-133
selector picking. Both runs: 505 selected → 503 PVOs — the two the identity join orphans
(`sleeper_id_missing`) are Nick Kallerup TE and Ke'Shawn Williams WR, 2025 UDFAs, orphaned in both
trees, nothing to do with this ticket. Run 2 vs run 1 per player: 0 value, 0 percentile, 0 band
differences in either tree.

- Coverage: **388 → 463** of 503 with a number. 75 filled, every one `blend` basis; `games_t`
  4:22 · 5:18 · 6:22 · 7:13; WR 25 · RB 22 · QB 19 · TE 9; draft round 1:11 · 2:8 · 3:12 ·
  4:12 · 5:10 · 6:17 · 7:5; w_B 0.36–0.58, median 0.50. 40 stay blank: 39 with no draft-capital
  row (undrafted) + Bo Melton (13 games, crosswalk says CB).
- Already-ranked VALUES: **0 of 388 moved.**
- Within-position percentile (`xvar_percentile_position` = `dvs_pct`, the player card): 384 of
  388 moved; 325 up, 59 down; max +19.4 (Brissett 33.3 → 52.7), min −2.6. By position: QB n=36
  mean **+12.5**, RB +1.2, TE +2.0, WR +1.3. Population QB 37→56 · RB 99→121 · WR 163→188 ·
  TE 89→98.
- Overall percentile (`xvar_percentile_overall`, the 468 denominator in David's ruling 4): the
  harness never reached it (it stops before `build_universe_pvo_batch`). Recomputed with the served
  rule (`universe_pvo_batch.py:120-133`) by the audit and reproduced by me: population **468 →
  543** (not 583 — the fill is 75, not 115); 464 of 468 move, 461 up / 3 down (Taylor −0.4,
  St. Brown −0.2, Achane −0.1), max +4.1, mean +2.8; 77 of the 80 Engine-A rookies move, mean +2.9.
- Bands: 463 of 463 Engine-B numbers carry one. Measured players get ONE width per position —
  WR 40.0 / QB 44.8 / RB 45.6 / TE 47.2 (± one RMSE in DVS points; no per-player information).
  Blends: median width 65.2, min 33.4; five span the whole scale, 0–100 (Trubisky, Zach Wilson,
  Trey Lance, Andy Dalton, Cam Akers). 220 of 463 touch a clamp edge (157 measured + 63 blend) —
  truncated, not narrower.

**The audit** (ultracode workflow `wf_33759416-71e` — 11 findings, each adversarially judged;
6 survived, 5 refuted). Verified figures, wrong paragraph, again: my readout draft was wrong six
times and was amended before David read it. What it corrected, on the record:

1. The overall percentile above was unmeasured in the draft.
2. **The 80 Engine-A rookies carry NO band.** `resources/prospect_cards.json` (82 cards, 80 with
   a sleeper_id, static since `e1139c7d` 2026-06-07) is read verbatim by `_load_prospect_pvos`
   (`build_universe_pvo_batch.py:54`); 0 cards carry `dvs_band_low`; `universe_pvo_batch.py`
   copies the null; the frontend's `likelyRange()` returns null on null. On David's roster the
   range would render under 22 veterans and under none of his 4 rookies (Mendoza, Cooper Jr.,
   Bell, Black) — his ruling 3 unmet on his own screen. Fix chosen: regenerate the cards through
   `scripts/refresh_prospect_cards.py`, the assembler's own path (`assemble_pvo(..., is_prospect=
   True)`, DVS-invariance tolerance 0.01 with exit 1 on drift, identity/age/grade/CFBD fields
   preserved) — one band producer, no load-time shim. RED first:
   `tests/contract/test_dg128_prospect_cards_carry_the_band.py` fails naming all 80 scored cards
   (untracked until it is GREEN). **The regeneration has NOT run: the auto-mode permission
   classifier refused the command. It writes three tracked files inside the worktree
   (`resources/prospect_cards.json`, `resources/prospect_cards.js`, `docs/validation/phase15-2026-
   rookie-rank-refresh.md`), nothing under `app/data`, nothing on trunk. David's word asked for;
   the peer correctly declined to run it in my stead.**
3. "Range only" is a code split, not a toggle. `load_draft_capital` is called unconditionally at
   `scripts/build_universe_pvo_batch.py:266` and raises `draft_capital_snapshot_missing`; the band
   (`d7e97e03`) and the draft-capital injection (`fbbefa36`) are one commit series. Range without
   the fill = land without `fbbefa36` and re-cut `70fb424b` + `f2341aad` + their tests. Not cut,
   not tested.
4. "~380 have no 2025 row, under the 4-game floor" was FALSE — subtraction on an overwritten 08-31
   census, with Dell's case generalised to the group. This morning's artifact: 904 addressable /
   453 unranked = 107 ENGINE_B-gated + 346 PRE_MODEL. Of the 346, measured against 2025 offensive
   snaps in `nflverse_usage.db` (± counts, snap-games ≠ `games_t`): **~49** played 1–3 games (the
   floor's actual cases), **~270** took no 2025 offensive snap at all (104 are 2026 rookies),
   **~27** played 4+ but have no row (identity / stat-line). Lowering the floor reaches ~49; the
   ~300 with no NFL production need a prior — a different fix from this ticket.
5. **Dell is a no-2025-row case, not a floor case** (Greg, `davidleess-0b`; verified read-only by
   me): `player_snap_count` has Dell (DellNa00 / 00-0038977) 2023 11 games, 2024 14 games, 2025
   NONE; the runtime table holds only his 2023 row (`games_t` 10); 2024 rows survive the keep mask
   at `feature_assembly.py:127` only when window-complete and the table carries no 2024
   `feature_season` rows at all. The audit's own amended line ("played 1–3 games") was wrong on
   him. No threshold change ranks him; a carried-forward row would. Sleeper-Inactive today, so
   outside the 904.
6. The fill closes **72** addressable blanks, not 75: Trey Benson, Robbie Ouzts and Cedrick
   Wilson are Sleeper-Inactive.
7. **The percentile move is a floor of rank-everyone, not a cost of this prior.** 69 of the 75
   have their measured half BELOW the prior, so any form that corrects veteran staleness lands
   them lower and moves incumbents MORE. Arithmetic on the same formula, no fit and no comparison:
   the 75 at their measured half → QB +15.8 (served +12.2) · RB +6.0 (+1.2) · WR +4.3 (+1.3) ·
   TE +4.1 (+2.0); all 75 at the bottom → +17.3 / +9.1 / +6.6 / +4.6. Holding the fill defers
   the move; it does not shrink it.
8. Band claims scoped. σ_B is one RMSE of the pre-hurdle `E[points | plays]` on the promotion
   holdout seasons [2022, 2023] (`train_engine_b.py:158`), ≥4-game rows, n = `test_rows`
   95/185/303/161 — reproduced by me, RMSE to 4 dp. Coverage at ±1 RMSE on that holdout:
   **QB 73.7 / RB 71.9 / WR 68.3 / TE 70.2 %** (clamped to the DVS scale 74.7 / 77.3 / 71.9 /
   76.4). "Likely range" means about two in three. It is not an error of the served P×E number,
   and no served range has been graded against a real outcome. "min 20" is the clamp, not a
   tight band.
9. Denominators bridged: 505 selected → 503 PVOs (2 orphans) → 388 / 463 Engine B; + 80 Engine A
   = 468 served / 543 after. The 583 above assumed all 115 gated rows fill. 498 / 954 was the
   08-31 census, since overwritten — today 453 / 904.
10. "Aged prior" was never registered as a candidate; struck from my draft.

**Context recorded, NOT acted on** (from Greg, `davidleess-0b`, 09-02): Codex (Lou) reports a
shrinkage `w = games_t / (games_t + 6)` toward the player's own games-weighted career PPG —
career-state test −0.058 RMSE, CI [−0.102, −0.014]; the 4–7-game group −0.164 [−0.319, −0.016];
QB/RB gain, ~0 for WR/TE. Same functional form as this ticket's taper with a DIFFERENT ANCHOR
(own history instead of draft capital). Under David's ruling that is a candidate-prior comparison
— a hypothesis slot — so nothing in this lane computes it, compares it or ranks with it. From the
same message, a benchmark: Garrett Wilson with the gate bypassed measures 68.5 → WR33 of 199 /
overall 86; the blend serves 72.9 / 88.2, pulled up by his 79.1 draft prior.

**Open with David** (asked 09-02 morning; Greg is counselling him directly, not through me):
(a) permission to run the prospect-card regeneration; (b) the fill — ship blend + range as built,
range-only via the code split, or hold both; (c) push of dg-build.

**Still to do in this lane:** regeneration on his word → GREEN the RED test → field-by-field diff
of the 82 cards (only `dvs_band_low/high` and `assembled_at` may change; exit 0 and "DVS
invariance: OK" required) → suite → commit · ultracode review workflow · land · closeout audited
by independent agents before he reads it.

**Feasibility, asked of this lane 09-02 05:40 (Greg's counsel to David, not a ruling — he put
"own-history anchor by Thursday, else range only" to David and asked me whether it fits):**
- *Own-history anchor by Thursday — NO at the quality bar.* (i) The games lags DG-127 added
  (`738b7525`, in trunk `0def485d`) are in no served table yet — the runtime CSV is still the
  09-01 09:00 file with zero `games_t_minus` columns; today's 09:00 regen is the first that could
  carry them, and they are LEFT-CENSORED at the 4-game floor (`feature_assembly.py:318`): a 1–3-game
  prior season reads as no season. "Career" from the table is two lagged seasons with short ones
  invisible. (ii) It shrinks the INPUT `ppg_t` before Engine B scores, where this ticket blends
  OUTPUTS after; σ_B was measured on unshrunk inputs, so the band needs a new pre-committed form.
  (iii) w = g/(g+6) is 0.57 at g=8: ungated it moves the 388; gated to n<8 it reintroduces a
  step at 8. (iv) The form was chosen by comparing it against the holdout — the thing David's
  ruling says to stop at and register. It is a slot; only he registers it. Not built.
- *Range-only this week — YES, feasible today.* Post-rebase hashes: injection `6c68492b`
  (batch + its test only); sigma pin `848a3241` and fail-closed `60e86f4b` add hunks to the same
  file and tests to the injection's test file. Split = drop `6c68492b`, re-cut those two hunks and
  move their tests, drop the then-dormant snapshot/module `937e1109` and draft-age `b67a873d` so
  no dead code lands, re-measure (expect 388/388 identical, bands only, ZERO percentile moves —
  nothing for his gate), prospect bands on his permission, review, land. Half a day plus audit.
- Either way the measurement is re-taken on the 09:00 table before landing — it was taken on
  the 09-01 file, and `score_rows` fits at scoring time from the CSV.

## Build log 2026-09-02 (cont.) — the range-only cut, built and measured

David, 2026-09-02 (verbatim): "push the branch, run the regen, range-only this week."

**Branches.** `ticket/DG-128-fill-held` = `fde9a5ca` holds the as-built 12-commit fill series
untouched (unpushed until David runs the push). `ticket/DG-128` was reset onto `origin/main`
(`f8995d3d`, DG-133) and rebuilt as the range-only series — ten commits, head `902bb788`:

| commit | from | what |
|---|---|---|
| 25abd74c | 0aadf97b | train fix — all-NaN fit column kept |
| d48f3f78 | f112279b | blend's Engine B component pays the hurdle |
| 8ac643cf | da99c7f5 | band on the PVO (`dvs_band_low/high`) — fixture fixed, see below |
| 973873e2 | b59bc2d2 | band reaches every surface; roster index admits the blend |
| 64723ba4 | 848a3241 | **re-cut**: sigma-run pins only; the draft-capital `source_versions` lines went with the injection |
| 4009c0d3 | 0133bffc | blend caveat token — fixture fixed, see below |
| 363b073a | 2acc94bc | frontend range |
| c121bbcd | 60e86f4b | **re-cut**: fail-closed `assert_band_sigma_runs_match_served_models()` now at the head of `_active_pvos_from_engine_b` |
| 5915d1ae | fde9a5ca | no greying |
| 902bb788 | new | the 80 rookie cards regenerated with the band |

Dropped, not landed this week: `6c68492b` (injection), `937e1109` (draft-capital snapshot),
`b67a873d` (Engine A reads draft-season age). `grep` over src/scripts/app/tests/frontend/resources
finds no reference on the branch to anything those three introduced.

**One fixture leaned on a dropped commit.** `test_dg128_assembler_ships_the_band.py` fed the
blend fixture `age_at_nfl_entry` without `age`, which only reaches Engine A under `b67a873d`.
On trunk's semantics Engine A v2 reads `age`; the fixture now states `"age": 22.0` (a rookie
in his first season — the two ages coincide). Folded into the two commits that introduced it
(`git rebase --autosquash`, non-interactive) so every commit is green on its own:
per-commit run of the DG-128 + phase14/15 contract tests → 40 / 49 / 50 / 51 / 51 / 58 / 58.

**Suite.** Python 6,741 passed / 33 skipped, serial (trunk archive: 6,695). Frontend 90 files /
629 tests. Ruff: the branch's files pass; the tree's 11 errors are trunk's own (same 11 on the
`f8995d3d` archive). `npm --prefix frontend run openapi-gen` on this tree reproduces the
committed `openapi.json`, `types.gen.ts`, `zod.gen.ts` byte-for-byte.

**Regen (David: "run the regen").** `scripts/refresh_prospect_cards.py` on this tree: exit 0,
"DVS invariance: OK — all 74 scored players match baseline exactly". Field-by-field over all
82 cards vs. the committed copy: `dvs_band_low/high` ADDED on the 80 scored, `assembled_at`
moved on those 80, no other field changed, 2 watchlist cards carry the keys as null. All 80
are Engine A → one σ_A a side, clamped to [0,100]; unclamped widths QB 80.0 (×3), WR 64.8
(×17), TE 47.2 (×18), RB 40.8 (×8); the rest touch an edge. The validation doc's only diff is
its `Generated:` stamp. `.js` mirrors `.json` (test pins it).

**Re-measurement — range-only head `902bb788` vs. trunk `f8995d3d`, same table** (trunk's
`app/data/features_runtime/engine_b_features_runtime.csv`, mtime Sep 1 09:00, 3,384 rows —
the 09:00 chain had not fired at 06:01 EDT; the DG-133 selector picks 505 → 503 PVOs after
the 2 crosswalk orphans). Harness `harness2.py`, output `out/branch3.json`:
- 503 players, same set. **Every served field other than the band identical to trunk on all
  503** (values, `dvs_pct`, engine, availability_p, caveats, decision_supported…).
- 388 ranked before → 388 after; **0 filled, 0 lost, 0 value moves, 0 percentile moves**;
  percentile population per position unchanged (QB 37 / RB 99 / WR 163 / TE 89).
- **388/388 carry a band, 115/115 blank carry null.** All 388 are engine B, no blend fires
  (no Engine A input for veterans without the injection — by construction).
- Unclamped width = 2σ_B per position: WR 40.0 (103), QB 44.8 (25), RB 45.6 (58), TE 47.2
  (45); **157 of 388 bands touch 0 or 100** (QB 12 / RB 41 / TE 44 / WR 60). That is the
  form — σ_B is 20–23.6 points a side on a 0–100 scale — not a defect; worth David seeing.
- Band contains the score and sits inside [0,100] for every one of the 388.
- The fail-closed check ran for real against the worktree's served model pointers on this
  measurement (it is the first thing `_active_pvos_from_engine_b` does) and passed.

**Context for the registered slot, not this cut** (Greg `davidleess-0b`, verified twice with
a0, read-only on `app/data/training/engine_b_features_v2.csv`, n=2,879 rows with
`outcome_returned`, `feature_season<=2023`) — raw "posted a qualifying season at t+1 or t+2"
rate by `games_t`: 4→46.3% (164) · 5→48.8 (166) · 6→56.3 (158) · 7→60.1 (163) · 8→59.9 (162)
· 9→74.3 (148) · 10→73.1 (171) · 11→80.0 (165) · 12→80.2 (177) · 13→85.7 (182) · 14→89.7
(194) · 15→86.1 (209) · 16→95.9 (339) · 17→92.5 (255) · 18→96.1 (127) · 19→98.4 (62) ·
20–21→100 (37). No discontinuity at 8 (7 games 60.1%, 8 games 59.9%): a monotone ramp, and
the 8→9 step (+14.4pp) is the max of 17 adjacent comparisons at per-point SE ≈ 3.8pp — do not
read it as "the cliff is 9". Relevance: this is the empirical curve the pre-committed
`w_B = n/(n+k)` approximates, so the form can be checked against it rather than assumed —
when the slot is registered. Nothing here changes the range-only cut. Credit a0 for the
caution and the framing.

**Open.** Review (ultracode) → `dg-land.sh DG-128 --dry-run` → land. Pushes are David's
(`git push` is classifier-blocked in this session; the `!` one-liners are in his hand).

## Build log 2026-09-02 (late morning) — the pre-land review's findings, and an AMENDMENT to the pre-committed form

The ultracode review of the range-only series confirmed six findings. All six are fixed on
`ticket/DG-128`, series now ELEVEN commits on `f8995d3d`, head `d72f27dc`; the as-built
`ticket/DG-128-fill-held` = `fde9a5ca` is untouched. Safety ref `backup/DG-128-pre-fold` =
`902bb788` (the old head) is local.

**1. AMENDMENT — Engine A is two heads, and the pre-commitment named one.** The 23:55Z form
pinned σ_A from the v2 ridge's 2021 holdout (`20260502T153931Z`). The assembler tries the v3
TE head first (`EngineAV3Scorer`, Head A Ridge over draft slot + college features, promoted
`20260524T140748Z`, `engine_used = engine_a_v3_head_a_ridge`), and 22 of the 80 rookie cards
are scored by it. Their bands carried the v2 ridge's error (23.6) around a number the v2
ridge did not produce. Fix, in a separate dated commit (`c8cf0931`) rather than folded into
the 09-01 commit that claims the pre-commitment — a pre-commitment amended is a visible
event:
- `DVS_SIGMA_A_V3 = {"TE": 29.7}` = the promotion's out-of-fold RMSE 2.7051 PPG (4-fold
  leave-one-class-out over the 2018–21 classes, target best3of4_ppg) / P90 9.1 × 100. The
  head's `te_v3_metadata.json` is unrecoverable; `scripts/promote_head_a_te_v3.py:136`
  carries the RMSE it recorded as a constant, and the provenance test reads it from there.
  ~~This is the ONLY surviving record~~ — CORRECTED 09-02 07:15 by the closeout audit: the
  bakeoff artifact the constant was copied from survives, gitignored, in trunk's
  `app/data/backtest/phase19/head_a_bakeoff_20260524T134221Z_826e5156.json`
  (`positions/TE/ridge/candidate/oof_rmse = 2.7051`, plus `oof_logs/oof_TE_…826e5156.csv`).
  Only the metadata JSON is gone. A re-run of the bakeoff is still a slot and still not needed.
- `dvs_band(..., prior_head=)` selects it for a v3-scored prior and for a blend's unresolved
  share; a v3 head for a position with no pinned error is refused, never defaulted to v2's.
- The served effect: the 22 v3 TE cards widen by 6.1 a side (Sadiq 60.7→54.6 low; four
  highs already clamped at 100). No veteran PVO changes — the universe batch never scores
  through Engine A. Re-measured (`out/branch4.json` vs `baseline2`): still the band on 388
  and nothing else; identical to `branch3` on every field.
- The form is unchanged. The CONSTANT SET was incomplete. Not a candidate comparison.

**2. The fail-closed assert had a hole: `manifest[pos] = None` was skipped** as "no B score,
nothing to be stale." False — `EngineBService` falls back to its v1 bundle there
(`engine_b_service.py:177`, `... or self._v1_bundle`), the number serves as `dvs_engine B`,
and no error is pinned for v1. Now refused: `dvs_band_sigma_run_unpromoted:<pos>`. The
test that pinned the skip is flipped. Today's manifest names all four positions at
`20260831T204458Z`, so this changes nothing served; it changes what a failed retrain gate
can do silently.

**3. The v3 pointer is now pinned too.** `assert_band_sigma_runs_match_served_models` reads
`app/data/models/head_a/v3_manifest.json` (gitignored like the B manifest; absent ⇒ the v2
ridge serves every prospect and there is nothing to pin) and refuses a head at another run
(`dvs_band_sigma_run_stale:A_v3:TE:<run>`) or a promoted position with no pinned error.
**And the card regen now runs the assert** — it never did; it was the one path where the v3
head actually serves. `ENGINE_A_V3_SIGMA_RUN` rides in `source_versions` on every veteran PVO
and, new, on every scored card (cards had `source_versions: {}` — nothing was ever recorded
there).

**4. The roster band read 2.78:1.** `.dg-roster__band` used `--dg-text-muted`; the band
prints mostly on rows whose model status does not apply (every prior-scored or blended
player), and those rows carry opacity 0.55. The same defect the model-status toggle's CSS
already documents for itself. The smoke fixture predated the band, so axe never had a band
to measure: I gave its three prior-scored rows their σ_A band (six-line fixture diff), watched
axe name exactly those three `.dg-roster__band` nodes at both widths (2.78 on #0a0e11),
switched to `--dg-text`, watched it pass. The band is quieter than the number through size.

**5. The label was spelled twice** — `range` hard-coded in the roster row, `Likely range` in
the dictionary and on the player card. The roster now reads `fieldLabel("dvs_band_low")`:
"Likely range 41 to 82" under the number. 390px overflow re-checked.

**6. Prose describing the dropped fill** in five places (a test docstring that said this cut
"arms" the imputer fix by consuming `games_t_minus_*`; "the first blend rows ever served";
"keep David's blanks blank after the fix"; a commit message with the same claim; "carry the
band keys as null" — the watchlist cards have NO band keys). All reworded to say what this
cut does and what the held fill would.

**Verification.** Python 6754 passed / 32 skipped at the tip; the full suite green at each of
the first ten commits (an accidental full-suite-per-commit run — zsh did not split my file
list — which is stronger than the per-commit file check I meant to run; the eleventh is the
tip). Frontend gate 629 (was 621; 7 lint warnings pre-exist at the same count). OpenAPI
regen: no drift. Roster smoke 4/4 green after the CSS fix; full smoke run in progress at
time of writing. `dg-land.sh DG-128 --dry-run`: rebase no-op on `f8995d3d`, both gates,
merge builds, `push --dry-run` accepted, nothing pushed.

**What David should know before he reads a screen.** Ranges like "Likely range 46 to 100"
are expected — σ_B is 20–23.6 a side, 157 of 388 veteran bands touch an edge. The TE rookie
cards are wider than yesterday's by 6.1 a side and that is a correction, not a change of
mind. The stale-run refusal is a NEW failure mode for the 09:00 chain and the card regen: a
retrain or re-promotion that moves a manifest stops the refresh with a named error until
`dvs_band.py`'s pins move with it — the re-pin is one constant per head, and the provenance
tests will refuse a pin that does not match the artifact. DG-128 reaches his screen only
after a second pull + restart (trunk is `f8995d3d` in the running API).

## Closeout audit 2026-09-02 07:15 — what the three independent auditors corrected

The closeout draft was audited (figures / prose / screen-path) before David read it. Corrections
to claims made ABOVE in this ticket, so the ticket does not carry them forward:
- "ONLY surviving record" for the 29.7 — FALSE, see the strikethrough above.
- "the full suite passes at every commit" — NOT ESTABLISHED at the time it was written: after
  the 06:33 fold every hash was rewritten and only the tip had been run in full. A detached
  per-commit run (full pytest + vitest at each of the 11) was started 07:09 and finished 07:21:
  ALL ELEVEN GREEN — Python 6696 → 6754 passed (32 skipped throughout), frontend 623 → 629,
  monotonic, no failure at any commit (log: scratchpad `percommit/log.txt`). The claim is now true.
- Second-pass audit (07:22): the batch also copies the 80 rookie cards' bands into their
  ENGINE_A rows, so the served runtime will carry 468 non-null bands (388 vets + 80 rookies;
  34 rookie bands touch an edge) — `grep -c dvs_band_low` would count 12,226 (nulls are
  written), the proof is `grep -c '"dvs_band_low": [0-9]'`. Four refresh windows failed on
  the DG-133 bug (09:00 on 08-31 and 09-01; 11:30 and 14:00 on 09-01), not two.
- "wider than yesterday's" — both card regens were this morning (05:59 and 06:30); trunk's cards
  carry no band. The low side widened 6.1 on 21 of 22 (Royer 6.0); the high side only where not
  already clamped at 100 (four were).
- "frontend 621 → 629" — trunk is 623 (vitest on a `git archive` of f8995d3d); the series adds 6.
- "the accessibility gate" — there is none in the land path (`dg-land.sh` says so in its own
  comment); axe runs only inside the hand-run Playwright smoke, which passed 25/25 at 06:48.
- "stops the refresh with a named error" — true of the assert, but the chain is FAIL-SOFT from
  David's seat: `run_pvo_refresh.py` records `status: aborted`, keeps yesterday's runtime pair
  serving, and the chain continues; the token is only in `pvo_refresh.err.log` (the report's
  `aborted_reason` is the CalledProcessError string). The check answered the DG-132 lane's
  question; it is this lane's design, not a David ruling.
- "reaches his screen after a second pull + restart" — INCOMPLETE. The band lives in the batch
  artifact `universe_pvo_runtime.json` (live copy has 0 band keys) and the served frontend is a
  gitignored `frontend/dist` built Aug 31 10:04 that nothing in the repo rebuilds. Pull + restart
  + `npm run build` in trunk + the next PVO refresh from trunk (09:00 chain, or the 11:30/14:00
  `dynasty-model-pvo-refresh` slots, which rebuild unconditionally) — one restart suffices, the
  artifact and bundle are read per request. The running API process started Aug 31 08:18, so
  DG-133 is not on his screen either until that restart. The trunk-bundle build gap deserves its
  own ticket.
- Player cards render "Likely range —" (a dash) for the 115 gated players; the roster row omits
  the line. Neither is a fault.

## LANDED 2026-09-02 07:43 — range-only cut on `main` at `1dff211f`

Acceptance output (dg-land.sh DG-128, run by David from his own prompt after reading the audited
closeout — typing it was his yes on the 29.7 amendment):

    → rebasing ticket/DG-128 onto origin/main — Current branch ticket/DG-128 is up to date.
    → running tests — Python gate green; frontend gate green
    34 files changed, 2367 insertions(+), 201 deletions(-)
    To https://github.com/davidtleess/dynasty-genius.git   f8995d3d..1dff211f  HEAD -> main
    ✔ DG-128 landed on main and pushed. Worktree and branch removed.

Also pushed beforehand by David: `origin/ticket/DG-128` (d72f27dc). The held fill remains on
`ticket/DG-128-fill-held` (fde9a5ca) — **PUSHED by David 2026-09-02 ~11:45: `origin/ticket/DG-128-fill-held` = fde9a5ca (ls-remote verified).** The ⚠ below is history.

Post-land, on David's "go" (07:44): `git pull --ff-only` → trunk `1dff211f`; `npm --prefix
frontend run build` → `frontend/dist` 07:44, bundle `index-BZ1jEJNN.js` contains "Likely range";
`launchctl kickstart -k` → API pid 4070 started 07:44:16, `/api/roster/audit` 200 with
`dvs_band_low` present (null) on 27/27 roster rows. Bands arrive with the next
`run_pvo_refresh` from trunk (09:00 chain; 11:30/14:00 slots rebuild unconditionally).
Greg (davidleess-0b) told the head sha at 07:45; his DG-137 rebases onto `1dff211f`.

⚠ `ticket/DG-128-fill-held` was a LOCAL branch in the product repo. dg-land removed the
worktree, not the branch — verify with `git -C ~/dynasty-genius-product branch --list
'ticket/DG-128*'` and push it on David's word before anything recreates a worktree over it.
