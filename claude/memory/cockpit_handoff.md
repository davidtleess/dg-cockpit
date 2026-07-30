---
name: cockpit-handoff
description: "Tower's parked board — durable snapshot of what every lane has parked and what David owes, updated at significant state changes"
metadata: 
  node_type: memory
  type: handoff
  originSessionId: d653c315-9487-4431-9ede-04fe534a74ce
  modified: 2026-07-30T03:15:24.456Z
---

# Cockpit handoff — 2026-07-29 EVENING → 07-30. THE DAY THE INSTRUMENTS WERE CAUGHT LYING.

> **⚠ THIS FILE IS INHERITED CLAIM, NOT VERIFIED FACT.** Every line is a LEAD TO CHECK. Rebuild
> `~/.claude/tower/BOARD.md` from source before reporting anything to David. Tower did exactly this
> wrong on 07-29: it repeated a stale banner from the morning brief and told David a shipped ticket
> had "never been started." He spent a decision on it.

## ⭐ FIRST THINGS, NEW TOWER — IN THIS ORDER
1. Invoke `cockpit-observation` before anything. Five parts.
2. `~/.claude/tower/LAYERS.md` — David's six-layer doctrine. LAW since 2026-07-28.
3. `~/.claude/tower/BOARD.md` — the closeout block at the bottom is stamped 07-29 19:40. Re-verify.
4. `~/.claude/agents/tower.md` — the charter gained **delegated authority 5** on 07-29.
5. `~/.claude/tower/DECISIONS.md` — every ruling with the authority it rested on.
6. **INVOKE BIN SCRIPTS BY ABSOLUTE PATH.** `~/.claude/skills/...` is refused by the harness
   classifier; `/Users/davidleess/.claude/skills/...` is allowlisted. A tilde path cost dynasty:1.1
   twenty-five minutes of blocked-idle on 07-29 and looked exactly like a permissions dispute.

---

## 🚨 CLOSEOUT STATUS AT WRITING: **CLOSED — PARKED.** Not "clean," and Tower did not pretend it was.

**Git, verified per commit with `git branch -r --contains` after a fetch — never by exit code:**
```
ade7d61  docs(state): correct the record — Studio-wall commit is local only   ⚠ LOCAL ONLY at writing
1ecb18f  docs(state): record permanent Studio wall                            ON ORIGIN ✓
38ef301  feat(ci)!: retire the Databricks compliance job — LANDED WITH REVIEW OPEN, NOT CLEARED  ON ORIGIN ✓
fce0cce  docs(state): Claude lane TW29 postflight — closed/parked with reasons ON ORIGIN ✓
2b3a569  docs(state): record Codex TW29 closeout                              ON ORIGIN ✓
6c5c1ae  docs(census): layers 1-2 census + ingestion-framework research        ON ORIGIN ✓ CI GREEN
04ab30e  docs(review): TW29-VER-7 adversarial verification                     ON ORIGIN ✓ CI GREEN
```
**Working tree was CLEAN at writing.**

### ⛔ DO NOT TRUST THE ✓ MARKS ABOVE. REGENERATE THEM. David's rule, 2026-07-29 22:44.
The SHAs are leads. The push state is a **dated fact that goes stale silently**, which is the exact
failure class this whole session was spent finding. **Never report push state from this file. Run:**
```
cd ~/dynasty-genius-product && git fetch origin -q
git rev-list --left-right --count origin/main...HEAD      # behind<TAB>ahead
git log --oneline origin/main..HEAD                       # anything listed is NOT pushed
git status --porcelain                                    # anything listed is NOT committed
```
Three commands, two seconds, and the answer is measured rather than inherited. If the output
disagrees with the ✓ marks above, **the output is right and this file is stale.**

**WHY THE TABLE IS STILL HERE:** so a fresh Tower knows which commits belong to 07-29 and what each
one was, which git alone will not tell you. Identity from the file; **push state from the command.**

### ⛔ THE CLOSEOUT TREADMILL — David's word: "stop that treadmill."
Every commit that records "X is unpushed" becomes itself an unpushed commit, and the record is wrong
the moment the push happens. **Do not commit push-state records.** State that changes on push belongs
in this file — or better, in the command above that regenerates it. Committing it manufactures the
very drift it claims to prevent. `ade7d61` was the last of these and should have no successors.

---

## 🏛 THE HEADLINE — THREE INSTRUMENTS WERE REPORTING GREEN WHILE VERIFYING NOTHING

