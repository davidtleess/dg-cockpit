# DG-035 — The capture chain silently does not run unless David is logged in

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** 2026-08-22 migration incident, measured live on the new MacBook Pro (M5 Pro). Scoped
as a ticket on David's instruction the same day: *"Scope it as a new ticket, decide after SR-11."*

**Problem:** every producer in the daily chain is a **LaunchAgent** (`gui/501`). LaunchAgents exist
only inside a logged-in GUI session. If the Mac is booted but nobody has logged in, the jobs are not
merely delayed — they do not exist, and launchd **does not replay** a `StartCalendarInterval` slot
that elapsed while the user was logged out. Nothing anywhere records that the slot was skipped.

On 2026-08-22 the machine booted at **09:04:39** and the console login landed at **10:48:52**.
Thirteen scheduled job slots fell inside that window and every one of them silently did not run,
including the 10:15 offsite backup — the product's disaster floor. The gap was found only because a
human went looking; no log, marker, exit code or health surface recorded it.

**How we know:** measured, not inferred.
- `sysctl -n kern.boottime` → `Sat Aug 22 09:04:39 2026`; `who` → `davidleess console Aug 22 10:48`.
- After login, `launchctl print gui/501/com.davidleess.dynasty-what-changed-report` (09:45 slot) and
  `...dynasty-backup-irreplaceable` (10:15 slot) both read `runs = 0`,
  `last exit code = (never exited)` — they never attempted.
- The clean control: `dynasty-model-pvo-refresh` holds **both** a missed 09:30 slot and a live 11:30
  slot. It first spawned at **11:30:00.467**. The elapsed 09:30 slot was never made up.
- macOS 26.5.1 (25F80). This is distinct from missed-while-**asleep**, which launchd does handle.

**Why the obvious fix does not fix it.** Restoring the 6:00 AM wake
(`pmset repeat wakeorpoweron`) was the first instinct and it is **not sufficient**: a scheduled wake
powers the machine on, it does **not** create a login session. Today the machine was awake and
running from 09:04 and the jobs still did not fire. The wake is worth restoring for the
sleep case; it does not address this one.

**Done looks like:** either (a) the season-critical producers no longer depend on a console login —
the standard route is **LaunchDaemons** (`/Library/LaunchDaemons`, root-owned, run from boot with no
session), which is a Tier 2 change to how every job is scheduled and overlaps SR-09's chain rewire;
or (b) the dependency is accepted deliberately and made **loud** — a boot-to-login gap that swallows
a slot must produce an alert, not silence. Option (b) is strictly cheaper and is the minimum bar.

**Depends on:** nothing. **Overlaps:** SR-09 (chain rewire) and SR-11 (the alert). SR-11 must be
able to report a job that *never attempted* — a class invisible to logs, markers and exit codes,
because a job that never spawned writes none of them. **This requirement was written into SR-11 on
2026-08-23 — see STATUS below.**

**STATUS 2026-08-23 — option (b) is SCOPED INTO SR-11. NOTHING IS BUILT.**
`docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md` was amended today (MIG-1). SR-11 gains a
**second detection channel that reads launchd directly and depends on no registry** —
`launchctl print gui/501/<label>` parsed for `runs` and `last exit code`, with the label list derived
from `ops/launchd/*.plist` rather than hand-kept. It covers the three classes no store, marker, log
or exit code can see, all three of which occurred on 08-22:
- **never attempted** — `runs = 0` / `last exit code = (never exited)` on a job whose slot has passed;
- **the penalty box** — in-memory only, lost at reboot, and the alert must say `bootout` + `bootstrap`
  rather than `kickstart`;
- **the boot-to-login gap itself** — `sysctl -n kern.boottime` against the console login from `who`,
  cross-referenced with the day's scheduled slots, stating plainly that launchd will not replay them.

SR-11 also gained a heartbeat, because at 10:30 the alert is itself a `StartCalendarInterval` job —
**on this exact failure the alert will not have fired either**, so it checks its own absence
retroactively. Cost 1.0d → 1.5d; sprint buffer 1.00d → 0.50d.

**Option (b) closes when SR-11 ships and names a `runs = 0` job in a dry run — not before.**

**✅ OPTION (b) CLOSED 2026-08-26.** SR-11 shipped as DG-044 (merge `b1b888be` on `main`), and the
close condition is met twice over: the review's live reproduction (a `--dry-run` against a scratch
repo-root naming the really-loaded, really-runs=0 label `com.davidleess.dynasty-what-changed-report`
as never attempted) and, permanently, in-suite —
`tests/contract/test_dg044_capture_gap_alert_red.py::TestDryRunNamesNeverAttempted`. The alert also
goes beyond this ticket's ask: an 08-22-shaped gap that swallows the alert's own 10:30 slot is
delivered by the first run after the gap, not lost. **This ticket stays open for option (a) only**
(LaunchDaemons migration — David's call, now that SR-11 has landed, per his 08-22 word).

**✅ OPTION (a) DECIDED 2026-08-26 ~12:40 — DEFERRED POST-SEASON, David's "go" on the batched
recommendation.** Moving the season-critical producers to **LaunchDaemons** stays the only route
that *removes* the login dependency instead of reporting on it, and it is deliberately NOT being
taken during the season: Tier 2 scope six working days before the 09-04 freeze, and SR-11's live
alert made the gap loud, which was the accepted minimum bar (option b). Costs accepted with eyes
open: a boot-to-login gap still swallows slots permanently (08-22 swallowed 13); the alert reports,
it cannot replay. **Standing caveat for whoever picks this up post-season:** the "producers need a
GUI session (keychain/user env)" premise argued in the deferral brief is UNVERIFIED — measure it
against the actual producer code before executing any migration. Also: any option-(a) branch must
use a FRESH name — `ticket/DG-035` is poisoned by the PR #160 collision. Ticket may CLOSE when
the post-season backlog records the migration as its own ticket.

---

**Notes**
Not a migration artifact. Migration made it visible by forcing a boot-and-login gap that a
normally-always-logged-in laptop rarely produces. The exposure is proportional to how often the
machine reboots without a prompt login — OS updates, crashes, power loss — none of which are rare
across a 17-week season, and all of which are silent today.

Related but separate, from the same incident: three jobs entered launchd's **penalty box** after
failing to spawn, and stayed there. Sticky, invisible, and `kickstart` does not clear it — only
`bootout` + `bootstrap`. Cleared 2026-08-22 on David's word and verified by an unattended 14:00
firing. That failure mode also writes nothing to disk: it lives only in launchd's in-memory state
and dies at reboot, taking the evidence with it.
