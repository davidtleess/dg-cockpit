# DG-004 — A leakage FAILURE report is sitting in the repo root and nothing reads it

**Layer:** 3  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG004-20260825  ·  **DG 3.0**
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

---

**CLOSED 2026-08-25, lane ClaudeFable5-DG004-20260825. Verdict: stale one-off artifact — deleted.**

Three measurements, all run at close:
```
$ git ls-files --error-unmatch leakage_violation_report.json
error: pathspec ... did not match any file(s) known to git        # UNTRACKED — never committed

$ grep -rnE "find_leaking_columns|check_leakage" --include='*.py' --exclude-dir=.oa3 \
    src/ scripts/ app/ | grep -v models/leakage.py
(no matches outside tests)     # the writer (models/leakage.py:54) has ZERO production callers

$ head -1 app/data/training/engine_b_features_v2.csv | tr ',' '\n' | grep -i "adp\|sleeper"
(no matches)                   # adp_sleeper is not in the current training matrix
```
So the 2026-08-07 report was the output of a one-off probe whose caller no longer exists, flagging a
column the current matrix does not carry. The systemic guards that make it redundant are live: the
`training-csv-market-leakage` pre-commit hook (`.pre-commit-config.yaml:14`, runs
`scripts/validate_training_csv.py` on every training-CSV commit) and `validate_no_temporal_leakage`
in the feature gate. `check_leakage` itself writes a report only on detection and always raises —
a passing run writes nothing, so no fresh report can appear without a real finding behind it.

Deleted with `rm ~/dynasty-genius-product/leakage_violation_report.json` (untracked, so no commit
exists to carry the deletion; this note is the record). Nothing else in the trunk touched.
