# DG-167 — The edge David actually chose: find where the market is WRONG. Ticketless for 5 days

**Layer:** 3 · **State:** open — needs a scoping pass before it is buildable · **Lane:** — · **DG 3.0** · **the edge**
**Source:** David's 2026-08-31 ruling 2, verified at source in `daab5375`. Asked *"What is the edge you actually
want?"* he selected **TWO**: (a) **find where the market is WRONG** — target its blind spots, thin-sample,
low-hype, deep-roster players; and (b) predict the market's next move. He explicitly did NOT choose
"out-rank the market head-on." Filed by Greg 2026-09-05 after an audit found the word "blind spot" appears
**zero times** in 163 tickets and zero times on the board.

⚠ Provenance: option text he SELECTED, not a sentence he typed. The decision is his; the wording is ours.

---

## WHY THIS IS THE ONE THAT MATTERS

He is not chasing a better projection. He is chasing an edge over **eleven specific managers in one league.**
Everything else on the board makes the product more correct; this is the only line of work that makes it *win*.
Edge (b) is ruled and running — "instrument now, model in 12 months" (ruling 4), and DG-020 took the market panel
from 4 snapshots to 480. **Edge (a) has never been written down as work.**

## ⛔ FOUR CONSTRAINTS THAT KILL THE OBVIOUS BUILD — read before designing anything

1. **"Edge" = a validated historical outcome, NEVER model-market disagreement** (his ruling 8). A divergence is a
   **hypothesis, not a finding.** A screen listing "players we disagree with the market about" is NOT this ticket
   and must not be built as if it were.
2. **Market price may never be a model input** (ruling 8, the STRICTEST option — he rejected even price-as-a-label
   on a non-feeding-back layer). The market is a comparison lane and an evaluation benchmark, nothing else.
3. **The model is three columns.** DG-162 measured it: points per game, games played, age. Everything beyond them
   buys nothing detectable at QB and RB and ~0.01 r² at WR and TE, and that is NOT a scaling artifact (§2b).
   **So the edge cannot come from us modelling better than the market on the same information.**
4. **Free consensus already beats Engine B** — DynastyProcess ECR wins 13 of 16 folds, +0.049 Spearman, CI
   excludes zero. ⛔ This does not license blending, which ruling 8 forbids. It DOES mean any claim of an edge must
   clear the free benchmark, not the naive one.

**Read together, those four say the edge is not a better number on the players everyone is looking at. It is
having a number AT ALL on the players nobody is looking at, and being able to prove afterwards that it was right.**
That is the same population his coverage ruling already reaches (rank everyone, always) and the same population
the 8-game gate used to refuse.

## WHAT A FIRST INCREMENT PROBABLY IS — to be confirmed, not assumed

- **Define the blind spot measurably.** Thin market coverage, low quote confidence, few holders, deep roster
  positions — a property of the MARKET's information, not of our disagreement with it.
- **Establish whether the market is actually worse there.** Measure the market's own historical accuracy inside
  the blind spot against outside it, on realised outcomes. **If the market is equally good there, this ticket is
  answered NEGATIVE and closes** — that is a real outcome, see DG-163 for the shape.
- Only if it is worse: does OUR number beat it in that population, graded on outcomes, against the free
  consensus benchmark rather than against naive.

## DONE WHEN

The product can state, about a named population and with a dated receipt, **"the market was wrong about these
players and we were right, measured on what happened."** Anything less is a hypothesis on a screen.

## TRAPS

- ⛔ **KTC, Dynasty Nerds and FootballGuys are ToS-barred as data sources** by the repo's own `PROHIBITED_COLUMNS`.
  Published methodology only; no scraping, no paywall circumvention.
- ⛔ Nothing in this product has EVER graded a prediction against an outcome at the time of writing. DG-018/DG-152
  built the harness; **the first real number arrives week 4.** Do not claim an edge before it exists.
- ⛔ Survivorship: the population most likely to look like a blind spot is the population most likely to vanish
  from the data. Whatever cohort is defined must be defined **as of a date** and followed forward.
