# DG-070 — Build the §10.1 change-event stream over the rebased divergence — and backfill the season from the PIT store

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** direct  ·  **Size:** 2.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** No producer anywhere emits band_crossing, direction_reversal, lane_reconvergence, or lane_divergence as temporal events. The only code carrying two of those names is a one-shot old-vs-new methodology migration diagnostic inside the rebase module — a comparison of two computations on one day, not events over time. These events are the concrete when-to-look triggers: run against the 2027 rebuilt model they are exactly the shape of a number David acts on. Nothing is lost by building this post-freeze — market_divergence_history.db retains raw components (549,460 rows since 2026-07-09, per DG-046's verification), so the first honest run recomputes the whole season's events retroactively through the common-cohort method. Depends on DG-046 (events over the known-wrong delta are noise) and on the versioned-bands ticket (a crossing of an arbitrary band is not evidence).

**How we know:** src/dynasty_genius/market_divergence_rebase.py:135-144, 208-222 (migration diagnostic, not a temporal producer); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:508-522 (event list); app/data/market_divergence_history.db + tickets/DG-046-divergence-rebase-built-but-dark.md:15-19 (recomputability)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
