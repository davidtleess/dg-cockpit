---
name: season-readiness-sprint-2026
description: "The 2026-09-10 kickoff deadline, the approved architecture plan, the build spec, and the corrections that bind future work"
metadata: 
  node_type: memory
  type: project
  originSessionId: 18235550-1462-4db1-ae6b-104ee4ed28e0
  modified: 2026-08-29T18:41:54.749Z
---

**Hard deadline: NFL kickoff 2026-09-10 20:20 ET.** Build days Fri 2026-08-21 → Fri 2026-09-04
(11 working days), then a **hard freeze 2026-09-04 EOD** buying six unmodified capture cycles.

## What David approved 2026-08-20
- **Master architecture plan** — `docs/strategies/2026-08-20-dynasty-genius-MASTER-architecture-and-build-plan.md`.
  A 3-way adjudication of the competing proposals; 10 rulings. Committed `ce7b540`.
- **Product law amendments Revision 2** — `...-dg-product-law-amendments-REV2.md`. Its predecessor's
  centrepiece **A1 (allow buy/sell recommendations) is WITHDRAWN**: the claim that the no-verdict law
  made `decision_supported` unreachable was falsified — the route runs through rank predictions and
  the G3 market-superiority gate, which WR already passes with **zero recommendations ever issued**.
- **Scoping ruling: NO architecture migration before the season.** Identity re-keying while
  irreplaceable capture flows is the worst risk pairing. Architecture program starts off-season.
- **League Activity is deferred, not cut** — committed for week 1 of the season (≤2026-09-17).

## Build spec
`docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md` — 20 tickets, **8.5d committed / 11 available**.
Decision record for fresh-context agents: `~/dg-build/SEASON-BRIEF.md` (inside backup coverage).
Goals in priority order: **nothing is lost · nothing is wrong · something is useful.**

## CORRECTIONS THAT BIND FUTURE WORK — verify before contradicting
1. **DO NOT EDIT `XVAR_LAMBDA_ENGINE_B`.** A "TE is 8.4% undervalued" finding was issued and then
   **RETRACTED**. The three constant families are algebraically coupled and **`P90[pos]` cancels out
   of xVAR entirely** (`xvar = (ppg − repl_ppg) × 100 / P90[WR]`; verified 20.7746 vs 20.7586).
   Editing the lambda alone introduces **+8.5% error**. The real TE defect is the **DVS clamp** —
   11 of 89 TEs at the 100 ceiling vs QB 0/37, RB 5/99, WR 6/163. Ordering, not scaling.
2. **`git rev-list --left-right --count origin/main...HEAD` → `3 12` means 12 AHEAD, 3 behind.**
   Left is behind, right is ahead. This was reported inverted for a whole session.
3. **The divergence impact figure is 131 of 336 / 10.72pp**, not the widely-quoted 10.67pp/127-of-338,
   which the repo's own ledger marks corroboration-only under acknowledged contamination.
4. A transient macOS `library load mig callout failed` fault can make the whole suite appear dead.
   It clears. **Retry before reporting a broken test loop.**
5. **Healthy state is ZERO failures and zero collection errors on a clean landed tree — never a
   pinned pass count.** This line previously read *"~6,258 pass / 17 fail (all in-flight work) /
   12 skip"*, which was measured on a DIRTY trunk carrying other lanes' edits. As a memory it was
   actively dangerous: it told a fresh agent that seventeen failures are normal, which would mask
   real breakage — the exact false-reassurance failure DG-023/033/034/036 exist to prevent.
   Measured on the clean landed tree 2026-08-25 after DG-042: **6,084 passed / 0 failed / 38
   skipped in ~51s.** The count itself moves every time tests are added (6,067 → 6,084 in one
   morning), so verify the invariant, not the number. See [[project_dg3_build_system]].

## Machine state changed 2026-08-20
- `pmset repeat wakeorpoweron` **6:00 AM daily** (was: sleeps after 1 min on AC, no wake — the likely
  cause of the 2026-08-12 archive gap).
- **Two launchd capture jobs installed and loaded**, present in `ops/launchd/` but never installed:
  `dynasty-league-transaction-capture` (06:30), `dynasty-nflverse-usage-capture` (06:15).

## Days 2+3 executed 2026-08-21 / 08-22 — closeout `8ecda65`, ALL PUSHED
**Sprint is 2 days AHEAD** (D1 08-20, D2 08-21, D3 08-22). Suite **6,292 / 17 / 12, zero
collection errors** — the 17 are the documented baseline in other lanes' files. ruff 0.15.12 is
now installed in the venv (matches the CI + pre-commit pin); `ruff check src app` clean.

- **SR-06** `4c4b7fa` — season list DERIVED (`current_league_season()`), and an unpublished season
  is recorded `not_yet_available` by reading the source's OWN bound off its refusal. **PROVEN LIVE
  08-22 06:15: `depth_charts` 2026 landed, 459,221 rows** — first live 2026 data the product holds.
- **SR-07** `04c7211` — both runners can finally report failure; `--db-path` now sandboxes the
  whole run (marker + raw), not just the store.
- **✅ SR-00 PROVEN, Day 1's open item CLOSED.** Retroactively, via `model_forward_capture_raw`
  (PK carries `semantic_output_hash`, `INSERT OR IGNORE`): 2026-08-21 holds 12,222 rows and exactly
  **ONE** distinct hash across **THREE** runs. Three fires, one hash = deterministic.

### THREE TICKET PREMISES FALSIFIED — verify before executing ANY SR ticket
1. **SR-06 as written would have BROKEN capture** — unpublished nflverse streams RAISE, not return
   empty, and `ngs_passing` is stream #1.
2. **SR-07's prescribed one-liner could not satisfy SR-07's own verification** — `--league-id 0`
   (nonexistent league) returns `status: "ok"`. The health discriminator is **MANAGERS, never
   transaction count** (a real league has managers in a dead week).
3. **SR-08 HAS NO 13-DAY GAP — do not run its step 1.** All four seasons are COMPLETE against
   Sleeper's own totals. Its adjudication half still stands. Re-scope note is now in the spec.

### The recurring error to guard against
**Absence of a write is NOT evidence of loss.** It produced a false "your stats were destroyed"
alarm on 08-21 and the false "13-day gap" premise in SR-08. See [[reference_nflverse_unchanged_trap]].

### Production incident, fixed
SR-07's verification command **as the spec wrote it** overwrote the live transaction
`success_marker` — `--db-path` redirected the store but not `raw_root` (marker + raw snapshots).
Repaired; runner fixed; the spec's verification block now carries a ⚠️ note.

