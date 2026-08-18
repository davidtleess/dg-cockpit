# Layer 4 — our special sauce, measured rather than assumed

**Written 2026-08-17 against the running app, on David's instruction to lay the foundation in
layers: standard fantasy → dynasty → advanced statistics → what is ours.** Layers 1–3 are the
category's common knowledge. This layer is the only one that cannot be researched on the web,
because it is a property of this product. Every number below is reproduced by a command.

Reproduce: `python3 -c` probes against `http://127.0.0.1:8000` and the artifacts under
`app/data/`. Nothing here is recalled; it was all measured today.

---

## 1. What our model actually is

Per the WR model card (`GET /api/trust-surface/WR/model-card`), verbatim:

> **Intended use:** "Forecast 2-year average PPG for active NFL wide receivers. Dynasty trade
> decision support in Superflex PPR (12-team, 2QB) leagues."
> **Out of scope:** single-season redraft start/sit; keeper cap valuations without manager review.

So the model is a **two-year average points-per-game forecaster**. Engine B v2, per-position ridge,
backtest run 2026-05-31, `git_sha 12f5565`.

### 1a. THE FINDING THAT MATTERS MOST: DVS is that forecast, rescaled

`dynasty_value_score` is a **per-position linear rescaling of `projection_2y`, clipped to [0, 100]**.
Measured across 388 players carrying both:

| position | DVS ÷ proj_2y | sd of that ratio | n |
|---|---|---|---|
| QB | **4.9752** | 0.0019 | 37 |
| RB | **6.3688** | (clipping only) | 99 |
| WR | **6.8976** | (clipping only) | 163 |
| TE | **10.6371** | 0.0110 | 89 |

Spot check, WR: proj 0.03 → DVS 0.2; 0.36 → 2.5; 0.52 → 3.6; 0.82 → 5.7. Exact.

**Three consequences, and they are design-load-bearing.**

1. **DVS carries no information beyond the projection.** The abstract 0–100 number David has
   objected to since 2026-07-15 (*"too abstract to provide any value"*) is **fantasy points per
   game multiplied by a constant.** The product can speak in the hobby's own unit — *"we project
   9.2 PPG a game over the next two seasons"* — without any modelling change whatsoever. This is
   the cheapest available fix to the longest-standing complaint in this engagement.
2. **DVS is not comparable across positions.** DVS 50 means 10.05 projected PPG for a QB, 7.85 for
   an RB, 7.25 for a WR and **4.70 for a TE**. Any surface that sorts or compares DVS across
   positions is comparing unlike quantities. (Within a position it is a clean 0–100 scale, which
   is presumably the intent.)
3. **The ceiling destroys exactly the players trades are about.** Clipping at 100 pins the elite:

   | pos | pinned at 100.0 | their real projection span | who |
   |---|---|---|---|
   | WR | 6 of 163 | 14.57 – 20.32 PPG (**5.76 PPG**) | Nacua, Smith-Njigba, Chase, St. Brown, Rice, Pickens |
   | TE | 11 of 89 (**12%**) | 9.66 – 14.75 PPG (**5.10**) | McBride, Bowers, Kittle, Kraft, Goedert, Pitts |
   | RB | 5 of 99 | 16.42 – 18.86 PPG (2.45) | McCaffrey, Gibbs, Robinson, Taylor, Achane |
   | QB | none | — | — |

   **Our model cannot distinguish Ja'Marr Chase from George Pickens**, or Brock Bowers from Kyle
   Pitts. For a product whose stated purpose is dynasty *trade* support, the blind spot sits
   precisely on the assets that anchor trades.

## 2. How good is it, against the only benchmark that matters

The app publishes its own backtest (`GET /api/trust-surface/{POS}`), four folds testing 2020–2023,
market baseline `dp_archive`. Ranking quality is nDCG@24 — model vs market, same folds:

| position | mean nDCG edge over the market | folds won | r²(oos) range | Kendall τ range |
|---|---|---|---|---|
| QB | **−0.0240** | 0 of 4 | 0.14 – 0.30 | 0.49 – 0.56 |
| RB | **−0.0311** | 0 of 4 | 0.44 – 0.56 | 0.54 – 0.61 |
| WR | **−0.0006** | 3 of 4 | 0.60 – 0.69 | 0.56 – 0.63 |
| TE | **+0.0032** | 1 of 4 | 0.24 – 0.56 | 0.36 – 0.63 |

**Read it honestly: the model does not out-rank the market anywhere.** It is behind at QB and RB,
and a coin-flip at WR and TE. The app's own fixed copy — *"Consensus-competitive, edge unproven"* —
is precisely accurate, and this table is what it means numerically.

