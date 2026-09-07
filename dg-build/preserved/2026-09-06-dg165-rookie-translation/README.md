# DG-165 Lane A — rookie translation. PRESERVED 2026-09-06. **MEASUREMENT ONLY, NOT PUBLISHED.**

## The question
`P(ever becomes fantasy-startable)` — the factor a rookie needs in front of the existing
DG-164 R(h) cells, because those cells are fitted on players who ALREADY qualify and so
condition away a rookie's dominant uncertainty.

    rookie value = P(ever qualifies) x [existing R(h) cells at the level he reaches]

## Reproduce
    cd ~/dynasty-genius-product
    .venv/bin/python <this dir>/rookie.py        # needs panel.parquet from the DG-164 preserve dir
`RESULTS.txt` is the verbatim output of the run that produced every number below.

## Cohort — built independently of every inherited flag
Draft classes **2015–2020** (the classes with five years of follow-up), selected **by season
alone**. `censored_incomplete_arc`, `low_sample_flag`, `is_training` and
`head_b_training_eligible` are all deliberately NOT read. **478 prospects, all 85 zero-game
washouts retained.** Outcome: ever finished at or above QB37 / RB45 / WR71 / TE21 by total
regular-season PPR points, 1999–2025 panel. **203 of 478 = 42%.**

## Result
| model | AUC | Brier | log loss |
|---|---:|---:|---:|
| **draft capital alone** (pick, round, age at draft) | **0.813** | **0.1719** | **0.5209** |
| college production alone | 0.655 | 0.2281 | 0.6506 |
| capital + college | 0.817 | 0.1706 | 0.5169 |
| base rate, no model | 0.500 | 0.2443 | 0.6818 |

**Increment of college on top of capital: +0.004 AUC, 90% CI [−0.007, +0.014].**
Restricted to the 344 who actually carry college data: **+0.003, CI [−0.014, +0.020].**
**True out-of-time holdout** (train 2015–18, predict 2019–20, n=157): **+0.008 AUC, CI
[−0.010, +0.026]; ΔBrier −0.0045, CI [−0.0135, +0.0037]. BOTH SPAN ZERO.**

Calibration of draft-capital-alone, **out-of-fold**, max deviation **0.045** across six bins.
By position: QB 0.876 · RB 0.884 · TE 0.812 · **WR 0.743 (weakest)**.

## ⛔ Scientific risks, stated
1. **The five pick-quintile percentages (86/57/34/22/12) are IN-SAMPLE** — computed on all 478
   rows with no holdout. **Descriptive, not validated probabilities.** The validated object is
   the out-of-fold calibration table.
2. **`yprr_college` is 0% populated** — a column with no data. Other college coverage 31–72%.
   The claim is *"the college data we hold adds nothing on top of the pick"*, NOT *"college
   football tells you nothing the draft does not."* Competition adjustment, usage share and
   per-game splits were unavailable and are untested.
3. **n = 478 pooled**; per position 68–194. Position-specific models are not supported.
4. **The predictor is itself a market of a kind** — thirty-two front offices' verdict. It is a
   football decision rather than a fantasy valuation, but it sits beside David's 09-06 ruling
   that projections and rankings are market prices, and he should know we noticed.
5. **`censored_incomplete_arc` must never be applied to this question.** It is CORRECT for
   Engine A (which asks *how good if he makes it* — verified: fits 313 of 478, min 8 games, no
   zeros in target) and **FATAL here** (it deletes the 85 washouts and returns P ≈ 1). Its
   correctness depends on the estimand.

## ✅ Double-count gate — PASSED
Engine A's target `best3of4_ppg` is a rate fitted only on non-censored rows, so it is
conditional on having played and does **not** embed a success probability. Multiplying by
P(ever qualifies) counts it **once**.

## ⚠ ONE OBJECTION TO THE PUBLICATION CONDITION
Codex's brief says do not publish *"unless college features add stable out-of-time
information."* They do not. **But the useful factor is DRAFT CAPITAL** — AUC 0.813, calibrated
to 0.045. Blocking it because a different input failed would leave all 80 rookies unpriced for
no reason the evidence supports. **The condition is written on the wrong input.** Flagged, not
overridden: nothing is published.
