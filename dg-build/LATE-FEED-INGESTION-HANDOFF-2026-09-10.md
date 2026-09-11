# Late-feed ingestion — complete, merged and live-verified, September 10

**Current disposition: COMPLETE + MERGED + LIVE; natural scheduled retry verified.** David explicitly approved commit, push, merge and activation with “all of the above” on September 10. All authorized activation work and final verification are complete; no further approval is needed.

The initial 12:22 ET live capture reached all 13 streams, instead of stopping at missing snap counts. Its49 partitions comprise5 updated,36 unchanged,2 pending and6 errors. At that initial capture, snap counts and FTN charting 2026 were confirmed unpublished and queued. All14 export files passed hash, containment and row-count checks; the export contains2,980,605 rows and correctly says `ready: false`. These are feed records, not unique players or proof of complete game coverage.

Source was committed at `dbf2e92d` and landed through `dg-land.sh` at main `4f93a3807c479260b7c374dcae27ee441e4db1a4`. The final lint cleanup was independently approved by actual Claude54331 at all14 release hashes. Official local gates passed8,003 backend tests/37skipped and975 frontend tests plus frontend typecheck/lint/build. GitHub CI separately retains the exact21 pre-existing backend failures, with no new failure mechanisms; frontend CI passed.

The exact6 runtime files were applied to the operational checkout at12:22ET. Its unrelated changes and original job schedules were preserved. One ordinary capture ran12:22:49–12:27:42ET and exited1 because real source errors remain. Both jobs were restored at12:29ET. The first actual guard tick reported no premature retry, no kicks, and a wait until13:22:49ET. The natural guard retry then ran at 13:32 ET, before the 13:35 verification follow-up started, and finished at 13:36:45 ET. The observed launchd → guard → capture process chain passed exactly six due partition arguments to the real retry CLI. It ingested 93 snap-count records that were previously unavailable, reused the four unchanged current-season feeds and kept FTN pending. The other 43 partition records remained identical; all attempts respected the hourly minimum. The six old attempt identities are ledgered and six new identities remain eligible for later checks. Their next due time is 14:32 ET; a second cycle has not been observed. Automation `verify-dg-late-feed-retry` is now paused because verification is conclusive; the production guard and capture jobs remain loaded.

Evidence: `/Users/davidleess/dg-wt/DG-214/runs/20260910T161449Z-activation/` — `merge-receipt.json`, `runtime-cutover-receipt.json`, `first-live-capture-result.json`, `export-verification.json`, `jobs-restored.json`, `first-guard-tick.json`, `capture-outcome-review.md`, and `ci-review/ci-comparison-receipt.json`. Original review worktree and immutable implementation evidence are retained.

## Final natural retry evidence

`scheduled-retry-20260910T173559529463Z/verification.json` proves all 14 export files exist within their immutable run, match their SHA256 and contain the declared actual Parquet row counts. Twelve unaffected file hashes are identical; snap counts gained 93 rows and the separate unresolved-identity diagnostic gained 21 rows. Total source records are now 2,980,698. Readiness remains false: one feed still waits and six genuine source errors remain. Exactly snap counts is marked fresh this run, and exactly the six selected partitions are marked checked. Reused data retains its original observation time.

Actual Claude54331 independently approved the scheduled process chain, subset, state transitions, timing, ledger and provenance in `final-review.md`; root independently verified exports and repeated the preservation-sensitive comparisons. `preservation-review.json` independently confirms six released runtime hashes, three unrelated tracked files, both original installed plists/symlink targets, and both loaded jobs. Completed receipts are saved under `completed/`; in-flight receipts and process evidence remain untouched. The first verification script made an incorrect total-row summation assumption by including the separate unresolved-identity projection; that failed assertion and the corrected read-only verifier are preserved. No product defect or data mutation resulted.

## Findings that remain

- **First operational follow-up: distinguish selected retry outcome from whole-receipt health.** This retry completed its selected work, but the CLI exited 1 because six old, unselected errors remain in the merged receipt. The guard consequently records `state: failed` and “retry CLI reported a real failure; not retried automatically.” This does not block fresh attempts under the inspected queue/ledger code, but the saturated failure signal obscures a genuinely broken retry. Keep the overall degraded state and real errors visible while separately classifying the selected attempt. No source change was authorized by this verification-only follow-up.

- Five2026 missing-release errors (fourPFR advanced-stat streams and FF Opportunity) are not eligible for hourly retry because their published filenames/host differ from the classifier's current declaration. They may be unpublished, but that is not yet proven by the current classifier. They remain errors and will be checked by the ordinary daily capture. A bounded follow-up should explicitly declare and verify their canonical asset patterns/hosts; it must not turn arbitrary404s into waiting.
- The2026 injury file lacks `report_secondary_injury` from the declared schema. It is correctly refused; accepting a new schema needs a reviewed adapter change.
- The capture owner found37 irrelevant missing-attempt-stamp diagnostics on archive/snapshot partitions that are not retry candidates. The queue itself is correct, but this diagnostic needs narrowing. No new implementation has been dispatched for these findings.

## Verification-command incident — corrected, retained

During the earlier preflight, Claude54281 ran `plutil -extract ProgramArguments json` without `-o -`; it rewrote the installed guard plist through its symlink. That command was not read-only, contrary to the earlier preflight wording. Root detected the148-byte replacement before unloading either job and restored the exact11,995-byte original, cross-checked against operational HEAD, the ticket copy and the11:43 preservation receipt. `plutil -lint` passed; the job stayed loaded until the intended cutover. The original schedule/arguments are unchanged. Evidence and the incorrect earlier claims remain preserved at `guard-plist-incident/repair-receipt.json`. Use `plistlib` or `plutil -p` for inspections; extraction/conversion commands can overwrite their inputs.

