---
name: project-review-verdicts-2026-09-03
description: "Verified verdicts on the AGY and Codex/Lou product reviews — what survived measurement, plus the band-is-a-constant and half-landed trust-guard findings."
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d30ce38-6359-4ba2-9420-29f91795414f
  modified: 2026-09-03T11:01:26.760Z
---

Two external AI product reviews were verified against live artifacts on 2026-09-02/03
(two workflows, 21 agents, 0 errors). Every number below was measured here, not quoted.

## ⭐ THE BAND ON SCREEN IS A PER-POSITION CONSTANT

`dvs_band_low/high` went live 2026-09-01 and carries **no information about the player**.
Width takes exactly four values, being 2 × `DVS_SIGMA_B`:

    QB 44.8   RB 45.6   WR 40.0   TE 47.2

"Median width 40" is just the WR constant surfacing (WR is 163 of 388 scored Engine-B rows).
The one band form that WOULD vary per player — the blend,
`sqrt(sigma_B² + ((1-w_B)(sigma_A + |DVS_A - DVS_B|))²)` — **fires on 0 of 12,227 rows**,
because no row carries `dvs_engine = "blend"`. 188 of 468 ranges (40.2%) touch 0 or 100.
So the range says "this position's average model error", never "how sure we are about him".
"Historical model error band" would be honest; "Likely range" is not.

**Band ÷ (replacement→best headroom):** QB 1.25× · RB 0.85× · WR 1.01× · **TE 10.75×**.
Every feature program ever added bought 10.7–17.4% of RMSE, so even halving model error leaves
the TE band 5.4× wider than the entire startable TE range. **No feature work can fix TE — only
the coupled P90 / replacement / clamp constants can.** See [[project_ranking_diagnosis_2026-08-31]].

## ⭐ THE TRUST-BADGE FIX EXISTS AND WAS WIRED TO THE WRONG ROUTE

`src/dynasty_genius/eval/served_model_alignment.py` hashes the deployed bundle by content and its
docstring names the 2026-09-01 incident. Run today it returns **aligned=False for all four
positions**. It is wired into `app/api/routes/trust_surface.py:131` but **NOT** into
`roster_audit_models.py`, which still compares the string `engine_b_v2` — constant across every
bundle ever built, so the mismatch branch is unreachable by construction. The roster-audit envelope
therefore ships three VALIDATED badges, `status="active"`, and an EMPTY caveat list describing
binaries retired 2026-08-31. This is a **half-landed remediation**, not an unknown defect.
TE is worse: its badge hash resolves to `runs/20260516T164503Z/te_v3.pkl` — a different model
FAMILY from the served `te_v2`. See [[project_gate_integrity_and_te_validation]].

## THE ABSTENTION ARGUMENT DOES NOT SURVIVE — argue the RULING, not the RMSE

Lou argued the 8-game gate is unsupported: holdout RMSE 3.28 (games 4-7) vs 3.19 (8+). Both
numbers reproduce. **The inference fails on three independent grounds:**
- **Survivorship.** `training_eligible` deletes **49.3%** of 4-7 rows vs **15.1%** of 8+ rows.
  It measures "given he came back, how accurate were we?" — but the dominant outcome of a weak
  4-7 signal is that he does NOT come back. Score non-returners at 0: R² 0.075 vs 0.621.
- **Variance.** R² 0.4226 vs 0.6627, diff −0.2401, 95% CI [−0.511, −0.047], P(worse)=0.994.
  Equal absolute RMSE on 38% less target variance is WORSE skill.
- **Wrong word.** `projection_2y` is served unconditionally; the gate touches only DVS
  normalisation. Below 8 games Engine B already carries 0.364–0.583 of the score via
  `w_B = n/(n+k)`. It is SHRINKAGE, not abstention.

⛔ **Never send "rank everyone" forward citing 3.28 vs 3.19 — the first competent challenge kills
it.** David's ruling (*rank everyone always; width, never absence*) carries it alone and needs no
holdout. The cleaner empirical support is the smooth ramp: 7 games 60.1%, 8 games 59.9%, no step.

## OTHER VERDICTS WORTH KEEPING

- **AGY's "RBs have zero position-specific features" is FALSE.** All four served pickles carry NGS
  (RB has `ngs_rush_yards_over_expected_per_att`, the feature AGY asked to add). AGY read
  `ENGINE_B_BASE_FEATURES` and mistook it for the served set.
- **AGY's `games_t < 4` remedy fires on nothing** — 0 rows; minimum is 4 by construction. The
  blanks come from `ENGINE_B_MIN_GAMES_T = 8`, a different constant. Wrong threshold entirely.
- **⛔ MULTI-MARKET CAPTURE IS MOSTLY UNLAWFUL, per our own registry.** KTC ToS *explicitly
  prohibits* scraping; `ktc_value`/`ktc_rank` are in `PROHIBITED_COLUMNS`. FootballGuys ToS bars
  scraping. Dynasty Nerds has no clean API. "Lawful multi-market capture" ≈ pay DynastyDataLab.
- **"FantasyCalc is the wrong market units" is FALSE.** The pull is `numQbs=2 numTeams=12 ppr=1`;
  David's league is 12-team SUPER_FLEX, rec 1.0, no TE premium. Units match. The real objections
  are single-vendor and 398-of-12,227 coverage.
- **Premium data contributes ~nothing as fitted, and MORE features will not help.** Permutation:
  production +2.55/+3.23/+3.60/+2.60; the entire advanced block +0.0005 to +0.0617. Drop-and-refit
  agrees (QB is *better* without). Players per feature: **QB 4.2 · TE 8.8 · RB 12.2 · WR 15.7**
  over a 4-season fit set. A promotion tournament would mostly select noise.
- **Contract data is 0.66 Spearman with the dynasty market** (DVS-vs-market is 0.81). Admissible
  as a prior on players the model cannot see; NEVER as a floor under players it can, and never on
  a screen showing market divergence without saying which market.
- **The horizon mismatch is real and deep.** PRODUCT.md:22 defines success as "correct 3–7 years
  out"; Engine B targets 2-year avg PPG, Engine A career years 2-4, and the longest eval horizon
  anywhere is 365 days. **Nothing targets or is validated at the stated horizon.**
- **Still zero predictions ever graded** against a realized outcome. 842k+ snapshots, no outcome
  store. First grading is 2026 W1.
