# Automatic model-versus-market tracking — complete and active

Completed September 10, 2026, evening Eastern time (activation September 11 at 00:02:36 UTC). David approved this increment with “Go for it,” then approved source landing with “Go.” The dedicated tracker is active, and the source is now merged and pushed. The hosted app and football forecasts have not changed.

## Source landing — September 11 at 00:18:37 UTC

Source commit `3471848dd94ecd8b2e14729dd2a146d8f4d16cf5` landed through the official `dg-land.sh DG-222` gate as main `d05315e7f83c6261e66c649ca45be64193335839`. `git ls-remote origin refs/heads/main` independently confirmed that exact remote commit. All 12 landed source/test/plan files match the reviewed commit; no private capture, runtime, or run evidence entered Git.

The final official gate passed **8,085 backend tests (37 skipped)** and **975 frontend tests**, plus frontend typecheck, lint, banned-language checks and build. Existing pinned Ruff0.15.12 was found in the pre-commit cache and used without installation; production source and all touched Python files passed lint, and commit hooks passed. Five runtime-source files received import-only cleanup; an independent review verified identical non-import AST and unused removed names. Test formatting/import cleanup did not change assertions. The active release retains its original immutable code/configuration and evidence recipe, with no runtime cutover.

The first full gate attempt failed two existing tests because root placed its temporary directory inside the repository and a `/Users/` path. Correcting only the temporary-directory environment to a private directory outside the repository made both checks pass; the entire official gate was then rerun successfully, with no skipped/exempted checks or source changes to those tests. Both attempts are preserved.

