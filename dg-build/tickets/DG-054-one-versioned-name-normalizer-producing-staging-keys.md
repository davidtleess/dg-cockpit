# DG-054 — One versioned name normalizer producing staging keys

**Layer:** 2  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Proposal §7.1 (line 329) requires exactly one versioned name normalizer; today name normalization is scattered per-source — playerprofiler's suffix-insensitive logic, footballguys intake, the cfbd adapter, the prospect resolvers, and the QB eval lane each carry their own normalize-name code with no version stamp. The same raw name can therefore resolve differently per stream, and no identity outcome can cite which normalizer produced its staging key, which blocks any future identity assertion from being evidence-grade. Deliverable: a single normalizer module emitting a normalizer_version, per-source callers migrated behind it, and the version recorded in ingest identity outcomes. Small, independently landable, and a stated precondition of the owned-identity migration.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:329; src/dynasty_genius/playerprofiler.py:160-186 (suffix handling local to one source); parallel normalize-name logic in src/dynasty_genius/sources/footballguys_intake.py, adapters/cfbd_receiving_adapter.py, identity/college_prospect_identity.py, eval/qb_validation/identity.py (grep verified 2026-08-26)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
