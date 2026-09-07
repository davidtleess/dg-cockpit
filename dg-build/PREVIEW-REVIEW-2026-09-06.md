# Research preview accepted — 2026-09-06

This supervised build cycle is complete at a LOCAL RESEARCH PREVIEW gate. The full personal dynasty decision product is not complete. No merge, live promotion, production restart or shared-data mutation was authorized by this acceptance.

Open: http://127.0.0.1:8787/?surface=research-preview

## Accepted inputs and implementation

- DG-165: canonical rookie run `20260906T154706Z`, forecast checkpoint `a41f8f05`, evidence-copy correction `16a6c9d8`. All 80 drafted rookies resolve once. Independent review verified 31 tests, 16 output hashes and coherent event/count bounds on 1,676 historical rows and 80 current players. Evidence is retrospective, not untouched confirmation.
- DG-177: basic five-year run `20260906T155259Z`, corrected companion manifest at `5082e47c`, final source-cleaning fix `240fa937`. Read actual `basic_forecasts.csv`, never the original manifest's fictitious annual-file alias. Eight real output hashes and all 20 position/horizon status cells verified. Historical folds: 14/12/9/5/1 for years 1–5. Root independently reran 19 source-outcome tests at the final checkpoint.
- DG-178: `8b6339a2`, canonical audit `20260906T171037Z`. Both main views use the same basic-veteran and rookie per-season terms; two years is a prefix of five years. Legacy annual model is an explicitly separate model comparison, with its ungraded year-two policy disclosed.
- Sleeper eligibility capture: DG-165 `runs/20260906T164442Z/eligibility_capture/`; integration records the derivative hash. Placement follows fantasy eligibility: Bredeson RB, Nowakowski TE, Hunter WR eligibility despite DB/CB NFL classification. Hunter remains unforecast with the actual producer exclusion explained, not silently zeroed.

## Verification

Root: `.venv/bin/python -B -m pytest -q -p no:cacheprovider tests/ranking tests/contract/test_research_preview_route.py` in DG-178 → **212 passed**, one legacy sklearn pickle-version warning. That warning is not certification of the existing served model.

Independent pinned grading review passed: own-arm reference forecasts, self-zero, preserved realized losses, policy-only evaluation, aligned forecast-origin/target seasons, and scoring/history/evaluation hash binding. Both producer owners also cross-reviewed integration.

Root browser QA: HTTP 200, no page errors, working Why/Hide and 2-/5-year controls, no document overflow at 390 px. All 27 David roster players appear with numbers in both views. Root verified identical first-two-season terms/reference and nondecreasing totals for all 27; audit checks 822 players with zero violations. Root screenshots: `/private/tmp/dg178-root-qa-THL8Tp/`. Final API recheck served run171037Z with 27/27 coverage and the corrected Hunter explanation. Builder final browser evidence is beside that audit run.

## Limits and next product work

This is season-points research, not drop/trade advice, complete dynasty value, optimal weekly lineup value or proven market edge. Full NFL regular-season scoring is not yet recomputed for David's exact fantasy-week window. Fifth-year veteran evidence has only one historical test season. Unforecast eligible players can change the available-player reference; future use of today's reference is an explicit scenario, not known future waiver access. Historical policy menus were inspected/refined retrospectively; bootstrap intervals condition on fitted predictions and observed reference/cohort.

The next product increment should address the exact league scoring window, material coverage gaps including Hunter, stronger comparison/forward evidence, and roster/lineup opportunity cost before trusted decision recommendations. Do not tune rankings to match a preferred player ordering. David's time preference remains a football choice; the neutral horizon comparison does not infer it.

All three Claude lanes completed their assigned queues and reviews. Idle at this checkpoint means the reviewed cycle has ended, not an unassigned dependency. No background Codex supervision is promised after the handoff.
