---
name: project-manager-identity-tracking
description: David wants manager and team-name changes tracked and reconciled over time — raw history IS already captured and backed up, only the reconciliation is missing
metadata:
  type: project
---

**David, 2026-08-22:** *"Managers can change in my league and it would be good to track that and
perhaps start reconciling. Also Team names can change."*

This is **Layer 4 (Context)** in his own six-layer doctrine — the layer he described as the
"special advantage ... we can see manager behavior and specific data trends of the 12 teams."

**Verified 2026-08-22 — the raw material is already safe, so deferring costs nothing:**
- `app/data/league_runtime/runs/<run>/snapshot.json` carries `users` (14, each with
  `display_name`, `user_id`, `metadata.team_name`) and `rosters` (12, with `owner_id`,
  `co_owners`). Captured daily by the 09:20 league-capture job.
- **37 consecutive daily snapshots, 2026-07-16 → 2026-08-21, ZERO gaps.** No pruning logic found.
- **Backed up**: `app/data/league_runtime/runs` is in `backup_manifest.json` → `required[30]`.
  (Contrast: `league_transactions.db` and `nflverse_usage.db` are in `exclusions` as rebuildable.)
- Measured across the full retained window: **display names and team names have NOT changed yet.**
- 14 users vs 12 rosters — two users hold no roster. 6 of 14 have `team_name = None` (never set
  a custom name; Sleeper falls back to a default).

**What is missing is ONLY the reconciliation** — nothing diffs the snapshots or records "manager X
renamed to Y on date Z". Because full state is stored daily, that change log is **fully
reconstructable retroactively** at any time. Nothing is being lost by waiting.

**Recommended sequencing:** build it after the 2026-09-04 freeze, alongside SR-18 League Activity
(already a committed week-1 deliverable, ≤2026-09-17) — same league snapshot data, same surface.

Related: [[project_season_readiness_2026]], [[david_rulings_dg3]]
