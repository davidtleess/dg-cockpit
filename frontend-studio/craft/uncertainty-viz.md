# Uncertainty and distribution visualization — how to draw a tail

Pulled 2026-07-24 (Tower) against Tier 1 §1 of `CRAFT-LIBRARY.md`. Every source below is freely
readable — author preprints, open-access journals, public course pages, public repos. Written to
prevent one specific failure: **an asset with a fat right tail collapsed into an average, four
different ways.** Same canon as `dataviz-principles.md` §D; this replaces the placeholder there.

## A. The rules that would have caught the failure

- **A mean is not a summary of a skewed quantity — it is a summary of a symmetric one.** For a
  fat-tailed variable, report the median plus named upper quantiles (P50 / P75 / P90), never a
  single central number. (Bergstrom & West, *Calling Bullshit* wk 5, "means versus medians",
  callingbullshit.org/syllabus.html — the canonical case is UNC geography graduates' 1984 average
  salary, which is really Michael Jordan.)
  **Rules out:** "expected hits", "value per pick", "cost per hit" as the headline number. Those
  are means with a different coat on.

- **Show outcomes, not moments.** The decision-relevant fact about a fat right tail is
  *how often the big outcome happens*, which is a count, not a moment of the distribution. Kay,
  Kola, Hullman & Munson (CHI 2016, *When (ish) is my bus?*,
  users.eecs.northwestern.edu/~jhullman/busUncertaintyVis.pdf) found lay users reason better from
  **discrete outcome** displays than from continuous density, because the task reduces to counting.
  **Rules out:** a smooth density curve as the only tail representation.

- **The quantile dotplot is the default mark for a one-variable distribution.** Construction
  (mjskay/when-ish-is-my-bus/quantile-dotplots.md): take *n* evenly spaced probabilities
  (for n=20: 0.025, 0.075 … 0.975), push each through the **inverse CDF**, plot as a Wilkinson
  dotplot. Deterministic quantiles, **not random draws** — random draws "sometimes obscure the
  distribution shape, shift the location, or over/under-represent the tails" (ibid.), which is the
  one thing a tail chart must not do. 20 dots is the worked example; 20 or 50 keeps a dot countable.
  Fernandes, Walls, Munson, Hullman & Kay (CHI 2018) found quantile dotplots and CDFs measurably
  improved real decisions over interval and textual displays.
  **Rules out:** drawing "the tail" as an unlabelled gradient the reader cannot count.

- **Frequency-frame the tail in words next to the mark.** "3 of these 20 picks" beats "15%".
  Natural-frequency framing outperforms percentage framing for lay audiences (Spiegelhalter,
  Pearson & Short, *Visualizing Uncertainty About the Future*, Science 2011, free at
  stat.berkeley.edu/~aldous/157/Papers/spiegelhalter_visualizing.pdf; corroborated in Padilla, Kay
  & Hullman, *Uncertainty Visualization*, friendly.github.io/6135/papers/Uncertainty_Visualization_Padilla_Kay_Hullman_2020.pdf).
  The quantile dotplot and the frequency sentence are the same fact twice — use both.

## B. Error bars are the wrong mark here, on evidence

- **Error bars trigger a binary "within/without" heuristic**: readers judge overlap, not magnitude,
  and perceive the same gap differently on each side of the overlap boundary — a sharp perceptual
  cutoff where the data has none (Correll & Gleicher, *Error Bars Considered Harmful*, TVCG 2014,
  free at vis.csail.mit.edu/classes/6.859/readings/pdfs/Corell-ErrorBarsConsideredHarmful.pdf).
  Their tested replacements — **gradient plots** and **violin plots** — beat bar-plus-error-bar for
  inferential tasks.
- **Symmetric error bars on an asymmetric variable are a false statement**, not merely a weak one:
  the mark asserts the tail is the same size on both sides. For a fat right tail, prefer an
  asymmetric quantile interval or a mark that carries the shape.
  **Rules out:** bar + ± error bar for any pick-value, hit-count or price distribution.

## C. When motion is available

- **Hypothetical Outcome Plots (HOPs)** animate individual draws. Hullman, Resnick & Adar (PLOS ONE
  2015, open access, journals.plos.org/plosone/article?id=10.1371/journal.pone.0142444) found HOPs
  substantially more accurate than error bars *and* violin plots for **multivariate** judgments
  ("is B bigger than A?", "is B bigger than both A and C?" — F(2,573)=43, p<0.001 on the trivariate
  task), because viewers count frames instead of decoding a mark.
- **Frame rate ≈ 400ms** (the PLOS study's rate; Kale, Nguyen, Kay & Hullman, InfoVis 2018,
  mucollective.northwestern.edu/files/2018-HOPsTrends-InfoVis.pdf, report 400–500ms performing
  best). Give a pause/step control.
- **HOPs are not free.** They were *no better* — sometimes worse — for single-variable mean
  estimation at high variance, and they are unavailable in static media (Hullman et al. 2015).
  Use HOPs for "which of these is better"; use a quantile dotplot for "how big does this get".
  **Rules out:** animating a single distribution because it looks alive. Motion buys comparison.

## D. Static distribution forms — what each is honest for

- **Gradient / density fill:** good for shape, but obeys **proportional ink** — a shaded region's
  area must stay proportional to the value it stands for (Bergstrom & West,
  callingbullshit.org/tools/tools_proportional_ink.html). Fills therefore need a **zero baseline**
  and no truncation. An unfilled line may be truncated; a filled one may not.
- **Violin:** needs a large n. For small samples a dotplot or jittered strip shows more and lies
  less (data-to-viz.com/graph/violin.html).
- **Ridgeline:** worth it only at ~6+ groups **with an ordering to reveal**; it deliberately hides
  data in the overlap, so with few groups or no ranking it is decoration (data-to-viz.com/graph/ridgeline.html).
- **Fan chart:** the right form for a distribution *over time*; band the quantiles, don't draw a
  central line so heavily that it reads as the forecast (Spiegelhalter et al. 2011).
- **Icon array:** the right form for a probability quoted to a person. Fixed denominator, whole
  icons, tail icons highlighted by position and shape as well as colour.

## E. Two failure modes the reader brings with them

- **Deterministic construal error** — viewers substitute a single deterministic value for the
  uncertainty shown, and this happens with *visual* displays more than with text (Padilla, Kay &
  Hullman, review chapter, and Joslyn & Savelli 2020 therein). Mitigation: annotate the mark with
  the frequency sentence, and never let one visual element (peak, midline, mean dot) dominate
  contrast — in `dataviz-principles.md` terms, the mean is ground, the spread is figure.
- **Boundary/containment reading** — any drawn edge on an interval reads as a wall ("inside is
  possible, outside is not"); the hurricane-cone case is the standard example (Padilla et al.).
  Mitigation: fade band edges, don't stroke them, and label the band with its quantile
  ("80% of outcomes"), never leave it unnamed.
  **Rules out:** a hard-stroked min/max band — already flagged in `dataviz-principles.md` §C2, now
  with the citation behind it.

## F. The load-bearing takeaway

**A fat right tail must be drawn as countable outcomes with a named quantile, not as a moment of a
distribution.** One quantile dotplot plus one frequency sentence answers "how often is this a
league-winner" — which is the actual question — and no arrangement of averages ever will.
