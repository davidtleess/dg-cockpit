# DG-008 — Three proposed edge features: Opportunity Delta, Market Disconnect, Efficiency Sustainability

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18 (Tier-3 "asymmetric signal")

**Problem:** The consultant proposes three features intended to be non-consensus. Each is worth
testing; none has been.

- **Opportunity Delta** — a player's share of high-value touches relative to his team's baseline,
  normalised for game script.
- **Market Disconnect Index** — the gap between our value and consensus market price.
- **Efficiency Sustainability Index** — a regression penalty on players whose points-per-touch runs
  far above expected points.

**How we know:** none of the three names appears in the repo.

**Done looks like:** each of the three built, then tested for whether it adds anything over the
existing allowed feature set on the DG-002 folds. **A feature that does not improve out-of-time error
gets deleted, not kept because it sounds smart.**

**Depends on:** DG-002 for the test. All three are buildable from data already on disk.

---

**Notes worth having before anyone starts:**

**Market Disconnect is largely already built and the consultant did not know that.** There is a daily
`market_divergence_refresh` job, `src/dynasty_genius/universe_market_divergence.py`, and a 963 MB
`market_divergence_history.db`. The real gap is coverage, not concept: `market_overlay_present_count`
is **397 of 12,222 players (3.2%)**, with 11,890 UNAVAILABLE
(`app/data/valuation/universe_market_divergence_coverage_latest.json`, 2026-08-18). Fixing coverage
is probably worth more than building a second index.

**Efficiency Sustainability has its substrate on disk already** — `ff_opportunity` carries expected-
points columns across 47,282 weekly rows, 2018–2025, and the feature build currently does not read
that table at all.
