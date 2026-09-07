# DG-177 — Test and build a veteran forecast candidate using information available at the time

**Layer:** 3 · **State:** candidate BUILT and MEASURED 2026-09-06 — report-only, nothing served changed · **Lane:** Davids-MacBook-Pro-23481

**What's missing:** David needs veteran rankings whose additional football inputs earn their effect on forecasts; the DG-162 audit found little incremental predictive value beyond recent PPG, games and age.

**How we know:** `tickets/DG-162-what-the-model-actually-reads.md` reports season-forward ablations and source coverage; David's 2026-09-06 orchestration request authorizes building a scientifically sound personal rankings product. Assignment details: `ORCHESTRATION-2026-09-06.md`.

**Done looks like:** A reproducible candidate runner compares the deployed model, a simple recent-production baseline and at most one justified football feature family, with all transforms/tuning fitted inside training windows and outcome windows fully known before each test forecast. It reports sample/coverage counts, paired errors, ranking quality and uncertainty by position and fold, and retains failed candidates honestly. Regression tests reject future labels/features and exclude third-party fantasy predictions from inputs. A run-scoped evidence artifact names the actual model and source versions. Candidate code is reviewable; publishing or changing the served model is outside this increment.

Start by reusing verified DG-162/DG-017 work and checking remaining source timestamps; do not repeat the same scaler experiment or infer that more columns must help. Prefer a bounded measured-opportunity feature experiment if historical coverage is sufficient. If not, implement the reusable honest evaluation path and state the measured missing evidence. Preserve prior decisions on veteran draft capital and the 2027 rebuild timetable.

---

## EVIDENCE 2026-09-06 (lane Davids-MacBook-Pro-23481) — built, run, reproduced

**Where:** branch `ticket/DG-177` from origin/main `ecc260ef`, worktree `~/dg-wt/DG-177`. Run
`runs/20260906T133309Z/dg177_veteran_candidate/` (`results.json`, `predictions.csv` = one row per test row per arm,
`report.md`). Human report: `docs/experiments/2026-09-06-dg177-veteran-candidate.md`. Trunk untouched; no shared
write; no restart; no promotion; not merged. An earlier run `20260906T132607Z` (single reference arm) is superseded
and left uncommitted.

**Code:** `src/dynasty_genius/eval/veteran_candidate.py` (cutoff rule, `FutureLabelError`, feature gate reusing the
contract's DG-173 class ban, deployed recipe refit in-window, player-resampled paired bootstrap, skipped folds
written not dropped, run dirs never overwritten) · `src/dynasty_genius/eval/opportunity_features.py` (raw per-game
targets / air yards / carries / pass attempts; `xfp_*` exposed separately as exploratory) ·
`scripts/experiments/dg177_veteran_candidate.py`. 47 tests written first; both guards mutation-checked (cutoff
disabled → 2 tests fail; projection gate disabled → 7 fail).

**Cutoff.** Label is final at t+2, so the honest rule is t+2 ≤ s (= the trainer's DG-026 `no_shared_outcome_season`
for one test season; a test asserts agreement). DG-162 used t+2 < s; kept as a named option and **DG-162 §1
reproduced exactly** under it (QB/RB/WR/TE n 95/284/456/244, r² and Δr² to three decimals).

**Result under the honest rule (test 2020–23; QB 2020 skipped at 40 training rows, written as skipped):**
- DG-162 stands: served set beats 3 columns detectably only at WR (+0.012 [+0.003, +0.020] r²) and TE (+0.014
  [+0.006, +0.024]); QB +0.031 [−0.014, +0.077] and RB +0.007 [−0.009, +0.022] span zero.
- **Opportunity family over the served set: nothing detectable anywhere, and the null is BOUNDED** — RB −0.001
  [−0.006, +0.005], WR −0.003 [−0.008, +0.002], TE −0.014 [−0.045, +0.010], QB +0.021 [−0.024, +0.063] r². At QB
  the 2022 fold alone is +0.121 [+0.043, +0.226] and 2021 is −0.075 [−0.202, +0.039]: 141 rows, 67 players.
- Exploratory `xfp` (nflverse expected points, **retrospective: model trained 2006-2020 per its docs**) adds
  nothing over the served set and is detectably worse at QB (−0.069 [−0.134, −0.018]).

**Findings for the orchestrator:** (1) `eval/backtest_harness.py` `WalkForwardDriver` splits on
`feature_season < test_year` and therefore shares an outcome season between train and test — the leak DG-026 fixed
in the trainer and not in the harness; another lane's file, not touched. (2) The served pickles are `RidgeCV(cv=5)`
(random folds); main's trainer now selects alpha on player-clustered time folds (DG-027). "Deployed" here = the
served recipe. **Blocker: none.** Next if wanted: QB opportunity under `select_alpha_leak_free`, same folds.

**Alignment note from DG-178 (09-06):** the candidate's target is the same object and event as the served
`projection_2y` (E[avg PPG t+1,t+2 | outcome_returned]), so a future per-player forecast would be a one-column swap
in their veteran adapter — but nothing here earns that swap yet, and the run emits no 2026 forecasts. DG-178's
contract has a slot for **per-season conditional means (t+1, t+2 separately) with a per-season P on one event**,
which would fix their h=0 availability overstatement; the cutoff rule here already takes a `window` parameter, so
that needs the assembler to keep `ppg_t1`/`ppg_t2` (dropped today after averaging), not a new rule. Not started;
Codex's to schedule.

---

## ROUND 1 CORRECTIONS 2026-09-06 (review `REVIEW-2026-09-06-ROUND1.md`, lane 23481) — items 1–4 DONE

**Checkpoints:** `e680e48b` (closure + inner tuning), then the evaluator/denominator/annual commit that follows this
note. Nothing served changed; no shared write; no merge.

**Item 1 — closure and inner tuning.** One shared rule `models/label_closure.py` (t + window ≤ s). Fixed:
`eval/backtest_harness.py` both mask sites (WR pinned train sizes 294/454/607/755 → 145/294/454/607);
`models/availability.py` (first testable season 2020 → 2021); trainer inner selection moved to
`models/leak_free_tuning.py` with inner labels closed at the validation season and the imputer fitted inside each
inner fold, trainer passes the RAW matrix. Tests: an open label cannot move the fold it was open for (harness,
availability, tuning); the two contract guards updated with named allowances. **Cost measured:** the corrected
inner selection needs three feature seasons; the file starts 2018, so two-year test folds 2020/2021 are unevaluable
and written as skipped; 2022/2023 evaluate.

**Item 2 — denominator.** Rates now divide by `games_t` (all games, DG-024 untouched); 1,061/3,337 joined rows had
fewer source weeks than product games; 3,265 zero-opportunity games counted; 47 rows unavailable → NaN, never 0.
`opp_weeks_in_source` carries the source's own count under its true name.

**Item 4 — evaluate as final scoring fits.** Run `20260906T144343Z`: every arm `leak_free`; served recipe kept only
as `deployed_recipe_reproduction`; top-k averaged within forecast seasons; DG-162 §1 still reproduced exactly.
**Corrected result (folds 2022, 2023):** served set beats 3 columns detectably at QB +0.052 [+0.015, +0.092], RB
+0.027 [+0.005, +0.047], WR +0.020 [+0.007, +0.032]; TE +0.020 [−0.007, +0.045]. **Opportunity over the served
set: QB +0.000 [−0.066, +0.055], RB −0.006 [−0.015, +0.002], WR +0.000 [−0.002, +0.002], TE −0.036 [−0.107,
+0.011].** Stated narrowly: the tested raw-rate ridge additions showed little gain; this does not prove
opportunity information has no value. Corrected recipe vs served recipe on the same folds: WR −0.004 [−0.008,
−0.001] for the old one, others within a hundredth. Report: `docs/experiments/2026-09-06-dg177-veteran-candidate.md`.

