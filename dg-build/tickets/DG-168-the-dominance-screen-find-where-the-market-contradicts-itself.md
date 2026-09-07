# DG-168 — The dominance screen: find where the market contradicts ITSELF, not where it disagrees with us

**Layer:** 3 · **State:** open — the first buildable increment of DG-167 · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **the edge**
**Source:** Dynasty Nerds, *"The Ultimate Guide on Valuation"* (Lee Liberman, 2022-08-29), read 2026-09-06 at David's
direction. Filed by Greg 09-06 as the highest-value output of the asset program.

---

## THE IDEA, in the source's own two rules

> **Rule 1.** Given two players with the same redraft value, the one with the longer career span left should be
> worth more in dynasty.
> **Rule 2.** Given two players with the same career span left, the one with the higher redraft value should be
> worth more in dynasty.
> *"Suppose either of these two rules is broken. In that case, a trade can extend our team's cumulative career
> span or add to the current year's value without giving up any hypothetical dynasty value."*

His worked example: Mark Andrews and Stefon Diggs priced almost identically in both redraft and dynasty, with very
different career spans — so one of them is mispriced.

## ⭐ WHY THIS OUTRANKS PUBLISHING A BOARD

A ranked list is the most fragile thing we can ship. It needs every player priced (80 rookies are not), it asserts
an order between players separated by noise (the 09-05 reproduction found four top pairs inside 0.02-0.09%), and
it rests on a baseline the field has argued about in four separate discussions without resolving.

**A dominance test needs none of that.** It requires only that we be right about DIRECTION on two axes, not about
magnitude, not about the baseline, and not about players we cannot price. **It finds the market contradicting
ITSELF rather than disagreeing with us** — which is the only form of edge David's 08-31 ruling 8 permits, because
it does not require our number to be better than the market's.

Runnable TODAY on ~200 players: market value and rank exist for 27 of 27 of his roster and 269 of 274
league-rostered (`universe_market_divergence_latest.json`), and career multipliers exist for every non-rookie.

## DONE WHEN

The product can state, for a named pair, a sentence of the form:
> *"The market prices these two the same. He produces more AND has more startable seasons left."*

Output is a handful of sentences, **not a table**. Each carries both axes and the market's own numbers.

## ⛔ TRAPS

- ⛔ **This is not a divergence screen.** David's 08-31 ruling 8: *"Edge = a validated historical outcome, never
  model-market disagreement. A divergence is a hypothesis, not a finding."* A pair flagged here is flagged because
  the MARKET's two prices are inconsistent with each other on facts we measured — not because we disagree with it.
- ⛔ **Compare against market values TRANSLATED to his league settings first — see DG-169.** Every market number is
  priced for 12-team half-PPR starting THREE receivers; his league is full PPR starting TWO. Untranslated, the
  receiver and tight-end axes are systematically wrong and this screen will manufacture false pairs.
- ⛔ **Only pairs where BOTH players are priced.** Never infer dominance against a blank.
- ⛔ Require a real margin on BOTH axes before flagging, or the screen fires on noise — the same false-precision
  problem that makes the ranked board fragile. Draft Value Analytics: *"a projection-of-a-projection"*, and top
  projection systems miss by 30-40 points a season.
- ⚠ Nothing here has EVER graded a prediction; the first outcome numbers arrive week 4. **A flagged pair is a
  hypothesis with a receipt, not a proven edge.** Say so.

Related: [[DG-167]] (the program), [[DG-169]] (translation), [[DG-164]] (the career term).
