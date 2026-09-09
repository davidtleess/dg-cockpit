# DG-207 — track record evaluation

**Lane:** —
**Status:** PLANNED — reserved; implementation not dispatched
**Reserved owner:** actual Claude54281
**Worktree:** /Users/davidleess/dg-wt/DG-207 (not created)

## Outcome

Implement separate, declared football and market evaluations that can report unfavorable and inconclusive results honestly.

## Ownership

Own new eval/workspace_track_record.py, app/config/workspace_market_movement_90d_v1.json, scripts/grade_workspace_track_record.py and two test files. Preserve original workspace production declaration and DG018 experiment. Implement the exact metrics, cutoffs, endpoint selection, momentum comparator, tie handling and missing-data sensitivity in the plan. No production data query or grader run against actual 2026 outcomes.

## Dependencies and handoff

Root contract; DG206 enrollment schema/store. Start pure functions and synthetic fixtures in parallel; final CLI requires DG206.

## Acceptance

- Existing production-plan formula, producer/provenance separation and bootstrap seed189 preserved; partial seasons never scored as full-season forecasts.
- New market enrollment time is prospective, with fresh start and frozen trailing baseline;90days primary,30descriptive.
- Midrank ties retained; true endpointzero yields-100%, absence remains missing; constant correlation is undefined; identical cohorts for paired comparator.
- Seed205, endpoint window, per-position minimums, insufficient states and missing sensitivity deterministic and tested.
- No point-price forecast, decision edge or repeatability claim. Focused tests/CLI pass; actual results remain pending. After implementation, independently review DG206/root lineage and API refusals.

## Shared contract and limits

Read [the reconciled implementation plan](../TRACK-RECORD-IMPLEMENTATION-2026-09-08.md) before work. It contains exact schemas, source rules, file ownership, test commands and integration order. Raw planning reviews are evidence, not overriding instructions. Base verified main: `4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d`; reverify before dispatch. Create a fresh isolated worktree using `dg-work.sh` while Lane is unclaimed, then claim it. Preserve all DG200–204 work and evidence. No shared trunk/data/environment edits, no frontend-studio access, dependencies, model changes, historical outcome grading, scheduling, hosted data exposure or publication.

Planning is complete; product implementation has not been dispatched. This ticket is reserved to the stated role, not already running. Root will verify session identity/activity before execution.
