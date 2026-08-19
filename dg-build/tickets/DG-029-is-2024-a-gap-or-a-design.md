# DG-029 — Establish whether feature season 2024 is absent by design or by gap

**Layer:** 2  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
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
