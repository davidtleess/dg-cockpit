# DG-029 — Establish whether feature season 2024 is absent by design or by gap

**Layer:** 2  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG029-20260825  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, adversarial review

**Problem:** The training table has no 2024 rows at all. One proposal assumes 2024 can be made
eligible for the one-year horizon; that is unsatisfiable against the current table. Separately, a
crew investigation established that 2024's absence from the *runtime output* is deliberate
(`apply_inference_partition`). **Nobody has established whether the training table's absence is the
same mechanism or a different hole**, and one wrong guess about this already cost most of an evening.

**How we know:**
```
$ feature_season value counts in app/data/training/engine_b_features_v2.csv
{2018:354, 2019:378, 2020:380, 2021:380, 2022:372, 2023:372, 2025:505}
2024 rows: 0
```

**Done looks like:** one sentence, evidenced — either "2024 is dropped by
`apply_inference_partition` and this is correct," or "2024 is missing for a different reason, here it
is." Whichever it is gets written down where the next person looks.

**Depends on:** nothing.

---

**Notes**
Do NOT open a feature-store rebuild off this ticket. The question is what is true, not what to build.

---

**CLOSED 2026-08-25, lane ClaudeFable5-DG029-20260825.**

**The sentence: 2024 is dropped BY DESIGN by `apply_inference_partition` — the same mechanism that
withholds it from the runtime output, not a second hole.** With the production window 2018..2025,
`training_eligible = feature_season < (inference_season - 1)` (`feature_assembly.py:89`, applied at
`:325`) makes 2024 the in-between season: no complete 2-year outcome window (2024+2 = 2026 > 2025)
and not the inference season, so it is the one bucket the partition drops. 2024's features exist
upstream; making it eligible is an **outcome-horizon (model-definition) decision under David's
word**, not a backfill — nothing needs ingesting.

**Re-measured at close (2026-08-25, worktree on merged `main`):**
```
$ .venv/bin/python3.14 - <<'PY'   # groupby feature_season on engine_b_features_v2.csv
2018..2023: rows==outcomes==eligible (354/378/380/380/372/372)
2024: 0 rows                      <- the in-between season, dropped
2025: 505 rows, 0 outcomes, 0 eligible   <- kept for inference only
PY
$ .venv/bin/python3.14 -m pytest tests/contract/test_inference_partition_seasons.py -q
8 passed
```
The 2025 signature is the proof a gap cannot fake: a data gap does not produce a season that is
*present* with every outcome null and every row ineligible; a partition does.

**A contradiction in the 2026-08-19 trunk ledger is hereby resolved.** The Consultant lane's DG-014
entry claims "2024 … is a gap, not a design choice" because 2024 exists in every `nflverse_usage.db`
table. Upstream presence is *consistent with* design — the partition drops it downstream by rule —
so that entry's conclusion is wrong; the Judge-implementer lane's mechanism analysis (same ledger,
earlier section) is correct and is what this close re-verified. The two 115s lesson survives:
evidence that data exists is not evidence its absence elsewhere is accidental.

**What landed:** `tests/contract/test_inference_partition_seasons.py` (8 tests, pins the RULE with
exact surviving sets so the drop moves itself when 2026 data lands), cherry-picked from
`origin/ticket/DG-029@123ec29b` onto `main` — the branch's worktree-local 2026-08-19 ledger copy was
deliberately NOT re-planted (the trunk ledger already carries the canonical entry; duplicating it is
the DG-032 disease). Landed through `dg-land.sh DG-029` on base `main` per David's 2026-08-25 ruling.
