# DG-075 — Read-model store: precompute, publish atomically, serve with receipts

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** The layer's defining abstraction does not exist: src/dynasty_genius/ has no read_models/ package, no atomic publisher, no read-model receipts, and routes open product artifacts directly — which the proposal forbids. The worst offender is the trade asset catalog: the route json.loads the 24.3MB universe_pvo_runtime.json on every request. Build the read_models package on the validate→fail-closed→atomic-publish→ready-receipt pattern feature_publish already proves daily, migrate the trade asset catalog as the pilot (a compact precomputed catalog artifact), then rewire the four direct-open routes onto the store. This is the prerequisite for receipt-based cache invalidation (resource-layer ticket) and the belief archive.

**How we know:** src/dynasty_genius/ listing verified 2026-08-26 — no read_models/ dir; proposal docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:591-603 (no per-request parsing of large artifacts), :667 (read_models/ package), :683 (forbid routes opening artifacts); app/api/routes/trade_market.py:85-88 (json.load of universe PVO per request, verified); trust_surface.py:85,177; realized_outcome_scorecard.py:108; players.py:182; reusable pattern src/dynasty_genius/features/feature_publish.py:128-156

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
