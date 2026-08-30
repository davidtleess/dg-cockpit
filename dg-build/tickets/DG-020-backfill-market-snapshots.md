# DG-020 — Get more than four market snapshots

**Layer:** 1  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-31737  ·  **DG 3.0**
**Source:** crew lane horse race, 2026-08-18 — named as the binding constraint

**Problem:** Four annual snapshots yield exactly two training cohorts. Every market-edge result is
therefore fragile by construction, no matter how good the modelling is. **This is a data ceiling, not
a modelling ceiling.**

**How we know:** `app/data/fc_snapshots.db` holds four annual dates — 2021-09-08, 2022-09-08,
2023-09-08, 2024-09-08. The loader that produced them is general and already approved; it was simply
never asked for more dates.

**Done looks like:** monthly or finer point-in-time market history across the same span, so the edge
work has cohorts to replicate on.

**Depends on:** nothing technical.

---

**Notes**
Stamped layer 1, not 3, though it surfaced from modelling work. Acquiring more history is ingestion.
It is also the cheapest high-leverage item on this board: no new science, no new provider, just
asking an approved loader for more dates.

Separately: `fc_snapshots.db` last advanced **2026-06-24** — 55 days ago.

---

**Build notes — 2026-08-28, lane claude-DG020-worker (worktree ~/dg-wt/DG-020, branch ticket/DG-020, commit 6e3dc76a, pushed)**

*What the FantasyCalc API actually serves (measured first, as ruled):* `GET
api.fantasycalc.com/trades/historical/{fcId}?isDynasty=true&numQbs=2` returns per-player DAILY
value history — gap-free, global window start **2025-07-01**, nothing earlier on any FC endpoint
(candidate historical endpoints 404; the real ones were read out of fantasycalc.com's own JS
bundle, chunk-RQX7KW4K.js). So the FC API cannot reach 2021→2025-06; that span belongs to the
already-approved DynastyProcess archive loader (`scripts/load_dynastyprocess_archive.py`), which
produced the original four annual dates and was simply never asked for more.

*What was built (TDD, RED watched first; 41 targeted tests green; ruff clean):*
- `load_dynastyprocess_archive.py` + `monthly_targets` / `monthly_commit_targets` and a
  `--monthly-from/--monthly-to [--monthly-mode commit|calendar]` CLI. Default grid targets each
  month's FIRST real values.csv commit date → every loaded date is delta-0 point-in-time (a
  calendar first-of-month grid provably misses 2021-01).
- NEW `scripts/backfill_fc_history.py` — writes the FC daily series under
  `source='fc_history_api'` (never `fc_native`), ranks/trend NULL per dp_archive precedent (no
  survivor-biased fabricated ranks), skips any date the store already holds (idempotent, no
  immutability conflicts), excludes the current UTC day (the forward capture owns it). Disclosed
  limit: universe = today's /values/current (474 players), so players who left FC's rankings
  before today contribute no history.

*Runs (into the worktree's REAL copy of the DB — trunk store untouched, hash verified):*
- dp monthly 2021-01→2025-06: **54/54 targets loaded, 29,631 rows, all delta 0.** 2021-01-31
  wrote 0 rows honestly — all 564 rows unmapped (era db_playerids.csv had no fp→sleeper
  crosswalk yet), so dp monthly coverage effectively starts **2021-02-05**.
- FC daily 2025-07-01→2026-08-27: **413 dates, 195,762 rows, 474/474 players,** the 10 existing
  fc_native June dates skipped whole.

*Store after (sqlite, integrity_check ok, one league hash e27351d720e9fcf0):* **480 distinct
dates, 231,837 rows** — dp_archive 57 dates 2021-02-05→2025-06-06 · fc_history_api 413 dates
2025-07-01→2026-08-27 · fc_native 10 dates. Was: 14 dates, 6,790 rows.

*For land:* install `~/dg-wt/DG-020/app/data/fc_snapshots.db` (43 MB) over the trunk store.
The four original annual cohort dates are byte-preserved (append-only path; skip-if-present).

**INSTALLED 2026-08-28 10:31 ET:** backfilled DB copied to trunk `app/data/fc_snapshots.db`
(sha256 ad17d82d… byte-identical to the reviewed copy; integrity_check ok; 480 distinct dates —
dp_archive 57 / fc_history_api 413 / fc_native 10; original annual + fc_native rows verified
byte-identical pre-install). Same day's 14:15Z GCS backup carries it off-machine. The 10:30
alert fired pure-heartbeat before the install; no producer window was crossed.