GitHub CI for exact merge `d05315e7` is complete: frontend passed; Python has **21 failed, 8,039 passed, 62 skipped**. The same 21 failed test IDs, full failure summaries, and assertion/exception lines match parent `4f93a380` exactly; there are **zero new failure mechanisms** and 82 additional passing tests. CI remains red on that existing baseline; it is not represented as a clean GitHub run. [Workflow](https://github.com/davidtleess/dynasty-genius/actions/runs/34545947635). Independent comparison: `ci-review/merged-ci-comparison-d05315e7.json` under the landing evidence root.

Post-merge verification found all 17 active runtime files, installed configuration and job unchanged; the same eligible enrollment and 50 captures remain healthy. The natural 00:20 UTC scheduled run after the merge passed with zero duplicate captures/enrollments, both horizons awaiting, and no errors. The shared operational checkout stays at its original `96dad300` with all nine existing modified tracked files and status preserved. It was not broadly updated or reset. The disposable landing worktree was removed by the official lander; the original DG222 review/evidence worktree remains on `review/DG-222-retained-20260911T001026Z`. All three verified actual Claude sessions received the scoped source-landing closure notice; no new builder work was assigned.

Landing evidence: `/Users/davidleess/dg-wt/DG-222/runs/20260911T001026Z-source-landing/`, particularly `official-land-final.log`, `official-land-final-result.json`, `source-commit-receipt.json`, `independent-import-cleanup-runtime-review.json`, and `post-merge-verification.json`.

## What this does for David

The saved Dynasty Genius forecast now has a prospective record against subsequent FantasyCalc prices. The tracker preserves verified captures from the existing collector, registers the forecast once, and uses the existing rules to evaluate later market movement. Repeated polling does not create extra forecast samples. Missing data remains missing, with eligible open windows retried rather than prematurely graded.

The current enrollment started at `2026-09-11T00:02:36Z`. Its descriptive 30-day window opens October 11 at 00:02:36 UTC; its primary 90-day window opens December 10 at 00:02:36 UTC. Each permits the declared three-day capture window and selects its first compatible capture. These are October 10 at 8:02:36 PM EDT and December 9 at 7:02:36 PM EST; with the current morning collector, first eligible captures would normally arrive October 11 and December 10. No outcome has been graded yet.

This tests whether model–market disagreements anticipate later market prices. It does not establish superior football forecasts, better trades, lineup improvement, or a validated five-year dynasty value system. The original forecast and ownership information remain dated September 6; the current market capture is September 10.

## Verified result

- All 825 original forecasts, 4,125 annual forecast values, and original overall model ranks are preserved. Independent arithmetic reproduced all 386 current paired rank intervals and gaps without a mismatch.
- The enrollment retains the original report/catalog population of 953 players. There are 386 comparable players and 365 with an eligible trailing-price comparator; the other 21 have explicit missing-comparator reasons.
- All 422 current raw market assets were independently checked against the collector's separate original success receipt, including 24 picks and one unresolved position. Unknown-position players can retain a price without receiving a paired positional rank. Current-market-only Jack Strand is outside the original forecast/catalog population but remains named with price 271 and an explicit lack-of-valuation exclusion in the immutable market/rank artifacts.
- Fifty captures met the evidence contract and were preserved, including the August 11 trailing comparator. Historical database rows without sufficient original receipt/schema evidence were not upgraded into verified captures. The retained evidence represents normalized collector batches; original HTTP response bytes are unavailable.
- Current Sleeper scoring and roster slots were independently checked against the saved league: 12-team Superflex, full PPR, no TE premium, championship ending Week 17.
- The first actual LaunchAgent invocation created one eligible enrollment. The natural 00:05 UTC invocation then reused it, imported zero duplicates, retained all 50 captures, and left both horizons awaiting. Both exited successfully. No manual trigger was used for the second run.
- All ten original archive files, the current 422-row shared capture and receipt, 17 existing installed job files, and five checked existing loaded job registrations were preserved.

## Active runtime and recovery

Runtime root: `/Users/davidleess/dg-runtime/forward-market-tracker`

- Release: `releases/6c059c794dae82938023e66318f2ff4d784cde7b2e5e8d37c063b3b52ac78b0c`
- Configuration: `configs/ee650498064a5fdd21cd2684a189fa57810b7df1c579a58ef0f93f83c580446c.json`
- LaunchAgent: `com.davidleess.dynasty-forward-track-record`
- Installed file: `/Users/davidleess/Library/LaunchAgents/com.davidleess.dynasty-forward-track-record.plist`
- Enrollment: `663c92ae1ec84a5592ac9481cc71d50e23b488374a6503fb0a041c63e68ab1e9`
- Source: `/Users/davidleess/dynasty-genius-product/app/data/fc_forward_capture.db`, opened read-only, plus its original collector receipts.

The job runs on David's Mac in his logged-in user session, independently of this chat. It checks on load and approximately every 15 minutes, with explicit :05/:20/:35/:50 calendar triggers and a persistent concurrency lock. It catches up when the Mac resumes; it cannot collect while the Mac is shut down or the user session is absent. It never triggers the upstream collector or model itself. If no qualifying endpoint survives the declared window, that missing outcome is recorded rather than fabricated.

Reviewed source, configuration, original template, and historical receipt evidence are copied into the private runtime. Module imports and all 17 packaged source hashes were verified from the cold runtime, without a disposable worktree dependency. The existing Python environment remains an external read-only dependency. Every run writes a separate immutable receipt below `runs/`; capture, enrollment and grade stores are private to this tracker.

The configuration pins this approved forecast. A different future forecast requires a separately reviewed registration/configuration; mutable production output is not silently treated as the same study.

To stop only this new job if necessary:

```sh
/bin/launchctl bootout gui/501/com.davidleess.dynasty-forward-track-record
```

Preserve the runtime and accumulated records. Do not alter the existing collector, daily chain, catch-up guard, or old archives.

## Implementation and review disposition

Final integration source: `/Users/davidleess/dg-wt/DG-222`, retained branch `review/DG-222-retained-20260911T001026Z`, source commit `3471848dd94ecd8b2e14729dd2a146d8f4d16cf5`, base `4f93a3807c479260b7c374dcae27ee441e4db1a4`. The ticket branch was removed after the successful remote merge.

Three actual Claude sessions were verified before dispatch. DG223 supplied the verified capture adapter; DG224 supplied the initial runner handoff; DG225 independently reviewed scientific/source correctness. Root completed the outcome preparation helper, CLI binding, real-store integration, chronology and idempotency repairs, final capture-status reporting correction, runtime packaging, and activation. Final DG222 files supersede partial builder handoffs; do not recopy older DG224 files over them.

- Integrated regression suite: **334 passed, 1 skipped**.
- After the final capture-status reporting correction: **49 capture/real-CLI tests passed**.
- Scheduler preparation: **11 tests passed**.
- Python compile/AST checks and `git diff --check` passed; the cold runtime verified exact source/config/template/import identities. Ruff was unavailable and was not installed or claimed as passed.
- Actual Claude scientific review: **PASS, no open findings**, including 365/365 trailing ratios and all 21 missing-comparator dispositions. The initial question about Jack Strand was explicitly resolved against the frozen population and exclusion artifacts.
- Additional independent operational review closed the final runner findings and verified both actual launchd invocations, including the natural scheduled retry.

Evidence root: `/Users/davidleess/dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/`

Key records:

- [Natural scheduled retry](../dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/independent-postactivation-natural-retry.json)
- [Original inputs and active enrollment preservation](../dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/active-source-verification.json)
- [Independent complete rank arithmetic](../dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/independent-all-ranks-verification.json)
- [Runtime packaging](../dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/runtime-packaging-receipt.json)
- [Installation receipt](../dg-wt/DG-222/runs/20260910T232518Z-automatic-track-record/tracker-installation-receipt.json)
- [Actual Claude final scientific review](../dg-wt/DG-225/runs/20260911-activation-gate/rehearsal-verification.md)

## Remaining boundaries

The original implementation stopped at the source gate; David's subsequent “Go” approved the completed commit/push/merge described above. No local dependency installation, shared-data write, model promotion, API restart, or hosted publication occurred. The tracker remains operational under its dedicated activation authorization.

DG218–221 remains independently implemented locally and awaiting actual desktop/mobile inspection. This backend-only work does not clear that visual gate. Both DG221 and DG222 touch `market_ranks.py`; any future integration must preserve both changes. Hosted display of these new tracking records and a decision notebook are subsequent product milestones, not completed features.

DG222–225 have no remaining implementation or source-landing assignment. **MERGED, PUSHED AND ACTIVE.** The separate hosted/visual work above remains outside this increment.
