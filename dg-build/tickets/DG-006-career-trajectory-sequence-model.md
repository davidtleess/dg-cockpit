# DG-006 — Model the career arc as a sequence, not a season

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18 ("Temporal Fusion Transformers")

**Problem:** Engine B projects from a small window of lagged season features. It has no
representation of a career shape — the difference between a player climbing, plateauing and falling
off is exactly the dynasty question, and we compress it into two lag columns.

**How we know:** `ENGINE_B_ALLOWED_FEATURES` in `models/engine_b_contract.py` is a flat per-season
feature vector with `ppg_t_minus_1` / `ppg_t_minus_2` lags. No sequence model exists in the repo.

**Done looks like:** a multi-horizon (1/2/3-year) projection produced from a player's full game-log
sequence plus static draft and athletic metadata, benchmarked head-to-head against current Engine B
on the same walk-forward folds. **If it does not beat the lag model, we say so and stop.**

**Depends on:** DG-002 (there is no fair benchmark without it). Weekly game logs are on disk —
`ff_opportunity`, 47,282 weekly rows, 2018–2025 — and are currently not read by the feature build.

---

**Notes**
Consultant proposed a Temporal Fusion Transformer specifically. The architecture is a detail; the
idea worth keeping is sequence-in, multi-horizon-out. A cheaper sequence model that beats the lag
baseline is a better outcome than a transformer that doesn't.
