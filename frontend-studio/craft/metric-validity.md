# Metric validity — when a derived number is nonsense

Pulled 2026-07-24 (Tower) against Tier 1 §3 of `CRAFT-LIBRARY.md`. Sources are freely readable:
the *Calling Bullshit* course site publishes its full syllabus, case studies and tools pages
(callingbullshit.org); the book itself is paid and is not needed — the course pages carry the
arguments. Written to prevent one specific failure: **a hero chart built on price ÷ binary hit
rate, after the invalidity had already been written down in a footnote.**

The failure was arithmetic, not drawing. So this file is a **gate that runs before any mark
exists.**

---

## A. The validity gate — run this before the chart

Six checks. Any single failure kills the metric; it does not earn a caveat.

1. **Say the unit out loud.** "Dollars per hit" — is a hit a thing you can buy one of? If the unit
   does not name something in the world, the number is not a measurement.
2. **Same population, same window, same definition** for numerator and denominator. Two sources
   that define "hit" differently cannot be stacked into one ratio, no matter how well they align
   visually. (This is exactly the stranded-tail problem Studio recorded in `CRAFT-LIBRARY.md` —
   two sources, two definitions, one impossible mark.)
3. **Is the denominator a small-sample rate?** If yes, stop — see §C.
4. **Does the denominator collapse a distribution?** If yes, stop — see §B.
5. **Could the outcomes still change?** If the sample includes units whose result is not yet
   final, the rate is censored — see §D.
6. **Is the rate pooled across groups with different mixes?** If yes, see §E.

**A footnote is not a mitigation.** If a metric fails the gate, it does not get drawn with an
asterisk; it gets replaced. Something can be *true and still misleading* — the entire premise of
Bergstrom & West's course (callingbullshit.org/FAQ.html).

---

## B. Ratios: the denominator is a design decision, and it is where the lie lives

- **Choosing the denominator changes the story while every number stays true.** Nestlé's "99.9%
  caffeine free" is caffeine mass ÷ *total drink weight*, which is mostly water — by that same
  denominator, strong coffee is also 99.9% caffeine free
  (callingbullshit.org/case_studies/case_study_caffeine_free.html).
  **Rules out:** picking the denominator that makes the number look interesting. Pick it first,
  from the question, and write it in the axis label.

- **A count without its denominator is not a finding.** $70M of food-stamp fraud is a headline;
  0.1% of program spending is the same fact
  (callingbullshit.org/case_studies/case_study_foodstamp_fraud.html).
  **Rules out:** a "total hits" bar next to a "total picks" bar in different charts. Show the rate,
  and show n.

- **Dividing a value by a probability destroys the distribution.** A binary hit rate answers
  `P(X > threshold)`. A price answers `E[cost]`. `price ÷ hit-rate` therefore answers *no question*
  — it is an expected cost per success only if every success is worth the same, which is precisely
  false for a fat-tailed asset where the whole value sits in the top few outcomes.
  **Rules out:** cost-per-hit, value-per-pick and expected-hits as headline metrics for anything
  with a tail. The correct move is a quantile display of the value itself — see
  `craft/uncertainty-viz.md` §A.

- **A ratio of two ratios needs a stated referent.** "1.4× more efficient" is meaningless without
  naming both baselines in the same sentence as the number.

---

## C. Small denominators manufacture extremes

Howard Wainer, **"The Most Dangerous Equation"** (*American Scientist* 95(3):249–256, 2007; free at
americanscientist.org/article/the-most-dangerous-equation). De Moivre: **se = σ / √n**. The
variance of a mean grows as the sample shrinks.

- For a proportion, `se(p) = √(p(1−p)/n)`. At n=30 and p=0.20 that is ±0.073 — the plausible true
  rate spans roughly 6%–34%. Any ratio with that in the denominator swings by a factor of five
  while the underlying truth has not moved.
- **The classic trap Wainer documents:** ranking units by a rate computed over small samples ranks
  *sample size*, not quality — the smallest groups occupy both the top and the bottom of the list.
  **Rules out:** "best value pick slot", "highest hit-rate round", or any leaderboard of per-slot
  rates where slot n is in the tens. If it must be shown, show the interval, not the point, and
  order by something with a stable denominator.
- **Never divide by a rate that can approach zero.** The result is unbounded and its error is
  unbounded with it.

---

## D. Selection, censoring and survivorship

- **Right-censoring makes retrospective averages meaningless.** The musician-mortality table shows
  rap artists dying at ~30 and jazz artists at ~60 — because rap has not existed long enough for a
  performer to die old. "The rap stars who *have* died certainly died young"
  (callingbullshit.org/case_studies/case_study_musician_mortality.html).
  **Rules out:** computing a hit rate over recent draft classes alongside old ones. A 2024 rookie
  has not finished being a hit or a bust; including them biases the rate downward, and excluding
  them biases the sample toward whatever made older picks resolvable.
- **The reliable tell is a shrinking denominator.** If the number of units in the window falls
  while every reported metric improves, the improvement may be entirely who left the sample.
- **Related biases named in the course (wk 5):** the Will Rogers phenomenon (reclassification
  improves both groups' averages while nobody changes), lead-time bias, length-time bias
  (callingbullshit.org/syllabus.html).
- **Check to run:** ask "which units *could not* appear in this dataset?" If the answer is
  non-empty and correlated with the outcome, the metric is describing the filter, not the world.

---

## E. Simpson's paradox — and the rule for whether to aggregate

*Stanford Encyclopedia of Philosophy, plato.stanford.edu/entries/paradox-simpson/ (free).*

An association between two variables "emerges, disappears or reverses when the population is
divided into subpopulations." Standard case: treatment and control both 50% overall, yet treatment
wins in **every** subgroup.

- **The decision rule is causal, not statistical.** Stratify when the third variable is a
  **confounder** (a common cause of both group membership and outcome). Aggregate when it is a
  **mediator** (downstream of the thing you are measuring). "Whether one should partition… does not
  depend only on the statistical distribution, but crucially on one's causal background
  assumptions" (SEP).
- **Practical version:** before pooling any rate across groups, check whether the groups have
  different sizes *and* different base rates. If both, the pooled number is a weighted artefact of
  the mix, and the mix must be shown.
  **Rules out:** a single overall "hit rate" across rounds, positions or years whose composition
  differs. Show it per stratum, or show the strata weights.

---

## F. The presentation rules that are validity rules

These belong here, not in a style guide, because they change what the number *asserts*:

- **Proportional ink** — a shaded area must be proportional to the value it represents; therefore
  bars and any filled chart include zero, and unfilled line charts need not
  (callingbullshit.org/tools/tools_proportional_ink.html). Radius-scaled bubbles violate this by
  construction: half the value drawn at half the radius shows one *quarter* the area.
- **Axes** — no axis-type switching mid-axis; no inverted axes; dual axes with independently tuned
  scales "should set off alarm bells" (callingbullshit.org/tools/tools_misleading_axes.html).
  Log axes are fine and often right for a fat-tailed quantity — but label them as log, every time.

---

## G. The load-bearing takeaway

**A metric you have already documented as invalid is a build blocker, not a caveat.** The gate in
§A takes under a minute and runs before any pixel exists; the July 2026 failure was a chart built
on a ratio whose own footnote already said it was nonsense. Write the gate's verdict into the
proposal next to the metric name, so the next session inherits the verdict instead of the number.
