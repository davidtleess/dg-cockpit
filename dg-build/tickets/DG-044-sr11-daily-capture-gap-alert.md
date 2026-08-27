# DG-044 — SR-11: the daily capture gap alert — the only detection channel that will exist

**Layer:** 1  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG044-20260826  ·  **DG 3.0**
**Source:** season sprint ticket SR-11, `docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:595-749`
(AMENDED 2026-08-23 — MIG-1), scheduled D4 = 2026-08-26. Filed as a DG ticket because the worktree
tooling requires one (`dg-work.sh:24,36`); **the spec section remains the authoritative build text —
this file is the claim ticket and the build-morning brief, not a restatement.** Tier 2 · NEVER-DROP
(spec:1542). Absorbs [[DG-035]] option (b).

**Problem:** nothing in this repo can notify David. Every observed failure has been silent — the
08-12 archive gap, prior-date aborts, refusing-to-publish exits, failed backups, and the 08-22
boot-to-login incident in which THIRTEEN scheduled slots (including the 10:15 offsite backup) never
attempted and no log, marker, exit code or health surface recorded it.

**How we know:** `grep -rE 'osascript|display notification|terminal-notifier|smtplib|sendmail'
scripts/ src/` → zero matches (spec:631). The 08-22 incident measurements are in DG-035 (boottime
09:04:39 vs console login 10:48:52; `runs = 0` / `last exit code = (never exited)` on the missed
jobs). Readiness re-audited 2026-08-25 evening from origin/main `2bf91d8d` — see Notes.

**Done looks like:** (spec:743-749) On a bad morning David gets a macOS notification naming the
store and the date before he opens anything; on a clean morning he gets nothing. On a morning when
a job never ran at all he is told which jobs, and that launchd will not replay them. NOT done while
`--dry-run` says anything at all about nflverse/contracts, and NOT done while a `runs = 0` job can
pass unnamed. It exists before SR-09 does. DG-035 option (b) closes when this ships and names a
`runs = 0` job in a dry run.

**Depends on:** nothing hard. SR-10a step 1 (the `app/config/capture_cadence.json` registration
block for `market_divergence_history`, verbatim at spec:973-989) is spec-directed to land on the
same day beside this (spec:35-38) — an unregistered store is an unalertable store.

---

**Notes** — build-morning brief, re-verified 2026-08-25 ~22:00 ET against origin/main `2bf91d8d`:

- **Base:** build from `origin/main` (`2bf91d8d`), never the pinned trunk (`a61f0fbe` until the
  post-window pull 08-26). `dg-land.sh` resolves its own base (`dg-land.sh:14`), so a worktree cut
  `--from origin/main` lands normally.
- **Deliverables are clean creates:** `scripts/run_capture_gap_alert.py` and
  `ops/launchd/com.davidleess.dynasty-capture-gap-alert.plist` exist nowhere in any branch history.
  No launchd label collision (checked `launchctl print gui/501` + `~/Library/LaunchAgents/`).
- **Import surface LANDED** — the spec's step-1 "+124 uncommitted" warning is OBSOLETE
  (`2c793603`/`52e7dfc9`/`cef5b6a3`). Bind by symbol, not the spec's drifted line numbers:
  `load_capture_cadence` (:243), `inspect_capture_store` (:646), and the newer
  `inspect_backup_marker` (:814, takes the `backup_run_active.json` sentinel) in
  `app/api/routes/system_capture_health_models.py`.
- **Step 9 premise DRIFTED:** nflverse/contracts is NOT failing anymore (marker 08-25 06:16 reads
  `status=ok, failed_stream=None` — DG-040 fixed it). Re-measure the morning of the build; the pin
  file may ship EMPTY. Pins match on `failed_stream`, never exit code alone; every pin carries a
  review date. Step 5(b) stays UNARMED until the pin file exists.
- **Class (c) input** `app/data/ops/daily_chain_latest_report.json` does not exist until SR-09
  lands (D6) — its absence before then is expected, not a failure.
- **`launchctl print` semantics:** `runs`/`last exit code` are per-bootstrap — `runs = 0` after a
  reboot means "not since login", not "broken" (12 of 14 jobs read 0 on 08-25). Parse the
  non-numeric `(never exited)`. No last-run timestamp exists in the output — cross-check against
  marker mtimes. Regex on field names, not positions.
