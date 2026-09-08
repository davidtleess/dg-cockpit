---
name: project_dg185_market_ranks_2026-09-07
description: DG-185 us-vs-market rank API BUILT 09-07 in ~/dg-wt/DG-185 (not landed); the h2/h5 decoy board and four other source traps that pass every count check
metadata: 
  node_type: memory
  type: project
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-07T12:00:24.444Z
---

**DG-185 — David's "us v what we think our competitors value a player at" (approved 09-07 11:15:18Z) — BUILT, GREEN,
NOT LANDED.** Worktree `~/dg-wt/DG-185` on `ticket/DG-185` from `8960e0ec` + root's DG-180 baseline overlay.
`GET /api/research/market-ranks` (`src/dynasty_genius/ranking/market_ranks.py`, `app/api/routes/research_market_ranks.py`,
ONE `app/main.py` line, 61 tests). Handoff `/private/tmp/dg185-handoff.md`, status `/private/tmp/dg185-status.md`.
Serves: our rank · market rank (FantasyCalc proxy) · direction, over the 388 players both cover, from three
sha256-bound frozen files. Real answers: McCarthy 83rd vs market 193rd–194th (≥110 higher); Kraft 135th vs 67th
(68 lower); only Josh Allen and Oronde Gadsden read "same".

**Why:** five source traps here pass every count and internal-consistency check, so they cannot be caught by
"does it look right". They are not written anywhere in the repo.
1. ⛔ **`comparable_board` (h2) and `horizon_board` (h5) are schema-identical** — same 825 ids, same 27 roster, same
   274 league_rostered, same 60 top, same `readiness` census, and `value == Σ advantage` holds on BOTH. Reading the
   wrong one changes **384 of 388 ranks** with zero symptoms. Resolve via `report.comparable_views["h5"]` (a STRING
   naming a top-level key) and assert `horizons_summed == 5`. `readiness`/`evidence_verified`/`estimate_class` are
   constant on both boards, so asserting them is row validation and proves NOTHING about which board was read.
2. ⛔ **`report["davids_roster"]` (top level) is a decoy** — same 27 ids, but its `value` is a posture-keyed dict
   including a literal `'…|h5'` key, in MIXED units (`ppg_above_replacement` on 22 rows, season points on 5). The
   real one is `report["horizon_board"]["davids_roster"]`. Also `report["coverage"]["davids_roster"].readiness` says
   `comparable: 0` for all 27 — it describes the LEGACY pipeline; a gate wired to it fails closed on good data.
3. ⛔ **FantasyCalc's `overall_rank` is NOT recomputable.** It is a dense 1..399 over players, but 65 players sit in
   32 exact-value ties that FC breaks in an order not derivable from the data. Re-enumerating matches 367 of 399 and
   silently mis-ranks 32. Read the raw field. PICK rows carry ranks from a third denominator and 20 collide with
   player ranks — filter `position` before touching it.
4. The 159 common players tied at exactly 0.0 share our_rank 230–388, whose end IS the population size, so
   **"we rank him higher" is structurally unreachable for them**. That property is the best available guard: an
   elementwise or midpoint gap bug introduces "higher" there (verified by mutation — 159 and 186 rows change).
5. Four zero-value players ARE their position's replacement bar (Flacco, Hunt, Parkinson, Mims — `reference_player`
   equals their own `name`): zero means *exactly replacement*, not worthless. And the league snapshot's `starters`
   array holds `"0"` placeholders that are not players (the DG-145 phantom again).

**How to apply:** the market export's per-row `payload_hash` and aggregate `store_hash` re-derive exactly
(sha256 of `json.dumps` over 9 content fields, `sort_keys=True, default=str`), and `settings_hash` is the hash of the
capture's own query string — deriving it catches a settings block edited over rows captured under other parameters.
Adding any route breaks **TWO** byte-exact OpenAPI snapshot tests, not one (`test_openapi_drift_contract.py` and
`test_daily_what_changed_api.py`). Related: [[project_dg182_roster_comparison_2026-09-07]],
[[feedback_the_failure_path_returns_the_success_signal]], [[feedback_a_test_carrying_its_own_copy_is_an_antitest]].
