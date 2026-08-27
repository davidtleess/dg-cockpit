# DG-069 — The divergence band is an unversioned constant — make every band versioned, evidence-backed, disclosed

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 1d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** NOISE_BAND = 0.10 is a bare code constant, and it is the single threshold that decides which model-vs-market deltas the product calls meaningful. Section 10.1 is explicit: every band is versioned, evidence-backed, and disclosed — a band is not an implicit buy/sell threshold. Nothing records where 0.10 came from, so every band-dependent classification (and the entire future change-event stream, which fires on band crossings) inherits an arbitrary number with no receipt. Done looks like a versioned band artifact with a derivation receipt (DG-019's over-dispersion replication cohorts, unlocked by DG-020's snapshot backfill, are the natural evidence source for the width), consumed by the divergence builder instead of the constant, and disclosed on the served artifact.

**How we know:** src/dynasty_genius/universe_market_divergence.py:13 (NOISE_BAND = 0.10), :95 (sole classification use); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:522 (mandate); tickets/DG-019-market-over-dispersion.md (evidence source, not coverage)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
