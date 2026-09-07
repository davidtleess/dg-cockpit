# DG-165 — The horizon term cannot price a rookie, and rookies are the dynasty asset class

**Layer:** 3 · **State:** todo — draft position approved by David 2026-09-06; validation and integration remain · **Lane:** Davids-MacBook-Pro-24974 · **DG 3.0** · **dynasty asset number**
**Source:** found 2026-09-05 by Bob while checking top-30 coverage for DG-164; confirmed and escalated by Greg and
Fred the same morning. **No code changed.**

## Current ruling and review — 2026-09-06, Codex orchestration

David explicitly approved NFL draft position for the rookie model: **"absolutely yes re the draft position - that's been statistically proven"**. Input eligibility is settled. College features need not improve the baseline before a sound draft-capital estimator can be used. This does not change the prohibition on third-party fantasy projections/rankings as model inputs (DG-173), or automatically admit contracts or draft capital into the veteran model.

Direct authority is the user-message records in `/Users/davidleess/.codex/sessions/2026/09/06/rollout-2026-09-06T08-45-45-01a076c0-db9f-74c1-9d25-bf40951f27cc.jsonl`, which also contain David's request for Codex to orchestrate all three Claude sessions. Current assignment: `ORCHESTRATION-2026-09-06.md`.

The preserved study remains useful evidence, but the following review supersedes stronger claims below:

- Reported AUC 0.813 is for **pick + round + age**, not pick alone. Leave-class-out evaluation uses future classes; the 2015–18 to 2019–20 split uses training labels observed through 2025. It is retrospective cohort validation, not a historical information-cutoff backtest. See preserved `rookie.py:19,47,139` and `panel.py:5`.
- "Ever qualifies" has unequal follow-up. Define a fixed fantasy horizon or correctly handle time-to-event censoring and delayed breakouts. Train with labels actually available at each historical forecast date.
- P(played), P(qualifies), and conditional production among players who played are different quantities. The earlier double-count gate did not prove their composition is valid. Derive and test compatible conditioning events and time origins before multiplying production, qualification, availability, and retention.
- Check cohort completeness, zero-game players, undrafted players, position calibration and league relevance. The five descriptive pick-bucket rates are not validated probabilities.

Implementation may proceed in an isolated candidate worktree. Product promotion requires reviewed evidence for this estimator and its composition; lack of incremental college signal is not a reason to block it.

---

## THE GAP

DG-164's survival term keys every player on **(position, age band, margin decile)**, where margin is his production
relative to the replacement bar. **A rookie has no NFL season, therefore no production, therefore no margin,
therefore no cell — at any sample size.** This is not a thin-cell problem and no threshold fixes it.

