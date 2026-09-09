# DG-206 — track record baselines

**Lane:** —
**Status:** PLANNED — reserved; implementation not dispatched
**Reserved owner:** actual Claude54331
**Worktree:** /Users/davidleess/dg-wt/DG-206 (not created)

## Outcome

Freeze trustworthy simple football baselines and separate evaluation enrollment beside each source-bound forecast.

## Ownership

Own new capture/track_record_inputs.py, capture/track_record_store.py, scripts/capture_track_record_inputs.py, their three contract test files and tests/fixtures/track_record/. Supply complete raw-artifact/source metadata, per-stream readiness, canonical identity and immutable storage for both enrollments and grades. Do not edit existing archive schema, APIs, UI or metrics.

## Dependencies and handoff

Root contract first; existing DG189 archive. Outputs feed DG207 and root API. Can develop against synthetic fixtures alongside both.

## Acceptance

- Prior-season median uses all verified prior participants, including those absent from the current forecast set.
- Same target/scoring/window and cutoff evidence required; missing and verifiedzero distinct. Reconstructed baseline never relabelled as contemporaneously saved.
- Preserve full initial population and provenance categories, exact source bytes and unknown source knowledge times.
- Duplicate returns original immutable receipt, corruption refuses; original archive bytes unchanged; no implicit shared output.
- CLI and focused red/green tests pass. Deliver mapping table, fixture contract, exact paths and source availability limitations. Review DG207 scorer/input binding later, independently of own code.

## Shared contract and limits

Read [the reconciled implementation plan](../TRACK-RECORD-IMPLEMENTATION-2026-09-08.md) before work. It contains exact schemas, source rules, file ownership, test commands and integration order. Raw planning reviews are evidence, not overriding instructions. Base verified main: `4ad796c223d9b55bf18c3497cd3f69ba35cb7a6d`; reverify before dispatch. Create a fresh isolated worktree using `dg-work.sh` while Lane is unclaimed, then claim it. Preserve all DG200–204 work and evidence. No shared trunk/data/environment edits, no frontend-studio access, dependencies, model changes, historical outcome grading, scheduling, hosted data exposure or publication.

Planning is complete; product implementation has not been dispatched. This ticket is reserved to the stated role, not already running. Root will verify session identity/activity before execution.
