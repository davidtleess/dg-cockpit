# DG-036 — A failed backup can leave the previous run's `completed` marker standing

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeOpus5-DG036-20260824  ·  **DG 3.0**
**Source:** adversarial verification during DG-034, 2026-08-23. Found by attacking a claim about the
marker's failure taxonomy, not by looking for this.

**Problem:** `scripts/backup_irreplaceable_data.py:393-401` writes the marker inside a `try`, and on
`OSError` appends `marker_write_failed` and sets `status = "failed"` — but those mutations land on the
**returned dict only**. `json.dumps(marker, ...)` at `:396` is fully evaluated before `write_text` is
called, so the serialized bytes are frozen before `:399` mutates the list. Nothing about the failure
reaches disk.

If a previous run already wrote a `completed` marker and a later run fails **and** cannot overwrite it,
the on-disk marker still reads `status: completed`, `sha256_verified: true` — describing a run that is
not the last one attempted. Every consumer of `/api/system/capture-health` is told the backup
succeeded.

The 26-hour staleness rule eventually catches it, because the stale marker keeps the *old* run's
`finished_at`. Inside that window it is invisible.

**How we know:** driven directly at `run_backup` with the marker path made a directory, so the write
raises `IsADirectoryError`:
```
C  marker path is a directory (OSError on write)
   RETURNED status= failed    failures= [..., 'marker_write_failed']
   ONDISK   <not a file>

D  stale completed marker + failed write
   RETURNED status= failed    failures= ['missing_optional:...', 'auth_unavailable', 'marker_write_failed']
   ONDISK   status= completed failures= ['missing_optional:...', 'missing_optional:...']
```
Scenario D is the live hazard: the returned run failed, the on-disk marker says completed.

**Done looks like:** a run that cannot write its marker cannot leave a previous success standing as the
current truth. Either the marker write is made atomic-with-failure (write a failure marker to a path
that must succeed, or fsync+rename so a partial write cannot masquerade), or the reader learns to
compare the marker's `run_id` against the run it should have seen. A test asserts that a failed run
following a successful one never leaves `status: completed` readable.

**Depends on:** nothing. **Related:** DG-034 (the two blind spots in the reader), DG-033 (a producer's
own terminal status not being read).

---

**STATUS 2026-08-24 — LANDED on David's word.** Merge `de551d22` is on
`origin/feature/outcome-loop-week1` (pushed `e6995967..de551d22`); worktree and branch removed.
Based there rather than `main` because DG-034's reader lives only on that branch.

**`dg-land.sh` could not complete the merge — filed as DG-038.** Its gate passed (6301) and then it
died at `fatal: 'feature/outcome-loop-week1' is already used by worktree at
'/Users/davidleess/dynasty-genius-product'`. The merge was completed by hand in a DETACHED temp
worktree and pushed with `git push origin HEAD:feature/outcome-loop-week1`; the merged tree was
verified byte-identical to the tested tree (`git diff --stat ticket/DG-036 HEAD` empty) before the
push. **Consequence: the trunk's LOCAL `feature/outcome-loop-week1` is now 1 behind `origin`** and
needs `git pull --ff-only` in `~/dynasty-genius-product` — not done here, because that trunk carries
47 dirty files belonging to other lanes (AGENT-HOOK rule 1). None of them overlap DG-036's four.

**The ticket named the wrong dominant vector.** It frames the defect as the `OSError` branch at
`:397-401`. The vector that has actually occurred is process death, which never reaches the marker
write at all — measured twice: `docs/agent-ledger/2026-08-01.md:460-463` (manual run killed), and
2026-08-12, which `app/data/logs/backup_irreplaceable.out.log` skips entirely between
`20260811T141500Z` and `20260813T143035Z`. Both left staging directories that a `finally:` block
removes. 2026-08-12 is the same day the season brief records as a gap in `model_forward_capture`
and `market_divergence_history`.

**Built:** the producer writes `app/data/ops/backup_run_active.json` (`run_id`, `started_at`, `pid`)
at run start and never deletes it. The reader's invariant is that the marker must never describe an
EARLIER run than the last one that started — `>=` on the run_id, because `%Y%m%dT%H%M%SZ` sorts
chronologically, so a run whose sentinel write failed and published a *newer* marker stays healthy.
New reasons `backup_run_incomplete` and `backup_sentinel_unparseable`. Plus the `run_prefix` reset
this ticket's Notes called for.

**The first cut of this was wrong and adversarial review caught it.** Comparing run_ids for equality
made every healthy in-flight run read `degraded` — 0.11h to 12.64h daily, median 1.25h, measured
across the 52 runs in the log carrying both timestamps. The reason now fires only when the started
run can no longer be in flight: its pid is gone, or it has outlived `BACKUP_MAX_RUN_HOURS = 18`
(above the longest real run, 20260804T143449Z at 12.64h; below the 20-24h inter-run interval).

**Known limit, deliberately open:** the sentinel and the marker share a directory, so whatever makes
one unwritable usually makes the other unwritable too. They then agree and only the 26-hour law
catches it. Documented in `inspect_backup_marker`'s docstring.

**How we know it works:**
```
.venv/bin/python3.14 -m pytest tests -q      -> 6301 passed, 40 skipped (6283 before)
  .../test_dg036_stale_marker_red.py -q      -> 31 passed
ruff 0.15.12 check (pinned pre-commit rev)   -> All checks passed
dg-land.sh DG-036 --from feature/outcome-loop-week1 --dry-run
  -> "dry run: rebase clean, tests pass. Nothing merged."
10/10 deliberate mutations of the new production code caught by the new tests,
   including deletion of the route's sentinel_path kwarg.

replay of 2026-08-12 (stale 08-11 completed marker 25.6h old, dead run, inside the 26h law):
  BEFORE  status='ok'        reasons=[]
  AFTER   status='degraded'  reasons=['backup_run_incomplete']
healthy run observed from inside run_backup mid-upload:
  status='ok' reasons=[]     run returns completed / exit 0
```

---

**Notes**
Two smaller things found in the same pass, neither filed separately:
- `:400-401` reset `status` and `sha256_verified` on the returned dict but never reset `run_prefix`
  (set at `:385`), so a returned `failed` run carries a non-null `run_prefix`.
- The project's own ledger already recorded the adjacent race:
  `docs/agent-ledger/2026-08-01.md:471-473` — *"both jobs write the same local
  `backup_status_latest.json` without a lock. A later failing run can overwrite a prior verified
  marker."* Unlocked concurrent writers remain unaddressed.

Structural context worth carrying into any fix: `inspect_backup_marker` never reads `schema_version`
(zero references in `app/api/routes/system_capture_health_models.py`), and the marker is gitignored
(`.gitignore:206`). The consumer therefore cannot treat the producer's vocabulary as an invariant —
which is why DG-034 shipped a **fail-closed** allowlist rather than a known-bad list. The elegant
long-term fix is producer-side: a `backup_status.v2` marker splitting `failures` into `tolerated[]`
and `blocking[]`, so the component that knows which is which is the one that says so.
