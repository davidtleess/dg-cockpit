# DG-055 — Typed facts and the storage pilot: retire the 501-TEXT-column store through the seven proofs

**Layer:** 2  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 6d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** The normalized store keeps every column TEXT — numerics and timestamps included, 501 columns by DG-013's own measurement — violating §7.2, and §7.4's target substrate (typed Parquet for normalized/feature history, DuckDB for analytical query) has zero references anywhere in the repo. Any as-of retrieval built directly on TEXT is a cast-and-hope layer, and §7.4 forbids migrating a large store until one representative pilot proves parity, as-of correctness, append-only conflict behavior, deterministic replay, backup/restore, query performance, and rollback. Deliverable: one stream (e.g. ngs_passing) piloted to typed Parquet + DuckDB behind all seven proofs, preserving the proven capture-ledger conflict behavior, then the pilot generalized into a repeatable migration recipe. This is the substrate DG-013's vintage layout should be written on, so it sequences immediately before or with DG-013.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:331-333 (typed facts), :355-374 (storage target + seven pilot proofs); /Users/davidleess/dg-build/tickets/DG-013-temporal-feature-store.md (843 MB store, all 501 columns declared TEXT); grep for duckdb across src/, app/, scripts/, tests/ returns zero hits (verified 2026-08-26)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
