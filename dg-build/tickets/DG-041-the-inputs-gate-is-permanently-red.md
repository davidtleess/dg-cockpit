# DG-041 — The inputs gate is permanently red, because participation can never serve the season it is asked for

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG041-20260825  ·  **DG 3.0**
**Source:** found 2026-08-25 while fixing DG-023's two false words. David ruled the words-only scope
and asked for the rest to be filed rather than folded in.

**Problem:** `feature_refresh` will report `inputs_degraded` on **every run, forever**, and after
DG-023 the reason is finally stated truthfully — which is what makes the permanence visible.

`_load_stream_isolated` (`scripts/run_feature_refresh.py:92`) tries the full season window, then the
window minus its last season. Participation's upstream ceiling is `get_current_season(roster=True) - 1`
— it is *by construction* one season behind — so the first attempt raises `ValueError` **always**, a
fallback is always recorded, and `summarize_input_provenance` always degrades the artifact.

Today four of five streams step back, which reads like an offseason condition that Week 1 will clear.
It will not. `pbp`, `player_stats` and `snap_counts` go live once 2026 parquet exists upstream;
participation never does. A gate that is always red carries exactly as much information as one that
is always green — the failure mode `test_healthy_inputs_still_grade_fresh` was written to forbid, and
the same cry-wolf disease DG-023 was opened to cure, one level up.

**How we know:**
```
$ .venv/bin/python3.14 -c "import nflreadpy; nflreadpy.load_participation(seasons=[2026])"
ValueError: Season must be between 2016 and 2025          # structural, not an outage

$ sed -n '92p' scripts/run_feature_refresh.py
    for window in (seasons, seasons[:-1]):                 # ceiling is never lowered per-stream

# the reader, with 2026 upstream data present and participation unchanged:
degraded=True
EARLIER SEASON: participation (45,184 rows; season not reported by source; ValueError)
  | LIVE: pbp 2026, player_stats 2026, rosters 2026, snap_counts 2026
```
That last line is the whole ticket: one stream, doing exactly what it always does, holding the gate.

**Done looks like:** a stream is not reported degraded for a limit it can never exceed. The cheapest
shape is a per-stream CEILING beside the existing floor in `_STREAM_LOADERS` (participation already
carries a floor of 2019), so the window never requests a season the source cannot serve — no refusal,
no fallback, no daily false alarm, and `fallback_used` goes back to meaning *something happened*.
A test drives a stream whose ceiling is below the window and asserts no fallback is recorded.

Whoever takes it must check the blast radius on `source_hash`: the window feeds `_source_provenance`
(`:277`), so narrowing it changes the hash and will make the next run look like a content change.
That is a real consequence, not a blocker — but it should be a decision, not a surprise.

**Not urgent, and that is a measurement.** Nothing is wrong with the DATA — participation loads
45,184 good rows and the features it feeds are populated 498/505. What is wrong is that the operator
is told "degraded" every morning until the word stops meaning anything, which is precisely the state
DG-023 found the gate in.

**Depends on:** nothing. **Related:** DG-023 (fixed the words on this same surface; this is the
sentence underneath them), DG-039 (also a producer fix that could not be made in config), DG-034/036.

---

**Notes**
Deliberately NOT bundled into DG-023. That ticket's own instruction is "fix the words, keep the gate",
and DG-023 shipped 10 days before the 09-04 freeze; this one touches the producer's season window and
the source hash, which is a different risk class and deserves its own decision.

---

**CLOSED (code) 2026-08-25, lane ClaudeFable5-DG041-20260825. Landed as merge `b797ee1f` on
`origin/main` through `dg-land.sh` unaided (gate: full suite 6,070 passed / 0 failed / zero
collection errors — 6,067 at DG-023's land + 3 new).**

**Fix — the ticket's own cheapest shape, taken exactly:** `_STREAM_LOADERS` entries gain a
source-CEILING callable beside the existing floor; `_load_source` filters each stream's window
through both. Participation's ceiling is the client's own formula —
`lambda nfl: nfl.get_current_season(roster=True) - 1` — verified against the installed
`load_participation`, whose first line is literally `max_season = get_current_season(roster=True)
- 1`. The mirror is exact, not a guess, and cannot rot as seasons roll (pinned by a 2031-geometry
test). The frames are byte-identical (the fallback already served the capped window); only the
provenance stops recording a refusal that never needed to happen.

**TDD, RED watched (3 failures, each for the expected reason):**
`tests/contract/test_dg041_stream_source_ceiling.py` pins (1) one capped request, uncapped
streams still get the full window; (2) `summarize_input_provenance` reads the result as
`inputs_live` — the whole ticket in one assertion; (3) the ceiling tracks the roster-year bound,
not a hardcoded 2025. DISCLOSED TEST CHANGE (DG-031 precedent) in
`test_feature_refresh_source_isolation_red.py`: the CH1 fixture gains `get_current_season`,
participation's expectations change from "refused then stepped back" to "capped up front".
No reader change: DG-023's gate grades on `status` + `fallback_used` alone, so honesty at the
producer turns it green through the existing path.

**Blast radius on `source_hash`, disclosed up front as the ticket demanded:**
`stream_provenance.participation` changes (`fallback_used true→false`, `error_type
"ValueError"→null`), so the FIRST run on this code moves the C4 hash and regenerates the
candidate once, then settles. Frames unchanged — the regen is a provenance echo, not a content
change.

**Deployment sequencing (deliberate, in force):** landed on `origin/main` 2026-08-25 ~17:10 EDT;
the trunk is intentionally NOT pulled — tomorrow ~09:00 is DG-023's first scheduled production
run and stays single-variable on `main@a61f0fbe`. Trunk pulls post-window 08-26; DG-041 live
from 08-27 with seven scheduled runs before the 09-04 freeze. **Production acceptance, still
open until then:** the 08-27 `feature_refresh_latest_report.json` shows participation
`fallback_used=false` / `error_type=null`, and `/api/health`'s inputs line reads `inputs_live`
on a healthy day.
