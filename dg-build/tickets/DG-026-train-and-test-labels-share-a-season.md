# DG-026 — Training labels and test labels share the 2023 season

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, adversarial review of the Codex program

**Problem:** The split is clean on *features* and leaking on *labels*. Engine B's target is the mean
PPG of the two seasons AFTER the feature season. Train on feature seasons 2018–2021 and the labels
are drawn from 2019–2023. Test on 2022–2023 and the labels are drawn from 2023–2025. **2023 realized
outcomes sit on both sides of the split.**

**How we know:**
```
$ sed -n '75,83p' src/dynasty_genius/features/feature_assembly.py
    if games_t1 > 0: pts.append(ppg_t1)
    if games_t2 > 0: pts.append(ppg_t2)
    return mean(pts)                      # label = mean of the NEXT TWO seasons

train feature seasons [2018,2019,2020,2021] -> label seasons [2019..2023]
test  feature seasons [2022,2023]           -> label seasons [2023,2024,2025]
OVERLAP: [2023]
```

**What it means:** every accuracy number Engine B has is biased optimistic by an unknown amount —
the model-card metrics, the model-vs-naive improvements, and tonight's technique screen. **This does
not say the model is bad. It says we do not know how good it is.**

**Done looks like:** a split rule that constrains the **label window**, not just the feature season —
a training row is only admissible if its outcome window closes before the test row's feature season.
Then the headline numbers get re-measured under it.

**Depends on:** DG-017 (the scaled pipeline), because re-measuring under a leak-free split is only
worth doing once.

---

**Notes**
This is the reason to be careful with every improvement figure quoted tonight, including the ones
Tower relayed. The proposed replacement harness does **not** fix it — its stated rule is "train only
on seasons < Y," which is a rule about feature seasons and passes on a leaking split. That is the
single most important correction to make before any program starts.

**Acceptance — LANDED `e7391650` 2026-09-04 ~16:2x ET by Bob (`~/dg-build/bin/dg-land.sh DG-027`), DG-026 in the
same merge.** Backend 6,960. **NOTHING RETRAINED, NOTHING PROMOTED** — this changes how the NEXT run chooses; the
served pickles are untouched and a promotion is David's word through DG-058/059 (unbuilt).

**Measured on the served dataset before building** (alphas reproduce the served run `20260831T204458Z` exactly, so
the comparison is to what actually serves):

| pos | penalty: random CV → leak-free | r² published → honest split → **unseen player** | rows moved in served order |
|-----|-------------------------------|--------------------------------------------------|---------------------------|
| QB  | **1000 (grid CEILING) → 1**   | +0.439 → +0.365 → **−0.158** | 89/95, max 28 |
| RB  | 500 → 10                      | +0.593 → +0.600 → +0.461 | 154/185, max 13 |
| WR  | 200 → 0.1                     | +0.682 → +0.691 → +0.612 | 287/303, max 35 |
| TE  | 10 → 10 (unchanged)           | +0.641 → +0.597 → +0.483 | 145/161, max 60 |

**QB's 1000 was the ceiling of the grid** (DG-017 flagged it). Under an honest selector it goes to the FLOOR — that
boundary selection was the leak talking, not a modelling choice. **The honest numbers are MIXED, not uniformly
worse:** RB and WR are unchanged or slightly better; QB and TE are worse. The unseen-player column is
[[DG-153]]'s finding and the reason it has its own ticket.

**DG-027's fix:** expanding-time folds clustered on player — each fold validates on ONE season, trains only on
strictly earlier ones, and drops every player appearing in the validation season from the training side. Neither the
season nor the player crosses. Real data supports it: **3 usable folds per position**. It **REFUSES rather than
degrading** — a missing or incomplete player column, and a panel with no turnover, both raise, because a grouped
split that silently reverts to random would report a clean number and change nothing.

**DG-026's fix:** admissibility follows the LABEL window, so feature season 2021 (labelled 2022-23, against a
holdout labelled 2023-25) is dropped. **The stricter variant is NOT the default and the reason is measured:** also
forbidding a training label season from being a test FEATURE season leaves ONE alpha fold per position and 80 QB
rows, and costs accuracy everywhere (QB r² .345→.321, WR .679→.637, TE .631→.577). `LABEL_WINDOW_RULE` names the
choice; the stricter rule is one constant away and an unknown rule is refused, never defaulted.

⚠ **The r² drops from the stricter rules are CONFOUNDED** — removing a season removes both leak and data, and this
design cannot separate them. Do not quote a drop as "the size of the leak".

**How the penalty was chosen now travels in the run report** (method, fold count, validation seasons, seasons
dropped), so a future reader can tell a leak-free selection from the random-fold one it replaced.

**Not touched, as instructed:** `XVAR_LAMBDA_ENGINE_B` (DG-092), the coupled TE constants, and
`train_te_deployment_model` (it uses a FIXED `TE_MODEL_CHANGE_ALPHA`, no CV, so it never had this defect).
`train_v1_1_control` likewise uses a fixed alpha. **After this change no `RidgeCV` call remains in the trainer.**
