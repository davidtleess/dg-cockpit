# DG-050 — Replay-reproducibility harness: prove snapshot + parser version reproduces normalized content

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 6.2's guarantee — replaying a raw snapshot with the same parser version must reproduce normalized content — has no harness anywhere in the repo. The content-addressed snapshots exist per producer (nflverse snapshot_id+content_sha256, fc raw sidecar, league snapshot.json with per-source hashes), but reproducibility is assumed, never proven. This season's point-in-time archive is the 2027 rebuild's training fuel; until replay is proven, every captured week adds data whose usability as vintage-true training input is unverified, and any parser nondeterminism discovered at rebuild time may be retroactively unfixable. Scope: a harness that replays a sampled snapshot per stream through the pinned parser version and byte-compares normalized output, run periodically with dated proof artifacts, plus fixes for whatever nondeterminism the first run exposes.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:274; src/dynasty_genius/nflverse_usage.py:36,425-426; src/dynasty_genius/capture/fc_forward_capture_store.py:10,24; src/dynasty_genius/league_capture.py:21-31; grep for replay across src/ and scripts/ finds only launchd-slot docstrings and fixture builders — no snapshot-to-normalized replay code

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