- **All 80 rookies on the board are unpriceable by the panel** (Fred's count).
- **Jeremiyah Love is inside the top 20** and cannot be given a horizon.
- Also affected in the top 30 by DVS: **Harold Fannin, Jadarian Price.**

⛔ **A dynasty number that cannot price a rookie is missing the thing it exists for.** Rookie picks and first-year
players are the central traded asset in dynasty leagues.

## WHY IT WAS NOT CAUGHT EARLIER — a harness that tested the band, not the player

Fred's first coverage check reported all twenty of the top 20 covered. It keyed on **(position, age band)** and
found those bands well populated. **But a rookie fails on the margin, not the band** — his age band is fine and he
still has no cell. *"The check tested the apparatus, not the subject"* (his words), the same shape as
[[feedback_a_null_needs_a_sample_that_spans_the_effect]].

⚠ **The open question that matters more than the count: are the rookies BLANK on the asset board, or ABSENT from
it?** A board that silently omits them is worse than one that says "we cannot tell you yet", and it is the standing
defect shape ([[feedback_the_failure_path_returns_the_success_signal]]). Confirm before the top 20 ships.

## THREE WAYS OUT — none of them a lane's to pick

1. **Blank with a reason.** Honest, cheap, and leaves the most-traded assets with no number on a dynasty board.
2. **Borrow a horizon from draft capital**, the way Engine A already scores rookies. We *have* a rookie estimator.
   ⚠ It is **a different estimator with a different error**, and mixing two estimators inside one product without
   marking which produced each number is how a board becomes unauditable. Fred's instinct, and mine.
3. **Exclude rookies and say so loudly.** Defensible only if said loudly; silently is option 2's failure mode.

**Feasibility note, untested:** a rookie survival curve would need a college-to-NFL panel keyed on draft capital
rather than prior NFL production. DG-164's feasibility gate passed because every player-season is an observation;
the rookie equivalent would need the same gate run before anyone commits to option 2.

## WHAT THIS TICKET IS NOT

- **Not a defect in DG-164.** The survival cells are correct for the players they cover; the term simply has no
  input for a player with no season. Stated in DG-164 §5n.
- **Not blocked on the bar question.** Rookies are unpriceable under every candidate bar.
- **Not solvable by lowering `MIN_N`.** There is no cell to populate.


---

## FEASIBILITY GATE — run 2026-09-05 after David's ruling. **PASSES, with one landmine.**

David ruled none of the three options above: **"look at their college football stats and do a mathematical
analysis of how college football stats translate to NFL career stats."** Gate run on
`app/data/training/prospects_with_outcomes_v3.csv` (874 prospects, 2015–2025, 173 columns).

**THE COHORT: 478 prospects in classes 2015–2020 have five years of follow-up.**
WR 194 · RB 129 · TE 87 · QB 68.

Against the veteran side (20,885 cohort-years, 1,232 players) this is thin, and it is thin exactly where it is
needed. **Pooled across positions 478 supports a five-year model; per position, 68–194 does not support much** —
that is the same range DG-162 showed cannot absorb many features. **A rookie model must be simple and probably
pooled with position as a term.** Classes 2021+ have 1–4 years and can inform short horizons only.

✅ **SURVIVORSHIP PASSES AT THE SOURCE: the washouts are in the file.** 280 prospects overall and **85 of the 478
(18%) played zero NFL games.** They are the most informative rows in the table for a career-length model.

⛔ **BUT `censored_incomplete_arc` WOULD DELETE THEM, AND IT LOOKS LIKE A CORRECTNESS FILTER.** In classes
2015–2020, where follow-up is complete and censoring cannot possibly be about time:

| `censored_incomplete_arc` | n | played zero games | median games | median points |
|---|---:|---:|---:|---:|
| 0 | 313 | **0** | 33 | 215.2 |
| 1 | 165 | **85 (52%)** | 0 | 0.0 |

**The flag conflates two opposite facts** — *"we cannot observe his arc yet"* (true of 2022–2025) and *"he never
played"* (**an outcome, not missing data**). Filtering `censored_incomplete_arc == 0` on a fully-observed class
removes every washout and leaves a population whose median is 33 games: **only the players who lasted.**

⭐ **This is the 638-deleted-seasons defect in a new costume, and Greg predicted the shape before it was found.**
Anyone building the rookie model must ignore this flag for classes ≤2020 and use it only to exclude classes with
genuinely incomplete follow-up. `low_sample_flag` (533/874) and `head_b_training_eligible` (320/874) are unexamined
and must be checked the same way before use.

**Verdict: buildable. Five horizons supportable pooled, not per position. The binding risk is not sample size —
it is an inherited filter that silently selects survivors.**


---

# THE ANSWER — 2026-09-06. **The college-to-NFL translation is already in the draft pick.**

## The design, decided before building

Neither "plug rookies into the existing key" nor "a parallel rookie path". **The R(h) cells are fitted on
qualifying player-seasons** — they answer *given he IS startable at level L and age A, how long does that last?*
**A rookie's dominant uncertainty is whether he becomes startable at all, and the cells condition that away.**
Plugging him in asserts an event that happens **42% of the time** — wrong by 2.4× on average and **9× for a
seventh-rounder.** So:

    rookie value = P(ever qualifies | college, draft capital) x [existing R(h) cells at the level he reaches]

Same cells, same bar, same scale — one new factor in front. This satisfies David's twice-ruled one-scale
requirement better than a parallel path, which would have been a second scale by the back door.

## ✅ THE DOUBLE-COUNT GATE — PASSED, and it is the landmine seen from the other side

Greg's gate: does Engine A's score already embed a probability of success? If so, multiplying by
`P(ever qualifies)` counts it twice, invisibly, because both factors push the same way.

**Measured, not reasoned.** `run_head_a_bakeoff.py:116` — *"Return rows where season <= train_max_year **and not
censored**"*, and line 125 drops every `censored_incomplete_arc == 1`. Target is `best3of4_ppg`, a **rate**.
Empirically on classes 2015–2020: **Engine A fits 313 of 478 rows, minimum 8 games played, zero zeros in the
target.** The 165 excluded contain all 85 who never played.

**So Engine A's score is conditional on having played. It does NOT embed P. The multiplier counts once.**

⭐ **And this is the same filter as the survivorship landmine, with opposite correctness.** Engine A asks *how good
is he if he makes it* — excluding washouts is **right**. This factor asks *does he make it* — excluding washouts
**destroys the question**, returning `P ≈ 1`. **The flag is not a bug to remove: its correctness depends on the
estimand, which is exactly why it has been correct everywhere it has been used until now.**

## THE RESULT — leave-one-draft-class-out, cohort selected by class ONLY, no inherited flag read

Cohort **478**, all **85 zero-game prospects retained**. Ever qualified: **203 of 478 = 42%**
(QB 47% · RB 49% · WR 43% · TE 29%).

| model | AUC |
|---|---:|
| **draft capital alone** (pick, round, age at draft) | **0.813** |
| college production alone | 0.655 |
| capital + college | 0.817 |
| **increment of college ON TOP of capital** | **+0.004, 90% CI [−0.007, +0.014]** |

**⛔ It is a signal finding, not a coverage artifact.** Restricted to the **344** prospects who actually carry a
dominator rating, using only populated features: capital 0.803, capital + college 0.806, **increment +0.003, CI
[−0.014, +0.020].** Both intervals span zero.

**Draft capital alone is strong and calibrated:**

| pick quintile | n | ever qualified |
|---|---:|---:|
| first 20% | 98 | **86%** |
| second | 94 | 57% |
| third | 97 | 34% |
| fourth | 95 | 22% |
| last 20% | 94 | **12%** |

## WHAT THIS SAYS, AND WHAT IT DOES NOT

**It answers David's question rather than failing it: the college-to-NFL translation he asked for has already been
done, by NFL teams, and its output is where they drafted him.** Our college columns add nothing measurable on top
of that verdict. **The factor is buildable today from draft capital alone at AUC 0.813.**

⚠ **Not "college production is uninformative."** It is informative alone (AUC 0.655) — it is *redundant with the
pick*. And we tested **the college data we hold**: `yprr_college` is **0% populated** — a column with no data in
it — and coverage of the rest runs 31–72%. Richer college data (competition adjustment, usage share, per-game
splits) was not available and is untested.

⚠ **Third instance this week** of elaborate features adding nothing over simple ones — DG-162's three columns,
DG-163's injury history, and this. **That is now a pattern about this sport rather than about our modelling.**


---

## LANE RESPONSE — 2026-09-06 09:16 ET, session `davidleess-a3` (claude PID 24974, ttys001) — Lane `Davids-MacBook-Pro-24974`

*Written here because the Codex orchestrator is not reachable by session message (`ListAgents` shows only Claude
sessions); this ticket is the channel.*

**Authority verified** from the four user records in the rollout file: orchestration request · "i can close those
sessions and start 3 new ones" · "absolutely yes re the draft position - that's been statistically proven" · "3 new
claude sessions started". Neither will be re-asked.

**Worktree.** `~/dg-wt/DG-165`, branch `ticket/DG-165`, created `dg-work.sh DG-165 --from origin/main` after
`git fetch origin main` → base `ecc260ef` (DG-173 land). Local trunk left at `96dad300`, 4 behind, 25 dirty
entries, untouched. `~/dg-wt/DG-168` (`e6449843`, clean) not touched.

**Measured before building (read-only):**
- `prospects_with_outcomes_v3.csv` holds ONLY drafted players (pick null = 0, picks 1–262, classes 2015–2025,
  **no 2026 class**). Undrafted coverage cannot come from it. The file is NOT in a `dg-work.sh` worktree
  (`app/data/training` is neither tracked nor shared) — read it from the preserved copy (md5 `1b0d56d1…`, identical
  to trunk's).
- `nflreadpy.load_draft_picks()` covers 1980–2026; QB/RB/WR/TE 1999–2026 = **2,238 prospects, 95% with gsis_id
  and age** (2008+ 97–100%). The 2026 class is present: **80 skill players, all with gsis_id** — Mendoza pick 1,
  Love 3, Simpson 13, Sadiq 16, Price 32. Same 80 the ticket counts on the board. DG-176's three names are
  therefore 2026 rookies inside this lane's population.
- Canonical DG-164 cells (`retention_R_v3.json`): bar QB37/RB45/WR71/TE21, regular-season PPR totals, tie-robust
  N-th largest. The rookie qualification event uses the identical definition so the conditioning is compatible.
- The panel the preserved study read (`panel.parquet`, 2026-09-05 06:21) still exists in the DG-164 session
  scratchpad; it is copied into the run's `inputs/` with its sha256 so the reproduction is byte-for-input.

**First concrete check:** reproduce the preserved study exactly (478 / 85 zero-game / 203 qualified; AUC 0.813 /
0.655 / 0.817) from hashed inputs before changing any definition. Result recorded below when run.

**Repairs being built** (candidate only — no promotion, merge, restart or shared write):
1. **Horizon.** Fixed horizons h = 1..5. `Q_h` = at least one qualifying season in NFL seasons 1..h.
   `N_h` = number of qualifying seasons in 1..h — a SEASONS quantity, the same unit as the DG-164 term, so a rookie
   needs no R(h) cell.
2. **Cutoff.** Forecast date = pre-season of year T. Class c contributes a label at horizon h only if
   c + h − 1 ≤ T − 1. Walk-forward over T for every h; the number of classes available at each (T, h) is
   reported and the honest evaluable horizon declared, not manufactured.
3. **Cohort.** Draft capital from nflverse 1999–2026 → 20+ complete-follow-up classes at h = 5 instead of 6. The
   2015+ CSV remains the college-feature comparison only.
4. **Conditioning.** Three explicitly named events per horizon — `P(played ≥ 1 game by h)`, `P(Q_h)`, `E[N_h]` —
   plus `E[N_h | Q_h]` for anyone composing. Engine A's rate is conditional on ≥ 8 games / non-censored
   (`build_head_b_targets.py:84`, `run_head_a_bakeoff.py:125`), so it composes with P(played), never with P(Q).
   **This lane multiplies nothing.**
5. **Position calibration.** Pooled logistic with position terms and position × log(pick) vs per-position fits;
   reliability per position and per round; young QB/TE inspected explicitly.
6. **Undrafted.** Measured separately as a coverage note; not folded into the model unless it validates.

**Output contract** — run-scoped, immutable, inside the worktree: `runs/<UTC>/dg165_rookie_capital/`
- `manifest.json` — forecast_date, season clock, cohort spec, label spec (bar ranks, tie rule, REG-only, PPR),
  horizons, model spec, input sha256s, git sha, library versions.
- `evaluation.json` + `EVALUATION.md` — per (T, h): n_train, n_test, AUC, Brier, log loss vs base rate,
  calibration bins; by position and round.
- `rookie_scores_2026.csv` — one row per 2026 drafted skill rookie: gsis_id, name, position, team, pick, round,
  age_at_draft, p_played_h1..5, p_qual_h1..5, e_qual_seasons_h1..5, 90% bootstrap intervals, model_version,
  coverage_status (scored / missing_age / undrafted_not_modelled).
- Code: `src/dynasty_genius/rookie/` + runner `scripts/dg165/`; tests `tests/contract/test_dg165_rookie_capital.py`
  (zero-game rows labelled 0 and retained; no training label reads a season ≥ T; horizon windows; every 2026
  rookie gets a row or a stated reason; no market/projection column read).

**Shared inputs:** nflverse draft picks + weekly stats (network, immutable upstream, memory cache only); the old
`panel.parquet` (read-only copy + hash); the preserved prospects CSV. Nothing written outside the worktree.

**Football flag for Codex (not a blocker):** the qualification bar used is the availability bar
(QB37/RB45/WR71/TE21) to match the canonical cells; the code takes the bar as a parameter so a starter-bar variant
(DG-171) can be produced without a re-ruling.

### LANE RESULTS — 2026-09-06 09:45 ET, `davidleess-a3` — candidate BUILT, evidence run-scoped, nothing served or merged

**Where:** `ticket/DG-165` at `9a6a7a4b` (pushed; two commits on base `ecc260ef`). Canonical run
`~/dg-wt/DG-165/runs/20260906T133904Z/dg165_rookie_capital/` — read `REPORT.md` first. Three intermediate
runs carry `SUPERSEDED.md`. Trunk untouched (`96dad300`, 25 dirty entries preserved); `app/data` unwritten.

**Reproduction:** the preserved study re-run on hashed inputs is byte-identical to `RESULTS.txt`
(`runs/20260906T131535Z/dg165_reproduction/`): 478 / 85 / 203, AUC 0.813 / 0.655 / 0.817.

**What the candidate is.** `src/dynasty_genius/rookie/` (20 synthetic contract tests, no network). Per drafted
QB/RB/WR/TE, NFL season j = 1..6 and horizon h = 1..6: `p_played_h`, `p_qual_year_j`, `p_qual_h`,
`e_qual_seasons_h` (= Σ_j p_qual_year_j, in SEASONS, unconditional), and `e_ppg_given_qual_year_j`
(E[ppg | qualifies in j], fitted ONLY on qualifying seasons). Qualifying = availability bar QB37/RB45/WR71/TE21,
REG PPR totals, tie-robust N-th largest — identical to the canonical DG-164 cells. Inputs: pick, round, age at
draft, position. **Cutoff rule asserted:** class c trains at horizon h for forecast year T only if c ≤ T − h.

**Cohort:** nflverse draft picks 1999–2026 → 2,237 rows; the 80 rookies of 2026 (Mendoza 1, Love 3, Simpson 13,
Sadiq 16, Price 32) all scored, 3 with age imputed. ⛔ **Two survivorship traps in the JOIN, both fixed with
tests:** (a) 107 of the 108 picks without a gsis_id have zero career games — dropping "rows without an id"
deleted the washouts (1999–2004 read 0.5% washouts vs 6–10% later); kept under a synthetic id, labelled 0.
(b) all 107 also lack a birth date, so an age-missing indicator learned "missing age ⇒ washout" and scored a
2026 seventh-round QB with no birth date on file at 0.00 (artifact-free 0.10); no indicator, imputation only.

**Out-of-time (forecast years 2005–2025, 110 (T,h) pairs; 16 not yet gradable, each named):**
AUC 0.842 (h=1) · 0.831 · 0.827 · 0.819 · 0.818 (h=5, classes through 2021, n=1,354) · 0.821 (h=6); Brier
below no-model at every h; P(Q_3) calibration within 0.044 over six bins; E[N_h] RMSE below no-model at every h.
Young QB/TE (≤23, R1–2, h=3): QB 0.83 predicted vs 0.83 actual, TE 0.70 vs 0.66.

**Misses, reported not hidden:** mid-round QBs over-predicted (R4–5 at h=5: 0.32 vs 0.16, n=50); R4–5 RBs
under (0.36 vs 0.43); **rookie-year contribution is RISING and everything fitted on the past lags it** — h=1
by era 0.17/0.16 → 0.25/0.21, and the LEVEL under-predicts by 0.6–1.1 ppg at every season with the
position-mean comparator carrying the same bias. The level beats "mean rate of qualifiers at the position" by
only 2–6% of RMSE. Level denominator = games with a weekly stat row, NOT the served all-games ppg (manifest
`units.ppg_denominator`).

**DG-176 / DG-178 coordination (davidleess-cb, quoted as THEIR findings):** adapter for this CSV committed on
`ticket/DG-178` (`4e9baf2b`); they compose `p_qual_year × max(0, e_ppg_given_qual − R)` on THEIR side, six- and
five-season assemblies side by side. Undrafted: 0 rostered anywhere in the league on the 09-06 13:00 artifact,
so the unmodelled undrafted gap costs nothing today — stays a named gap. Mendoza/Simpson/Sadiq never reach the
cells (Engine A rows, no `projection_2y`); the suppressed young-QB cell bites **Jaxson Dart**, not a rookie.

**Football questions for Codex → David (not blockers):** (1) five- or six-season board sum — both assemblies
exist; (2) the level's −0.6 to −1.1 ppg out-of-time bias: accept as-is with the bias quoted, or fund a
class-year trend term (my recommendation: the trend term, with its own measured test, before promotion).

**Not done, by design:** no trend term, no QB curve reshaping, no undrafted model, no college re-run, no
starter-bar (DG-171) variant — all parameters/refinements listed in `REPORT.md §7`. **Blocker: none.**

### ROUND-1 REVIEW ACK — 2026-09-06 10:25 ET, `davidleess-a3` — resuming from `9a6a7a4b`, corrections in review order

First action: resolve the 107 "washouts" — the review is right that `cohort.py` mapped `games=NaN` to zero, which
asserted a negative from missing data. Checking the frozen input's actual fields and seeking independent career
evidence (nflverse players / seasonal rosters keyed on draft year + pick) before any label is assigned; unresolved
prospects will be kept explicitly with a `label_basis` and their sensitivity quantified, not dropped, not assumed.
Then, in order: one historical fit per forecast date grading every exported annual quantity (incl. `p_qual_year_j`);
coherent nested events by construction (first-qualification / first-appearance hazards); training-baseline
comparator pooled from the actual per-split baselines with every report number rendered from the JSON; withdrawal
of the composition assurances and an annual target that preserves nonqualifier contribution and exposure, agreed
with lane 25057; then the bounded trend/recency experiment with tuning inside training windows.

### ROUND-1 CORRECTIONS LANDED ON THE BRANCH — 2026-09-06 10:55 ET, `davidleess-a3` — `ba70f175` on `ticket/DG-165` (pushed)

**Canonical run:** `~/dg-wt/DG-165/runs/20260906T144444Z/dg165_rookie_capital/` — `REPORT.md` is rendered from the
JSON by code (no hand-typed statistics), `NOTES.md` is the prose, `EVALUATION.md` has every quantity, slice,
calibration table, per-year training baseline and ungradable pair. Runs `133904Z` (reviewed tip) and `144026Z`
(pre-trend) carry `SUPERSEDED.md`. Full suite 7,185 passed / 33 skipped; 24 synthetic contract tests.

**Item 2 — identities, not inference.** The "107 washouts" claim is WITHDRAWN: PFR `games` was NaN on all 108
id-less picks, not zero. Resolution through independent sources (players table by draft year+pick, then name+year;
1999–2025 rosters by entry year+draft number, then name+year): **63 resolve, 45 unresolved** — kept with
`label_basis = unresolved`, NaN labels, counted, never asserted to have failed. A resolved identity with no
weekly stat row is a measured zero. `unresolved_as_zero` is an explicit sensitivity arm, run and reported:
season-1 P(qualifies) AUC moves by ~0.001; no 2026 score moves by more than two season points.

**Item 1 — one procedure, every consumed quantity graded.** `fit_at_forecast_year()` is called by both the
historical loop and final scoring; `out_of_time_predictions.csv` holds every graded row (p_qual_year_j against
qy_j, p_appear_year_j, E[points_j], E[games_j], the conditional levels, the cumulative quantities). Test: the
evaluation's forecast for T equals a fresh fit at T.

**Item 3 — coherent nested events.** First-appearance / first-qualification hazards + re-appearance /
re-qualification rates generate all probabilities; monotone cumulative paths on 80/80 rows, P(Qy_j) ≤ P(Q_j),
E[N_h] ≥ P(Q_h) — pinned by tests, verified on the scored file.

**Item 4 — training baselines.** Comparator = each forecast year's training prevalence/mean, carried per row and
pooled from rows; `baseline_by_forecast_year` published per quantity.

**Item 5 — composition claims withdrawn; annual target delivered.** Manifest states no composition with Engine
A/B or the cells. The file carries the contract accepted by lane 25057 (their message, recorded): event =
appearance (weekly stat row), `e_points_year_j_given_appear`, `e_games_year_j_given_appear`, unconditional
`e_points_year_j` / `e_games_year_j` (= p_appear × conditional; valid because points/games are exactly 0 without
an appearance; nonqualifier weeks inside, nothing forced to zero); descriptive `p_qual_year_j`,
`e_ppg_given_qual_year_j`; `identity_status` column; manifest `definitions.*`, `units.*`,
`forecast_date.forecast_cutoff` / `label_window`. "played" renamed "appear".

**Bounded trend experiment (authorised).** Linear class-year term, selected INSIDE each training window on its
three most recent complete classes (nothing at or after T read; tested). Out of time: improves 5 of 6 compared
metrics (season-1 Brier 0.1213→0.1197, season-1 E[points] RMSE 55.2→53.9 with bias −11.7→−3.2 points; season-3
neutral). Selected in 13/21 forecast years, consistently from 2014 on. **By the rule stated in advance the trend
model is used for scoring; the plain arm is fully reported in `trend_experiment.json`** and a reviewer can
reverse the choice without a rerun. Gain is real but small and it is a one-year extrapolation — re-check each
season.

**Headline out-of-time numbers (plain arm identical for h≥3):** season-1 P(qualifies) AUC 0.841 (90% CI in the
JSON), Brier 0.120 vs training baseline 0.171; season-3 AUC 0.806; P(any qualifying season in 1..5) AUC 0.816;
E[N_5] RMSE 1.30 vs 1.68 baseline. Season-1 P(appears) AUC 0.79. E[points] season 1 RMSE 53.9 vs 70.8 baseline.

**Open, stated:** undrafted rookies not modelled (none rostered in the league today per lane 25057); DG-176's
non-rookie gap (Dart) untouched; the stat-row vs served-all-games denominator mismatch is on the manifest for
lane 25057 to reconcile. **Blocker: none.** Independent work remaining in this lane: none from the review
queue; awaiting Codex's next review.

**Lane 25057 (DG-178) read-back, 2026-09-06 ~11:10 ET, recorded as THEIR findings:** v3 file joins for all 80 rookies
by (position, draft_season, pick) on their run `20260906T150758Z`; their shared-estimand correction is that the
replacement rate R_j is per LEAGUE WEEK (E[points_j]/17), not per game given appearance; their parser had typed my
`units.ppg_denominator` note's negated phrase as served scoring and now reads scoring only from positive
identifiers. Asked only for the per-season points grading path: `evaluation.json["annual"]["<j>"]["e_points_year"]`
→ `rmse`, `rmse_training_baseline`, `baseline_by_forecast_year`; same shape for `e_games_year`. Nothing changed here.

**DEFECT FOUND BY LANE 25057, 2026-09-06 ~11:20 ET — run `144444Z` SUPERSEDED.** Their joint grading (their run
`20260906T151423Z`) of my `out_of_time_predictions.csv` found rookies' predicted season-1 contribution 10–35 points
below realised among started players — and that file was the PLAIN arm's, written before the trend experiment
decided, while `rookie_scores_2026.csv` came from the trend model. Evaluation and scoring described different
models. Fix in progress: the experiment now returns both arms' predictions; the arm the pre-stated rule selects is
the canonical `evaluation.json` / `out_of_time_predictions.csv`, the other arm is saved beside it. Their finding
stands as the board-side view of the plain arm's bias (my `evaluation.json` at season 1: −12 points on average).

### CANONICAL RUN NOW `20260906T151705Z` — `7bfc2e4f` + `cd9bc693` (NOTES fix) on `ticket/DG-165` (pushed), 2026-09-06 ~11:35 ET

`evaluation.json` / `out_of_time_predictions.csv` describe the arm that scored `rookie_scores_2026.csv` (the
auto-selected class-year trend); the plain arm is beside them as `evaluation_other_arm_plain.json` /
`out_of_time_predictions_plain.csv`. Scored class byte-identical on every forecast column to `144444Z`.
Canonical season-1 unconditional E[points] bias ≈ −3 points (QB ≈ −11, RB −3, WR −2, TE +1); season 3 ≈ −1.5;
plain arm ≈ −12. **Residual to carry: quarterbacks stay under-predicted at season 1 after the trend term; no
further term was added.** Lane 25057 has the path for a re-grade. Blocker: none; awaiting Codex review.

**Lane 25057 re-grade on `151705Z` (their run `20260906T151850Z`), 2026-09-06 ~11:45 ET — the rookie under-ranking
they reported at ~11:20 is WITHDRAWN by them: it was the plain arm's.** On the canonical (trend) predictions, the
rookie bias among started players (predicted − realised, 2021–2024, their cells of 9–35 rookies) is mixed in sign
and mostly small: QB +7.5 / +1.4 / +7.9 / −23.4; RB −12.6 / +14.2 / +5.9 / +20.5; TE +0.6 / +2.7 / +1.0 / +3.2;
WR +3.1 / +14.9 / −7.6 / +0.2. One large residual, QB 2024, consistent with this lane's season-1 QB bias of −11
on the scoring arm. Board unchanged (scores byte-identical). Their guard `107d66f4` refuses a run whose
`trend_experiment.decision` disagrees with `evaluation.trend` — the pairing defect cannot recur unnoticed.

### ROUND-2 REVIEW ACK — 2026-09-06 11:30 ET, `davidleess-a3` — resuming from `cd9bc693`

Accepted, all four items. **Exact next test/edit:** a contract test asserting `p_qual_year_j ≤ p_appear_year_j` and
`p_qual_h ≤ p_appear_by_h` on every predicted row — including a fixture of the review's historical counterexamples
(the 4 annual and 7 cumulative rows from `151705Z`, by forecast year / pick / position / age) — followed by a
three-state per-season construction (no stat row → appeared → qualified, with history-conditioned transition
models) that makes the subset relation and monotonicity hold by arithmetic. Then, in order: (1) the scoring
policy declared ex ante as inner-window selection over a fixed menu; the outer evaluation of THAT policy is the
canonical evidence; plain becomes an exploratory comparison with a paired bootstrap of the difference — no
outer winner selection, no "5 of 6"; (3) a bounded QB / first-round assessment separating appearance error from
conditional-points error by era, band and season with bootstrap uncertainty, and a QB-specific class-year
interaction added ONLY to the inner-selection menu (no blanket correction); (4) affirmative identifiers —
`model_policy`, `scoring_arm_id`, `evaluation.policy_id`, output sha256s, and a `pairing` block that raises on
mismatch. Handoff of annual 1–6 to lane 25057 as soon as the run exists; then the read-only cross-review of
DG-178 joins and long-horizon restrictions with my own forecast IDs.

### READ-ONLY CROSS-REVIEW OF DG-178 (rookie joins, long-horizon restrictions) — 2026-09-06 11:55 ET, `davidleess-a3`

Read-only on `~/dg-wt/DG-178` (`ba8028b6`, 11 dirty entries, nothing touched), using my own forecast IDs
(`cohort.csv`: 80 drafted 2026 rookies with gsis_id / position / pick). Evidence, not agreement:

1. **Their eligible-universe run `20260906T153607Z` does not recognise any 2026 draftee.** Of the 55 rostered rows
   it marks "not forecast by any producer; no 2025 feature row and not a 2026 draftee", **45 are 2026 draftees in
   my file, name and position agreeing 45 of 45** — including four on David's roster (Mendoza pick 1, Cooper 30,
   Bell 94, Black 90). `forecast_by` is "veteran" or empty for all 274 rows; no row is attributed to the rookie
   producer. Their assembler DOES join these players by (position, draft_class, nfl_draft_pick) from the served
   artifact (annual_candidate.py:378, 425–427), so the universe builder and the assembler disagree about the same
   45 players. The census (`forecast 219 / unforecast 55`) and the replacement-pool denominator are therefore
   wrong for rookies until the universe builder uses the same join.
2. **Their roster audit `20260906T151859Z` still loads the SUPERSEDED v1 rookie file** through the old
   p_qual × level adapter: `report.json.rookie_candidate.csv` = `runs/20260906T133904Z/.../rookie_scores_2026.csv`
   (sha `bdd759fa…`, model `dg165_rookie_capital_v1`), while the same audit's annual path grades
   `dg165_rookie_capital_v2_hazard` (run `151705Z`). Two rookie files and two model versions inside one audit run;
   the header line "rookie candidate: dg165_rookie_capital_v1" is the visible symptom. The old adapter
   (`rookie_candidate.py`) also reads a `level_by_year` key my evaluation no longer carries, so its level caveat
   silently becomes "absent".
3. **Long-horizon restriction is stated, and correct as stated:** the board sums `min(seasons over producers)` = 2
   (`annual_candidate.py:428`; refusal reason at `:522–525`), so my seasons 3–6 are unused until the veteran
   producer reaches them. Consistent with their write-up.
4. Travis Hunter is excluded as a "DB" position string with an honest note that Sleeper fantasy positions are not
   captured; their round-2 item 5 already names this.
5. Join key: my file is unique on (position, draft_season, pick) for all 80 rows; their loader refuses duplicates.
   No mismatch found on the key itself.

### ROUND-2 CORRECTIONS LANDED — `5056fed1` on `ticket/DG-165` (pushed), 2026-09-06 ~12:05 ET

**Canonical run:** `~/dg-wt/DG-165/runs/20260906T154033Z/dg165_rookie_capital/` (REPORT.md rendered from JSON;
NOTES.md prose; CALIBRATION.md; policy_comparison.json; evaluation_exploratory_plain.json). `151705Z` and
`153743Z` carry SUPERSEDED.md. 30 synthetic contract tests, ruff clean.

- **Item 2 — subset by construction.** Three-state chain per season; runner-enforced bound counts on 1,676
  historical rows: 0 violations of P(qualifies in j) ≤ P(appears in j), P(qualified by h) ≤ P(appeared by h),
  monotonicity, and E[N_h] ≥ P(Q_h). The review's 11 counterexample rows are test probes.
- **Item 1 — declared policy.** `model_policy = inner_menu` (menu: plain / trend / trend + first-round-QB
  indicator; inner validation on the three most recent complete classes; rule stated in advance). Its outer
  evaluation is canonical; plain is exploratory with a paired bootstrap of the difference on the same rows.
  Variants chosen inside windows: plain 2005–2013 except 2008 (trend) and 2010 (trend_qb_r1); trend 2014–2025
  except 2020 (trend_qb_r1); 2026 scoring window: trend (trend_qb_r1 tied on wins, lost the tie-break).
  Paired differences vs plain (positive favours the policy): season-1 P(qualifies) Brier +0.0015 (90% CI
  0.0001–0.0029); season-1 E[points] RMSE +1.32 (0.79–1.81); season-3 Brier −0.0004 (−0.0011–0.0003);
  season-3 RMSE +0.15 (−0.10–0.39). Exploratory, not independent confirmation.
- **Item 3 — QB / first-round assessment, no correction.** Season-1 conditional points bias among appearers,
  QB round 1: 2005–15 −55.6 (CI −82.6 to −29.3, n=29); 2016–25 −23.4 (CI −50.1 to −0.1, n=35); appearance bias
  ≈ 0 in both. QB all rounds 2016–25: −8.8 (CI −23.1 to +5.0, n=119). The residual is a first-round conditional
  level, uncertain, and it is NOT corrected; the QB variant can enter only through the inner policy.
- **Item 4 — identifiers.** `scoring_arm_id = dg165_rookie_capital_v3_chain:inner_menu:trend`; every scored row
  carries model_policy / scoring_arm_id / evaluation_sha256; manifest carries outputs_sha256 and a `pairing`
  block (`consistent`) that raises on mismatch.
- **Headline (canonical, policy arm):** season-1 P(qualifies) AUC 0.841, Brier 0.120 vs 0.171 training baseline;
  season-1 E[points] RMSE 53.9 vs 70.8, bias −3.0; season-3 AUC 0.806; P(Q_5) AUC 0.816. Scored class
  unchanged in numbers from `153743Z`; 80 rows, all identities resolved.
- Handoff sent to lane 25057; cross-review findings above stand. **Blocker: none.**
Full suite on `5056fed1`: 7,191 passed / 33 skipped. Round-2 queue complete for this lane; awaiting Codex.

**Lane 25057 read-back on the cross-review, ~12:15 ET (their findings, recorded):** (1) confirmed and fixed in their
runs `153911Z` / `154435Z` — the universe builder now marks rookies by (position, draft_class, pick); 79 of my 80 are
forecast; their rostered-unforecast set is 10 (Dell, Hunter, Lloyd, Brooks, James, Royals, Watson, Ekeler, Aiyuk,
Richardson). (2) confirmed and dropped — the audit no longer routes rookies through the superseded v1 file. The one
unmatched rookie is **Max Bredeson, 2026 pick 159**: my file (nflverse draft table) says TE, Sleeper says RB.
**Checked: the nflverse players table (position RB, ngs RB, ACT) and the 2026 week-1 roster (RB, depth chart FB)
agree with Sleeper — RB is current; TE is the draft-day classification.** Fix in progress: `position_current`
exported beside `position`, manifest states the join key is (draft_season, pick) with position an attribute.
Their guard rule was re-stated (policies match; scoring arm equals the graded arm or is among `arm_ids`; declared
evaluation sha256 matches bytes) — my files satisfy it by construction.
**Landed `a41f8f05` (pushed), ~12:25 ET — canonical run now `~/dg-wt/DG-165/runs/20260906T154706Z/dg165_rookie_capital/`:**
`position_current` exported beside `position`; manifest `cohort.join_key` = (draft_season, pick) and
`cohort.rookies_with_position_change` = Bredeson (TE→RB), Nowakowski (TE→FB). Forecast numbers identical to
`154033Z` (now SUPERSEDED). Pairing consistent. Blocker: none.

### REVIEW PASSED (bounded research preview) — Codex, 2026-09-06 ~12:35 ET; copy correction landed `16a6c9d8`

Codex's independent reviewer verified at `a41f8f05` / run `20260906T154706Z`: 31 tests, zero event/count
violations on 1,676 historical and 80 current rows, all 16 manifest hashes, policy binding, draft-key /
current-position separation. **Accepted canonical artifact:** `~/dg-wt/DG-165/runs/20260906T154706Z/dg165_rookie_capital/`.
No further speculative model iteration; nothing promoted live.

**Copy correction (no recomputation):** "independent of the policy choice" overstated the evidence — the policy
MENU was refined after inspecting these historical years. Replacement language, now the template wording and
recorded beside the immutable run as `CORRECTION-2026-09-06.md` (no run file modified):
- policy arm: *"retrospective historical evaluation with forecast cutoffs enforced; the policy selects, if at all,
  only inside each training window, but the policy menu itself was refined after inspecting these historical
  years, so this is not untouched independent confirmation"*
- exploratory arm: *"exploratory comparison against the declared policy on the same retrospective evaluation;
  never used to reassign the canonical evidence"*
Sent to lane 25057 with the accepted artifact path. QB under-prediction stays disclosed; no blanket adjustment.

**Next (Codex):** read-only rookie/universe QA of lane 25057's research preview when available — all 80 draft
keys map once; league fantasy eligibility drives placement (Bredeson RB/FB, Nowakowski TE→FB); missing rows
explain why; no displayed claim that draft capital alone is a proven edge. Requested their URL/command; waiting.

### READ-ONLY QA OF THE DG-178 RESEARCH PREVIEW (first pass) — 2026-09-06 12:40 ET, `davidleess-a3`

Surface `http://127.0.0.1:8787/?surface=research-preview`, API `/api/research/preview` (serving their run
`20260906T161634Z`, which reads my canonical `154706Z`). Checked against my own 80 draft keys (`cohort.csv`).
Nothing of theirs edited. Their rebuild (2/5-year switch, corrected evidence wording, identity-vs-evaluation
split, three grading fixes) is pending; re-check due after their restart.

1. **All 80 draft keys map once — PASS.** `comparable_board.all_inspectable` carries 80 rookie-producer rows, 80
   distinct players, all 80 matched to my file by name, no duplicates; all 80 carry a Sleeper id. (Their
   `player_id` for rookies is a synthesised `name_position` string; my gsis ids are not carried through — minor.)
   The served surface shows only rostered players plus a top-60, so 45 rookies are visible there; all 45 match my
   file by name and position; David's four (Mendoza, Cooper, Bell, Black) carry comparable values.
2. **League eligibility drives placement — NOT DEMONSTRATED for the two position-change rookies.** Board position
   equals my draft-table position for 80 of 80; for Bredeson (pick 159) and Nowakowski (pick 169) that is TE, the
   served artifact (captured 15:30 UTC) also says TE, while nflverse players/rosters say RB and FB. Sleeper
   `fantasy_positions` is not captured by their pipeline (their own universe note), so placement for these two
   follows the draft/artifact position, not verified league eligibility. Effect today: nil — both are unrostered
   with value 0.0 on the two-year board. Stated gap, not a defect in any number.
3. **Missing rows explain why — PASS.** The 10 `readiness = none` rows (Dell, Lloyd, Brooks, James, Royals, Watson,
   Ekeler, Aiyuk, Richardson; Dell twice, roster + league) each carry a football-language `status_sentence` and a
   `raw_reason` naming both producers. No blank reasons.
4. **No displayed claim that draft capital alone is a proven edge — PASS.** The API JSON carries no "edge",
   "proven" or "draft capital" text; the bundle's only "proven edge" is a disclaimer in trade-fit copy ("context
   rather than a proven edge"); "draft capital" appears only in the served Engine A label ("Rookie model — draft
   capital and age"), not on the preview; the research copy says "…-year impact, not complete dynasty value".
5. **Evidence wording — PENDING their rebuild.** `producers[*].evidence_reason` currently states file identity only
   ("verified: scoring arm, graded arm and declared sha256 agree"); the corrected historical-evaluation wording and
   the identity-vs-evaluation split are not yet on the surface (they said both are coming).
6. Observation, not a defect: 44 of the 80 rookies have value 0.0 on the two-year board (expected margin below the
   available replacement in both seasons → "replace" action), consistent with their season-long replace-or-retain
   estimand; the four on David's roster are positive.

### SLEEPER FANTASY ELIGIBILITY CAPTURED (read-only public source) — Codex's parallel task, landed `c6102c00`, 2026-09-06 ~12:50 ET

**Source:** `GET https://api.sleeper.app/v1/players/nfl` (docs.sleeper.com), fetched ONCE at 16:41:07 UTC into
`~/dg-wt/DG-165/runs/20260906T164107Z/eligibility_capture/raw/` (gitignored; 12,226 players; sha256 `97b15239da27…`);
no credentials, no paid provider, nothing under `app/data`. **Canonical derivative:** `20260906T164442Z/eligibility_capture/`
— `sleeper_eligibility.csv` (every player, keyed by Sleeper id: full_name, position, fantasy_positions, active,
status, team, injury_status, years_exp, gsis_id) and `reconciliation.csv` / `RECONCILIATION.md`. Rookie
forecasts unchanged.

**Authority rule:** `fantasy_positions` places a player; a missing field stays **unknown** (333 of 12,226 players,
none in the candidate pool) and is never inferred from the NFL or draft position. `active`/`status` CLASSIFY
(rostered / active_free incl. IR, PUP, NFI, practice squad / inactive_free / unknown_free) and never suppress.

**Reconciliation:** 80 of 80 rookies matched (79 by name+position with suffixes dropped; Matthew/Matt Hibner by
last name + team + position among rookies; Sleeper carries no gsis for 2026 rookies). Availability: 45 rostered,
33 active free, 2 inactive free (Kendrick Law, Jaren Kanak — cut). **Bredeson (159): Sleeper `RB`** (draft TE,
nflverse RB) — placement RB. **Nowakowski (169): Sleeper `TE`** (nflverse FB) — placement TE. **Hunter (12530):
`DB|WR`** — WR-eligible in the league, currently excluded by DG-178 as "DB". **Dell (9502): `WR`, status
Inactive, league-rostered.** DG-178 candidate pool (271 ids): 251 active free, 20 inactive free (Sleeper
"Inactive" = not on an NFL roster), 2 whose fantasy eligibility differs from Sleeper's own position (Velus Jones
WR→RB, Hunter Luepke FB→RB). Sent to lane 25057 with the path; they own integration.

