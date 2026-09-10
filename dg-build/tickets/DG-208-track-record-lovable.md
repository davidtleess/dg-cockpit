# DG-208 — track record lovable

**Lane:** Claude54410
**Status:** READY_FOR_GATE — local implementation independently verified September 9
**Reserved owner:** actual Claude54410
**Worktree:** /Users/davidleess/dg-wt/DG-208

## Outcome

Replace Lovable’s Track record placeholder with an understandable saved-reading and evaluation experience.

## Ownership

Own lovable/src/routes/track-record.tsx, new components/dg/TrackRecord.tsx, lib/dg/track-record.ts, lovable/tests/track-record.test.ts and scripts/check_track_record_browser.mjs. Own the page and dedicated client/query module; root owns transport. Reuse existing components. Do not edit sharedqueries.ts/backend.ts or archived data.

## Dependencies and handoff

Frozen root response contract; fixtures allow parallel implementation. Final QA needs root local API/bridge.

## Acceptance

- Saved reading choice and URL persist; list/status refresh cannot silently change selected forecast values.
- Explicit save reflects duplicate, stale-source and partial success accurately.
- Separate football and market blocks; no blended score. Pending, missing input, insufficient and negative results have complete readable states.
- Original/reconstructed source dates and coverage understandable; filters do not alter graded cohort.
- All existing/new Node tests, types, lint and both builds pass; browserstates tested at desktop and phone. No fictitious results or raw technical flags rendered. Root owns independent final browser acceptance.

## Shared contract and limits

Read [the reconciled implementation plan](../TRACK-RECORD-IMPLEMENTATION-2026-09-08.md) before work. It contains exact schemas, source rules, file ownership, test commands and integration order. Raw planning reviews are evidence, not overriding instructions. Base verified main: `4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d`; reverify before dispatch. Create a fresh isolated worktree using `dg-work.sh` while Lane is unclaimed, then claim it. Preserve all DG200–204 work and evidence. No shared trunk/data/environment edits, no frontend-studio access, dependencies, model changes, historical outcome grading, scheduling, hosted data exposure or publication.

David said “continue” on September 9 after the completed plan. Root verified identities and isolated worktrees; implementation is now authorized within this ticket.


## Final disposition — September 9

Integrated Track record passed 45 JavaScript tests, type checking, lint and both builds; actual save/duplicate, 60 synthetic state checks and computed synthetic grader result rendering passed. Root and actual Claude inspected desktop/phone behavior. Synthetic evidence is not a real performance claim.

[Integrated handoff](../TRACK-RECORD-HANDOFF-2026-09-09.md). Local only; no new commit, push, merge or publication. Original evidence and worktrees preserved.
