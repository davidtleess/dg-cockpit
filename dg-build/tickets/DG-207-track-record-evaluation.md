# DG-207 — track record evaluation

**Lane:** Claude54281
**Status:** READY_FOR_GATE — local implementation independently verified September 9
**Reserved owner:** actual Claude54281
**Worktree:** /Users/davidleess/dg-wt/DG-207

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

David said “continue” on September 9 after the completed plan. Root verified identities and isolated worktrees; implementation is now authorized within this ticket.


## Final disposition — September 9

Final scorer/CLI hashes 81dbf4f8bb6ace29ae5d310f052bb50e9d012df56e96db7bff5f8520eeb0f86a and d447f496f4a15274640a647b449d0bc2350a94b4cdd0cd166c80644b1bdb3648 independently cleared the final chronology/readiness guards and are integrated into DG205. Root grading/evaluation-audit gate: 110 passed. No actual 2026 outcomes graded; real prepared-source arithmetic verification remains a future requirement.

[Integrated handoff](../TRACK-RECORD-HANDOFF-2026-09-09.md). Local only; no new commit, push, merge or publication. Original evidence and worktrees preserved.
