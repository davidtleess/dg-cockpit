---
name: reference_ffopportunity_expected_points_are_retrospective
description: "nflverse ff_opportunity `*_exp` / `total_fantasy_points_exp` come from a third-party xgboost model trained on 2006-2020 — NOT point-in-time; use raw per-game counts as the honest opportunity family (DG-177, 2026-09-06)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 615655e2-b8a6-42f8-abc6-d23dd7e2fdbd
  modified: 2026-09-06T13:27:17.092Z
---

**The fact.** The `ff_opportunity` table in `app/data/nflverse_usage.db` (2018–2025, weekly, full-PPR scoring
verified by least squares: rec 1.0 / yd 0.1 / TD 6 / pass yd 0.04 / pass TD 4 / INT −2) carries expected-points
columns (`total_fantasy_points_exp`, `*_yards_gained_exp`, …). Their producer, nflverse's ffopportunity package,
documents itself as "uses xgboost and tidymodels trained on public nflverse data from 2006-2020"
(https://ffopportunity.ffverse.com/, read 2026-09-06). The model version behind each warehouse row is not recorded.

**Why it matters.** A 2018 row's `_exp` value was produced by weights that saw 2018–2020 plays. A season split on
the rows does not remove that: the statistic itself is retrospective. Codex named the trap on 09-06: *a historical
season row can contain a retrospectively fitted statistic whose coefficients saw later outcomes.*

**How to apply.** For a point-in-time feature family, use the RAW realized counts per game (targets, air yards,
carries, pass attempts — `opp_*_pg` in `src/dynasty_genius/eval/opportunity_features.py`), which carry no fitted
weights; let the fold's own ridge derive the weights. The `xfp_*` columns exist there too, named exploratory, and
must be reported as such. They are a description of past opportunity, not a projection or price, so DG-173 does not
ban them — but "not banned" is not "point-in-time".

Related: [[project_dg162_what_the_model_reads_2026-09-04]], [[feedback_a_filters_correctness_depends_on_the_estimand]].