### READ-ONLY QA OF THE DG-178 RESEARCH PREVIEW (second pass, rebuilt `96a683ab`, their run `20260906T164337Z`) — 2026-09-06 13:05 ET

Checked on `/api/research/preview` (both views are in one payload: `views[h2]`, `views[h5]`) against my 80 draft keys.
1. **Draft keys map once — PASS in both views.** h2: 45 distinct rookies on the surface (rostered + top), 45 in my
   file, no duplicates in the league list; h5: same 45, same result. David's four carry comparable values in both.
2. **Missing rows explain why — PASS.** h2: 10 `readiness = none` rows, each with a sentence naming the selected
   view's coverage and pointing to the other view ("No two-year number: … The five-year veteran forecast …"); h5: 0
   such rows (Dell is comparable at 0.0 there).
3. **No claim that draft capital is a proven edge — PASS.** API JSON: no "edge", "proven" or "draft capital"; the
   bundle's only hits are the trade-fit disclaimer and the served Engine A label; both views say "not complete
   dynasty value" and carry an advice note that the number is a counterfactual, not drop/trade/start advice.
4. **Evidence wording — PASS.** `basis.evidence_framing` in both views carries the corrected sentence; producers now
   split `identity` (file identity, `bound_files` naming my `rookie_scores_2026.csv`, `out_of_time_predictions.csv`,
   `evaluation.json`) from `historical_evaluation` (rookie seasons 1–2 in h2, 1–5 in h5, "evaluated on 21/20/…
   folds; RMSE below its training-only baseline at 4 of 4 positions (a point comparison, no interval)").
5. **Placement by league eligibility — STILL A GAP, acknowledged by them as a limitation.** Bredeson/Nowakowski are
   placed at the served/draft position (TE); my Sleeper capture (`runs/20260906T164442Z/eligibility_capture/`) says
   RB and TE respectively, and Hunter DB|WR. They decline a Sleeper read inside their no-shared-writes envelope;
   **ownership of a `fantasy_positions` capture (DG-178 vs a league-runtime ticket) is Codex's call.** No number moves
   today (both unrostered, 0.0).
6. **Observation (not my producer): the reference differs by view for the same season.** h2 references QB Mariota
   (102.9) / WR Keenan Allen (106.2); h5 references QB Flacco (121.3) / WR Mims (112.0), because each view draws its
   replacement from its own veteran producer. Same rookie forecast, different 2027 margin: Chris Bell 2027 = +41.4
   (h2, retain) vs −15.6 (h5, replace), so his two-year value is 41.4 and his five-year value is 0.0. The rookie side
   is byte-identical across views; the cross-view disagreement is entirely the reference. Reported to lane 25057.

### READ-ONLY QA OF THE DG-178 RESEARCH PREVIEW (third pass, `9487a7e0`, their run `20260906T165547Z`) — 2026-09-06 13:15 ET — ALL CHECKS PASS

1. **Draft keys map once — PASS.** Inspectable board: 80 rookie rows, 80 distinct; surface: 45 rookies in each view,
   all in my file, no duplicates in either league list.
2. **League fantasy eligibility drives placement — PASS (gap closed).** Their `fantasy_eligibility` block names my
   `runs/20260906T164442Z/eligibility_capture/sleeper_eligibility.csv` by path and sha256; placement applied before
   the population filter; 123 artifact rows moved (mostly FB→RB). Verified on the board: **Bredeson RB, Nowakowski
   TE, Travis Hunter a WR row on the league board** (readiness none, with the producer's stated reason), Velus Jones
   and Hunter Luepke RB. Missing fields stay unknown; no NFL-position substitution.
3. **Missing rows explain why — PASS.** One `readiness = none` row per view (Hunter), with a sentence; Dell is now
   comparable at 0.0 in both views on the basic producer.
4. **No proven-edge / draft-capital claim — PASS.** None in the API JSON; the bundle carries only the existing
   disclaimers; both views say not complete dynasty value and carry the advice note.
5. **Evidence wording — PASS.** `basis.evidence_framing` (both views) carries "retrospective historical evaluation with
   forecast cutoffs enforced … not untouched independent confirmation"; producers split identity (`bound_files` =
   my `rookie_scores_2026.csv` / `out_of_time_predictions.csv` / `evaluation.json`) from historical evaluation.
6. **Cross-view consistency — PASS (my earlier observation is moot by construction).** Both views are prefix sums of
   one term set (basic five-year veteran producer + my rookie file): 350 surface rows compared, 0 with value(5) <
   value(2), first two season terms identical, references identical (QB Flacco, RB Estime, TE Parkinson, WR Mims).
   Chris Bell reads 0.0 in both views; the legacy two-year veteran model appears only as a named comparison.

David's roster on the two-year view now reads Mendoza 237.3 (basic model; the legacy model's 269.5 beside it as a
comparison, not a horizon). Nothing of theirs edited. My lane's queue is complete; waiting on Codex.

