# DG-060 — Versioned universe snapshot contract for coverage claims (§8.6)

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §8.6 requires every coverage claim to name a versioned universe_snapshot_id whose UniverseDefinition records the as-of boundary and inclusion reasons, counted over UniverseMemberCardState rows — and none of the three types exists (zero grep hits). Coverage today is counted over the mutable runtime universe artifact (12,225-row universe_pvo_runtime.json; the daily divergence coverage report counts 12,226 players), so a coverage percentage cannot be replayed as it stood on a date or compared honestly across dates. That matters directly to the 2027 fuel: the season archive's completeness claims are only certifiable against a named, versioned snapshot. The substrate is real (sleeper_universe_snapshot.v1 schema, identity_unresolved states) — this ticket puts the contract on top of it.

**How we know:** grep 'UniverseMemberCardState|UniverseDefinition|universe_snapshot_id' src/ app/ scripts/ tests/ = 0 hits (run 2026-08-26); src/dynasty_genius/sleeper_universe.py:28 (schema sleeper_universe_snapshot.v1); app/data/valuation_runtime/universe_pvo_runtime.json (12,225 rows, overwritten daily); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:453-467

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
