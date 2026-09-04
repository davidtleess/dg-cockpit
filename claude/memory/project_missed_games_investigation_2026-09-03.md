---
name: project_missed_games_investigation_2026-09-03
description: "David's hypothesis that injured/suspended returners are an edge — measured 2026-09-03 by 12 agents: the market discount is real but EARNED, and the byproducts are worth more than the hypothesis"
metadata:
  type: project
---

**David asked (2026-09-03): can we treat missed games — or a BLOCK of missed games — as a different
analysis, using injury type and history, to beat managers who are gun-shy about returning players?**
Measured by 12 agents with skeptic challenges. **Answer: mostly no, and the byproducts matter more.**

**The half that is TRUE:** the market discounts returning players by a median **23% more** than matched
healthy peers at the same position and price (677 blocks, 2021-24; 12-17% in the 2025 daily series).

**The half that KILLS it:** buying them during the absence lost to matched peers — **-8.5% / -12.5% / -16.7%
at 3/6/12 months, winning 31-37%** (714 blocks). **Corrected by the closeout audit: NOT "all four years" at
every horizon** — it lost at 6 months in every season, but 2024 was FLAT at 3 months (0.0%) and no 2024 block
has a 12-month observation. In 2025, across **73 injury-attested return blocks (median absence 3 games)**,
returners produced a median **6.5% below** their pre-injury rate and **48%** reached 90% of it — against
**62%** for a same-season control who missed nothing. (Those are 2025-only and are NOT the 6+-game
population below.) **The discount is earned.**

**Why the injury-type version cannot be built today:** `pp_medical_history` has body_part, severity,
games_missed, surgery and recovery_timetable but **ends at 2023** — zero rows for 2024/2025, so it labels
NONE of the live players. The local archive is `~/Downloads/MedicalHistory_2017..2023.csv`. Whether newer
files exist at the vendor was NOT verified. `nflverse_injury_report` does reach 2025 (45,337 rows) but has
no games-missed, severity or surgery field. **Suspensions are absent entirely** — 13 player-seasons, all
2023, only **3 of them skill-position offensive** players; Sleeper has no Suspended status and we never capture its `injury_status`.

**No absence feature improved the availability model at all** — the best moved pooled walk-forward AUC by
<0.0005 and the rest made it WORSE, by up to 0.018 (baseline 0.8118, n=1950). Block-vs-scattered predicted
nothing (4.54 vs 4.39, p=0.74, n=344). Do not re-litigate without new data.

**⭐ THE BYPRODUCTS, which are the real finding:**
- **`games_t` counts games with a BOX-SCORE LINE, not games played.** Of the 115 gated, 39 played 8+ games
  and 3 played all 17. (David's correction: those blocking TEs are *correctly* irrelevant to fantasy, so
  this is not the defect Tower first called it.)
- **Within the gated 4-7 cohort**, the played-vs-produced gap ranks future PPG at Spearman **-0.449** while
  the exact `games_t` value inside that band ranks nothing (**+0.028**). ⚠ **CORRECTED — do NOT read that as
  "games_t doesn't work".** The +0.028 is a RANGE-RESTRICTION artifact: the cohort IS games_t 4-7, so the
  feature has almost no variance inside it. **Across the full training population games_t is +0.420 Spearman
  and the strongest single availability predictor in the estate (AUC 0.765).** Tower's original phrasing
  ("we gate on the number that does not work") was wrong and would have undercut David's own gate ruling.
- **`games_t_minus_1` / `games_t_minus_2` are in the RUNTIME table (44 cols) and not the TRAINING table
  (40 cols)**, so no served model has seen them. **Not a design flaw** — they were added to the assembler
  09-01 and the runtime table picked them up the next morning; the training table simply has not been
  regenerated since 08-31. Regenerating it is the unblock. (This corrects the older note that games has zero
  lags.)
- A player who missed 6+ games returns to within 90% of prior PPG **19.3%** of the time vs **47.5%** healthy.
- Snap counts detect real absence for 72% of the gated cohort vs 33% from the injury report.

**Cheap thing worth doing:** start capturing Sleeper's `injury_status` daily — we do not store it, so the
same question a year from now hits the same empty table.

**Why:** this cost 12 agents and ~1.4M tokens; do not re-run it. **How to apply:** the intrinsic model must
stay market-free — the 23% discount is a DIVERGENCE to instrument, never a model input.
[[project_state_2026-09-03_morning]] · [[david_rulings_ranking_2026-08-31]]
