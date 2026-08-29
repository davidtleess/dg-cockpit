# DG-082 — The catch-up guard's own timer dozes off: launchd pends StartInterval during idle

**Layer:** 1  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-20944  ·  **DG 3.0**  ·  **Tier 0**
**Source:** D5 sitting observation 2026-08-27 (DG-045 ticket, GUARD BACKFILL OBSERVED section);
ruled into the day by David 2026-08-28 ("Fix the safety net's alarm", remote decision panel).

**Problem:** the catch-up guard (DG-045-era `com.davidleess.dynasty-catchup-guard`, the backstop
that re-kicks captures the machine slept through or launchd dropped) is scheduled by
`StartInterval 900`. launchd defers interval spawns while the machine idles — the job sits at
`pended nondemand spawn = interval` indefinitely. Observed twice in 24h:
16:12→17:18 on 08-27 (66 min; cleared only by a manual `launchctl kickstart`), then
17:18 (08-27) → 08:25+ (08-28), 15 hours, `runs = 21` frozen across the whole idle night.
During long idle — exactly the away-days the guard exists for — the guard effectively does not
run. **Distinct from the migration-era penalty box** (that follows FAILED spawns, resists
kickstart, needs bootout+bootstrap; this follows successful runs and kickstart clears it).

**How we know:** `launchctl print` outputs recorded in DG-045's ticket and the guard memory;
`catchup_guard_status_latest.json` `generated_at` gaps line up with the idle windows.

**Evidence for the fix:** `StartCalendarInterval` fires reliably through the same idle — the
morning of 08-28 (display asleep, machine idle 15+ hours, David away): 06:15 nflverse, 06:30
league-transaction, 06:45 ff-playerids all fired on the dot.

**Done looks like (AS BUILT — design evolved during the build, three findings):**
- **HYBRID schedule, not calendar-only:** a slept-through calendar slot is never replayed
  (measured 08-27), but an overdue `StartInterval` DOES fire on wake-from-sleep — so the plist
  keeps `StartInterval 900` (wake recovery + active-use cadence) AND gains a 15-minute
  `StartCalendarInterval` lattice at :02/:17/:32/:47 every hour (96 entries — the idle rescue),
  `RunAtLoad` kept (login catch-up recovered the whole 08-27 morning).
- **Hours EXPLICIT in every lattice entry:** `derive_job_schedules` reads a missing `Hour` as 0
  — a Minute-only entry (launchd's "every hour" form) would derive as a phantom midnight slot.
- **Alert class (h) aggregates per label (`_gap_lines_for_hits`):** it emitted one line per
  slot; 96 guard slots would have turned one overnight reboot into ~dozens of GAP lines at
  10:30. Now one label = one line ("N slots (first–last) fell between boot…"); a single-hit
  label keeps the classic exact line byte-for-byte.
- Contract file `tests/contract/test_dg082_catchup_guard_ops_scheduler.py` pins the lattice,
  the kept interval, explicit hours, args/paths, plutil lint, and the config reason;
  aggregation test added to `test_dg044_capture_gap_alert_red.py` (watched RED first).
- `app/config/catchup_guard.json` guard reason updated (stays unguarded — self-guarding is
  circular; names the hybrid and the kickstart remedy).
- Swap = bootout + bootstrap of the one label; verify `launchctl print` shows the calendar
  streams and a fresh status write within ~20 min.

**Depends on:** nothing open. **Rollback:** pre-change plist in git history; bootout+bootstrap
the prior version.
