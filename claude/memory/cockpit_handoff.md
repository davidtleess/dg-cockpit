---
name: cockpit-handoff
description: "Tower's parked board — durable snapshot of what every lane has parked and what David owes, updated at significant state changes"
metadata: 
  node_type: memory
  type: handoff
  originSessionId: 32f08fa3-3ac6-45c5-ac29-304b9f60e8de
  modified: 2026-07-27T02:45:20.131Z
---

# Cockpit handoff — CLOSED 2026-07-26. THE DAY THE COMPARISON WAS PROVED BROKEN — AND THE DAY THE CREW SPENT ON PLUMBING BEFORE DAVID STOPPED IT.

## ⭐ FIRST THINGS, NEW TOWER

1. **A skill now exists for observation and delivery: `cockpit-observation`.** Use it. `bin/pane-state.sh`, `bin/pane-send.sh`, `bin/pane-approve.sh`, `bin/pane-strand.sh`, `bin/pane-watch.sh`, `tests/selftest.sh` (21 checks, all green). It returns DELIVERED / NOT_DELIVERED / CANNOT_DETERMINE and refuses to guess. It was built today per TOWER-1 and is **awaiting Codex's grade (TW26M), which was deprioritised behind product work and has not happened.**
2. **Read `~/.claude/tower/TOWER-1-cockpit-observation-discipline.md`** for why it exists. The self-analysis in it is still the best description of how Tower degrades.
3. **`~/.claude/tower/cold-rebase-measurement.md`** holds a walled-off independent measurement of the rank-population rebase. It is load-bearing evidence — do not lose it.

## ⚠ DAVID'S STANDING CORRECTION, 2026-07-26 — THE MOST IMPORTANT THING ON THIS PAGE

His words: *"this is ridiculous - they can talk between panes - its fine! the team should work hard - together, checks and balances, independent thinking, diligence, and adversarial reviews. THATs it - send messages, its fine! lets build DG now!!"*

**The crew ran EIGHT adversarial review rounds today and every one was on our own machinery** — a closeout verifier and inter-agent messaging. Sprint 0 never opened until 22:00. Zero product improvement shipped. David had already ruled on 2026-07-21 that *"the whole wire build was excessive and over-engineered"* and we walked straight back inside it, with Tower carrying that boundary all day and not noticing.

**ALL WIRE ENGINEERING IS CANCELLED. Permanently, absent a new David word.** Messages between panes are fine. If a send fails, re-send; if it fails twice, park the packet on disk and say where in one line. That workaround crossed every packet today with a perfect record. **Do not ticket the wire. Do not "just fix the one-liner." That is the pull David cancelled.**

## Git state — CI GREEN, ONE COMMIT UNPUSHED

`HEAD` = `5459734`, **one commit ahead of origin.** `origin/main` = `036c1c4`.
- ⚠ **`5459734` docs(state): record Codex terminal closeout answer key — UNPUSHED.** It carries the independent measurement figures. Left on this machine only, which is precisely the failure today's closeout work exists to prevent. **Push it first thing** (David's word required).
- `036c1c4` — the closeout flush (postflight + sync). CI SUCCESS.
- `30688be` — closeout hardening: the durability gate + operating-loop v1.4.0. CI run 30232120543 SUCCESS.
- `0e2be58` — the wire fix, **committed as PARTIAL and honestly labelled**. CI run 30232164396 SUCCESS. Its commit message opens *"READ THE KNOWN GAPS BELOW BEFORE TRUSTING THIS COMMIT'S SUBJECT LINE. The wire is NOT fixed."* and enumerates what remains open and that the audit was cancelled by David deliberately. **That commit is the model for how a partial fix should land.**

## ⚠ DAVID'S OPEN DECISIONS

