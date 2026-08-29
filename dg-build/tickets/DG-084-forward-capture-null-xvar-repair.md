# DG-084 — Forward-capture archive recorded NULL xVAR for all 57 days; the fix must not fabricate 468 moves

**Layer:** 1  ·  **State:** doing  ·  **Lane:** ClaudeFable5-DG084-20260828  ·  **DG 3.0**  ·  **Tier 0**
**Source:** season sprint SR-14 (SEASON-BUILD-SPEC lines 1059-1133, including the PT-1 amendment —
David's 2026-08-20 "GUARD BOTH FIELDS" ruling); pulled forward to D6 on David's 2026-08-28 word.

**Problem:** `model_forward_capture_driver.py:507-508` reads `dvs_pct`/`xvar` from the PVO **root**,
but the producer emits both inside `row["valuation"]` — so the archive that exists to answer
"what did the model say then" has stored NULL xVAR on every one of its 57 capture dates
(2026-06-24 … 2026-08-20; 707,941 rows, `count(xvar) = 0`). The suite stayed green because the
fixture at `test_model_forward_capture_driver.py:76-77` mirrors the bug. And the fix is a trap:
the morning it lands, `daily_diff.py` (lines 353/354 through `_float`'s `None → 0.0` coercion)
would fabricate ~468 model moves that never happened — real xVAR minus yesterday's coerced `0.0`
— defeating the zero-delta skip at line 355 and flooding the Morning Room. SR-09's soak
structurally cannot catch it.

**How we know:** `select count(xvar), count(dvs_pct), count(dynasty_value_score), count(*) from
model_forward_capture_raw → (0, 0, 27021, 707941)` across 57 capture dates (measured in the spec;
re-verified read-only in this lane — see build record).

**Done looks like:**
- Driver maps `xvar` from `valuation.get("xvar")`; the `dvs_pct` nesting is fixed with the choice
  stated explicitly (spec step 3 demands a deliberate, named decision).
- **THE GUARD, both fields (PT-1):** `daily_diff.py` computes `dvs_pct_delta` (353) and
  `xvar_delta` (354) only when both sides are non-`None`, else `0.0`; `_float` itself untouched
  (other callers at 350-352, 365 rely on `None → 0.0`); emitted types unchanged (no schema/OpenAPI
  regen).
- Fixture fixed to nest `dvs_pct`/`xvar` under `valuation`; one contract test maps a row of the
  REAL `universe_pvo_runtime.json` (skip if absent) so a fixture-only suite can never hide this
  again; one guard test in `test_daily_what_changed_report.py` where the `None → real` transition
  alone emits ZERO deltas, and a genuine DVS move still appears with `xvar_delta == 0.0`.
- **No backfill, no fabrication:** the 57 lost days stay NULL — NULL is the honest mark. The 468
  existing moves are never invented into history.
- Post-land ops (not this lane's to run — writes to the shared capture DB): run_pvo_refresh, then
  today's `count(xvar) >= 400` where every prior date shows 0; **09-02 morning fabrication check**
  — `daily.model.deltas` must be a plausible real number, NOT ~468; if 468, revert the driver
  change that morning.

**Depends on:** nothing open. **Rollback:** revert the ticket branch; one more null day costs less
than a fabricated tape (spec's own ruling).

---

## Build record — 2026-08-28, lane ClaudeFable5-DG084-20260828

**Branch `ticket/DG-084`, commit `f6304c52`, pushed to origin.** Worktree `~/dg-wt/DG-084`.

**Baseline measured live (read-only, `mode=ro`):** the rot has GROWN past the spec's numbers —
`select count(xvar), count(dvs_pct), count(dynasty_value_score), count(*) from
model_forward_capture_raw → (0, 0, 31233, 817957)` across **64** capture dates,
2026-06-24 … 2026-08-27 (spec measured 57). Real runtime artifact re-verified: 12,226 players,
468 non-null `valuation.xvar`, root carries neither field, `xvar_percentile_position` non-null
for ZERO, `xvar_percentile_overall` for all 468 — matches spec step 1 exactly.

**What changed (4 files, 172 insertions):**
- `model_forward_capture_driver.py` — valuation-sourced entry slice extracted to
  `map_pvo_row_valuation_fields()`; `xvar` now from `valuation.get("xvar")`.
  **dvs_pct decision (step 3, stated):** maps to `valuation["xvar_percentile_position"]` — the
  field the producer populates from pvo `dvs_pct` at `universe_pvo_batch.py:99`; NULL for all 468
  today (upstream defect, out of scope, recorded in the docstring). Chosen over substituting
  `xvar_percentile_overall` under a name that means something else. **Not silent:** the column
  keeps recording NULL and the code says why.
- `daily_diff.py` — THE GUARD at **both** call sites (PT-1): `dvs_pct_delta` and `xvar_delta`
  computed only when both sides non-`None`, else `0.0` (no signal); `_float` untouched; emitted
  type stays `float` (no schema/OpenAPI/frontend regen).
- `test_model_forward_capture_driver.py` — fixture nests the fields under `valuation` mirroring
  the real artifact; store-level pin (joinable row `xvar == 18.5`, `dvs_pct == 97.0`); real-artifact
  tripwire test maps every scored row of `universe_pvo_runtime.json` (skip-if-absent per spec;
  `DG_PVO_RUNTIME_JSON` env override because worktrees materialise `valuation_runtime/` empty —
  land gate's trunk run finds the relative path).
- `test_daily_what_changed_report.py` — `TestSr14NoneCoercionGuard`: `None→real` xvar alone → zero
  deltas; genuine DVS move still surfaces with `xvar_delta == 0.0`; `None→real` dvs_pct alone →
  zero deltas (PT-1); real both-sides movement still counts.

**TDD, watched RED:** guard tests failed 3-of-4 against today's code (fabricated
`dvs_pct_delta: 41.0` from a `None` prior — the spec's required failing case failed); real-artifact
test RED in two stages — ImportError, then, with the builder extracted but still reading the root,
`assert None == -48.54` against the real artifact (the 57-day bug reproduced live). Then green:
`pytest tests/contract/test_model_forward_capture_driver.py tests/contract/test_daily_what_changed_report.py -q`
→ **28 passed** with the real artifact (env override), **27 passed / 1 skipped** without (graceful
skip verified). Neighbours exercising `daily_diff` (`test_daily_what_changed_diff_engine.py`,
`test_daily_what_changed_api.py`, `test_what_changed_report_cli.py`) → 22 passed. Ruff clean
(pre-commit hook passed at commit).

**Not run from this lane (writes to the shared capture DB — post-land ops):** the spec's
`run_pvo_refresh.py` live capture + same-day `count(xvar) >= 400` check, and the **09-02 morning
fabrication check** — `daily.model.deltas` must be a plausible real number; if ~468, revert the
driver change that morning. **No backfill happened:** nothing in this change writes to historical
rows; the 64 lost days stay NULL.
