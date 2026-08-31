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

---

## 2026-08-28 morning — D6 planning (remote decision panel, answered ~08:30)

David, away from the machine, asked to plan the day: **"lets plan the work for the day. ask me
all the questions I need to make decisions on in Lehmans terms. ill answer."** Four decisions
put to him as a panel; his selections verbatim:

1. **Today's build queue:** ALL THREE — "Fix the safety net's alarm" (became DG-082),
   "Register the price-history database (SR-10a)" (became DG-083), "Repair the empty trade
   column (SR-14)" (became DG-084). All three LANDED the same morning.
2. **DG-020 market snapshots:** **"Yes, start now"** — RULED INTO THE SPRINT. Landed same
   morning (4 → 480 dates).
3. **Class (c) chain-report freshness check:** **"Skip it — two checks is enough"** —
   DEFERRED. (The DG-045 open decision is settled.)
4. **DG-017 marker conflict:** **"Mark it: problem confirmed, fix not built"** — settles the
   08-23 board-hygiene question; the fix stays in the post-freeze L3 chain.

Context that shaped the day: the 08-27 D5 sitting had been executed by session hands on his
remote word (his `!` prompt shell cannot reach launchd), and 08-28 was the first post-swap
morning — all green. The launchd pended-interval-spawn finding (guard silent 15h overnight)
was presented as "the watchdog dozes off"; his pick of the fix is ruling 1 above.

## 2026-08-29 morning — Saturday panel, David AT THE MACHINE ("lets plan a full day of work")

Four panel selections (decision-panel options; labels verbatim):
1. **Today's queue:** "Fill the empty trade-value column (DG-086)" + "Rehearse the season flip
   (SR-19)". SR-13 and the SR-08 remainder were offered and NOT selected — they stay D9/unscheduled.
2. **DG-086 approach:** "Wire the existing calculator" — compute_dvs_pct_batch becomes the one
   authority; dvs_pct_as_of stamping is the stated reason. No twin implementation.
3. **The launchctl sitting is TODAY:** "Today — I'm at the machine" — SR-12 (API agent) builds and
   lands today, David loads it himself; DG-050's plist bundles into the same sitting.
4. **DG-050 replay harness:** "Weekly scheduled run" — joins the launchd schedule at weekly cadence.

**Midday additions (second panel + prose rulings, ~11:15–14:30):**
5. **"Yes — build it today"** — front-page movers made clickable (DG-089), after David's own
   first-user session found the gesture dead ("no cards are displaying"). Landed + live same day.
6. **"Pool the ties — file a ticket"** — tied dynasty_value_scores must share one percentile;
   filed DG-088, POST-FREEZE (changes the ratified phase15 formula; his call recorded).
7. SR-12 visible acceptance, his words: **"ok now i see it"** (Daily What-Changed rendering in
   his browser, no terminal). Recorded in the DG-087 ticket.
8. **Evening, closing the session — the first-user verdict, verbatim: "to be honest the front
   end was not great."** Asked what grated, he selected ALL FOUR offered dimensions: how it
   looks · too dense/cluttered · confusing words and numbers · hard to find things/clunky.
   Filed as **DG-091** — a DESIGN mandate, not a bug list: proposal-first (freeze-safe docs,
   can draft in D10/soak), build post-freeze, candidate window season weeks 1-2 beside League
   Activity. Venue (crew pass vs Studio fresh-eyes) deliberately left as HIS call — Studio wall
   respected. Done = his word on a season morning, nothing else.

PAT flag RESOLVED same day: David rotated the GitHub token (~10:46) and **confirmed the old one
revoked on GitHub** (~11:00) — every stray plaintext copy is now a dead string. New fine-grained
token in ~/.claude/settings.json (verified: valid JSON, github_pat_ format, no quote damage);
activates for the github MCP on session restart. Git pushes unaffected (osxkeychain credential is
separate — all three repos verified AUTH OK post-revocation, so the 22:00 backup push is safe).
Context: SR-19's close paperwork stays D8; B1 proof recorded in the DG-045 ticket 08-29 (dg-build
`11bf67d`); morning fully green (chain 6/6, drift 0; both DG-084 proofs passed).

---

## 2026-08-28 evening — the night shift (remote decision panel, dictated)