### ✅ SR-11 SHIPPED 2026-08-26 (D4, on schedule) as DG-044 — merge `b1b888be` on `main`
Built TDD in `~/dg-wt/DG-044` (worktree since removed by the land), hardened by a 23-agent
adversarial review (17 confirmed findings fixed — headline: crash guard, per-bootstrap reboot
semantics, day-2 gap-enumeration delivery), landed with SR-10a step 1 beside it (cadence config v2
registers `market_divergence_history`; optional `SeasonWindows.comment` field added). Suite
6,177/0. Production dry-run named exactly the `model_forward_capture` 2026-08-12 hole. **DG-035
option (b) closed by this land** (option (a) LaunchDaemons stays open, David's call). Alert file
`~/DG-CAPTURE-ALERTS.txt`; state `app/data/ops/capture_gap_alert_state.json`; pin file
`app/config/capture_gap_accepted_exits.json` ships EMPTY (contracts healthy since DG-040 — a new
contracts failure is a regression, not an accepted exit). Full record: dg-build BOARD.md 06:57
note + tickets/DG-044 (both pushed, `c5c2a0c`).

**✅ SR-11 FULLY ACCEPTED 2026-08-26 — install done, live fire seen, banner question ANSWERED YES.**
The 08-26 sequence executed: DG-023's single-variable confirmation cycle ran green on the pinned
trunk (fc 09:00, features 09:15, league 09:20, model/pvo 09:30:08, market 09:40:04, what-changed
09:45 — note the model store's producer is the 09:30 pvo-refresh, not a 09:45 job). Trunk pulled
`--ff-only` `a61f0fbe → b1b888be` ~10:16 (zero overlap, 25 dirty files untouched). Capture-health
verified IN-PROCESS via TestClient (no server was on :8000 — nothing to restart; next API start
serves DG-022's surface): config_version 2 live, `('market_divergence_history', 4)` confirmed
(4 missing dates 07-10/07-12/07-17/08-12) — SR-10a step 1 accepted. David missed the 10:30
bootstrap window (bootstrapped ~11:59); recovery: bootstrap + `launchctl kickstart` at 12:00 —
a REAL launchd-path run (runs=1, exit 0). Alert file + state written exactly as designed, stderr
empty, no delivery-failure line, and **David: "yes i saw the banner"** — visible-notification
acceptance met; the 08-25/08-26 probe question is closed. Known holes persisted to state, so
**tomorrow's scheduled 10:30 run must be SILENT + heartbeat — that's the remaining (passive)
proof that StartCalendarInterval scheduling works; check heartbeat + logs on 08-27.**

## ⏳ OPEN AT CLOSE (2026-08-26 evening) — THURSDAY 08-27 (D5) RUNBOOK, in order
**Everything durable is pushed: trunk = origin/main = `08fee647` (after close-out, David re-opened
~18:55 and pulled BOTH remaining frontend sprint tickets forward, landed same evening — SR-15 as
DG-080 merge `ab32a605`, SR-16 as DG-081 merge `c606fc53`, plus spec done-marks `e6a5d758` +
`08fee647` which also added the overlooked SR-20/DG-047 mark. All frontend-only — cannot touch
any morning check. Calendar now: D9 = SR-13 only, D10 fully freed to buffer; sprint tail after
SR-09 closes = SR-12+SR-10a (D7), SR-14+SR-19 (D8), SR-13 (D9). The Morning Room hero now counts
HIS roster's movers — tomorrow it would read 27, largest Chimere Dike — and Trade Lab search can
no longer show a stale query's players. dg-build `53eff54`; `ticket/DG-045` at `6038d2d6` (steps
1-7 built + reviewed, deliberately NOT landed — rebases over the four new commits at land,
disjoint files, trivial).**
**PRE-FLIGHT VERIFIED ~19:40 Wed, all read-only — do not redo, just execute:** all 13 agents
loaded exit 0 incl. the gap alert; 6:00 wake set; machine on AC (David told to leave it plugged
in); ff-playerids correctly NOT installed; alert `--dry-run` prints EXACTLY the two expected
lines (nflverse incident marker — self-clears at 06:15 — and ff-playerids not_loaded), and the
new DG-039 `roster_capacity_status` freshness entry stays QUIET on its missing marker until the
Tue 09-01 audit writes it (two-line false-alarm risk checked and cleared); `git merge-tree`
proves ticket/DG-045 merges conflict-free onto tonight's main.
1. **Morning, passive:** 06:15 nflverse run overwrites the incident marker with fresh ok
   (today's marker deliberately reads `attested status failed` — the closed DG-048 incident);
   06:45 ff-playerids does NOT fire (plist not installed yet — expected); 09:00 cycle runs the
   OLD scheduling one last time; DG-041 acceptance: participation timeout GONE from
   feature_refresh log, one source_hash move, then fallback_used=false; 09:40 serves the second
   rebased divergence.
2. **10:30 alert check, AMENDED EXPECTATION:** exactly ONE line — the ff-playerids
   not_loaded line — plus heartbeat. That exact output = healthy (proves StartCalendarInterval
   scheduling, completing SR-11's acceptance pair). Any OTHER line = investigate before landing.
3. **Both checks green → land DG-045** (dg-land; the land is COUPLED to the sitting — three
   retired plists are live symlinks, never land-then-wait).
4. **David's ONE launchctl sitting** (hand him one-liners in order): bootout four retiring
   agents + REMOVE their ~/Library/LaunchAgents entries (league-capture was a symlink; fc,
   feature-refresh, what-changed were copies); bootout+bootstrap market + model-pvo (pick up
   edited retry-only 11:30/14:00 schedules); symlink+bootstrap the chain plist; symlink+bootstrap
   ff-playerids. Verify: `launchctl list | grep -c dynasty` and `pmset -g sched` wake intact.
5. Trunk pull post-land. Friday 09:00 = chain's first live morning (fail-soft, report at
   app/data/ops/daily_chain_latest_report.json); Friday 06:45 = crosswalk's first fire.
   SR-19's D8 rehearsal command (with the new --step-extra) is in the DG-045 ticket.
Also open: SR-08 remainder small Tier 0 edit (unscheduled); DG-032/DG-017 hygiene; ~~dg-work
share map lacks league_transactions~~ (FIXED 21:30, `bfed555`); D10 now holds only SR-16 (SR-20 shipped).

**⭐ ~21:45 SECOND EVENING SESSION CLOSE — the runbook steps 2-5 above are SUPERSEDED by the
D5 SITTING PACK: the final section of the DG-045 ticket (dg-build `c4137b0`), fact-verified
against the live system and adversarially reviewed (3 refuter lenses, 108 checks, 7 confirmed
defects fixed). EXECUTE THE PACK, NOT THIS LIST. Amendments a fresh session must not "correct"
back: (1) /api/health reads `inputs_degraded` on a HEALTHY 08-27 — participation moves to LIVE;
pbp/player_stats/snap_counts keep `fallback_used: true` (upstream 2026 parquet absent) and that
is NOT a stop; (2) post-sitting verify count is 11, not 10, and calendarinterval checks need the
quoted `stream = com.apple.launchd.calendarinterval` grep (expect 1,1,2,2 — bare grep reads N+1);
(3) rm all FOUR retiring LaunchAgents entries — three are REAL COPIES (only league-capture is a
symlink), bootout alone leaves them to reload on reboot; (4) after ANY logout/reboot mid-sitting,
re-run the six bootouts before continuing. Also done: Option 2 housekeeping (`bfed555` share map;
`17cccd3` mis-truncated DG-049/053 stray ticket files merged into canonicals + removed, BOARD
supersession bracket, ROADMAP ratification header). Verified at close: ALL ~/dg-wt branches
pushed (the 08-23 unbacked-worktree warning is clear); trunk untouched at `08fee647` with its 25
dirty files; dg-build clean, level with GitHub at `c4137b0`; nothing installed, no launchctl run.**

**⭐ D5 (08-27) EXECUTED — DG-045/SR-09 LANDED (merge `4048f25a`) + THE SWAP IS DONE, a day
ahead of the hard Fri land-by.** Full record: D5 SITTING RECORD section of the DG-045 ticket
(dg-build `2c210e0`). Gates passed per the amended criteria (10:30 had two EXTRA lines, both
investigated benign: nflverse's dropped 06:15 slot — capture ran ok at 06:46 post-login — and
the guard's own pre-bootstrap gap). First land attempt REFUSED by the gate: rebase-collision
with the morning's catch-up guard — the chain was scheduled-but-unguarded and four retired
labels were dead entries; fixed `c10a8b65` (chain + ff-playerids guarded, retired labels out,
scheduler evidence renamed). Sitting executed by SESSION hands on David's remote word (he was
away from the machine; the `!` prompt shell cannot reach launchd — silently no-ops). Verified:
12 labels (the pack's 11 + catchup-guard, which post-dates the pack), slots 1/1/2/2, wake
6:13AM (David moved it from 6:00 that morning). REMAINING: step 8 = SR-19 rollover on D8;
class (c) chain-report freshness check recommended DEFER, awaiting David's word; first
chain/ff-playerids fires expected same day via guard backfill kicks. David away for days
from 08-27 — machine on AC (never sleeps), 6:13 wake + guard as battery fallback.

### D4 LATE ADDITIONS: DG-048 (Daily Control RETIRED on David's ruling — runner refuses every
### mode, module lives on) and DG-039 (always-written roster-capacity status marker) BOTH LANDED.
### ⚠ INCIDENT during DG-048 (full record in its ticket): a bare RED-probe executed a LIVE
### daily-control run that reached production through worktree symlinks; killed ~90s in. DB
### integrity ok, no data loss. Export ready-marker was poisoned with dead worktree paths —
### REPAIRED (restored from the 06:15 run's own manifest; dg-land's gate caught it). The nflverse
### STATUS marker still reads `running/null` — self-heals at 06:15 tomorrow; a truthful
### incident-marker write was drafted but classifier-blocked (David's call, or let it heal).
### Seven tickets landed 08-26 total. Lessons in the DG-048 ticket + test docstring.

### D4 (08-26) FINAL TALLY — the biggest single day of the sprint. LANDED ON MAIN: DG-044/SR-11
### (accepted end-to-end, banner seen), DG-046 (rebased divergence, production-accepted 14:00),
### DG-053 (crosswalk snapshotter, pre-freeze), DG-047 (=SR-20 substance, D10 slot FREED),
### DG-049 (=SR-10b substance — EVERY capture store now has a detection channel before the chain
### soaks). Layer roadmap ratified, DG-049..079 filed. Trunk current at `a078f60a`.
### ⚠ THURSDAY 10:30 CHECK AMENDED: expect exactly ONE line (ff-playerids plist not_loaded —
### healthy, cleared by the bootstrap) + heartbeat; any OTHER line = investigate before landing.
### Thursday sitting installs: chain + ff-playerids bootstraps, six bootouts (see DG-045 ticket).
### Housekeeping noted: dg-work.sh share map lacks league_transactions/ (false marker-absent in
### worktree dry-runs). Next fillable items need David: DG-048 ruling (retire-vs-schedule Daily
### Control), DG-039 (slack candidate), or pulling post-freeze roadmap items forward.

### SR-09 = DG-045 — STEPS 1-7 BUILT **AND ADVERSARIALLY REVIEWED** on D4 (08-26). Branch
### `ticket/DG-045`: `bf5ba8a1` (steps 1-5) → `ab522db7` (6-7 prep) → `6038d2d6` (review fixes),
### PUSHED, 44 tests green. **NOT LANDED — THE LAND IS COUPLED TO DAVID'S LAUNCHCTL SITTING:**
three retired plists are LIVE SYMLINKS; landing + reboot before the swap silently kills
league/market/pvo producers. Thursday = the two morning checks (10:30 scheduled fire
silent+heartbeat; DG-041 acceptance clean) → land via dg-land → ONE sitting: bootout six
(fc-snapshot, feature-refresh, league-capture, what-changed, and REMOVE their LaunchAgents
copies/symlinks; market+model-pvo need bootout+bootstrap to pick up their edited retry-only
schedules) + bootstrap chain + bootstrap ff-playerids (DG-053's plist, already on main).
29-agent review: 2 majors fixed — (A) --steps-from now REFUSES without a scratch report
destination (the spec's own proof commands would overwrite the live alert-read report — amend
spec when SR-09 closes); (B) new `--step-extra STEP=ARG` so SR-19's D8 rehearsal can force
--season-end 2026 (command recorded in the ticket). Step 8/SR-19 closes SR-09 on D8, not before.
Full record: DG-045 ticket file.
Same-day rulings: (h) amendment RATIFIED; DG-035 option (a) DEFERRED post-season; Tuesday-1
baseline preserved in dg-build (`preserved/2026-08-26-tuesday1-baseline/`); trunk's 22 untracked
files copied to dg-build `preserved/2026-08-26-trunk-untracked-copy/` (commit ruling = David's);
`agent/modeling-backend` pushed; Air lanes cleared; DG-015/031/035 worktrees removed.

### ~~NEXT BUILD TICKET: SR-09 (D5-D6, Thu 08-27 / Fri 08-28)~~ — HARD land-by Fri 08-28 EOD
So the three Tuesday-only jobs get exercised 09-01 while fixable. b-EXCEPTION binds: FOUR plists
retire (not six), into `ops/launchd/retired/` (the alert's non-recursive glob already excludes it).
SR-09-lane notes from DG-044 are in the ticket file: build the chain report against
`TestChainReportLines`' shape (`steps[].name/exit_code/status`); consider excluding the chain
runner's own label from the alert's class (b) when the report is readable. Also unscheduled: SR-08's
re-scoped adjudication remainder; 08-27 DG-041 production acceptance (one source_hash move expected,
then participation `fallback_used=false` — **/api/health stays `inputs_degraded` on a healthy
08-27**, participation just moves to LIVE in the basis; the old `inputs_live` expectation was
verified UNREACHABLE 08-26 ~21:30 — see the D5 SITTING PACK in the DG-045 ticket). ~~Still open: the `contracts` upstream schema break (fails 06:15 daily, holds the export
marker at 08-08; no downstream consumer — filed, deliberately unfixed).~~ **RESOLVED via DG-040:
verified 2026-08-25 the nflverse marker reads status=ok / failed_stream=None (06:16 run). This
also voids SR-11 step 9's premise that nflverse/contracts fails daily — re-measure before writing
the pin file; it may ship empty.**

## Day 1 executed 2026-08-20 evening (a day early) — closeout `e622091`
SR-00 `a977db4` · SR-02 `26788b9` (plists tracked + XML fixed) · SR-04 `00d14fc` (gate green,
72 files/293 tests) · SR-03 + SR-05 ruled. Suite at baseline 6258/17/12, zero collection errors.

**THREE THINGS THAT BIND LATER WORK:**
1. ~~**SR-00 is LANDED BUT NOT PROVEN**~~ — **SUPERSEDED 2026-08-22: SR-00 IS PROVEN AND CLOSED.**
   See the Days 2+3 section above. Proven retroactively (one `semantic_output_hash` across three
   runs), not by the digest-before/after method — the window passed twice unobserved.
2. **SR-02's backup half is REVERTED (`26ef542`).** `0efbd59` would have aborted the whole nightly
   backup — 637 files / 3.1 GB — because `backup_irreplaceable_data.py:41` sets
   `ALLOWED_ROOTS = ("app/data","app/config")` and the manifest loop raises before any staging.
   **Backing up `ops/launchd` needs an `ALLOWED_ROOTS` CODE change, is no longer 0.25d, and is on
   no calendar.**
3. **The GAP INVARIANT was blind and is repaired (`e7ff334`)** — it iterated to `max(existing)`, so
   14 days of total loss reported FEWER gaps than healthy. Use the repaired form (iterate to today,
   print `reached_today`).

**DO NOT RE-CHASE:** the claim that SR-09/SR-11 rest on a false symlink premise is WRONG. The
6-symlink/6-copy split is real, but spec line 697 already records it (it is why SR-09 `git mv`s
rather than deletes), and SR-11 never reads `ops/launchd/*.plist`.

**Verification lesson worth keeping:** `launchctl list` does NOT surface `StartCalendarInterval` —
use `launchctl print gui/$UID/<label>` and count `calendarinterval` event sources. And a check that
confirms an edit landed is not a check that the system still works: run the runner, not the parser.

## CORRECTION 5 — SR-05's battery premise is real but overstated
`AC sleep 0` is genuinely Never; the `1` is **Battery Power only**, and macOS 12's Battery tab
exposes **no system-sleep slider at all** — it is reachable only via `pmset -b`. David was right
that he set Never. Measured across the 8 days `pmset -g log` retains, the machine was asleep at
BOTH 06:15 and 06:30 on **exactly one day (08-17), and that was on AC** — there is no observed
battery-caused miss. Missed intervals **coalesce into one run on wake**, so an unplugged morning
yields a LATE capture, not none. The unaddressed worst case is the lid staying shut all day, which
no sleep setting fixes. Do not re-quote the spec's "wakes 06:00, sleeps 06:01" as an established
daily loss.

## ~~Open, needs a network call~~ ✅ RESOLVED 2026-08-30 (peer lane, DG-101 `ae2309bf` + DG-112 `d5f4ede4`)
**DATABRICKS IS FULLY RETIRED on David's ruling** — workspace job destroyed, zero jobs remain,
`infrastructure/` deleted from the repo, local `.databricks/` cache cleaned.
**The scare was latent, never real:** `refresh_genius_state` (declared `pause_status: UNPAUSED`,
Quartz `0 * * * * ?` = every minute) had **ZERO runs, ever, and was PAUSED live the whole time** —
dev-mode bundles auto-pause, so the repo's UNPAUSED never took effect. The master plan's billing
alarm never fired a cent. Keep the lesson, not the alarm: **a declared schedule in a bundle is not
a running schedule — measure the workspace, never infer cost from the YAML.**

See [[david_rulings_dg3]] and [[project_dynasty_genius]].

**⭐ D6 (08-28) — FOUR LANDS IN ONE MORNING, all on David's remote decision panel (~08:30;
verbatim answers in [[david_rulings_dg3]]).** First post-swap morning fully green first: 06:15
nflverse / 06:30 league-transaction / 06:45 ff-playerids (first scheduled fire) all on the dot;
09:00 chain first scheduled fire ALL SIX STEPS OK; 22:00 cockpit backup had auto-committed and
pushed overnight (first auto-commit since 08-09), exiting 1 loudly on the autonomy lane's red
verify — the preserve-then-scream design working. Lands, each TDD + adversarially reviewed
pre-land (3-refuter panel, 9 minor findings, 2 fixed pre-land, 0 blocking):
- **DG-082** `27ab6af2` — guard's launchd idle-doze fixed: HYBRID schedule (96-slot explicit-hour
  calendar lattice :02/:17/:32/:47 + kept StartInterval 900 + RunAtLoad) + alert class (h) now
  one line per LABEL (was per slot). Swapped same morning; first lattice tick proven 09:02:00.
  Two derive/alert traps documented in the ticket (Hour-default-0; per-slot spam).
- **DG-083** `SR-10a` — only step 3 was unbuilt (1/2/4/5 had landed via DG-044): capture-health
  StoreScheduleDrift block, config v3 chain_step wirings, OpenAPI purely additive (regen-trap
  law observed). Review's minor: drift block presents yesterday's report without a freshness
  qualifier — follow-up candidate, not held.
- **DG-084** `SR-14` — driver maps valuation xvar; daily_diff guards ALL THREE delta sites (the
  third — dynasty_value_score, 115 live NULL rows — found by the review, fixed RED-first
  pre-land). NO backfill: 468 historical rows stay honest NULLs. dvs_pct stays NULL until the
  upstream universe_pvo_batch.py:99 defect is fixed (follow-up ticket candidate). **BOTH PROOFS PASSED Sat 08-29 09:00: 468/583 rows real xVAR (range −101.65..+58.05); the fabrication check passed ON THE ACTUAL TRANSITION MORNING — model.deltas=0, status vintage_changed_no_score_delta. Wed 09-02 glance is a formality.**
- **DG-020** `ac8ac4a4` — market history 4 → 480 dates: dp_archive monthly 2021-02→2025-06
  (commit-date-anchored, delta-0 proven) + fc_history_api daily 2025-07-01→2026-08-27 (FC's own
  per-player history endpoint; TODAY-anchored universe = survivor bias, disclosed in the label
  fantasycalc_history_api_survivor_biased). Fixed folds 2020-2023 resolve to byte-identical
  original rows — QB-1 record cannot shift. Gate caught the STALE-WORKTREE trap: the 08-19
  worktree's symlinked footballguys dir breaks `git check-ignore` (exit 128) — today's dg-work
  MUST_BE_REAL fixes it; worktree was rebuilt from origin and re-landed. **DB INSTALL to trunk
  pending ~10:15** (43MB, sha ad17d82d…, held in session scratchpad fc_snapshots_backfilled.db —
  copy over app/data/fc_snapshots.db; gitignored, code-only merge).
Sprint tail now: SR-12 (needs David at the machine), SR-19/D8 rollover + SR-09 close, SR-13
(D9), D10 buffer. DG-017 marker settled; class (c) settled (skip).

**⭐ D7 SATURDAY 08-29 — THE DAY THE PRODUCT GOT ITS FIRST REAL USER. Four lands/executions +
the sitting + two first-user tickets, David AT the machine all day.** Morning survey: everything
green (chain 6/6 drift 0, guard lattice 09:02, cockpit+GCS backups clean, repos level).
- **DG-086 LANDED + LIVE** (merge `c7409cab`): compute_dvs_pct_batch wired as the one authority
  (David: "wire the existing calculator"). Panel BLOCKING pre-land: frontend percent() ×100 bug
  would have shown "7780%" — disarmed. **Honest number is 388, not the ticket's ≥400** (80
  prospects NULL by spec 5.14). LIVE PROOF 14:00 refresh: 388/388 in the serving artifact.
  dvs_pct_as_of deliberately never enters the artifact (semantic-hash volatility; pinned).
- **SR-19 REHEARSAL EXECUTED** (pulled forward on his word): outcome (b) clean refusal ("no rows
  for inference season 2026", exit 1, no lock, no partial), then the refusal proven THROUGH the
  chain runner (feature_refresh failed, chain carried on; market's scratch-only tracked-pair
  abort documented as NOT applying live). **SR-09 close = Tuesday paperwork only** (finding-A
  spec amendment + mark closed). B1 proof was never formally recorded — now recorded in DG-045.
- **DG-087/SR-12 LANDED + INSTALLED** (merge `39c61ece`): dynasty-api KeepAlive agent (Throttle
  60, penalty-box remedy corrected) + DG-050 weekly replay-verify (Mon 12:00; first receipt via
  guard backfill kick minutes after bootstrap: verdict REPRODUCED, 20 checks). Sitting by session
  hands on his word; **frontend dist was a WEEK stale (built Aug 22, five UI lands unserved) —
  rebuild-after-pull is now the ritual, in README.** David: **"ok now i see it."**
- **DG-089 LANDED + LIVE** (merge `e68aac07`): David's OWN first-user find at ~11:10 ("no cards
  are displaying") — front-page movers weren't clickable. Built TDD same day; panel BLOCKING
  caught in a REAL browser what jsdom can't (width:100% shattered rows into 105px stacks) —
  fixed, re-proven in Chromium (43px rows, click→inspector end-to-end). Quiet-day roster rows
  wired too. visual-smoke harness repaired and ran FOR THE FIRST TIME EVER → exposed pre-existing
  5px tape overflow + 46-node contrast debt → **DG-090 filed** (post-freeze). DG-088 filed
  (pool tied percentiles — David's ruling; post-freeze, changes ratified formula).
- Also: GitHub PAT ROTATED + old revoked (dead strings everywhere); keychain git auth verified
  intact post-revocation. 10:30 alert = heartbeat + ONE honest line (pvo retry refusal, benign
  first-capture-wins; may repeat while afternoon content drifts). Sprint tail: **Tue 09-01 =
  15-min Tuesday check + SR-09 close paperwork; Wed = SR-13; then buffer to the 09-04 freeze.**

**⭐ D6 NIGHT SHIFT (08-28 evening, David's remote panel: all four lanes + "land the safe ones") —
FIVE MORE LANDS + THE FALSIFIER VERDICT.** Landed through gate + 5-refuter adversarial review
(2 BLOCKING findings on DG-028 closed RED-first; ~13 minors, 6 fixed pre-land): **DG-028**
(seeing no-mutation guard, 10 registry artifacts + serving-binding checks — manifest-key hijack
and the v1-fallback scan were the blockers; engine_b v1 fallback custodially REGISTERED
`5c52f811…` + backup-covered when the anti-rot contract fired at the gate), **DG-057**
(TrainingSpec sidecars + verify_artifact; 10 grandfathered shas PINNED byte-for-byte;
engine_b/rookie loaders deferred to DG-058 deliberately), **DG-050** (replay harness: 16 streams
replay live, 19/20 reproduced + 1 named legacy vintage; FOUND+FIXED a real §6.2 violation — fc
int-volatility hash shape, pre-fix rows classified legacy_content_shape; sanctioned as the five
ingestion walls' second exemption; NOT scheduled — ops decision open), **DG-054**
(dg_name_normalizer.v1 frozen, hypothesis-proven; sentinel/bytes hardening fold-side after the
property suite caught 'ÑA'→'na' idempotence breakage; consumers unmigrated by law), **DG-085**
(chain_report_stale basis). **DG-086 filed** (universe_pvo_batch xvar_percentile_position, the
dvs_pct blocker). **DG-017 FALSIFIER (report-only, `69b6c194` on ticket/DG-017, never lands):
FIRED — usage-family weight 9→30/0.3→12/3→32/1→35% (QB/RB/WR/TE) under scaled+tuned refit,
accuracy within noise; deployed pkls replay-verified byte-faithful. DG-001's attribution falls
as football-fact, stands as artifact-description; coefficient shares from this family are
fit-dependent and must NOT be quoted as what-drives-production; DG-017 fix stakes re-priced =
honesty, not RMSE. Report: docs/experiments/2026-08-28-dg017-scaled-refit-falsifier.md on the
branch.** Land-gate lessons recorded: ingestion walls + QB-1 consumer wall both fired on
legitimate new reference classes (verifier, prose citation) — sanctioned explicitly, never
dodged; the anti-rot backup contract fired on registration — coverage obligation honored.

**⭐ D7 NIGHT (08-29, second front — the gap-audit session): DAVID DELEGATED THE OPEN DECISIONS
("u decide") AND ELEVEN TICKETS + THE QUEUE WERE FILED (dg-build `483dac5`, pushed).** A 14-agent
vision audit ranked the most work: (1) models/edge (7/10, mostly calendar-gated ~Sept/Dec),
(2) UI/UX (7/10, startable now), then layers (on plan, not behind), inventory, roadmap, board.
Filed on the delegation — DG-093 League Activity (committed ≤09-17, was ticketless), DG-094
Ruling-07 fix (delta_status winner verdict, trade_analyzer.py:231), DG-095 Ruling-10 fix (taxi
sort / cut_priority ordinals / partner_score; sentinels 0 AND -1 preserved), DG-096 RPL-1..4
replay program (spec :1571-1579 — 21/39 groundable, picks may cut to ~5), DG-097 clock (thin
slice of DG-078), DG-098 A1a ledgers, DG-099 Engine A rebuild (off-season), DG-100 nflverse
vintage backup — DECIDED: incremental raw/ channel (1,546 flat files, ~30GB one-time), NOT
nightly full-upload (4x payload, ~2.5h runs past the 10:30 alert, ~333GB/mo bill growth),
DG-101 stale-doc banners + Databricks EVIDENCE check (retire/wire ruling stays David's, MASTER
:814-822/:265), DG-102 dg-land gate is pytest-only (bin/dg-land.sh:92 — blind to frontend),
DG-103 decision_supported criteria + outcome-finality PROPOSAL (ratification stays David's,
§8.5). **IN-SEASON-QUEUE.md at dg-build root is the ordered queue** — delegation recorded
verbatim in its header (it existed nowhere greppable — a verifier finding). The two spec
"first after kickoff" claims are reconciled there: PERF-1 = first CODE land, CAP-9 = first OPS
item (first real run Tue 09-15). All filings 3-lens adversarially verified pre-commit (1 major
false evidence line + DG-096/DG-101 scope errors fixed). Parallel night session coordinated
live (SendMessage): its four David rulings — DG-091 venue=STUDIO via Tower, DG-090 split,
mail-carrier retired, DG-092/SR-13 tonight — are untouched; DG-092's board row is theirs.
**Freeze day 09-04 is a FRIDAY** (a briefing had said Thursday).

**⭐ D7 NIGHT (08-29 evening, second session, David present) — TWO MORE LANDS + THE SPRINT
TAIL COLLAPSES TO ONE 20-MINUTE TUESDAY.** His four panel picks + THE PROSE RULING are
verbatim in [[david_rulings_dg3]]. Executed: **DG-092/SR-13 LANDED `1d2a5c89`** (lambda guard;
spec's three proofs verbatim; constants untouched — Wed D9 FREED) · **DG-090-A LANDED
`232fc0c1`** (tape overflow; Problem B → DG-091) · **SR-09 finding-A spec amendment pushed
`48fa1e7d`** (both chain proofs gain scratch --report-path; SR-19 block superseded by the
--step-extra form; **done-mark stays Tue 09-01 — Tuesday is now the 15-min check + a 5-min
done-mark, NOTHING else; Wed/Thu/Fri all buffer to the Fri 09-04 freeze**) · trunk pulled to
`48fa1e7d` + dist REBUILT (ritual) + live :8000 verified serving the new bundle ·
**dg-mail-carrier zombie RETIRED** (bootout + persistent disable; was firing every 30s into a
deleted script) · **DG-091 DESIGN BRIEF drafted** (`~/dg-build/DG091-DESIGN-BRIEF.md`, 4-audit
evidence base) then REWRITTEN around David's prose ruling; venue RULED Studio-via-Tower.
**⚠ DISCOVERY: the daily-open axe gate (visual-smoke.spec.ts:453) is NONDETERMINISTIC** —
3 pass/4 fail over 7 same-tree runs; real debt ~39 nodes fg #767a7e = 3.97:1; Playwright is
not in the land gate, but any lane running it on main coin-flips until DG-091 retires the
debt; never exclude the color-contrast rule; rendered fg differs from the declared
--dg-text-muted — find the dimmer before retuning. Parallel session filed DG-093..103 +
IN-SEASON-QUEUE.md the same night (its DG-091 program order: DG-076 → DG-043+090B → arm gate
→ restyle; design DG-098's pre-reveal touchpoint INTO the rebuild). Freeze day is FRIDAY.

**⭐ DG-091 PROGRAM PHASE 1 COMPLETE 2026-08-30 early AM (David: "create a sub agent workflow with
tower, studio and whoever else is needed - and start building").** Structure that worked and is
worth repeating: Tower seat (read-only preflight, ruled every scope capture-safe) + a FIREWALLED
Studio fresh-eyes seat (designed from the LIVE :8000 surface only — no tickets, no source, no
internal vocabulary; ~/frontend-studio never touched) + crew build lanes each through a 3-refuter
panel. Deliverables: **`~/dg-build/DG091-STUDIO-SPEC.md`** (the design proposal — morning-brief
direction, rail 11→5, verdict-first front page, player-card rebuild, copy dictionary with the rule
that no underscore/ALL_CAPS token may reach the DOM) + 42 screenshots in
`preserved/2026-08-29-studio-shots/`. **ALL FOUR FOUNDATION TICKETS LANDED AND DEPLOYED:** DG-104
`67cf9f8b` (linter re-scoped — 3 BLOCKING panel defects closed, incl. a prose bypass of the field
gate and five tier-readiness components that would have reported `pass` for a deleted check),
DG-076 `6bf4a155` (build manifest; `source_dirty` now required — a dirty tree can no longer stamp a
false clean sha; frontend half only, health-endpoint half DEFERRED), DG-043 `555fb7e4` (player-card
labeled pairs LIVE; 390px overflow 776→390 proven in-browser), DG-105 `bc065e24` (raw-literal debt
retired on 4 surfaces; **the axe flake is DEAD**, 0/10 — but the bundles achieve it under
`prefers-reduced-motion`, so the default-motion path readers see has NO axe coverage, and the 4
converted surfaces are visited by no axe scan at all). Trunk `bc065e24`, vitest 343/343, dist
rebuilt, live serving verified. Filed DG-108 (backend players.py still strips David-facing evidence
with the repealed vocabulary). **⚠ A 4.6s players-API number was measured and REPORTED, then RETRACTED as contaminated** — this
session's own DG-105 flake-under-load test orphaned 36 CPU busy-loops (load 63-84 for ~90 min).
The trap, now known: in a non-interactive `zsh -c`, **`jobs -p` returns no background-subshell
PIDs**, so `kill $LOADPIDS` kills nothing and the loops orphan to PID 1. Capture `$!` explicitly or
trap. Re-measured clean 2026-08-30 (load 1.57): **card renders 199ms after click; API 0.135-0.273s;
/api/health 0.35s. NO latency problem exists — the whole observation was contamination, not just
its number.** Lesson: a contaminated measurement contaminates the impression formed beside it. A run halted mid-flight on
usage-credit exhaustion and resumed cleanly: builds were committed+pushed before the halt, which is
why nothing was lost — push ticket branches early, ~/dg-wt is in no backup.

**⭐ DG-091 PHASE 2A LANDED + LIVE 2026-08-30** — DG-109 `59bab53e` (copy dictionary + ENFORCED
render rule: no underscore/ALL_CAPS in visible text, aria-label, alt, placeholder; two declared
exempt subtrees `[data-receipt]`/`[data-user-text]`), DG-111 `002a26bd` (caveat furniture retired
across all seven surfaces — the six-per-page "Descriptive only — not decision-grade" stamps GONE;
16 replacement strings recorded verbatim in its ticket), DG-110 `921ec892` (global player search,
every dead end closed, search no longer mutates the persisted trade draft). Trunk `921ec892`,
vitest 402, dist rebuilt, **independently verified in-browser: front page + player card 0 raw
tokens at 1440 AND 390, no overflow.** 52 panel findings fixed.
**THE LESSON THAT MUST SURVIVE THIS PROGRAM:** the honesty lens caught THREE BLOCKING defects where
the new prose stated FALSEHOODS the raw token never claimed — `no_market_overlay` rendered as
"Nobody is quoting a market price for him" on a card printing "Market value 5204"; a rollup `ok`
rendered as "Nothing needs attention" when the backend explicitly declines that claim. **Replacing
a token with prose is an act of AUTHORSHIP: confident prose can lie in ways an opaque token cannot,
so every mapping needs its PRODUCER read, not a plausible reading.** Also learned: axe reports
COMPOSITED colors (blending ancestor opacity) while getComputedStyle reports the CSS value — axe is
right; and scanning a surface with no backend yields an error state with zero rows and a small
clean violation count, i.e. a FALSE a11y receipt. Full record: `closeouts/2026-08-30-D8-phase2a-closeout.md`.

**⭐ D8 SUNDAY 2026-08-30 — BACKEND/OPS LANE: 4 LANDS + DATABRICKS RETIRED + THE VINTAGE RECORD IS
OFFSITE.** (Frontend lane ran DG-091 in parallel; its record is its own.)
- **DG-100 LANDED `874023ab` + BACKFILL COMPLETE.** The nflverse vintage record — 31.8GB /
  1,584 dated snapshot files, previously in NO backup and invisible to the anti-rot scan
  (*.db only) — is offsite and sha256-verified, every object checked by download-and-compare.
  New channel `scripts/backup_nflverse_vintages.py`: additive-only to one stable prefix,
  per-file verify, quiesce gate (the capture writes raw snapshots with plain `write_text`, so a
  young file may be half-written), `--no-clobber`, fail-closed listing parse. **Daily run
  measured at 13s / 0 uploads.** Anti-rot extended: any >1GiB app/data tree without a backup
  decision now fails the contract.
- **DG-107 LANDED `9c020e5c`** — guard registration; dry-run 13 jobs, 0 unconfigured,
  **`kicked: []`**. Plist bootstrapped 07:34 on David's "install it" → **15 dynasty labels**.
- **DG-101 `ae2309bf` + DG-112 `d5f4ede4` — DATABRICKS RETIRED on David's word.** Workspace job
  destroyed, 0 jobs remain, `infrastructure/` deleted, local `.databricks/` cache cleaned.
  **⚠ CORRECTION TO THE MASTER PLAN'S "URGENT" ALARM (:814): the job NEVER RAN — 0 runs ever,
  live schedule PAUSED all along (dev-mode bundles auto-pause, so the repo's UNPAUSED never
  took effect). Zero compute billed. The risk was LATENT (a `-t prod` deploy would have armed
  a job firing 60×/hour), never active.** Doc banners on roadmap.md + storage-strategy.md.
- **DG-106 FILED (post-freeze, needs David's choice):** `contracts` re-dumps the whole table
  every capture — **19.30GB in 14 files, 61% of the tree**, ~1.6GB each, daily. This falsified
  my own "~$0.60/mo" figure in DG-100: real growth is ~1.7GB/day ≈ 51GB/month compounding.
  Remedies: weekly cadence / content-addressed pointers / gzip.
- **MACHINE RESCUE:** 36 orphaned CPU busy-loops from the frontend lane's flake-under-load test
  ran ~45% CPU each for 90+ min — **load average 63**, `/api/health` 8.75s. Killed → health
  0.35s. Root cause: `jobs -p` does NOT return background subshell PIDs under `zsh -c`, so its
  cleanup `kill` killed nothing.
- **THREE FALSE SIGNALS IN ONE MORNING, ONE ROOT — a single reading is not evidence until you
  check the conditions it was taken under:** (1) the 4.6s players-API "defect" was pure load
  contamination (clean: 0.13-0.27s API, 199ms click-to-render; fully retracted, no ticket);
  (2) a 62ms response that was a **404** nearly became a false all-clear — check the status
  code; (3) MY OWN pause-guard falsely reported "backfill still running" because
  `pgrep -f <pattern>` matches sibling monitors naming the pattern — two watchers matched each
  other. **Monitor STATE (the receipt a run writes), never process names.** Nothing harmed.
- **Kill test nobody planned:** a backfill batch killed mid-run left 8 complete verified objects,
  **ZERO partial objects**, and NO marker — the append-only contract proving itself under
  abnormal termination.
- Known, deliberately unfixed pre-freeze: the daily sync sha256s all 31.8GB to learn sizes it
  could `stat()` (~10s CPU/day); one-line fix, post-freeze.


**⛔ SPRINT TAIL — CORRECTED 2026-08-30 by an adversarial closeout audit. The line "the tail is
only Tuesday 09-01" was FALSE and is retracted.**
- **MON 08-31: two launchd jobs have NEVER fired** (`launchctl print` → `runs = 0`): 07:00
  `dynasty-nflverse-vintage-sync` (the peer lane calls it "the last proof needed before the
  freeze") and 12:00 `dynasty-replay-verify` (DG-050's first scheduled fire).
- **⛔ THE TUESDAY CHECK IS STRUCTURALLY BLIND — fix it before Tuesday.** The spec (:1035-1037)
  reads `launchctl list`'s exit-status column expecting 0, **but that column reads 0 for a job
  that has NEVER RUN** (proven on five labels; all three Tuesday-only jobs show `runs = 0`). Use
  `launchctl print gui/501/<label> | grep -E 'runs|last exit code'` and require **runs ≥ 1 AND
  exit 0**. Same failure class as this session's two retractions.
- **A "15 labels, all exit 0" ops green line is materially misleading**: 5 of 15 have never run.
- Wed-Fri buffer minus **DG-102** (pre-freeze on its ticket/board/queue, now unblocked).
- **PLUG THE LAPTOP IN**: battery `sleep 45` vs AC `sleep 0`; macOS never replays
  StartCalendarInterval jobs it slept through.

**⚠ SELF-CERTIFIED CLOSEOUTS ARE NOT TRUSTWORTHY — this session proved it twice.** A 3-auditor
read-only sweep over its own closeout found: a FALSE tail claim, a landed ticket (DG-105) with no
board row at all, the program's controlling ticket (DG-091) still reading "todo · POST-FREEZE ·
nothing built" after two phases landed, and a resume brief (DG-045) still instructing work that
had already landed. **Audit the closeout before the user reads it.** Also corrected: do NOT
generalise the latency retraction to "never slow" — a cold first request measured 10.26s, then
0.209s; cold-start latency is real and unmeasured.

**⭐⭐ DG-091 FRONTEND PROGRAM COMPLETE 2026-08-30 — TEN TICKETS, ~24 HOURS, ALL LIVE.**
Full record: `dg-build/closeouts/2026-08-30-DG091-PROGRAM-COMPLETE.md`. Phase 2B lands: DG-115
`d18c4610` (token foundation + the verdict-hue ban RE-POINTED, not deleted — red/green legal only
in `--dg-up`/`--dg-down`, still fails on buy/sell styling), DG-117 `ceba40e1` (the 185px/665px
page-scrolls fixed), DG-116 `d9a89b87` (Trade Lab rebuilt; both pricings plainly, no blended
verdict), DG-114 `ba2e25a6` (rail 11→5, parked out, **390px bottom-tab phone shell**), DG-113
`58f5016f` (verdict-first morning read + "Worth a look" recommendation cards), DG-118 `89110a22`
(the gate: 3 URLs → 23 tests over every destination at both widths under both motion paths, with
a COVERAGE LOCK). Verified live: 7 surfaces × 2 widths, zero overflow, zero raw tokens; suite
402→575. **ACCEPTANCE IS DAVID'S WORD ON A SEASON MORNING — NOT YET GIVEN.**
**THE STRUCTURE THAT MADE IT TRUSTWORTHY (repeat it):** Tower seat (read-only preflight) +
FIREWALLED Studio seat (designs from the LIVE rendered product only — no tickets, no source, no
internal vocabulary; ~/frontend-studio never touched) + crew lanes behind a 4-refuter panel with
an HONESTY lens weighted heaviest. ~160 findings fixed pre-land.
**THE ONE LESSON ABOVE ALL:** replacing a raw token with prose is an ACT OF AUTHORSHIP — confident
prose lies in ways an opaque token cannot. DG-113 read the producers and KILLED THREE OF THE
DESIGN SPEC'S OWN EXAMPLE CLAUSES as unsupported. **Read the producer, never a plausible reading.**
**AND THE FAILURE MODE THAT RECURRED THREE TIMES IN ONE SESSION** (orphaned busy-loops faking a
latency defect; a retraction that was itself half-wrong; "the tail is only Tuesday" being false):
**a reading taken without checking the conditions behind it.** Same shape as the old visual gate
lying (3 pass/4 fail on one tree) and `launchctl list` reporting exit 0 for a never-run job.
**⭐ DG-091 FINISHING PASS 2026-08-30 (David: "do the trade partners view and the raw token") — BOTH
LANDED + LIVE, program now 12 tickets.** DG-119 `6f766032`: partners view → "Who to call", framed
cards with one producer-entailed sentence each, **6,401px → 1,378px (−79%)**, caveat 11→1.
DG-120 `b1c532d7`: receipts now split **IDENTIFIERS (stay raw + copyable — they are addresses)**
from **MESSAGES (must be prose)**; the render rule now FAILS a snake_case message inside
`[data-receipt]` so the exemption cannot be a hiding place. Suite 575→621.
**THE FINDING WORTH KEEPING FOREVER:** the partners card printed *"How recently they've traded —
0.00"* for all eleven teams. `activity_recency_score` is a **literal 0.0** at
`league_opportunity_map.py:185` — never computed, no input exists. **The product was telling David
his league had been quiet, from a number that was never measured.** A zero is not a measurement
until you read its producer; the copy now says the part is not tracked, and a test couples that
sentence to the producer literal. Same family as the three earlier false-prose catches — **read the
producer, never a plausible reading** — and the sharpest instance, because this one asserted a
football fact about his league.
Also filed, unbuilt: **DG-121** — the served-bundle-drift detector (DG-076's deferred half; the
week-stale bundle of 08-29 has a README ritual and no detector).


**⛔ 2026-08-31 — THE DG-091 CLOSEOUT WAS AUDITED AND WAS WRONG IN NINE PLACES. Corrections:**
- **FIFTEEN tickets landed, not ten or twelve** (both numbers appeared, in four different
  artifacts). **EIGHT nav surfaces, not seven.** The gate is **25 tests, not 23**, and its
  determinism was **4 consecutive runs on the 23-test version**, not 8/8 — the 25-test gate has
  never been shown stable. **"~160 findings fixed" is UNSUPPORTED** — 13 of 15 tickets carry no
  acceptance record at all.
- **"Zero raw pipeline tokens on screen" is FALSE as plain English.** `renderRule.ts:140` audits
  aria-label/alt/placeholder but **NOT `title`**, by design (`:35`) — and raw keys are actively
  placed in `title=` on visible prose (`model_multi_vintage_ambiguous`,
  `thin_unrostered_pool_below_min_4`, …). → **DG-123**
- **LEAGUE IS UNBUILT AND WAS REPORTED CLEAN: 35,475px at 1440** (26× the partners view the
  closeout celebrated cutting 79%), 8 cards none naming a team, one sentence rendered 16×,
  "Unknown team" ×6 while the payload carries the names. **The visual gate passes it — it has no
  page-length or repetition assertion.** → **DG-122**
- **A SECOND saturated scoring term** one line above the one DG-119 caught
  (`divergence_density_score` = 1.0 for all 11 partners). → **DG-124**. Wider rule earned:
  **never describe a component as a reason for a ranking without first proving it VARIES across
  the rows being ranked.**
- **THE LATENCY RETRACTION WAS OVER-CORRECTED — third error on one issue.** `/api/health` measures
  **4.577s COLD**, 0.34-0.40s warm. The original 4.6s was real as a cold-first-hit; "no latency
  problem exists" is as wrong as the original claim. **A correction is a NEW CLAIM that needs its
  own evidence, not a licence to generalise in the opposite direction.**
- **"Nothing can be silently slept through" is a power READING dressed as a guarantee** — AC
  `sleep 0` kills idle sleep only; lid-close still sleeps; unplugging restores `sleep 45`.
**THE STANDING PRACTICE THIS EARNS: audit the closeout with independent read-only agents BEFORE
the user reads it. It has now caught serious errors twice running.**