# DG-016 — TE's "validation report" doesn't say what it validated against

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane forensics, 2026-08-18; verified independently by Tower same night

**Problem:** A file named `validation_report_te.json` reports RMSE and R² with no held-out row count
and nothing stating which set the metrics came from. Whether or not the numbers are in-sample, the
file cannot be used to tell.

**How we know:** `app/data/models/engine_b/runs/20260626T165649Z/validation_report_te.json` carries
`train_rows: 492` and **no `test_rows` field at all**. It is also the only validation report in that
run — QB, RB and WR have none.

**Done looks like:** any report claiming validation states its held-out row count and its split, and
computes whether metrics are held-out rather than leaving it to the reader.

**Depends on:** nothing.