Asked what else can run tonight, David (dictating): **"I would like to make sure our data layer
is fortified. Our identity graph is solid, and the model has plenty of room for experimentation
as well as … self improvement."** Panel answers:
1. **ALL FOUR night lanes ruled in:** DG-050 replay-reproducibility harness; DG-054 name
   normalizer (identity's first brick — the RE-KEYING migration stays post-season, law intact);
   DG-028 + DG-057 model safety rails; the DG-017 scaled-refit falsifier as a REPORT-ONLY
   experiment (never lands).
2. **Land policy: "Land the safe ones tonight"** — guards/enablers land through the full gate +
   adversarial review overnight; the experiment stays a report.
Rides-along authorized under lane 1: DG-085 (drift-block freshness qualifier, this morning's
review minor) built; DG-086 (upstream universe_pvo_batch.py:99 xvar_percentile_position defect)
ticket-filed only.

## 2026-08-29 late night — THE FRONTEND RULING (gap-audit session, verbatim)
> "I'm having another parallel session work on the front end, and I've given it signal and approval
> to make the front end world class for a dynasty football front end. I don't care to persist the
> governance of language and caveats and lack of overall recommendation from the back end into the
> front end. I'd rather use layman's terms and call a spade a spade, and I've given it the green
> light to do so."

Effects recorded in dg-build (IN-SEASON-QUEUE amendment + tickets): DG-094/DG-095 DROPPED (they
enforced the pre-ruling presentation half of Rulings 07/10); DG-104 filed (CI banned-language
linter must be re-scoped or it blocks the green-lit language); backend evidence-typing
(fail-closed decision_supported, claim levels, validate_no_prohibited_features) is UNTOUCHED —
the ruling changed what the product says, not what it measures. The night lane independently
recorded the same ruling as DG-091's controlling principle ("world-class fantasy front end, not
a data-science viz"). Same night David also said, mid-turn: "continue working not only on the
assessment but to start the work" — this session then claimed DG-100.

---

## 2026-08-29 evening/night — the night panel + THE PROSE RULING

Four panel selections (~18:1x, option labels verbatim):
1. **DG-091 venue: "Studio fresh-eyes"** — the design/build pass routes to Studio THROUGH
   Tower (wall TW29-WALL-35); the brief itself drafted venue-neutral in dg-build.
2. **DG-090: "Overflow fix only (Recommended)"** — Problem A pulled to tonight (LANDED
   `232fc0c1`), Problem B folds into DG-091's visual pass.
3. **dg-mail-carrier: "Retire — unload it (Recommended)"** — executed: bootout + persistent
   disable; plist left on disk (it had fired every 30s into a deleted script since the tmux era).
4. **"Yes — both (Recommended)"** — SR-13 pulled to tonight (LANDED as DG-092 `1d2a5c89`;
   Wed D9 freed) + the SR-09 finding-A spec amendment pushed (`48fa1e7d`; done-mark stays Tue).

**⭐ ~18:5x — THE PROSE RULING (verbatim, reshapes DG-091 and every future frontend pass):**
> **"I really don't care for the caveats and the hard wording governance. I prefer to use
> prose and layman's language with respect to making this a world-class fantasy football
> dynasty front end. Not a data science, data engineering visualization."**

**He gave the parallel gap-audit session the same ruling in FULLER words the same evening
(their record, DG-094 ticket, verbatim):**
> **"I don't care to persist the governance of language and caveats and lack of overall
> recommendation from the back end into the front end. I'd rather use layman's terms and call
> a spade a spade, and I've given it the green light to do so."**

**Reconciled reading (both verbatims together — this corrects this file's first draft of
tonight, which read the narrower message alone as "no-verdict NOT revoked"):**
1. The governance register (caveat blocks, disclosure stamps, "not decision-grade" legalese)
   is RETIRED from the screen; truth-bearing content survives as natural prose, once, where it
   applies; receipts stay one press away.
2. **The FRONTEND is green-lit to state overall recommendations in layman's terms** — "call a
   spade a spade." This SUPERSEDES the presentation half of the 08-20 standing consequence
   ("the product will not say buy/sell in 2026"); the gap-audit session dropped DG-094/095
   (the Ruling 07/10 enforcement tickets) and filed DG-104 (linter re-scope) on it.
3. **The BACKEND's evidence machinery is unchanged:** decision_supported, evidence grades,
   replay verification, never-fabricate, never-stale-as-fresh all stay armed. The frontend's
   plain voice sits on top of the evidence layer, not instead of it (DG-103's ratification
   now gates only the backend flag, per the queue's amendment).
Applied as the CONTROLLING PRINCIPLE of `~/dg-build/DG091-DESIGN-BRIEF.md` (rewritten same
night, both verbatims quoted). The three locked-copy mechanisms (DISCLOSURE_LINE exact-string
lock, two byte-locked mitigation paragraphs) protect wording this ruling overrides —
replacement prose ships in the brief round-trip for his review.

## 2026-08-30 morning — the DG-091 design panel (four selections, option labels verbatim)

Put to him while phase 2A was building; his picks:
1. **Trade voice: "Both prices, plainly."** The product states the arithmetic on BOTH pricings
   ("By market prices you're giving up 1,240 more than you get; by our model it's closer to
   even") and names the disagreement — but **no blended take/pass imperative**, because that
   would require him to bless how market and model are weighed against each other. He draws the
   conclusion; the product does the arithmetic in plain words.
2. **Parked items: "Remove from nav entirely."** Rookie Board, Waiver Radar, Research Assistant
   and Project Tracker leave the rail (URL-reachable only). Roadmap is not product.
3. **Delta colors: "Green up / red down."** ⚠ CONSEQUENCE: red/green were BANNED as verdict hues
   and the ban is ENFORCED (`frontend/src/styles/tokens.test.js:83-110`, red arc ≤30/≥350, green
   120-160). His ruling reopens it — the ban gets re-pointed at genuine buy/sell verdict styling;
   direction/movement color is now legal. The two-lane law (blue = model, amber = market) is
   UNCHANGED and must not be confused with direction color.
4. **Phone: "Build the phone shell now."** The 390px app shell (bottom tab bar, 52px rows,
   essential columns) is IN for this program, not deferred to the season.
Not asked (only four slots): the front-page naming ("Today" in nav, "Morning read" as overline) —
Studio's default stands unless he says otherwise.