**Item 3 — annual forecasts.** Contract agreed with DG-178 (their typed spec; my five limits accepted): REG scope,
`fantasy_points_ppr`, exposure = stat-row weeks, event A_j = appeared (≥ 1 game), quantities p_appear /
e_points|appear / e_games|appear / p×e, horizons 1–2 only, population = 2025 feature rows, `no_feature_row` never 0.
Built: `eval/annual_outcomes.py`, `eval/annual_forecasts.py`, `scripts/experiments/dg177_annual_forecasts.py`
(labels from a fresh nflverse weekly pull saved with sha), 26 tests. **Run `20260906T145606Z`
(`runs/20260906T145606Z/dg177_annual_forecasts/`): alignment check EXACT — summing `fantasy_points_ppr` over
REG+POST reproduces `total_points_t` on all 3,384 rows (max diff 6e-14), so the label source is the product's own.**
Exports: `annual_forecasts.csv` (candidate = the three-column set, 505 rows of the 2025 partition, both horizons),
`annual_forecasts_served_features.csv` (comparator), `manifest.json` (every typed term + shas), historical
predictions, results, report, the weekly snapshot. Report: `docs/experiments/2026-09-06-dg177-annual-forecasts.md`.

**Annual results (Δ = model − training-only baseline, 90% player-resampled):** P(appear) beats the base-rate Brier
at every position/horizon except QB year-2 with the served list (0.199 vs 0.188; the 3-col arm 0.163). Unconditional
season points beat persistence detectably at RB and WR on both horizons (Δr² +0.03 to +0.10), not detectably at TE,
and not at QB — where the served-list year-2 forecast is detectably WORSE than persistence (ΔRMSE +6.6 [+0.8,
+12.1]). Games|appear gains (+0.16 to +0.38 r²) are mostly the constant baseline losing to `games_t`. **Candidate arm
= 3 columns**, chosen on the same folds (a selection between two arms, stated in the manifest); both arms exported.
Year-2 rests on two folds; there is no 2024 feature season in the file (assembler), so year-1 has no 2024→2025 fold.
Horizons beyond 2 unsupported. Handed to lane 25057.

