# DG-018 — Make "does our model beat the market?" a standing measurement

**Layer:** 3  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-69536  ·  **DG 3.0**
**Source:** crew lane horse race, 2026-08-18

**Problem:** Until tonight nobody had ever asked whether the model outperforms free consensus pricing.
When it was finally asked, the answer came back **no — the market wins at every position**
(−0.030 Spearman pooled, −0.107 at QB). That number has no home, no owner and no schedule, so it can
drift back to unknown.

**How we know:** four annual point-in-time market snapshots are on disk and have been for years —
`app/data/fc_snapshots.db`, `snapshot_date` distinct values **2021-09-08, 2022-09-08, 2023-09-08,
2024-09-08** (plus 2026 dailies), 6,790 rows total.

**Done looks like:** the model-vs-market comparison runs on a schedule and its result is visible
wherever model quality is reported. A losing scoreboard shown honestly is worth more than no scoreboard.

**Depends on:** DG-017. Any horse race run before pipeline parity is comparing the market against an
estimator we do not ship.

---

**Notes**
The first run of this test showed the model **winning** by +0.078 Spearman. It was wrong — a model
trained on season *s* was being scored against a market snapshot taken before season *s* was played.
The lane disbelieved its own favourable result and found the bug. That instinct is the reason this
number can be trusted at all, and the corrected direction is the unfavourable one.

**This is the measurement that would eventually earn the right to turn off `decision_supported: false`.**
Right now it argues for keeping it off.

---

**LANDED main `5a2bfc12` 2026-09-04 13:32 ET (Fred, davidleess-eb d4e70e) — NOT live until the next trunk pull.** Built after David's 2026-09-04 13:14 ET redirect ("...so that our rankings of players are the best in the world"), which made ranking quality the program. Gate 6885 passed / 33 skipped, frontend 93 files / 649 tests.

**What shipped:** `src/dynasty_genius/outcome_loop/model_vs_market_scorer.py` (pure) + `scripts/run_model_vs_market_scoring.py` (wiring) + 14 tests, 8 red first.

**Why it is a NEW scorer and not a change to the realized-outcome loop:** that loop grades the model against REALITY and says so in its own docstring — `realized_outcome_scorer.py:10` "market data never enters", `:97-98` precision@k model-only with no difference CI. It structurally cannot answer this ticket. This one ranks the same players by model and by market, grades BOTH against the SAME realized outcomes, and reports the paired NDCG difference with a BCa interval (reusing `compute_ndcg_diff_bootstrap`, already in `backtest_metrics`).

**Measured coverage the card carries (declared frozen set 2026-08-05):** 501 model predictions · 474 market rows · **304 paired** · 197 model-only · 170 market-only. Per position paired/model-only/market-only — QB 50/12/18 · RB 84/43/25 · WR 117/88/37 · TE 53/54/14. Every position clears the power floor of 10.

⛔ **Traps this ticket found, recorded so nobody re-learns them:**
1. **The deadline in the brief was false.** "If the collection path is not right BEFORE 09-10 we lose the season's first weeks" — NO. `run_realized_outcome_scoring.py` `_build_outcomes` loops `range(1, week+1)` into a THROWAWAY store, rebuilding every finalised week from nflverse on every run. A first run in week 6 grades weeks 1-6. Nothing perishes at kickoff.
2. **Week 1 can never produce a number.** `ELIGIBLE_GAMES_MIN = 4` and `POWER_FLOOR_MIN_COHORT = 10`: a player needs 4 played games to be rank-eligible. The earliest real figure is **week 4**.
3. **The ledger is not 866,990 predictions.** Only **35,645** rows (4.1%) carry one; 831,345 are `capture_incomplete` non-model rows. ~503/day.
4. **`OutcomeIdentityBridge` resolves sleeper→gsis FORWARD ONLY — there is no reverse lookup.** A first cut here hedged the reverse direction with `hasattr` and would have returned zero outcomes for ever while reporting a healthy weekly no-op. The mapping is now driven from the predictions, and finalised-weeks-with-no-outcomes is a NAMED FAILURE, not a no-op.

**Governance:** the frozen set is David's own declaration (`app/config/realized_outcome_frozen_predictions.json`, 2026-08-13, "the frozen set is 2026-08-05"). Checked for drift before building: 501 eligible + 12,209 snapshot rows today, exactly the numbers recorded when he declared it. Read through the realized loop's own governed reader so the two scorecards cannot disagree about what was frozen.

**Rules pinned by tests, each because this project has been burned:** the denominator ships on the FACE (a difference on the 304 shown without the 367 is the trap); a null is a result (an interval containing zero sets `beats_market` to None and is reported straddling zero); skill not agreement (a model identical to the market scores exactly zero).

**Still open, deliberately:** no schedule (nothing to grade until week 4), no API route, no surface. Wiring it into the Tuesday job is a follow-up once a real card exists.
