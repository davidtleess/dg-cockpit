# DG-125 — The availability model: nothing consumes the 638 recovered rows

**Layer:** 2 · **State:** todo · **Lane:** Davids-MacBook-Pro-84273 · **DG 3.0** · **backend / model**
**Source:** the 2026-08-31 attrition work (`58d3b20c`). That commit un-deleted 638 attrition
player-seasons and labelled them `outcome_returned`, and its own HONEST LIMIT section says the
job is half done: **the age coefficients did not move** (QB −0.0841 → −0.0850, RB −0.2162 →
−0.2163, WR −0.2334 → −0.2333, TE −0.1025 → −0.1153), because the recovered rows are correctly
excluded from the points regression and **consumed by nothing else**.

**Problem:** the product estimates one quantity — points, conditional on playing — and calls it
dynasty value. There is no availability term anywhere in either engine, no survival or
career-length variable, and `projection_1y` / `projection_3y` are schema fields permanently set
to `None`. Two measured consequences:

1. **The recommendation surface points backwards for dynasty.** The live divergence signal's BUY
   list averages 27.4 years old and its SELL list 23.8; `corr(age, model − market) = +0.3921`
   over 333 players; 40 of 85 buys are 28+, 49 of 79 sells are rookies or sophomores. Holding
   current production constant the market discounts age at **−0.4217** and the model at
   **−0.2121**, against a censoring-corrected true 2-year effect of **−0.2538**. The model
   under-penalises age even for its own target, and badly against a market pricing a career.
2. **Attrition is steeply age-graded and now measurable for the first time:** return rate
   85.5% (≤23) / 81.1 / 76.0 / 72.2 / **65.6% (31+)**. On the pre-fix table the 31+ band looked
   like 77.5% — the censoring was concealing its own severity.

**The work:** estimate `P(returns)` on all 2,879 complete-window rows using `outcome_returned`,
then compose `value = P(plays) × E[points | plays]` — the hurdle split the recovered label was
created to enable. This is the term that makes a 36-year-old and a 23-year-old with the same
projection stop being the same asset, and it is the first model in this product with a target
the box score cannot already answer.

**Three constraints, each from a specific finding — do not skip them:**
1. **Validate WALK-FORWARD BY SEASON, not GroupKFold.** The synthesis's measured AUC of
   0.787/0.822/0.830/0.753 used GroupKFold-by-player, which lets 2023 train a prediction about
   2019. That is not an estimate of forward performance. Expect the honest number to be lower and
   report it as the result.
2. **The event is `outcome_returned`, which is THIS PIPELINE'S qualification event, not a
   football fact.** The upstream assembler drops seasons under `MIN_GAMES_THRESHOLD=4`, so
   "did not return" means "did not post a qualifying season". A model trained on it is partly
   modelling the pipeline. Say so wherever the number surfaces.
3. **Calibration is the deliverable, not accuracy.** Under David's ruling that confidence is a
   WIDTH and never an ABSENCE, `P(plays)` is what gives a fringe player an honest band. An
   uncalibrated probability makes a wide band that is decorative. Check that predicted 0.7 means
   ~70% observed, and prefer split conformal / a calibration curve over a bare AUC.

**Do NOT** wire this into the served value in the same change. Estimating the term and changing
every published number are separate acts with different blast radii, and the second needs David's
word on its own.

**Honesty law:** an availability model whose event is defined by our own filter must never be
described as predicting whether a player's career ended.
**Done:** `P(returns)` estimated on the 2,879 complete-window rows; walk-forward-by-season
performance reported per position with its calibration, not just AUC; the pipeline-event caveat
recorded in the artifact; and the value composition left un-wired pending David's ruling.