The day's real finding, and it recurred in three unrelated subsystems.

1. **The SQL governance auditor has NEVER audited a line of SQL.** Created 2026-05-05, pointed at
   `resources/` — which has never contained a `.sql` file in the repository's entire history. The real
   SQL, four files including `refresh_genius_state.sql` (which rebuilds the source-of-truth table),
   has been in `infrastructure/src/sql/` since 05-03. It printed *"passed for 0 SQL file(s)"*, exit 0,
   every day for nearly three months. **Tower established this itself at David's instruction.**
2. **The Databricks compliance job never verified 3 of its 5 named tests.** `execute_query()` marked
   any non-empty response `PASSED` without inspecting values. A probe reproduced PASSED for governance
   counts `[0,0,0]`, a status distribution containing only `NOT_A_VALID_STATUS`, and a source-rank
   distribution of 100% rank 9. **The 65:35 rule was never enforced by it.** Only Test 3 asserted
   anything. It had also failed identically for five days against warehouse `5e883b4bfbb1e3f4`.
   **RETIRED 07-29 under David's word** (`38ef301`), landed with its review OPEN.
3. **Studio's own craft gate produced a false pass** and was non-deterministic on identical input. It
   found this itself, fixed it, proved it can still reject a bad sample, then re-swept its **entire
   back catalogue** and **failed two of its own already-shown surfaces** on target size.

**⚠ AND THE WORKFLOW IS NOW GREEN FOR THE FIRST TIME SINCE 07-24 — DO NOT BELIEVE IT.** It is green
because the broken job is gone and the remaining `sql-governance` job scans ZERO files. That job is
annotated in the workflow as a KNOWN GREEN NO-OP. **Retiring or re-pointing it is UNDECIDED — David's.**

**When aimed correctly, the SQL auditor FAILS:** `refresh_genius_state.sql` applies a 30% RB value
reduction at **age 28**, while `00-product-constitution.md` warns at **26** and states hard cliffs are
*human-readable warnings only* — *"predictive models must not encode a binary cliff unless explicitly
approved after validation."* Python honours this; the SQL does not. **The violation is that a value
path encodes a BINARY CLIFF AT ALL, not that the number is 28.** Tower got that framing wrong first
and David corrected it: the constitution sets RULES; the DATA determines EMPIRICAL VALUES.

---

## ✅ WHAT SHIPPED 2026-07-29
- **THE LAYERS 1–2 CENSUS**, run properly the second time, on David's four axes. Committed, pushed,
  CI green. **Verdict: sound enough for what is already built; NOT sound enough for the layer-5
  league-behaviour edge David calls his own, because transactions were never collected.**
- **A TWO-METHOD ENUMERATION DIFF that went against the primary lane** — 5 coverage holes in Claude's
  host-string method, none established in Codex's runtime trace. Including a source with **no host at
  all**: a sibling git history supplying `values.csv`/`db_playerids.csv`, 2,185 rows. **Stream
  denominator grew 3 → 8 → at least 17** as each round looked harder.
- **DGX-02 RESTORE DRILL PASSED on the hard standard.** 267 objects pulled out of the 07-28 backup,
  266 byte-identical; the one difference was a local file appended 8h31m after the backup, proved from
  the stored object's own Content-Length. **PFF exports, league snapshots, coverage data and the
  identity review file are PROVABLY retrievable.** NOT covered: 34 other objects in the prefix.
- **The ingestion-framework research.** *"The pattern matters; the framework may not."* Airbyte and
  Airflow disproportionate at this scale; no specific tool established as necessary.
- **Studio installed Playwright MCP + Chrome DevTools MCP** under David's word, and used them the same
  hour to measure a live DOM instead of guessing from source.
- **THE STUDIO WALL made explicit** — David 22:27: *"do not let claude or codex mess up with studios
  work."* Delivered to both crew lanes and recorded in git (`1ecb18f`).

## ▶️ DAVID'S OPEN BOARD — in the order Tower would raise it
1. **His four contract questions.** Sharpest: **is a daily job expected to run while the laptop is
   asleep?** That one answer decides what "late" means for every job he owns. Also: what
   `freshness_hours` originally meant; whether the contract binds retroactively; where it lives.
2. **The remaining SQL job — retire, re-point, or report-only. UNDECIDED.** Tower's recorded
   recommendation: **re-point, but ONLY as the first instance of the compounding approach**, never as
   a point fix. David's own words: *"i don't care about this fix if it's not going to compound."*
