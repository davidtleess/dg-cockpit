# DG-173 — A third-party PROJECTION or RANKING is a market price. Widen the ban and assert it.

**Layer:** 3 · **State:** open · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **model honesty · governance**
**Source:** **David's ruling, 2026-09-06, typed:** *"market price is 3rd party points projection or ranking of a
player — projection and price are very similar its a main variable in price. you have to replace those points
and or value."* Filed by Greg the same morning.

---

## THE RULING AND ITS REASONING

Greg put the question to him directly, having found that **every one of the four sources David sent blends
multiple third-party projection providers** — Dynasty Nerds takes a median of five; a r/fantasyfootball thread
names FantasyFootballAnalytics as the most accurate and several tools build on it; the Reddit dynasty author uses
Sleeper's per-stat projections. Greg argued a points projection is a football forecast rather than a price and
recommended allowing it.

**David refused, and his reasoning is the ruling:** a projection is *a main variable in price*. If you trade a
player away you have to replace those points, so the projection and the price are the same object seen from two
sides. **This extends 08-31 ruling 8 rather than restating it.**

⛔ **Consequence, stated plainly: we do not get to buy our way out of DG-162's finding.** The model reads three
columns and a free consensus beats it. The remedy is a better model on football data, not a borrowed forecast.

## WHAT IS ALREADY RIGHT (verified 09-06, do not redo)

`PROHIBITED_COLUMNS` in `engine_a_contract.py`, `head_b_contract.py` and `engine_b_contract.py` all ban
`ktc_value`, `ktc_rank`, `adp`, `fantasycalc_value`, enforced by `models/leakage.py`. DynastyProcess ECR
(`dynastyprocess_ecr_2qb`) appears only in `eval/` and `outcome_loop/` — the comparison lane — which is correct.

## ⛔ WHAT IS NOT COVERED, and is the ticket

**Nothing in that list names a PROJECTION or a CONSENSUS RANKING.** The ban is written against four specific
value/rank columns. A column called `sleeper_projection`, `fantasypros_ecr`, `ffa_projected_points` or
`consensus_rank` would pass the leakage check today.

## DONE WHEN

1. The prohibited registry names **projections and consensus rankings as a CLASS**, not four columns by name, and
   the leakage checker fails on any of them reaching a model.
2. A sweep confirms no third-party projection currently reaches a feature, a training table or a score — reported
   as a measurement with counts, not as an assurance.
3. The boundary is written where a reader will find it: **evaluation and comparison MAY read them; models MAY NOT.**

## ⛔ TRAPS

- ⛔ **Do not make this a documented rule.** [[feedback_the_failure_path_returns_the_success_signal]] — a threshold
  that is documented and not asserted is exactly as good as a deleted one. Bob deleted his own fragility rule in a
  rewrite on 09-05 and kept quoting its result for hours. **Assert it, and watch it go red on purpose before
  believing it green.**
- ⛔ The check must fail on a column that does not yet exist. A test that perturbs keys absent from the data passes
  on the very defect it is named after — that happened on 09-05 with the double-count check.
- ⚠ This does NOT ban translating market values into his league's settings on the comparison lane — see DG-169.
  Read that ticket's boundary section before touching either.
