# David's rulings — DG 3.0

**His words verbatim. Never paraphrased. This file is the record when nothing else is.**

---

## 2026-08-26 morning — SR-11 day (DG-044)

> **"its now tomorrow morning. check the time and do the set up items if we are ready"** (~05:52)
> **"you can decide where it's best to build"** (~06:0x — venue delegated; built in-session)
> **"ok let me know when youre ready"**

**Settled by execution:** after the ready report, David ran the install one-liners himself (symlink
07:13; bootstrap attempt 07:15, failed with the expected dangling-link error — harmless, re-run
post-pull). Running the install steps was taken as the go for the land; DG-044 landed `b1b888be`.
The banner-rendering question (probes 08-25 + 08-26 06:06) was **ANSWERED YES same day** — after
missing the 10:30 window (*"I missed it...its now 1133"*), David ran bootstrap + kickstart at
12:00, the alert fired through launchd (runs=1, exit 0, both GAP lines + heartbeat), and he
confirmed: **"yes i saw the banner"**. SR-11 visible-notification acceptance met.

**~12:40 — "go"** on the three-ask decision batch (presented after a 10-agent adversarial panel
attacked the afternoon plan itself; all three asks were in one message and "go" answered it):
1. **The beyond-spec (h) behavior is RATIFIED** — the alert delivering a swallowed 10:30-slot
   report on its first run after a gap stays.
2. **DG-035 option (a) is DEFERRED post-season** — the recommendation he accepted: Tier 2 scope
   six working days before freeze; SR-11's loud gap is the accepted minimum. The
   producers-need-GUI-session premise is UNVERIFIED — verify before any future YES executes.
3. **SR-09 steps 1-5 pulled into the 08-26 afternoon** — a sanctioned DEVIATION from the D5-D6
   calendar (worktree only, nothing lands 08-26, install stays D5/D6; Thu land only if Thu's
   10:30 alert fire is silent+heartbeat AND DG-041's Thu acceptance is clean, else Fri EOD).
   Bundled in the same go: Tuesday-1 baseline capture, hygiene sweep (inventory/copy only),
   clearing the retired Air's stale lane claims on DG-014/015/020.

**~13:45 — "1 yes. 2. pre freeze. 3. yes"** (answering the layer-roadmap decision set):
1. **DG-046 builds TODAY** — wire the common-cohort divergence rebase into the daily job.
2. **The ff_playerids crosswalk capture is PRE-FREEZE** — the time-perishable L2 item lands
   before 09-04, not post-season.
3. **The layer roadmap is RATIFIED** — convert all 31 drafts to board tickets
   (`~/dg-build/ROADMAP-LAYERS.md`, commit `1693ad5`). Sequencing criterion stands in his words:
   *"as we fill the layers my edge should get more real."*

**~16:15 — "fix the marker"** — approved writing the truthful failed-run incident record over the
killed run's permanent `running` state in the production nflverse status marker (the classifier
had blocked the unapproved write, correctly). Written, verified via the DG-049 attestation
channel, incident closed in the DG-048 ticket.

**~15:40 — "retire daily control and do DG-039"**:
1. **DG-048 RULED: Daily Control is RETIRED** — superseded by SR-11's alert + the capture-health
   surface. Retire loudly: nothing may read the Aug-8 marker as current health.
2. **DG-039 goes** — the blocked-audit-writes-nothing fix builds now (sprint slack).

---

## 2026-08-25 evening — the DG-041-first sequencing, then DG-022

> **"go"** (on the recommendation: DG-041 today with the trunk pull held until after DG-023's
> 08-26 confirmation run, then DG-022)
> **"ok go"** (proceed to DG-022 — the 08-19 WIP resume)
> **"ok"** (execute the recommended closeout sequence)

