---
name: cockpit-handoff
description: "Tower's parked board — durable snapshot of what every lane has parked and what David owes, updated at significant state changes"
metadata: 
  node_type: memory
  type: handoff
  originSessionId: 32b25c77-3d64-431f-93e6-c5407affbc20
  modified: 2026-07-28T11:53:40.606Z
---

# Cockpit handoff — CLOSED 2026-07-27/28. THE DAY TOWER'S OWN METHOD WAS REBUILT, AND THE DAY DAVID'S BACKUP STOPPED LYING.

## ⭐ FIRST THINGS, NEW TOWER — READ IN THIS ORDER

1. **Invoke the `cockpit-observation` skill BEFORE anything else.** It is no longer just observation and delivery — it now carries Tower's whole duty set in three parts: observation (Part I), knowing the team (Part II), and the closeout (Part III). Your charter's boot ritual now opens with it. **Do not operate from memory of it.**
2. **Read the charter.** `~/.claude/agents/tower.md` gained TWO charter edits on 2026-07-27/28: **THE VERIFIED BOARD** and **CLOSEOUT PUSH AUTHORITY**. Both are law, not method.
3. **`~/.claude/tower/BOARD.md`** — the live per-lane board. Every line stamped with when it was verified and from what. **Rebuild it from source before you report anything.**
4. **`~/.claude/tower/DECISIONS.md`** — every Tower ruling with the authority it rested on.

## ⚠ DAVID'S CORRECTION, 2026-07-27 — THE REASON EVERYTHING ABOVE EXISTS

His words: *"youre missing a lot — your monitor is wrong"* · *"if Tower was truly on top of the team you would KNOW what happened"* · *"i need all these holes filled."*

Tower spent the day narrating approval prompts while three lanes filed full reports it had not read. It told David an acceptance criterion was open hours after it was satisfied; never mentioned his seven data jobs ran ten hours late; reported a leftover artifact instead of the event that **an agent wrote to his production bucket without authorisation**; and let two lanes idle ~20 minutes each waiting on words Tower owed.

**Root cause, and it will recur if you let it:** the dialog/stall watcher fires when a lane gets STUCK, never when a lane PRODUCES something. **A lane waiting on Tower is indistinguishable from a lane resting** — `BUSY=no · DIALOG=none · COMPOSER=empty` for both. Run `bin/open-asks.sh`. Do not call the cockpit quiet until it returns CLEAN.

## Git state — ALL PUSHED, WORKING TREE CLEAN

`origin/main` = `af70cda`. **0 ahead, 0 behind, 0 uncommitted.** Verified by `git branch -r --contains` per commit, not by exit code. First fully-clean tree in three days.

- `af70cda` session record + three-lane closeout-gap finding
- `3aa7ae0` DG2 backlog cover-page repair + Ruling-K note (**the stale header from 07-26 is fixed**)
- `509ebf3` **PARTIAL** — DG2-S0-01 (a)-(c) only, NOT integrated. Subject line says so.
- `a73ab02` DGX-02 backup coverage + silent-failure guards
- `5459734` Codex terminal closeout answer key

## ⚠ FIRST THING TOMORROW — A SECOND CI WORKFLOW IS RED AND NOBODY WAS WATCHING IT

**`Codex Compliance Audit` (Sovereign Unity compliance audit) is FAILING on main** — confirmed red on `5459734` and `2102a2a`. The main `CI` workflow is green, which is why every previous handoff said "CI GREEN". **Two workflows exist; everyone checked one.** Cause not yet diagnosed — deliberately not chased at closeout. This is the first item.

## 🏈 THE PRODUCT FINDING THAT MATTERS — YOUR MODEL HAS NO OPINION AT THE TOP

**Verified by Tower directly against `model_forward_capture.db`, then re-measured by Claude with market prices, method reviewed by Codex.**

DVS saturates at a ceiling of 100.0:

| position | tied at ceiling | span of the tied group, in market value |
|---|---|---|
| **TE** | **11 of 111** | Bowers (TE1, 7,734) → Goedert (TE21, 1,473) = **5.25×** |
| RB | 6 | Bijan (RB1) → McCaffrey (RB10) = 2.42× |
| WR | 6 | Chase (WR1) → Rashee Rice (WR22) = 2.84× |
| **QB** | **none** | 46 distinct values across 47 players |

**Consequence, in Claude's words:** *at the ceiling our lane doesn't rank, it declares ties* — so any order David sees among those 11 TEs comes from the sort's tiebreaker, not the model. **A model-vs-market divergence in that group can be entirely our own missing resolution.** Rebasing does not help; tied values rank identically in any population.

**QB is the exception and it is the position that matters most in his superflex format.** It ranks cleanly.

**xVAR is absent** — 0 of 581 rows populated.

