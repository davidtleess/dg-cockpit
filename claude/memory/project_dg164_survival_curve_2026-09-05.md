---
name: project-dg164-survival-curve-2026-09-05
description: DG-164 measured 2026-09-05 — the survival term for the dynasty asset number; ageing is an EXIT process not a fading one, and the panel supports it where the feature models never could.
metadata:
  type: project
---

**DG-164, measured 2026-09-05 by Bob (`e55b9dc` → `ad8669e` in `~/dg-build`). Design + evidence, NO feature built,
no market price read at any step.** The middle term of David's 09-05 dynasty-asset ruling: value = *what he
produces × how long that lasts × how scarce that tier is*. Fred has terms 1 and 3.

**⭐ THE FINDING THAT SHAPES THE VALUE TERM: THE DECLINE IS FLAT AND THE EXIT IS EVERYTHING.** Conditional on still
being startable, players produce **74–117% of their own prior rate at EVERY age** (WR 30–31: 101% at y1, 89% at y5).
Ageing in fantasy is an **exit** process, not a fading one. **A value term built as "this year's points × a decay
factor" models the wrong mechanism.** Fred's V collapses to `seasonal value × E[startable seasons]` *only because*
this is flat — if the decline finding is ever overturned, the product form goes with it.

**⭐ FEASIBILITY — the one question where the data IS sufficient.** Panel 1999–2025 from `nflreadpy`: 14,776
player-seasons, age 100% from roster `birth_date`, **14,880 cohort-year observations / 925 players, 2,728 still at
k=5**, full 5-year follow-up for cohorts 1999–2020. Against the **264–910 rows** that cap the per-position feature
models ([[project_dg162_what_the_model_reads_2026-09-04]]). ⛔ **Source survival from the PANEL, never from the
model tables.**

**DEFINITIONS (each deliberate).** *Startable* = top **QB25 / RB33 / WR53 / TE13** by **total REG PPR points**
(`ENGINE_B_VAR_THRESHOLDS`, David's order-statistic ruling). Non-circular — references no model output. **NOT** the
availability model's ≥4-games event (77% base rate, DG-163). Cohorts followed forward with **vanishers counted as
failures**; years past 2025 excluded as unobservable, never scored as failure.

**E[startable seasons in 5]:** QB 30–31 **2.72** > RB 24–25 **2.23**; RB 32+ **0.50** (0% at y5); WR ≤23 **3.39**.
**Position is not a modifier on an age curve, it is a different curve.**

**⭐ ELITE BUYS HORIZON — STRESS-TESTED, survives, but state it precisely.** Continuous margin (his points ÷ the
last startable player's points) × age, P(startable) over k=1..5:
`1.0-1.3× bar: 45/33/20/19/21/13%` … `2.3×+: 77/72/69/64/56/47%` (cols ≤23→32+). **Both effects large and
independent.** ✅ *"How far above the bar you are today predicts longevity as strongly as age does"* — and **being
far above the bar at 32+ (47%) ≈ being barely startable at 23 (45%)**. ⛔ **NOT claimable: "elite players age
better"** — that is a *rate* claim, part of the tier effect is definitional against a fixed bar, and this design
cannot separate it from a floor effect.

**⛔ NACUA IS THE MODEL'S HONEST DISAGREEMENT — do not report the board as matching David.** Nacua (WR, 25, 2025
**WR1**, 3.21× bar) **E = 3.84 [3.47, 4.20]**, the highest measured, above Gibbs/Bijan 3.33 and Allen 3.12 — and
first on Fred's seasonal term too. So the product returns **Nacua, then Allen/Gibbs/Bijan**. David's two complaints
still resolve (McCaffrey 1st→5th, Henry below Hall). Fred initially reported "his test passes", corrected it.

**⛔ E[seasons] IS A DURATION, NOT A VALUE** — not comparable across positions (WR53 vs QB25 are different bars).
Only the product is comparable. This is the column most likely to be misquoted as a ranking.

**S(h) published:** 59 cells at n≥12 → `survival_curves.json` (position, ageband, tier → S1..S5, E). **The
contend/rebuild toggle needs the VECTOR, not E** — a steep discount weights S(1) far above S(4) and that cannot be
applied to an expectation afterwards. Thin cells **suppressed, not smoothed**; RB 30–31 elite (n=9) and most of
**TE** (n=4–20) have no honest cell, so the toggle is uncomputable for some players David most wants it for — tell
him rather than backfill.

**⛔ REG-ONLY, MEASURED — and a conflation corrected.** *Fantasy playoff weeks are NFL 15–17, INSIDE the regular
season and already counted.* Excluded is the **NFL postseason (19–22)**, which no league scores. REG+POST changes
only **255 of 3,348 (7.6%) and is non-directional (128 in, 127 out)** — no compounding under-rating. Ranking on
weeks 15–17 alone churns 51.7%, which is a 3-week sample being noisy, not missing signal. Scope differs from
DG-024 (a *feature* ruling); still David's call, and cheap either way.

**Would be inventing:** anything past 5 years; any individual deviation from his cell; causality (elite may last
because good, or because teams keep feeding them); a parametric fit (Cox/Weibull) — it would smooth exactly the
thin cells where invention enters. Any fit must reproduce the elite/fringe gap and the QB/RB divergence or be
rejected. **Stop rule (Fred's, adopted): if a term needs a free parameter aimed at a known answer, stop.**
