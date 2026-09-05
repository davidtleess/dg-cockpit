# DG-143 — Lower the season-games gate from 8 to 4 so a player who missed most of a season still gets a number

**Layer:** 2 · **State:** done · **Lane:** Davids-MacBook-Pro-32886 · **DG 3.0** · **product truth / coverage · medium**
**Source:** David's ruling 2026-09-03, in response to a written either/or. His answer was option A —
"drop the season threshold from 8 games to 4" — chosen over "only the 72 with a prior season on file"
and "leave them blank and explain why". Rationale in his words: *"the model is always making its
genuine estimate"*. This supersedes the coverage half of DG-130.

**Standing language ruling attached to this work, David 2026-09-03 verbatim: "no 'partial season' lang".**
He refused a proposed explanatory sentence for these players. **The number ships bare.** No caveat copy,
no hedge, no badge. This is consistent with his DG-128 ruling to let the number stand.

**Problem:** `ENGINE_B_MIN_GAMES_T = 8` (`src/dynasty_genius/models/engine_b_contract.py:143`) withholds the
0-100 value from any player with fewer than 8 games in the feature season. Live: **115 ENGINE_B rows carry a
null `dynasty_value_score`, 114 of them with `games_t` 4-7** (4:33, 5:29, 6:31, 7:21). Three sit on David's
own roster. The gate reads ONE season — `games_t` — so a player with a full career and one interrupted year
is refused, while the model has already produced a projection for him (all 115 carry `projection_2y`).

**What the evidence does and does NOT support (2026-09-03 measurement, recorded so nobody re-argues it):**
- The auditor's case for ungating — holdout RMSE 3.28 for 4-7-game rows vs 3.19 for 8+ — **does not survive**.
  The eligibility filter conditions on the outcome, so it measured only the 50.7% of that cohort who came
  back (vs 84.9% of the healthy). Scoring the served quantity honestly, ordering collapses: **Spearman 0.380
  vs 0.781**, 0 of 10,000 bootstrap draws overlapping. **Do not cite 3.28-vs-3.19 as justification.**
- **This lands on David's ruling, which does not need a holdout comparison.** The honest quality statement is
  "roughly half the ordering skill" — a fact for the record and for future work, NOT copy for the screen.
- The served value already applies a real discount: `P(plays) x E[points | plays]`. Measured availability on
  the live 2025 population: gated 4-7 cohort **mean 0.488** vs 8+ **mean 0.847**. The model is not blind to
  the absence; it prices it.

**Worked examples, computed 2026-09-03 through the real availability path (`score_rows`) — David has seen these:**
- **Garrett Wilson** (WR, 7 games, 14.2 ppg, 87% snaps): projection 11.23 ppg x P(plays) 0.885 = 9.94 ->
  **DVS 68.5** (undiscounted 77.5; the availability cut costs 9.0). Would slot ~WR37 of 199 scored WRs.
  The market has him WR16 / overall 46 — **the market rates him well above our model**, the opposite of the
  gun-shy story, and worth instrumenting rather than assuming.
- **Braelon Allen** (RB, 4 games, 3.8 ppg, 23% snaps): 4.89 x 0.657 = 3.21 -> **DVS 20.5**. Both a backup and
  genuinely hurt — snaps weeks 1-4 then a week-5 knee DNP and no further appearances (verified in
  `nflverse_injury_report` + `player_snap_count`).

**Fix shape:** `ENGINE_B_MIN_GAMES_T` 8 -> 4. Players at `games_t` 4-7 leave the dead-window branch and take
the PURE Engine B path (`pvo_assembler.py`), which already applies the hurdle. The precision-weighted blend
(`pvo_assembler.py:459-482`) keeps its `[1, gate)` window and continues to fire only where an Engine A prior
exists — **0 live rows today**, so the blend is not the mechanism here and must not be re-scoped to become one.

**⚠ MEASURE BEFORE LANDING — the population change is not confined to the 114:**
`xvar_percentile_overall` / `xvar_percentile_position` and `dvs_pct` are computed ACROSS THE SCORED
POPULATION. Adding 114 rows to 468 moves **every existing player's percentile**. Quantify the shift on
David's 27 and on the top 50 overall before landing, and report it to him — he must not discover a moved
percentile on a player he did not think was touched. Also re-check the ceiling population (`dvs_clamped`)
and the 8-TE-at-100 saturation, which this may worsen.

