# DG-126 — a retrain and the scheduled scorer can interleave over five unlocked writes

**Layer:** 2  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-89438

**Problem:** Publishing a retrain replaces four model pickles and a manifest as five separate
writes with no lock, and `com.davidleess.dynasty-model-pvo-refresh` fires at 11:30 and 14:00 — so a
scorer can start mid-swap, score the whole universe from a half-replaced model set, and publish the
result as live serving state with a green receipt.

**How we know:** 2026-08-31. Installed plist `StartCalendarInterval` is a list of two slots
(11:30, 14:00), read directly. `grep -c "flock\|lockf\|LOCK\|\.lock" scripts/run_pvo_refresh.py`
→ **0**: no lock file, no flock, no advisory guard. Two writers are not prevented; they were never
contemplated. On the day it was avoided only because two lanes compared clocks — and both lanes were
reading a stale one, so the avoidance was luck as much as discipline.

**Not the manifest window.** `train_engine_b.write_manifest` became atomic the same day, so the
manifest can no longer be read truncated. The remaining hazard is the *set*: bundles and manifest
are not replaced atomically together.

**Done looks like:** with a sentinel present and fresh, `run_pvo_refresh` refuses and says why; with
no sentinel it behaves exactly as today; a crashed retrain cannot block the daily chain forever (the
sentinel is age-bounded); and the refusal is pinned by a test that fails if the guard is removed.

**Depends on:** a sentinel write inside `scripts/train_engine_b.py` — **Greg's file.** Contract:
write before the first bundle write, remove after the last, never fatal to the retrain.

---

**Notes**

David's ruling, 2026-08-31, verbatim: **"Build it."**

Use the house pattern rather than inventing one — the repo already answers this twice:
`backup_irreplaceable_data.py:54` → `app/data/ops/backup_run_active.json`, and
`backup_nflverse_vintages.py:52` → `nflverse_vintage_sync_active.json`, with
`run_capture_gap_alert.py:1073` already consuming one.

**Age-bound it.** A stale lock that silently stops the daily chain is a worse defect than the race
it prevents, and that is the reason this was deliberately NOT built at 11:00 on 08-31 with a
scheduled fire 30 minutes away.


---

**Acceptance, 2026-08-31 — consumer half LANDED via `dg-land.sh` (`d280530b` on main).**

    tests/test_model_publish_lock.py             8 passed
    tests/contract/test_pvo_refresh_runner.py   22 passed
    full suite in the isolated worktree       6585 passed, 32 skipped, 0 failed

Landed through the repaired gate: this is the FIRST ticket to use `dg-work.sh` /
`dg-land.sh` since Bob's `11021d9` fixed the share map, and the worktree resolved real
`engine_b_v2_qb/rb/wr/te` rather than falling open to v1 — verified before starting.

**PRODUCER HALF IS NOT THIS TICKET.** `train_engine_b.py` writes the sentinel before its
first bundle write and clears it after the last and on the failure path. David ruled that
file Greg's; the contract was sent and Greg is folding it in. **Until that lands this guard
is inert** — it can only refuse when something declares itself, and nothing declares itself
yet. That is stated here rather than left for a reader to discover.

**Open, deliberately out of scope:** advisory, not a lock. Stops the SCHEDULED scorer, which
is the observed hazard. Does not stop a hand-run scorer and does not make the five writes
atomic.