- **Label list derived from `ops/launchd/*.plist`** (spec's own rule) — which naturally excludes
  the cockpit's `dg-cockpit-backup` (known exit 127) and `dg-mail-carrier` (known exit 2), and a
  non-recursive glob excludes `ops/launchd/retired/` after SR-09. Never hard-code the count —
  spec:910's "8" contradicts the b-EXCEPTION (four plists retire, not six).
- **Plist:** absolute venv interpreter `/Users/davidleess/dynasty-genius-product/.venv/bin/python3.14`
  (launchd's bare PATH resolves `python3` to Apple 3.9.6); 10:30 StartCalendarInterval; installed
  by SYMLINK from `~/Library/LaunchAgents/` per the 08-23 convention; `launchctl bootstrap` is
  David's own `!` command, post-window — a committed plist is not an installed plist.
- **Fresh figures, cite these not the spec's:** backup failures 10/54 lifetime (18.5%) but 3/30
  last-30-days (10%), last failure migration-day 08-22, three clean runs since. fc_forward_capture
  "58/58" verification count is stale — recount at build time (store runs through 08-25).
- **Dry-run hygiene (SR-07 incident):** redirect ALL output paths away from production before
  executing anything the spec prescribes — `--db-path` alone once overwrote a live marker.
- **Tests:** follow `test_<job>_ops_scheduler.py` for the plist + a ticket-numbered red test.
  The untracked `tests/contract/test_governed_cadence_inputs_red.py` in the trunk belongs to
  another lane — do not sweep it into this ticket's commits.
- **Delivery channel unproven:** the 08-25 osascript probe exited 0 but David has not yet confirmed
  the banner rendered; the plain-text file (fixed path — builder chooses and documents it, spec
  leaves it open, as with the pin file's path) is the second channel either way.

---

**BUILD RECORD 2026-08-26 morning.** TDD throughout (every unit watched RED first). Branch
`ticket/DG-044`: `907495c5` (the build — script, plist, empty-armed pin file, SR-10a config v2 +
optional `SeasonWindows.comment`, 61 tests) + `f47d3a6f` (adversarial-review hardening). Chosen
paths, documented per spec: alert/heartbeat file `~/DG-CAPTURE-ALERTS.txt` (outside the repo so a
branch switch never moves it; outside TCC-protected dirs so a launchd writer cannot be silently
denied); known-holes/exit-evidence state `app/data/ops/capture_gap_alert_state.json`; pin file
`app/config/capture_gap_accepted_exits.json`. **Design decision:** the spec's dry-run demand (name
the historical 08-12 hole) and its silence rule (permanent holes must not nag daily) are only
reconcilable with memory — a known-holes state; a hole alerts on first sight, never again while it
persists, and class (a) still catches every new hole at birth.

**Adversarial review (23 agents, 3 lenses + per-finding verification): 17 confirmed → all fixed in
`f47d3a6f`; 3 rejected.** Highlights: crash guard (the crash itself becomes the alert — the CRITICAL
false-silence class); per-bootstrap reboot semantics (unverifiable ≠ never-attempted, one
consolidated line, no false flood); day-2 delivery of a swallowed 08-22-style gap enumeration
(fires on the first run whose prior heartbeat predates the login); launchctl format-drift and
chain-shape fail-opens closed; exit-evidence dedup; pin marker freshness (26h).

**Verified live:** production dry-run names exactly `model_forward_capture: missing 2026-08-12`,
nothing else, exit 0; worktree-config dry-run names market's four holes verbatim. Suite 6,177/0/38,
ruff clean, `dg-land.sh --dry-run` green twice.

**FOR THE SR-09 LANE (D5-D6):** (1) build the chain report writer against
`TestChainReportLines`' fixture shape — keys `steps[].name/exit_code/status`, statuses
`failed`/`skipped_upstream_failed`; a step carrying neither key is reported as unreadable. (2) The
chain runner's own label will get a class (b) line whenever any step failed (its exit code is
derived from step failures already reported one line each) — consider excluding the chain label
from class (b) when the report was readable.

**STILL OPEN AT LAND TIME:** install (David's `!` one-liners, AFTER the post-window trunk pull —
the plist points at the trunk's script); first LIVE run watched by David (banner visibility is not
programmatically provable); post-restart `curl /api/system/capture-health` showing
`('market_divergence_history', 4)` (spec:1011); David to ratify the beyond-spec (h) amendment
(first-run-after-gap delivery). DG-035 option (b) close condition is met in-suite
(`TestDryRunNamesNeverAttempted`) — close DG-035's (b) half when this lands.

**✅ ACCEPTANCE RECORD 2026-08-26 12:00 — every open item above is CLOSED except the (h)
ratification.** Trunk pulled `a61f0fbe → b1b888be` ~10:16 (four merges, zero dirty-path overlap).
Capture-health verified IN-PROCESS via TestClient (no server on :8000; equivalent surface, same
route): config_version 2, `market_divergence_history` registered with its 4 missing dates
(07-10/07-12/07-17/08-12) — spec:1011 substance met. Install: David's bootstrap ~11:59
(the 10:30 window was missed — nothing lost, launchd doesn't replay an unregistered job's slot)
+ `launchctl kickstart` 12:00, a REAL launchd-path run: `runs = 1`, `last exit code = 0`,
program resolved to the absolute venv python through the symlinked plist. Output exactly as
designed: `~/DG-CAPTURE-ALERTS.txt` = model 08-12 GAP line + market 4-date GAP line + HEARTBEAT;
state schema 2 persisted (known holes recorded → next run silent on them); stderr empty; no
delivery-failure line. **David: "yes i saw the banner"** — the visible-notification acceptance
and the 08-25 banner-rendering question, both closed. REMAINING (passive): the 08-27 scheduled
10:30 run must be SILENT + heartbeat — proves StartCalendarInterval; check logs/heartbeat 08-27.
STILL OPEN: David to ratify the beyond-spec (h) amendment (first-run-after-gap delivery).
