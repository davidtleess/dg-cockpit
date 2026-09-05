# DG-027 — The penalty is chosen by random CV on repeated-player panel data

**Layer:** 3  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-48631  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, adversarial review of the Codex program

**Problem:** Alpha is selected with random 5-fold cross-validation over pooled multi-season rows. The
same player appears in many seasons, so random folds routinely put the same player on both sides. The
chosen penalty is therefore tuned against a validation set that already knows the answer.

**How we know:**
```
$ sed -n '272,277p' scripts/train_engine_b.py
    imputer = SimpleImputer(strategy="median")
    X_train = imputer.fit_transform(X_train_raw)
    model = RidgeCV(alphas=ALPHA_CANDIDATES, cv=5)      # random folds, panel data
```

**Done looks like:** alpha selected by expanding-time folds clustered on player, so neither the
season nor the player crosses the split.

**Depends on:** DG-026 — same harness, same fix, do them together.

---

**Notes**
Compounding: QB selected α = 1000.0, the ceiling of the grid (DG-017). A boundary selection made by
a leaking CV is two problems in one number.

The Codex spec states the rule against random CV for temporal tuning — and never reports that the
shipped model violates it, despite having read this file closely enough to establish the missing
scaler and the promotion gate from it.

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