**Anti-scope:** do NOT touch `XVAR_LAMBDA_ENGINE_B`, `ENGINE_B_P90_PPG` or `ENGINE_B_REPLACEMENT_DVS` (a
coupled system, DG-092 guards it). Do not add explanatory copy (see the language ruling above). Do not widen
the blend. Do not change `training_eligible` or the 4-game pre-lag filter in `feature_assembly.py` — that is
separate work. Tank Dell is NOT reached by this ticket: he has no feature row and no `dg_player_id`.

**Verify:** null-DVS ENGINE_B rows 115 -> ~1; David's roster blanks 3 -> 1 (Dell only); Wilson 68.5,
Allen 20.5; the percentile shift on his 27 reported to him in writing before the land.

**Built 2026-09-03 08:20-08:58 by Tower, committed `ef08020c`, branch PUSHED to origin (backed up).
NOT adversarially reviewed and NOT landed — David said "close out" before the review ran.**

Suite **6821 passed / 33 skipped** on the committed tree (6816 is the count WITHOUT this ticket's own five tests). Five new contract tests in
`tests/contract/test_dg143_short_season_still_gets_a_number.py`.

**FOUR test files pinned the old gate with a literal `4` as "below the gate"** (the commit touches six FILES: one source, those four tests, one new test file), so
`test_engine_b_dvs_does_not_fire_below_games_gate` asserted the OPPOSITE of its own name once the constant
moved — and still passed, for the wrong reason. All four now read `ENGINE_B_MIN_GAMES_T - 1`, including the
blend-weight and caveat-token expectations.

**The market check David asked for, run before building (this is the justification, not the RMSE argument):**
new scores vs FantasyCalc **Spearman 0.711** (n=32 priced of 114) against **0.795** (n=336) for the players
already scored — **but that was DATE-LUCKY and is the most favourable of seven daily snapshots. Corrected by
the closeout audit: across the seven market snapshots on file the new-cohort figure runs 0.634-0.711 (mean
~0.67; 0.643 on 09-03's own market) while the baseline holds 0.788-0.805, so the real gap is ~0.13, not 0.08.
At n=32 the 95% interval is 0.47-0.86 and 15% of random 32-player subsets of ALREADY-SCORED players land at
or below 0.711 by chance. Do not quote 0.711-vs-0.795 as a clean pass.** Of the 82 the market declines to price at all, **94% score below 20** (median 6.6) —
two systems sharing no inputs reaching the same verdict. Named top of the unlocked cohort: Malik Nabers 76.8,
Garrett Wilson 68.5, Jayden Daniels 61.0, Jayden Reed 46.2. Tyreek Hill lands 29.0 and the MARKET is harsher
still (634, below Calvin Ridley) — Tower's initial worry that 29.0 was too low was wrong in the other direction.

**⛔ STILL OPEN AND UNDECIDED — David has the numbers, has not ruled:** percentiles are population statistics,
so adding 114 rows moves every existing player's `xvar_percentile_overall` by a mean **6.8 points** (max 11.2;
>5 points on **329 of 468**) and drops the population median DVS 42.7 -> 34.1. **CORRECTED by the closeout
audit — the earlier 7.1/11.7/322 figures ranked on DVS; the field actually ranks on `xvar`
(`universe_pvo_batch.py:123-136`). And the shift is far less alarming than first reported: 463 of 468 move UP,
2 fall by 0.1, and NO existing player's rank relative to another changes — the ordering is mathematically
untouched, since each player's position is fixed by his own xvar.** Tower proposed freezing the reference population, then withdrew the recommendation on inspection:
freezing would silently redefine the statistic as "rank among players with 8+ games". **Do not land DG-143
without putting this to David with both variants measured on his own 27 rows.**

**LANDED 2026-09-03 23:40 ET — merge `22d904b0` on `origin/main`, on David's word.** Greg asked him in plain terms
(~23:28 ET): "lowering the games threshold gives 114 more players a number, including Wilson and Allen on your roster.
Side effect: because more players enter the comparison, everyone's position percentile rises about 7 points on
average, and nobody swaps places with anybody. Do you want that landed with tomorrow's pull, or held?" David, 23:35
ET (03:35:57Z), verbatim: **"3) yes land it"**. Landed by Greg (`davidleess-eb [a78c76]`) via `dg-land.sh DG-143`: rebased onto
origin/main (on top of DG-144); pytest **6834 passed / 33 skipped**; frontend gate 629/629 + build; merge + push;
worktree removed. One extra commit `5426ffbd` before landing: the gate comment now cites this ticket's audited market
figures (0.634-0.711 across seven snapshots vs 0.788-0.805) instead of the date-lucky 0.711-vs-0.795; no behaviour
change. **NOT LIVE** until the trunk pull + rebuild + restart (David: "tomorrow is fine").