### NEW INCREMENT ACK — common fantasy-season outcomes (Codex, DG-179) — 2026-09-06 13:25 ET, `davidleess-a3`

David confirmed the championship ends NFL Week 17 and said continue. **First action now:** a one-time immutable
capture of the FULL, unfiltered nflverse weekly player-stats source, seasons 1999–2025, every scoring component
and player/season/week/season_type/position/team column retained, into `~/dg-wt/DG-165/runs/<UTC>/weekly_source_capture/`
— exact release URLs, acquisition time, per-file byte hashes, and season × REG-week coverage / row counts recorded
BEFORE any filter; nothing under the shared cache or `app/data` touched; raw files gitignored, manifest + schema +
coverage committed. Peers told first so the download happens once. Then: adapter tests and plan for consuming
Codex's common outcome artifact (player_id, season, points, games, appeared; REG weeks 1–16 through 2020, 1–17
from 2021, equal weights, one mask), keeping the draft-table role as the model's position term and never dropping
an offensive player for a defensive current position; then the full annual 1–6 refit on the new labels with
outcome/scoring/window hashes bound, retrospective-evidence wording, and a fresh handoff to DG-178. Scoring caveat
carried verbatim: nflverse-default-PPR league-window research outcomes; exact-league scoring unsupported pending
complete attribution; nothing fabricated as zero.

### WEEKLY SOURCE CAPTURED (full, unfiltered, once) — `1ed74c16` on `ticket/DG-165` (pushed), 2026-09-06 ~15:25 ET

**Artifact:** `~/dg-wt/DG-165/runs/20260906T191723Z/weekly_source_capture/` — `manifest.json` sha256 `712b05fe9f152d670d835250a7d35a52ae8cb10a3621b561bbb37ce59a91e588`.
**Source:** nflverse-data GitHub release `stats_player`, one file per season
`https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_<season>.parquet`,
1999–2025, fetched 19:17 UTC; per file: URL, acquisition time, HTTP etag + last-modified (assets dated 2026-08-13),
bytes, sha256, rows. Raw parquet files byte-for-byte in `raw/` (gitignored, 20.3 MB); `coverage.csv` /
`COVERAGE.md`, `schema.csv` / `SCHEMA.md`, `manifest.json` committed. Shared cache and `app/data` untouched.
**Schema:** 150 columns in every file (union = 150), all scoring components retained — incl. `fantasy_points`,
`fantasy_points_ppr`, `rushing/receiving/sack_fumbles(_lost)`, `fumbles_lost_total`, `fumble_recovery_tds`,
`fumble_recovery_own/opp`, `def_fumbles_forced`, `special_teams_tds`, passing/rushing/receiving first downs.
**Coverage (raw, before any filter):** 476,159 rows; REG 456,155 (POST 20,004); REG weeks **1–17 through 2020, 1–18
from 2021** (so the league window 1–16 / 1–17 drops exactly the final NFL week); 25 position strings, unfiltered;
0 rows missing `fantasy_points_ppr`; **530 rows without a player_id** (one placeholder per season-week from 2001;
none in 1999–2000), **6 of which carry points** (2001 ×3, 2003, 2005, 2012) — counted per season in
`coverage.csv`, kept in the raw files, never dropped or filled; a consumer decides them explicitly (veteran lane's
request, honoured).
**Scoring caveat, verbatim in the manifest:** `fantasy_points_ppr` is nflverse's saved default-PPR total, NOT
asserted equal to David's rules; components retained for attribution.

**Adapter for DG-179's common artifact (landed, tests only until the artifact exists):** `rookie/outcomes.py` —
fail-closed loader (mask disagreement / duplicates / id-less rows refuse), season stats from appeared rows only,
qualification panel with cohort players at their DRAFT role every season and others at the weekly position
(rows without a position counted, not ranked), `outcome_binding()` for the run manifest. **Plan for the refit
once the artifact lands:** swap `season_stats_map(panel)` → `season_stats_from_outcomes`, cut the bar on
`qualification_panel` (weekly positions from this capture; draft roles from the cohort), bind outcome hashes /
scoring id / window / closure, set `labels_through` from the artifact, rerun the declared `inner_menu` policy
1–6 with the retrospective-evidence wording, keep all 80 draft keys, then hand off to DG-178 and re-check joins.

**Runner wired for the common artifact — `a155b1fc` (pushed), ~15:35 ET.** `--outcomes-csv/--outcomes-manifest/
--weekly-capture` make labels, the bar (cohort at draft role; others at weekly position from the capture),
`labels_through`, units and the scoring caveat come from DG-179's artifact and bind its sha256s. 42 DG-165 tests.
**Refit blocked only on Codex's common player-season artifact (DG-179).**

**DG-178 current-player census (their run `20260906T191951Z`, read-only check):** uses my Sleeper snapshot `164442Z`
and the 80 verified rookie ids as an identity bridge; 784 members. All 80 of my rookies are census members, none
in `uncovered.csv` — including Kendrick Law (13412) and Jaren Kanak (13422), whom Sleeper marks Inactive but
nflverse's 2026 roster capture carries. Bredeson RB and Nowakowski TE stand from my eligibility file.

**Codex source-audit caveat acknowledged (~15:45 ET) — download success is NOT outcome coverage.** Corroborated on my
capture with a game-level count (`runs/20260906T193034Z/weekly_source_game_coverage/`, commit `52e708a2`): distinct
REG `game_id`s vs teams × games / 2 — **1999: 247 of 248; 2000: 246 of 248; 2022: 271 of 272** (the cancelled
BUF–CIN game, a true absence); every other season complete (256 for 2002–2020, 272 for 2021, 2023–2025). **2001:
248 games under 17 normalised week labels** (week 2 = 14 games after the post-9/11 postponements; weeks 4–17 ≈ 15),
which matches Codex's "week numbering may be normalized" note. Nothing filled, nothing dropped; the capture is
untouched. Default-fail on unassigned ids preserved in my adapter (`load_common_outcomes` refuses id-less rows).
No independent scorer will be written here; the refit waits on Codex's contract and artifact.

### SOURCE PREPARATION FOR DG-179 DONE — `6f6ddd3c` on `ticket/DG-165` (pushed), 2026-09-06 ~15:55 ET

**Run:** `~/dg-wt/DG-165/runs/20260906T194454Z/source_preparation/` · `preparation_manifest.json` sha256
`710c92d911408b7185350dfcaafb9ff3b4bd0a7b27ee08e6e6606dd4341d4bfd` · schema `dg179_source_preparation_v1`.
- **identified_weekly.parquet** sha256 `6f7c76cca4f1e9b1fb6bb40b1c83d76f5dc85afcb66c0662904bf9f1b662c748` — 442,167 rows,
  admitted seasons 2001–2025, rows WITH a player id, all 150 original columns + `source_file`, `source_row_index`,
  `source_file_sha256` (gitignored; hash bound in the manifest).
- **Game coverage (exact REG game ids vs official `nfldata/data/games.csv`, captured 19:44:54 UTC, sha256
  `446ff5d6…`, 2,177,176 bytes), measured BEFORE any filter:** 2001–2025 **verified** — 0 missing, 0 unexpected, week
  labels agree (2001 normalised 1..17 confirmed); **2022 BUF–CIN excluded explicitly, 271 completed games**, no
  appearance invented. **Excluded seasons: 1999 (`1999_01_BAL_STL`), 2000 (`2000_03_SD_KC`, `2000_06_BUF_MIA`)** —
  never zero-labelled; rows remain only in the raw capture.
- **Quarantine** (`quarantine.parquet` sha256 `a0f4d9c6…`; `quarantine.csv` committed): 530 admitted-season rows without a
  player id, full original rows + provenance; 524 zero placeholders; **exactly the six reviewed nonzero records**,
  verified one-for-one (2001 w11 GB–DET Team +1.68 row 10277; 2001 w14 ARI–NYG unnamed −2 row 13176; 2001 w16
  BAL–TB unnamed −2 row 15110; 2003 w4 PHI–BUF Team −0.1 row 3897; 2005 w1 LV–NE Team +6 row 1042; 2012 w6 TEN–PIT
  D.Bryant +3.1 row 5926) — any other nonzero row fails the run. Policy: "exact reviewed unidentified records; not a
  tolerance". **Signed / absolute exclusions by season:** 2001 −2.32 / 5.68 · 2003 −0.10 / 0.10 · 2005 +6.00 / 6.00 ·
  2012 +3.10 / 3.10 · all others 0 / 0.
- Flags: `research_qualified = true`, `individual_stat_completeness_proven = false`; exposure = stat-record weeks; no
  exact-league claim; 29 input hashes (capture manifest, 27 raw files with URLs, schedule). Negative identified
  points stay negative. **No scorer, no window aggregation here** — the central artifact does that; my model consumer
  waits for it. Veteran and rankings lanes messaged with paths and hashes.

**Adapter aligned to the implemented DG-179 schema — `05925980` (pushed), ~16:15 ET.** Read `league_season_outcomes.py`
and the CLI read-only. Loader fails closed on: `schema_version = dg179_league_season_outcomes_v1`;
`outputs['outcomes.csv'].sha256` vs actual bytes; `league_scoring_exact` must be False; `coverage_status` ∈
{qualified_research_game_complete_identified_rows, calendar_checked_game_coverage_unverified}; identity keys present;
rows outside `season_windows` refused; `appeared` read as the artifact's boolean. Binding carries scoring_preset,
window_rule, season_windows, exposure_definition, coverage_status, source/scoring/window/target identities and the
qualification note ("not proof of perfect individual stats"; never "complete individual data"). Labels for seasons the
artifact does not cover stay UNKNOWN (new `covered_seasons`, tested); cohort restricted EXPLICITLY to classes ≥ 2001
(1999/2000 dropped and named in the manifest). No candidate generated from the old source. **Waiting on the central
artifact's path/hash to refit.**

### FIRST REAL CONSUMER LOAD OF THE COMMON ARTIFACT — 2026-09-06 ~16:25 ET, `davidleess-a3`

