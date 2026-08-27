# DG-033 — A producer can abort and still be graded fresh

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeOpus5-DG033-20260824  ·  **DG 3.0**
**Source:** Codex Consultant read-only sweep, 2026-08-19; independently re-derived at source by the
crew Claude lane the same afternoon

**Problem:** `pvo_refresh` and `feature_refresh` both write a terminal `status` into their reports,
and neither declares `status_field` in `app/config/report_freshness.json`. That field is **opt-in**
by design (`app/api/routes/system_health_models.py:78-97`), so with it absent the health gate grades
on **mtime alone** and never reads the status the producer already wrote. A wholly aborted run
reports `fresh`. `pvo_refresh` is `tier: core_substrate` — the artifact the entire valuation runtime
is built from.

**How we know:**
```
$ grep -n '"status": "aborted"' scripts/run_pvo_refresh.py
345, 388, 429, 492, 558        # five distinct abort sites, each writing a terminal status

$ grep -n status_field app/config/report_freshness.json
131, 148, 172                  # three artifacts declare it; pvo_refresh and feature_refresh do not
```
Both live reports currently read `status: ok`, so the gate is not lying today — it is structurally
unable to notice when it should.

**Done looks like:** an aborted `run_pvo_refresh.py` makes `/api/health` say so. The two entries
declare `status_field` and the `success_status` its validator requires, and a test writes a report
with `status: aborted` and asserts the gate degrades.

**Depends on:** nothing.

---

**STATUS 2026-08-24 — DONE.** Merge `30a91c33` on `origin/feature/outcome-loop-week1`
(pushed `de551d22..30a91c33`). Landed by hand in a detached worktree; `dg-land.sh` still cannot
merge into a checked-out base (DG-038). Trunk needs `git pull --ff-only`.

**The ticket had the two artifacts backwards.**

`pvo_refresh` — correct as filed. All five abort sites reach a `_persist()` that rewrites the report,
so a failed run leaves a FRESH mtime. With no `status_field`, `read_report_artifact_facts` never even
OPENED the file (`system_health_models.py:694-700`). Now declares `status`/`ok`/`aborted_reason`.
**But it has never fired:** `grep -c '"status": "aborted"' app/data/logs/pvo_refresh.out.log` → 0
against 126 `ok`, and `pvo_refresh.err.log` is 0 bytes since June. Insurance, not an outage.

`feature_refresh` — the one that HAS failed (2 "refusing to publish" in 57 runs), and the ticket's fix
would not have seen it. Two changes:
- **the clock**: registered `weekly` while its plist carries no `Weekday` key and runs DAILY at 09:15.
  `weekly` buys a six-day window (`_freshness_window_start:456-457`). Verified with plistlib across
  all three weekly-registered artifacts — `roster_capacity` and `league_opportunity` carry `Weekday 2`
  and are correctly weekly; this was the only mismatch. A new test pins the whole class.
- **the status**: an adversarial review refuted the premise that this producer never writes on
  failure. A validation-failed publish writes `blocked` into the very file the gate reads
  (`feature_publish.py:130`, `:162` → `_REPORT_NAME` at `:28`) and the runner stamps a fresh
  `generated_at` over it (`:168`). Declared as `["ok","noop"]`. **This half bites TODAY** — the status
  gate runs BEFORE the substance gate (`:517` then `:526`), and live provenance is degraded, so
  evaluation short-circuits at `inputs_degraded` and never reaches the freshness window until the
  streams go live in September.

`noop` is only safe to enumerate because the noop branch now **stamps** that word into the report it
skips (it previously returned without writing at all, so a healthy unchanged upstream and a producer
that never ran were byte-identical). The stamp MERGES — preserving `stream_provenance` and
`source_hash` — and swallows `OSError`: bookkeeping never cancels a run, and losing the stamp is
self-punishing because the report then goes stale, which is the true signal.

**Two defects found by the review and fixed here:**
- a `producer_failed` row took `observed_at` only from an embedded timestamp and never fell back to
  mtime. `pvo_refresh` is the first artifact to declare `status_field` with no `timestamp_field`, so
  every failure row would have read *"no observable timestamp"* — a run that died 20 minutes ago and
  one that died 20 days ago, identical.
- `SystemHealthCard` hardcoded *"Daily divergence sync failed. Showing margins from the last
  successful sync."* for EVERY artifact. `pvo_refresh` renders one span away as "Model valuations".

**`roster_capacity` was investigated on David's instruction and deliberately NOT changed — see DG-039.**
A config-only declaration there would be dead config: `run_roster_capacity_audit.py:101` guards the
only write, so the artifact can only ever contain `status: "ok"`.

**How we know:**
```
.venv/bin/python3.14 -m pytest tests -q   -> 6318 passed, 40 skipped (6301 on base)
cd frontend && npx vitest run             -> 294 passed, 72 files
ruff 0.15.12 check                        -> All checks passed
dg-land.sh --dry-run                      -> "rebase clean, tests pass. Nothing merged."
11/11 deliberate mutations caught (both declarations, cadence, stamp, merge,
      OSError guard, mtime fallback, both frontend strings)
live grading before vs after, real config against real reports -> IDENTICAL
```

---

**Notes**
Same class as DG-021 and DG-023: a status computed from a proxy rather than from evidence the
producer already emits. The evidence field exists in every case; it just is not read.
