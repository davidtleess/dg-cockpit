# Dataviz principles — the evidence-card marks (engagement standard)

Compiled 2026-07-23 from the research corpus David handed Studio (CMU brand data-viz, chartexpo
Gestalt, JHU design guide, luiscruz "effective visualizations," experimentology viz chapter,
mathisonian/awesome-visualization-research). Mailing-tracker params stripped before fetching.
This is the literature-defensible standard for the four evidence-card marks; apply it, don't
re-derive from taste. Ties to the always-loaded `dataviz` skill — same canon.

## A. Cross-cutting principles (each cited)

- **Position/length beat area/color/angle for quantitative accuracy** (Cleveland-McGill ranking; experimentology, JHU). CONFIRMS: dumbbell, sparkline, aging curve, replacement dots all encode value as position — the accurate channels. Color = identity (model/market), never magnitude. ✓
- **Color is never the sole carrier; 4.5–8% have CVD** (CMU, luiscruz). CONFIRMS the CVD-validated blue/amber pair; CHALLENGES us to add a redundant non-color cue (shape/position/label) so model-vs-market survives grayscale.
- **Maximize data-ink; kill chartjunk** (Tufte via luiscruz; JHU). Every mark of ink needs a data reason; no band/gridline/frame that isn't load-bearing.
- **Direct labeling beats legends** (experimentology; Gestalt figure/ground, chartexpo). The single number IS the direct label — "one visual + one number." Avoid separate keys.
- **Gestalt proximity/connectedness group without extra ink** (chartexpo). The dumbbell connector reads as "one relationship."
- **Small multiples require SHARED scales** (luiscruz, experimentology). Sharpest risk in a stacked-card layout.
- **Zero/consistent baselines; never truncate to exaggerate** (CMU, luiscruz, experimentology). Fix rank-axis endpoints; don't auto-fit.
- **Similarity = same encoding for the same category everywhere** (chartexpo). blue=model / amber=market is fixed across all marks, reused for nothing else.

## B. Per-mark recommendations

- **WINDOW (aging curve):** curve = figure, peak band = recessed ground (low-contrast fill, no border); label "peak/your window" inline at the band, not a legend; strip numeric y-ticks (it's a prior, not measured production); the age-dot is the one high-contrast accent.
- **OUR-VIEW-vs-MARKET (dumbbell):** keep the connector (length encodes disagreement); add a redundant shape cue so it reads without color; direct-label each dot; **anchor both track ends to a fixed rank range so disagreement magnitude is comparable card-to-card.**
- **VALUE-NOW (sparkline):** **FIX the y-scale across all cards** (shared rank range) — auto-scaling is the top comparability killer; min/max band = recessed ground; one endpoint label.
- **REPLACEMENT:** prefer two dots on the *same fixed* rank scale as the dumbbell (consistent reading grammar); direct-label both; the gap means the same distance everywhere.

## C. Contradictions / risks in what Studio built

1. **Auto-scaled sparklines destroy cross-row comparability** — biggest risk; = the confirmed **004 N4** finding AND the flaw Studio self-flagged in the value-now mark. Fix every rank axis to a shared scale. **THREE ROADS, ONE FIX.**
2. **Shaded bands competing with lines** — keep the window peak band and any min/max band as low-contrast ground only (no borders, no mid-tone).
3. **A smooth aging curve implies precision it doesn't have** — it's a prior. Soften the line and signal spread; drop numeric y-ticks (done). Applied 2026-07-23: faint uncertainty halo under the curve + no y-values.
4. **Color-only model/market identity** risks CVD failure if a mark renders monochrome — add redundant shape/position.

## D. Deeper techniques to mine later (awesome-visualization-research)

- Cleveland, "Graphical Perception" (1984, *Perception*) — the source ranking behind our position encodings.
- Hullman et al., Hypothetical Outcome Plots / "When (ish) is My Bus?" (*Uncertainty*) — honest ways to show the curve/sparkline as a prior, not a fact.
- "Displaying Uncertainty with Shading" (*Uncertainty*) — governs the peak/min-max bands.
- Heer et al., "Sizing the Horizon" (*Visual Forms*) — empirical guidance for tiny sparklines at card size.
- UW-IDL "Task and Data Distribution on Effectiveness of Visual Encodings" (*Perception*) — encoding choice is task-dependent (dumbbell vs slot for replacement).

**The load-bearing takeaway:** shared/fixed rank scales across every card is the one change the literature,
the 004 N4 verdict, and Studio's own flag all point to. Solve it once, across the daily tape and the
player card.
