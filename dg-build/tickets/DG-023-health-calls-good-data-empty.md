# DG-023 — The health gate labels good participation data "empty"

**Layer:** 1  ·  **State:** done  ·  **Lane:** Parallel-DG023-20260825  ·  **DG 3.0**
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

---

**CLOSED 2026-08-25, merge `b4662707` on `main`, lane Parallel-DG023-20260825 (ClaudeOpus5).**

**The finding that mattered: the producer half already on the branch (`f2e09ab`) was inert.** It made
`_load_stream_isolated` report `status: "loaded"` for participation — but the READER buckets a stream
as empty on `status != "loaded"` **OR `effective_season is None`**, and participation's frame has no
`season` column, so it landed in `EMPTY:` regardless. Run `summarize_input_provenance` over the
shipped block before and after that commit and the output is byte-identical. The entire user-visible
defect lived in `app/api/routes/system_health_models.py`.

```
BEFORE  EMPTY: participation (ValueError) | CACHED: pbp on 2025 cache (ValueError),
        player_stats on 2025 cache (ConnectionError), snap_counts on 2025 cache
        (ValueError) | LIVE: rosters 2026

AFTER   EARLIER SEASON: participation (45,184 rows; season not reported by source;
        ValueError), pbp 2025 (ValueError), player_stats 2025 (ConnectionError),
        snap_counts 2025 (ValueError) | LIVE: rosters 2026
```

Both falsehoods were re-measured here rather than inherited from this ticket:
```
$ .venv/bin/python3.14 -c "import nflreadpy as n; f=n.load_participation(seasons=[2025]).to_pandas(); print(len(f), 'season' in f.columns)"
45184 False                                  # 26 columns, none of them `season`
$ .venv/bin/python3.14 -c "from nflreadpy.config import get_config; print(get_config().cache_mode)"
CacheMode.MEMORY                             # per-process: a scheduled run starts COLD
$ .venv/bin/python3.14 -c "import nflreadpy as n; n.load_participation(seasons=[2026])"
ValueError: Season must be between 2016 and 2025
```
So `fallback_used` (`attempts_made > 1`) records a REFUSED SEASON, never a cache read — and it could
not record one even in principle, because nothing is ever served from cache in a scheduled run.

**Gate preserved, per this ticket's own instruction ("fix the words, keep the gate"):** empty,
unavailable and season-step-back all still degrade. A null season is never rendered as `None`, and a
row count appears only when the producer recorded one, so an artifact written before `f2e09ab`
says nothing rather than claiming zero.

**Also corrected, because the codebase repeated the same two falsehoods to itself:** three comment
blocks in `system_health_models.py`, the module docstring of `test_health_input_provenance.py`, and a
test *named* `test_a_stream_served_from_cache_is_not_fresh` (now
`test_a_stream_that_stepped_back_a_season_is_not_fresh`).

**Gate:** 18 new contract rows, 6 RED for the right reason before the fix. Mutation-tested five ways —
restore the `or season is None` clause → 5 fail; re-label a step-back "cache" → 3 fail; drop the row
count → 1 fail; drop the season disclosure → 1 fail; stop degrading on a step-back → 5 fail. Full
suite **6067 passed / 0 failed / zero collection errors**; ruff 0.15.12 clean. Frontend untouched and
unaffected — it renders `basis` verbatim (`GradedBar.tsx`) and no test pins this format.

**Filed, not fixed: DG-041.** Participation's upstream ceiling is `current_season - 1` by
construction, so it steps back on EVERY run forever and holds this gate degraded permanently — even
after Week 1, when the other four go live. A gate that is always red is the same defect wearing the
other colour. That needs a per-stream ceiling in the producer window, which moves `source_hash`;
David ruled it out of this ticket's words-only scope on 2026-08-25.

**Coordination note.** Landed while a second session was live (PID 58730, deploy/verify lane). Checked
before pushing: no `dg-land.lockdir`, no ticket in `doing`, zero overlap between this ticket's four
files and the trunk's 25 dirty paths, and — the one that actually mattered — **`pvo_refresh` does not
declare `input_provenance_field`** (only `feature_refresh` does, of eight artifacts), so this change
cannot alter the 11:30 pvo run that session was waiting to verify. DG-023 was itself the ticket that
session nominated as non-disrupting when David asked on 2026-08-25.