**Settled by execution:** DG-041 landed `b797ee1f`; DG-022 landed `20807368` (real-surface QA
proven); his parallel session landed DG-042 `c2b11f0a` (PPG guard, closes SR-21) the same
evening. Trunk pull held at `a61f0fbe` for the single-variable DG-023 morning check — releases
post-window 08-26. Evening closeout ledger commit `f7a663da`; `origin/main` closed one commit higher at `2bf91d8d`
(the DG-042→DG-043 ledger correction) — verified via ls-remote 2026-08-25 ~22:00.

---

## 2026-08-25 morning — everything lands on `main`; the merge and the trunk switch

> **"lets do the merge then we can compact in that order"** (early morning)
> **"land on main. go ahead with 21 and 29. sound good on the sequence."**
> **"go ahead"** (the deployment: trunk switch + producer regen, post-window)

**Settled:** `feature/outcome-loop-week1` merged to `main` (`d33c9896`) and is retired as a
landing base; all future tickets land on `main`; the trunk itself runs `main` (switched 10:21 EDT,
producers confirmed running from it — DG-021's 11:30 scheduled-run proof). The approved sequence —
recreate worktrees, close DG-029 + DG-004, then DG-021 — executed and closed same day. DG-023 was
his parallel session's lane the same morning (landed `b4662707`, filed DG-041).

---

## 2026-08-19 06:32 ET — Engine B PPG counts ALL GAMES

> **"all games"**

Answering: does Engine B's points-per-game mean regular season only, or every game played?

**Settled:** postseason games count. `fetch_and_agg_stats` having no `season_type` filter is
**correct by decision, not a defect** — do not "fix" it. No rerun of Engine B, P90, replacement,
xVAR or calibration. The six players who clear the eight-game gate only via postseason stay in.
The 160-of-162 PPG difference is the definition working, not drift.

**Outstanding:** the definition still needs writing into the code beside `fetch_and_agg_stats` and
into the Engine B feature contract. Crew work — Tower does not edit the product repo.
Ticket: `~/dg-build/tickets/DG-024-DECISION-ppg-definition.md`.

---

## 2026-08-19 06:36 ET — Tower commits to the product repository

> **"commit the agents.md hook"**

Preceded by **"then commit it as the opening hook for every agent in DG"** (2026-08-18 ~23:0x).

**This overrides the charter's "You never edit the product repository."** Tower raised the boundary
once, was instructed a second time, and complied. The charter's own tie-break — *the instruction that
narrows wins **until he says otherwise*** — was satisfied: he said otherwise, explicitly, twice.

**Do not treat this as a general licence.** It authorised one doc-only commit of the parallel-work
protocol. Product code, models, data artifacts and the registry remain outside Tower's hands. If a
future Tower is asked again, the same sequence applies: raise it once, then do as he says.

**How it was done, and the care is the point:**
- Confirmed `AGENTS.md` was clean first — 56 unrelated dirty files in the tree belonged to others.
- `git add AGENTS.md` only. **Never `git add -A`.** Dirty count was 56 before and after.
- `feature/outcome-loop-week1` → `16a1e54`; `main` → `552733c`, applied in a throwaway worktree so
  main took exactly ONE commit and none of the branch's 7 feature commits.
- Both refs verified to carry the hook; pushed and confirmed arrived.

---

## 2026-08-18 ~22:44 ET — governance to near zero

> **"and i want the governance turned down to near zero. i still see value in the fresh eyes of
> studio but im ready to let the crew work freely and the judge to have its own free thinking.
> as well as you, tower."**

Retired: per-ticket approval gates, the three-label ritual, blocking foundation checks, mandatory
falsifiers, verify-lane separation, entry/exit criteria, and the Layer 1 catalog's ten-checkbox gate
on opening Layer 2.

**NOT retired, and he restated Studio's worth in the same sentence:** the Studio firewall (Studio
never receives our tickets, roadmap or vocabulary — that is the mechanism, not governance), the
six-layer ordering (his own law), and citing what you ran (accuracy, not compliance).

