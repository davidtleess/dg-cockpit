# DG-088 — Tied dynasty_value_scores receive split percentiles: pool the ties (David's ruling)

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **post-freeze**
**Source:** DG-086 pre-land adversarial panel (2026-08-29); **David's panel ruling same day:
"Pool the ties — file a ticket."**

**Problem:** `scripts/compute_dvs_pct_batch.py:32-34` ranks by the ROUNDED dynasty_value_score
with a strict rank formula — tied values get adjacent, distinct percentiles. Measured on the
2026-08-29 live population: 23 tie groups holding 64 players; the worst case is the DVS-100.0
ceiling group — 11 TEs at identical displayed score spread dvs_pct 88.6 → 100.0. Two players
showing the same DVS on a surface show different percentile ranks.

**How we know:** panel measurement over app/data/valuation_runtime/universe_pvo_runtime.json
(captured 2026-08-29T13:00Z) + a scratch replica run of the landed producer; tie-break order
traced to app/services/engine_b_service.py:200 (unrounded predicted_avg_ppg_t1_t2, then feature
CSV row order) — deterministic and model-derived, so today's behavior is defensible, but the
criterion is invisible in the published artifact.

**Done looks like:** tied dynasty_value_scores share ONE percentile (pooling method — max-rank
or mid-rank — chosen and recorded); the determinism test extended to pin tie behavior; the
phase15 spec formula (docs/superpowers/specs/2026-05-16-phase15-trade-lab.md §3.7) amended with
David's ruling cited, since this CHANGES the ratified formula. The 11-TE ceiling group must read
as one rank after the change.

**Constraints:** POST-FREEZE (this changes published values — Tier 3-shaped during the sprint;
freeze bars it until soak ends). Coordinate with DG-016/SR-13's clamp record: the ceiling group
IS the clamp population — pooling interacts with any future clamp fix.

**Rollback:** revert the one calculator commit.
