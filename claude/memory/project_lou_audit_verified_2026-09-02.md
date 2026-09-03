---
name: project_lou_audit_verified_2026-09-02
description: What survived independent re-measurement of Codex/"Lou"'s model audit (2026-09-02) — Dell mechanism refuted (no 2025 row at all, no threshold fixes him), DG-026 leak wider than train_engine_b, Lou's shrinkage formula = DG-128 taper shape with the player's OWN career as anchor, Wilson cliff-bypass benchmark WR33
metadata:
  type: project
---

Verified 2026-09-02 ~00:00 ET by a read-only fan-out (7 of 10 checks completed; availability bands,
cliff-indicator AUC reproduction and the QB-rushing head-to-head did NOT run — the account hit its
monthly spend limit mid-run, "session limit resets 12:20am ET"; David not yet asked whether to re-run).

**Exact (reproduced to the digit):** 904 active / 453 blank / 346 PRE_MODEL / 107 gated; David's
roster blanks = Braelon Allen, Garrett Wilson (both gated, 4–7 games) + Tank Dell (PRE_MODEL);
2025 partition 115 with 4–7 games → 114 projections, 0 DVS; Wilson row 7 g / 14.21 / lags 14.82,
12.54 / projection 11.22 / availability 0.8846; **cliff-bypass benchmark DVS 68.5, xVAR 7.9 ≈ WR33,
overall ~86** (WR29 / 77 against Engine B alone); coef×SD shares all 12 numbers; shrinkage n=99
4.637 → 4.263.

**Refuted — Dell:** the crosswalk maps sleeper 9502 ↔ gsis 00-0038977 fine. Dell played 0 games in
2025 → no 2025 season row exists → never scored → identity stamped only from a matched PVO
(``src/dynasty_genius/universe_pvo_batch.py:161/165` (NOT scripts/build_universe_pvo_batch.py — those lines are crosswalk `continue`s; a0 caught the wrong-file citation 09-02)`) → nulls. Fred's "MIN_GAMES_THRESHOLD=4 drops him" is ALSO
imprecise: the floor never fires because there is no row to refuse; his 14-game 2024 is dropped as
the in-between season (`feature_assembly.py:127`); only his 2023 training row survives. **No games
threshold change ranks Dell — he needs a row carried forward from prior seasons** (Lou's rec #1;
the ~380 "no 2025 row" population). Same for "346 have no canonical ID": symptom, not cause — 190
of them ARE in the crosswalk.

**DG-026 is wider than Lou said:** 70.6% of the 2022 holdout rows carry the identical 2023 PPG
inside both their training label (T=2021) and test label (T=2022). `backtest_harness.py:463/553`,
`qb_v3_walk_forward.py:131` and `availability.py:195-200` all split on feature season, so EVERY
walk-forward number in the product — including the availability AUC 0.811 — is modestly optimistic
(pooled ≈ +0.05 RMSE). On the board since 08-19, todo.

**Lou's shrinkage formula recovered:** the 4.263 is hit exactly at `w = games/(games+6)` toward
the player's games-weighted OWN prior career PPG — the same functional form as DG-128's taper
`w_B = n/(n+k)`, with a different ANCHOR (own career vs draft-day Engine A prior). The verifier's
fuller career state (career PPG + career games + seasons) beat two lags with CI excluding zero
(−0.058; 4–7-game group −0.164 [−0.319, −0.016]); gain is QB/RB, not WR/TE. **How to apply:** the
F decision is the anchor — for a player with prior NFL seasons, own career beats draft-day; the
draft-day prior belongs to players with no NFL history. Wilson vs WR33 is the by-name test.

Minor: Lou's `contracts/engine_b_contract.py` path is wrong (it is `models/`); availability
features are lines 51–58 not 41; Lou's "games" share folds in the three history-available flags
(games_t alone WR 10.6 / TE 12.0). See [[david_rulings_dg128_2026-09-01]],
[[project_ranking_diagnosis_2026-08-31]], [[project_dg133_partition_fix_landed]].

