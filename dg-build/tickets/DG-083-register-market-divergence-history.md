# DG-083 — SR-10a: register market_divergence_history — surface the schedule drift SR-09 records

**Layer:** 1  ·  **State:** doing  ·  **Lane:** ClaudeFable5-DG083-20260828  ·  **DG 3.0**  ·  **Tier 0**
**Source:** season sprint SR-10a (`docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:956-1021`),
pulled forward to D6 on David's 2026-08-28 word.

**Problem:** SR-10a's alerting hole is already closed — but its step 3 is not built. A capture that
lands hours after its slot is reported as simply present: the capture-health surface has no
schedule-drift field, so the present-but-degraded state SR-09 now records per step
(`daily_chain_latest_report.json` — per-step `started_at` + `target`) never reaches the surface
that answers "can I trust the timeline". The spec is explicit that the market store keeps its
09:40 target while the chain runs at 09:00 precisely so this field makes the difference visible
(spec:993).

**How we know:** `grep -n "drift" app/api/routes/system_capture_health_models.py
app/api/routes/system_capture_health.py` → zero matches (2026-08-28); the chain report carries
`drift_minutes`/`started_at`/`target` per step (read `app/data/ops/daily_chain_latest_report.json`,
2026-08-27 17:19 run).

**Already landed — measured, not assumed (do not rebuild):**
- Step 1 (config block) + step 2 (season-window annotation) + step 5 (version bump): DG-044 commit
  `907495c5`, config_version 2, `market_divergence_history` registered with its 4 missing dates —
  `git log -S '"store_id": "market_divergence_history"' -- app/config/capture_cadence.json` and
  the live config file both say so; DG-044's acceptance record verified `('market_divergence_history', 4)`
  on the endpoint 2026-08-26.
- Step 4 (freshness off store contents, never markers): the analyzer reads the SQLite table itself;
  the event-stream markers are DG-049/SR-10b's attestation design, not this ticket's business.
- Backup: `app/config/backup_manifest.json:5` already carries `market_divergence_history.db`.
- The spec's D1 dirty-files blocker is resolved: `git status --porcelain` on all four named paths →
  clean (2026-08-28); DG-044/DG-045/DG-049 all landed.

**Scope = spec step 3 (the only unbuilt piece):** a schedule-drift block per store on the
capture-health surface — the delta between the capture's recorded start (the chain report step's
`started_at`) and the store's own `scheduled_time_local`. Descriptive only: drift + an
`exceeds_grace` boolean judged by the store's existing `grace_hours`; store_status and the SR-11
alert lines deliberately unchanged (same reasoning as the landed step-2 comment — no warn/alert
behavior change on live stores days before kickoff). Mapping store → producing chain step is an
optional additive `chain_step` config field (fc → run_fc_forward_capture; model → run_pvo_refresh,
which carries `--capture-db-path model_forward_capture.db`; market → run_market_divergence_refresh),
config_version 2 → 3. A store or surface without the wiring says why (`basis`), never guesses.

**Done looks like:**
- `curl -s localhost:8000/api/system/capture-health` → every store carries a `schedule_drift`
  block: `target_local`, `chain_step`, `recorded_start`, `drift_minutes`, `exceeds_grace`, `basis`;
  the market store's number is measured against 09:40, not the chain's 09:00.
- An absent/malformed report, a failed/skipped step, or an unwired store yields a null drift with
  a named basis — never a fabricated number, never a 503 (fail-closed stays reserved for the
  endpoint's own config).
- Past-midnight catch-up runs mirror the chain runner's own rule (drift < -120 → yesterday's
  target), so SR-09's recorded number and this surface can never disagree about the same run.
- Spec verification block (spec:1004-1018) still passes: loader accepts the real config, the four
  t1-t4 contract files green, gap-alert dry run still names market_divergence_history + 2026-08-12.

**Depends on:** nothing open (SR-09/DG-045 landed 08-27). **Rollback:** revert the one commit;
`chain_step` is optional so config and model roll back independently.

---

**BUILD RECORD 2026-08-28 morning — green, pushed, awaiting serial land.** TDD: 30-test red file
written first, watched RED (23 failed / 7 vacuous passes from `extra=forbid` rejecting the unknown
field — behavior-bearing tests all red), then built green. Branch `ticket/DG-083`, commit
`be0d565d`, pushed to origin. 9 files: models (+`StoreScheduleDrift`, `chain_step` field +
fail-closed loader check, `evaluate_schedule_drift` pure + disk wrapper, drift attached on EVERY
`inspect_capture_store` path incl. absent/unreadable stores), route (`_CHAIN_REPORT_RELPATH`,
cross-contract-tested against `run_daily_chain.default_report_path`), config v3 (three `chain_step`
wirings), t1 shape-lock pin updated for the new required block, red test file, and the OpenAPI
regen — `npm --prefix frontend run openapi-gen`, diff verified ADDITIVE per the regen-trap law
(`git diff --numstat frontend/openapi.json` → `72 0`; gen.ts +45/0, zod +27/0, index.ts one added
export, zero staleness dragged in).

**Cited runs (worktree):** targeted suite
`pytest test_dg083… t1 t2 t3 t4 openapi_drift daily_what_changed dg044 dg049 dg045 system_health_t*
tier_readiness_t*` → **315 passed, 0 failed**; ruff 0.15.12 (CI-pinned rev, via
`uvx --python …/.venv/bin/python3.14` — migrated Intel uv python is dead on the M5) → clean.
Spec verification block: config print → `3 [fc, model, market] [run_fc_forward_capture,
run_pvo_refresh, run_market_divergence_refresh]`; in-process TestClient (DG-044's accepted
curl-equivalent) → `('market_divergence_history', 4)` + a `schedule_drift` block on every store;
`run_capture_gap_alert.py --dry-run` (writes nothing by contract) → names
`market_divergence_history: missing … 2026-07-10, 2026-07-12, 2026-07-17, 2026-08-12`.
**Live-data proof** against the trunk's real 08-27 17:18 catch-up report (read-only, 09:06 ET):
fc step failed → `chain_step_not_ok:failed`, no fabricated number; pvo ran 17:19 for the 09:45
target → `drift 454, exceeds_grace True`; market skipped → named. Exactly the honesty the field
exists for.

**Design decisions, for the record:** (1) drift is DESCRIPTIVE ONLY — no status flip, no new
caveat, no SR-11 line — pinned by `test_drift_never_flips_store_status`; same reasoning as the
landed step-2 season-window comment, and the alert repeats every non-benign caveat daily, which
the silence rule forbids for a transient late start. (2) `model_forward_capture` maps to
`run_pvo_refresh` because that step carries `--capture-db-path model_forward_capture.db` — it IS
the store's producer in the chain. (3) The -120 past-midnight floor is copied from
`run_daily_chain.py:198` so SR-09's recorded number and this surface can never disagree about the
same run. (4) The spec's own 11:42 example computes drift 122 with `exceeds_grace False` — inside
the store's 3h grace; the number reaches the surface, the judgment stays the config's.