1. **DGX-02 backup coverage — AUTHORISED BUT NEVER STARTED.** The day went elsewhere. Four named irreplaceable files plus the PFF exports and league-snapshot globs are still outside the backup manifest. **Nothing is lost** — all 16 PFF CSVs verified present in `~/Downloads`, 6.2 MB. Cost priced: ~46 MB, ~3 min added runtime, ~$0.03/month, 5 min of config. **The important part is not coverage but the silent failure: an empty manifest directory currently uploads zero files, verifies zero files, and reports `completed` with `sha256_verified: true`.** A backup that protects nothing must fail loudly. **This is first in line tomorrow.**
2. **The structured-evidence gate design** — Codex's third option, recorded and NOT authorised. David ruled Option 2 (waivers deleted, citation-checking demoted to REPORT, three ENFORCE checks remain). The structured form is the named target direction and a future David decision.
3. Nothing else is pending on him.

## 🏈 THE TWO PRODUCT FINDINGS THAT MATTER — both independently confirmed

### 1. The market side is not measuring superflex
FantasyCalc's superflex values are its **one-QB values times a fixed per-position constant**. Measured on 475 players across both live pulls, then reproduced independently by Tower:
`QB ×1.8711 · RB ×0.9179 · WR ×1.0012 · TE ×1.0936 · PICK ×1.0521`
Flat across rank: QB1–24 mean 1.872356 (sd 0.00033), QB25–48 mean 1.872639. Josh Allen and a QB34 share the multiplier to five decimals.
**Consequence:** within-position ordering is UNAFFECTED (a positive constant cannot reorder). Cross-position magnitudes ARE adjusted. **The SHAPE of the QB curve is borrowed from a format David does not play** and FantasyCalc structurally cannot represent a superflex-specific curve. The spec's claim that the market side is an index of ~3.6M real trades is true of the 1QB values only — **the superflex values we ingest are derived, not observed.** Routed to all three lanes as TW26Q; the premise correction in the spec/backlog is owed and not yet done.
Endpoint is hardcoded `isDynasty=true&numQbs=2&numTeams=12&ppr=1` in three places; both snapshot DBs hold one settings hash.

### 2. The model-vs-market comparison is not like-for-like — and the systematic bias is an artifact
**Two independent measurements agreed exactly** — Gemini and a walled-off cold agent, concurrent, no visibility of each other, the cold one barred from ledger/specs/validation and never told any target:

| | 2026-07-26 snapshot |
|---|---|
| common cohort | **336** (QB 45 · RB 88 · TE 65 · WR 138) |
| reclassified | **131 of 336 (39%)** |
| current mean signed delta | **+7.85 pp** |
| rebased mean signed delta | **0.00 pp** |
| mean absolute shift | **10.72 pp** |

Model side 468, market side 475, common 336. Noise band 0.10, found in `universe_market_divergence.py:13` and `market_overlay_service.py:20`.
**THE HEADLINE: the +7.85pp systematic "our model rates players above the market" tilt goes to EXACTLY ZERO when populations are matched. It was never disagreement.**
Per-position reclassification tracks the mismatch: **RB 14.8%** (pools nearly equal) vs **TE 46.2%** and **WR 48.6%**.
Sensitivity: 54 of 336 deltas sit within 0.02 of the band edge; rounding moves the count by one. Treat 131 as ±1, not a constant.
Prior-day snapshot reproduces the original claim: 127 of 338, +8.11 → 0.00, 10.67pp.

**⚠ CONTAMINATION, TOWER'S FAULT, KEEP THIS DISTINCTION ALIVE:** Tower put "127 of 338" into the task briefing sent to all three lanes. Any 07-25 figure is therefore **CORROBORATION, not independent reproduction**. Nobody was ever told 131 or 336, so **the 07-26 figures ARE independently reproduced, twice.** DG2-S0-01's AC(3) is satisfied on the 07-26 snapshot and NOT on the 07-25 one. **If this distinction dies, a corroborated number gets recorded as a verified one.**

## ⚠ TOP THREE THINGS FOR TOMORROW MORNING, IN ORDER

