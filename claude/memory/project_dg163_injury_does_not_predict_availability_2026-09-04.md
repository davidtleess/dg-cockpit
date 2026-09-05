---
name: project-dg163-injury-does-not-predict-availability-2026-09-04
description: DG-163 measured 2026-09-04 — injury history does NOT improve the P(plays) forecast; weeks declared Out is AUC 0.513 and weeks-on-report is INVERTED (it measures roster membership).
metadata:
  type: project
---

**DG-163, measured 2026-09-04 by Bob, ticket `85e5691` in `~/dg-build`. NEGATIVE. No feature built,
no code changed.** Came out of [[project_dg162_what_the_model_reads_2026-09-04]] §6: the P(plays)
half of every served number is forecast from six columns with no injury data, while 45,337 injury
rows arrive daily unread.

**THE RESULT.** Same leak-free expanding folds and same pipeline as the shipped model; baseline AUC
**0.8118** reproduces the recorded 0.811. n=1,950 rows / 837 players / base rate 0.773.
Adding **1–3** injury columns: ΔAUC **−0.0001 to −0.0005, every CI spans zero.**
Adding **6 or 14**: −0.0060 / −0.0065, CIs exclude zero — **that is parameter cost on 837 players,
not injury signal.** Honest sentence: *injury data does not move this forecast, and paying for it in
parameters does.*

**⚠ THE REASON IS WORTH MORE THAN THE RESULT — the direction is INVERTED.** Univariate AUC, scored
in the direction a builder would assume (more injury → less likely to return):
`inj_out` **0.5129 (a coin flip)** · `inj_dnp` 0.4922 · `inj_distinct` 0.4459 · `inj_ques` 0.4195 ·
`inj_weeks` **0.4136** — *below* 0.5, i.e. **more appearances on the injury report predicts MORE
returning (0.586 the other way), because you must be on an active NFL roster to be listed at all.**
A naive injury feature would have shown real signal, looked like it worked, and been measuring
**exposure, not durability** — [[feedback_the_failure_path_returns_the_success_signal]] in a new
costume. `games_t` alone is **0.7707**; its correlation with `inj_out` is only −0.134, so this is
NOT simple redundancy — the report genuinely does not predict a qualifying season 1–2 years out.

**⛔ TRAPS**
- **`week` and `season` are TEXT in `nflverse_injury_report`.** `max(week)` returns **9** —
  lexicographic, `'9' > '18'`. The first coverage query said the table was half a season deep.
  It is **weeks 1–22, seasons 2018–2025**. Always `cast(week as integer)`.
- **NOT the medical table that ends 2023** ([[project_missed_games_investigation_2026-09-03]]) —
  a different source. This one fully covers the model's 2018–2023 training seasons.
- **`_labels()` in `availability.py` compares to the literal string `"True"`.** Rows built from a
  pandas frame (bool column) silently label every row 0; it only fails loudly because
  LogisticRegression refuses a single-class fit.

**⛔ WHAT IT DOES NOT SAY.** Not "injury data is worthless" — only that it does not improve *this*
outcome (posted ≥4 games at t+1 **or** t+2; coarse, 2 years out, 77% base rate). Next-week
availability and next-season games played were NOT measured, and severity/body part were not built
(every concussion and hamstring is the same row). 18.4% of the table is source-only, unresolved.

**Design kept for whoever builds on it:** absence is a STATED state, never an implied healthy —
season uncovered → `NaN` + `inj_covered=0` (unknown); season covered, no rows → `0` +
`inj_covered=1` (observed clean). Both flags carried as features.
