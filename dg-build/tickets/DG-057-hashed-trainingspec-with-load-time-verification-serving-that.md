# DG-057 — Hashed TrainingSpec with load-time verification — serving that can refuse the wrong artifact

**Layer:** 3  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-22759  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §8.2 requires one hashed TrainingSpec (feature set/version, target, cohort filter, preprocessing, estimator, tuning policy, time-split, baselines, calibration) consumed by training, evaluation, refit, and serving — and no such object exists: grep for TrainingSpec across src/, app/, scripts/, tests/ returns zero hits. Serving loads pickles by pointer with no verification of any kind: engine_a.py reads latest.json and pickle.load()s each artifact, never checking the sha256s that model_registry.json records (those are read only by the provenance API surface). Until the spec hash is embedded in every artifact and verified with the content hash at load, serving structurally cannot refuse an incompatible artifact — the exact blindness that let DG-017's validated-scaled/deployed-unscaled split go unnoticed, and the reason the audit says 'serving cannot even detect it is running the wrong artifact.' Build this BEFORE the 2027 retrain program produces its first candidate, so every 2027 artifact is spec-hashed from birth instead of retrofitted.

**How we know:** src/dynasty_genius/scoring/engine_a.py:80-89 (pointer + bare pickle.load, no hash/spec check); app/config/model_registry.json (per-artifact sha256 present, unread at load; read only by app/api/routes/system_model_provenance.py); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:385-399; grep 'TrainingSpec' src/ app/ scripts/ tests/ = 0 hits (run 2026-08-26)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.

---

## Build record — 2026-08-28, lane Davids-MacBook-Pro-22759

**Branch:** `ticket/DG-057` · **Commit:** `8a6ebf95` · pushed to origin. NOT landed — coordinator reviews and lands.

**What was built (TDD, every test watched RED before green):**
- `src/dynasty_genius/models/training_spec.py` — frozen `TrainingSpec` dataclass with the nine §8.2 clauses (feature set/version, target + label horizon, cohort filter, preprocessing/missing-data, estimator family, tuning policy, time-split/grouping, evaluation baselines, calibration method) plus engine/model_id identity and `spec_schema_version`. `spec_hash()` = sha256 hex of canonical JSON (sorted keys, compact separators, ASCII, NaN forbidden) — deterministic across dict insertion order; `from_dict` refuses missing AND unknown fields so a spec never rehashes quietly to something else.
- `src/dynasty_genius/models/artifact_verification.py` — `write_spec_sidecar(artifact, spec)` stamps `<artifact>.spec.json` (content sha256 + spec_hash + full spec) at training time; `verify_artifact(path, expected_spec_hash=…, grandfathered_sha256s=…)` returns exactly `verified` or `pre_spec_artifact`, else raises `ArtifactSpecRefusal` with machine-readable reason: `spec_hash_mismatch` / `content_hash_mismatch` / `sidecar_invalid` / `unverifiable_artifact`. Rules: a pinned pointer is NEVER satisfied by grandfathering; a present-but-failing sidecar always refuses (grandfathering never rescues a failing explicit claim).
- `src/dynasty_genius/scoring/engine_a.py` — `EngineAScorer._load()` (the ticket's evidence lines) now verifies every artifact BEFORE `pickle.load`, honors an optional `training_spec_hash` pin in `latest.json` (absent today; the DG-058 promotion chain stamps it), logs each verdict, and discloses per-position state via new `spec_verification_state()`.
- `app/config/pre_spec_grandfather.json` — the FROZEN explicit allowlist: all 9 `model_registry.json` sha256s, each verified byte-for-byte against the deployed files on 2026-08-28 (all MATCH), plus `engine_b:v1_fallback` (`5c52f811…`, measured from `app/data/models/engine_b/runs/20260512T032635Z/engine_b_v1.pkl` — that pickle is served by the v1 fallback path yet UNREGISTERED in model_registry.json; custodial gap worth its own note). Config carries schema version, frozen_date, ticket, and a no-additions rule in prose; a test gates config↔registry consistency so the allowlist cannot drift from deployment.

**Both required directions, at the real loader** (`tests/test_engine_a_spec_verification.py`):
- Grandfathered pass-through: the deployed artifacts load and score EXACTLY as before, state disclosed as `pre_spec_artifact` — not a refusal; serving output asserted unchanged.
- Wrong-hash refusal: pinned pointer + differently-stamped artifacts → `spec_hash_mismatch`; unknown sidecar-less pickle → `unverifiable_artifact`; plus tamper/hand-edit/malformed-sidecar refusals in `tests/test_artifact_spec_verification.py`.

**Test evidence (commands run in the worktree):**
- `.venv/bin/python3.14 -m pytest tests/test_training_spec.py tests/test_artifact_spec_verification.py tests/test_engine_a_spec_verification.py -q` → 35 passed (each file first watched RED: 18F / 12F / 5F).
- Regression, every test file touching engine_a/PVO path: `pytest tests/test_engine_a_scorer.py tests/test_engine_a_v3.py tests/test_engine_a_v2_feature_contract.py tests/test_engine_a_backtest.py …` → 83 passed 14 skipped, plus the 17-file PVO/adapter set → 209 passed 9 skipped (skips pre-existing data-absence skips).
- `uvx --python <worktree>/.venv/bin/python3.14 ruff@0.15.12 check <changed files>` → All checks passed. (Machine note: bare `uvx ruff` fails — migrated Intel uv-managed Python, "Bad CPU type"; pass an arm64 `--python` explicitly.)

**Deliberately NOT in scope (for the coordinator's eye):**
- `EngineAV3Scorer` (same file), `engine_b_service.py`, and `app/services/rookie_evaluator.py` still `pickle.load` unverified. Left untouched because their lenient/manifest loaders are exercised by existing tests with synthetic un-sidecared pkls (e.g. `tests/test_engine_a_v3.py`), and wiring them refusal-strict would change today's serving/test behavior — the ticket forbids that. They should adopt `verify_artifact()` when DG-058's promotion chain stamps their artifacts.
- `latest.json` was NOT modified (it is shared trunk data); the `training_spec_hash` pin is read if present, written by nothing yet — DG-058 stamps it at promotion.
- No producer run, no shared data written; all test artifacts in pytest tmp dirs.
