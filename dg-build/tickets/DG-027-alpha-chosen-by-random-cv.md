# DG-027 — The penalty is chosen by random CV on repeated-player panel data

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
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
