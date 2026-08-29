---
name: season-readiness-sprint-2026
description: "The 2026-09-10 kickoff deadline, the approved architecture plan, the build spec, and the corrections that bind future work"
metadata: 
  node_type: memory
  type: project
  originSessionId: 18235550-1462-4db1-ae6b-104ee4ed28e0
  modified: 2026-08-27T20:51:06.685Z
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

## Open, needs a network call
`infrastructure/resources/jobs.yml` declares `refresh_genius_state` `pause_status: UNPAUSED` with
Quartz `0 * * * * ?` — that fires **every minute**, not hourly. Deployment/billing unconfirmed.
Nothing in `app/` or `src/` imports Databricks.

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
  upstream universe_pvo_batch.py:99 defect is fixed (follow-up ticket candidate). **PROOF =
  Sat 08-29's 09:00 capture (same-day re-run correctly hits immutability); FABRICATION CHECK
  Wed 09-02 morning: daily.model.deltas must be small, NOT ~468 — if ~468, revert the driver.**
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