3. **The Databricks estate** — spend to assess, or declare it dead and correct
   `01-north-star-architecture.md` (still calls Databricks the *preferred governed data platform*) and
   `docs/storage-strategy.md` (still targets migration TO it). **The only record of the retirement
   direction is one clause in the 07-11 ledger.** No decision document exists.
4. **THE CONTAINMENT GAP, and Tower recommends closing it before the next cold boot.** Studio is
   *mechanically* denied the governance corpus by its settings. **There is NO rule denying the crew
   access to `~/frontend-studio`** — tonight it is held by instruction only, and a cold lane tomorrow
   knows nothing about it. A deny rule in the crew's `.claude/settings.local.json` fixes it. **David's
   call: it is a persisted settings change.**
5. **Studio: WRITE authority in its own lane.** Asked, unanswered; cost it four stalls on 07-29.
   Authority 5 covers READS only. Two of its surfaces genuinely fail target size now its instrument is
   honest. 012 + relay still unauthorised.
6. Older parked: doctrine §2 ratification · three published open defects · the **Option 7 pick, still
   unspent** · the roster-audit contradiction · the false prospect-prior caveat.

## 📌 THE CONTRACT THREAD — parked mid-convergence. Do NOT restart rounds without a fresh word.
Four rounds, all NOT CLEAR — **read the trend, not the count.**
- v1→v2 fixed omissions, kept a denial of service. v2→v3 killed the DoS (Tower's scope call) but
  **deleted** the run/state/replay contract. v3→v4: **Tower diagnosed the oscillation as a PROCESS
  defect** — the lane was re-authoring each round instead of amending — and required an AMENDMENT
  carrying a REGRESSION LEDGER.
- **v4 verifies as STANDING:** scope wall sealed · run/state/replay restored · three-part negative-
  control proof present · per-check declarations present · **nothing regressed.** Remaining findings
  are refinements (B/P/O not disjoint; run record omits request/byte counts). **It converged.**
- The negative-control clause AS FIRST WRITTEN **would have condemned 3,972 tests plus Ruff, CI and
  both closeout verifiers.** The LANE caught that — after Tower had already endorsed it to David.
- Sharpest surviving idea, better than anything in v1: **an empty-set guard catches zero-of-four; it
  does NOT catch one-of-four.** Expected and executed check IDs must be reconciled. Proof must also be
  **version-bound**, and an unproved REQUIRED check **must not authorise green** rather than simply
  being dropped from gating.

## 🎨 STUDIO — A SECOND WORK SESSION HAPPENED AFTER THE CLOSEOUT BEGAN. Read this before its board.
David worked Studio DIRECTLY, in its pane, after the crew had already closed. Sequence, by timestamp:
- **013 — "Who do I call, and is now the time"** built ~22:34–22:41. `proposals/013-who-do-i-call/`
  (`build.mjs`, `template.html`, `prototype.html`). Status on its own board: **PARKED by David**, his
  words *"not bad, not awesome"*, after his judgement on 012: *"you have the data analysis that could
  be a valuable foundation for this page but you are really missing the mark when it comes to the
  UI/UX."*
- **David then typed into Studio's pane directly: "better for sure - but we need colors."** It sat as a
  REAL STRAND in that composer and Tower correctly refused to submit it. **A real strand in 2.1 is
  usually David typing. Stay out of that window.**
- Colour work followed, treating it as a **discrimination** problem, not decoration: keep the shipped
  QB hue, vary LIGHTNESS per hue as a second channel so positions stay separable under deuteranopia.
- **Final writes: `DAVID.md` and `for-david/STATUS.md` both 23:13:27.** Prototype unchanged since
  22:39:43 — the later writes are record, not rebuild.
- **⚠ Its pane flipped from accept-edits to AUTO MODE** during this session. Observed and reported per
  delegated authority 3; Tower sent no corrective keystroke. Not diagnosed.
- **⚠ COUPLING DAVID SHOULD DECIDE ON:** Studio imported Playwright from
  `dynasty-genius-product/frontend/node_modules/`. **No rule was broken** — its deny list covers writes
  anywhere in the repo and reads of governance/specs/strategies/ledger/agent docs, and node_modules is
  none of those. But its instruments now depend on the crew's dependency tree, which is a coupling the
  independence of that lane did not ask for. Either give it its own install or accept it knowingly.

## 🎨 STUDIO — fresh eyes INTACT. Do NOT hand it our roadmap.
Self-directed all day. Flushed and durable **from DISK**: `DAVID.md` and `for-david/STATUS.md` both
18:25, with later writes after that (pane 2.1 retains NO scrollback — disk is the only truth). Its own
closeout swept for lingering browsers, because the new MCP tooling drives real Chrome. **~09-01
freshness review stays LIVE.** Its board still names: the kit is BUILT BUT UNUSED ·
`tools/craft-gate.mjs` has two known defects · 012 is a direction checkpoint, NOT approved.

## ⚠️ TOWER'S ERRORS — 2026-07-29. All disclosed to David unprompted.
1. **Relayed a stale banner as fact** — said DGX-02 was never started; it shipped 07-27 (`a73ab02`).
   David spent a decision on it. **Inherited claim, never re-verified. The exact Part V hole.**
2. **SCOPED DAVID'S CENSUS DOWN** to four inherited questions instead of his four axes. The lane
   executed rigorously on the wrong shape. Caught only because David asked if it was complete.
3. **Got the cliff-age framing backwards** — proposed generating empirical values FROM the constitution.
4. **"One connection never answered"** stated as established; it was an inference, later refuted.
5. **Endorsed the negative-control clause as strong**; the lane found the hole Tower had missed.
6. A stray backtick caused shell substitution that dropped a reference from a lane message.
7. One cross-lane packet sent without Tower's pre-send check (written+sent in one command);
   retro-checked afterwards, clean.
8. **SAID "SAFE TO WALK AWAY" WHILE STUDIO WAS ACTIVELY WORKING.** David caught it: *"studio is NOT at
   rest."* Tower had read one snapshot and spoken about an ongoing state — the precise error Part IV
   exists to prevent, committed inside the most careful message of the day. Both that and "nothing runs
   unattended" were withdrawn. **Fix adopted: sample the pane repeatedly (6 samples/90s) before any
   at-rest claim, and check the PROCESS TABLE yourself.**
9. **Took a lane's word on background state.** Studio reported "zero headless processes"; Tower's own
   check found FOUR headless Chromium plus its gate running. The lane's claim was true when made and
   false seconds later — its own next command spawned them. **The rule exists for this: Tower asserts
   background state, the lane never does.** Verified cleared at 23:14:53.
10. **A `find -newermt "-10 minutes"` sweep returned EMPTY while Studio had written 20 seconds earlier.**
    Tower nearly reported the cockpit quiet on it. **Use direct `stat` timestamps, not relative sweeps.**
    Third instrument in one night to report nothing-happening while something happened.
**WHAT HELD:** **NINE** authorisation-shaped ghosts refused, **at least four forging Tower's own
marker scheme** · no foreign keystroke ever submitted · every commit and push dialog went to David ·
the **Studio firewall refused Tower's OWN message** ("specimen" contains "spec") and Tower reworded
rather than overrode · the contamination guard fired correctly twice and materially improved the
census order · **Tower caught a false "everything is pushed" claim** by checking the remote per commit.

## 🔧 KNOWN-BROKEN, TOWER'S OWN
- **Absolute paths only** for bin scripts (FIRST THINGS #6).
- The crew's wire failed repeatedly all day (`pane_claim_lost`), including 1.1↔1.2 and to 1.3. The
  **repository/ledger is the working fallback** and was used constantly. Codex eventually routed a
  message to TOWER'S pane, where it **stranded unsubmitted until David pressed Enter himself** — the
  cleanest possible evidence for his cockpit-architecture review.
- `pane-send.sh` returned a **false NOT_DELIVERED** for a message that HAD arrived (marker line did not
  survive rendering; body was present). Tower verified by phrase + lane behaviour and did NOT re-send.
- Studio firewall matches `spec` inside ordinary words. Contamination guard false-positives near
  "independent" — WARNed twice on messages carrying no figures at all.
- **Everything Tower says to David still bypasses every guard Tower owns.**

## 🔁 IMMEDIATE, NEXT TOWER
1. `git fetch && git rev-list --left-right --count origin/main...HEAD` — **is `ade7d61` pushed?**
   Do not assume either way. Working tree was clean at writing.
2. CI result on the retirement and wall commits.
3. Data jobs fire **09:00–09:45**; backup-irreplaceable **10:15**; cockpit backup **22:00**. The
   compliance cron is nominally 14:00Z but **drifted to 15:46Z on 07-29** — GitHub schedules are
   best-effort. **Check the schedule before calling anything late.** Tower false-alarmed on this once.
4. **Do NOT open the SQL decision, the Databricks estate, or any contract round without a fresh word.**