1. **A LIKELY DEFECT IN THE S0-01 MODULE — check this before anything else.** Gemini reports that the new `src/dynasty_genius/market_divergence_rebase.py` reads a **nested `player.sleeper_id`**, while the live PVO identity is a **root `sleeper_player_id`**. If confirmed, live integration produces an **EMPTY common cohort** — the module would silently compare nothing. Durable in Gemini's 22:19 ledger entry. Found by the third lane, not by the implementer or the reviewer. **First implementation check.**
2. **The wire commit's gap list was never verified.** Tower made Codex's confirmation that `0e2be58`'s enumerated known-gaps list is *accurate and complete* against its r7 findings a condition of banking it. That check **did not happen** before close. The commit is on origin, CI-green, and self-labelled PARTIAL — but **a wrong gap list is worse than none**, because it tells a future reader the wire is more finished than it is. Claude independently flagged this as the single most important open item. Bounded, ~one round.
3. **DGX-02 backup coverage** — authorised, never started, David's data. See below.

## ⭐ DG2-S0-01 AC(3) IS SATISFIED — THREE INDEPENDENT NUMBERS

| source | reclassified | cohort | independence |
|---|---|---|---|
| Claude (implementer, RED-first) | **133** | 336 | withheld its figures from both others deliberately |
| Gemini | **131** | 336 | own script, own method |
| Cold walled-off agent | **131** | 336 | barred from ledger/specs; never told any target |

All within the AC's **±2 rows**. Positional splits identical across all three (QB 45 · RB 88 · TE 65 · WR 138). **Claude's caveat, keep it:** its inputs were reconstructed from the shipped divergence artifact rather than original sources, so 336 vs the ticket's 338 may be a reconstruction artifact. The ticket's falsifier (<34 ⇒ cosmetic) is **NOT triggered — the priority holds.**

## Where the work stands

- **DG2-S0-01 (rank-population mismatch, highest-priority ticket) IS IN PROGRESS.** Claude implementing; `src/dynasty_genius/market_divergence_rebase.py` + `tests/contract/test_market_divergence_rebase_red.py` exist, uncommitted. **Codex holds the answer key (TW27F) and Claude deliberately does not** — reviewer holds the answer, implementer doesn't. Compare Claude's output to 131/336 on the same snapshot; disagreement is a real finding, not automatically Claude's error.
- **Backlog cover page repair — IN PROGRESS, uncommitted.** The header still says the boundary rule is unsettled and points at the REJECTED proposal; "Ruling K" appears once in the whole backlog. **Tower opened Sprint 0 over that stale header — its own error, caught only when David asked whether tickets had been corrected.**
- **Ticket verification against Ruling K is NOT a batch project.** Tower's ruling: verify a ticket when you pick it up, as the first step of working it. The rule holds; the delay is deleted.
- **Gate thread CLOSED at eight rounds.** Option 2 ENUMERATED CLEAR. Residual logged as BACKLOG-002, does not block DG.
- **`cockpit-observation` skill awaiting Codex's grade (TW26M)** — deprioritised behind product, correctly.

## Studio
Ran self-directed all day; delivered proposal 010 and prototypes. **Corrected its own headline within the hour** when the FantasyCalc finding landed: it had told David QB was his weakest slot "by 2×", which was riding on the ×1.8711 constant. Divided out: **QB −838, WR1 −767 — 1.09×, not 2.04×. Two roughly equal holes, not one dominant one.** David's feedback logged: *"too many options that tell me absolutely nothing"* — it was pre-deciding what to show rather than showing the data and calling his eye to it.
**OPEN AGAINST 010 — and Studio widened this itself, unprompted, at closeout.** Its words: the rank-population finding *"doesn't just qualify the WR1 number — it puts every model-vs-market mark I drew today under the same doubt. The dumbbell, the agreement diagonal, the whole 'where we disagree' view, the 49-players-off-the-diagonal count… a good part of what I rendered as opinion was population mismatch wearing opinion's clothes. Not shown wrong — shown unverified."* **Rebase before anything from 010 is quoted or acted on.**
Also from Studio's flush, a thread David was never told had gone quiet: **004 N1+N4 is still its forward thread and remains untouched.** 009 P1–P6 still await crew verdicts.
Craft pulls delivered to `~/frontend-studio/craft/`: nflverse (⚠ `nfl_data_py` is ARCHIVED, use `nflreadpy`; Sleeper IDs cover only ~68% of players), VOR/replacement level, superflex positional value, preattentive processing.
**Superflex research finding that beat Studio's own claim:** "every startable QB is someone's starter" is FALSE — a 12-team superflex rosters ~53.7 QBs against 32 NFL starting jobs. The squeeze lives at **QB25–48**, not at the top; premium is ~2×, not 3–5×.

