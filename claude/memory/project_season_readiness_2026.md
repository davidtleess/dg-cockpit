---
name: Season readiness sprint 2026
description: The 2026-09-10 kickoff deadline, the approved architecture plan, the build spec, and the corrections that bind future work
metadata:
  type: project
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
   It clears. **Retry before reporting a broken test loop.** Healthy state: ~6,258 pass / 17 fail
   (all in-flight work) / 12 skip.

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

### NEXT: SR-11 (D4) — start it FRESH
Largest remaining ticket, **Tier 2 (touches launchd)**, and the only detection channel that will
exist. Still open: the `contracts` upstream schema break (fails 06:15 daily, holds the export
marker at 08-08; no downstream consumer — filed, deliberately unfixed).

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
