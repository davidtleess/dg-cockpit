# Does QB support a finer tier ladder? Measured 2026-07-28.

**Why measured.** The grain question was answered COARSE (Tower, on the evidence, at David's
direction — not David's taste). The reasoning rested on **DVS saturation**: 23 players tied at the
ceiling across TE/WR/RB, so a finer sub-tier there would be a precision claim the number cannot
support. That reasoning left **QB as a stated exception** — it does not saturate, and superflex makes
it the decisive position. Studio's job was to test the exception before anyone designed for it,
because *"does not saturate at the top"* and *"supports a finer ladder throughout"* are different
claims and only the first was established.

Script: `qb-grain.py` → `qb-grain.json`. Source: `model_forward_capture_raw`, capture 2026-07-28,
468 rows with a DVS.

## 1. QB does resolve — and that is exactly the trap

| pos | n | distinct values | resolution | at ceiling | ties in top 24 |
|---|---|---|---|---|---|
| **QB** | 47 | 46 | **97.9%** | **0** | **0** |
| RB | 111 | 103 | 92.8% | 6 | 6 |
| WR | 199 | 182 | 91.5% | 6 | 5 |
| TE | 111 | 93 | 83.8% | 11 | 11 |

A finer ladder would cut every 4 ranks (`high-end / mid / low-end` inside each block of 12). Of the
11 such cuts in the top 48, **none at QB falls inside a tie**. On the saturation test, QB passes
cleanly and the exception looks real.

**It is not real.** The gap those cuts sit on:

| pos | median gap at a finer cut | median \|Δ\| when the model moves a player | ratio |
|---|---|---|---|
| **QB** | **0.50** | **7.50** | **15×** |
| RB | 0.60 | 9.40 | 16× |
| WR | 0.23 | 10.60 | 46× |
| TE | 0.81 | 9.90 | 12× |

On a 0–100 score, a finer boundary sits on a gap of **0.23–0.81 points**, while a real model
revision moves a player **7.5–10.6 points**. **Distinct is not resolved.** Two QBs half a point apart
are distinct in the float and identical in any sense a reader would mean.

## 2. The interpretable form — tier churn across real revisions

Across the transitions where values actually changed, how many players change their **coarse** tier
(blocks of 12) versus their **finer** sub-tier (blocks of 4)?

| pos | n (pooled) | coarse (12) churn | fine (4) churn |
|---|---|---|---|
| **QB** | 83 | **19%** | **34%** |
| RB | 186 | 26% | 37% |
| WR | 346 | 29% | 38% |
| TE | 201 | 54% | 81% |

**Fine churns more than coarse at every position, QB included — nearly double at QB.**

## 3. The honest limits, and they are not small

- **Only 2 of 34 transitions show any change**, both in the first days of the capture
  (06-25→06-26, 06-26→06-27). Since 06-27 the model lane has been static.
- **Those two are population BUILD events, not steady-state revisions** — the modelled population
  grows across them (QB 36→47, RB 76→110, WR 147→199, TE 89→112). Comparing only shared players
  controls for this partially, not fully.
- **Therefore the absolute churn rates are NOT projectable to a future model run.** "The next
  revision will move 29% of WRs" is not a claim this supports and must not be made.
- **What IS robust is the relative comparison** — a finer ladder is less stable than a coarser one
  at every position, by roughly 1.3–1.5× — and **the order-of-magnitude gap between boundary width
  and revision magnitude**, which does not depend on the churn rates at all.

## 4. What this changes

1. **COARSE is right for a better reason than the ceiling.** The saturation argument covers 23
   players at the top of three positions. The boundary-versus-revision-magnitude argument covers
   **the entire population at all four positions**.
2. **The QB exception is refuted and should be closed.** QB is not a safe place to go finer; it is
   a place where going finer *fails invisibly*, because there are no ties on the surface to warn
   the reader. That is worse than TE, where the constraint is at least visible as a tie bar.
3. **A caution about my own method.** Studio measured "97.9% distinct" first and nearly reported it
   as support for a finer QB ladder. Resolution of the *encoding* says nothing about resolution of
   the *estimate*. This is the same class of error as the 2026-07-24 cost-per-hit metric: a number
   that looks like precision because the arithmetic produced decimals.
4. **Relay-relevant, not yet relayed.** This extends `011-RELAY.md` R2 (model values unchanged 17
   consecutive days) with the other half of the picture: *when* they change, they move ~9 points and
   reshuffle a large share of any ranking built on them. R2 is not authorised to cross, so this is
   recorded here and stated in the proposal rather than sent.
