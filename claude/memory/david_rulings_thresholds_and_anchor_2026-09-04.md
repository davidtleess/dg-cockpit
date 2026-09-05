---
name: david_rulings_thresholds_and_anchor_2026-09-04
description: "David's two 2026-09-04 evening rulings that unblocked the rescale: take BOTH replacement-level threshold corrections (RB 33→30, WR 53→44), and the one-scale ANCHOR is 20.1. Recorded with what he was shown before he chose."
metadata:
  node_type: memory
  type: feedback
---

**Both ruled 2026-09-04 ~20:4x EDT, in one AskUserQuestion screen put to him by Greg.**

⛔ **PROVENANCE, stated up front because this file exists partly BECAUSE that kept going wrong.** These are
options he SELECTED, not sentences he typed. The decisions are his; the wording is ours. Both option labels and
both previews are reproduced verbatim below so no future lane has to reconstruct them.
See the header of [[david_rulings_ranking_2026-08-31]].

## RULING 1 — TAKE BOTH THRESHOLD CORRECTIONS

Selected: **"Take both — it's the correction."**

Replacement level is set by rank. Shipped: QB 25 · RB 33 · WR 53 · TE 13. What his actual lineup implies:
QB 25 · RB **30** · WR **44** · TE 13. **QB and TE were already right; the two that were guessed from a flex
percentage are the two that were wrong.** (The WR53 comment in `engine_b_contract.py` derived it from a flex
slot he does not have.)

**What he was shown before choosing — this matters, because he authorised the cost:**
- Fixing RECEIVER ONLY, which is what he had literally asked for on 09-04, **is a no-op he could not see**:
  14 of his 26 players move, every one by exactly +0.30, nobody crosses zero, **his roster order is identical
  player for player.** The shipped WR value already sat at 8.79 against a correct 8.74 — the documentation was
  broken, the number happened not to be. (It does still shift 297 of 582 places league-wide.)
- Fixing BOTH is the real change. **Jaxson Dart takes the top spot on his roster from Ashton Jeanty.** All five
  of his backs fall ~10 points (Jeanty 29.67→19.49, Henderson 16.14→5.96, Kaelon Black 13.40→1.78); QBs and TE
  rise 4–5 (Dart 16.91→21.76, Mendoza 10.31→15.89, Kraft 2.85→6.80). **AJ Barner −3.63→+0.32 is the ONLY sign
  change on his roster** and the only card whose sentence flips (below replacement TE → above). 18 of his 26
  change place; 561 of 582 league-wide.

**He chose it with all of that in front of him.** The running back move is authorised knowing it costs his best
back the top of his own roster. ⛔ Do not soften it, do not re-litigate it, do not "protect" him from it.

⚠ **Unreconciled at time of writing:** Fred wrote that the RB threshold was "set ten ranks too deep", but his own
figures say 33 against 30, which is three. The ten is the POINTS his backs fall. Kept out of what David was told.

## RULING 2 — THE ANCHOR IS 20.1

Selected: **"20.1 — the quarterback ceiling (my recommendation)"**, over 14.5 (the receiver ceiling).

Every position is currently normalised by its OWN ceiling, so 100 means a different amount of football at each.
One scale needs one shared denominator.

**What he accepted:** every number on his screen drops **~28%** — Kraft 100→~49, Mendoza 85→~71, Barner 90→~42 —
in exchange for **nobody pinning at the ceiling**, so his best players stay distinguishable from each other.
The argument that carried it was positional, not statistical: at 14.5 roughly 22–27 players pin at exactly 100,
**mostly QBs, and in a superflex league those are the players he most needs to tell apart** — the same problem
tight end already has. He took the 28% knowingly. It is a change of UNIT, not of meaning: every order, ratio and
sign preserved.

## HOW THEY SHIP

Greg's standing instruction to Fred: **one coupled change, one morning, one explanation, reversible in one
commit.** P90, replacement DVS and the lambda are algebraically one derivation, so a split landing gives him two
mornings of unexplained movement and, in between, replacement levels derived at one denominator while scores are
computed at another. The burden is on the split, not on the union. Bob's three coupled surfaces (`af6ff61b`) are
landed and DORMANT — this is the change that switches them on, and **each one must be watched to fire rather than
assumed to**, because a dormant guard and a broken guard look identical until the morning they are needed.

See [[project_te_scale_ruling_2026-09-04]] for the principle he ruled earlier the same day, and
[[feedback_the_failure_path_returns_the_success_signal]] for why the guards get verified rather than trusted.
