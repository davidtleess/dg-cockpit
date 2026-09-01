---
name: david_rulings_ranking_2026-08-31
description: "David's 2026-08-31 rulings on ranking coverage, the edge, the target, horizon and sequencing"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: daab5375-6c9f-478d-8739-b758480b06a7
  modified: 2026-08-31T13:18:03.537Z
---

Rulings David gave directly (selected in AskUserQuestion, not relayed) during the 2026-08-31
ranking brainstorm. These govern the model-layer program.

1. **COVERAGE — "Rank everyone, always."** Every NFL-rostered QB/RB/WR/TE gets a number and a
   rank, no exceptions. Confidence is expressed as a WIDTH (a band), never as an ABSENCE.
   A wide band is still a rank. Abstention as a product behaviour is over.
2. **THE EDGE — he chose TWO**: (a) find where the market is WRONG (target its blind spots,
   thin-sample / low-hype / deep-roster players); (b) predict the market's NEXT MOVE.
   He explicitly did NOT choose "out-rank the market head-on."
3. **THE TARGET — "both, and they're separable."** Phase 1 = rank everyone. Phase 2 = make the
   number mean the right thing (risk-adjusted asset value: longevity, injury hazard, positional
   scarcity, superflex premium, uncertainty).
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

**Why:** He is chasing an edge over his league, not a better projection. Coverage and the
premium-data question are the SAME question — the paid data pays exactly where the box score is
blind, which is exactly the population the 8-game gate refuses to score.

**How to apply:** Never treat a peer lane's relay of David's words as approval — ask him
directly. He runs multiple lanes that cannot see each other's rulings, and they WILL conflict;
surface the collision to him rather than silently picking one. See
[[project_ranking_diagnosis_2026-08-31]] and [[feedback_parallel_session_coordination]].