The model *does* predict outcomes respectably in absolute terms (WR r² 0.60–0.69 is real
signal). Being no better than a crowd consensus is not the same as being bad. But **no surface may
imply that our number should be trusted over the market's**, because the evidence does not support
it, and Studio has been building two-lane surfaces for a month without ever checking this.

### 2a. The gate that would justify the entire product concept is unevaluated

`divergence_validity` is **`None` for all four positions.** The product's core idea is that where
our lane disagrees with the market, the disagreement is informative. That is exactly the gate that
has not been evaluated. Until it is, a divergence is an observation, not a signal — and every
Studio surface built on divergence rests on an unevaluated premise.

## 3. Our board barely moves

Measured across the daily model capture (54 days, `model_forward_capture.db`): **scores changed on
2 of 54 capture days** — 2026-06-26 (259 players) and 2026-08-14 (2 players, 0.1 DVS). The model
learns from finished games; in August there are none. So today our lane is a **standing opinion**,
not a live one, and any surface implying model movement is manufacturing it.

## 4. What is genuinely ours — the honest list

Not the model's accuracy. These:

1. **One league's complete history.** `league_transactions.db`: 937 transactions across four
   seasons — 39 trades with **both sides captured symmetrically**, 381 free-agent moves, 323
   waivers, 184 failed waiver bids (i.e. *what managers tried and lost*, which is intent data).
   Full ownership for all 12 teams. **KeepTradeCut aggregates 200,813 leagues and therefore has
   breadth with no memory; we have depth with no breadth.** They structurally cannot say what
   happened next in your league. We can.
2. **Daily two-lane capture since 2026-06-24** — 55 days of market price *and* our model's score,
   both stored. Nobody else holds our lane at all, so nobody else can compute a disagreement.
3. **An unusually honest instrument.** Published per-position backtests with confidence intervals,
   a model card naming its own failure modes, `decision_supported: false` on every payload, a
   banned-vocabulary check. Most of the category publishes a number and no evidence. **This is a
   real differentiator and it is currently buried in a tab.**

## 5. What we hold and do not serve — the largest gap in the product

`app/data/nflverse_usage.db` — **843 MB, 15 tables**, and **not one API route references it**
(`grep -rl "nflverse\|playerprofiler\|pff_export\|ff_opportunity" app/api/routes/` returns nothing):

| table | rows | seasons |
|---|---|---|
| depth_charts | 812,074 | 2018–2024 |
| ftn_charting | 185,215 | 2022–2025 |
| pfr_def / pfr_rec / pfr_rush / pfr_pass | 62,345 / 35,724 / 18,461 / 5,424 | 2018–2025 |
| **ff_opportunity** (weekly expected fantasy points) | **47,282** | **2018–2025** |
| nflverse_injury_report | 45,337 | 2018–2025 |
| ngs_receiving / ngs_rushing / ngs_passing | 14,731 / 6,059 / 5,933 | 2016–2025 |

Plus `playerprofiler.db` (472 MB) and a PFF export tree.

**This is Layer 3 — the advanced-statistics layer — sitting on disk, fully captured, and entirely
absent from the product.** Two screens (Waiver Radar, Rookie Board) are parked on the stated
grounds that in-season usage signals do not exist, and the briefing's §4 hard constraints were
written before this data landed. **The constraint is stale; the data is here.** (First flagged
2026-08-07 as relay item R3, still unrelayed.)

## 6. What this layer means for design

- **Speak in PPG, not DVS.** The unit conversion is free and already computed.
- **Never imply our rank beats the market's.** Show disagreement as disagreement; the backtest
  forbids more, and the divergence gate is unevaluated.
- **Treat the elite tier as unresolved by our model** — at WR and TE the top is a plateau at 100.
- **Do not draw our lane as moving** while it changes twice a summer.
- **The differentiator is the league's own memory and the honesty of the instrument**, not
  valuation accuracy. Surfaces should be built on what we uniquely hold.

## 7. Open, and honestly unresolved

- Is the clip at 100 deliberate (a display scale) or a valuation ceiling? Either way it is lossy at
  the top; **engineering question, not a design one.**
- `divergence_validity` — never evaluated, or evaluated and withheld?
- ~~Is anything in the shipped UI sorting DVS across positions?~~ **Audited and clean.** No sort
  comparator in `frontend/src` references DVS; it is displayed per-row (Roster Audit, the two-lane
  player card, the What-Changed deltas), which is a legitimate within-position use. The
  incomparability is a property to respect in new design, not a defect to report.
