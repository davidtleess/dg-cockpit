---
name: david_rulings_dg128_2026-09-01
description: David's 2026-09-01 evening rulings on DG-128 (rank-everyone gate): no hypothesis slot, pre-committed taper, band ships with the number, wait for the 09:00 regen; plus the verified scope (115 not 498; Dell has no 2025 row at all — not a floor case)
metadata:
  type: project
  originSessionId: 63ad1fbb-22bf-497c-99a3-041ec8887667
---

Rulings David gave DIRECTLY in session 63ad1fbb (AskUserQuestion + typed), 2026-09-01 ~21:00–21:30 EDT.
Session identity: this lane is `davidleess-45`; it is NOT "Bob" (Bob = yesterday's tickets lane; no session
self-identifies as Bob). "outsource some work to Bob" was a REAL queued human command at 20:55:37Z in session
6f07a6c0 (absorbed mid-turn, never a `user` record) — the relay from davidleess-0b was faithful.

**Rulings (verbatim in substance):**
1. **DG-128 is a coverage fix, NOT a promotion candidate — spends NO hypothesis slot.** "Rank-everyone is a
   standing product ruling, not an accuracy claim." He picks the family of five separately, not tonight.
2. **Build the taper to a PRE-COMMITTED form; do not tune against the holdout.** "If you find yourself comparing
   candidate priors to see which ranks better, stop — that's a slot and it needs registering."
3. **The band ships with the number.** No width field exists anywhere (model/API/frontend) — building it is
   INSIDE this work, not a follow-up. "A prior-dominated estimate must not render with the same authority as a
   measured one." Do not ask whether to build it; ask only if how it READS on screen forks.
4. **Hard gate: stop and show him the SIZE if already-ranked values or percentiles move before anything ships.**
   He expects percentiles to move (denominator 468→583, all 468 carry `xvar_percentile_overall`; bounded ±19.7
   pts, ~9.8 at median; raw DVS is absolute and does not recompute).
5. **"wait for tomorrow morning"** — do NOT hand-regenerate the feature table tonight. The chain publishes
   `app/data/features_runtime/engine_b_features_runtime.csv` at 09:00 daily (`run_daily_chain.py` →
   `run_feature_refresh.py` → `publish_runtime`); scoring prefers runtime over the committed seed
   `app/data/training/engine_b_features_v2.csv`. Today's runtime (09:00) predates DG-127 (`738b7525`, 10:16) so
   NEITHER table carries `games_t_minus_1/2` yet. Validator gates (prohibited names, future-leakage names,
   required cols, null-rate on snap_share/games_t/ppg_t) will NOT reject the new columns.
6. **Framing feedback (relayed by 0b, consistent with his 16:30 words):** ask him football/product questions in
   plain language WITH a recommendation; engineering decisions (files, tests, encoding, ordering) are mine.

**Verified scope 2026-09-01 (run, not quoted):**
- Baseline 468 of 12,226 ranked. Unranked = PRE_MODEL 9,404 · INACTIVE 2,238 · **ENGINE_B 115** · UNRESOLVED 1.
  **The gate fix reaches 115, NOT the ticket's 498/954** (0b confirmed and corrected to David).
- **114 of 115 have games_t ∈ {4,5,6,7}** (one at 13 — separate cause, unexamined). Blend window `1<=n<8`
  already covers them; **the ONLY missing input is `_dvs_a`** (`pvo_assembler.py:461`).
- `_dvs_a` = Engine A = the PROSPECT model; needs `features["pick"]`+`["round"]` (+age) at :357-370. Draft
  capital is populated for exactly 80 players (all ENGINE_A prospects) and None for all 11,758 unranked.
  Zero `dvs_engine == "blend"` ever. "Starved, not missing" is CORRECT.
- Garrett Wilson (WR) + Braelon Allen (RB) are in the 115. **Tank Dell is PRE_MODEL because he has NO
  2025 row at all — `player_snap_count` shows 2023 (11 games), 2024 (14), 2025 NONE; the runtime table's
  only Dell row is 2023 (games_t 10); he is Sleeper-Inactive.** CORRECTED 2026-09-02 (verified in sqlite;
  Greg `davidleess-0b` had it right): this line used to say the 4-game floor censored him, which was
  wrong — there is no sub-4-game 2025 season to censor. No threshold change reaches him; see
  [[project_lou_audit_verified_2026-09-02]].
- Durability reproduces: Spearman **0.371** (n=1,733 pairs); prev≤8 → 10.3 games, prev≥14 → 14.0 → **26%**
  penalty where the gate applies 100%.
- Trap 2 real at **`scripts/train_engine_b.py:206/308/386`** (NOT `src/.../models/train_engine_b.py`) — no
  `keep_empty_features`; `backtest_harness.py:489` has it.
- Left-censoring at 4 is documented in-code at `feature_assembly.py:318`.

**Pre-committed taper form (decided before any fit, per ruling 2):** keep `w_B = n/(n+k)` and `DVS_BLEND_K`
UNTOUCHED; feed draft capital (via `nflreadpy.load_draft_picks()`, gsis-keyed, UNDRAFTED as a category) so
Engine A yields the prior. Band width derives from the SAME weight (prior-heavy → wide), no new knob.
Draft capital must NOT enter `ENGINE_B_BASE_FEATURES` (that would be a model change = slot).

Related: [[david_rulings_ranking_2026-08-31]] [[project_ranking_diagnosis_2026-08-31]]
[[feedback_relay_authority_drift]] [[reference_midturn_messages_invisible]] [[cockpit_session_identity]]