---

## 2026-08-19 06:32 ET — back up dg-build

> **"add dg-build to backup"**

Done: `~/dg-cockpit/backup.sh` now rsyncs `~/dg-build/` (excluding `.git`). Verified 38/38 files
identical, executables preserved. **Content is backed up; dg-build's own git history is not** —
a separate remote for it is undecided.

---

## 2026-08-20 — the season sprint rulings

> **"I approve everything that ... has been finalized today, including the master architecture
> optimization and the ... revision two of the Rules amendment."**

Approves `docs/strategies/2026-08-20-dynasty-genius-MASTER-architecture-and-build-plan.md` and
`...-dg-product-law-amendments-REV2.md`. Committed `ce7b540`.

> **"i will be able to add league activity after week one - but i do need to have it"**

League Activity is **deferred, not cut** — a committed deliverable for week 1 of the season
(on or before 2026-09-17). Its 1.5d returns to **slack, not new work**. The sprint's obligation is to
leave it **buildable**: SR-08 lands the transaction recovery, SR-10a/SR-11 cover the store.

> **"isn't it obvious that we need put the smoke alarm back up? yes - put it back up."**

SR-09 was going to retire the two plists SR-00 had just added retries to. Applied as SR-09 step 7
**b-EXCEPTION**: the chain takes 09:00 only; the two retry plists are **edited, not retired**.
**Four plists retire, not six.**

> **"agreed."** — guard BOTH `daily_diff.py:353` and `:354`, not just 354.

**Also his own action:** set `pmset` scheduled wake to **6:00 AM daily** via System Settings.

**Standing consequence:** the product **will not say buy/sell in 2026**. Not as a rule being argued
around — as an evidence decision. The measured position is that the model carries *no measurable
information beyond `dynastyprocess_ecr_2qb`*, a free source the repo already ingests.

## 2026-08-20 ~21:00 ET — the freeze is adopted

> **"Yes — freeze Fri 2026-09-04"** (SR-03)

Hard freeze **end of day Friday 2026-09-04**, with the four-tier rollback policy. Build window
Fri 08-21 → Fri 09-04 = 11 working days; soak = six consecutive unmodified capture cycles
Sat 09-05 … Thu 09-10. After the freeze **only Tier 0 lands** — a change without which a capture
job does not run or writes wrong data. Every ticket names its tier before it starts; **Tier 3 is
refused for the rest of the sprint**. One stated exception: **pushing commits to origin is not a
product change and is not frozen**.

Three Tuesdays matter, not one: **08-25 and 09-01 are build days, 09-08 is a soak day.** SR-09 lands
by Fri 08-28 specifically so the three Tuesday-only jobs (`league-opportunity-map`,
`roster-capacity-audit`, `realized-outcome-scoring`) get exercised on **09-01 while a finding is
still fixable** and again on **09-08 as confirmation**.

> **"do option A"** (SR-05, 2026-08-20 ~22:40 ET)

Battery idle-sleep raised from 1 minute. **Applied as `sleep 45`, not the ticket's 30** — Tower
flagged that a 30-minute timer from the 06:00 wake expires at exactly 06:30, the same minute the
league-transaction job fires, and David took the wider margin. Verified: Battery `sleep 45`,
AC `sleep 0` unchanged, `wakepoweron at 6:00AM every day` intact. Applied via
`osascript ... with administrator privileges` because `sudo` cannot prompt without a tty.

**Known limit, stated and accepted:** there is exactly ONE scheduled wake (06:00). On battery the
machine still sleeps at 06:45, so the whole 09:00–10:15 cluster waits for the lid. Option A covers
the 06:15/06:30 pair only. A second `pmset repeat` wake near 08:55 would cover the rest — **not
decided, deliberately left as its own call.**

He first pushed back on the battery premise and was right to — see
[[project_season_readiness_2026]] CORRECTION 5 for the measured position.