`~/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes/` — bytes verified: `outcomes.csv` sha256
`199a48be…6ecb8`, `manifest.json` sha256 `d3812d0d…3ba18` (both equal Codex's). Fail-closed adapter load PASSED:
schema `dg179_league_season_outcomes_v1`; preset `nflverse_default_ppr_championship_window_v1`;
`league_scoring_exact=false`; coverage `qualified_research_game_complete_identified_rows`; target_identity
`049d2229…`, scoring_identity `5aef5bc5…`, window_identity `d9e68e1f…`; 46,274 rows, 45,453 appeared, 821
zero-game pairs, 298 negative player-seasons retained; covered 2001–2025; `source_identity.source_evidence` binds
my prepared source (`6f7c76cc…`). **Refit launched now** with the declared `inner_menu` policy, labels only from the
artifact, cohort explicitly restricted to classes ≥ 2001, and **evaluation forecast years 2008–2025 by a stated rule:
the inner-window selection needs at least four training classes at its inner cutoff (T − 3 − 1 ≥ 2004)**, not a
choice made on results. Old-target metrics are not carried as validation. Companion disclosure for the preparation
run's stale `.gitignore` hash and the NaN→Arrow-null mapping written beside that run (no bound file rewritten).

### REFIT ON THE COMMON OUTCOME ARTIFACT — `2dd86992` (pushed), 2026-09-06 ~16:45 ET — canonical run `20260906T195904Z`

**Path:** `~/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital/` (REPORT.md rendered from JSON, NOTES.md, EVALUATION.md,
CALIBRATION.md, policy_comparison.json, sensitivity file). **Bound outcomes:** DG-179 `20260906T194819Z` — `outcomes.csv`
`199a48be…`, target_identity `049d2229…`, scoring_identity `5aef5bc5…`, window_identity `d9e68e1f…`, preset
`nflverse_default_ppr_championship_window_v1`, `league_scoring_exact=false`, coverage
`qualified_research_game_complete_identified_rows` + qualification note; labels_through 2025; covered 2001–2025;
**cohort restricted explicitly to classes ≥ 2001** (1999, 2000 named as dropped); panel 45,453 appeared rows, 0
without a position, 8,976 ranked at draft role. Policy `inner_menu` declared; scoring arm
`dg165_rookie_capital_v3_chain:inner_menu:trend`; pairing consistent; coherence clean on 1,445 historical rows.
**Evaluation forecast years 2008–2025 (stated rule: ≥ 4 training classes at the inner cutoff).** Old-target metrics
are NOT validation of these labels.

| quantity (out of time, championship-window labels) | n | AUC | Brier model / baseline | E[points] RMSE / baseline | bias |
|---|---:|---:|---|---|---:|
| season 1 P(qualifies) / E[points] | 1,438 | 0.849 | 0.118 / 0.173 | 51.6 / 68.6 | −2.0 |
| season 2 | 1,352 | 0.827 | 0.142 / 0.201 | 65.5 / 82.6 | −1.7 |
| season 3 | 1,275 | 0.812 | 0.145 / 0.194 | 69.3 / 84.1 | −3.8 |
| season 5 | 1,116 | 0.776 | 0.131 / 0.157 | 69.7 / 79.4 | −2.4 |
| P(qualified within 5) / E[N_5] | — | 0.824 | 0.165 / 0.243 | 1.29 / 1.68 (seasons) | — |

Policy vs plain (paired, exploratory): season-1 Brier +0.0021 favouring the policy (90% CI 0.0004–0.0039). Variants
chosen inside windows: plain 2008–09/2011–12; trend_qb_r1 2010, 2013, 2021, 2023, 2024; trend otherwise incl. the
2026 scoring window. 80 rookies scored, all identities resolved; Mendoza P(appear y1) 0.99 / E[points y1] 196 /
P(Q_6) 0.99; Bredeson row carries position TE / position_current RB. Sensitivity (unresolved-as-zero): max score
change 2.0 points. Handed to lane 25057 with the identities; join check to follow.

**Lane 25057 corrected census `20260906T200049Z` (read-only check, ~16:55 ET):** all 80 rookies are members, none
uncovered; Bredeson RB/active via my bridge; one contested NFL record (Conklin/Izzo, gsis 00-0034270) is not a rookie.
Their producer guard wants `outcome.{target_identity, outcomes_csv_sha256, manifest_sha256, scoring_preset,
coverage_status, last_complete_season}`; my manifest carries the same values as `outcomes.{target_identity, csv_sha256,
manifest_sha256, scoring_preset, coverage_status, labels_through, …}` — key mapping sent; alias block offered if they
prefer not to map. Old-target run `154706Z` marked superseded as canonical (`6c201f6d`).

**Lane 25057 real load of refit `195904Z` (~17:00 ET, their finding):** loads through their adapter with evidence
verified and zero binding mismatches against the common artifact — 80 rows, 6 seasons, typed target REG ·
PPR_nflverse_default · championship_week17 · stat_record_weeks_in_window · appearance · per_season · season_points ·
labels_through 2025; scoring / history / evaluation bytes match declared hashes; `outcomes.csv_sha256`,
`manifest_sha256`, `target_identity`, `coverage_status`, `labels_through` all equal the artifact's. No alias block
needed; nothing to change here. Their new-target board waits on the veteran refit; my independent join check
follows their message. **Blocker: none; queue complete; waiting on lane 25057 / Codex.**

### READER GUARDS HARDENED (no refit) + EFFECTIVE-COHORT COMPANION — `e5151cda` (pushed), clock-checked 2026-09-06 16:22 EDT

**Clock correction:** run `195904Z` finished 20:00:23Z = **16:00 EDT**; my earlier "~16:45 ET" stamp was unchecked and
wrong. Timestamps from here on are `date` output.

Codex's review: 16 output hashes, common CSV/manifest copies, five recomputed identities, 80 draft keys, 8,670
annual checks and all 18 outer folds reproduced (max diff 2.84e-14) → **the fit is not rerun.** Guards added
test-first with Codex's exact counterexamples (11 new tests, 60 total):
- `outcomes.py`: bytes read once, hashed and parsed as the same bytes; every declared identity RECOMPUTED with the
  artifact's canonical recipe (scoring / window / target / source / saved-settings) — an altered one refuses; exact
  preset, window rule and exposure definition required; `season_windows` structure and `last_complete_season`
  checked; rows refuse on negative or fractional games (never truncated), games beyond the season's included weeks,
  missing or infinite points, appearance ≠ (games ≥ 1), points without a game, blank/padded ids; negative points with
  games stay; unknowns refuse, never becoming qualification failures.
- `weekly_positions_from_capture`: every raw parquet hashed against the capture manifest before a position is read;
  tampered or missing file refuses (positions decide qualification ranks). Runner records the evidence.
- **Real artifact still loads identically:** binding equal to the frozen run on all 15 identity keys; capture verifies
  27/27 files with the same manifest hash the run used (`712b05fe…`).

**Effective-cohort companion (bound, no run file modified):** `~/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital/
COMPANION-2026-09-06.md` sha256 `8ef52aba8a74f038ba3805a1738f24e0e414a700db031883d8c2b7cadb91121f` — the manifest's `cohort.coverage` is the CAPTURED source population
(2,238 picks, classes 1999–2026); the MODELLING cohort in `cohort.csv` is 2,083 rows, classes 2001–2026, **155 picks
dropped** (classes 1999/2000, uncovered rookie seasons; unknown, never zero). Writer now records
`cohort.source_population` and `cohort.modelling_cohort` for future runs. Sent to lane 25057 for binding.

### ROOKIE JOIN CHECK on lane 25057's first Week-17 board `20260906T202257Z` (read-only), clock-checked 2026-09-06 16:28 EDT

**Binding.** The board's rookie producer csv sha `db96647d…` is my `rookie_scores_2026.csv` (run `195904Z`), manifest
`b863c3cf…`; evidence verified ("scoring, history and evaluation bytes match their declared sha256 and describe one
arm"); `scoring_arm` = `dg165_rookie_capital_v3_chain:inner_menu:trend`, `graded_arm` = `inner_menu` — the graded
evaluation describes the arm that scored. `outcome_artifact` bound to the common target: target `049d2229…`,
outcomes csv `199a48be…`, manifest `d3812d0d…`, coverage `qualified_research_game_complete_identified_rows`.

**Join (both views: h2 = comparable_board, h5 = horizon_board).** 80 rookie rows, 80 distinct `player_id`, 80
distinct `sleeper_id`; each of my 80 rows matches exactly one board row; all 80 board sleeper ids are in my
eligibility reconciliation (80/80). No duplicates, none missing. Note for the record: board rows carry no
`(draft_season, pick)` and the report records no draft-key join count of its own — the once-ness above is
established from my side by player id and Sleeper id, not read from their file.

**Placement.** Board position == Sleeper `fantasy_positions` on 80/80, `placement_source` =
`sleeper_fantasy_positions` on all 80. Differs from draft position on exactly one row (Bredeson TE→RB, the case
lane 25057 named). Differs from the nflverse roster `position_current` on two rows — Nowakowski (Sleeper TE, roster
FB) and Jam Miller (no nflverse roster position at all, Sleeper RB) — both are the placement rule working as
written, not defects.

**Readiness / consistency.** 80/80 `comparable`, `evidence_verified` true on all 80, `composition_consistency`
825 checked / 0 violations; readiness `none` = 3,334 is the rest of the skill universe, no rookie among them.
`estimate_class` is `candidate` on all 80 rows of both views; lane 25057's message said "research estimate" —
same class or not is their vocabulary to confirm, flagged to them.

**Page (API run `202257Z`, h2 / h5).** Mendoza 229.4 / 699.8 · Cooper 42.7 / 131.3 · Bell 0.0 / 0.0 · Black
43.0 / 188.6 · Bredeson 0.0 / 40.2 (RB). Evidence framing carries the corrected wording ("retrospective historical
evaluation with forecast cutoffs enforced, not an independent confirmation"); copy scan finds 0 "proven edge",
0 "draft capital", 0 "complete dynasty value".

**Verdict: PASS on every expectation set for my lane.** No file modified anywhere; nothing written outside this
ticket. Result sent to lane 25057. **Blocker: none; waiting on Codex.**

**Re-run on the recomposed candidate `20260906T203007Z` (commit `26ba557d`, provenance block added), clock-checked
2026-09-06 16:31 EDT — not carried over, re-derived:** identical outcome on every line of the check above. Same rookie
producer csv `db96647d…` / manifest `b863c3cf…` / arm; outcome artifact block identical; both views 80 rows, 80
distinct player ids, 80 distinct sleeper ids, my 80 matched once, placement == Sleeper 80/80, Bredeson the only
draft-position difference (RB, 0.0 / 40.2), readiness 80/80 comparable, composition 825 / 0, page values unchanged.
Block diff against `202257Z`: every row block (`all_inspectable`, `top`, `davids_roster`, `league_rostered`,
`readiness`) and `composition_consistency` / `outcome_artifact` / `replacement` / `coverage` byte-identical; the
only change is `evaluation_status.source_sha256` on each producer entry — the veteran companion now bound by hash,
mine `null` by design (my per-season status derives from `evaluation.json`, whose sha is already bound as the
evaluation file). **PASS against `203007Z`. Blocker: none; waiting on Codex.**

### CYCLE CLOSED by Codex (handoff `~/dg-build/CHAMPIONSHIP-WINDOW-REVIEW-2026-09-06.md`), clock-checked 2026-09-06 16:51 EDT

Read-only confirmation from this lane: default research preview on 8787 serves `source.run = 20260906T203007Z`,
`pinned = true`, readiness comparable 825 / none 3,334 — same counts as my join check. My queue is closed: no refit,
no edit, no merge/promotion/production change; all runs and the worktree kept. Nonblocking follow-up recorded by
Codex for a FUTURE writer run, not fixed here and not claimed fixed: the legacy `definitions` prose in my manifest
still says full REG while the authoritative `outcomes` and `units` blocks specify the championship window; the next
run's prose must follow those fields. Lane idle.

### PREFLIGHT (read-only) — rookie → veteran transition experiment, clock-checked 2026-09-06 17:08 EDT

Scope as instructed: no edits, refits, artifacts or publication; frozen fit `195904Z` untouched; worktree clean at
`e5151cda`. Everything below was read from the two frozen runs and the DG-179 artifact.

**1. What each approved producer reads.**
- DG-165 (`runs/20260906T195904Z`, arm `inner_menu:trend`): `FEATURE_COLUMNS = (pick, round, age_at_draft, position)` →
  design `log_pick, round, age_at_draft, pos_*, log_pick×pos_*, class_year` (trend centred on the last training class).
  Three-state chain per season; labels from the DG-179 artifact; cutoff class c ≤ T−h; outer forecast years 2008–2025;
  policy chosen inside each window on the three most recent complete classes. Retained keys: `gsis_id, draft_season,
  pick, round, age_at_draft, position (draft table), position_current, label_basis` in `cohort.csv`; draft-time
  forecasts per class in `out_of_time_predictions.csv` (`forecast_year == draft_season`, 1,445 rows, 2008–2025).
- DG-177 (`~/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons`, arm `basic_cohort_3col_plus_lags`): nine
  first-party columns — `ppg_t, games_t, age, ppg_t_minus_1, games_t_minus_1, ppg_t_minus_1_available,
  ppg_last_observed, seasons_since_last_observed, seasons_played` — and **no draft capital**. Row exists at season t if
  the player appeared in t or t−1 (their own full-season nflverse pull); labels from the same DG-179 artifact; closure
  `feature_season + j ≤ last complete season`; selection {baseline, candidate, blend_0.25/0.5/0.75} per position ×
  horizon × quantity on closed inner folds; `historical_predictions.csv` feature seasons 2011–2024, horizons 1–5,
  policy/candidate/baseline columns with labels. ⚠ `seasons_played` is left-censored at 2005 — experience for the
  experiment must come from `draft_season`, never from that column.
- **After one NFL season a drafted player is priced from `ppg_t, games_t, age, seasons_played=1`, no lag and nothing
  from the draft; his DG-165 number is never computed again.** On the board: class 2026 → DG-165 (80 rows), everyone
  else → DG-177.

**2. Join feasibility (measured; drafted, resolved, feature seasons 2011–2024).** Key `(gsis_id = player_id,
feature_season = draft_season + k − 1)`:

| experience k | drafted rows | with DG-177 h1 prediction | position agrees |
|---|---|---|---|
| 1 | 1,102 | 885 | 869 |
| 2 | 1,102 | 976 | 957 |
| 3 | 1,108 | 915 | 898 |

Both producers label from the same artifact: the 885 k=1 rows have identical season-2 labels (885/885).

**3. Is there a sharp information drop? Four components — three measured today, one needs the experiment.**
- **Population drop (measured, not a feature question):** 210 of the 1,102 drafted k=1 rows (19%) never appeared in
  their rookie season and have NO veteran row, so they vanish from the board after their rookie year (readiness
  `none`). This season: class 2025 has 86 drafted skill players, 73 with a DG-177 row, **13 absent**; class 2024
  70 of 77; class 2023 69 of 80. Plus 7 role-abstains (five fullbacks, two WR→DB converts) — correct by their rule.
- **Level discontinuity (measured, descriptive):** on the same 885 rows the correlation between DG-165's draft-time
  year-2 forecast and DG-177's after-one-season forecast is 0.58–0.65 by position — the number a user sees can jump
  at the transition.
- **Accuracy does NOT drop (measured, descriptive, NOT the experiment):** season-2 points on the same 885 rows —
  DG-165 draft-time year-2 RMSE 71.4 (bias −5.0) vs DG-177 after one season 62.3 (bias −9.9); DG-177 better at all
  four positions (QB 95.8 vs 102.7, RB 68.7 vs 76.2, TE 40.2 vs 46.4, WR 52.9 vs 66.2); DG-177's own training
  baseline 74.6. The observed season carries more than the draft slot alone. (DG-165's number is one season stale
  by construction, so this bounds the discontinuity; it does not test the feature.)
- **Feature drop (needs the experiment):** whether draft capital retains information CONDITIONAL on one observed
  season is unknown. DG-162's "other features span zero" was measured on the whole veteran population, dominated by
  players for whom draft capital is plausibly washed out; the second-year stratum is where it would act, and a null
  needs a sample that spans the effect.
- **Window inconsistency (finding for lane 8b, reported not patched):** 14 k=1 rows are in DG-177's cohort with
  `games_t` 1–2 from their full-season pull but have no appearance in the championship-window label — cohort
  membership and labels use different windows. Small; same class as "check what the quantity measures".

**4. Bounded experiment design (no youth bonus, no market feature, no blending coefficient).**
- **Estimand:** for drafted players with exactly k observed NFL seasons (k=1 primary; k=2,3 secondary), DG-177's
  exact annual quantities for the next season — `p_appear`, `e_points|appear`, `e_games|appear`, and the
  unconditional product — horizon 1 primary, horizon 2 secondary.
- **Sources (all frozen, all hashed):** DG-177 `basic_cohort.csv.gz` (rows + nine features), DG-179 artifact
  (labels; both producers already bind it), DG-165 `cohort.csv` (draft keys only: `log_pick, round, position at
  draft, draft_season`; `age_at_draft` NOT added — redundant with `age` and k). No Sleeper, no market, no external
  projection (David's 09-06 ruling: a third-party projection IS a market price).
- **Grain:** player × feature_season; stratum k = feature_season − draft_season + 1 from the draft table. Undrafted
  rows carry an `undrafted` indicator and zero draft block (they have no draft capital by construction) and are
  reported, not paired.
- **Arms, declared ex ante, nested:** A0 = DG-177's frozen candidate predictions (the accepted baseline, not refit).
  A1 = DG-177's recipe (per-position ridge, `label_closure`, `leak_free_tuning`) + `{log_pick, round, undrafted}`
  on every row. A2 (exploratory) = A1 with the draft block interacted with 1[k=1], to ask whether the effect is
  specific to the transition. No class-year trend in v1 (would import DG-165's cutoff handling; era shift of draft
  capital is a secondary check). No selection among arms on the outer folds; A1 is the candidate by declaration.
- **Closure:** outer folds = feature seasons 2011–2024 (DG-177's evaluable years), expanding window; a training row
  enters only when its label is complete before the test feature season; ridge alpha on closed inner folds
  clustered on player; draft features are static and known at draft, so they add no closure hazard.
- **Primary comparison:** paired out-of-time RMSE difference (A0 − A1) on unconditional next-season points, k=1
  drafted stratum, players resampled (2,000 draws) pooled and per position; secondaries: Brier of `p_appear`, RMSE
  of `points|appear`, k=2 and k=3, and a **harm check on all rows** (A1 must not worsen veterans). Decision rule
  written now: draft capital "retains information after one season" only if the pooled k=1 interval excludes zero
  AND no position is harmed beyond its interval; otherwise report "no detectable information, bounded within ±X".
- **Sample and bound:** k=1 885 rows (QB 102, RB 255, TE 158, WR 370), RMSE ≈ 62 — differences under roughly 2–3
  RMSE points will span zero and must be reported as the bound, not as "no effect".
- **Reference, not a candidate:** DG-165's stale draft-time year-2 forecast (RMSE 71.4) stays as the descriptive
  bound on the discontinuity a user sees.

**5. What is learned before any player value changes.** (a) Whether the feature drop is real, per position, and
its size; (b) the size of the level jump at the transition (already bounded above); (c) that the population drop
(19% historically, 13 of 86 this year) is a coverage RULE, i.e. a product decision, not a modelling finding; (d) the
window inconsistency for lane 8b to confirm. It cannot say anything about market edge, and it proposes no blend: if
draft capital retains information, the eventual change is a FEATURE in the veteran model for drafted players,
evaluated by DG-177's own declared selection policy. Veteran draft capital is NOT assumed approved for production —
this is an experiment on report-only artifacts; approval is Codex's/David's call.

**6. Logged future-writer prose fix — located.** `scripts/dg165/run_rookie_capital.py:359–366`:
`definitions.appearance` and `definitions.season_points` still say "regular-season", while `qualifying_season`
already takes the window rule from the outcome block and `outcomes`/`units` are authoritative. Docstrings with the
same wording: `src/dynasty_genius/rookie/labels.py:20,72,102`, `rookie/__init__.py:8,10`. Logged in Codex's handoff
item 6 (line 48) and this ticket at 16:51 EDT. Fix shape for the next writer run: derive all three prose fields from
the bound outcome block's `window_rule`; a test asserting no "regular-season" string in `definitions` when an outcome
block is bound. Nothing changed now.

**Blocker: none. Waiting on Codex's implementation scope after the product choice.**

### BUILD RELEASED — transition-audit tool, plan written, first red test observed (clock-checked 2026-09-06 17:30 EDT)

Start `e5151cda`, worktree clean, baseline 60 lane tests green. **Plan:** `~/dg-wt/DG-165/docs/superpowers/plans/
2026-09-06-rookie-veteran-transition-audit.md` — 10 tasks: verified loaders + same-target assertion → draft-status
classification (drafted skill / other position / undrafted / unknown) → keyed join with both origins, thin-history
flag and label-identity assertion → coverage ledger over the WHOLE cohort + veteran population ledger → paired metrics
(bias apart from accuracy, Brier/reliability, calibration line), fold summary, seeded player-cluster bootstrap →
immutable writer + rendered report + CLI → the logged `definitions` prose fix (derived from the outcome block,
test-first, writer not run) → real-data run on frozen `195904Z` × `195728Z` → cross-check of lane 25057's candidate →
final checks/push. Files: `src/dynasty_genius/rookie/transition_audit.py`, `scripts/dg165/audit_rookie_transition.py`,
`src/dynasty_genius/rookie/definitions.py`, `tests/contract/test_dg165_transition_audit.py`. No model, blend, uplift,
market input or refit anywhere in the plan.

**First test/edit:** `tests/contract/test_dg165_transition_audit.py` (fixture builder + four loader/target tests) —
observed RED: `ModuleNotFoundError: No module named 'dynasty_genius.rookie.transition_audit'`. First product edit is
the loaders module. Continuing without stopping.

### TRANSITION-AUDIT TOOL BUILT, RUN ON ACTUAL DATA, CROSS-CHECKED — clock-checked 2026-09-06 17:46 EDT

**Commits on `ticket/DG-165` (pushed; base `e5151cda`):** `714ac3cb` loaders + same-target · `6d2d401f` draft status ·
`fffc1cd7` keyed join · `16825d15` ledgers · `38dbc685` metrics/bootstrap · `3033b70a` writer/report/CLI ·
`d3f25be9` definitions prose fix · `7407984e` the audit run · `f5588c51` finite/bounds guards (root probe). Every
commit explicit-path, ruff clean, `git diff --check` clean. Lane suite **87 tests green** (26 new audit tests + the
prose test). Plan: `docs/superpowers/plans/2026-09-06-rookie-veteran-transition-audit.md` (corrected in place on
every root finding: label_basis source names, no positive UDFA, outside-cohort skill draftees, 2,083 denominator,
own-row year assertion, no silent forecast-year filter, strict label tolerance, missing cohort key refuses, writer
refuses twice, input manifests hashed, caveats carried, window flag kept).

**Artifact (immutable): `~/dg-wt/DG-165/runs/20260906T214212Z/dg165_transition_audit/`** — produced at tool commit
`3033b70a` by
`PYTHONPATH=. .venv/bin/python scripts/dg165/audit_rookie_transition.py --rookie-run runs/20260906T195904Z/dg165_rookie_capital --veteran-run /Users/davidleess/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons --experience 1 2 3 --seed 20260906 --draws 2000`.
Inputs verified byte-for-byte against each producer's manifest: rookie `cohort.csv`, `out_of_time_predictions.csv`,
`inputs/nflverse_draft_picks.parquet` (manifest `b863c3cf…`); veteran `historical_predictions.csv` `f4fe6644…`,
`basic_cohort.csv.gz` `46e1fc01…` (manifest `253d5461…`). Same target asserted: `049d2229…`, outcomes csv
`199a48be…`, manifest `d3812d0d…`, preset nflverse_default_ppr_championship_window_v1. Outputs hashed in
`manifest.json`. **The guarded tool at `f5588c51` reproduces `metrics.json` and `joined_rows.csv` byte-for-byte
in memory** (verified, not assumed), so the run is unaffected by the later guards and was not re-issued.

**Headline (an AUDIT; nothing changes a player value; no correction proposed):**

| experience | n | rookie RMSE / MAE / bias | veteran RMSE / MAE / bias | Brier appear | veteran closer | folds | mean abs-err diff [90% player bootstrap] |
|---|---|---|---|---|---|---|---|
| 1 | 885 | 71.4 / 53.5 / −5.0 | 62.3 / 44.0 / −9.9 | 0.114 → 0.101 | 61% | 13 of 14 | −9.56 [−11.57, −7.59] |
| 2 | 976 | 73.9 / 54.0 / −6.8 | 54.8 / 38.1 / +2.4 | 0.175 → 0.142 | 65% | 14 of 14 | −15.94 [−18.41, −13.59] |
| 3 | 915 | 74.9 / 53.8 / −8.3 | 52.3 / 36.2 / +3.5 | 0.205 → 0.137 | 67% | 14 of 14 | −17.60 [−20.18, −15.04] |

k=1 by DRAFT position, MAE rookie → veteran: QB 102 76.305 → 67.931 · RB 255 57.527 → 48.912 · TE 158 34.800 →
30.285 · WR 370 52.473 → 39.792 — **root's independent verification targets reproduced to three decimals.** Bias
apart from accuracy: QB −35.8 → −39.2 (both under-predict second-year QBs; the veteran side slightly more), TE +6.2 →
−2.6, thin-history (games_t ≤ 4, n = 162) rookie bias +16.4 → veteran −9.6. Flags: 14 veteran rows without a window
appearance (valid, flagged, e.g. Mahomes/Cardale Jones), 16 draft/role position disagreements (attributes retained).
Interval is conditional on both frozen fits and the realized seasons — player-sampling variability only.

**Coverage (denominator = the 2,083-row modelling cohort per experience; 155 raw-source exclusions named separately in
the manifest, never forced in):** k=1 paired 885 · no veteran row and no window appearance 210 · appeared but no
veteran row 7 (role abstains) · identity_unresolved 35 (5 of them inside the overlap classes = root's "5 unknown
labels"; 1,107 − 5 = 1,102 complete year-2 labels) · outside overlap classes 946. Veteran population at the k=1
seasons: drafted-skill paired 885 / unpaired 5,838 (later-experience rows) · drafted skill outside cohort coverage
78 · drafted other position 102 · no draft record 3,325 (UNKNOWN draft status, not "undrafted").

**Prose fix (Task 7):** `scripts/dg165/run_rookie_capital.py` now calls `manifest_definitions()` from
`src/dynasty_genius/rookie/definitions.py`, which derives every scope sentence from the bound outcome block's
`window_rule`; test pins "no 'regular-season' when an outcome block is bound". Writer NOT run; frozen run
`195904Z` untouched (manifest sha `b863c3cf…` unchanged, `git status` clean under `runs/`).

**Cross-check of lane 25057's candidate `20260906T213858Z` (read-only, API `?run=`):** 45 league-owned rookies on
both views; per-season `player_expected_points` equal my `rookie_scores_2026.csv` `e_points_year{j}` at full
precision on **90 of 90** (2-year) and **225 of 225** (5-year) season rows; margin + reference reproduces every
value; placement == Sleeper `fantasy_positions` 45/45; search collection 274 distinct league-owned rows with London,
Bowers and both Hunters findable; David's rookies unchanged (Mendoza 229.4, Cooper 42.7, Bell 0.0, Black 43.0 on
2-year). No row disagrees; no message to lane 25057 needed.

**Blocker: none. Waiting on root review.** Nothing merged, promoted, published or restarted; default preview still
`203007Z`.

### ROOT REVIEW 2 REPAIRED — run reissued as `20260906T215024Z` (clock-checked 2026-09-06 17:50 EDT)

Three in-memory acceptance bugs reproduced test-first (7 new tests, **33 audit tests / 94 lane tests green**), fixed
at `b82806f4`, run reissued at `3b1b04d9`, pushed:
1. **Integrality before cast:** every year/key column on both sides (`draft_season, forecast_year, pick, round`;
   cohort `draft_season, pick`; veteran `horizon, feature_season, forecast_season`; basic-cohort `feature_season`)
   must be finite AND integral before any cast — `2016.25` now refuses instead of truncating to 2016.
2. **Explicit unknowns in the ledger:** any-NaN target label → `label_unknown` (points known but appearance unknown
   is unknown, not "veteran row without rookie forecast"); a cohort player with no draft-time forecast row →
   `rookie_forecast_missing`; no veteran row with an unknown appearance flag → `no_veteran_row_appearance_unknown`
   (never "no window appearance" from a NaN). All 2,083 rows preserved per experience.
3. **Argument validation:** duplicate or empty `--experience`, `draws < 1`, non-integer seed refuse in `run_audit`;
   the CLI prints `refused: …` and exits 2 before any run directory exists (tested on the pure entry and the CLI).

**Reissued artifact `~/dg-wt/DG-165/runs/20260906T215024Z/dg165_transition_audit/`** (tool `b82806f4`, same command,
seed 20260906, 2,000 draws). Leaf-by-leaf comparison with `214212Z`: **0 changed metric leaves, 0 removed; the only
additions are the six new zero-valued ledger categories; `pooled_bootstrap`, `joined_rows.csv`, `coverage_ledger.csv`
and `veteran_population_ledger.csv` byte-identical.** `214212Z` carries `SUPERSEDED.md`; its original files are
untouched. Canonical data unchanged; no refit.

**Narrative correction (root's caveat, now in `metrics.json["definitions"]["caveats"]["experience_comparison"]` and
REPORT.md):** the experience strata are separate paired samples (885 / 976 / 915 different players and class ranges),
so "the veteran advantage grows with experience" is a comparison BETWEEN samples, not a within-person trend, and is
not an automatic "more NFL information" effect. My 17:46 entry's phrasing and my report to David are corrected
accordingly. **Blocker: none. Waiting on root review.**

### PEER CROSS-CHECKS ABSORBED — label provenance + companion binding; run reissued as `20260906T215655Z` (clock-checked 2026-09-06 17:57 EDT)

**Lane 25057 (read-only cross-check of my audit):** both forecast sides reproduce exactly from the frozen files on
2,776/2,776 rows; one disclosure gap — **626 paired rows (112 / 249 / 265 at experience 1 / 2 / 3)** are player-seasons
the DG-179 artifact does NOT contain; both frozen producers label them 0 / 0 / not appeared by their shared "no stat
record in a covered season" convention, while the artifact's own zero_definition calls an absent pair unknown. **Count
independently confirmed (626; all 0/0/not-appeared; 22 further zero rows ARE artifact-backed).** Built test-first
(5 new tests, **38 audit / 99 lane tests green**, commit `b1d0e3f1`): the audit now binds the outcome artifact by the
manifest-declared sha (`199a48be…` verified), tags every paired label `label_source = artifact | convention_zero` in
`joined_rows.csv` and `coverage_ledger.csv` (`not_paired` elsewhere), counts them per experience in `metrics.json`
and REPORT.md, carries the caveat verbatim, and **refuses an absent pair with a non-zero label**. `--outcomes-csv`
can relocate the artifact but its bytes must still hash to the bound sha.

**Lanes 25057 + 23481 (provenance note):** the veteran target of record is the corrected companion
`dg177_basic_horizons.manifest.corrected.json` (`b73027d0…`), not `manifest.json` (`253d5461…`). The loader now reads
the companion when present beside the run dir, requires it to declare the same `outputs_sha256` (else refuses), takes
the outcome binding from its `outcome` block, and records both hashes plus `binding_of_record` in my manifest.

**Reissued artifact `~/dg-wt/DG-165/runs/20260906T215655Z/dg165_transition_audit/`** (tool `b1d0e3f1`, same command /
seed / draws; commit `3cb51062`, pushed). Leaf-by-leaf vs `215024Z`: **0 changed metric leaves; only the six
`label_source_counts` leaves added; `pooled_bootstrap` identical; joined rows and coverage ledger identical apart from
the new `label_source` column.** `215024Z` carries `SUPERSEDED.md`, originals untouched. k=1 label provenance: 773
artifact-backed, 112 convention_zero. Canonical data unchanged; no refit. **Blocker: none. Waiting on root review.**

### ROOT FINAL REVIEW — empty-join regression fixed; checkpoint recorded beside the unchanged run (clock-checked 2026-09-06 18:00 EDT)

Reproduced RED first (`join_transition` with an empty veteran history raised `TypeError: ufunc 'invert'` because
`np.array([])` is float); fixed with an explicit `dtype=bool` at `9aef598d`; regression test pins an empty frame with
the full column contract. **39 audit / 100 lane tests green**, ruff clean, pushed. Per root's instruction no new
artifact was issued: run `20260906T215655Z` is unchanged and was **replayed in memory by the fixed tool — metrics.json,
joined_rows.csv, coverage_ledger.csv and veteran_population_ledger.csv byte-identical; every input and output hash in
its manifest still holds** (verified, not assumed). Checkpoint note `CHECKPOINT-9aef598d.md` committed beside the run
at `0d175350`; original bytes untouched. Canonical data unchanged; no refit; nothing merged, promoted or published.
**Blocker: none. Lane idle; waiting on root.**

### ROOT PROVENANCE GUARDS — artifact values compared, companion outcome required (clock-checked 2026-09-06 18:04 EDT)

Both guards built test-first (3 new regressions, **42 audit / 103 lane tests green**), tool commit `2ae4d819`,
checkpoint `a6c69abe`, test-fixture correction `d625923b`, all pushed:
1. **Artifact VALUES, not keys:** `load_rookie_run` now retains the artifact's points / games / appeared per
   (player, season) and refuses duplicate artifact keys; the join compares every artifact-backed label strictly
   (points atol 1e-9, no rtol; games and appearance exact) against the artifact's own row before tagging it
   `artifact`. Root's probe (both producers altered to the same wrong value with hashes re-declared) now refuses:
   "both producers agreeing is not artifact evidence".
2. **Present companion must carry its outcome block:** a `<run>.manifest.corrected.json` beside the veteran run is
   the binding of record; if present it must carry `target_identity, outcomes_csv_sha256, manifest_sha256,
   scoring_preset` or the loader refuses (missing block and malformed block both pinned). Only an ABSENT companion
   keeps the documented `manifest.json#label_source` fallback.

**Run `20260906T215655Z` unchanged and re-proven:** replayed in memory by tool `2ae4d819` — metrics.json, joined_rows,
coverage_ledger and veteran_population_ledger byte-identical; all 46,274 artifact rows retained and compared; every
input/output hash holds; `CHECKPOINT-2ae4d819.md` committed beside the run. No new artifact; no refit.

**Disclosure of a process slip, corrected:** commit `2ae4d819` was pushed with ONE test red — my shell chain piped
pytest through `tail`, which hid its exit code. The failing test was my own negative-points fixture (labels −3.0 on
both producers while the artifact still said 40.0), i.e. the new value guard working correctly; the fixture now puts
the negative value in the artifact too (`d625923b`, green before commit). Tool code unchanged since `2ae4d819`, so
the checkpoint note stands. **Blocker: none. Waiting on root's recheck.**

### READY_FOR_GATE — root's final coordinated acceptance verified from this lane (clock-checked 2026-09-06 18:09 EDT)

Final record `~/dg-build/PLAYER-COMPARISON-REVIEW-2026-09-06.md` checked read-only against this lane: it names final
code `2ae4d819` + fixture `d625923b` (= branch head, worktree clean), unchanged producer `215655Z`, manifest sha
`85e7202c…` and metrics sha `4ddd0f2e…` — **both hashes recomputed here and equal.** Its transition summary (885/976/915
distinct paired samples; 2,150 artifact-backed labels; 626 convention zeros = 112/249/265; 222 omissions = 210 + 7 + 5)
matches the artifact. **No contradiction; no response to root needed.** Completion hold at the human gate: worktree,
all runs and the accepted isolated 8787 preview preserved; no merge, promotion, refit, production restart or new work.
Lane idle.

### AVAILABLE-PLAYERS BUILD RELEASED ("ok go") — DG-165 missing-player starting estimates: plan written, first RED observed (clock-checked 2026-09-06 20:44 EDT)

Start `d625923b`, worktree clean, branch at origin. **Plan:** `~/dg-wt/DG-165/docs/superpowers/plans/2026-09-06-unowned-cold-start-forecasts.md`.
**First test/edit:** `tests/contract/test_dg165_cold_start.py` (census-run loader with byte verification; default-pool
reconciliation against the accepted report's `current_census.coverage`) — observed RED:
`ModuleNotFoundError: No module named 'src.dynasty_genius.rookie.cold_start'`. First product edit is the loaders module.

**Read-only preflight of the 84 (re-derived from census `202057Z` + accepted report `214512Z`, exact reconciliation
20 active / 50 practice squad / 14 IR; WR 33 / RB 21 / QB 15 / TE 15; all 84 joined by `sleeper_id` with a verified NFL
gsis id):**
- **never appeared** in any championship-window season (no artifact stat row 2001–2025): **69** = 58 with NO draft
  record in any of three sources (draft picks table, nflverse players draft fields, latest roster `draft_number`) + 11
  drafted (positive record; 18 of the 19 drafted players agree across all three sources, 1 across two). Entry seasons:
  2026 ×35, 2025 ×22, 2024 ×3, 2023 ×3, 2022/2021/2019 ×1 each — i.e. mostly this year's and last year's undrafted
  entrants, NOT labelled UDFA: "no draft record" is what the sources support.
- **dormant** (appeared before, then absent long enough to leave DG-177's cohort): **15** = 8 drafted + 7 no record;
  last appearance 2023 ×7, 2022 ×3, 2025 ×3, 2024 ×1, 2020 ×1.
- **4 possible existing-forecast join failures:** a DG-177 2025 forecast row exists under the same gsis id although the
  board carries no forecast for the Sleeper id — a join to investigate with lane 25057 once the ledger names them,
  never a new estimate.

**CANDIDATE SPECIFICATION FOR ROOT — no fit until confirmed (engineering/scientific check, not a David question):**
- **Historical population:** skill-position players (roster position QB/RB/WR/TE in season T) LISTED on the season-T
  roster file (statuses ACT/DEV/RES, earliest week of that season's file — point-in-time, never today's roster) with no
  championship-window appearance in seasons 2001..T−1 and entry season ≥ 2001 (so the absence lies inside artifact
  coverage); forecast years T = 2002–2025. Strata: draft status (drafted_verified with draft features / no draft record
  without) × k = T − entry_season (1,2,3,4,5+). Preliminary sizes from the DRAFTED cohort alone (roster-listing condition
  not yet applied): k=1 443, k=2 254, k=3 213, k=4 197, k=5 191 rows over 2002–2025; the no-record stratum will be
  larger (built from rosters in Task 5, counts reported before any fit).
- **2026 candidates:** the 69 never-appeared players (11 drafted, 58 no record), listed active/PS/IR in the 2026 census.
  The 15 dormant players are NOT in this candidate (a second, separately specified experiment on last observed
  production + absence length, if root wants it).
- **Target:** DG-179 championship-window outcomes (`049d2229…`): appearance (≥1 window stat row in season T+h−1),
  window PPR points, games; horizons 1–5; no-appearance convention identical to both accepted producers (no stat row in
  a covered season = 0 / 0 / not appeared, tagged `convention_zero` as in the transition audit).
- **Cutoffs:** at forecast year T the fit uses rows with forecast year ≤ T−h whose horizon-h labels are complete
  (season ≤ T−1); walk-forward evaluation T = 2011–2025 (≥ 9 training years); every feature dated at T.
- **Features:** position, k (indicators), age at forecast, and for drafted rows `log_pick, round` (× drafted indicator).
  Nothing else — no market, no athletic score, no youth bonus, no college stats in v1.
- **Model:** per horizon h: logistic P(appear_h) (L2, C=1.0, StandardScaler) + ridge E[points_h | appear] (alpha 1.0) on
  appearers, pooled across positions with position main effects — the accepted rookie chain's estimators;
  E[points_h] = P × E[·|appear]. Per-horizon (not a per-season chain); cumulative coherence not enforced — stated.
- **Baselines (training-only, same rows):** B1 = position × k mean appearance rate and mean points ("position/experience
  mean"); B2 = draft-capital logistic/ridge (log_pick, round, position) on drafted rows only.
- **Primary comparison:** paired out-of-time Brier(appear_1) and RMSE(unconditional points_1) vs B1, pooled 2011–2025,
  2,000-draw player-cluster bootstrap (90%); secondaries h=2,3, by position, by stratum, calibration, vs B2 on drafted.
- **Acceptance (declared now):** a stratum is exported only if BOTH its Brier and RMSE differences vs B1 at h=1 have
  90% intervals excluding zero in the candidate's favour AND no position within the stratum is harmed beyond its
  interval; otherwise that stratum's players are reported unresolved with the measured bound and the smallest next
  experiment. Zero-record players stay in every denominator with provenance.
- **Runtime:** seconds per fit; whole evaluation + bootstrap under two minutes.
- **Sidecar (only accepted strata):** `cold_start_estimates.csv` keyed by `sleeper_id` + `gsis_id`, years 2026–2030
  (`p_appear_year{j}`, `e_points_year{j}_given_appear`, `e_points_year{j}`, `e_games_year{j}`), `estimate_class =
  cold_start_candidate`, route + draft status carried; `unresolved.csv` for the rest; manifest binds coverage run,
  accepted report sha, artifact sha, rookie-run input hashes, seed, draws, acceptance rule.

Continuing with the coverage tool (Tasks 1–4) and the historical population builder (Task 5, no fitting) while
awaiting root's confirmation. Blocker: none.

### AMENDMENT to the candidate specification (root's scientific gate) — roster population WITHDRAWN; frozen population CONFIRMED (clock-checked 2026-09-06 20:51 EDT)

**Withdrawn (history preserved above, 20:44 entry):** the "listed on the season-T roster file, earliest week" population.
Root's finding stands: the annual roster files are end-of-season survivor rows (2018 rows are all weeks 17–21; coverage
jumps 2015→2016), so that condition is outcome-period survivor selection, not point-in-time eligibility. No fit was run.

**Frozen population (root's definition), confirmed independently from the raw REG captures (27/27 parquet hashes verified
against `runs/20260906T191723Z/weekly_source_capture/manifest.json`):** resolved skill draftees, classes 2001–2025, with
NO full-regular-season stat record through the draft season → **424 = WR 150 / QB 118 / RB 85 / TE 71** (root: 424,
QB118 RB85 TE71 WR150 ✓). Origin T = c+1; closed origins 2012–2025: test rows per horizon **210 / 199 / 187 / 179 / 172**
(h=1..5) ✓; first-origin (2012) training rows with c+h<T **199 / 184 / 164 / 141 / 119** ✓. 2025 draftees with no
rookie-year REG record: 15, of which root's seven (Mertz, Rourke, McCord, Howard, Lohner, Bartholomew, Ricky White) are
the unowned default-pool members; the other eight are owned or outside the pool and are NOT candidates here.
Eligibility is read from the raw full-REG source only; no source repair or relabel. The championship-window-absence
definition (adds 35 final-week players, e.g. Mahomes/Howell/Milton) is kept in the ledger as a comparison column only.

**Four join failures (root-verified):** Ingold 6109/00-0035125, Juszczyk 1379/00-0029892, Burton 2471/00-0031595,
Prentice 8025/00-0036727 — DG-177 2025 rows exist (statline/listed position FB, cohort position RB; Sleeper
fantasy_positions RB). Deliverable: a hash-bound **recovery sidecar** carrying the ORIGINAL producer rows (values copied
from `basic_forecasts.csv` `a43f3126…`, bound to DG-177 manifest `253d5461…` / corrected companion `b73027d0…`), not new
values; DG-178 consumes after root's numerical/identity tests. Built in Task 4 with the coverage run.

**Remaining 80, both views kept side by side in the ledger:** root's full-NFL source split 68 `no_nfl_history` (10 drafted,
58 no record) + 12 `left_cohort_two_absent_seasons` (7 drafted, 5 unknown) from DG-177's `universe_reconciliation.csv`
(`45b0898c…`), and my championship-window split 69 never-appeared / 15 dormant. Nick Muse (2023 w18 record) keeps
full-NFL "appeared" and window "no row"; nothing relabelled. Draft-source conflict = explicit `draft_sources_conflict_unresolved`
route. Heidenreich (draft position FB) is outside the skill cohort — no silent RB mapping. Bennett (career years 4–8) and
Gary Jennings (8–12) exceed the chain's horizons; dormant and no-draft-record routes stay explicit unresolved with the
smallest valid next experiment named per player.

**REVISED MODEL / BASELINE / MIN SUPPORT / SELECTION — for root's reply before any fit:**
- **Grain:** one row per eligible draftee at origin T = c+1 (career year 2); horizons h = 1..5 = career years 2–6
  (2026–2030 for the seven). Features at origin, all source-backed at the draft: draft position, `log_pick`, `round`, age at
  origin (birth date; a missing birth date is imputed by position median with NO indicator, as the accepted chain does).
  No class-year trend (n ≈ 200), no market, no athletic, no roster membership at any date.
- **Candidate (draft-capital hurdle, per horizon):** logistic P(appear_h) on [log_pick, round, age, position dummies]
  (L2, C=1.0, StandardScaler); ridge E[points_h | appear_h] on appearers with [log_pick, position dummies] (alpha 1.0);
  E[points_h] = P × E[·|appear]; E[games_h] likewise. Fitted afresh per origin — it does NOT reuse the accepted chain's s0
  families (their conditional severity is the unconditional-appearance one; a player with no rookie history is a
  different conditional population).
- **Baseline B1 (training-only, SAME cohort):** position mean of the no-rookie-record training rows: P(appear_h) =
  position appearance rate; E[points_h | appear] = position mean of appearers; E[points_h] = position mean of unconditional
  points. Exploratory B2: draft capital only (log_pick, round) without position/age.
- **Chronology:** origin T fits on rows with c + h < T (label season ≤ T−1 complete); evaluates on class T−1 rows whose
  horizon-h season T+h−1 ≤ 2025; walk-forward T = 2012–2025. Labels: DG-179 championship-window artifact (`049d2229…`),
  no-record convention as both accepted producers (`convention_zero` tagged).
- **Minimum support (per horizon, per origin):** ≥ 60 training rows and ≥ 15 training appearers for the conditional
  ridge; below that the horizon is reported UNSUPPORTED (no number) at that origin. Appearer counts by horizon are
  reported before fitting (population builder output).
- **Per-horizon acceptance (declared now; h1 never validates h5):** for each h separately, on the pooled closed test
  rows 2012–2025, paired differences vs B1 in Brier(appear_h) AND RMSE(unconditional points_h), 2,000-draw player-cluster
  bootstrap, 90%: the candidate is exported for h only if BOTH intervals exclude zero in its favour; if not, the B1
  estimate for h is exported as a `baseline_research_candidate` WITH its measured out-of-time error and support, for
  root's judgment (not silently promoted, not dropped). Per-position tables reported with their (small-n) intervals; no
  per-position selection. Calibration (reliability of P(appear_h), slope/intercept) reported. No calibrated breakout
  probability; P(appear) is appearance only.
- **Disclosed limitation:** a draft-population prior without current-roster survival conditioning — the seven are on a
  2026 roster while the historical cohort includes every washout, so the prior is conservative for listed players;
  disclosed, not corrected.
- **Runtime:** < 1 minute including the bootstrap. Output: immutable `runs/<UTC>/dg165_cold_start_candidate/` with the
  population (counts by position/horizon/appearers), evaluation, sidecar for the seven (`estimate_class` =
  `cold_start_candidate` or `baseline_research_candidate` per horizon), `unresolved.csv` for the other 73, manifest
  binding capture/artifact/report hashes.

Continuing Task 4 (coverage writer + CLI + recovery sidecar + real run) and Task 5 (population builder from the raw
captures, counts only) while awaiting root's reply. Blocker: none.

### COVERAGE LEDGER RUN — `runs/20260907T005402Z/dg165_cold_start_coverage/` (clock-checked 2026-09-06 20:54 EDT; run id is UTC)

Tool commits `ed24b96f` → `a84440e2` (Tasks 1–4, 11 tests green, ruff clean), run committed and pushed. Every consumed byte
verified: census `3e836b21…` + accepted report `19e032a4…` (uncovered.csv verified against the accepted report's
declaration — the census run declares only its census hash), rookie inputs/scores by manifest, DG-177 `basic_forecasts`
`a43f3126…` / `universe_reconciliation` `45b0898c…` / basic cohort, outcome artifact `199a48be…`.

**84 rows, reconciled per position × class against the accepted report's coverage block** (20 active / 50 PS / 14 IR;
WR 33 / RB 21 / QB 15 / TE 15). Routes: `never_appeared_no_draft_record` 55 · `never_appeared_drafted` 11 ·
`dormant_drafted` 6 · `dormant_no_draft_record` 5 · `existing_forecast_join_failure` 4 · `unknown_identity` 3 (ids known
to no held source). Draft status: `drafted_verified` 19 · `no_draft_record_1_source` 34 · `no_draft_record_2_sources` 28 ·
`unknown_identity` 3 — never "UDFA". DG-177's full-NFL reason carried beside: `no_nfl_history` 68 ·
`left_cohort_two_absent_seasons` 12 · `not_in_dg177_universe` 4. **Reconciles with root's split:** 10 drafted
no-NFL-history = my 11 never-appeared drafted − Nick Muse (2023 w18 record → full-NFL "left cohort", window "no row",
both kept); 7 drafted left-cohort = 6 dormant drafted + Muse; 58 no-record = 55 never-appeared no-record + 3 unknown
identity. Heidenreich: `drafted_verified` with draft position **FB** — outside the skill cohort, excluded from any
candidate (flagged in the candidate's unresolved list). Root's seven are all present as `never_appeared_drafted`.

**Recovery sidecar (`recovery_sidecar.csv`, 4 rows):** Ingold 6109/00-0035125, Juszczyk 1379/00-0029892, Burton
2471/00-0031595, Prentice 8025/00-0036727 — the ORIGINAL DG-177 2025 rows copied value for value (all five years of
`p_appear`, `e_points`, `e_points_given_appear`, `e_games`), `estimate_class = recovered_existing_forecast`, bound to
DG-177 manifest `253d5461…`, corrected companion `b73027d0…`, `basic_forecasts.csv` `a43f3126…`. Producer position RB,
statline/listed FB, Sleeper fantasy_positions RB. Sent to lane 25057; root's numerical/identity tests decide consumption.
Adds four rows; the accepted 825 are untouched.

Next: Task 5 population builder from the raw REG captures (frozen definition, counts + appearers by horizon, no fit)
while awaiting root's reply on the revised model/baseline/support/acceptance. Blocker: none.

### COVERAGE RUN REISSUED (root reviews 1+2 absorbed) — `runs/20260907T010020Z/dg165_cold_start_coverage/` (clock-checked 2026-09-06 21:02 EDT)

Tool `84b0ea06`, run `857b90b1`, pushed; **19 cold-start tests green**. Runs `005402Z` and `005653Z` carry `SUPERSEDED.md`,
originals untouched. Absorbed test-first: uncovered.csv bound to accepted `current_census.uncovered_csv_sha256` (the
census run declares only its census hash) · players/rosters parquet BYTES verified before their hashes are recorded ·
duplicate positive draft rows (picks 1 + 99 probe) refuse as `draft_sources_conflict`, never silently first · the
census-bound current roster capture `roster_2026.csv` (`5ec59c52…`) is a CURRENT-only fourth evidence source — Dominic
Richardson, EJ Smith, Chase Roberts now `no_draft_record_1_source` with entry season 2026; never used for historical
selection · `no_history_in_held_sources` replaces "unknown identity" and `identity_status = verified_nfl_join` on all 84
(current census identity separate from historical-source presence) · recovery export validates EVERY row (feature
season 2025, explicit producer forecast seasons 2026–2030 never inferred, selected arm, complete binding, verified
identity; second-row negative fixtures for each) and refuses duplicate/discordant identities and partial/non-finite
paths. Ledger otherwise identical: 84 rows; routes never-appeared no-record 58 · never-appeared drafted 11 · dormant
drafted 6 · dormant no-record 5 · join failure 4; recovery rows numerically equal to the original DG-177 rows.

Next: Task 5 population builder from the raw REG captures (frozen definition; counts and per-horizon support recorded
before any fit) and Task 6 candidate under root's frozen clarifications (age at Sep 1 of origin year; fold-only
scalers/medians; both classes required; B1 per-position denominators with ≥10 floor and unsupported conditional cells;
B2 = log_pick + round + position, exploratory only; same paired rows for every metric; per-horizon selection; both arms
reported; retrospective-selection caveat; roster-mismatch wording as instructed). Blocker: none.

### COLD-START CANDIDATE RUN — `runs/20260907T011503Z/dg165_cold_start_candidate/` (clock-checked 2026-09-06 21:16 EDT; run id is UTC) — FOR ROOT'S REVIEW BEFORE DG-178 CONSUMES

Tool commits `42c631f9` (population, real-file count test) → `c22378ab` (engine) → `24cf66b0` (root's pre-fit guards and corrections)
→ `1394ac97` (CLI); run committed and pushed; **20 model + 19 coverage tests green; lane suite 142 green**. Population/source contract
tests passed before the fit (424; 210/199/187/179/172; 199/184/164/141/119; 27/27 parquet hashes; every season 2001–2025 affirmed
once, no failures). Every consumed byte verified; **70 of 70 origin × horizon cells clear the candidate floors (≥60 rows, ≥15
appearers, both classes); every B1 position cell at the 2026 origin ≥10 rows with ≥1 appearer; no age fallback was needed (all
training ages observed).** Partition of the 84: **7 candidates + 4 recovered + 73 unresolved = 84** (asserted).

**Paired evaluation (same supported rows for every arm; 90% player-cluster intervals; RMSE interval in RMSE units):**

| h (career yr) | paired n | appear rate | candidate Brier / RMSE | B1 Brier / RMSE | cand − B1 Brier [90%] | cand − B1 RMSE [90%] | selection |
|---|---|---|---|---|---|---|---|
| 1 (yr 2) | 210 | 0.414 | 0.2293 / 24.50 | 0.2474 / 28.19 | −0.0181 [−0.0309, −0.0039] | −3.69 [−6.54, −0.53] | **cold_start_candidate** |
| 2 (yr 3) | 199 | 0.337 | 0.2200 / 36.71 | 0.2267 / 35.12 | −0.0067 [−0.0199, +0.0068] | +1.60 [−2.64, +6.61] | baseline_research_candidate |
| 3 (yr 4) | 187 | 0.251 | 0.1903 / 38.21 | 0.1912 / 37.97 | −0.0009 [−0.0187, +0.0166] | +0.24 [−4.23, +5.73] | baseline_research_candidate |
| 4 (yr 5) | 179 | 0.173 | 0.1510 / 36.80 | 0.1504 / 38.98 | +0.0006 [−0.0147, +0.0166] | −2.18 [−7.24, +3.88] | baseline_research_candidate |
| 5 (yr 6) | 172 | 0.145 | 0.1309 / 32.97 | 0.1276 / 33.74 | +0.0032 [−0.0141, +0.0203] | −0.77 [−3.13, +1.91] | baseline_research_candidate |

B2 (log_pick + round + position, no age; exploratory, never used for selection) tracks the candidate closely at every horizon
(h1 Brier −0.0151 [−0.0274, −0.0016] vs B1). **Only h=1 clears the declared rule;** h1 candidate Brier beats B1 in 10 of 14
origins, calibration slope 0.82 (B1 0.02 by construction). Sparse-cell disclosure at h=1 by draft position (n; cand vs B1 RMSE):
QB 57 (17.1 vs 21.8) · RB 42 (32.3 vs 41.3) · TE 37 (26.8 vs 28.5) · **WR 74 (23.0 vs 22.7 — the candidate is not better at WR)**.
Label sources on paired rows: h1 95 artifact / 115 convention_zero, rising to 27 / 145 at h5 — most of this population never
appears. Selecting on this evaluation is retrospective model selection, not independent confirmation; both arms are in
`evaluation.json`. Population caveat verbatim: not conditioned on remaining on a current roster; direction and size of this
mismatch have not been measured. No breakout probability anywhere.

**Sidecar `cold_start_estimates.csv` (7 rows; seasons 2026–2030; bound to capture manifest, artifact `199a48be…`, cohort,
coverage run `010020Z`):** year 1 = `cold_start_candidate` (draft-capital hurdle), years 2–5 = `baseline_research_candidate`
(position-cell means with their measured out-of-time error above). Year-1 P(appear) / E[points]: Rourke QB 0.183 / −0.21 ·
Mertz QB 0.198 / 0.56 · Howard QB 0.262 / 1.20 · McCord QB 0.334 / 1.74 · Lohner TE 0.250 / 1.02 · Bartholomew TE 0.381 / 3.45 ·
Ricky White WR 0.324 / 3.27. **Disclosure:** Rourke's year-1 E[points] is slightly negative (−0.21): the conditional ridge
extrapolates below zero at a late-round QB profile; points are deliberately not clamped (root's rule) and the value is a
research candidate, not a forecast of negative production. Baseline years 2–5 are position means (QB ≈ 11 / 11 / 10 / 7; TE
≈ 7 / 7 / 8 / 9; WR ≈ 14 / 13 / 8 / 6 points).

**Unresolved (73, `unresolved.csv`, each with reason + smallest valid next experiment):** never-appeared no draft record 58 ·
dormant drafted 6 · dormant no record 5 · never-appeared drafted outside the population 4 (Heidenreich — draft position FB; Bennett 2023, Nick Muse 2022 and
Gary Jennings 2019 — outside the 2025 class). Recovered (4) are listed with status `recovered_existing_forecast`, not unresolved.

Root: awaiting your reading of `evaluation.json` / `REPORT.md` before DG-178 consumes anything. Lane 25057 has the paths with
that caveat. **Blocker: none.**

### ROOT CODE GATE CLOSED — final tool `0e2db9e1`, reissued run `runs/20260907T012231Z/dg165_cold_start_candidate/` (clock-checked 2026-09-06 21:23 EDT)

Root accepted the exact `011503Z` results (947 paired rows, every metric, all 2,000-draw intervals, seven final paths) and authorized
DG-178 to consume the sidecar `93bc11aa…` with strict consumer checks. Remaining guards then built test-first (4 new tests; **43
cold-start tests pass, bare pytest exit code 0; ruff exit code 0**): exporter — conditional REQUIRED for a supported candidate (a
baseline cell without one exports the horizon as `unsupported`, never a partial path), games finite / within [1, 17] / equal
P × conditional, `drafted_verified` affirmatively required, origin exactly draft + 1 = 2026 with seasons 2026–2030; capture —
duplicate season declarations in a mapping manifest refuse; artifact — incoherent closed rows (appeared ≠ games ≥ 1, points without
appearance) refuse; REPORT — the earlier "77 unresolved" wording was WRONG and now reads the explicit partition **7 candidates /
73 unresolved / 4 recovered**; caveats carried into `evaluation.json`, REPORT and the manifest: research default PPR championship
window, not exact league scoring; intervals conditional on the fixed fits and realized origins 2012–2025, no season or model-fit
uncertainty; CLI records `launch_git_sha` + `launched_utc` BEFORE any input is read and names `written_utc` truthfully.

**Reissued run proof (final tool `0e2db9e1`, run commit `d7c2344b`, HEAD `f712188f` (plan commit on top of run commit `d7c2344b`), pushed):**
`cold_start_estimates.csv`, `paired_rows.csv`, `population.csv`, `support.csv`, `unresolved.csv` **byte-identical** to `011503Z`;
`evaluation.json` horizons **0 changed leaves, 0 added, 0 removed**; `final_origin_2026` identical; only `caveats.bootstrap` and
`caveats.scoring` added. Sidecar sha256 **`93bc11aaf6781fb98f678ed52ce47417a04945c3b9b4b62363eef105dcc4eff7`** (= root's authorized
`93bc11…`); manifest sha256 `2d4594863649c042fb10dad54d986e82aaf1d38cca986d52791fa76db2f13b98`; `launched_utc`
2026-09-07T01:22:29Z, `written_utc` 2026-09-07T01:22:31Z. `011503Z` carries `SUPERSEDED.md`, originals untouched. Plan Task 6
records the actual rules. **Blocker: none; lane idle, awaiting root's final replay with the final tool.**

### ROOT FINAL ACCEPTANCE GREEN — available-players build, DG-165 lane closed (clock-checked 2026-09-06 21:37 EDT)

Root: clean `f712188f`; final run `012231Z` (manifest `2d459486…`, sidecar `93bc11aa…`) replayed with the final tool at
DG179 `runs/20260907T013023Z` — all five CSVs and the entire `evaluation.json` byte-for-byte; 43 tests + scoped ruff pass on
root's side; independent reviewer confirmed every output/upstream hash, the 424 population, 947 paired rows, all 2,000-draw
intervals and the selection. DG-178 consumes final `012231Z` (360 / 73 numerically verified). No refit, no promotion, no production.

**Advisory recorded (not a blocker under this run's frozen read-only inputs; NOT acted on now, per root's idle instruction):**
`cold_start_model.py` re-reads each capture parquet after `verify_capture` hashed it, and re-reads the manifest likewise — a
verify-then-reread gap. Any future reuse on a mutable source must hash and parse the SAME buffer and keep one manifest snapshot
(the transition-audit loaders already do this). No realized mismatch; no result change. Lane idle; no new model family or
experiment is authorized by this acceptance.

**Consumption record (lane 25057, clock-checked 2026-09-06 21:41 EDT):** DG-178 catalog `runs/20260907T013635Z/dg178_available_catalog`
(DG-178 head `74dc624d`) consumed final `012231Z` new-only (estimates `93bc11aa…`, manifest `2d459486…`): all seven rows bind,
every value exact; default pool 433 = 360 with a forecast (353 accepted + my 4 recovered rows, verified cell-for-cell against
`recovery_sidecar.csv`, + 7 starting estimates) + 73 without; the 825 accepted rows byte-unchanged. Per-year classes carried
(2026 cold-start candidate, 2027–2030 historical baseline), tab labelled "starting estimate" with the h1 evidence and the
draft-population caveat; Rourke 2026 stays −0.21; no impact number fabricated. Consumer guards root-reviewed. Nothing needed
from this lane. **Lane idle.**

**Correction (lane 25057, clock-checked 2026-09-06 21:43 EDT):** the 360 breakdown above double-counted the four recoveries. Counted from
catalog `013635Z` rows: **349 original accepted + 4 recovered = 353 frozen, + 7 starting estimates = 360 with a forecast; 73
without; 433 total.** Everything else in that record stands; root's final acceptance remains GREEN.
