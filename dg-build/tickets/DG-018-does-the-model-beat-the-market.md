# DG-018 — Make "does our model beat the market?" a standing measurement

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane horse race, 2026-08-18

**Problem:** Until tonight nobody had ever asked whether the model outperforms free consensus pricing.
When it was finally asked, the answer came back **no — the market wins at every position**
(−0.030 Spearman pooled, −0.107 at QB). That number has no home, no owner and no schedule, so it can
drift back to unknown.

**How we know:** four annual point-in-time market snapshots are on disk and have been for years —
`app/data/fc_snapshots.db`, `snapshot_date` distinct values **2021-09-08, 2022-09-08, 2023-09-08,
2024-09-08** (plus 2026 dailies), 6,790 rows total.

**Done looks like:** the model-vs-market comparison runs on a schedule and its result is visible
wherever model quality is reported. A losing scoreboard shown honestly is worth more than no scoreboard.

**Depends on:** DG-017. Any horse race run before pipeline parity is comparing the market against an
estimator we do not ship.

---

**Notes**
The first run of this test showed the model **winning** by +0.078 Spearman. It was wrong — a model
trained on season *s* was being scored against a market snapshot taken before season *s* was played.
The lane disbelieved its own favourable result and found the bug. That instinct is the reason this
number can be trusted at all, and the corrected direction is the unfavourable one.

**This is the measurement that would eventually earn the right to turn off `decision_supported: false`.**
Right now it argues for keeping it off.
