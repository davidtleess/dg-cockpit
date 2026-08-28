---
name: reference-sleep-catchup-guard
description: macOS drops launchd calendar runs slept through; the catchup guard (built 2026-08-27) re-kicks missed dynasty jobs from their receipt artifacts
metadata: 
  node_type: memory
  type: reference
  originSessionId: 106de00d-46e9-4739-8777-f4eb2b0ea634
  modified: 2026-08-27T21:19:36.395Z
---

**Measured 2026-08-27:** macOS does NOT run a `StartCalendarInterval` occurrence the machine
sleeps through — on wake, launchd registers the *next* occurrence (the 06:15 nflverse capture
skipped straight to 08-28). A repeating `pmset` wake at 6:00 already existed and was
insufficient: the Mac idles back to sleep before 6:15. **✅ Wake moved to 06:13 — David ran
`sudo pmset repeat wakeorpoweron MTWRFSU 06:13:00` himself in Terminal 2026-08-27 (sudo needs a
real TTY; Claude Code's `!` shell can't prompt) and `pmset -g sched` verified `wakepoweron at
6:13AM every day`.** Verify ONLY via `pmset -g sched`, see [[machine-macbook-pro-m5-migration]].
Also measured 2026-08-27: the AC power profile has `sleep 0` — on AC with lid open the machine
never idle-sleeps, so the 6:13 wake is the backstop for the battery/power-loss case only
(battery profile sleeps after 45 min).

**The catchup guard** (David-approved 2026-08-27, whole morning chain): every 15 min while
awake, kicks any of the 13 dynasty jobs whose occurrence passed today with no run attempt in
its receipt artifact — the same embedded-timestamp status files the freshness system reads,
never mtime (except pvo_refresh, which declares no timestamp field). One kick per occurrence
per day; failed runs count as attempted (retries are the health system's job, not the guard's).
Kicks serialize in schedule order, waiting for each job to exit.

**COMMITTED `ec7281d9` on main 2026-08-27** (amended from e2168fe3 pre-push to fold in the last simplification cleanup) after a three-round adversarial review (15 verified
findings fixed; final pass clean; 107 tests). Key design outcomes of that review: the schedule
DERIVES from the ops/launchd plists via `src/dynasty_genius/launchd_schedules.py`
(`derive_job_schedules`, hoisted from the gap-alert — never a hand-kept list; the first hand-kept
config lost `Weekday=2` on three Tuesday-only jobs and would have run them 7x/week); weekly slots
get a 7-day lookback (daily: yesterday+today); failed kicks are surfaced + retried, never marked
served; one fresh run serves all occurrences it covers (receipts re-read between kicks).
The gap-alert's pmset check now accepts a 6:00–6:14 wake (for the 6:13 move).

Pieces (all in `~/dynasty-genius-product`): `src/dynasty_genius/catchup_guard.py` +
`launchd_schedules.py`, `scripts/run_catchup_guard.py` (`--dry-run` plans only),
`app/config/catchup_guard.json` (v2: receipts + unguarded-with-reason — **ff-playerids-snapshot
is in ops/launchd but NOT installed in launchd; David to decide install-or-retire**),
`ops/launchd/com.davidleess.dynasty-catchup-guard.plist` (StartInterval 900 + RunAtLoad),
symlinked into `~/Library/LaunchAgents`. Its receipts: `app/data/ops/catchup_guard_status_latest.json`
+ `catchup_guard_state.json`.

Proven live on day one: recovered the slept-through 06:30 transaction capture at 07:01, and the
weekly window recovered roster-capacity-audit's missed Tuesday slot — a weekly job that had NEVER
successfully run on this machine (its ops receipt written for the first time 08-27 07:42).

**⚠ The guard's own scheduler can stall (observed 2026-08-27 ~16:12–17:20):** launchd left the
guard's next StartInterval run as `pended nondemand spawn = interval` for 66+ minutes while the
machine sat idle (display asleep) — runs counter stuck, exit 0, no penalty box. `launchctl
kickstart gui/501/com.davidleess.dynasty-catchup-guard` cleared it INSTANTLY (unlike the
migration memory's true penalty box — `properties = penalty box` after FAILED spawns — which
kickstart cannot clear and needs bootout+bootstrap). Consequence: during long-idle stretches the
guard may tick far less often than every 15 min; it still catches up when it runs, but "within
15 minutes" is not a promise. Candidate hardening for the lane: `ProcessType=Interactive` in the
guard plist — David's call.

**DG-045 world (config changed by land `4048f25a`, 08-27 afternoon):** the guard now covers
**dynasty-daily-chain** (receipt `app/data/ops/daily_chain_latest_report.json`, timestamp_fields
[] → mtime, its timestamps are nested under "chain") and **dynasty-ff-playerids-snapshot**
(receipt `app/data/ops/ff_playerids_snapshot_status_latest.json`, `finished_at`) — promoted from
unguarded when its plist was installed at the D5 sitting. The four retired producers
(fc-snapshot, feature-refresh, league-capture, what-changed-report) left the config — the
contract rejects entries for unscheduled labels; the chain carries them now. 12 dynasty labels
loaded post-sitting (11 + the guard).
