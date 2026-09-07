---
name: project_dg177_round1_state_2026-09-06
description: "DG-177 veteran forecasting state after Codex's round-1 review (2026-09-06) — shared label-closure rule, corrected inner tuning, annual REG target contract with DG-178, results and the \"three closed seasons\" cost"
metadata: 
  node_type: memory
  type: project
  originSessionId: 615655e2-b8a6-42f8-abc6-d23dd7e2fdbd
  modified: 2026-09-06T14:57:21.106Z
---

**State (2026-09-06, branch `ticket/DG-177`, worktree `~/dg-wt/DG-177`, checkpoints `09eee65a` → `e680e48b` →
`20e25c0c` + the annual commit).** Report-only; nothing served changed; not merged. Codex orchestrates; David
delegated (recorded in the Codex session log).

**What now exists that other lanes should reuse rather than re-invent**
- `src/dynasty_genius/models/label_closure.py` — THE cutoff rule: a label spanning `window` seasons after feature
  season t trains a forecast for season s only if `t + window <= s`. `assert_labels_known` refuses an open label.
- `src/dynasty_genius/models/leak_free_tuning.py` — ridge alpha on expanding-time inner folds clustered on player,
  inner labels closed at the validation season, imputer fitted inside each inner fold. The trainer imports it.
- Fixed on the branch: `eval/backtest_harness.py` (was `feature_season < test_year`), `models/availability.py`
  (trained on every earlier season), the trainer's inner selection + pre-split imputation. **Still open, reported
  not touched:** `eval/te_role_risk_experiment.py:82`, `eval/qb_v3_walk_forward.py:131`, `eval/te_archetype_bakeoff.py:100`.

**The cost nobody expects:** with a two-season label the corrected inner selection needs THREE feature seasons in
the training window (a closed validation season with closed training rows). The file starts 2018, so two-year test
folds 2020/2021 are unevaluable; **only 2022 and 2023 evaluate.** For a one-season label, 2019 is the only lost fold.

**Results under the corrected recipe (folds 2022/2023):** served set beats 3 columns detectably at QB/RB/WR (Δr²
+0.05/+0.03/+0.02), TE +0.02 spanning zero. Raw per-game opportunity over the served set: nothing detectable anywhere,
bounded within ±0.015 at RB and ±0.002 at WR. DG-162 §1 still reproduces exactly under its own rule and recipe.
State it narrowly: the tested raw-rate ridge additions showed little gain; that does not prove opportunity
information has no value.

**Annual target contract (typed, agreed with DG-178 / lane 25057):** REG scope; `fantasy_points_ppr` (the same
column the assembler sums for the served all-games `ppg_t`; alignment check exact to 6e-14); exposure = weekly
stat-row games; event A_j = appeared (≥1 game); quantities p_appear / e_points|appear / e_games|appear / p×e;
horizons 1–2 ONLY; population = the 2025 feature partition (505 rows); `no_feature_row` never 0; identity
`unresolved_in_source` never 0. Labels from a fresh nflreadpy weekly pull saved with sha in the run dir (no local
cache exists; `cache_mode=memory`). Candidate arm = the three-column set (chosen on the same folds; both arms
exported). QB year-2 with the served list scored BELOW the base rate — do not export that arm as the candidate.

Related: [[reference_ffopportunity_expected_points_are_retrospective]], [[project_dg162_what_the_model_reads_2026-09-04]],
[[feedback_indistinguishable_is_not_equal_bound_the_difference]].

**Round 2 additions (same day, checkpoints `e8fc3071`, `46a289fb`):**
- `eval/annual_outcomes.validate_weekly_source` + `drop_unattributed_zero_rows`: nflverse weekly stats carry ONE
  placeholder row per season-week (no id, no position, 0 points — 173 over 2018-25) plus, over 2005-25, two
  unattributed stat lines (2005 LV "Team" 6.0; 2012 TEN "D.Bryant" 3.1). The pull must NOT fillna(0); placeholders
  are dropped and counted; stat lines dropped only under a stated 10-pt/season tolerance and listed. Outcomes and
  targets refuse an unvalidated source.
- **Nested selection policy costs another fold:** choosing {baseline, candidate, blend} on closed inner folds with
  the candidate refit leak-free inside means year-1 evidence starts at test 2021 and **year 2 has NO evaluable fold
  on the 2018-based file**. The basic cohort (2005+, `eval/basic_cohort.py`) is the remedy; unsupported horizons are
  reported, never filled from year two.
- Three more masks closed: TE role-risk, TE archetype (window 2), QB v3 walk-forward (window = horizon). QB v3 is an
  **F25 frozen artifact** pinned in `scripts/run_qb1_study.py` AND `tests/contract/test_qb1_green_correction_contracts.py`
  (deliberate double entry) — re-pin BOTH with a dated reason when it legitimately changes.
- Identity: DG-178's message swapped two Sleeper ids; their CSV was right. 9484 = Tucker Kraft; Tank Dell = 9502 →
  gsis 00-0038977 (nflverse `load_ff_playerids()` maps sleeper_id→gsis_id; `load_players()` has NO sleeper_id).

