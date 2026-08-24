---
name: project-architecture-review-2026-08-19
description: "The 2026-08-19 nine-agent architecture review and three-way merge — where the master proposal lives, and the booby trap inside one of the three source docs."
metadata: 
  node_type: memory
  type: project
  originSessionId: 492e0bb4-27c4-485b-bc63-b81adecabcee
  modified: 2026-08-20T03:24:42.483Z
---

Three parallel sessions each produced an architecture + build plan for Dynasty Genius on
2026-08-19; this session ran a 9-agent read-only review (7 layers + 2 forward design) and then
merged all three.

**Deliverables (Desktop, outside the product repo — deliberately, to avoid dirtying a tree that
already has a false-dirt problem):**
- `~/Desktop/master-proposal-2-dynasty-genius-2026-08-19.md` — the three-way merge, 421 lines
- `~/Desktop/dynasty-genius-architecture-2026-08-19.md` — this session's own layer synthesis

**⚠️ HAZARD — source A contains a step that reverses David's same-day ruling.**
`~/.gemini/antigravity-cli/brain/9a996d45-.../DYNASTY_GENIUS_NORTH_STAR_ARCHITECTURE_AND_BUILD_PLAN.md`
Milestone Step 2.2 directs: *"Enforce strict `game_type == "REG"` filtering in `nflverse_usage.py`
and retrain Engine B Ridge models on regular-season usage only."* David ruled **"all games"** at
06:32 that morning — postseason counts, the missing `season_type` filter is correct **by decision**,
and **no rerun** of Engine B, P90, replacement, xVAR or calibration. Executing A 2.2 would reverse
the ruling *and* trigger the forbidden cascade. The merge struck it, including its supporting prose
("REG-Only Discipline") so it cannot be re-derived. See [[david-rulings-dg3]].
**If anyone works from source A directly, this step must be struck first.**

**Also carried forward:** the PPG definition lives in **three** sites, not two —
`fetch_and_agg_stats`, the Engine B feature contract, and the QB-1 label predicate at
`qb_ppg_labels.py:817-822` (`attempts >= 1 OR sacks_suffered >= 1 OR carries >= 1`). That third
predicate is *orthogonal* to the ruling (it gates on whether a QB played at all, treating regular
and postseason identically) — not a violation, but DG-024 as written covers only two sites and
should be widened before it closes.

**Nothing was executed or changed.** No product file, model, producer or datum was modified; the
test suite was never run. All findings are from reading plus read-only queries.
