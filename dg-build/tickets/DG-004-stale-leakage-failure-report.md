# DG-004 — A leakage FAILURE report is sitting in the repo root and nothing reads it

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** Tower, found while checking evidence for DG-002

**Problem:** `leakage_violation_report.json` sits at the repo root saying LEAKAGE DETECTED. Either
it is real and we have a leaking feature, or it is a stale artifact from a one-off run — and right
now nobody can tell which, which is the worst of the two states.

**How we know:**
```
$ cat leakage_violation_report.json
{"status":"FAILURE","reason":"LEAKAGE DETECTED","offending_columns":["adp_sleeper"],
 "timestamp":"2026-08-07T07:41:21.408813"}

$ grep -rn "adp_sleeper" --include=*.py src/dynasty_genius/models/
(no matches)                                                   # both run 2026-08-18
```

**Done looks like:** either the file is deleted with a one-line note saying it was a one-off probe,
or `adp_sleeper` is traced to whatever matrix it entered and removed. Whichever it is, a FAILURE
report at repo root that nothing consumes should not survive this ticket.

**Depends on:** nothing. Ten minutes of work.

---

**Notes**
`validate_no_temporal_leakage` lives at `src/dynasty_genius/models/engine_b_contract.py:277` and does
run in the feature gate. This report does not appear to be its output.
