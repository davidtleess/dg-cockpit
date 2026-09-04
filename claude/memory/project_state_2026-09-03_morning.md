---
name: project_state_2026-09-03_morning
description: "Morning of 2026-09-03: DG-139/140/134/142 landed (140 LIVE at 09:00), DG-143 built+pushed but HELD on David's percentile ruling, and David's six rulings from that session"
metadata:
  type: project
---

**LANDED AND LIVE as of 2026-09-03 09:00:47** — the chain rebuilt the artifact from
`league-20260903T130044Z`. Measured by Tower on that artifact: served age != Sleeper **0** (was 324),
age verdict contradicting the served age **0** (was 97), past-cliff rows with no counter-argument **0**
(was 16), past-cliff flags 108 -> 141, served team != Sleeper 0. Wilson serves age 26 with
`age_within_two_years_of_position_cliff`.
- DG-139 `c62783b1` (09-02 22:18) — served age is Sleeper's.
- DG-140 `6f517027` (09-03 06:53) — the age VERDICT is restated from the served age.
- DG-134 `32ceb8fb` (09-03 05:23) — capture training cutoff reads `feature_season`. **Built by Fred, LANDED BY DAVID HIMSELF** (`dg-land.sh DG-134`), per the ticket's own landing line. Tower mis-attributed the land to Fred in a closeout draft; the audit caught it.
- DG-142 `1812a5c8` (09-03, Fred) — roster trust badge checks the served model. **LANDED, NOT LIVE**
  (trunk was 2 behind and the API is pid 50754 from 05:30; the live page still shows RB/TE/WR VALIDATED).

**⛔ DG-143 IS BUILT AND HELD — DO NOT LAND IT WITHOUT DAVID.** `ef08020c` on `ticket/DG-143`, PUSHED.
Gate `ENGINE_B_MIN_GAMES_T` 8 -> 4 on his ruling; suite **6821** green (6816 excludes its own five tests).
**Two corrections the closeout audit forced, both of which David has been told:**
(1) **The market justification is weaker than Tower first reported.** Spearman 0.711 vs a 0.795 baseline was
DATE-LUCKY — the best of seven daily snapshots. Across all seven the new cohort runs **0.634-0.711** (0.643 on
09-03's own market) against a baseline holding 0.788-0.805, so the gap is ~0.13 not 0.08, and at n=32 fifteen
percent of random subsets of ALREADY-SCORED players score at or below 0.711 by chance. What still stands
independently: 94% of the 82 players FantasyCalc declines to price score below 20.
(2) **The percentile worry was OVERSTATED.** Correct field is ranked on `xvar`, not DVS
(`universe_pvo_batch.py:123-136`): mean shift **6.8** pts, max 11.2, >5 pts on 329 of 468 — but **463 of 468
move UP, 2 fall by 0.1, and NO existing player's rank relative to another changes.** Ordering is
mathematically untouched. Tower proposed freezing the reference population then withdrew it (freezing silently
redefines the statistic as "rank among players with 8+ games").

**David's rulings this session:** gate 8->4 (*"the model is always making its genuine estimate"*) ·
**remove the uncertainty range, one number per player — NOT BUILT** · leave an unscorable row BLANK
(*"if you leave it blank, that should be a big enough flag for me"*) · take the timestamp out of the vintage
flag (DG-141, NOT BUILT, unowned) · **"no 'partial season' lang"** — numbers ship bare, no hedging copy ·
FA shows on the card (NOT BUILT) · fix the tight-end rank, 8 TEs pinned at 100 (NOT BUILT).

**The near miss to remember: LANDING IS NOT ENOUGH.** Scheduled jobs run from trunk's checkout and nothing
pulls it. At 08:05 trunk was 2 behind and the 09:00 rebuild would have shipped the exact 97-card
contradiction DG-140 exists to prevent. Fred caught it; David pulled himself at 08:06.

**Why:** the next session must not re-land DG-143 unasked, must not report DG-142 as live, and must not
re-derive the artifact numbers. **How to apply:** `git -C ~/dynasty-genius-product log -1` AND
`git rev-list --count HEAD..origin/main` before saying what is live — see
[[reference_trunk_frontend_bundle_is_a_manual_build]], [[feedback_check_when_not_just_what]],
[[project_missed_games_investigation_2026-09-03]].
