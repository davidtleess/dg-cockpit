# DG-039 — A blocked roster-capacity audit writes nothing, so last week's audit stands as current

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG039-20260826  ·  **DG 3.0**
**Source:** investigated 2026-08-24 on David's instruction ("do roster_capacity too") while landing
DG-033. The answer turned out to be that DG-033's fix does not apply here, and a different one does.

**Problem:** `roster_capacity` is the third artifact in `app/config/report_freshness.json` that
carries a top-level `status` the freshness gate never reads. But unlike `pvo_refresh`, declaring
`status_field` would be **dead config** — a gate that can never fire.

`scripts/run_roster_capacity_audit.py:101` guards the only write:

```python
    if result.status != "ok":
        return ProducerReport(producer_status="blocked", scorecard=result).model_dump()
    ...
    report_path.write_text(json.dumps(artifact, indent=2, sort_keys=True) + "\n")   # :117
```

So the artifact is written **only** when the status is already `ok`, and that key is a constant. The
malformed-input path at `:99` returns before the write too, and `--preflight` (`:143`) writes nothing.
Declaring `status_field: "status"` would assert on the health surface that this producer's failures
are legible when they are structurally invisible — exactly what the model docstring forbids
(`app/api/routes/system_health_models.py:78-83`: only a producer that writes a terminal status on
EVERY exit path may declare it).

The real gap is therefore the same class DG-033 fixed for `feature_refresh`'s clock, but it cannot be
fixed in config: **a blocked run leaves the previous week's audit standing with its old `created_at`,
and nothing anywhere records that today's run refused.** Its cadence is honest — `weekly` in config,
`Weekday 2` in `ops/launchd/com.davidleess.dynasty-roster-capacity-audit.plist`, verified with
plistlib — so the six-day window plus three hours' grace is the only thing that eventually notices.

**How we know:**
```
$ grep -n '"status"' scripts/run_roster_capacity_audit.py        # no top-level status written here
$ sed -n '99,119p' scripts/run_roster_capacity_audit.py          # :101 guards the only write (:117)
$ grep -oE '"producer_status": *"[a-z_]+"' app/data/logs/roster_capacity_audit.out.log | sort | uniq -c
   2 "producer_status": "ok"
$ ls -la app/data/logs/roster_capacity_audit.err.log
   0 bytes, Aug 17
```
Two recorded runs, both healthy. The producer's own docstring (`:10-12`) states the design plainly:
*"A blocked run writes no artifact."* That is deliberate — it preserves the last good audit rather
than overwriting it with a failure, which is the same instinct DG-036 followed for the backup marker.

**Done looks like:** a refused roster-capacity audit is visible without destroying the last good one.
The DG-036 shape fits: a small separate status marker the producer always writes, registered as its
own artifact, so `blocked` and `preflight_ready` become legible while
`roster_capacity_latest.json` keeps its no-overwrite guarantee. A test drives `run_roster_capacity_audit`
into both blocked branches and asserts the surface degrades while the prior artifact survives byte-identical.

**Not urgent, and that is a measurement, not a guess.** Two runs, zero failures, `daily_diagnostics`
tier, weekly cadence, and the ~6-day window does eventually catch it. This is producer work on a
low-frequency diagnostic eleven days before the 09-04 freeze.

**Depends on:** nothing. **Related:** DG-033 (which established that a config-only declaration is only
honest when the producer writes on every exit path), DG-036 (the write-a-marker-without-destroying-
the-last-good pattern), DG-034.

---

**Notes**
Two other artifacts were checked in the same pass and need nothing: `what_changed` and
`league_opportunity` write no top-level `status` at all, so their silence in the config is correct
rather than an oversight. `league_opportunity` and `roster_capacity` both carry `Weekday 2` in their
plists and are genuinely weekly — their 08-18 reports were current, not stale, when this was measured.

---

**✅ BUILT AND LANDED 2026-08-26 (David: "do DG-039"), on `main` via dg-land full gate.** Exactly
the ticket's DG-036 shape: `run_audit` writes an atomic status marker on EVERY exit path
(input-blocked, content-blocked, ok) at `app/data/ops/roster_capacity_audit_status_latest.json`;
the artifact keeps preserve-last-good (blocked runs verified byte-identical prior artifact);
registered in report_freshness as `roster_capacity_status` with `status_field: producer_status` /
`success_status: ok` — honest ONLY because the marker cannot miss an exit (DG-033's rule), while
the artifact itself deliberately keeps NO status_field. Preflight stays write-free (its printed
contract says "performs no load, score, or write" — the ticket's "preflight_ready legible" half
was NOT taken; deviation noted). 6 tests RED-first; two intentional pin amendments (artifact set
+ count). First real marker: next Tuesday 10:00 (09-01) — the first exercise the 09-01/09-08
Tuesday runs were bought for.
