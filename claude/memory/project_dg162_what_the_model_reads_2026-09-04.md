---
name: project-dg162-what-the-model-reads-2026-09-04
description: DG-162 measured 2026-09-04 — the four Engine B models read three columns (ppg_t, games_t, age); the scaler objection was tested and is false; 411 warehouse columns held, 6 reach a model.
metadata:
  type: project
---

**DG-162, measured 2026-09-04 by Bob, ticket `9a2743d` in `~/dg-build`. No code changed.**
The data half of David's "make the model robust AND use the data at our fingertips" — ten
tickets landed that day and every one was scale or display.

**THE HEADLINE: the four Engine B models read three columns — `ppg_t`, `games_t`, `age`.**
Leak-free walk-forward (expanding window, train seasons ≤ s−3 per the DG-027 rule, paired
cluster bootstrap on player) against a 3-column model:
QB **+0.030 CI [−0.027,+0.088]** and RB **−0.000 CI [−0.012,+0.011] BOTH SPAN ZERO**;
WR +0.010 [+0.001,+0.019] and TE +0.008 [+0.000,+0.017] real and ~1/100th of r².

**Drop test** (set a column to the model's own imputer median, rescore the live 505,
convert to DVS): **24 of 62 feature slots cannot move any card by 0.5 DVS.** `snap_share`
max .09 QB / **.003 RB** / .23 WR — and at TE its coefficient is **−0.886** (more snaps,
lower score). `epa_per_dropback` .02, `dakota` .01 — dead; only `cpoe` survives at QB.
**`aging_curve_value` dead in ALL FOUR** while raw `age` is top-5 in all four. `tprr` dead
in both carriers. NGS is alive (TE 7.3/6.9 — strong) and the old "premium data reaches
zero coefficients" claim is correctly retired.

**⛔ THE SCALER OBJECTION IS FALSE — tested, do not re-derive.** Engine B v2 is a bare
`RidgeCV` with **no StandardScaler**, penalising by raw magnitude, and the dead list sorts
almost perfectly by feature SD. DG-017 measured that a scaled fit lifts usage weight
9→30% QB / 3→32% WR. Refit with a scaler on the same folds: **every arm within noise of
the shipped one, and NO position beats three columns detectably once scaled** (QB −0.001
[−0.077,+0.067], RB +0.006, WR +0.008, TE +0.015 — all span zero). Scaling redistributes
weight and does not improve the forecast. **This ANSWERS DG-025** (todo since the board
opened) and completes DG-017. It does NOT license adding the scaler — that moves every
published number without improving one.

**⛔ THE WAREHOUSE IS NOT THE FEATURE PIPELINE.** `assemble_engine_b_dataset.py` pulls
`player_stats`/`rosters`/`snap_counts`/`pbp`/`participation` **live from `nflreadpy`**;
`load_nextgen_from_export` is the ONLY route out of `nflverse_usage.db` into a model.
Auditing the warehouse as the feature path gives a wrong answer in either direction.
The DB: 13 tables, 2,718,461 rows, **411 substantive columns → 6 reach a model** (all NGS).
Served models are named by `engine_b/v2_manifest.json`, **not** `app/data/models/*.pkl`.

**⛔ §5 RETRACTED THE SAME DAY BY THE SAME LANE — do not repeat it.** The ticket first called the
09-01 games lags (`games_t_minus_1/_2` + flags, `738b7525`) "plainly unfinished". **They are a
DELIBERATE carry.** The four facts were right — written daily, absent from training, not in
`ENGINE_B_ALLOWED_FEATURES`, read by nothing — the *inference* was not. The commit BODY says
**CARRIED NOT CONSUMED**, "Deliberate, and each reason measured": consuming them moves
feature_completeness for 229 of 505, changes **227 displayed values**, and renders the raw string
"games t minus 1" into caveat copy (a DG-109/117 violation). **DG-127 is `done`; David ruled 09-01
"wait, do not force."** Neither finishing nor deleting is available to a lane.
⚠ Still open, as a QUESTION for David and not a build: DG-143 moved `ENGINE_B_MIN_GAMES_T` 8→4 on
his 09-03 ruling, so the gate the carry was built to inform now refuses nobody (Wilson passes;
**0 of 505 rows under 4; all 115 the old gate refused are admitted**). Does the carry still have a
purpose, or is it inventory?

**The one thing DG-162 flagged that survived:** P(plays) carries no injury feature while 45,337
injury rows sit unread — and that was then measured and came back NEGATIVE, see
[[project_dg163_injury_does_not_predict_availability_2026-09-04]].

**⛔ THE 38 GB RAW ARCHIVE IS NOT SLACK** — `ROADMAP-LAYERS.md` records it as the
point-in-time archive fuelling the 2027 rebuild, holes "permanently unbackfillable".
`contracts` is **23 GB of the 38** for a table no model reads (storage question, not waste).
Unexplained: the daily contracts snapshot fell 1.71 GB → 228 MB on 09-02 while row count
ROSE, with no commit to `nflverse_usage.py`.

**⛔ Do not sell the unread data as money on the table.** Training rows are 264/577/910/490.
Features 4-through-17 return zero for QB and RB and §2b shows that is not fixable. Fourteen
columns already behaved like noise. Related: [[project_ranking_diagnosis_2026-08-31]],
[[project_review_verdicts_2026-09-03]].
