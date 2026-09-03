# DG-133 — The 09:00 PVO refresh has failed every morning since 08-31: consumers select the inference partition by the wrong flag

**Layer:** 2 · **State:** landed — NOT LIVE · **Lane:** Davids-MacBook-Pro-32886 · **DG 3.0** · **backend / serving path · BLOCKS EVERY API RESTART**
**Source:** ledger 2026-09-01 §6 (Tower's measurements); diagnosed first by another lane 08-31.
Unowned until 2026-09-01 22:00; davidleess-a0 declined it, Tower took it — data freshness is the seat.

**Problem:** `run_pvo_refresh` exits 1 on `ValueError: engine_b_prediction_conflict`
(`scripts/build_universe_pvo_batch.py:285`) at 09:00:44 on 08-31, 09-01, and every refresh since.
Nothing landed since 08-31 reaches David's screen until the chain runs and the API is restarted,
and the restart must FOLLOW this fix (see hazard 3).

**Root cause:** four consumers define "the inference partition" as `training_eligible == False`.
That flag means "this row cannot train the production regression". Since `58d3b20c` (the attrition
fix, DG-125) a complete-window row whose player never returned is KEPT with `OUTCOME_COLUMN = NaN`
and therefore also `training_eligible == False`. The consumers now read seven seasons as inference.
Measured on the live runtime table:

    training_eligible == False   -> 1143 rows, seasons 2018..2023 + 2025, 29 duplicate player_ids
    feature_season == max        ->  505 rows, one season, 0 duplicates, 0 training rows

The assembler's own rule (`feature_assembly.inference_season_rule`, pinned by DG-029's contract
tests) says the inference season is the LATEST season in the window. The consumers never read it.

**The four readers:**
1. `scripts/build_universe_pvo_batch.py:190` `_load_engine_b_feature_rows` — dict keyed by
   player_id, so seven seasons collapse LAST-WINS silently; also feeds `availability.score_rows`.
2. `app/services/engine_b_service.py:224` `score_inference_partition` — one prediction per ROW,
   so 29 players get several.
3. `src/dynasty_genius/capture/model_forward_capture_driver.py:371` — the diary's utilization
   snapshot, dict keyed by player_id, last-wins.
4. `app/services/roster_auditor.py:636` — `{s["player_id"]: s for s in score_inference_partition()}`,
   a dict comprehension: a duplicated player silently keeps whichever prediction came last.

**Three hazards, each verified:**
1. **The guard that fires is a value-collision guard, not a partition guard.**
   `build_universe_pvo_batch.py:281-285` compares prediction VALUES; equal predictions are
   counted as duplicates and pass. It fired only because one player's 2018 and 2025 predictions
   differ. There is no assertion anywhere that the partition is one season, non-empty, one row
   per player.
2. **The regression fails ZERO tests.** Full suite green (6606 passed) against the exact runtime
   table that breaks production every morning.
3. **Restart ordering.** The API process (up since 08-31 08:18) answers from memory and never saw
   the widened partition. Restart it before this lands and reader 4 silently serves 2018
   predictions for the 29 duplicated players — no error, no log line.

**Do:**
- One selector, `src/dynasty_genius/features/inference_partition.py`, that applies the
  assembler's rule: partition = rows of `inference_season_rule(seasons present)`. It FAILS CLOSED
  (named ValueErrors) when the partition is empty, contains a `training_eligible` row, holds a
  duplicate `player_id`, or the frame has no `feature_season`. A pure-python twin with identical
  rules for the csv-module reader in (3).
- Route all four readers through it. Reader 4 additionally refuses a duplicate player_id at the
  dict instead of last-wins. Keep the value-collision guard in (1) as defense in depth; fix its
  comment so nobody mistakes it for the partition assertion again.
- Tests: reproduce the live shape (a washout row + an inference row for the same player) and
  show the old mask returns two rows while the selector returns one; each fail-closed path; a
  source-scan pin that no consumer selects on `training_eligible == False` any more; a live-
  artifact test (skips when `app/data` is absent) that the runtime table yields one season, zero
  duplicates; the roster auditor raises on a duplicate.

**Anti-scope:** no change to `feature_assembly.py` or the flag's meaning (DG-029/DG-125 contracts
stand); no CSV regeneration; no model change; no API restart from this ticket.

**Done:** the producer scores exactly the inference season on the live runtime table; a
partition that is not one-season/one-row-per-player fails with a NAMED error before any
prediction is made; suite green; landed on `main` BEFORE any API restart, sha recorded here.


## LANDED 2026-09-01 — `f8995d3d` on `main` (ticket commit `afacd798`)