**Update 2026-09-02 05:40 ET:** David: "finish the verification checks. tell a0 to do it." The three unfinished checks (availability-bands, cliff-indicator AUC 0.8091→0.8098 / 0.754→0.809, QB-rushing H2-vs-Lou head-to-head) plus a skeptic pass on the Dell "0 games → no row" chain were delegated to `davidleess-a0` (msg 52f181f4), read-only, results to return to Tower. Fred independently confirmed Dell via player_snap_count (2023 11 g, 2024 14 g, 2025 none; runtime table holds only his 2023 row) and recorded the own-career anchor as context on DG-128. Fred also found DG-133's selector yields 505 rows → 503 PVOs (Nick Kallerup TE, Ke'Shawn Williams WR have no sleeper_id — pre-existing orphans), so the live check after a0's restart is 505 scores / 503 PVOs.

**a0's four checks landed 2026-09-02 ~06:20 ET (each re-measured by an independent skeptic; nothing touched the tree):**
- **Availability bands — PARTIAL, mislabelled one way.** Lou's 52.8 / 71.8 / 85.6 / 95.2 reproduce to the decimal (n 651/646/762/820, coverage 2,879/2,879), but the target is a TWO-season window (qualifying ≥4-game season at t+1 OR t+2; `availability.py:41-46`, `feature_assembly.py:83-95`), not "next-season return". Literal one-year: 45.8 / 64.6 / 79.6 / 92.8. 1-3-game band UNVERIFIABLE in v2 (censored); v1 CSV (n=291) gives 55-65% vs Lou's 36.8%.
- **⛔ Lou's 7.7% / 23.6% durability claim is REFUTED ON DIRECTION.** Top games-quartile full-zero rate = 25/481 = 5.2% (CI 3.5-7.6) vs population 638/2,879 = 22.2%. Monotone by quartile 45.8 / 23.0 / 9.6 / 5.2 — durability is a 3-4× BENEFIT, not a penalty. Lou's figures read as transposed. Never quote his version.
- **Cliff indicator — no detectable effect either way.** games≥8 indicator: AUC 0.811771 → 0.810877 (−0.0009; Lou said +0.0007); both ≈ SE/11 (HM SE 0.010). Lou's conclusion (the 8-game cliff has no empirical support) stands; his evidence does not. Register's 0.811 = n-weighted mean-of-fold AUC 0.8113 (pooled is 0.8118, rounds to 0.812).
- **Model-free cliff test (Tower, 09-02 06:25, v2 training rows n=2,879, outcome_returned):** return rate by games_t: 4→46.3% · 5→48.8 · 6→56.3 · **7→60.1 · 8→59.9** · 9→74.3 · 10→73.1 · 11→80.0 · 12→80.2 · 13→85.7 · 14→89.7 · 15→86.1 · 16→95.9 · 17→92.5 · 18→96.1 · 19→98.4 · 20-21→100. **There is no step at 8 — the gate `ENGINE_B_MIN_GAMES_T=8` is an arbitrary cut on a smooth ramp.** The single most legible piece of evidence for David's "no cliff" ruling. **a0 reproduced it independently (stdlib csv, identical to the decimal) and added two guardrails: (1) do NOT promote 9 as "the real cliff" — the 8→9 step (+14.4pp) is the max of 17 adjacent comparisons at n≈150, SE≈3.8pp/point; honest statement = monotone ramp, no discontinuity anywhere. (2) Lead with the constructive half: the ramp IS the width David ruled for — 7 games ≈ 60% return confidence, 16 ≈ 96% — the gate trades a graded measured confidence for a blank; and it is the empirical curve DG-128's taper w_B = n/(n+k) approximates, to be checked against, not assumed. Sent to Fred 09-02 06:35.**
- **QB rushing — both audits right to their own question; the register's SUPPORTED label overstates.** They differ by BASELINE, not metric/validation/sample: H2's control is passing production only; Lou's control is the served set incl. `ppg_t`, and QB fantasy PPG mechanically contains rushing points (median 13.2% of a QB's season; 28.2% for flag-positive QBs). H2 = "does rushing help without PPG" (yes); Lou = "beyond PPG" (no). Flag reproduces 100% (3,384/3,384; QB 392/392). **Ranking impact — whether any of this moves a player David looks at — measured by nobody. That is the only number that decides anything.**
- **Dell — CONFIRMED under attack.** 19,422 weekly 2025 rows, 0 for 00-0038977; 14 REG 2024, 10 in 2023; crosswalk 7,952 entries, one hit each way, no dup keys; feature histogram 2018:472 … 2023:469, 2025:505, 2024 ABSENT. **Dating caution:** the served artifact was built 09-01 06:02, BEFORE DG-133 landed (23:01) — "505" after the restart comes from the API scoring the CSV at request time via the new selector; the universe artifact only changes when the chain rebuilds it.