## Product limits

This activates acquisition and retry only. It does not rerun or promote a model, change league/scoring assumptions, refresh the hosted September6 forecasts, or establish a dynasty decision edge. Source errors remain visible and waiting remains distinct from zero. The first natural scheduled retry is verified; future cycles and complete game coverage are not claimed.

<details>
<summary>Historical implementation handoff — superseded by the current activation status above</summary>

# Late-feed ingestion — final handoff, September 10

**COMPLETE · READY_FOR_GATE.** Available usage feeds can now load while unpublished feeds wait. The existing guard can revisit late data after 9 AM. Implementation is uncommitted in `ticket/DG-214`; nothing was merged, deployed, or captured into production during this increment.

## Delivered behavior

- Each declared feed/season has its own result: updated, unchanged, pending, interrupted, error, or excluded. A narrowly confirmed unpublished current-season release waits; authentication failures, outages, missing historical releases, and malformed source data remain visible errors.
- Independent available feeds continue through source fetch/normalization failures. Empty responses cannot erase stored facts. Store or coherent-export failures still stop the run because continuing cannot be assumed safe.
- Identical seasonal content skips normalization, store replacement and duplicate raw revisions. Source corrections or additions create new revisions. Successful current-season feeds also receive hourly revision checks, so a file containing week 1 can later gain week 2. Archives and snapshot-axis feeds are excluded from that hourly policy.
- Existing 15-minute guard ticks run only due partitions, with an hourly minimum per partition. Both guard and capture enforce the selected subset. Persistent kernel locks prevent overlapping writers and release on process death; queued attempts and attempt times survive a killed capture.
- Partial exports preserve last good facts and show each partition's state, observation time and whether it changed or was checked. Waiting, failed and interrupted partitions cannot claim full readiness. Missing remains distinct from zero.

## Final evidence

- Root combined regression: **983 passed**, 33 test files, one existing Polars deprecation warning. Includes actual guard → capture CLI → private store/export subprocess tests for unchanged content, delayed next-game arrival, narrower guard selection, and real CLI release-inventory wiring. [Results](../dg-wt/DG-214/runs/20260910T114416857618Z-final-combined-v4/pytest.txt), [source hashes and static checks](../dg-wt/DG-214/runs/20260910T114416857618Z-final-combined-v4/checks.json). All 13 changed Python/JSON files parsed; whitespace checks passed. No linter was installed.
- Live source rehearsal at **07:42 ET September 10**: actual 2026 snap-count asset returned 404 and the official release inventory confirmed absence; it was recorded pending. The available depth-chart feed continued and stored **2,183 rows from its latest-date slice**, dated September 9 at 12:06:21 UTC. Coherent export verified; immediate not-due retry made zero loader calls. Pristine private DB/raw/export/cache only. [Live evidence and limits](../dg-wt/DG-214/runs/20260910T114203271153Z-live-final/result.json).
- Actual Claude54331 independently **APPROVED**, bound to all 13 final source/test hashes. Reported findings were reproduced and fixed. [Final independent verdict](../dg-wt/DG-214/runs/20260910T105729Z-review-54331/FINAL-VERDICT.md).
- DG215 capture owner Claude54410 and DG216 operations owner Claude54281 are complete; final handoffs, including guard rev4, match the integrated files exactly. [Freeze receipt](../dg-wt/DG-214/runs/20260910T114416857618Z-final-combined-v4/final-freeze-verification.json).
- Eleven shared source/runtime/schedule files remained identical in bytes, hash and modification time. Existing model season-basis and required-input checks passed unchanged. Private evidence and unrelated DG213 work are preserved. Native autonomy run is READY_FOR_GATE.

## Limits

This is acquisition and retry behavior, not a new forecast or dynasty-value model. It does not automatically rerun or promote forecasts when a late feed arrives. Season-level availability does not prove that every completed game is covered. Observation time means retrieval time, not upstream publication time. The live depth-chart slice does not prove last night's game statistics were ingested.

Arrival/correction tests use explicitly synthetic data and controlled clocks. Real capture SIGKILL recovery and guard locking were tested separately; the entire guard-driven SIGKILL-and-resume sequence was not exercised as one live-provider test. A running receipt with no retry metadata produces an ambiguity diagnostic, including a briefly legitimate first-ever run; it does not block retries. On a no-due invocation, corrupted-stamp diagnostics are returned to the CLI without rewriting the prior marker; completed captures also persist them.

## Proposed activation — requires David's explicit approval

1. Commit/push the reviewed source, tests and plan from DG214 and land through `dg-land.sh`; retain private run evidence outside publication.
2. Outside the 09:00–10:15 ET protected producer window, quiesce existing usage-capture/guard writers before switching from the old exclusive-file lock to the new kernel lock. Never mix those writer versions or delete a live lock.
3. Apply only the six reviewed runtime source/config files to the operational checkout with verified preimages. All six currently match DG214's original base exactly: [preimage receipt](../dg-wt/DG-214/runs/20260910T114416857618Z-final-combined-v4/activation-preimages.json). The operational checkout remains at `96dad300` with unrelated local changes; do not reset, clean, or broadly fast-forward it. Preserve `.mcp.json`, the agent ledger, and `tests/test_aging_curves.py`.
4. Run one ordinary capture to seed partition/retry metadata, or explicitly wait for the next 06:15 daily run. The old failed receipt has no such metadata, so retry-only is not a bootstrap. Verify the resulting source/partition/export receipt and next due guard check. Existing installed schedules need no plist edit; restore the existing jobs after cutover.

Activation does not authorize model training, promotion, season-basis changes, API restart, dependency installation, or unrelated hosted-interface work. DG213 hosted delivery is now complete, merged, published, and live-verified. Its earlier permission blocker is resolved.

</details>
