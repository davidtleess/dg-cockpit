# DG-050 — Replay-reproducibility harness: prove snapshot + parser version reproduces normalized content

**Layer:** 1  ·  **State:** done  ·  **Lane:** lane-dg050-replay  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 6.2's guarantee — replaying a raw snapshot with the same parser version must reproduce normalized content — has no harness anywhere in the repo. The content-addressed snapshots exist per producer (nflverse snapshot_id+content_sha256, fc raw sidecar, league snapshot.json with per-source hashes), but reproducibility is assumed, never proven. This season's point-in-time archive is the 2027 rebuild's training fuel; until replay is proven, every captured week adds data whose usability as vintage-true training input is unverified, and any parser nondeterminism discovered at rebuild time may be retroactively unfixable. Scope: a harness that replays a sampled snapshot per stream through the pinned parser version and byte-compares normalized output, run periodically with dated proof artifacts, plus fixes for whatever nondeterminism the first run exposes.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:274; src/dynasty_genius/nflverse_usage.py:36,425-426; src/dynasty_genius/capture/fc_forward_capture_store.py:10,24; src/dynasty_genius/league_capture.py:21-31; grep for replay across src/ and scripts/ finds only launchd-slot docstrings and fixture builders — no snapshot-to-normalized replay code

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.

---

**Build record (2026-08-28 evening, lane-dg050-replay) — BUILT, awaiting land.**
Branch `ticket/DG-050`, commit `4c614be7`, pushed to origin. Worktree `~/dg-wt/DG-050`.

- `src/dynasty_genius/replay/replay_harness.py` — replays one sampled snapshot per stream
  through the PINNED parser code itself (imported, never copied) and byte-compares against
  the stores; every SQLite open is `mode=ro`, a missing store is reported, never created.
  Streams: 12 nflverse seasonal (raw envelope → normalize_rows → the exact apply_season
  digest vs the ledger), contracts snapshot-axis (raw sha256 + snapshot_idempotence_digest),
  fc forward capture (per-row payload_hash re-derived from the raw sidecar + raw→joinable
  projection re-derived), league snapshot (marker digests, rosters/users lineage hashes,
  coverage + posture re-derived and byte-compared). Different parser version = named
  `parser_version_mismatch`, never a byte-compare across versions.
- `scripts/run_replay_reproducibility.py` — runnable, launchd-shaped (named exit codes
  0/1/2, no env assumptions), NOT scheduled (per ticket instruction: nothing bootstrapped
  tonight). Writes the dated receipt (embedded UTC timestamp) to
  `app/data/ops/replay_reproducibility_latest.json` + immutable run-scoped copy under
  `app/data/ops/replay_reproducibility/runs/` (refuses overwrite).
- **First live run exposed a real §6.2 violation, fixed in-scope:** FantasyCalc sends
  integral volatilities as ints; capture hashed `2`, the REAL column returns `2.0`, so
  payload_hash failed replay on 172/474 rows of 2026-08-28 (diagnosed to 0 unexplained —
  command: recompute `_content_hash` per row vs stored, probe int-projection).
  `fc_forward_capture_driver.map_fantasycalc_payload_to_entries` now normalizes every
  hashed value to the exact shape SQLite returns (float volatility, storage-faithful
  ints); immutable pre-fix rows are classified `legacy_content_shape` — counted, never a
  silent pass, never a false alarm.
- **Live proof** (`.venv/bin/python scripts/run_replay_reproducibility.py --league-root
  ~/dynasty-genius-product/app/data/league_runtime`, run `replay-20260829T002042Z`):
  19 reproduced, 1 legacy_content_shape, 0 mismatch — all 16 streams incl. the 1.6 GB
  contracts raw (`nflverse-usage-20260828T1015008546550000:contracts`) and trunk league
  run `league-20260828T130040Z`. Receipt in the worktree's `app/data/ops/`.
- Tests: `tests/contract/test_dg050_replay_reproducibility_red.py` — 16 tests, watched
  RED first (ModuleNotFoundError, then the two fc-fix tests red against the old driver);
  `python -m pytest tests/contract/test_dg050_replay_reproducibility_red.py
  tests/contract/test_fc_forward_capture*.py tests/contract/test_layer1_daily_control_red.py
  tests/contract/test_market_divergence_ops_scheduler.py` → 150 passed. ruff via
  pre-commit: Passed.
- NOT done here (deliberate): no launchd plist, no scheduling — the script is
  launchd-shaped for a later ops decision. dg-land not run (coordinator lands).

---
**SCHEDULING DECIDED 2026-08-29 (David's panel selection: "Weekly scheduled run"):** the harness
joins launchd at WEEKLY cadence. Plist `com.davidleess.dynasty-replay-verify.plist` rides the
DG-087 lane (same-day sitting); proposed slot Monday 12:00 — clear of the 06:15–10:30 capture
cluster and 15+ min past the 11:30 retry slot; the harness only reads live stores and writes its
own report. Slot choice open to the pre-land review panel's attack.
