# Tuesday-1 pre-change baseline — the three weekly jobs (captured 2026-08-26 12:42)

**Why this exists.** SR-09 rewires the morning chain by Fri 08-28. The three Tuesday-only jobs
(`league-opportunity-map` 09:35 · `roster-capacity-audit` 10:00 · `realized-outcome-scoring`
10:00) get exactly two post-change exercises (Tue 09-01 fixable, Tue 09-08 confirmation). This
directory is the LAST pre-change picture: their Tue 08-25 run output plus today's launchd state.
After Friday it cannot be recaptured. Panel-added item, David's go 2026-08-26 ~12:40.

**Contents.** `<job>.out.log` / `<job>.err.log` — full logs copied from
`app/data/logs/` (mtimes Aug 25 10:00 = the Tuesday-1 runs are the last entries);
`launchctl-<label>.txt` — `launchctl print gui/501/<label>` as of today 12:42.

**Reading 1 — launchd counters.** All three read `runs = 0 / last exit code = (never exited)`
TODAY despite provably running Tuesday (log mtimes). This is the per-bootstrap counter
semantics DG-044 documented: counters reset at login, so a Wednesday read cannot see a Tuesday
run. The baseline's evidentiary value is the LOGS; the launchctl snapshots preserve schedule +
program state, not run history.

**Reading 2 — realized-outcome-scoring.** Its log is append-only JSON lines WITHOUT timestamps
(the same defect SR-09 step 5 fixes chain-wide), so line→date attribution is inference: the
final line — `noop / week_not_finalized` — is Tuesday 08-25's run (healthy preseason noop).
The `failed / predictions_load_failed:FrozenPredictionSetUndeclared` line immediately before it
is a PRIOR week's run. That failure is DG-022 territory and DG-022 landed `20807368` the
evening of 08-25, AFTER Tuesday's run — so Tue 09-01 is the first Tuesday exercising the fix
and should NOT repeat it. If 09-01 shows `FrozenPredictionSetUndeclared` again, that is a
DG-022 regression finding, not a known-failure repeat.