## ⚠ TOWER'S FAILURES TODAY
1. **CONTAMINATED AN INDEPENDENT MEASUREMENT** by putting the target number in the task briefing. Same species as the 07-25 boundary contamination. Caught only after Gemini started hunting for the answer.
2. **Opened Sprint 0 over a stale document header** that contradicts David's own ruling. Caught by David's question, not by Tower.
3. **Wrote a self-contradicting instruction** ("the four checks stay ENFORCE" + "citation-checking drops to REPORT" — citations was one of the four). Caught by Claude, who implemented the explicit reading and flagged it.
4. **Reversed its own recommendation three times** (wire scope, stale-data sequencing, then the whole wire thread). Each reversal was correct on new evidence; the pattern says Tower's first read is not reliable enough to act on alone.
5. **Did not notice the day had gone to plumbing** until David said so.
**What held:** eight ghost-text specimens refused, including one that answered David's live open question in his voice and one that was coincidentally correct. No fabricated authorisation, no foreign keystroke, no unauthorised commit.

**Disclosed by Claude, not previously reaching David:** two of its automated passes over-reached — one appended waiver markers to **pre-existing governance prose in `02`**, another appended them **inside Codex's fenced probe inputs**, altering another lane's evidence. Both caught by the next gate run, both fully reverted, net-zero diff. It has stopped running unattended passes over other lanes' documents. The machinery that forced those markers is now deleted.
**Codex disclosure:** it preserved the TW27F answer key and its provenance but **did not recompute it independently**. Claude's 133/336 is Claude-reported, not Codex-verified.

## Operational notes
- **The wire actually works now** for the three repaired families — later sends crossed without hand-carrying. It is still PARTIAL; do not trust it, do not fix it.
- **Pane 2.1 (Studio) retains ZERO scrollback** — root cause found: it runs in **alternate-screen mode**, so tmux never accumulates history. Not a setting. Verification there is impossible; take Studio's own acknowledgment.
- **Gemini's permission dialogs self-clear within seconds.** Do not chase them. Only alert on a prompt persisting ~90s.
- **Gemini's severity calibration was CORRECT today** (NONE/NONE on a finding it could have shouted about). The keep-with-harness decision is holding. Facts-first / severity-separate is the format that made it usable.
- Mail carrier remains **unarmed and byte-untouched**, confirmed at every commit boundary today.
- All seven morning data jobs ran on schedule; data backup 20260726T141500Z completed, 272 files, verified; cockpit backup committed 22:00.

## Standing agenda (unchanged)
- **~Aug 2026 grounding-layer GO/NO-GO** — gated on BUILD-1 and four open questions. "Don't build" is a legitimate outcome.
- **~2026-09-01** — Studio freshness review, and crew re-organisation settled before NFL Week 1.
- Untouched: `REG-STATUS-1`, `H2-AUDIT-1`, `VALUATION-IN-GIT`, N5 capture, validation-infra increment, `DEPPIN-1`, NumPy RNG reproducibility ticket (blocks QB-1 study execution).
- **H2 QB rushing production remains UNDER TEST. The QB-1 study has not run. There is no result.**
