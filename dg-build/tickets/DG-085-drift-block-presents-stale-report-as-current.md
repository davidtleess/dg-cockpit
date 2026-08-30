# DG-085 — The schedule-drift block presents a stale chain report as a current reading

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG085-20260828  ·  **DG 3.0**  ·  **Tier 0**
**Source:** DG-083 pre-land review minor finding; pulled into D6 night on David's 2026-08-28 word.

**Problem:** the DG-083 drift block anchors every number to the chain report's OWN date and never
compares to NOW. `evaluate_schedule_drift` (app/api/routes/system_capture_health_models.py:698)
builds the target from `started_local.date()` — the report's recorded start — so on a morning the
chain never ran, the surface reads YESTERDAY's `daily_chain_latest_report.json` and presents
yesterday's run as `basis=chain_report`, drift ~0, `exceeds_grace False`. The exact failure the
block exists to prevent — a degraded state reported as simply fine — reproduced one level up: a
missing run impersonating an on-time one. The store-level `staleness` block would eventually warn,
but the drift block itself lies all morning, and it is the field that answers "did today's capture
start on time".

**How we know:** read `evaluate_schedule_drift` / `_schedule_drift_from_report`
(system_capture_health_models.py:657-738) — no `now` in either signature; `inspect_capture_store`
receives `now` (line 848) and never passes it to the drift path (867-871). Found in the DG-083
pre-land review, 2026-08-28.

**Done looks like (additive — no field added or removed, `basis` is already free-form str):**
- When the report's recorded start date (newest tz-aware `started_at` in the report, config tz) is
  not today (config tz, judged from the caller's existing `now`), the block says so:
  `basis="chain_report_stale:<date>"` with `recorded_start`/`drift_minutes`/`exceeds_grace` null —
  the invariant stays: `basis == "chain_report"` is the ONLY basis that ever carries numbers.
- Applies to every per-step outcome, not just the ok path — yesterday's failed or skipped step must
  not read as a current failure/skip either.
- A today report keeps its exact current behavior, including the past-midnight catch-up
  re-anchoring (a 00:10 run IS today's run; its 870-minute drift still surfaces).
- DG-083 contract tests updated RED-first (`tests/contract/test_dg083_schedule_drift_red.py`):
  stale ok/failed/skipped cases, the wiring + route paths, the numbers-only-on-chain_report
  invariant; existing cases thread an explicit `now` matching their fixture dates.
- OpenAPI regenerated and diffed per the regen-trap law (always regenerate, never commit a stale
  working copy); committed ONLY if the schema actually changed — `basis` is untyped `str`, so the
  expected diff is zero.

**Depends on:** DG-083 (landed on trunk — the drift code is in main). **Rollback:** revert the one
commit; no config or schema movement.

---

## Build record — 2026-08-28 night, lane ClaudeFable5-DG085-20260828

**Branch `ticket/DG-085`, commit `a75c49f0`, pushed to origin.** Worktree `~/dg-wt/DG-085`
(base `ac8ac4a4`, carries DG-083 `b448ab49` and DG-084). 2 files, 151 insertions:
`app/api/routes/system_capture_health_models.py` + `tests/contract/test_dg083_schedule_drift_red.py`.

**What changed:** `evaluate_schedule_drift` and `_schedule_drift_from_report` gain a required
`now: datetime` (threaded from `inspect_capture_store`'s existing clock — evaluator stays pure,
route `_CLOCK` injection untouched). New `_report_recorded_date()` dates the report ONCE from the
newest tz-aware `started_at` anywhere in it (chain block + steps — midnight-spanning runs dated by
where they ended up; a skipped step's null stamp costs nothing). Recorded date ≠ today (config tz)
→ `basis="chain_report_stale:<date>"`, all three values null, for EVERY per-step outcome —
yesterday's failed/skipped step must not read as today's either. No parseable stamp anywhere →
per-step semantics stand rather than a guessed date. Invariant pinned: `chain_report` is the only
basis that ever carries numbers.

**TDD, staged RED watched:** (1) tests edited first → 18 failed on the missing `now` interface;
(2) signatures threaded, rule absent → exactly the 6 new stale tests failed BEHAVIORALLY —
`assert 'chain_report' == 'chain_report_stale:2026-08-27'`, the defect verbatim. Then green.

**Cited runs (worktree):** `pytest tests/contract/test_dg083_schedule_drift_red.py -q` → 38 passed;
targeted neighbors (capture-health t1-t4, system_health t1-t4, tier_readiness t1-t5, dg044, dg045,
dg049, openapi drift contract, both registration reds) → **351 passed, 0 failed**. OpenAPI per the
regen-trap law: `npm --prefix frontend run openapi-gen` then `git status --porcelain frontend/` →
EMPTY — regen byte-identical, schema genuinely unchanged (`basis` is untyped `str`), nothing
committed there. Ruff CI-pinned `uvx --python .venv/bin/python3.14 ruff@0.15.12 check` on both
files → "All checks passed!"; pre-commit ruff passed at commit.

**Not run:** dg-land.sh (coordinating session lands); full suite (land gate's business).
