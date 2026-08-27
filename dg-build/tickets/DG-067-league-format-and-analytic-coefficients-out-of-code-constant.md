# DG-067 — League format and analytic coefficients out of code constants, into versioned policy

**Layer:** 4  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §9.2's own named anti-pattern is live in production: Superflex/PPR sit as code defaults consumed by PVO assembly even though the daily league capture already snapshots scoring_settings and roster_positions from source; consolidation effects are hard-coded coefficients; posture weights are code constants (mitigated: they are at least test-pinned via the graduation contract). Deliverable: derive league format from the captured rules lane instead of defaults, and register the analytic coefficients as versioned, disclosed policy artifacts with provenance — so every league-derived number can say which policy version produced it. This is certification plumbing for the whole layer's outputs.

**How we know:** src/dynasty_genius/models/league_context.py:36-37 (is_superflex/is_ppr code defaults) consumed at src/dynasty_genius/pvo_assembler.py:154; src/dynasty_genius/trade_lab/evaluator.py:11-12,57-61 (CONSOLIDATION_KAPPA/FLOOR hard-coded); src/dynasty_genius/team_posture.py:28 (POSTURE_SIGNAL_WEIGHTS constant, test-pinned per its comment); today's snapshot.json already carries league.scoring_settings + roster_positions (L4 audit)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
