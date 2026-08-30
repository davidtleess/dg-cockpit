# DG-092 — SR-13: block the retracted TE lambda edit and guard the coupled constants

**Layer:** 3  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-23900  ·  **DG 3.0**  ·  **Tier 0 · code+test only**
**Source:** SEASON-BUILD-SPEC SR-13 (spec ~1186-1226), scheduled Wed 09-02 D9; **pulled forward
to Sat 08-29 night on David's pick** (spec line ~880 explicitly authorizes the pull: "SR-13
(0.5d, no dependencies)"). Filed per board convention — SR-13 had no DG ticket.

**Problem:** an earlier SEASON-BRIEF said `XVAR_LAMBDA_ENGINE_B['TE']` should be 0.703 not the
shipped 0.648 ("TE ~8% undervalued"). That finding is **RETRACTED** — the algebra shows
`lambda[pos] = P90[pos]/P90['WR']` exactly for all four positions, and because
`dvs_raw = projection_2y / _b_p90 * 100.0` (pvo_assembler.py:407) the position P90 **cancels**:
unclamped xVAR = (ppg − replacement_ppg) × 100 / P90[WR]. Editing the lambda alone would CREATE
an 8.4% TE distortion where none exists. The retraction lives only in documents; nothing in the
code stops the next agent reading a stale copy.

**How we know:** spec's verified identity print (P90 {QB 20.1, RB 15.7, WR 14.5, TE 9.4} →
ratios {1.386, 1.083, 1.0, 0.648} = the shipped lambdas, exact); memory correction #1 in
project_season_readiness_2026 (verified 20.7746 vs 20.7586). The REAL TE defect is the clamp
ordering (pvo_assembler.py:408-409): 11/89 TEs at the DVS ceiling vs QB 0/37, RB 5/99, WR 6/163
— that measurement must be preserved (SR-17 dropped).

**Steps (spec SR-13, verbatim intent):**
1. Strike the lambda-only edit in `engine_b_contract.py`'s own docstring — put the cancellation
   identity where the next agent will be standing.
2. Contract test in `tests/contract/test_phase15_xvar.py` asserting the coupled identity:
   `XVAR_LAMBDA_ENGINE_B[pos] == round(ENGINE_B_P90_PPG[pos]/ENGINE_B_P90_PPG['WR'], 3)` within
   0.001, and `ENGINE_B_REPLACEMENT_DVS[pos] == round(REPLACEMENT_PPG[pos]/ENGINE_B_P90_PPG[pos]
   * 100, 1)` within 0.05 (replacement PPG: QB 12.91, RB 7.29, WR 8.79, TE 8.99). **Green
   against UNMODIFIED constants — verify before committing.**
3. Record the clamp measurement (11/89 TE etc.) in the test module docstring.

**⛔ DO NOT EDIT `XVAR_LAMBDA_ENGINE_B` or any constant value. `pvo_assembler.py` is read-only
for this ticket.** RED discipline for a guard that must be born green: prove it CAN fire by
perturbing a constant in a scratch/monkeypatched copy, watch it fail, restore, watch green.

**Done looks like:** spec's three verification commands pass verbatim — the identity print shows
all four pairs matching, `pytest tests/contract/test_phase15_xvar.py -q` green against
unmodified constants, and the read-only sqlite clamp query returns ('QB',37,0) ('RB',99,5)
('TE',89,11) ('WR',163,6).

**Depends on:** nothing.

---

**Notes**

**⭐ LANDED 08-29 night, merge `1d2a5c89` on main (SR-13 done three days early — Wed D9 freed).**
TDD with perturbation-proof RED (guard watched firing against a monkeypatched constant, then
green against UNMODIFIED constants); all three spec verification commands passed verbatim —
identity print all four pairs matching, pytest green, clamp query ('QB',37,0) ('RB',99,5)
('TE',89,11) ('WR',163,6). 3-refuter panel: 2 minors fixed pre-land (docstring now says the
lambda identity holds "at 3-decimal rounding" — 20.1/14.5 = 1.3862069 vs shipped 1.386 — and
the replacement-PPG comment names the other in-repo statements of those numerators, noting the
Engine A side is unguarded/out of SR-13 scope). Gate 6493/0. Constants untouched, verified.
