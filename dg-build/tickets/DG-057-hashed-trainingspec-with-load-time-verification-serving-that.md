# DG-057 — Hashed TrainingSpec with load-time verification — serving that can refuse the wrong artifact

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §8.2 requires one hashed TrainingSpec (feature set/version, target, cohort filter, preprocessing, estimator, tuning policy, time-split, baselines, calibration) consumed by training, evaluation, refit, and serving — and no such object exists: grep for TrainingSpec across src/, app/, scripts/, tests/ returns zero hits. Serving loads pickles by pointer with no verification of any kind: engine_a.py reads latest.json and pickle.load()s each artifact, never checking the sha256s that model_registry.json records (those are read only by the provenance API surface). Until the spec hash is embedded in every artifact and verified with the content hash at load, serving structurally cannot refuse an incompatible artifact — the exact blindness that let DG-017's validated-scaled/deployed-unscaled split go unnoticed, and the reason the audit says 'serving cannot even detect it is running the wrong artifact.' Build this BEFORE the 2027 retrain program produces its first candidate, so every 2027 artifact is spec-hashed from birth instead of retrofitted.

**How we know:** src/dynasty_genius/scoring/engine_a.py:80-89 (pointer + bare pickle.load, no hash/spec check); app/config/model_registry.json (per-artifact sha256 present, unread at load; read only by app/api/routes/system_model_provenance.py); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:385-399; grep 'TrainingSpec' src/ app/ scripts/ tests/ = 0 hits (run 2026-08-26)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