**What was built.** `src/dynasty_genius/features/inference_partition.py` — one selector that reuses
the assembler's `inference_season_rule` (DG-029), verifies one row per player and no training row in
the inference season, and fails closed with bare machine tokens (`InferencePartitionError`, a
`ValueError` subclass, so every existing `except ValueError` still works). A pandas frame variant and a
pure-Python records twin (for the capture driver, which stays on the `csv` module) share one cell
normaliser, so `"2025.0"`/`2025.0` and `"0.0"`/`False` read identically — a contract test holds the
twins to it across the spellings each writer produces. All four readers call it:
`build_universe_pvo_batch._load_engine_b_feature_rows`, `EngineBService.score_inference_partition`,
`model_forward_capture_driver._load_prediction_time_utilization`, and `roster_auditor` (both
`run_audit_pvo` and `run_audit` — the last-write-wins dict comprehension is now
`_index_predictions_by_player`, which refuses a repeated id). `/engine-b/scores` and `/roster/audit`
answer a governed 503 carrying the token instead of a bare 500 (OpenAPI description unchanged; drift
test green; `frontend/openapi.json` not touched).

**Verified (commands run from `~/dg-wt/DG-133` before landing):**
- Live runtime table `app/data/features_runtime/engine_b_features_runtime.csv` AND the committed seed,
  read-only: old mask → 1,143 rows / 29 duplicate player_ids / seasons 2018..2023+2025; selector →
  505 rows / season 2025 only / 0 duplicates / 0 null ids / 0 training rows; frame and records twins
  return the same id set.
- Producer dry-run (`scripts/build_universe_pvo_batch.py --output-dir runs/... --run-id dg133-dryrun`,
  seed table because the worktree's `features_runtime/` is empty): exit 0, no
  `engine_b_prediction_conflict`, prediction_count 505, duplicates 0, ENGINE_B 503 / ENGINE_A 80 /
  PRE_MODEL 9,477 / INACTIVE 2,140 / UNRESOLVED_IDENTITY 1. Run dir deleted; nothing outside `runs/`
  written; `app/data/valuation/*_latest.json` mtimes untouched.
- Full suite in the worktree on the exact landed bytes: `6691 passed, 33 skipped`.
- Built by a workflow (implement → 3-lens adversarial review → fix): 16 findings, 0 blockers, 5 major
  (frame/records twin disagreement on float-spelled cells; null player_id read as a fake duplicate;
  no behavioural test for readers 1 and 3; capture driver raising a traceback instead of its abort
  report) — all fixed and re-tested.

**Anti-scope honoured:** no assembler change, no CSV regeneration, no model change, no API restart,
no `XVAR_LAMBDA_ENGINE_B` edit, no `frontend/openapi.json` edit.

**⚠ LANDED IS NOT LIVE.** Trunk `~/dynasty-genius-product` is still at `0def485d` and the API (pid
45263) has been up since 08-31 08:18. The order is fixed: trunk `git pull --ff-only` → API restart →
the next 09:00 chain is the real end-to-end proof (the dry-run used the seed table, not the runtime
one). Sequenced with davidleess-a0's chain work; do not restart the API before trunk carries this sha.
**Why that order, not just the order (a0, 2026-09-02):** restart-before-pull puts the running service on the
old flag mask; `app/services/roster_auditor.py:636` builds `engine_b_scores` with a last-wins dict
comprehension, so for the 29 duplicated players it would silently serve whichever prediction came last —
no error, no log line. **Neither lane holds David's word on the pull or the restart as of 09-02 05:45;
it is his production service and the decision is his.** Pull is verified clean by a0: trunk's three dirty
tracked files (`.mcp.json`, `docs/agent-ledger/2026-08-19.md`, `tests/test_aging_curves.py`) are untouched
by the four incoming commits, so `git pull --ff-only` needs no stash.

**Why `inference_season_rule → max(seasons)` is safe here (raised by a0 in review):** the objection was
that a bare `.max()` silently scores training rows if the inference season's rows are ever absent. The
selector answers it by construction: if 2025 rows were missing, `max` would pick 2024, every 2024 row is
`training_eligible`, and `_assert_one_row_per_player` (`inference_partition.py:187-193`) raises
`inference_partition_contains_training_rows` before anything is scored. Covered by
`test_a_training_row_in_the_latest_season_fails_closed` (`tests/contract/test_inference_partition_selector.py:161`).
Fred also measured the selector on the full 3,384-row table: 505 rows → 503 PVOs; the two orphans (Nick
Kallerup TE, Ke'Shawn Williams WR, 2025 UDFAs with no `sleeper_id`) are pre-existing, not a regression —
the live check after restart is 505 scores / 503 PVOs.

**Follow-ups filed here, not fixed (out of scope):**
- `_derived_training_cutoff` in the capture driver reads a `season` column the live CSV does not
  have, so the provenance-hash subset records null as "derived". Pre-existing. Needs its own ticket.
- The new 503 on the two routes is undocumented in `frontend/openapi.json` (off limits to this
  ticket); regenerate via `npm --prefix frontend run openapi-gen` in a ticket that owns it.
