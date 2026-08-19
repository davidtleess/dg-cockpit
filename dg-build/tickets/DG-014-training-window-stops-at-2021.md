# DG-014 — The deployed models were fit on 2018–2021 only

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane forensics, 2026-08-18; verified independently by Tower same night

**Problem:** 2022 and 2023 are held out for evaluation and never folded back in for the final fit.
The models serving David in the 2026 season have never seen a training example after 2021.

**How we know:**
```
$ grep -n "HOLDOUT_SEASONS" scripts/train_engine_b.py
66:  HOLDOUT_SEASONS = [2022, 2023]
187: X_train_raw = train_df[~train_df["feature_season"].isin(HOLDOUT_SEASONS)][available_features]
264: X_train_raw = pos_df[~pos_df["feature_season"].isin(HOLDOUT_SEASONS)][available]

$ QB rows by feature_season in app/data/training/engine_b_features_v2.csv
{2018:40, 2019:40, 2020:43, 2021:46, 2022:46, 2023:49, 2025:62}   →  2018-2021 = 169
```
169 reproduces the lane's stated count exactly.

**Done looks like:** a decision, made deliberately rather than by omission — either refit on all
available seasons after the holdout has done its job, or keep the holdout permanently and say so
where David can see it.

**Depends on:** nothing.

---

**Notes**
Not independently traced by Tower: whether the pickle currently in service came from this code path
or another. The code path and the row count both check out; the artifact lineage does not.
