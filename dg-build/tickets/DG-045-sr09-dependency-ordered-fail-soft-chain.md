# DG-045 — SR-09: replace six wall-clock plists with one dependency-ordered, fail-soft chain

**Layer:** 1  ·  **State:** todo  ·  **Lane:** ClaudeFable5-DG045-20260826  ·  **DG 3.0**  ·  **Tier 2**
**Source:** season sprint SR-09 (spec `docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md`,
D5-D6 slot, HARD land-by Fri 08-28 EOD). **Steps 1-5 pulled into the 08-26 afternoon on David's
"go" (~12:40)** — a sanctioned deviation from the calendar, worktree only, NOTHING LANDS 08-26.

**Problem (spec's own measurements):** six producers fire on independent wall-clock slots; 7 of 57
daily captures fired >15 min off-slot; market-divergence fail-closes when its FC source is a prior
date; result: permanent, unbackfillable holes (market missing 4 dates, model missing 1). One
09:00 chain running the six in dependency order ends the class.

**How we know:** spec SR-09 section (steps, edge table, proof harness); the stores' missing-date
lists confirmed live on the capture-health surface 2026-08-26.

**Done looks like (TODAY, steps 1-5):** `scripts/run_daily_chain.py` TDD — six producers in
order with argument vectors RE-DUMPED FROM THE LIVE PLISTS at build start (diff vs spec:814-836;
build from the dump); edges as a data table (one hard edge: market ← fc), no `if failed: break`;
three-state status `ok`/`failed`/`skipped_upstream_failed`; one JSON report per run at a fixed
path; true-start-vs-target recording; `--runtime-override` flag (SR-19's amendment). Proof
harness per spec (fail step 2 → others run; fail step 1 → step 5 skipped_upstream_failed).
**Done looks like (D5/D6, NOT today):** step 6 single 09:00 symlinked plist; step 7 retire FOUR
agents (b-EXCEPTION: the two SR-00 retry plists are edited, not retired) into
`ops/launchd/retired/`; step 8 close only after SR-19's D8 rollover exercise.

**RAILS (panel-imposed, David's go):**
- Report path resolves from the script's own repo root (`Path(__file__)`), never hardcoded.
- EVERY proof-harness execution passes an explicit scratch `--report-path` — no run on 08-26 may
  write the default report path (the 08-27 10:30 alert acceptance reads it).
- No full-suite or DB-opening test runs ~13:55-14:20 (SR-00 retry slots).
- EOD stop rule: stop at the last green commit, never mid-red; write a resume brief here before
  ending the day. The afternoon delivers "steps 1-5 as far as green commits reach."
- Land timing: Thu EOD ONLY IF Thu's 10:30 alert fire is scheduled+silent+heartbeat AND DG-041's
  Thu acceptance is clean; else Fri EOD per spec. Either failure is D5's first work item.

**FROM THE DG-044 LANE (carried verbatim):** (1) build the chain report writer against
`TestChainReportLines`' fixture shape — keys `steps[].name/exit_code/status`, statuses
`failed`/`skipped_upstream_failed`; a step carrying neither key is reported as unreadable.
(2) The chain runner's own label will get a class (b) line whenever any step failed (its exit
code is derived from step failures already reported one line each) — consider excluding the
chain label from class (b) when the report was readable.
**Design answer to (2), recorded now:** the chain plist's label joins the alert's pin-file
review path only if needed AFTER D5/D6 install observation — do not pre-suppress; if
double-reporting shows up on D7's alert, the fix is an exclusion in `exit_code_lines` gated on
a readable same-day chain report, built TDD then.

**Depends on:** nothing open (SR-11 landed; SR-02 tracked the plists = rollback exists).
**Overlaps:** DG-035 option (a) — DECIDED 2026-08-26: deferred post-season; chain installs as a
LaunchAgent per spec.

---

**BUILD RECORD 2026-08-26 afternoon — STEPS 1-5 COMPLETE, GREEN, PUSHED (not landed, per plan).**
Commit `bf5ba8a1` on `ticket/DG-045`, pushed to origin. TDD throughout: 26 tests in
`tests/contract/test_dg045_daily_chain_red.py`, every unit watched RED first. Full suite in the
worktree: **6203 passed / 0 failed**. Live plist vectors re-dumped 12:47 and verified IDENTICAL
to spec:814-836 before building. Spec's dry-run verification run for real: six steps in
dependency order printed, tree unchanged.

**Design decisions a future reader must know:**
1. `--dry-run` defaults TRUE (safe-by-default). **The D5/D6 plist MUST pass `--dry-run=false`**
   or the chain will print its plan every morning and capture nothing.
2. Under `--runtime-override`: generic path rewrite (any argv path under `app/data` re-roots to
   the override dir) + data-declared per-step extras — `run_feature_refresh` gains
   `--runtime-dir <override>`; `run_what_changed_report` runs `--preflight` because it exposes
   NO redirect flag (its report path is module-internal `ROOT / _REPORT_RELATIVE`). Redirecting
   it for real would need a code change to that script — deliberately out of SR-09's scope.
3. Spawn failure (OSError, e.g. missing binary) is a `failed` step with `exit_code: null`, and
   the chain carries on — fail-soft covers the failure BEFORE the exit code too.
4. Report written atomically (tmp + os.replace) at the exact path the DG-044 alert reads
   (`app/data/ops/daily_chain_latest_report.json`); cross-contract tests feed the chain's real
   report into the alert's real `chain_report_lines` in both healthy and failing shapes.

**OBSERVATION FOR D5 (not built, needs a decision):** the alert has NO freshness check on the
chain report — a chain that stops running leaves yesterday's healthy report at the fixed path
and class (c) reads it as health forever. The launchd channel covers the gap (never-attempted +
exit-code lines on the chain's label), so this is a redundancy question, not a hole; but when
the plist installs on D5/D6, consider whether class (c) should compare the report's
`chain.started_at` date to today. Small, Tier 2-adjacent, alert-side (landed code) — David's
call whether it rides with SR-09 or waits.

**RESUME BRIEF (next session / D5 Thu 08-27):** remaining = steps 6-8. (6) write
`ops/launchd/com.davidleess.dynasty-daily-chain.plist` — 09:00, absolute venv python,
`--dry-run=false`, logs under `app/data/logs/`, header per house convention, symlink install;
plist contract test per `test_capture_gap_alert_ops_scheduler.py` pattern. (7) retirement with
rollback: snapshot `launchctl list` + plutil schedules into `ops/launchd/retired/` FIRST, then
`git mv` FOUR plists (b-EXCEPTION: market + model-pvo are EDITED — strip 09:00, keep
11:30/14:00 — not retired), README in retired/. (8) SR-19's rollover exercise closes SR-09 on
D8 — not before. Land gate: Thu EOD only if Thu 10:30 alert fired scheduled+silent+heartbeat
AND DG-041 Thu acceptance clean; else Fri EOD. David runs all launchctl install/bootout
commands himself.

**2026-08-26 ~14:05 — STEPS 6-7 PREPARED on the branch (`ab522db7`, pushed), on David's "why
don't we start on tomorrow's work."** Chain plist written + contract-tested (dry-run=false
pinned; strict-XML-parse test — plutil tolerates what expat rejects); PRE-SR09 snapshots
committed (13 agents, all exit 0, taken from the live pre-change world); four plists retired
byte-identical with README/rollback; b-EXCEPTION applied (market + model-pvo → retry-only
11:30/14:00, scheduler tests updated); retirement contract test guards the layout. 67 contract
tests green. **⚠ LAND IS COUPLED TO THE SWAP:** three retired plists are live SYMLINKS — landing
before David's launchctl session + a reboot = silent loss of league/market/pvo producers.
**Thursday remaining:** morning checks (10:30 silent+heartbeat; DG-041 clean) → apply any
confirmed findings from today's adversarial review → land → ONE launchctl sitting: bootout six,
bootstrap chain + ff-playerids (DG-053), verify `launchctl list | grep -c dynasty` = 10
(13 − 6 retired + 1 chain + 1 ff-playerids + ... recount live) → step 8/SR-19 stays D8.

**2026-08-26 ~14:45 — ADVERSARIAL REVIEW COMPLETE, ALL CONFIRMED FINDINGS FIXED (`6038d2d6`,
pushed).** 29-agent review (4 lenses, per-finding adversarial verification): 16 upheld findings
deduplicating to 2 distinct majors + 3 minors + 4 missing test pins, all fixed TDD same hour.
The majors: (A) a scratch --steps-from table could silently overwrite the LIVE alert-read report
— the spec's own printed proof commands (spec:881/:886) do exactly this; the CLI now refuses
without an explicit scratch destination. **Amend the spec's proof commands when SR-09 closes.**
(B) SR-19's documented rehearsal command could not produce the real feature_refresh refusal
(nothing forwarded --season-end 2026); new repeatable `--step-extra STEP=ARG` fixes it.
**THE D8 REHEARSAL COMMAND IS NOW:**
`run_daily_chain.py --dry-run=false --runtime-override "$SCRATCH/rollover_rehearsal"
--step-extra run_feature_refresh=--season-end --step-extra run_feature_refresh=2026`
Also fixed: hard-upstream table validation (typo'd/forward edge dies at launch, not perma-skip
with exit 0); past-midnight drift computes against yesterday's target. 44 DG-045 tests green.
Branch state: bf5ba8a1 (steps 1-5) → ab522db7 (6-7 prep) → 6038d2d6 (review fixes) — READY TO
LAND Thursday after the two morning checks, coupled to David's launchctl sitting.

**⚠ THURSDAY CHECK AMENDED (2026-08-26 ~15:30, after DG-049's live dry-run):** the 10:30
scheduled run will NOT be perfectly silent — DG-044's not_loaded class correctly flags DG-053's
committed-not-installed ff-playerids plist. Expected output Thursday 10:30: exactly ONE line
("GAP com.davidleess.dynasty-ff-playerids-snapshot: present in ops/launchd but not loaded...")
plus the heartbeat. That exact line = HEALTHY (cleared by the bootstrap in the sitting). Any
OTHER line = investigate before landing.

---

## D5 SITTING PACK — prepared 2026-08-26 ~21:15 ET (evening session)

Every fact below re-verified read-only against the live system tonight (LaunchAgents dir, loaded
jobs, branch trees, plist contents, alert file), then the whole sheet ADVERSARIALLY REVIEWED by a
3-lens refuter pass (commands / ordering / consistency, 108 verification calls) — 7 confirmed
defects found and fixed in place, headline: the inherited "expect `inputs_live`" gate and the
bare `grep -c calendarinterval` check would each have made a HEALTHY Thursday read as a failure.
Nothing was installed or changed. TWO CORRECTIONS to the record above, one caveat, then the sheet.

**CORRECTION 1 — the ~14:05 note's "three retired plists are live SYMLINKS" is wrong on
mechanism, right on effect.** On disk tonight, of the four RETIRING plists only `league-capture`
is a LaunchAgents symlink; `fc-snapshot`, `feature-refresh`, `what-changed-report` are REAL
COPIES (Jun 24/27 vintage). Bootout does NOT delete a real copy — left in place they reload on
the next login/reboot and double-fire beside the chain. The sitting must `rm` all four
LaunchAgents entries (Phase 3). The other two live symlinks are `market-divergence-refresh` +
`model-pvo-refresh`, whose repo targets the land EDITS in place (09:40/09:30 first slots
stripped; 11:30/14:00 kept — verified on the branch tonight) — they need bootout +
re-bootstrap to shed the in-memory 09:xx schedule.

**CORRECTION 2 — the verify count is ELEVEN, not 10** (the ~14:05 note's own "recount live",
done): 13 loaded now − 6 booted out + chain + ff-playerids + market + model-pvo re-bootstrapped
= **11**. A reading of 9 = the retry pair was not re-bootstrapped (11:30/14:00 retry lanes
dead). 10 = one bootstrap missing — find which before walking away. Matching invariant: dynasty
plist FILES in ~/Library/LaunchAgents after the sitting = 11 as well (9 symlinks + 2 real:
league-opportunity-map, roster-capacity-audit; the three `.disabled` sync files don't count).

**10:30 CAVEAT (post-dates the ~15:30 amendment above):** the nflverse marker deliberately reads
`attested status failed` tonight (DG-048 truth-marker, written ~16:15 on David's instruction).
If the 06:15 run fires and succeeds, it flips to ok and the ONE-line expectation holds. If 10:30
shows EXTRA lines, FIRST check whether 06:15 ran (marker content + mtime:
`app/data/nflverse_usage/nflverse_usage_status_latest.json`) — an alert on a genuinely stale
failed marker is the alert WORKING; investigate the 06:15 non-fire, do not land.

### The sheet — [session] = Claude runs it; [DAVID] = your hands only (standing rule)

Run Phases 1–6 as ONE sitting, target ~10:35–11:25. Keep Phases 1 AND 2 (the full-suite land,
and bootouts — a bootout at 11:30/14:00 would kill a mid-write retry instance) plus any
DB-opening run clear of the 11:30 and 14:00 retry slots — if approaching one, wait 15 min past
it. If interrupted after Phase 2, the 11:30/14:00 retry lanes simply don't fire until Phase 5 —
harmless (the 09:30/09:40 first attempts already ran under the old world). **After ANY logout or
reboot mid-sitting, re-run Phase 2's six bootouts before continuing:** login auto-loads every
plist still present in LaunchAgents (the un-rm'd market/pvo symlinks included — no dynasty label
is in the persistent-disable set), and a pre-pull reload silently resurrects the old 09:xx
schedules in memory, which Phase 5's bootstrap then fails to replace ("already loaded"). Hard
failure → ROLLBACK at the bottom.

**Phase 0 — gates [session], ~10:35:**
```
tail -4 ~/DG-CAPTURE-ALERTS.txt
```
→ expect, appended after the 08-26 12:00 three-line baseline: the ff-playerids GAP line +
`HEARTBEAT 2026-08-27T10:30...`. Anything else → caveat above; STOP.
```
cd ~/dynasty-genius-product && .venv/bin/python3.14 -c "import json;r=json.load(open('app/data/features_runtime/feature_refresh_latest_report.json'));print('source_hash',r['source_hash']);print(json.dumps(r['stream_provenance']['participation'],indent=1))"
```
→ expect PARTICIPATION `fallback_used: false`, `error_type: null`. ONE source_hash move vs
yesterday is the disclosed C4 one-time regen — expected, not a failure. **The OTHER streams
(pbp, player_stats, snap_counts) still carry `fallback_used: true` on a healthy 08-27** —
DG-041's ceiling covers participation only; those three wait on upstream 2026 parquet and are
NOT a stop. Participation `true`, or any stream EMPTY, = STOP.
```
cd ~/dynasty-genius-product && .venv/bin/python3.14 -c "from fastapi.testclient import TestClient;from app.main import app;print(TestClient(app).get('/api/health').json())"
```
→ **expect feature_refresh status `inputs_degraded` with a basis that lists participation under
LIVE (beside rosters 2026), and EARLIER SEASON holding only pbp/player_stats/snap_counts.**
Participation under EARLIER SEASON, or anything under EMPTY, = STOP. ⚠ The record's inherited
"expect `inputs_live`" is WRONG for 08-27 and was verified unreachable tonight: `inputs_live`
is a detail string the health route emits only via its degraded branch, and the three
no-ceiling streams keep Thursday degraded regardless — DG-041's real Thursday signal is the
participation block above plus this basis movement. (No server on :8000 — in-process TestClient
is the proven 08-26 method. Run from the TRUNK only, never a worktree.)

**Phase 1 — land [session]:** `~/dg-build/bin/dg-land.sh DG-045`
(origin/main moves; disk and loaded jobs unchanged; trunk will read **"behind 4"** — the three
rebased ticket commits plus the --no-ff merge — cleared by Phase 4's pull.)

**Phase 2 — bootout six [DAVID]:**
```
launchctl bootout gui/501/com.davidleess.dynasty-fc-snapshot
launchctl bootout gui/501/com.davidleess.dynasty-feature-refresh
launchctl bootout gui/501/com.davidleess.dynasty-league-capture
launchctl bootout gui/501/com.davidleess.dynasty-what-changed-report
launchctl bootout gui/501/com.davidleess.dynasty-market-divergence-refresh
launchctl bootout gui/501/com.davidleess.dynasty-model-pvo-refresh
```

**Phase 3 — remove the four dead LaunchAgents entries [DAVID]** (Correction 1):
```
rm ~/Library/LaunchAgents/com.davidleess.dynasty-fc-snapshot.plist
rm ~/Library/LaunchAgents/com.davidleess.dynasty-feature-refresh.plist
rm ~/Library/LaunchAgents/com.davidleess.dynasty-what-changed-report.plist
rm ~/Library/LaunchAgents/com.davidleess.dynasty-league-capture.plist
```

**Phase 4 — trunk pull [session]:**
```
git -C ~/dynasty-genius-product status --porcelain
git -C ~/dynasty-genius-product pull --ff-only
```
(`git -C`, not `cd` — a session's shell resets cwd between calls, and a stray `git pull` from
the wrong directory is a real operation: ~/dg-build has its own origin/main.)
(Known dirt — `.mcp.json`, `docs/agent-ledger/2026-08-19.md`, `tests/test_aging_curves.py` +
untracked — does not overlap the land. Anything NEW that does → stop. The pull delivers the
chain plist, the retired/ layout, and the edited retry-only plists to disk.)

**Phase 5 — install the new world [DAVID]** (all four plists verified `RunAtLoad=false` —
nothing fires on bootstrap):
```
ln -s /Users/davidleess/dynasty-genius-product/ops/launchd/com.davidleess.dynasty-daily-chain.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.davidleess.dynasty-daily-chain.plist
ln -s /Users/davidleess/dynasty-genius-product/ops/launchd/com.davidleess.dynasty-ff-playerids-snapshot.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.davidleess.dynasty-ff-playerids-snapshot.plist
launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.davidleess.dynasty-market-divergence-refresh.plist
launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.davidleess.dynasty-model-pvo-refresh.plist
```
(Chain symlink is only valid AFTER Phase 4 — the plist arrives with the pull. ff-playerids'
target is already on disk via DG-053's land.)

**Phase 6 — verify [either]:**
```
launchctl list | grep dynasty | sort
```
→ **11 labels**: backup-irreplaceable, capture-gap-alert, daily-chain, ff-playerids-snapshot,
league-opportunity-map, league-transaction-capture, market-divergence-refresh, model-pvo-refresh,
nflverse-usage-capture, realized-outcome-scoring, roster-capacity-audit.
```
launchctl print gui/501/com.davidleess.dynasty-daily-chain | grep -c 'stream = com.apple.launchd.calendarinterval'
launchctl print gui/501/com.davidleess.dynasty-ff-playerids-snapshot | grep -c 'stream = com.apple.launchd.calendarinterval'
launchctl print gui/501/com.davidleess.dynasty-market-divergence-refresh | grep -c 'stream = com.apple.launchd.calendarinterval'
launchctl print gui/501/com.davidleess.dynasty-model-pvo-refresh | grep -c 'stream = com.apple.launchd.calendarinterval'
pmset -g sched
```
→ **1, 1, 2, 2** — the quoted `stream =` grep counts exactly the schedule slots (`launchctl
list` never shows schedules — the 08-20 lesson; a bare `grep -c calendarinterval` reads N+1
because of the events-block header, measured tonight). Market/pvo reading **3** = the OLD
three-slot schedule survived — the re-bootstrap was skipped or hit "already loaded" after a
mid-sitting reload; bootout and bootstrap that label again. Label count ABOVE 11 = retirees
still loaded — re-run Phase 2's bootouts. Wakepoweron 6:00AM intact.

**ROLLBACK (hard failure between Phases 2 and 5):** the six old plists are still on disk —
before Phase 4's pull at `ops/launchd/*.plist`, after it at `ops/launchd/retired/`
(byte-identical — blob-hash verified tonight against the LaunchAgents copies; with README;
market/pvo pre-land versions via git if needed). If Phase 5 partially ran, first bootout
whatever new labels loaded (daily-chain, ff-playerids). Symlink + bootstrap the old six back,
verify 13 loaded, STOP, write what happened here.

**FRIDAY EXPECTATIONS (first post-swap morning):** 06:45 ff-playerids first fire; 09:00 chain
first live fire — fail-soft report at `app/data/ops/daily_chain_latest_report.json`; 10:30
alert SILENT + heartbeat (the ff-playerids line cleared by the bootstrap).

**SPEC AMENDMENT TO APPLY WHEN SR-09 CLOSES (review finding A, drafted tonight):** in SR-09's
Verification block (~spec:883), the fail-soft proof command must carry the scratch destination
the CLI now requires:
`./.venv/bin/python3.14 scripts/run_daily_chain.py --steps-from "$SCRATCH/steps_fail2.json" --dry-run=false --report-path "$SCRATCH/chain_report.json"`
— and the hard-edge proof paragraph gains the same `--report-path` note. (As of `6038d2d6` the
CLI refuses `--steps-from` without an explicit scratch report destination; the spec's printed
command would have overwritten the live alert-read report.)

**DECISION FOR DAVID AT THE SITTING (carried from the D5 observation above):** whether the
alert's class (c) gains a chain-report freshness check (compare `chain.started_at` to today)
riding with SR-09, or waits. Redundancy question, not a hole — the launchd channel covers a
stopped chain.
