---
name: david_rulings_ranking_2026-08-31
description: "David's 2026-08-31 rulings on ranking coverage, the edge, the target, horizon and sequencing"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: daab5375-6c9f-478d-8739-b758480b06a7
  modified: 2026-09-05T00:14:30.619Z
---

Rulings David gave directly (selected in AskUserQuestion, not relayed) during the 2026-08-31
ranking brainstorm. These govern the model-layer program.

⛔ **READ THIS BEFORE QUOTING ANYTHING BELOW. THE DECISIONS ARE HIS; THE WORDS ARE OURS.**
Every ruling here came from him CLICKING an option a lane had WRITTEN. So a sentence in quotation
marks below is option text he selected, not a sentence he typed. Never introduce one with
"David said, verbatim" — say "he ruled" or "he chose the option that read…". This distinction has
already caused four recorded errors in one week:
1. The **five-item Phase 2 list** (ruling 3) was imported from an option he REJECTED — corrected below.
2. **"Chase it now — it outranks the rest"** (ruling 9) was relayed to a lane as his verbatim words
   by Greg on 09-04; it is option text. The priority is his; the sentence is not.
3. ✅ RESOLVED 09-04 — **"The product will not say buy/sell in 2026"** in `david_rulings_dg3.md` had no
   words of his behind it. Audited against every transcript: his ONLY typed words containing "buy" or "sell"
   are the 08-20 `/goal` putting that very ban UP FOR REMOVAL. Retracted in place, the measurement kept.
4. ✅ RESOLVED 09-04 — **"games_t is ONE SEASON, not the player"** is a lane's diagnosis recorded as
   "David's catch". Confirmed at source: at 2026-09-01 10:00:43 ET he typed one sentence,
   *"Garrett Wilson has played more than seven games."* Corrected in `project_ranking_diagnosis_2026-08-31`.
   Note this one is not a fabrication — the OBSERVATION was his and it was the whole unlock. Only the
   technical sentence is ours.

**How to apply:** when a ruling matters enough to build on, open the transcript and read BOTH the
option he clicked AND its siblings. The siblings are where fabricated requirements come from — a
summariser reading the whole screen imports the rejected option's contents as his. And note the
asymmetry: only ONE option's text is his decision; the rest are the lane arguing with itself.
Related: [[feedback_my_conventions_are_not_davids_rules]], [[feedback_relay_authority_drift]].

1. **COVERAGE — "Rank everyone, always."** Every NFL-rostered QB/RB/WR/TE gets a number and a
   rank, no exceptions. Confidence is expressed as a WIDTH (a band), never as an ABSENCE.
   A wide band is still a rank. Abstention as a product behaviour is over.
2. **THE EDGE — he chose TWO**: (a) find where the market is WRONG (target its blind spots,
   thin-sample / low-hype / deep-roster players); (b) predict the market's NEXT MOVE.
   He explicitly did NOT choose "out-rank the market head-on."
