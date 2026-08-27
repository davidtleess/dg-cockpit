# DG-073 — Scenario 2: hold-versus-move for a David-selected player — the first DOO client

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** direct  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** The second scenario in §10.4's mandated build order has no code anywhere (the only grep hits are backup-staging data noise). Hold-versus-move is the smallest decision David actually makes repeatedly, and it is the natural first client of the DOO: it composes lanes that already run daily — intrinsic PVO, the rebased market divergence, roster-capacity context — each with its own receipt and claim level, no lane borrowing support from another. Built against today's model it is descriptive-only by construction (the 2026 no-buy/sell ruling and decision_supported=false hold); against the 2027 rebuild it is the first surface where a certified decision-grade number would actually land in front of him. Depends on the DOO/ClaimLevel ticket.

**How we know:** grep hold_vs/hold-versus across src/, app/, frontend/src/: no code hits (verified 2026-08-26); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:576-581 (build order, scenario 2); scenario 1 and 3 precedents: src/dynasty_genius/roster_capacity/scenario_simulator.py:1-7, src/dynasty_genius/trade_lab/cross_lane_review.py:1-15

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
