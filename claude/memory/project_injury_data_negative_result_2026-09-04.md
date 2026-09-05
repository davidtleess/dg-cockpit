---
name: project_injury_data_negative_result_2026-09-04
description: "DG-163 measured 2026-09-04: injury-report data does NOT improve the availability forecast, and the naive version of the feature would have measured ROSTER MEMBERSHIP, not health. Negative result with the mechanism, so it is not re-proposed."
metadata:
  node_type: memory
  type: project
---

**⛔ DO NOT RE-PROPOSE "add injury data to the availability model" WITHOUT READING THIS.** It is the most
obvious-looking improvement in the product and it was measured on 2026-09-04 (Bob, DG-163, commit `85e5691`).
The answer is no, and the REASON is worth more than the answer.

**What was tested.** Half of every served number is `P(plays)` — a forecast that a player has a qualifying
season at t+1 or t+2 (≥4 games, 77% base rate). It is built from six columns with nothing about injuries in it,
while 45,337 rows of injury report are captured daily and read by nothing. Same leak-free walk-forward folds and
same pipeline as the shipped model; baseline AUC **0.8118**, reproducing the recorded 0.811.

| added | ΔAUC | 95% CI |
|---|---|---|
| `inj_out` (7 features) | −0.0001 | [−0.0008, +0.0007] |
| `+ inj_dnp` (8) | −0.0002 | [−0.0018, +0.0013] |
| `+ weeks` (9) | −0.0005 | [−0.0021, +0.0011] |
| `+ t−1 lags` (12) | **−0.0060** | [−0.0109, −0.0010] |
| all injury features (20) | **−0.0065** | [−0.0125, −0.0009] |

**Two findings, not one.** One to three injury columns do NOTHING — every interval spans zero. Six or fourteen
is detectably HARMFUL, and that is the price of parameters on 837 players, not evidence that injuries help
availability. The honest sentence: *injury data does not move this forecast, and paying for it in parameters does.*

## ⭐ THE TRAP, and it is the reason to measure rather than build

Univariate on the same folds:
- weeks declared **Out** → AUC **0.5129**. A coin flip.
- weeks **on the report at all** → AUC **0.4136** — BELOW 0.5. Inverted. Flipped, appearing on the injury report
  more often predicts returning **more** often, at 0.586.

**That is not health. It is roster membership** — you have to be an active NFL player to be listed at all. So a
naive injury feature would have shown real signal, looked like it was working, and been measuring EXPOSURE.
Same family as [[feedback_the_failure_path_returns_the_success_signal]]: the broken thing and the working thing
produce the same evidence. Not simple redundancy either — `games_t` alone is 0.7707 and its correlation with
`inj_out` is only −0.134.

**⚠ WHAT THIS DOES NOT SAY.** Not "injury data is worthless". It says injury history does not improve THIS
forecast — a coarse ≥4-games event one to two years out. Injury data could predict **next week's availability**
or **next season's games played** much better; neither was measured. **Severity and body part are untested** —
every concussion and every hamstring was the same row.

**Two method notes that nearly cost the result:**
1. `week` and `season` are **TEXT** columns, so `max(week)` returns `9` — lexicographically `'9'` beats `'18'`.
   The first query reported every season ending at week 9. Cast to integer: weeks 1–22, seasons 2018–2025, which
   fully covers the availability model's 2018–2023. **This is NOT the medical table that ends in 2023**
   ([[project_missed_games_investigation_2026-09-03]]) — different source. 1,061 of 1,193 feature-store players
   appear on a report.
2. Absence is carried as **two states, never one**: season not covered → counts `NaN`, `inj_covered=0` (unknown);
   season covered with no rows → counts `0`, `inj_covered=1` (observed clean). Today every season is covered so
   the flag is constant, **which is exactly why it must exist**.

## ⛔ THE GAMES-LAG COLUMNS ARE NOT A HALF-LANDED FEATURE — retracted the same day

`games_t_minus_1` / `_2` and their flags are written to the runtime store daily, are absent from the training
CSV, are not in `ENGINE_B_ALLOWED_FEATURES`, and are read by nothing. Those four facts are true; the inference
"plainly unfinished" was **wrong and is retracted**. `git log -1 --format=%B 738b7525` says in capitals
**CARRIED NOT CONSUMED**, "Deliberate, and each reason measured": consuming them moves `feature_completeness`
for 229 of 505 players, changes the DISPLAYED value for 227, and renders the raw string `games t minus 1` into
user-facing caveat copy (a DG-109/117 render-rule violation). DG-127 is `done`; **David ruled personally on
09-01: "wait, do not force."** Neither finishing nor deleting is available to a lane — both overturn his ruling.

**⚠ THE REAL OPEN QUESTION, and it is HIS.** The carry was justified by `ENGINE_B_MIN_GAMES_T` = 8 refusing
Garrett Wilson at `games_t`=7 while `games_t_minus_2`=17 sat in the row. **DG-143 moved that gate 8 → 4 on his
09-03 ruling.** Verified 09-04: Wilson passes and **0 of 505 rows now fall under 4**. The gate the lags were
built to inform barely judges durability any more. Does the carry still have a purpose, or is it now inventory?

**How to apply:** the lesson Bob named on himself is the standing rule of this project applied to a commit —
**provenance is a lookup, not a deduction.** `git log -1 --format=%B` settles intent in five seconds; the absence
of a consumer does not. Reading the commit SUBJECT and not the BODY is the specific miss.
See [[feedback_relay_authority_drift]], [[feedback_check_when_not_just_what]].
