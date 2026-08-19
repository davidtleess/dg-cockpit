# DG-015 — The model card and the training code disagree about what the model saw

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** Tower, 2026-08-18, while checking DG-014

**Problem:** The card the app serves describes a training procedure the training script does not
perform. One of the two is wrong, and the card is the one David sees.

**How we know:** all four cards in `app/data/backtest/model_cards/` read
`training_window: "2018–2022 (expanding; 4 folds)"` and `retrain_mode: "refit_per_fold_fixed_alpha"`.
`scripts/train_engine_b.py:187-190` fits on rows *excluding* 2022 and 2023. Those two statements
cannot both describe the deployed artifact.

**Done looks like:** the card states what the served model actually saw. If the card is describing
the walk-forward evaluation rather than the deployed fit, it says which.

**Depends on:** DG-014 answering what the deployed fit actually is.

---

**Notes**
These cards are served by `/api/trust-surface/{position}/model-card` with `is_experimental: false`
and no age field. Their file mtime is 2026-05-30 — 80 days at filing.