3. **THE TARGET — "both, and they're separable."** His selected option, in full and verbatim:
   *"Fix coverage first as its own workstream, then upgrade the objective to risk-adjusted value
   as a second phase. Sequenced, not simultaneous."* Phase 1 = rank everyone. Phase 2 = upgrade
   the objective to risk-adjusted value. **That is ALL he ruled here.**

   ⛔ **CORRECTION 2026-09-04 (Greg) — THIS ENTRY PREVIOUSLY FABRICATED FIVE REQUIREMENTS.** It
   used to read "risk-adjusted asset value: longevity, injury hazard, positional scarcity,
   superflex premium, uncertainty". Those five items are the description of a DIFFERENT option on
   the same screen — *"No — it needs to be risk-adjusted asset value: Dynasty value should fold in
   longevity, injury hazard, positional scarcity, superflex QB premium, and uncertainty"* — **which
   David did NOT select.** Verified by reading the AskUserQuestion block in
   `daab5375-6c9f-478d-8739-b758480b06a7.jsonl`. He has never typed or selected any of the five in
   this context. **Do not treat them as his requirements.** One of them is actively backwards:
   "uncertainty" is the band he ordered REMOVED on 2026-09-03 ("plus or minus 20, remove it, one
   number per player"), so a lane could have defended it using his name. If Phase 2 is to be held
   to any of those five, it needs a fresh ruling from him.

   **The mechanism, worth knowing because it will recur:** this note was written by summarising the
   whole question SCREEN rather than only the option he clicked. See
   [[feedback_my_conventions_are_not_davids_rules]].
4. **EDGE (b) — instrument now, model in 12 months.** Start the honest append-only market
   capture immediately; ship adjustment-speed insights from event studies meanwhile. The
   existing 413-day FantasyCalc panel is a rectangular backfill (474x413, ZERO entries/exits)
   and cannot answer a discovery question.
5. **REPLACEMENT LEVEL — let the derived number stand and show the reasoning.** Compute it as an
   order statistic from the real lineup structure. "Replacement TE = the 12th-best TE, because
   your league starts 12." Accept the answer even if the best TE ranks below WR46. Do NOT tune
   constants until TEs look right.
6. **HORIZON — one number plus a contend/rebuild toggle.** Compute V_1/V_3/V_5 underneath,
   surface one headline governed by a posture toggle, other horizons on player detail.
   (Caution raised: the toggle is also a knob for making a desired trade look good — needs a
   locked default and a recorded rationale.)
7. **SEQUENCING — reversed mid-session.** Initially "foundation first, properly." Then, after
   being shown that his roster fix was parked behind a TE retrain, he ruled:
   **"Unblock the roster fix now, then TE, then foundation."** Confirmed against the ticket
   lane's transcript: he had genuinely ruled "Hold the whole fix until TE is resolved" at
   11:55, then reversed to "Ship the roster fix now, then TE" at 12:06. Both were his, both
   given directly. (An intermediate claim that the hold was a lane's recommendation wearing
   his name was itself wrong and has been retracted.)
8. **MARKET PRICE IS NEVER A MODEL INPUT** (ruled to Greg, after reading Lou's memo). The model
   estimates intrinsic value from football data ONLY. Market observations are a comparison lane
   and an evaluation benchmark, nothing else. He chose the STRICTEST option, explicitly
   rejecting even "price as the label of a separate, non-feeding-back market layer."
   **Consequence: the hedonic pricing-kernel plan is dead** — no model may be trained on
   FantasyCalc value, so unquoted players get a synthetic value from the intrinsic model, not
   from a price model. **"Edge" = a validated historical outcome, never model-market
   disagreement.** A divergence is a hypothesis, not a finding.
9. **THE AGE BIAS OUTRANKS EVERYTHING** — ruled 2026-08-31 12:06 in the ticket lane:
   "Chase it now — it outranks the rest." Reproduce ONLY from
   `app/data/valuation/universe_market_divergence_latest.json`; the served PVO runtime
   artifact has 0 of 12,226 rows with a populated market_overlay, so the finding looks
   unreproducible if you check that file.

10. **HORIZON OF THE PROGRAM ITSELF — "Post-freeze — think big, no deadline pressure."** ⚠ **RECOVERED
    2026-09-04; this memo DROPPED IT and the loss cost real damage.** Asked *"What's the horizon for this
    work, given the 09-04 freeze and 09-10 kickoff?"* at 2026-08-31 **06:52:02 EDT** (transcript stamp 10:52:02**Z**) he selected the option whose
    preview read: `09-04 freeze ──── 09-10 kickoff ──── this work` / **"Unconstrained design. Build it
    properly."** The ranking program is explicitly OFF the freeze clock and off the kickoff clock.
    **Consequence, and this is why it matters:** with this ruling missing from the record, a lane handed him
    FOUR invented deadlines in a single day on 09-04, each one pressing him toward a rushed call on work he
    had personally released from time pressure. See [[feedback_greg_manufactures_deadlines]]. A dropped
    ruling does not fail silently — the vacuum fills with manufactured urgency.
    ⚠ Scope care: this governs the RANKING/foundation program. It does not release anything he has since put
    on a clock himself — e.g. the 09-04 rescale ruling ("build before week 1") is his own later deadline and
    stands. When those meet, the LATER and MORE SPECIFIC instruction wins.

**Why:** He is chasing an edge over his league, not a better projection. Coverage and the
premium-data question are the SAME question — the paid data pays exactly where the box score is
blind, which is exactly the population the 8-game gate refuses to score.

**How to apply:** Never treat a peer lane's relay of David's words as approval — ask him
directly. He runs multiple lanes that cannot see each other's rulings, and they WILL conflict;
surface the collision to him rather than silently picking one. See
[[project_ranking_diagnosis_2026-08-31]] and [[feedback_parallel_session_coordination]].
