# DG-002 — Walk-forward validation for RB, WR and TE

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**

**Problem:** Walk-forward temporal validation exists for QB only. The other three positions have no
out-of-time evaluation, so their model cards report accuracy nobody has tested against unseen
seasons.

**How we know:**
```
$ grep -rn "walk_forward\|TimeSeriesSplit\|expanding_window" --include=*.py app/ src/ scripts/
src/dynasty_genius/eval/qb_v3_walk_forward.py:351: def run_qb_v3_walk_forward_validation(...)
# plus bakeoff scripts that consume it. No RB/WR/TE equivalent.   run 2026-08-18
```
The QB harness already has the right shape — `candidate_matrix`, `labels`, `eligibility_mask`,
`feature_cols`, `horizons=(1,2,3)` (`qb_v3_walk_forward.py:351-357`). This is generalising something
that works, not inventing it.

**Done looks like:** one harness that runs the same walk-forward folds for all four positions and
writes a per-position, per-horizon error table to a versioned artifact. Train on seasons up to T-1,
test on T, roll forward, no feature timestamped after the decision boundary.

**Depends on:** nothing.

---

**Notes**
Model cards are `mtime 2026-05-30` — 80 days old as of filing — and the app serves them with
`is_experimental: false` and no age field anywhere the user can see. That's a separate ticket at
layer 6, but this ticket is what would make the numbers on those cards mean something.
