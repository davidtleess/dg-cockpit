# DG-023 — The health gate labels good participation data "empty"

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane flagged it; Tower and the judge seat each confirmed it independently, 2026-08-18

**Problem:** `/api/health` reports `feature_refresh` as `inputs_degraded` with basis
**"EMPTY: participation"**. The participation data is not empty. A health signal that cries wolf on
good data is worse than no signal, because a real failure will look identical.

**How we know, from two directions:**
```
# upstream — the frame itself
$ nflreadpy.load_participation(seasons=[2025])  →  45,184 rows   (2024: 45,919)
   ...and the frame has NO `season` column, which is the whole cause:
   run_feature_refresh.py:112 → status = "loaded" only if a season value is found, else "loaded_empty"

# downstream — the features participation feeds, this run's inference season
   WR tprr/yprr/route_participation  205/207 populated
   TE                                108/109
   RB                                123/127
   QB                                 62/62
```
The data loaded and reached the feature build. The label is false.

**Also false in the same basis string:** *"pbp / player_stats / snap_counts on 2025 cache."* Those are
live 2025 loads after a 2026 attempt failed. `fallback_used` records a retry, not a cache read.

**Done looks like:** the provenance reports what actually happened — rows loaded and the season
observed — rather than inferring emptiness from a missing column.

**Depends on:** nothing.

---

**Notes**
This shipped yesterday as a health *improvement*, and it is one in structure — grading substance
rather than file shape is right. It is currently wrong in two of its own words. Fix the words, keep
the gate.