**Championship-window increment (09-06 evening, checkpoints `568b247f`…`030dadfe`):** David confirmed the championship ends
NFL Week 17 → new research target `nflverse_default_ppr_championship_window_v1` (REG weeks 1–16 through 2020, 1–17 from
2021, equal weights; NOT David's exact scoring; Codex/DG-179 owns the shared outcome artifact + cleaning/coverage
contract — see `dg-build/CHAMPIONSHIP-WINDOW-2026-09-06.md`). Features stay ALL NFL games (DG-024).
- **Offensive-role fallback** (`basic_cohort.resolve_offensive_role`): non-offensive stat-line position → exactly one
  offensive role in the SAME season's roster rows, else abstain; today's listing never used. Source: DG-165's roster
  capture `dg-wt/DG-165/runs/20260906T154706Z/dg165_rookie_capital/inputs/nflverse_rosters.parquet` = ONE season-end
  roster row per player-season (mean 1.02), 1999–2025, week-dated (Hunter's only 2025 row: wk 19 WC, WR/WR, RES).
  Regrade `20260906T191832Z`: 233 resolved (RB 196 = fullback-type), no cell's reading changed; Hunter → WR, 2026
  p_appear 0.89.
- **Cleaning gate:** Codex forbids auto-adopting the 10-pt unattributed-row tolerance → `split_unattributed_rows`
  default is REFUSE; a tolerance must be passed (`--tolerated-unattributed-points`) and is recorded as a cleaning
  exception. `validate_weekly_source` proves week labels/uniqueness/non-missing — **not game coverage** (1999 REG has
  247 game ids vs 248; 2001 week numbering may be normalized); `game_coverage_checked: false` in the facts.
- DG-165's full raw capture: `dg-wt/DG-165/runs/20260906T191723Z/weekly_source_capture/` (1999–2025, 476,159 rows,
  150 cols, 6 unattributed scoring rows: 2001×3, 2003, 2005, 2012). Never download again; reference by path+sha.
- Manifests now carry `window_id` (`all_reg_weeks` | `championship_week17`) for DG-178's typed adapter.

**Championship refit on the common artifact (09-06 ~20:10 UTC, run `20260906T195728Z`, code `528f989c`):** labels from
DG-179's artifact (`199a48be…`, target `049d2229…`), every cell moved by thousandths, Hunter/Kraft window points 5–8% below
all-REG, p_appear unchanged. Producer = the hash-bound corrected companion beside the run (`b73027d0…`), NOT `manifest.json`.
- ⚠ **Trap found by reading the bytes:** `manifest.git_head` is read at FINISH time, so a run launched before a commit
  reports that commit's sha while running older code (195728Z: no `outcome` block yet `git_head 39545f8e`). Capture the
  head at launch (still open). And `results.json` embedded a manifest written BEFORE finalization → 7 keys disagreed
  with `manifest.json`; the runner now finalizes first and refuses on disagreement read back from disk.
- Consumer `common_outcomes._parse_outcome_rows` parses the hashed bytes as strings and refuses malformed values before
  any cast (Codex's guard list). Aging-reference sensitivity: fixed same-player reference ages out at QB/RB by year 3
  (Flacco 115→18, Hunt 88→4) vs per-season best 59/51 — a football choice for Codex/DG-178, not mine.
- **CYCLE CLOSED 09-06 ~20:35Z (Codex):** increment complete to the local research gate; preview audit `203007Z` pinned
  on 8787 (David gets the link + limitations). ⛔ Nothing merged/promoted/served; no further refits without a new
  assignment. Handoff doc `dg-build/CHAMPIONSHIP-WINDOW-REVIEW-2026-09-06.md`. Open follow-up: git_head at launch.
- **Scoring audit tool (09-06 evening, `634ddf11`):** `eval/league_scoring_audit.py` + `scripts/dg177/run_league_scoring_audit.py`;
  producer run `20260906T220010Z`. Sleeper ground truth for rostered players lives in
  `app/data/research/league_behavior/raw/2026-07-19/season_<yr>_<league>/matchups_week_NN.json` (2024 + 2025, same
  settings). Research PPR == Sleeper on 3,215 of 4,458 window player-weeks; differences are fum_lost on any play,
  fum_rec_td +6, st_ff/st_fum_rec +1 for individuals; `fum_rec`/`ff` are TEAM keys, own recoveries earn nothing.
  ⚠ ff_playerids stores sleeper_id as float (11560.0) — normalise before joining; an unmapped id is never "absent zero".
- **READY_FOR_GATE 09-06 22:08Z (root):** three-track build accepted at the human gate; DG-177 producer `220010Z`
  (manifest `2ff1b531…`), code `4265a36a`, branch `d43102a5`. ⛔ Hold: no merge/promotion/refit/restart, no new
  artifacts, preserve worktree + prior runs + the isolated 8787 preview. Record: `dg-build/PLAYER-COMPARISON-REVIEW-2026-09-06.md`.
- **Stash-selection evaluation (09-07 01:07Z, run `20260907T010712Z`, code `d7bc8315`):** the frozen future ordering ranks
  later production of drafted early-career not-yet-contributors better than origin points / draft / persistence (Δ Spearman
  intervals all > 0) but finds NO more contributors at 2 stashes per position per season (27 of 72; persistence 33). ⛔ Do not
  quote it as a waiver backtest or breakout probability. Definitions were frozen (v1→v3) before any result; root chose the
  cohort/bars/test. Reusable tool `eval/stash_selection.py`; bindings file `docs/experiments/stash_selection_bindings_v1.json`.
- **ACCEPTED 09-07 (root): stash-selection `010712Z` at `89a36364`;** replay reproduced all 11 files byte-for-byte. ⛔ Lane idle;
  no new experiment without a new assignment; nothing promoted or served.
