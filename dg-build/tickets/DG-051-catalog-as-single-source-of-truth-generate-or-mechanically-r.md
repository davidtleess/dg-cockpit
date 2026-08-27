# DG-051 — Catalog as single source of truth: generate or mechanically reconcile scheduler, freshness, and backup config from the source registry

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** foundation  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 6.1's defining requirement (proposal line 270): scheduler configuration, freshness checks, backup inventories, and Daily Control must be generated from or mechanically reconciled against one catalog. Today four hand-maintained representations coexist — source_registry.py (466 lines, test-gated), the launchd plists (13 today; one chain plist plus edited stragglers after SR-09), app/config/capture_cadence.json, and app/config/backup_manifest.json — with zero generation or reconciliation among them; a source added or retimed in one place drifts silently in the others. Same ticket adds the declared catalog fields the registry lacks: schema/parser version, dormancy windows, terminal success states, backup class, downstream consumer disposition (proposal lines 263-267). Deliberately sequenced after SR-09 lands and soaks: the chain rewrites the scheduler representation this work must reconcile against, so doing it earlier reconciles against a layout about to be deleted.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:263-270; src/dynasty_genius/sources/source_registry.py (466 lines); tests/test_source_registry.py — grep shows zero references to plists, capture_cadence.json, or backup_manifest.json; ops/launchd/ (13 plists); app/config/capture_cadence.json; app/config/backup_manifest.json

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
