# Graphical perception — the primary sources, checked

Pulled 2026-07-24 (Tower) against Tier 1 §2 of `CRAFT-LIBRARY.md`. All sources freely readable.
Written to prevent one specific failure: **citing Cleveland–McGill and Mackinlay from memory and
still shipping an inverted encoding ("shorter is better").** The rankings were never the problem.
The missing rule was the one about *direction*, and it belongs to Mackinlay, not Cleveland.

## A. Cleveland & McGill 1984 — the ranking, stated exactly

*"Graphical Perception: Theory, Experimentation, and Application to the Development of Graphical
Methods", JASA 79(387):531–554. Free copy: math.pku.edu.cn/teachers/xirb/Courses/biostatistics/Biostatistics2016/GraphicalPerception_Jasa1984.pdf*

Ten elementary perceptual tasks, ordered most → least accurate, in **six tiers** (ties within a
tier are real; do not invent precision between them):

1. Position along a **common** scale
2. Position along **non-aligned** scales
3. **Length**, **direction**, **angle**
4. **Area**
5. **Volume**, **curvature**
6. **Shading**, **colour saturation**

- **The rule:** encode the quantity the reader must judge on the highest-ranked task the layout
  allows. Everything else in this file is a corollary.
- **Their own prescriptions:** replace pie and divided/stacked bar charts (angle and non-aligned
  length) with **dot charts** (position on a common scale); replace shaded statistical maps
  (bottom tier) with **framed-rectangle charts**, which convert a shading judgment into a position
  judgment inside a constant frame.
  **Rules out:** the stacked bar as a comparison mark, and the choropleth as a precision mark.
  Both are fine as *shape* displays and unfit as *magnitude* displays.
- **Practical framed-rectangle move:** any time you must show a value inside a small repeated cell
  (a table row, a card, a roster slot), a constant-width frame with a positioned tick beats a
  filled proportion bar — it restores a common scale across rows. This is the same finding that
  makes fixed shared scales the load-bearing fix in `dataviz-principles.md` §C1.

## B. Heer & Bostock 2010 — the replication, and what it added

*"Crowdsourcing Graphical Perception: Using Mechanical Turk to Assess Visualization Design",
CHI 2010. Free: idl.cs.washington.edu/files/2010-MTurk-CHI.pdf*

- The Cleveland–McGill ordering **replicated** on a crowd sample (~50 subjects per condition):
  position beats length beats angle beats area, by log error.
- **Added encodings:** rectangular and circular **area** both showed systematic
  *under*-estimation (perceived-magnitude exponent below 1). People are reliably worse at area
  than at length, and the error is biased, not just noisy.
  **Rules out:** treating a bubble/area mark as "roughly as good as a bar". It is not, and it errs
  in a known direction.
- **Added a design variable:** chart size and gridline spacing measurably change accuracy — a
  denser reference grid improves estimation at small chart sizes. This is the empirical licence for
  keeping a light reference line in a card-sized sparkline rather than stripping all non-data ink.
  It is the one place the data-ink rule yields.

## C. Mackinlay 1986 — the part that gets forgotten

*"Automating the Design of Graphical Presentations of Relational Information", ACM TOG 5(2):110–141.
Free preprint: pdfs.semanticscholar.org/a755/3e8420ff976e449494f6c37882e7a7b6fdc0.pdf (ACM copy is
paywalled; the criteria below are stated identically in Munzner ch.5, free slides — see §D).*

Two criteria, and **the first is the one that was violated**:

- **Expressiveness** — a graphical language expresses a set of facts iff it encodes **all** the
  facts in the set and **only** the facts in the set. An encoding that implies something the data
  does not say fails expressiveness *regardless of how accurate its channel is*.
- **Effectiveness** — among expressive designs, prefer the one that exploits the visual system
  best; hence the rankings.

**Ranking is per data type, and the orders differ sharply:**

| Data type | Ordered channels (most → least effective) |
|---|---|
| Quantitative | position, length, angle, slope, area, volume, density(value), colour saturation, colour hue, texture, connection, containment, shape |
| Ordinal | position, density(value), colour saturation, colour hue, texture, connection, containment, length, angle, slope, area, volume, shape |
| Nominal | position, colour hue, texture, colour saturation, density(value), connection, containment, length, angle, slope, area, shape, volume |

- **The actionable consequence:** colour **hue** is near the bottom for quantitative and near the
  top for nominal. This is the formal backing for the standing rule that colour carries identity
  (model vs market) and never magnitude — `dataviz-principles.md` §A, now sourced.
- **Length and area sit near the bottom for nominal data.** Sizing a category is a category error.

### C1. The inverted-encoding rule, derived

A magnitude channel is **monotone by construction**: longer *is* more, higher *is* more. A design
that means "shorter is better" adds a fact the channel does not carry — it fails **expressiveness**,
not effectiveness. There is no amount of labelling that repairs it, because the reader decodes the
channel pre-attentively and reads the label second.

Three legitimate fixes, in order of preference:

1. **Transform the data, not the axis.** Encode goodness directly (value, percentile, points above
   replacement) so that more ink = more good. Rank is the usual culprit: rank descends while
   quality ascends. Convert rank → percentile before it touches a mark.
2. **If rank itself is the subject**, use position on a common scale with **both endpoints named in
   words** ("RB1" top, "RB48" bottom) and no length/area mark at all — position tolerates an
   arbitrary origin; length and area do not.
3. **Never invert an axis to fix it.** "Don't invert axes to create a misleading impression" is an
   explicit rule in Bergstrom & West, callingbullshit.org/tools/tools_misleading_axes.html.
   An inverted axis moves the violation from the mark to the reader.

**Pre-ship check, ten seconds:** point at the biggest mark on the chart and say out loud what it
means. If the sentence contains "worst", "cheapest", "fewest" or "lowest", the encoding is inverted.

## D. Munzner — the free version, and the channel taxonomy

*Visualization Analysis and Design*, ch.5 "Marks and Channels". The book is paid, but the author
publishes the **full slide decks and figures free** at cs.ubc.ca/~tmm/vadbook/ (all-slides PDF;
figures CC-BY-4.0) plus two free video segments, "Marks & Channels I" (12:36) and "II" (16:53).

- **Magnitude channels vs identity channels.** Ordered data → magnitude channels (position, length,
  angle, area, luminance, saturation). Categorical data → identity channels (spatial region, hue,
  shape, motion). Mixing them is the expressiveness failure in §C1, restated.
- **The allocation principle:** map the *most important* attribute to the *highest-ranked* channel
  it is eligible for. Importance is decided by the task, not by which attribute is prettiest.
- **Channels are also judged on separability, popout, and grouping**, not accuracy alone — two
  channels that are individually strong (e.g. size and hue) interfere when combined.

## E. Task and data distribution override the ranking

Heer et al., *"The Effect of Task and Data Distribution on the Effectiveness of Visual Encodings"*
(EuroVis 2018, free: idl.cs.washington.edu/files/2018-TaskDataEffectiveness-EuroVis.pdf) shows the
effectiveness ordering is **conditional**: the best encoding shifts with the task (value lookup vs
comparison vs summarisation) and with the shape of the data itself. The ranking is a prior, not a
verdict.

**What this means in practice:** state the task in one sentence before choosing the mark. "Compare
two players on one metric" and "read one player's value" are different charts, and the ranking
alone will not tell you which.

## F. The load-bearing takeaway

**Cleveland–McGill tells you which channel is accurate; Mackinlay tells you whether the encoding is
allowed at all — and expressiveness is checked first.** The July 2026 inverted encoding passed the
accuracy test and failed the legality test, which is why quoting the rankings did not save it.
