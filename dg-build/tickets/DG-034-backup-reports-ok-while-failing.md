# DG-034 — Backup health reports `ok` while the backup is failing

**Layer:** 1  ·  **State:** **done — 52e7dfc9 on `feature/outcome-loop-week1`**  ·  **Lane:** ClaudeOpus5-DG034-20260823  ·  **DG 3.0**
**Source:** Codex Consultant read-only sweep, 2026-08-19; independently re-derived at source by the
crew Claude lane the same afternoon

**Problem:** two independent faults in the same function, either of which alone hides a failed
backup. In `app/api/routes/system_capture_health_models.py:735-776`:

1. Staleness is `now - finished_at > threshold`. A **future-dated** marker yields a negative delta,
   so it is never stale.
2. `failures` is read out of the marker and echoed to the caller, but **is never appended to
   `reasons`** — while the returned status is literally `"degraded" if reasons else "ok"`.

So a marker with `status="completed"`, `sha256_verified=true`, a future `finished_at` and a
non-empty `failures` list returns **`status="ok"`, `reasons=[]`**.

**How we know:** read `system_capture_health_models.py:748-776`. `reasons` is appended to for
staleness, non-`completed` status and unverified sha256 — and never for `failures`, which is
collected at :756-761 and passed only into the echo at :774.

**Done looks like:** a marker carrying failures cannot read `ok`, and a `finished_at` in the future
is itself a degraded state rather than a free pass. A test asserts both.

**Depends on:** nothing.

---

**STATUS 2026-08-23 — DONE. `52e7dfc9`, hand-landed on `feature/outcome-loop-week1`.**
Hand-landed because `dg-land.sh` cannot run at all (DG-037), not because its gate was skipped: the
rebase was a no-op (remote tip == base) and the suite was run and accounted for below. Pushed as a
fast-forward, `2c793603..52e7dfc9`, verified against `origin/feature/outcome-loop-week1`.

**The defect lives on `feature/outcome-loop-week1`, not `main`.** `inspect_backup_marker` was added
this morning by `2c793603` and does not exist on `main` (that file is 658 lines with zero occurrences
of "backup"). `dg-work.sh` defaults to `--from main`, which yields a worktree without the function.
Built from `--from feature/outcome-loop-week1`; must land the same way.

**The literal acceptance bar was NOT met, deliberately.** The ticket says *"a marker carrying failures
cannot read `ok`"*. Implemented as: a marker carrying an **untolerated** failure cannot read `ok`.
`missing_optional:<path>` stays `ok`. Reason, measured:

- `backup_irreplaceable_data.py:229` is the ONLY append to the run-level `failures` list outside an
  `except` clause; `:372` `status = "completed"` is the last statement of the `try`. So
  `status=completed` ⟹ every failure token is `missing_optional:`. Every other token already forces
  `backup_run_failed` + `backup_unverified`. Blanket-degrade therefore adds **zero** detection.
- `app/config/backup_manifest.json` declares 43 required / 4 optional; `app/data/footballguys/observations.db`
  is absent **by design** (two lanes certified it: `evidence/2026-08-17/fbg_first_capture_postfire_report_claude_v1.md:7`,
  `..._codex_v1.md:59`). Today's live marker therefore carries exactly one `missing_optional:` token
  beside `completed`/`sha256_verified=true`.
- Blanket-degrade would pin `backup.status=degraded` — and via `system_capture_health.py:88-96`,
  `overall_status` — every day forever, on the surface guarding the disaster floor. That is DG-023
  verbatim: a signal that cries wolf on good data, so the real `auth_unavailable` failure that
  motivated `2c793603` arrives looking identical to the standing noise.

Tolerance is a **fail-closed allowlist**: exact prefix `missing_optional:` plus a non-empty path.
Every other token degrades, including one the producer has never emitted — the marker is gitignored
(`.gitignore:206`), carries no validated `schema_version` (zero refs in the reader), and has a
documented unlocked concurrent writer, so the producer's vocabulary is a convention the consumer
cannot assume.

**Changed:** `app/api/routes/system_capture_health_models.py` — `backup_marker_future_dated`
(60s clock-skew grace) and `backup_failures_present`; `BackupHealth` docstring; regenerated
`frontend/openapi.json` + `types.gen.ts` + `zod.gen.ts` via `npm --prefix frontend run openapi-gen`
(description-only delta, 7 insertions / 5 deletions, no structural churn).
**New test:** `tests/contract/test_backup_health_blind_spots_red.py`, 14 cases.

```
$ .venv/bin/python3.14 -m pytest tests/contract/test_backup_health_blind_spots_red.py -q
   RED (before):  11 failed, 3 passed      # 3 are regression guards, correctly green
   GREEN (after): 14 passed

$ .venv/bin/python3.14 -m pytest tests/contract/test_backup_health_capture_surface_red.py \
    tests/contract/test_system_capture_health_t{1,2,3,4}.py tests/contract/test_openapi_drift_contract.py -q
   82 passed          # all 15 pre-existing backup tests still pass — the allowlist breaks none

$ live marker fed to the fixed function
   status: ok   reasons: []   failures echoed: ['missing_optional:app/data/footballguys/observations.db']
```

**Full suite: 19 failed, 6251 passed, 40 skipped — ZERO collection errors. All 19 are pre-existing
worktree artifacts, none caused by this change.** Verified by stashing the change and re-running:
identical 19. Causes: `git check-ignore` cannot traverse `dg-work.sh`'s symlinks
(*"fatal: pathspec ... is beyond a symbolic link"*, 13 cases), `frontend/node_modules` not shared by
`dg-work.sh` (`ERR_MODULE_NOT_FOUND`, 3 cases), and `Path.relative_to()` against a symlink that
resolves outside the worktree (3 cases). **See the tooling note on DG-037.**

---

**Notes**
`02` §Standing Infrastructure ruling 3 is explicit: *"Silence is not success. A missed or failed run
must surface, never pass silently."* The backup is the product's disaster floor — the single copy of
the PIT capture stores, model artifacts and operational databases.

A third finding from the same sweep — backup failure disappearing from two aggregate health surfaces
(`system_tier_readiness.py:75-101`, `system_health.py:110-141`) — was **measured on 2026-08-23** and
is CONFIRMED. Both re-derive capture health in-process from `inspect_capture_store` ONLY; neither
calls `inspect_backup_marker`. So `/api/health`'s `capture_health` subsystem and tier-readiness's
`capture_health_ok` precondition (5 surfaces via `app/config/tier_readiness.json`) cannot see backup
state at all — a failed backup is invisible there both before and after this fix.

That containment is why DG-034 was safe to ship, and it is also a real gap: it now needs its own
ticket. Consequence worth naming — with this fix live, a degraded backup flips the Daily Tape to
"Partial Market Sync" while the shell pill (fed by `/api/health`) still reads "Synced": a visible
cross-surface contradiction.