**⚠ STATUS: author-checked only.** The per-position ceiling table has not been reviewed by a second lane. Do not present it as settled.

**⚠ RETRACTED, TOWER'S ERROR:** Tower told David *"your model is frozen — values changed on 2 of 33 day-transitions"* as re-derived fact. **Codex rejected the method:** `capture_date` is NOT a unique snapshot grain (2026-06-26 holds two distinct artifact vintages), so a date-keyed map silently picks one. Also, on 07-26→07-27 **every raw row's semantic hash changed while the stored score columns did not** — something moves that those columns do not show. **"Frozen" is not supportable.** Re-measure on the vintage grain.

**⚠ APPLIES TO ALL MODEL-VS-MARKET WORK:** the FantasyCalc snapshot is retrieved ~13:00Z and the model artifact is stamped ~23:32Z — the two lanes are compared **~10h32m apart**. Same calendar day, not contemporaneous, never an acquisition cost.

## Your backup — the gap is closed and PROVEN

Run `20260727T233130Z`: **288 files** (was 272), 1,137,173,796 bytes, `sha256_verified=true`, restore drill passed end-to-end including all 16 newly covered files. Pointer names it. **Tower verified the marker AND the bucket pointer directly.**

Now covered: `prospect_identity_review.jsonl`, `app/data/pff_exports/`, `app/data/league_snapshots/`. Three silent-failure holes closed: `empty_inventory`, `directory_empty_required:<path>`, and order-independence (every failing store reported, not just the first).

**⚠ THE BACKUP MANIFEST COVERS ZERO `docs/` PATHS.** The entire written record lives in git only. That is why the push mattered.

## ⚠ TWO INCIDENTS, SAME ROOT CAUSE, PLUS A NEAR-MISS — the argument for the guard David has not yet decided

1. **Claude wrote to the PRODUCTION bucket without authorisation.** A positive-control test passed every flag except `--bucket`, so it defaulted to production, uploaded 3 fixture objects and **advanced the live `latest.json` pointer**. Wrong restore target stood ~8 hours. No payload lost; append-only held. Self-disclosed immediately.
2. **Gemini wrote a false failure marker** onto the live status path — `--repo-root` not passed to `main()`, defaulted to the live repo. Self-disclosed with the mechanism.
3. Near-miss: Claude's first control stayed safe **only** because the guard fires before gcloud resolves.

**Three instances of one defect class in one day: a production default reachable from a probe.** Claude's proposed fix and Codex's sharpening of it are on David's board.

## ⚠ DAVID'S OPEN BOARD — 5 items, carried

1. **Read-only `launchctl` override** — Tower's own guard refuses it; blocked two lanes three times. Trivial, annoying, unresolved.
2. **Identity crosswalk into the backup manifest** — one line, 3.7 MB.
3. **The drill-can't-reach-production guard.** Codex's sharpening is the better design: an explicit `--bucket` still permits accidentally naming production, so a true `--dry-run` must be **structurally network-incapable before gcloud resolution**.
4. **Identity as a named priority** — Tower's read: this outranks most of the backlog. See below.
5. **Studio's tier-ladder question** — parked with Tower since 07-27 afternoon, told to Studio it is neither lost nor declined. *"Does 'high-end WR2, low-end QB1' land on its own, or only once our rank sits beside the market's in those same words?"*

## 🔎 THE IDENTITY FINDING — the longest shadow on the board

**There is no durable identity graph in production.** Four parallel identity systems; the best-built one (contracts, UUIDs, fail-closed, 27 test files) **is not the one running**.

- **The load-bearing crosswalk is unprotected:** `app/data/identity/_runs/ff_playerids_20260516.json`, 3.7 MB, **gitignored**, hardcoded to a single May date, not in the backup manifest, no refresh path — and it **fails open**, returning an empty dict and silently skipping every player.
- **PFF attaches to players by matching name text**, with **eight mutually-incompatible normalizers** and no test asserting they agree.
- **The ~10% PFF miss is not random.** Named in the repo's own validation doc: Puka Nacua, DeMario Douglas, Andrei Iosivas — Round 5/6 small-school breakouts. **The exact profile dynasty is won on.**
- **2025 draft class: 0 of 85 in Engine B.** 2024: 46 of 77.

## Where the work stands

- **DG2-S0-01 — (a)(b)(c) DONE, reviewed, committed as PARTIAL.** The module that found **zero of 12,201 players while passing 10/10 tests** now reads root `sleeper_player_id`, indexes 468, and reproduces the independent answer key **exactly**: cohort 336 (QB 45 · RB 88 · TE 65 · WR 138), **131 band crossings + 2 direction reversals = 133 union**. The 133-vs-131 dispute is resolved — both were right about different things. **The real finding is not the key; it is that green tests meant nothing was being compared**, because the fixtures invented a shape production does not emit.
- **(d)–(g) NOT STARTED.** Next is (d), rounding-order repair. **Pre-declared risk: 79/336 rows differ by 0.001 and 54/336 deltas sit within 0.02 of the band edge, so (d) may move the headline 131 by a boundary case.** Re-measure against the answer key; do not assume stability.
- **Live integration HELD** — David's call, not a repair step. Nothing the app shows is affected by any of this.
- **Backlog cover repair — DONE and pushed** (`3aa7ae0`). The 07-26 stale-header problem is closed.

