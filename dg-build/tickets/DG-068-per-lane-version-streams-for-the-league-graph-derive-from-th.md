# DG-068 — Per-lane version streams for the league graph (derive from the archived snapshots)

**Layer:** 4  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** foundation  ·  **Size:** 1d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §9 requires the graph's lanes to be independently versioned; what exists is one daily snapshot blob with per-source hashes in lineage. For the 2027 rebuild you want to replay 'when did the rules lane change vs the rosters lane' without diffing whole blobs. Mitigating fact that sets the priority: the per-source hashes (league_hash, rosters_hash, traded_picks_hash, users_hash) are already captured daily, so lane version streams are derivable post-hoc from the archive — nothing is being lost by deferring this, which is why it sequences last. Deliverable: a lane-version record per source hash change, emitted going forward and backfilled from archived runs.

**How we know:** src/dynasty_genius/league_capture.py:21-31 (ARTIFACTS + ready-marker contract, single daily snapshot); today's snapshot.json lineage carries league_hash/rosters_hash/traded_picks_hash/users_hash (L4 audit, run league-20260826T132000Z); master-proposal-3 §9 ('independently versioned by lane')

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
