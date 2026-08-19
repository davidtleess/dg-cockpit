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