**Also reported, not touched:** `eval/te_role_risk_experiment.py:82`, `eval/qb_v3_walk_forward.py:131`,
`eval/te_archetype_bakeoff.py:100` still split on `feature_season < test_year` (outside the review's named files).

**Consumed by DG-178 (09-06, their run `20260906T150758Z`):** the annual file composed into their first comparable
two-season board; 502 of 505 rows identified against the artifact (3 not present, noted on their bar). They changed
THEIR replacement rate to E[points_j]/17 per league week after seeing that the best available QB/RB by expected
season points are part-time (a per-game rate applied to a full-timer zeroed real players) — their estimand, nothing
for this lane to change. Their board carries my grading on every term via
`results.historical[pos][year{j}][recent_production_3col].pooled.points_unconditional` (QB year-2 reads "does not
beat persistence, 92.1 vs 89.6", which is correct); they did not downweight or drop it — a policy choice left for Codex.

**DG-178's grading of the assembled value on my withheld seasons (their run `20260906T151423Z`):** predicted
C = max(0, e_points − R·e_games) vs realised, per position and forecast season, against my baseline arm under the
same bar. Season 1: Spearman 0.55–0.68, top-k overlap 0.58–0.76, decision value above the baseline at all four
positions; season 2: QB/RB/WR above, TE just below (3,238 vs 3,261). QB year-2 assembled beats the baseline on
decision value although its points RMSE does not — consistent with my terms: the 3-col appearance model beats the
base rate at QB year-2 (Brier 0.163 vs 0.188) while the points model does not beat persistence; the note stays on the
terms. Their joint cells show my started veterans' predicted C slightly HIGH (+0 to +16 points): selecting players
because their forecast is high produces positive errors among the selected (a winner's-curse effect of the
ranking-then-grading design), not evidence that the marginal forecast is biased — worth stating before anyone
"corrects" it. No change requested; nothing changed here.

---

## ROUND 2 (review `REVIEW-2026-09-06-ROUND2.md`, lane 23481) — items 1–6 DONE

**Checkpoint `e8fc3071`** (items 1–4 code) + the handoff commit that follows. Nothing served changed; no shared write.

- **Item 1 manifest:** arms and positions at their own levels; input + output hashes; `scoring_arm`, `outputs_sha256`,
  `source_validation`, `selection_policy`; `validate_manifest` refuses the round-1 shape (test).
- **Item 2 masks:** TE role-risk + archetype (window 2) and QB v3 (window = horizon) use the shared closure rule;
  open-label mutation invariance tested for each; TE imputers keep empty features and the role-risk fold records
  candidate columns unobserved in its closed window. `qb_v3_walk_forward.py` is an F25 frozen artifact —
  **re-pinned in both registered places** (`run_qb1_study.py`, the QB1 green contract test) with the dated reason;
  H1's split is unchanged by closure, H2/H3 now closed. Published QB-1 results unaffected; a re-run would grade H2/H3
  on closed folds.
- **Item 3 source guard:** `validate_weekly_source` (season completeness/week range/player floor, uniqueness,
  no missing points or ids); the pull no longer fills NaN with 0; outcomes/targets refuse an unvalidated source.
  nflverse's per-week placeholder rows (no id, no position, 0 points; 173 over 2018–25) are dropped and counted;
  an unattributed row WITH points is refused (it fired on the 2005+ pull — being inspected).
- **Item 4 policy:** {baseline, 3-col ridge, blend .25/.5/.75} chosen per position/horizon/quantity on closed inner
  folds (candidate refit leak-free inside), applied by the same function final scoring calls; test labels cannot
  influence selection (test). **Handoff run `20260906T154635Z`:** year-1 policy evidence on folds 2021–23 — RB
  +0.053 [+0.028, +0.079] and WR +0.030 [+0.013, +0.048] unconditional-points Δr² vs persistence (detectable), QB
  +0.015 [−0.009, +0.041], TE +0.014 [−0.012, +0.043]; P(appear) beats the base rate at all four. **Year 2: NO
  evaluable fold on the 2018-based file** (nested selection needs a longer window); exported with the policy chosen
  on the full closed window, ungraded, stated in the manifest. QB year-2 not downweighted anywhere.
- **Items 5–6 (in progress):** `eval/basic_cohort.py` (first-party production/games/age/lag/last-seen features;
  a whole missed season after an active one is a zero-games row, two absent seasons leave the cohort; modal
  stat-line position; missing birth date → NaN age, flagged), `eval/universe_reconciliation.py` (every DG-178
  universe row → forecast or one precise reason), `scripts/experiments/dg177_basic_horizons.py` (2005+, years 1–5,
  unsupported cells reported not filled). **Identity fact:** DG-178's message swapped two Sleeper ids — 9484 is
  Tucker Kraft (their universe file is right), Tank Dell is 9502 → gsis 00-0038977 via nflverse ff_playerids; the
  other nine map. First 2005+ run refused on 2 unattributed rows with position/points — inspecting.

**Items 5–6 delivered — run `20260906T155259Z` (`runs/20260906T155259Z/dg177_basic_horizons/`), report
`docs/experiments/2026-09-06-dg177-basic-horizons.md`.** Basic cohort 2005–2025: 14,555 rows; source guard passed
(173 placeholders dropped and counted; two unattributed stat lines, 6.0 in 2005 and 3.1 in 2012, dropped under a
stated 10-pt/season tolerance and listed). **Policy evidence:** beats training-only baselines detectably at every
position for years 1–4 on 14/12/9/5 folds (unconditional-points Δr² e.g. WR y3 +0.202 [+0.161, +0.240], RB y4
+0.214 [+0.158, +0.254], QB y4 +0.099 [+0.024, +0.155]); **year 5 rests on ONE fold** (QB +0.091 [−0.180, +0.245],
RB +0.261 [+0.048, +0.361], WR +0.123 [−0.042, +0.237], TE +0.196 [+0.104, +0.275]) — forecast, graded once.
Not comparable to the annual handoff by population (this cohort admits 1-game seasons and absences). **Inference
cohort 750 rows incl. 137 zero-games 2025 rows; Tank Dell present** (p_appear 2026 = 0.34, 2027 = 0.37; e_points
2026 = 22.9). **Universe (4,041 rows) reconciled:** forecast 740 (228 rostered) · no_gsis_mapping 1,397 (rostered:
Matt Hibner) · left_cohort 1,285 · no_nfl_history 616 (44 rostered = 2026 draftees, rookie lane) ·
position_outside_modelled_set 3 (Hunter — DB by stat line, WR per ff_playerids; a modelling choice, stated not made;
Beck, Heyward). The manifest for this run was FINALIZED from its own outputs after the run refused it for an arm
name the validator did not accept (no recompute; stated in the manifest); the validator now takes the runner's
declared arms and required inputs. `historical_predictions.csv` (11 MB) is kept on disk and pinned by sha, not
committed. QB year-2 never downweighted; the policy is chosen per cell.

**Codex review of `46a289fb`/`e8fc3071`, canonical `20260906T154635Z`: PROVISIONAL RESEARCH-INPUT PASS — not
validation, not promotion.** Bounded corrections applied without a new forecast run:
- `docs/experiments/2026-09-06-dg177-annual-forecasts.md` now leads with the canonical policy result (year 1 on
  folds 2021–23: RB/WR baseline improvement within the reported 90% interval, QB/TE inconclusive; **year 2: ZERO
  evaluated policy folds**); the round-1 tables are an appendix labelled SUPERSEDED comparator, and the withdrawn
  sentences ("both horizons beat persistence", "year 2 rests on two folds") are named as withdrawn.
- **Machine-readable per-horizon evaluation status:** `eval/evaluation_status.py` (status ∈ evaluated /
  no_evaluated_policy_fold / unsupported; folds graded; baseline comparison worded from the 90% interval; calibration
  diagnostics — ECE and reliability slope/intercept from the graded predictions, because a better Brier alone proves
  nothing about calibration). Written as **companion records beside the immutable runs**
  (`runs/20260906T154635Z/dg177_annual_forecasts.evaluation_status.json`,
  `runs/20260906T155259Z/dg177_basic_horizons.evaluation_status.json`, each naming its run's results sha) and into
  every future manifest by both runners (`manifest.evaluation_status`, `manifest.meaning`).
- Wording fixed in code and docs: **"supported" = closed history sufficient to evaluate, not validation**; the
  bootstrap is **sampling uncertainty conditional on the fitted models**, not model/selection/season uncertainty and
  not fit uncertainty.
- These exact limits sent to lane 25057 for the preview.

**Codex independent review of `2e2f57e8` / basic run `20260906T155259Z`: forecast values PASS the bounded five-year
RESEARCH gate** (56 focused tests, 750 unique complete players, all 8 real file hashes, 14/12/9/5/1 fold closure
verified; the active ≥4-game subgroup retains RMSE gains at all positions y1–4; **no market-edge proof**), after:
- **HARD fix applied:** the run's manifest carried an `annual_forecasts.csv` hash for a file the run never wrote (an
  alias to satisfy the annual validator's fixed key). `validate_manifest` now requires the hash of the file named in
  `exports.candidate` and, given the run dir, refuses any outputs entry whose file is absent or whose hash mismatches
  (tests). Immutable run untouched; **corrected companion manifest**
  `runs/20260906T155259Z/dg177_basic_horizons.manifest.corrected.json` (names the original's sha and the defect;
  forecast bytes unchanged). ⚠ Readers must take the candidate file from `exports.candidate` and its hash from
  `outputs_sha256[that name]`; the original `manifest.json` in that run dir still carries the fictitious key. Future
  runs also write `dropped_rows.csv` (replay of the cleaning step).
- **Copy fixes:** long run dropped **444** placeholders (173 is the 2018–25 annual pull); the two unattributed stat
  lines dropped under the 10-pt tolerance are a disclosed cleaning exception, not proof of completeness, and the raw
  dropped rows were not retained in that snapshot (replay limit); lower historical Brier ≠ detectable/calibration
  proof; `seasons_played` = seasons observed since 2005 (left-censored), not career length; year 5 graded on the
  single 2020→2025 season; cohort = played this or last season, Hunter excluded by the explicit position rule;
  bootstrap = sampling uncertainty conditional on fitted models.

**Read-only cross-review of DG-178 round-3 checkpoint `96a683ab` (Codex-assigned): RESEARCH PREVIEW PASS, not live
validation, no counterexample.** Verified by file/row: season mapping t→t+1 on both producers and k-sum cells keyed by
origin with consecutive targets; policy-only reads (annual season 2 "not graded", n 0); same-origin own-reference
sums recomputed exactly from my exports (Kraft +6.476/+12.206 vs Parkinson; Dell five margins vs Mims, all replace,
value 0); both history shas + results shas match, the five-year producer binds to my CORRECTED companion manifest;
fold counts 14/12/9/5/1 and annual 3/0 displayed with "a single fold is not support"; Dell distinct on both views;
reference scenario stated, advice words only in disclaimers. Wording nit sent (five-year support summary line).

**Codex FINAL review of `5082e47c`: five-year RESEARCH preview APPROVED** via the corrected companion manifest +
status record (all 8 actual output hashes, companion→original/results/history bindings, 20 cells at 14/12/9/5/1
verified; immutable files unchanged). Acceptance sent to lane 25057. **Future-run bug fixed at `240fa937`:** the
dropped-rows capture added after the consumed runs took raw.index − cleaned.index AFTER the cleaner's reset_index
(would have saved trailing positions); `split_unattributed_rows` now returns the removed rows with original indices,
both runners write those, and a non-consecutive middle-removal fixture proves exactness. No forecast, companion or
hash affected; no rerun. Cross-review of DG-178 `96a683ab` already reported as research preview pass.

**Re-check after DG-178 `9487a7e0` (audit `20260906T165547Z`), read-only:** both preview horizon views are now prefix
sums of ONE term set from my basic five-year producer (corrected manifest) + the rookie file. Verified by row: Kraft's
two-year margins (+12.750, +34.956) = my `basic_forecasts.csv` e_points years 1–2 minus Parkinson's basic rows; the
five-year view's first two margins are identical; Tank Dell now has a two-year number (0.0, comparable); the five-year
support sentence names seasons 1–4 and calls season 5 one fold. Still research preview, not live validation.

---

## CODEX INCREMENT 09-06 (David: championship ends NFL Week 17; continue) — veteran adapter/refit + offensive-role coverage

**First action DONE — checkpoint `568b247f`: general same-season offensive-role fallback.** Rule: a non-offensive
modal stat-line position may be modelled under exactly one offensive role found among the SAME season's historical
roster rows (position + depth chart, dated inside the season = captured before the forecast origin); two distinct
roles abstain; none → unknown; no rows → no evidence; offensive stat-line positions kept whatever the roster says;
today's listing never used; nobody hardcoded; stat-line position + source + evidence kept on the row; PPR points
unchanged (a pure defender contributes 0). Roster evidence chooses the MODEL cohort only (Sleeper decides eligibility).
Source: DG-165's immutable capture `dg-wt/DG-165/runs/20260906T154706Z/dg165_rookie_capital/inputs/nflverse_rosters.parquet`
(one season-end row per player-season, 1999–2025, week-dated; Hunter's only 2025 row: week 19 WC, JAX, WR/WR, RES),
hashed as a required manifest input. Tests: offensive unchanged · eligible non-offensive fallback · absent/conflicting
→ unknown/abstain · no future-season reach · no defensive points · no-roster case. **Regrade running** (all horizons,
2005–2025, both the universe reconciliation and status record follow) — no forecast merely appended.
**Part 2 pending Codex's common player-season artifact** (player_id, season, points, games, appeared; REG weeks 1–16
through 2020 / 1–17 from 2021; scoring identifier "nflverse-default-PPR league-window research", not David's exact
scoring). Consumer being written against that schema; DG-165 owns the raw capture (no duplicate download; asked them
to record missing-id rows per season, done).

**Checkpoints `495d4371` + `1c189c2b` (Part 2 readiness, no artifact yet):** `eval/common_outcomes.py` consumes Codex's
common player-season artifact (player_id, season, points, games, appeared) as the label source — binds CSV bytes to
the manifest sha; requires REG league window (weeks 1–16 through 2020 / 1–17 from 2021, equal weights), a scoring
identifier, `exact_league_scoring: false` (refuses any claim of David's exact scoring), `source_validated: true`;
requires points/games/appeared from one mask row by row; never re-scores. `annual_targets` censors seasons outside
the artifact's declared coverage as UNKNOWN, never zero. Runner flags `--outcomes-artifact/--outcomes-manifest`;
features stay ALL NFL games; manifest records `label_source`, `scoring_scope` and **`window_id`**
(`all_reg_weeks` for this lane's REG aggregation, `championship_week17` for the common artifact) for DG-178's typed
adapter. ⚠ The manifest field names are this lane's EXPECTED schema (`scoring_identifier`, `exact_league_scoring`,
`scope.season_type/weeks.through_2020/from_2021/week_weights`, `columns`, `seasons_covered`, `source_validated`,
`csv_sha256`); if DG-179 publishes other names the validator names the missing one. DG-165's full weekly capture:
`dg-wt/DG-165/runs/20260906T191723Z/weekly_source_capture/` (their manifest sha in their ticket); no duplicate
download here. Fallback regrade (2005–2025, all horizons) still running.

**Fallback REGRADE done — run `20260906T191832Z` (new five-year producer; companions
`dg177_basic_horizons.manifest.corrected.json` + `.evaluation_status.json` beside it).** 233 player-seasons resolved by
same-season roster role (RB 196 / TE 26 / WR 10 / QB 1), 0 conflicts, 30,164 non-offensive stay out; cohort 14,555 →
14,788; 2025 rows 750 → 759; universe forecast 740 → 743 (Hunter → WR via 2025 wk-19 roster WR/WR, 2026 p_appear 0.89,
e_points 85.4; Beck → RB; Heyward → TE). Regrade: fold counts unchanged 14/12/9/5/1; RB moved a few thousandths (y1
+0.088 vs +0.091; y5 +0.226 [+0.087, +0.291] vs +0.261 [+0.048, +0.361]); QB y3 interval now just includes zero
(+0.062 [−0.001, +0.112]); WR/TE unchanged. No reading changed. ⚠ This run used the cleaner's then-default 10-pt
tolerance (disclosed in the companion as a cleaning exception); **defaults now refuse unattributed points unless a
tolerance is passed explicitly (`--tolerated-unattributed-points`)**, validation facts say `game_coverage_checked:
false`, per Codex's contract note. Window id `all_reg_weeks`. Forecast export now carries `statline_position`,
`position_source`, `role_evidence` (future runs).

**Cross-check of DG-178 candidate audit `20260906T193509Z` (checkpoint `0364881d`) on my refit `191832Z`: research
preview pass.** Identical prefix terms verified by them (825 players, 0 violations); evidence bound through the corrected
companion manifest `efc3bfe0…` and `basic_forecasts.csv` `4872bf73…`. Rows reproduce exactly from my export: Kraft
two-year 47.51 = +12.676/+34.833 vs Parkinson's own rows; five-year 125.67 (+28.549/+24.783/+24.832 after); Hunter WR
research estimate 0 on both views, margins −26.5/−24.2/−28.4/−20.4/−17.1 vs Mims (112.0). RB season-1 forecasts moved ≤
2.82 points vs 155259Z (mean +0.008), so the RB reference flip (Hunt edges Estime by 0.2 in season 1; later seasons far
below) is the same-player-every-season reference scenario, not the model — DG-178 has reported it to Codex as a
football/reference choice; nothing changed here. Still `all_reg_weeks`; championship window waits on DG-179.

**DG-165 source preparation for the common outcomes (their run `20260906T194454Z/source_preparation/`, schema
`dg179_source_preparation_v1`):** admitted seasons 2001–2025 (1999/2000 EXCLUDED as incomplete, never zero-labelled);
exact REG game ids agree with the official schedule in every admitted season; quarantine = 524 zero placeholders + the
six reviewed nonzero records (2001×3, 2003, 2005 +6.0, 2012 +3.1 — the last two are the ones my cleaner found);
`research_qualified: true`, `individual_stat_completeness_proven: false`, exposure = stat-record weeks, no exact-league
claim. Codex's central CLI binds this into the common outcome artifact I consume. ⚠ Consumer note: their manifest
vocabulary (`research_qualified`, `individual_stat_completeness_proven`) differs from my expected `source_validated`;
I will adapt `common_outcomes.validate_common_manifest` to Codex's ACTUAL artifact manifest when it lands (no guessing
now), carry `individual_stat_completeness_proven: false` into my manifest, and expect `seasons_covered` from 2001 —
my basic features (2005+, ALL games) are unaffected; `annual_targets` censors any uncovered season as unknown.

**Consumer ALIGNED to DG-179's actual schema `dg179_league_season_outcomes_v1`** (read-only from
`dg-wt/DG-179/src/dynasty_genius/eval/league_season_outcomes.py`): checks `schema_version`, `scoring_preset` =
`nflverse_default_ppr_championship_window_v1`, `league_scoring_exact: false` (+ `exact_league_scoring_gaps` carried),
`season_windows` per year (included REG weeks 1–16 ≤2020 / 1–17 ≥2021, final week excluded, weight 1.0),
`exposure_definition`, `coverage_status` ∈ {qualified_research_game_complete_identified_rows,
calendar_checked_game_coverage_unverified}, `source_validation` facts + limitations note, the four identities,
`outputs["outcomes.csv"]` sha256 + bytes. Binds CSV bytes/length + manifest sha; derives `validated` ONLY after those
checks; keeps the qualification note; `individual_stat_completeness_proven: false` always; refuses rows outside declared
windows; one mask per row. Runner: `--outcomes-artifact DIR` (refuses fixture-grade unless
`--allow-unqualified-artifact`), records identities/coverage in its manifest with `window_id championship_week17`.
Drift guard: a fixture built through DG-179's OWN builder loads. Waiting on the real artifact path/hash; no candidate
from the old source will be renamed.

**COMMON ARTIFACT HANDOFF (Codex, DG-179 `runs/20260906T194819Z/league_season_outcomes/`) — first real consumer load
PASSED:** outcomes.csv sha `199a48be…` and manifest sha `d3812d0d…` match Codex's; target `049d2229…`, scoring
`5aef5bc5…`, window `d9e68e1f…` identities match; `coverage_status qualified_research_game_complete_identified_rows`,
`league_scoring_exact false`, `individual_stat_completeness_proven false`; 46,274 identified player-seasons 2001–2025,
298 negative seasons retained, 821 zero-game pairs, appeared ≡ games ≥ 1; Hunter 2025 63.8 pts / 7 games preserved.
`source_identity.source_evidence` present (not the earlier sidecar alias). **Refit launched:** basic cohort 1–5
horizons, labels from the artifact (window `championship_week17`), features ALL NFL games from the pull (its two
unattributed rows disclosed via explicit `--tolerated-unattributed-points 10`, recorded as a cleaning exception —
feature source only), roster-role fallback on, policy re-selected on closed inner folds, universe reconciliation.
Old-target metrics are not validation of the new labels. Producer path/hash to DG-178 when done.

**`39545f8e`:** the runner's manifest now carries DG-178's outcome-binding block in their exact vocabulary —
`outcome.{target_identity, outcomes_csv_sha256, manifest_sha256, scoring_preset, coverage_status, last_complete_season}`,
top-level `window_id championship_week17`, `scoring nflverse_default_ppr_championship_window_v1`,
`exposure_definition "unique stat_record weeks within the outcome window"` (tested). The refit running now predates
this; its companion manifest will carry the same block. DG-178's corrected current-player census is
`dg-wt/DG-178/runs/20260906T200049Z/dg178_current_census/` (Conklin/Izzo gsis collision quarantined as unknown;
denominator = roster-listed-or-owned, not "active"); it is theirs, my reconciliation still reads their
`eligible_universe.csv` and they merge bridges only where sources agree.

**CHAMPIONSHIP-WINDOW REFIT LANDED — run `20260906T195728Z/dg177_basic_horizons` (immutable), labels from DG-179's
common artifact (`199a48be…` / `d3812d0d…`, target `049d2229…`), window `championship_week17`, features unchanged.**
Label verification against the artifact: 14,944 fitted labels equal the artifact rows, 15,335 absent-in-covered-season
rows are zero/not-appeared per the artifact's zero definition, 0 mismatches, nothing fitted outside 2001–2025, 2026
unknown not zero. Evidence regraded on the new labels only: every cell moves by thousandths (unconditional-points Δr²
0.002–0.010 higher, points|appear 0.005–0.016 lower, base rates 1–2 points lower because a final-week-only appearance
no longer counts); folds 14/12/9/5/1 unchanged; year 5 still one fold; no reading changes. 2026: Hunter WR 0.887 /
80.4 window points (was 0.890 / 85.4 all-REG), Kraft 0.929 / 120.4 (was 0.931 / 126.9). Aging-reference sensitivity
logged in doc §9 (fixed same-player reference ages out at QB/RB by year 3: Flacco 115→18, Hunt 88→4, vs per-season
best 59 / 51 at year 5; WR/TE identical) — nothing changed, the scenario is DG-178's.

**Inspection of the run's actual bytes found the two defects Codex named, plus one more:** `results.json`'s embedded
manifest disagrees with `manifest.json` on 7 keys (`evaluation_status, exports, inputs, label_source, role_fallback,
scoring_scope, window_id`) and still reads the all-games scope; `feature_notes.position_rule` is the stale text; and
the original `manifest.json` has NO `outcome` block although its `git_head` says `39545f8e` — the process started
19:57:28Z, that commit landed 20:02:19Z, so `git_head` names HEAD at finish, not the code that ran. **Superseding
hash-bound corrected companion** `runs/20260906T195728Z/dg177_basic_horizons.manifest.corrected.json` (sha
`b73027d0…`; original manifest `253d5461…`, results `0b91d35f…`, `basic_forecasts.csv` `a43f3126…` unchanged) adds the
outcome block / `scoring` / artifact `exposure_definition`, discloses all three, and states the rule that ran; passes
`validate_manifest` against the run's real files. Status record `dg177_basic_horizons.evaluation_status.json`
(`05a01003…`). No rerun: labels and numbers match the artifact.

**Corrections `528f989c` (tests RED first; 164 DG-177 tests green, ruff clean):** runner finalizes label source /
window / scoring scope / evaluation status / role fallback / outcome block BEFORE `results.json` is written, reads the
embedded manifest back from disk after hashing outputs and refuses on any disagreement outside the output hashes
(`manifest_disagreements`); `POSITION_RULE_NOTE` replaces the stale text. Reader parses `outcomes.csv` from the hashed
bytes (`io.BytesIO`), as strings, and refuses before casting: blank/padded ids, missing or non-finite values,
non-integral season/games, negative or over-window games, undeclared seasons, unrecognised appearance flags; keeps
negative points and zero-game/appearance parity. Reported, not patched: `git_head` should be captured at launch.
Producer path + hashes to DG-178 (davidleess-cb) with the checkpoint.

**Cross-check of DG-178 candidate audit `20260906T202257Z` on my championship producer `195728Z`: every quoted row
reproduces exactly from `basic_forecasts.csv` (`a43f3126…`).** Kraft vs Parkinson's own rows +12.445 / +34.464 /
+12.876 / +10.590 / +23.541 → two-year 46.908, five-year 93.915; Hunter WR vs Mims −25.154 / −23.297 / −27.196 /
−19.147 / −16.130 → estimate 0; references among unrostered forecast players Flacco 115.3 (Mariota gap 14.608), Hunt
88.3 (Z. Knight 10.778), Parkinson 107.9 (Otton 6.715), Mims 105.6 (K. Allen 2.566). Their `report.json` binds my
corrected companion `b73027d0…`, forecasts `a43f3126…`, `results.json` `0b91d35f…` and the artifact identities
(`049d2229…` / `199a48be…` / `d3812d0d…`); the original `manifest.json` `253d5461…` and the old producer's hashes
(`4872bf73…`, `efc3bfe0…`) appear nowhere in it — the composition is fully rebased on the new bytes. Same-player
reference scenario untouched. Their note "the companion states no scoring_identity/window_identity": both ARE in the
companion under `label_source` (`scoring_identity 5aef5bc5…`, `window_identity d9e68e1f…`); the `outcome` block
carries the fields DG-178 specified. Their census moved to `202057Z` (their lane).

**DG-178 regenerated the Week-17 audit as `20260906T203007Z` (their `26ba557d`) to bind my status record by hash —
verified on its bytes:** `evaluation_status.source_sha256 = 05a01003…` present (absent in 202257Z); companion
`b73027d0…`, forecasts `a43f3126…`, results `0b91d35f…`, target `049d2229…` bound as before; original manifest and
old-producer hashes still absent. The only top-level differences from 202257Z are the two board blocks' new status
binding, `provenance` (git head, argv) and `run`; Kraft 46.908 / 93.915, Hunter −25.154 and the reference gaps are
byte-identical, so my cross-check stands.

**CYCLE CLOSED (Codex, 2026-09-06 ~20:35Z): championship-window increment COMPLETE to the local research gate.** Root
verified the default preview (audit `203007Z` pinned, 27/27 David and 274/274 league estimates, identical prefix terms
and references); handoff `dg-build/CHAMPIONSHIP-WINDOW-REVIEW-2026-09-06.md`. My queue is closed: no further refits,
edits, merge, promotion or production change. All original runs and this worktree stay. Nonblocking follow-up for a
NEXT cycle, documented not claimed fixed: capture the runner's `git_head` at launch, not at finish.

**READ-ONLY PREFLIGHT (Codex, David "please continue building"): 2025 exact-league scoring audit.** Nothing written
outside this note. Sources: (1) DG-165 `identified_weekly.parquet` (sha `6f7c76cc…`, nflverse `stats_player_week_2025`
sha `2a461bec…`, 150 cols incl. `fumbles_lost_total`, `fumble_recovery_own/opp`, `fumble_recovery_tds`,
`def_fumbles_forced`, `special_teams_tds`); research PPR reproduces EXACTLY (max resid 0.0) from pass/rush/rec yards+TDs,
INT −2, 2-pt, −2×(sack+rush+rec fumbles lost), 6×special_teams_tds, +1 rec. (2) nflfastR PBP
`app/data/backtest/qb_validation/raw/pbp/pbp_2025.parquet` (sha `5ed293fd…`, fetched 2026-08-14 by nflreadpy, 48,771
plays, REG 1–18 + POST, `special_teams_play`, forced-fumble / recovery / fumbled player ids + teams, `td_player_id`);
the PlayerProfiler PBP is NOT that source (private export, no structured recovery ids). (3) GROUND TRUTH: Sleeper
`players_points` for every rostered player, weeks 1–18, 2024 AND 2025 (`app/data/research/league_behavior/raw/2026-07-19/
season_2025_1183088915091423232/matchups_week_*.json`, fetched 2026-07-20); scoring settings byte-identical to the saved
2026 snapshot (`3ffeb558…`) for 2024/2025/2026; ids map 100% via the DG-178 idmap.
**Result:** 2025 REG wk1–17 rostered: 3,225 player-weeks, 3,217 equal research PPR exactly; 1,233 no-stat-row weeks all
0.0. The 8 residuals attribute at play level: muffed punt/kick and lateral fumbles lost −2 (`fum_lost` any play; =
`fumbles_lost_total` minus the three research components) ×4; fumble-recovery TD +6 (`fum_rec_td`, own-team recovery,
no +2) ×1; ST forced fumble + ST recovery by the same RB +2 (`st_ff`+`st_fum_rec`) ×1; opponent-ball recovery on an
offensive play +0 (`fum_rec` is IDP, NOT applied; own recoveries 127/129 exact) ×1; one −0.5 provider discrepancy
(aborted snap, Williams wk6). 2024: 3,235 / 3,226 exact, 9 residuals all the same rules (6× −2 extra lost, 1× +6, 2× +1
ST recovery). Team-Defense `ff` NOT credited to individuals on non-ST plays (2 rows exact). Hunter: 7 weeks exact; his
tackles/PDs add nothing; DST keys never apply. **2025 window population (601 offensive players):** extra fumbles lost 25
rows (−50), recovery TDs 2 (+12), ST forced by offensive players 4, ST opponent-ball recoveries 5 (+9 max), ST OWN-team
recoveries by offensive players 19 = the only unresolved class (no ground-truth sample; fail closed). Net ≈ −20 to −30
points over ~40 of 601 players, max |Δ| 6; David's roster: only Dike −2. The refuted alternative (own recoveries +2)
would have been +345 over 138 players — the audit's value is that refutation. Bounded proposal reported to Codex.

**BUILD RELEASED (Codex, "k everyone is idle") — lane 23481 scoring audit tool. Native plan:**
`docs/superpowers/plans/2026-09-06-league-scoring-component-audit.md` (8 tasks, RED→GREEN→commit each). First RED
test: `tests/test_dg177_run_provenance.py` (launch provenance; ModuleNotFoundError at collection) → GREEN in the same
checkpoint. Root's counterexamples are regression rules in the plan (synthetic ids only): slot capacity is not a universal
ledger (`ambiguous:slot_capacity`, weekly lost total stays authority, cross-check recorded as skipped); own-team ST
recovery counted and NOT credited (attributed, per the Henderson wk5 ground truth); recovery TD +6 without +2; extra
lost −2 with the same-play opponent recovery uncredited; end-zone out-of-bounds loss lost via the play flag with no
invented recoverer and no text-derived TD; ST classifier conflict `ambiguous:st_classifier_conflict`; recovery TDs and ST
TDs never subtracted, a recovery TD on an ST play unresolved; equal duplicate Sleeper observations collapsed with a count;
weeks 1–18 kept, championship flag false on 18; the −0.5 residual stays unresolved and visible. Codex is not reachable by
message from this session (ListAgents shows no such peer); this ticket and my responses are the channel.
- Root review of Task 1 incorporated (RED first): `git_dirty` now counts untracked files (a brand-new module that RAN is
  code), with `tracked_dirty` and `untracked_paths` reported separately so preserved untracked run outputs are listed,
  never deleted or ignored to force "clean"; runners record the argv they were given. Task 3 event grain is
  `(game_id, play_id, event_slot, event_type, player_id)` — the same player can fumble and recover in one slot.

**SCORING AUDIT TOOL DELIVERED — producer run `runs/20260906T215247Z/dg177_league_scoring_audit/` (record:
`docs/experiments/2026-09-06-dg177-league-scoring-audit.md`).** Checkpoints `bda5898e` (launch provenance) … `634ddf11`
(whole-quarantine re-audit + event denominators); 66 contract tests, all RED first, incl. root's counterexamples and the
four acceptance findings (non-finite counts refused; lost total below splits flagged; unknown recovery side never a
credit; every split-dependent weekly count cross-checked). Sources hashed once and parsed from the same bytes: weekly
`6f7c76cc…`, quarantine `a0f4d9c6…`, pbp `5ed293fd…`, snapshot `ece82e24…`, idmap `5cdeaf1c…`, 18 matchup files,
league.json `d66be804…`. **Sleeper ground truth, championship weeks 1–17: 4,458 rostered player-weeks → exact 3,215,
attributed difference 7, absent-zero 1,233, unresolved 3** (a −0.5 provider yardage difference wk 6; two QB weeks whose
special-teams split sits on capacity-ambiguous plays). All REG 1–18: exact 3,382 / 8 / 1,330 / 3. Attributed
differences reconcile to computed league points within 2e-15. Event ledger 1,412 events / 532 plays: 1,391 attributed,
21 ambiguous (19 slot_capacity on six plays incl. 2025_17_SEA_CAR/1501, 2 st_classifier_conflict on 2025_10_NO_CAR/2504),
0 missing ids, 0 unjoinable. Window population: offense 35 of 5,687 player-weeks move, net −29, max |Δ| 6; other
positions +121 from defenders' recovery TDs (individual key, never started here). Quarantine: all 530 rows re-audited,
36 nonzero under league keys = the 6 original exceptions + 30 historical `st_split_unknown`; all 22 rows of 2025 inert.
`league_scoring_exact: false` with reasons. Earlier runs preserved and labelled: `214340Z` FAILED ACCEPTANCE (float
sleeper ids → nobody resolved; the tool refused), `214632Z` / `214808Z` SUPERSEDED. Cross-check of DG-178 candidate
`213858Z`: 2,758 player cells and 3,249 reference cells equal my frozen forecasts to 5e-4; all four reference series
match; margin + reference = player points on every row; no disagreement, no reply needed. Nothing merged, promoted,
published or restarted; frozen forecasts and outcome bytes untouched.

**CORRECTED HANDOFF — producer is now `runs/20260906T220010Z/dg177_league_scoring_audit/` (checkpoint `4265a36a`
code, run committed after it; `215247Z` labelled SUPERSEDED beside its directory).** Root's final acceptance + the
independent reviewer's findings, all RED first (71 tests): quarantine verdicts are `known_nonzero` / `verified_zero` /
`unknown` on an untouched original frame (unknown is never nonzero; `league_points_if_scored` empty for unknown splits,
labelled known-component subtotal beside it) → **6 known nonzero (the original exceptions), 494 verified zero, 30
unknown, 36 cannot-certify-inert**; own and opponent recovery counts cross-checked separately (a swapped side is
unresolved and earns nothing); missing identity counted directly on every event row; `unattributed_events.csv` carries
a named coverage reason incl. attributed events without a weekly row and reconciles with the manifest (21 rows, all
`status_ambiguous`). Scoring and event counts unchanged: window exact 3,215 / attributed 7 / absent-zero 1,233 /
unresolved 3; all-REG 3,382 / 8 / 1,330 / 3; events 1,412 / 532 plays / 21 ambiguous / 0 missing ids. Output hashes
verified against the manifest. Record `docs/experiments/2026-09-06-dg177-league-scoring-audit.md` updated. DG-165
re-bound my corrected companion (their `215655Z`); DG-178 told the producer id.

**READY_FOR_GATE (root, 2026-09-06 22:08Z) — completion hold at the human gate.** DG-177 accepted: code `4265a36a`,
branch `d43102a5`, producer `runs/20260906T220010Z/dg177_league_scoring_audit/` (manifest sha `2ff1b531…`, verified
here byte-identical to root's record); root's CLI replay in DG-179 `runs/20260906T220104Z` matched all six CSVs
byte-for-byte. Final record `dg-build/PLAYER-COMPARISON-REVIEW-2026-09-06.md` checked against this lane: no
contradiction. Worktree, prior artifacts and the accepted isolated 8787 preview preserved; nothing merged, promoted,
refit or restarted. No further work without a new assignment.

**AVAILABLE-PLAYERS BUILD ("ok go") — DG-177 stash-selection evaluation. Plan
`docs/superpowers/plans/2026-09-06-stash-selection-evaluation.md`; first RED test `tests/contract/test_stash_selection.py`
(ImportError) → GREEN at `342c7660`. HEAD before work `d43102a5`, tracked tree clean, only untracked run outputs.**

**PROPOSAL TO ROOT BEFORE ANY RESULT IS INSPECTED — frozen in `docs/experiments/stash_selection_definitions_v1.json`
(sha `cfade0df…`, committed; the CLI hashes it into the manifest):**
- Inputs (frozen, hashed): `historical_predictions.csv` `f4fe6644…` (out-of-fold policy/candidate/baseline forecasts +
  closed labels, horizons 1–5), `basic_cohort.csv.gz` `46e1fc01…` (origin features), DG-179 `outcomes.csv` `199a48be…`
  (window points 2001–2025), `draft_picks_full.parquet` `6be2a640…` (gsis join; only draft season ≤ origin visible).
  No fitting; nothing retrained.
- Origins: cohort rows, feature seasons 2011–2024, QB/RB/WR/TE (a row exists if the player appeared in t or t−1).
- Low production at origin: DG-179 window points in season t (authoritative, same window as the target; absent row = 0
  under the artifact convention) BELOW the position starter line = N-th highest window points among that season's
  cohort rows of the position, N = declared 12-team starting scenario QB 24 / RB 36 / WR 48 / TE 18. Sensitivity
  N×0.5, N×1.5, and DG-165's deep-roster line QB 37 / RB 45 / WR 71 / TE 21 (named as relevance, not a starting cutoff).
- Developmental = OBSERVED-HISTORY stratum, explicitly not NFL experience: `seasons_played` (stat-row seasons observed
  since 2005) ≤ 3; sensitivity ≤2, ≤4, none; alternative stratum `nfl_years_since_draft ≤ 3` for players with a
  verified draft season ≤ origin, reported separately (undrafted outside it). Pre-freeze sizing at the primary cut:
  QB 445 / RB 1,301 / WR 1,940 / TE 1,112 origin rows (4,798) — sizing only, no performance seen.
- Outcome, horizons 1–3 (closed, t+j ≤ 2025; censored excluded, never zero): realized window points in t+j; contributor
  = points ≥ the realized starter line of THAT later season (same N, same multiplier); sensitivities ×0.5/×1.5, an
  absolute 100-point line, the deep-roster line; cumulative any-of-years-1–3 for origins ≤ 2022. Every row labelled
  `artifact_row` or `no_record_zero`.
- Orderings, paired on identical candidates within origin × position × horizon (average ranks; boundary ties get
  fractional credit and are counted): (a) current production = origin window points (sensitivity `total_points_t`
  all-games feature incl. postseason, `ppg_t`); (b) draft capital = overall pick ascending, undrafted / not-yet-visible
  last sharing one rank; (c) frozen future production = `policy_e_points_year{j}` (sensitivity `policy_p_appear`,
  `candidate_e_points`); (d) null reference = frozen `baseline_e_points_year{j}` (position marginal, cannot discriminate).
  No age/position ridge baseline exists frozen; none will be fitted.
- Metrics: Spearman vs realized points and AUC for contributor, per cell and pooled (n-weighted); selection at declared
  budgets B ∈ {2, 4, 8} per position per origin season with picks / hits / points captured / misses / busts (bust =
  zero appearances in year j); paired player-cluster bootstrap of ordering DIFFERENCES (1,000 draws, seed 20260906; a
  player's origins and horizons move as one block); per-origin-season tables; repeated-player counts; cells with fewer
  rows than N disclosed.
- Claims not made: waiver/availability backtest (no point-in-time ownership) — this is a historical low-production
  candidate screen; no breakout probability; budgets are scenarios, not David's allocation; observed-history ≠ NFL years.
Building the evaluator on synthetic tests now; the actual-data run waits for root's confirmation of these definitions.
- **Definitions v2 = root's seven frozen amendments, committed BEFORE any actual run, no result inspected under v1 or
  v2:** `docs/experiments/stash_selection_definitions_v2.json` sha
  `19421873732f8f30cd748f6228df1669b467ef356a109772e868d968a94eea44` (checkpoint `c3ea5d98`; v1 kept as the superseded
  proposal). Primary cohort = drafted early-career not-yet-contributor (verified draft class c ≤ t, 1 ≤ t−c+1 ≤ 3, no
  season c..t with appeared AND DG-179 points ≥ the primary bar; absent = convention zero); bars QB 37 / RB 45 / WR 71 /
  TE 21 from the full positional panel, strict sensitivity 24/36/48/12, contributor = appeared AND ≥ bar, cohort fixed
  when the label bar varies; primary test = policy year2+year3 expected points vs realized t+2 + t+3 (origins 2014–2022
  have both frozen horizons), comparators origin actual points / frozen year-1 (help now) / draft pick / persistence
  comparator (`baseline_e_points` = total_points_t × training retention × appearance rate — it orders like all-games
  production inside a cell, so it is labelled, not a null); budgets 2 primary, 1 and 3 sensitivity; label ledger with
  unresolved identity and open seasons excluded and counted; bootstrap conditional on realized origins and fixed fits;
  "not an untouched confirmation" stated. Observed-history ≤ 3 is a separate exploratory stratum. Actual run only after
  these are GREEN and root has had the bytes.
- **Definitions v3** (root's follow-up, still before any result): sha
  `fbcf1a05e061842b50be072f312132c0b216c6684353b5cb34504f8c4c4ffcbe` — secondary = summed years 2–5 window (app Future
  2027–2030) on origin 2020 only, no separate-year AUC substitution, UI claims restricted to the primary t+2/t+3 test;
  implementation safeguards listed in the file (pivot keys incl. position, duplicate/conflict refusals, invalid artifact
  values refuse, strict booleans, missing bar = counted exclusion, finite sums); panel/position-assignment caveat stated.
- **Evaluator GREEN and actual run launched** (code HEAD `d7bc8315`; 52 stash-selection contract tests + the lane's 123 total;
  ruff clean). Root's bootstrap review folded in: rank metrics paired on JOINT finite support (excluded cells/players
  disclosed); selection uncertainty = frozen fixed-budget weights on the original cells, paired per-player contributions
  player-cluster-bootstrapped (no reselection; positional clusters; draws requested/finite/rejected reported); draft
  conflicts and foreign ids exclude the player with a reason (never picked); an absent horizon column is a counted
  exclusion. CLI evidence: semantic bindings `docs/experiments/stash_selection_bindings_v1.json` (sha `04dae02e7427b243b529d41ceb4ded3916ec41c1ec0ea9cc85aa8f9ca49a3d83`;
  history f4fe6644…, cohort 46e1fc01…, outcomes 199a48be…, DG-179 manifest d3812d0d…, target 049d2229…, last complete
  2025; draft source declared by its own hash), fixture flags mark nonproduction, run id validated, bar panels and
  strict rows exported, points per slot, NaN → null with support fields, infinite = refusal. Exact command is the
  CLI docstring (`scripts/dg177/run_stash_selection.py`). Definitions v3 sha fbcf1a05…. Result inspection only after
  the run completes; no threshold was chosen after seeing performance.
- **Cross-check of DG-178 available-player catalog `20260907T010245Z`** (784 rows, 510 available, 386 with a forecast; my
  producer `a43f3126…` for 232 of them, DG-165's rookie chain for the rest): `now_points` = my `e_points_year1`, `future_points`
  = my years 2–5 sum, and every per-season `e_points` equal `basic_forecasts.csv` to 5e-4 on all 232 rows; no null now/future
  among forecast rows; 0 disagreements. Stash-selection production run in progress (bindings passed); results not yet seen.
- **Correction (root):** my earlier "232 rows" undercounted because I joined on the catalog's `player_id` instead of the
  forecast's own `join_id`. Complete producer check on catalog `20260907T010245Z`: **351 rows carry my producer** (319 in
  the default pool; join bases report_gsis 232 / census_nfl_gsis 115 / recovered_census_nfl_gsis 4), all 351 join ids
  present in `basic_forecasts.csv`; every one of 5 seasons × {e_points, p_appear, e_points_given_appear, e_games} plus
  `now_points` and `future_points` equals my frozen rows to 5e-4 — 0 disagreements, 0 unmatched. The other 35 forecast
  rows are DG-165's rookie chain and are not mine to certify.

**STASH-SELECTION RESULT — run `runs/20260907T010712Z/dg177_stash_selection/` (manifest sha `71385a489417c92c19b6de9a09df517786cf9f0b81ae411991f9095a13d550da`; production,
bindings passed; code `d7bc8315` at launch; definitions v3 `fbcf1a05…`; bindings `04dae02e…`). Record:
`docs/experiments/2026-09-06-dg177-stash-selection.md`.** Primary summed t+2/t+3 test on 1,147 candidate rows (563
players, origins 2014–2022; 166 contributors): the frozen future ordering beats every comparator as a RANKING — Δ
Spearman vs origin points +0.053 [+0.025, +0.079], vs draft +0.182 [+0.109, +0.248], vs persistence +0.043 [+0.019,
+0.065], vs year-1 +0.024 [+0.011, +0.037]; AUC 0.778 vs 0.739 / 0.688 / 0.744 / 0.766 — but NOT as a two-slot
shortlist: hits@2 27 vs 27 (origin), 26.5 (draft), 33 (persistence), 26 (year 1), every hit interval spanning zero
(vs persistence −6 [−15, +3]); 15 of 72 future picks never appeared. Budget 1: 12 vs 13/15; budget 3: 42 vs 37/41 (+5
[−2, +12] vs origin). No-record bounds future 27–53. Strict bar: same pattern. Year 1 (help now): 0.551 / 0.832, 42
hits vs 37 origin. Secondary years 2–5 is ONE origin (2020, 132 rows). QB thin (92 rows) with draft capital ordering
it better; WR persistence captures more hits (13 vs 7). Truthful UI wording in the record. Exclusions all counted
(missing_forecast 384 = origins 2011–2013 lack frozen year 3; open 269; draft conflicts 1; foreign draft ids 1,774).
Nothing fitted, no threshold chosen after seeing results; frozen forecasts and outcomes untouched.
- **Review handoff (final for this cycle), HEAD `3247529b` on origin/ticket/DG-177; 166 lane tests green, ruff clean.**
  Run `runs/20260907T010712Z/dg177_stash_selection/` unchanged (original manifest sha `71385a48…`); corrected companion
  beside it `dg177_stash_selection.manifest.corrected.json` (sha `56048dae…`): retrospective position-source risk
  disclosed (frozen stat-line roles can reflect later-role corrections; not contemporaneously verified; forecast values
  and role assignments preserved), deployment = none, `nonproduction=False` = bindings held only. Definitions v4
  (`e52eb684…`) is WORDING ONLY (same origins/bars/cohort/test/budgets/uncertainty as v3, tested equal). Root's last
  binding gap closed RED-first: the CLI now compares the captured outcome-manifest bytes to the bindings, a
  metadata-only mutation is refused before anything is written; 010712Z consumed the accepted `d3812d0d…` (recorded in
  its sources), so its numbers stand. Nothing fitted, tuned, promoted or served.
- **Denominator correction (root):** "repeated players 606" was the candidate ledger (1,800 candidates, 832 unique); the
  primary tested rows have 386 players at more than one origin (1,147 rows, 563 unique), as the bootstrap block already
  recorded. Companion updated with both labelled counts and bound to the original manifest, report and metrics hashes;
  the CLI now labels both for future runs (tested); record corrected. No numeric or threshold change. HEAD updated below.
HEAD 89a36364

**ROOT FINAL ACCEPTANCE GREEN at `89a36364` (2026-09-07):** independent reviewer reconstructed eligibility, bars, paired
metrics, selection budgets and uncertainty; root's CLI replay `DG179/runs/20260907T011345Z` reproduced all 11 numerical
files byte-for-byte; corrected companion `acd4cf3f…` accepted with the source-position and denominator caveats.
Product conclusion of record: the broader ordering improves retrospectively, no demonstrated two-slot pickup edge, no
historical league-ownership backtest. No tuning, refit, promotion or production. Lane idle; no new experiment
authorized.
