# DG-003 — Give the projection a distribution, not a single number

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18

**Problem:** Every model output is a point estimate. There is no way to distinguish a player we are
confident about from one who is a coin flip, which is exactly the difference that matters in a
dynasty roster.

**How we know:** `projection_2y` and `dynasty_value_score` are single scalars per player in
`app/data/valuation_runtime/universe_pvo_runtime.json` (captured 2026-08-18T13:30Z). No interval,
no percentile, no variance field anywhere in the served row.

**Done looks like:** each projection carries a distribution — at minimum a median and a credible
interval — and the interval is derived from something measured, not assumed.

**Depends on:** DG-002 (you cannot calibrate an interval you have never tested out-of-time), and
realistically on the outcome loop actually scoring a finalized week.

---

**Notes**
The outcome loop was rebuilt this month and is real code now — `OutcomeIdentityBridge`, frozen-cohort
resolution in `scripts/run_realized_outcome_scoring.py`. It has not yet scored anything: today's
marker reads `status: noop`, `noop_reason: week_not_finalized`, finished 2026-08-18T20:30Z. That is
correct behaviour in August, not a fault. From Week 1 it starts producing the residuals this ticket
needs.
