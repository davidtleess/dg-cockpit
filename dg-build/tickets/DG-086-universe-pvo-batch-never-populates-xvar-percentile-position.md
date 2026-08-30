# DG-086 — The PVO batch never populates xvar_percentile_position: the one computer of dvs_pct has zero callers

**Layer:** 3  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG086-20260829  ·  **DG 3.0**  ·  **Tier 0**
**Source:** upstream defect found during DG-084 (recorded in that build's step-3 dvs_pct decision);
filed 2026-08-28. **Unclaimed — do not build without a lane.**

**Problem:** `src/dynasty_genius/universe_pvo_batch.py:99` fills the runtime artifact's
`valuation.xvar_percentile_position` from `pvo.get("dvs_pct")` — and that key is None on every PVO
that ever reaches it, so the field is null for ALL 468 scored rows. The chain: the batch script
(`scripts/build_universe_pvo_batch.py:239` `_active_pvos_from_engine_b` → `assemble_pvo(...)` →
`pvos.append(pvo.model_dump())` at :324) dumps PVOs whose `dvs_pct` is still the model default
(`player_value_object.py:94`, `Optional[float] = None`) because `assemble_pvo` never sets it —
and the ONE thing that does, `scripts/compute_dvs_pct_batch.py::compute_dvs_pct_batch` ("Set
dvs_pct and dvs_pct_as_of on each ACTIVE_B PVO in-place", the within-position percentile), has
ZERO callers anywhere in scripts/ or src/. It was built and never wired. Contrast the OVERALL
percentile: `_apply_xvar_percentile_overall` (universe_pvo_batch.py:111) is computed in-batch and
reaches all 468 — which is exactly why overall is populated and position is not.

**How we know:** `grep -rn compute_dvs_pct_batch scripts/ src/` → no caller outside its own file;
`grep -n dvs_pct src/dynasty_genius/pvo_assembler.py` → zero matches; measured live read-only
2026-08-28 on `app/data/valuation_runtime/universe_pvo_runtime.json` → 12,226 rows, 468 scored
(`valuation.xvar` non-null), `xvar_percentile_position` non-null for **0**,
`xvar_percentile_overall` non-null for **468**.

**Why it matters — this BLOCKS real dvs_pct recording:** DG-084's driver fix deliberately maps the
forward-capture store's `dvs_pct` column from `valuation["xvar_percentile_position"]`
(`model_forward_capture_driver.py:96`, decision stated in its docstring at :85-87), so even with
DG-084 landed the archive's `dvs_pct` column keeps recording NULL every day until this producer
defect is fixed. The within-position percentile — DVS vs the player's OWN position population —
never reaches the artifact, the archive, or any surface.

**Done looks like (for whoever claims it — approaches to weigh, not a prescription):**
- Either wire `compute_dvs_pct_batch` over the assembled ACTIVE_B PVOs in
  `_active_pvos_from_engine_b` before `model_dump`, or compute the within-position percentile
  in-batch next to `_apply_xvar_percentile_overall` — one authority, not two; present the
  tradeoff (the standalone script also stamps `dvs_pct_as_of`, the in-batch twin would not).
- After one `run_pvo_refresh`: `xvar_percentile_position` non-null for the scored population in
  `universe_pvo_runtime.json`, and the forward-capture store's `dvs_pct` column non-null for that
  capture date (`count(dvs_pct) >= 400` where every prior date shows 0).
- Morning-after fabrication check mirrors DG-084's: the `None → real` transition must emit ZERO
  `dvs_pct_delta` moves — the PT-1 guard at `daily_diff.py:371` already computes the delta only
  when BOTH sides are non-None, and DG-084's `TestSr14NoneCoercionGuard` pins it, so landing this
  should NOT flood the Morning Room; verify, don't assume.

**Depends on:** DG-084 (landed — the driver now reads the right field). **Rollback:** revert the
one producer commit; one more null day costs less than a fabricated tape (SR-14's own ruling).

---
**LANDED 2026-08-29 (merge `c7409cab` on main, trunk pulled 10:16).** David's panel ruling: "Wire
the existing calculator" — compute_dvs_pct_batch is the one authority; no twin. TDD (RED proven:
dvs_pct None on every dump), 6-lens adversarial panel pre-land. Key facts:
- **Acceptance CORRECTED: the honest number is 388, not the ticket's >=400.** Live scored
  population = 388 ACTIVE_B with non-null DVS (QB 37 / RB 99 / WR 163 / TE 89) + 80 ENGINE_A
  prospects that stay NULL by spec 5.14 ("computed only against active Engine B players").
  Tomorrow's store count(dvs_pct) ~= 388 is PASS, not defect.
- Panel BLOCKING fix folded in: frontend percent() multiplied by 100 (artifact is 0-100) —
  tomorrow's card would have read "7780%" and inverted bottom players. Fixed + fixture pinned.
- dvs_pct_as_of (wall-clock) deliberately NEVER enters the artifact — capture vintage excludes
  only top-level volatile keys; a stamp inside a row would mint a new semantic_output_hash per
  rerun. Pinned by recursive-key test. Determinism proven: two runs, different hash seeds,
  identical semantic_output_hash.
- Coverage observability added (populated/reference counts + dg086 exit criterion) so a silent
  regression to all-NULL is visible — the 06-24->08-28 defect went unnoticed for lack of this.
- Ride-along repair: DailyWhatChanged capture-health fixture lacked DG-083's required
  schedule_drift block — the FRONTEND suite was red on main since 08-28 (dg-land gates pytest
  only, vitest invisible). Frontend now 307/307; backend 6472/0.
- **FOR DAVID (tie honesty, needs his ruling, not a defect):** the spec's rank formula splits
  ties — 11 TEs at identical DVS 100.0 spread percentiles 88.6..100.0 (64 players sit in tie
  groups today). Tie-pooling would change the ratified phase15 formula — his call. Presented at
  the 08-29 sitting.
- Silent v1-fallback observability (panel major): a silent Engine B v2 load failure would
  reproduce the all-NULL state with EXPERIMENTAL grades and the new criterion would NOT catch it
  (reference collapses too) — follow-up candidate filed as a board note, post-freeze shaped.
- Live proof expected TODAY ~11:30: the standalone pvo retry publishes the runtime artifact with
  388 real percentiles (capture stage then refuses, already captured — benign).