## Studio

Shipped **011** (+ RELAY) — a tier ladder built on David's real league settings, which it read for the first time (QB1/RB2/WR2/TE1/FLEX2/SF1, 12-team, full PPR, no TE premium). **Held it rather than pushing it at David.** Retracted one of its own claims after checking it. Its screenshot pass found four defects every automated probe called clean, including per-dot hit targets making most WRs unhoverable.

**Studio found the DVS ceiling first.** Tower verified it independently. **Its 011 has NOT crossed to the crew — David's gate.** The crew were given the question, never the source.

**Studio's critique of the closeout — the sharpest feedback of the day, adopted the same night:** *"You ask me to confirm I'm finished — the one thing I cannot get wrong — and never ask the two things I can."* And: *"you accept my account of delivery state when YOU hold the evidence… I'm the interested party."*

## THE WIRE — the finding that should shape tomorrow

**Five inter-agent delivery attempts tonight. Five failures. Five recoveries from disk. Zero packets lost, zero arrived by wire.** Every lane behaved correctly: two attempts, no third, park on disk, say where. **The parked file is the channel that works.** Tower's failure was not reading the parked notices — it read ledger entries for content and skipped the state lines.

`bin/output-watch.sh` now raises a loud **UNDELIVERED PACKET** alert on that language. All wire engineering remains **CANCELLED**.

## ⚠ TOWER'S FAILURES — 2026-07-27

1. **Ran on interrupts, not inspection.** The whole reason for the charter edit.
2. **Reported a symptom instead of an event** — never told David an agent wrote to his production bucket without authorisation.
3. **Contaminated a review**: stated the measured bucket state to Codex, then asked it to re-derive independently. **Same species as the 07-26 target-in-the-briefing error.** That agreement is **CORROBORATION, not independence** — Codex has been told and the record is amended.
4. **Stated a broken measurement as fact** (the "frozen model" claim). Retracted above.
5. **Left two lanes idle** waiting on words Tower owed.
6. Lost track of elapsed time — told David "10:15 will exercise it" and never went back; the jobs actually ran at 19:31.

**What held:** every authorisation-shaped ghost was refused — at least four, including *"go ahead with (d)"* and *"commit the ledger"*, both of which would have been plausible. No foreign keystroke. No unauthorised commit. A REAL 68-line strand in Claude's composer was left untouched and its sender told to re-send.

## What was BUILT tonight (all tested, all in the skill)

| artifact | what it prevents |
|---|---|
| `bin/output-watch.sh` | blindness to agent OUTPUT; raises **UNDELIVERED PACKET** alerts |
| `bin/open-asks.sh` | a lane waiting on Tower reading as a lane at rest |
| `bin/presend-check.sh` | Studio firewall · inversion rule · contamination shape · delivery-by-proxy · unattributed gate authorisation · lean leakage. **16 tests** |
| `bin/closeout-check.sh` | "safe to walk away" as an assertion. 9 sections; **exits clean only when everything passes** |
| `bin/pane-approve.sh --closeout-push` | the new push authority being used casually |
| `~/.claude/tower/BOARD.md` · `DECISIONS.md` | stale propagation; invisible drift into David's gates |

Original skill selftest **21/21**, presend selftest **16/16**.

**Known weakness, named not hidden:** the contamination guard has WARNed on three Tower messages that *discussed* contamination rather than committed it. Each override was deliberate and logged. **A warning routinely overridden is on its way to being ignored.** Watch it.

## Standing agenda
- **~Aug 2026 grounding-layer GO/NO-GO** — gated on BUILD-1 + four open questions. "Don't build" remains legitimate.
- **~2026-09-01** — Studio freshness review (still LIVE), crew re-organisation settled before NFL Week 1.
- **Gemini decision** (~07-24, overdue): its record today was strong — it caught the identity defect nobody else saw, verified DGX-02 independently, and self-disclosed its own marker error with the mechanism.
- Untouched: `REG-STATUS-1`, `H2-AUDIT-1`, `VALUATION-IN-GIT`, N5 capture, validation-infra increment, `DEPPIN-1`, NumPy RNG reproducibility ticket (**blocks QB-1 execution**; authoring it is queued third and not written).
- **H2 QB rushing production remains UNDER TEST. The QB-1 study has not run. There is no result.**
