# DG-062 — Manager identity reconciliation across the four-season transaction chain

**Layer:** 4  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 1.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** The transaction store resolves roster_id to a manager display name per season, but display names and team names change across seasons and nothing reconciles them into one stable manager identity — so no cross-season aggregation of any manager's behavior is possible. The raw history is fully captured (2023:243, 2024:323, 2025:299, 2026:75 transactions, current through 2026-08-24) and the owner has explicitly asked for manager/team-name change tracking; reconciliation is the only missing piece. This is the prerequisite for the §9.1 manager-behavior profiles: without it, per-manager counts silently fragment across renames. Deliverable: a reconciled manager identity table (stable manager_id, display-name history with effective seasons), applied read-side over the existing store — no capture change.

**How we know:** src/dynasty_genius/league_transactions.py:3-4 (module scope stops at capture: 'no analysis of manager behaviour'); league_transactions.py:316,395,473 (manager_display_name resolved per season only); SEASON-BUILD-SPEC.md:1470 (measured movement rows carry manager_display_name); L4 audit read-only DB query 2026-08-26 (season counts, chain via previous_league_id, league_transactions.py:17-29)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
