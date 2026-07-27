# Preattentive Processing and Visual Search

**A craft reference for dense data interfaces**

Scope: what the visual-search literature actually establishes, what it does not,
and how the reliable parts translate into decisions about tables, grids, and
dashboards. Every substantive claim below carries an author and a URL. Claims I
could not verify against an accessible primary source are marked
**UNVERIFIED**.

A standing caution before anything else: this literature is *less tidy* than its
popular retellings. The single most common design-blog error is to present
"preattentive features" as a settled list of magic properties that are processed
"instantly." The researchers themselves do not say that. Jeremy Wolfe, who has
spent forty years on this problem, writes that the term preattentive "has been
controversial" and that, defined carefully, "the term is nearly tautological"
([Wolfe, *Visual Search*, Stevens' Handbook of Experimental Psychology, 4th ed.,
2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).
Use the findings; don't oversell them.

---

## 1. What "preattentive" actually means

### 1.1 The standard definition and the 200–250 ms claim

The operational definition used throughout the visualization literature comes
from Christopher Healey's long-running preattentive processing pages:

> "Typically, tasks that can be performed on large multi-element displays in
> less than 200 to 250 milliseconds (msec) are considered preattentive."
>
> — [Healey, *Perception in Visualization*, NC State](https://www.csc2.ncsu.edu/faculty/healey/PP/)

The rationale for that specific threshold is the one detail most summaries drop,
and it is the detail that makes the number meaningful rather than arbitrary:

> "Eye movements take at least 200 msec to initiate."
>
> — [Healey, *Perception in Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/)

That is the whole argument. If a display is shown for less than ~200 ms and then
removed or masked, the viewer cannot have made a voluntary eye movement to
interrogate it. Whatever they report must therefore have been available from a
single fixation — "a single glimpse." The 200–250 ms figure is not a claim about
how fast a feature is *processed*; it is a bound on how much *self-directed
looking* could have occurred. This distinction matters, and collapsing it is the
source of most misuse.

The canonical survey pairing this with modern attention research is
[Healey & Enns, "Attention and Visual Memory in Visualization and Computer
Graphics," *IEEE TVCG* 18(7):1170–1188,
2012](https://doi.org/10.1109/TVCG.2011.127) ([PubMed
record](https://pubmed.ncbi.nlm.nih.gov/21788672/)). *Note on access:* I could
not locate an open author-hosted PDF of this paper — the frequently cited
`csc2.ncsu.edu/faculty/healey/download/tvcg.12a.pdf` now returns 404. Healey's
open [*Perception in Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/)
pages cover substantially the same material and are cited in its place
throughout.

### 1.2 The two measurement paradigms — they are not the same experiment

Two distinct experimental methods sit behind the phrase "preattentive," and
conflating them causes real design errors.

**(a) Brief-exposure / accuracy method.** Show the display for a controlled
duration (say 100–200 ms), mask it, ask whether a target was present. Vary
exposure duration; measure accuracy. This is the method the 200–250 ms threshold
belongs to. Healey's pages describe the task families used: target detection,
boundary detection, region tracking, and counting/estimation
([Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/)).

**(b) Response-time × set-size method.** Let the viewer look as long as they
like. Vary the *set size* (number of items). Measure response time. Plot RT
against set size and take the **slope**, in milliseconds per item. This is the
dominant method in the modern search literature, and the one that generates the
numbers designers actually quote.

Wolfe is explicit about how to read the slope:

> "The slope gives the most interesting information about search. It is a
> measure of the rate at which items can be processed. The intercept is a
> measure of the time required for nonsearch processes (e.g., the act of making
> a response)."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)

And the two theoretical extremes:

> "If all items can be processed in parallel without capacity limitations, the
> slope of the RT × set size function would be expected to be zero ms/item. If
> items are processed in series, one after the other, then the RT would increase
> linearly with the number of items in the display."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)

### 1.3 Target-present vs. target-absent, and the 2:1 slope logic

Every properly run search experiment includes trials where the target is
**absent**. This is not bookkeeping — it is where the mechanism shows itself.

Under a serial, self-terminating search, a viewer finding a present target must
examine on average half the items; a viewer *confirming absence* must examine all
of them. So the absent slope should be twice the present slope:

> "On blank trials, the subject must examine each item in order to confirm that
> no target is present. This yields a slope of 40 ms/item. On target trials, the
> subject must examine an average of half of the items before finding the
> target, yielding a slope of 20 ms/item."
>
> — [Wolfe, Cave & Franzel, "Guided Search: An Alternative to the Feature
> Integration Model for Visual Search," *JEP:HPP* 15(3):419–433,
> 1989](https://search.bwh.harvard.edu/new/pubs/GS1_JEPHPP89.pdf)

**Where the tidy story breaks.** The 2:1 ratio is a prediction, not a robust
finding. Wolfe's own accounting in GS6:

> "Though it has been assumed that 2:1 slope ratios are the rule in the
> empirical data, the actual empirical data tends to produce slope ratios
> greater than 2:1."
>
> — [Wolfe, "Guided Search 6.0: An updated model of visual search,"
> *Psychonomic Bulletin & Review*,
> 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)
> ([publisher page](https://link.springer.com/article/10.3758/s13423-020-01859-9))

The reason is memory. The clean 2:1 ratio "assumes perfect memory — sampling
from the display without replacement." Once memory for already-checked items is
imperfect, absent trials suffer disproportionately, and GS6 simulations predict
ratios "of about 3" when memory covers less than about half the set size
([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).

**Design consequence.** Absence is expensive and gets worse superlinearly with
density. An interface that requires a user to establish that *nothing* is wrong
across a large grid is asking for the most costly operation in the whole
paradigm. Give them a positive signal to find instead.

### 1.4 Reference slope values

Useful magnitudes, all from open sources:

| Search type | Present slope | Absent slope | Source |
|---|---|---|---|
| Feature "pop-out" (odd colour) | ~0–1 ms/item | ~0–1 ms/item | [Wolfe 2021, Fig. 1a–b](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf) |
| Unguided (a 2 among 5s) | ~43 ms/item | ~95 ms/item | [Wolfe 2021, Fig. 1e–f](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf), after Wolfe, Palmer & Horowitz 2010 |
| Acuity/crowding-limited (T-L triplets) | ~150 ms/item | ~250–350 ms/item | [Wolfe 2021, Fig. 1c–d](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf) |
| Classic "serial" search, general | 20–30 ms/item | 40–60 ms/item | [Wolfe, *Visual Search* review](https://search.bwh.harvard.edu/new/pubs/the_review.pdf) |

Note the pop-out row: even genuine feature search is not flat. Wolfe puts it at
"near (but typically a little greater than) 0 ms/item"
([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).
"Flat" is an idealization.

---

## 2. The catalogue of preattentive features

Two catalogues matter, and they disagree in instructive ways.

### 2.1 Healey's visualization-facing list

From [Healey, *Perception in
Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/), with the primary
citations he attaches to each:

| Feature | Cited sources (per Healey) |
|---|---|
| Line/blob orientation | Julész & Bergen 1983; Sagi & Julész 1985; Wolfe et al. 1992 |
| Length, width | Sagi & Julész 1985; Treisman & Gormican 1988 |
| Closure | Julész & Bergen 1983 |
| Size | Treisman & Gelade 1980; Healey & Enns 1998/99 |
| Curvature | Treisman & Gormican 1988 |
| Density, contrast | Healey & Enns 1998/99 |
| Number, estimation | Sagi & Julész 1985; Healey et al. 1993; Trick & Pylyshyn 1994 |
| Colour (hue) | Nagy & Sanchez 1990; Healey 1996; Bauer et al. 1998 |
| Intensity, binocular lustre | Beck et al. 1983; Treisman & Gormican 1988; Wolfe & Franzel 1988 |
| Intersection | Julész & Bergen 1983 |
| Terminators (line endpoints) | Julész & Bergen 1983 |
| 3D depth cues | Enns 1990; Nakayama & Silverman 1986 |
| Flicker | Gebb et al. 1955; Brown 1965; Huber & Healey 2005 |
| Direction of motion | Nakayama & Silverman 1986; Driver & McLeod 1992 |
| Velocity of motion | Tynan & Sekuler 1982; Nakayama & Silverman 1986 |
| Lighting direction | Enns 1990 |
| 3D orientation | Enns & Rensink 1990; Liu et al. 2003 |

### 2.2 Wolfe's confidence-graded list — the more honest instrument

Wolfe & Horowitz refuse to publish a flat list. They grade attributes by
strength of evidence, which is exactly the discipline a designer needs. Verbatim
from Box 1:

> **Undoubted guiding attributes:** Colour · Motion · Orientation · Size
> (including length, spatial frequency, and apparent size)
>
> **Probable guiding attributes:** Luminance onset (flicker) · Luminance
> polarity · Vernier offset · Stereoscopic depth and tilt · Pictorial depth cues
> · Shape · Line termination · Closure · Curvature · Topological status
>
> **Possible guiding attributes:** Lighting direction (shading) ·
> Expansion/looming · Number · Glossiness (lustre) · Aspect ratio · Eye of
> origin/binocular rivalry
>
> **Doubtful cases:** Novelty · Letter identity/alphanumeric category ·
> Familiarity
>
> **Probably not guiding attributes:** Intersection · Optic flow · Colour change
> · 3D volumes · Luminosity · Material type · Scene category · Duration ·
> Biological motion · Your name · Threat · Semantic category · Blur · Visual
> rhythm · Animacy/chasing
>
> — [Wolfe & Horowitz, "Five factors that guide attention in visual search,"
> *Nature Human Behaviour* 1:0058,
> 2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf)

Their reasoning for the grades:

> "Attributes like colour are deemed to be undoubted because multiple
> experiments from multiple labs attest to their ability to guide attention.
> Probable feature dimensions may be merely probable because we are not sure how
> to define the feature. Shape is the most notable entry here."
>
> — [Wolfe & Horowitz
> 2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf)

**Two disagreements worth noticing.** Healey lists *intersection* as
preattentive (citing Julész); Wolfe files it under "probably not." And *shape* —
the thing interface designers reach for constantly — is only "probable," because
the field cannot define it:

> "It is clear that something about the shape of objects guides attention, and
> it is decidedly unclear what that something is."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)

**Practical ranking for interface work.** Only four attributes are undoubted:
**colour, motion, orientation, size.** These are the channels to spend on when
something must be found fast. Closure/enclosure and curvature are "probable" —
good, but a tier below. Anything you would describe as "iconography" or
"semantics" is in the doubtful-to-no range: icons do not pop out *as icons*, they
pop out only insofar as they differ in colour, size, or orientation.

### 2.3 Enclosure and added marks

"Enclosure" and "added marks" appear in most practitioner lists of preattentive
attributes; the widely reproduced four-way taxonomy (form / colour / spatial
position / motion) is Stephen Few's synthesis, principally in *Now You See It*
(2009) and *Show Me the Numbers* (2004). **UNVERIFIED:** I could not verify the
exact contents of Few's attribute table against an openly accessible primary
source; the Perceptual Edge articles I could retrieve do not contain it.

What *is* verifiable is the underlying perceptual grounding, and it is solid:
**closure** is on Healey's list (Julész & Bergen 1983) and in Wolfe's "probable"
tier; **line termination** — which is what an added tick, dot, or asterisk
supplies — is likewise on both
([Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/);
[Wolfe & Horowitz
2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf)).
So the design advice survives even though Few's specific table is unverified
here: a box drawn around a cell, or a small mark added to it, recruits a real
guiding attribute.

---

## 3. Feature-integration theory and the conjunction failure

This is the single most operationally useful result in the literature for dense
interfaces. It deserves precision.

### 3.1 The claim

Anne Treisman and Garry Gelade's feature-integration theory (FIT) proposed that
the visual system registers simple features across the whole field in parallel,
in separate "feature maps" — but that *combining* features into an object
requires focused attention, applied to one location at a time
([Treisman & Gelade, "A feature-integration theory of attention," *Cognitive
Psychology* 12:97–136,
1980](http://wexler.free.fr/library/files/treisman%20\(1980\)%20a%20feature-integration%20theory%20of%20attention.pdf)
— author-scan PDF, image-only, no text layer).

Healey's summary of the mechanism:

> "Individual feature maps (colour, orientation, shape, texture) encode features
> in parallel, allowing rapid detection when targets possess unique features.
> Conjunction targets require serial scan of the master map of locations."
>
> — [Healey, *Perception in
> Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/)

### 3.2 The concrete example

Healey's three-panel demonstration is the clearest statement of the problem:

1. **Find a red circle among blue circles.** One feature (hue) is unique to the
   target. Found at a glance. Flat slope.
2. **Find a red circle among red squares.** One feature (curvature/form) is
   unique. Found at a glance. Flat slope.
3. **Find a red circle among red squares *and* blue circles.** Now nothing is
   unique. "Red" is shared with the squares; "circle" is shared with the blue
   circles. Only the *conjunction* red+circle identifies the target — and there
   is no feature map for conjunctions.

> "A target made up of a combination of non-unique features (a conjunction
> target) normally cannot be detected preattentively."
>
> — [Healey, *Perception in
> Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/)

The consequence is a phase change in cost, not a gradual increase. Cases 1 and 2
are effectively free regardless of how many rows are on screen. Case 3 charges
per item.

### 3.3 The numbers

Treisman & Gelade's Experiment 1 slopes, as reported by Wolfe, Cave & Franzel
(who ran the direct comparison and quote the originals):

> "Treisman and Gelade (1980) obtained average slopes of 28.7 for positive and
> 67.1 for negative trials."
>
> — [Wolfe, Cave & Franzel
> 1989](https://search.bwh.harvard.edu/new/pubs/GS1_JEPHPP89.pdf)

28.7 ms/item present, 67.1 ms/item absent, for a colour × form conjunction.
Against roughly flat slopes for the single-feature controls.

**Do the arithmetic for an interface.** A table with 300 visible rows, one cell
flagged. If the flag is a unique feature: found in roughly constant time
irrespective of row count. If the flag is a conjunction of two non-unique
features, at ~29 ms/item present: on the order of *seconds* of pure search,
before any reading or comprehension. And if the user must confirm that *no* row
is flagged, use the absent slope — worse than double.

**Caveat, stated plainly:** these are laboratory slopes from abstract stimuli at
controlled eccentricity. Do not present them to stakeholders as predicted
interface timings. They establish the *shape* of the cost curve and its order of
magnitude, not a budget.

### 3.4 Illusory conjunctions

FIT's second prediction: if binding requires attention, then under divided
attention features should mis-bind. They do — observers report seeing a red X
when the display contained a red O and a green X. This is direct evidence that
colour and form are registered separately before being joined
([Treisman & Gelade
1980](http://wexler.free.fr/library/files/treisman%20\(1980\)%20a%20feature-integration%20theory%20of%20attention.pdf);
summarized in [Wolfe, *Visual Search*
review](https://search.bwh.harvard.edu/new/pubs/the_review.pdf)). For interfaces,
this is the perceptual basis of a real failure mode: in a glanced-at dense grid,
users can genuinely mis-attribute a colour to the wrong row or the wrong column.

---

## 4. Guided Search — the modern refinement

### 4.1 FIT did not survive contact with conjunctions

The strict dichotomy failed empirically, and it failed on FIT's own key case:

> "Influential or not, it became clear over the course of the 1980s that FIT was
> not quite correct. The core empirical challenge came from searches for
> conjunctions of two features."
>
> — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)

Wolfe, Cave & Franzel found conjunction slopes far too shallow for serial search
— "half of our subjects have slopes of less than 6.0 ms/item on positive trials,"
against Treisman & Gelade's 28.7
([Wolfe, Cave & Franzel
1989](https://search.bwh.harvard.edu/new/pubs/GS1_JEPHPP89.pdf)). They also found
that *triple* conjunctions (colour × size × form) were **easier** than double
conjunctions — the opposite of what a serial-binding account predicts, and the
result that motivated the guidance idea.

### 4.2 The guidance idea

> "While FIT proposed a dichotomy between parallel and serial search tasks, GS
> proposed a continuum based on the effectiveness of guidance."
>
> — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)

Attention is still deployed one item at a time, but *not at random*. Preattentive
feature information builds a **priority map**, and attention goes to the peaks.
A conjunction search is efficient to the exact degree that its component features
can restrict the candidate set. Healey's summary:

> "An activation map based on both bottom-up and top-down information is
> constructed during visual search. Attention is drawn to peaks in the
> activation map."
>
> — [Healey, *Perception in
> Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/)

This reframes the conjunction result usefully. Conjunction search is not
categorically doomed; it is *unguided* search that is doomed. Wolfe's example:
searching for a dark green L among items of various colours, "your attention
will be guided to the dark green items… You will attend to dark green items
until you discover that one of those is an L"
([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).
The colour prunes the set; the L is then found within the pruned set.

### 4.3 GS6

The current model adds four things beyond feature guidance:

**Five sources of guidance:**

> "(1) top-down and (2) bottom-up feature guidance, (3) prior history (e.g.,
> priming), (4) reward, and (5) scene syntax and semantics."
>
> — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)

Layout regularity and learned convention are *first-class* guidance mechanisms in
this model, not soft factors. A user who has learned that the status column is
on the right is guided there by scene syntax as genuinely as by colour.

**Rate of deployment:** "Selective attention is guided to the most active
location in the priority map approximately 20 times per second." Recognition of
each attended item, however, "is modeled as a diffusion process taking > 150
ms/item" — so multiple items are being recognized concurrently but
asynchronously
([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).

**A quitting signal:** a separate accumulator terminates unsuccessful search.
This is the mechanism behind users giving up on a dense grid — abandonment is
modelled, not accidental.

**Functional visual fields:** guidance is not uniform across the screen. It
favours the fovea, and GS6 distinguishes a resolution FVF, an exploratory FVF,
and an attentional FVF
([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).

### 4.4 Where the dichotomy breaks — say it out loud

This is the passage to internalize, because it invalidates a lot of confident
design writing:

> "In fact, slopes of search tasks form a continuum from very efficient to very
> inefficient (Wolfe, 1998)… Note that it is a bad idea to try to strictly define
> terms like efficient using precise slope values. It would not be reasonable,
> for example, to assert that 8 ms/item is officially efficient whereas 10
> ms/item is officially inefficient. There is no categorical boundary between
> such labels; search efficiency is a continuous measure."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)

There is no bright line between "preattentive" and "not preattentive." There is a
continuum of guidance strength. A design that "uses a preattentive attribute" has
not thereby earned pop-out; whether pop-out occurs depends on the *magnitude* of
the difference, the distractors, the eccentricity, and the density.

Note also that the debate is live rather than closed: Wolfe's own reference list
includes [Liesefeld & Müller's "A theoretical attempt to revive the
serial/parallel-search dichotomy" (*Attention, Perception, & Psychophysics* 82:228–245,
2020)](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf). Treat "the
dichotomy is dead" as the mainstream position, not a unanimous one.

### 4.5 Competing accounts

Two further models Healey documents, both of which reject the simple dichotomy:

- **Duncan & Humphreys' similarity theory.** Search efficiency depends on
  target–nontarget (T-N) similarity and nontarget–nontarget (N-N) similarity:
  "as T-N similarity increases, search efficiency decreases… as N-N similarity
  decreases, search efficiency decreases"
  ([Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/)).
- **Boolean map theory (Huang et al.).** The viewer holds one "boolean map" of
  selected locations at a time; conjunction search requires two map operations in
  series but can still be set-size independent
  ([Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/)).

The design-relevant common ground: *what makes search hard is the relationship
between target and field, not a property of the target alone.*

---

## 5. Interference, asymmetry, heterogeneity, crowding

### 5.1 Hue interferes with shape — and not vice versa

The most directly actionable interference result in visualization:

> "The visual system favours colour over shape. Background variations in colour
> interfere with a viewer's ability to identify the presence of individual shapes
> and the spatial patterns they form. If colour is held constant across the
> display, these same shape patterns are immediately visible. The interference is
> asymmetric: random variations in shape have no effect on a viewer's ability to
> see colour patterns."
>
> — [Healey, *Perception in
> Visualization*](https://www.csc2.ncsu.edu/faculty/healey/PP/)

Healey reports parallel hierarchies: luminance over hue, and hue over texture
([Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/)). The design rule he
draws:

> "The data-feature mapping should avoid situations where the display of
> secondary data values masks the information the viewer wants to see."

For a table this is concrete and slightly counterintuitive: if you want users to
read *shape-coded* or *glyph-coded* information, you must hold colour constant.
Colour variation you added for an unrelated purpose (row banding, category tint,
brand accenting) will suppress shape reading — while shape variation costs colour
reading nothing. The channels are not symmetric, so you cannot reason about them
as interchangeable "slots."

### 5.2 Search asymmetry

> "If we have two stimuli, A and B, it is sometimes easier to find an A among Bs
> than a B among As. This is known as a search asymmetry… The core idea is that
> it is easier to find the presence of a feature than its absence."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf),
> attributing the idea to Treisman & Souther 1985 and Treisman & Gormican 1988

Verified examples from the same source: a moving item among stationary ones is
easier than the reverse; a tilted line among verticals is easier than a vertical
among tilted lines; orange among yellow is easier than yellow among orange
([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).

Wolfe is careful that asymmetry is partly confounded with heterogeneity — in the
moving-target case, "in the reverse situation, the moving distractors could be
heterogeneous," and the asymmetry weakens (though persists) when distractors all
move in one direction
([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).

**Design consequence.** Encode the exception as the *presence* of something, not
the absence. A row that is flagged by *having* a mark is found faster than a row
flagged by *lacking* the mark every other row has. This applies directly to
common patterns: "all rows have a check except the failing ones" is the wrong way
round.

### 5.3 Distractor heterogeneity and linear separability

> "The more similar the target is to the distractors, the less efficient the
> search will be (T-D similarity) and the more heterogeneous the distractors are,
> the less efficient a search will be (D-D heterogeneity)."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)

But heterogeneity is not a scalar. The controlling variable is **linear
separability**:

> "Search for one color among two others will be quite efficient if a line can be
> drawn in color space that puts the target on one side of the line and the
> distractors on the other. Search will be quite inefficient if the target lies
> between the two distractors. This is known as the principle of linear
> separability."
>
> — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)

Wolfe gives the orientation analogue: finding a vertical line among lines tilted
20° and 60° left is easy; finding it among lines tilted 20° left and 20° right is
hard — *identical average heterogeneity*, but in the second case the target sits
between the distractors
([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).

**This is the single most under-applied result in dashboard colour design.** A
red alert row among grey rows is separable. A red alert row among amber and
maroon rows is not — red lies between them in colour space — and it will not pop
out no matter how "preattentive" hue is in the abstract. If you have a
three-level severity scale, the level you most need found must sit at an
*extreme* of the colour sequence, not in the middle of it.

Healey's colour-selection method controls exactly these variables: "colour
distance, linear separation, and colour category"
([Healey, "Choosing Effective Colours for Data Visualization," *IEEE Vis '96*,
pp. 263–270](https://vis.cs.brown.edu/docs/pdf/Healey-1996-CEC.pdf)).

### 5.4 Crowding and set-size limits

Guidance degrades in the periphery, and it degrades unevenly across features:

> "Both color and shape are preattentive features but guidance to oval will fail
> at a much smaller eccentricity than guidance to that one red spot."
>
> — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)

Wolfe notes that Rosenholtz and colleagues "attribute the bulk of the variation
in the efficiency of search tasks to the effects of crowding and the loss of
acuity in the periphery," and concedes: "it is clear that crowding and
eccentricity will limit preattentive guidance. Those limits will differ for
different features in different situations, but this topic is vastly
understudied"
([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).

**Design consequence, and an honest limit.** Colour survives peripheral viewing
and crowding far better than shape does. On a wide dense table, a shape or glyph
difference in a far column may simply not be available until the eye lands near
it — while a colour difference in the same cell still guides. But note the
researcher's own hedge: the quantitative limits are not established. Do not
promise a specific viewing-angle budget.

---

## 6. Cleveland & McGill: accuracy is a different ranking from speed

### 6.1 The ordering

Cleveland & McGill identified "elementary perceptual tasks" and ranked them by
how accurately people perform them
([Cleveland & McGill, "Graphical Perception: Theory, Experimentation, and
Application to the Development of Graphical Methods," *JASA*
79:531–554, 1984](https://doi.org/10.1080/01621459.1984.10478080) — *paywalled;
no open copy located*).

The widely reproduced ordering, most to least accurate: **position along a common
scale → position along non-aligned scales → length, direction, angle → area →
volume, curvature → shading, colour saturation.**

**Verification status.** I could not obtain an open copy of the 1984 paper, so
that six-line ordering is reported from secondary sources and is **UNVERIFIED**
in its exact wording and grouping. However, the empirical core is confirmed by
the authors' own open follow-up study:

> "The two position judgments are the most accurate, length judgments are second,
> angle and slope judgments are third, and area judgments are last."
>
> — [Cleveland & McGill, "An experiment in graphical perception," *Int. J.
> Man-Machine Studies* 25:491–500,
> 1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf)

That paper tested six basic judgments: "(1) Position along a common scale. (2)
Position along identical but non-aligned scales. (3) Length. (4) Angle. (5)
Slope. (6) Area."
([Cleveland & McGill 1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf)).

**Note what is missing: colour and shading were not tested in that experiment.**
Their position at the bottom of the ranking rests on the 1984 paper's reasoning
rather than on the 1986 measurements. Anyone citing "colour saturation is the
least accurate encoding" as a measured result should know the measurement is not
in the open follow-up.

### 6.2 Two robust secondary findings

From the same open 1986 paper, both directly useful:

> "Accuracy decreases as the distance between judged objects increases, but…
> level of technical training of subjects does not affect accuracy."
>
> — [Cleveland & McGill 1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf)

Proximity matters — comparisons get worse as the things being compared move
apart. And expertise does not rescue a bad encoding: "the visual tasks we are
investigating are very basic judgments that the visual system of a person
performs continually in everyday life." You cannot train users out of a poor
encoding choice.

The ranking has been replicated with modern methods; see [Heer & Bostock,
"Crowdsourcing Graphical Perception," *CHI
2010*](http://vis.stanford.edu/files/2010-MTurk-CHI.pdf), whose results "match
previous work" and "are consistent with theoretical predictions."

### 6.3 Speed and accuracy are different rankings — the crucial point

**These two literatures measure different things, and their orderings are not the
same. Conflating them is a real and common error.**

- The preattentive literature ranks channels by **how fast a difference is
  found** — can you locate the odd item without serial search?
- Cleveland & McGill rank channels by **how accurately a magnitude is decoded** —
  given that you are looking at it, how precisely can you read the value?

Colour is the clearest case of divergence. Hue is an *undoubted* guiding
attribute — one of only four
([Wolfe & Horowitz
2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf)).
It is also near the *bottom* of the accuracy ranking. Both are true, and they are
not in conflict, because they answer different questions. Colour is excellent for
"where should I look" and poor for "how much is it."

Position runs the other way. It is the *most accurate* channel
([Cleveland & McGill
1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf)) — but position
alone does not summon the eye. A value in the right place on an axis is read
precisely once attended; it does nothing to attract attention in a field of a
hundred other values.

**The synthesis for interface work:** use position/length to let a value be *read
accurately*, and colour/motion/size to determine *what gets read first*. These
are separate jobs. A design that uses colour to carry precise magnitude has
picked the wrong channel for accuracy; a design that relies on position alone to
raise an alert has picked the wrong channel for speed.

---

## 7. Practical translation for dense tabular and dashboard interfaces

### 7.1 Making exactly one thing pop in a table of hundreds of rows

The requirement is a flat RT × set-size slope, which by §3 requires the target to
differ from *every* distractor in a *single* guiding attribute.

1. **Pick one undoubted attribute** — colour, motion, orientation, or size
   ([Wolfe & Horowitz
   2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf)).
   For static tables, colour is the practical default: it survives eccentricity
   and crowding better than shape
   ([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).
2. **Make the rest of the table homogeneous in that attribute.** This is the
   binding constraint and the one most designs violate. Every other use of colour
   in the table — zebra striping, category tints, link blue, hover states, brand
   accents — is a distractor in the same feature map, and by §5.3 it converts a
   flat-slope search into an inefficient one.
3. **Check linear separability.** The alert colour must be at an extreme relative
   to all other colours present, not between them
   ([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).
4. **Encode by presence, not absence** (§5.2).

The practical implication is uncomfortable and worth stating: *a table can only
have one pop-out channel, and spending it means giving up decorative colour
everywhere else.* Pop-out is a scarce, exclusive resource, not an effect you can
apply to several things.

### 7.2 Why encoding two things in one channel fails

Two separate mechanisms, both fatal:

**The conjunction problem** (§3). If category is hue and severity is also hue,
then finding "high-severity items in category B" is a conjunction search over one
overloaded map. Slope goes from ~0 to tens of ms/item.

**The integrality problem.** Some channel pairs are not independently readable at
all:

> "Viewers decode separable dimensions such as position and shape largely
> independently, while perception of integral dimensions such as color hue and
> saturation are correlated."
>
> — [Heer & Bostock, *CHI
> 2010*](http://vis.stanford.edu/files/2010-MTurk-CHI.pdf), citing Colin Ware

Hue and saturation are **integral** — viewers cannot cleanly separate them. So
"hue for category, saturation for magnitude" is not two channels; it is one
channel that viewers read as a blend. This is treated at length in [Colin Ware,
*Information Visualization: Perception for Design*, 4th ed., Morgan
Kaufmann/Elsevier](https://shop.elsevier.com/books/information-visualization/ware/978-0-12-812875-6)
(book, not openly accessible; **UNVERIFIED** at page level — the integral/separable
claim above is verified via Heer & Bostock's citation of it, not from the book
directly).

**The cost of using colour for both category and magnitude** is therefore double:
you have built a conjunction search *and* used an integral pair. If you need
both, put category in a separable channel (position, or a spatial grouping) and
reserve colour for magnitude — or vice versa — but do not split colour.

### 7.3 How many categorical colours

The best-verified answer comes from a study designed for exactly this question.
Healey ran target-identification studies at 3, 5, 7, and 9 colours, with colour
distance and linear separation held constant within each study:

> "Our results showed that detection was rapid and accurate for all colours from
> both the three-colour and five-colour studies. Results from the seven-colour
> and nine-colour studies were mixed; some colours gave better performance than
> others."
>
> — [Healey 1996](https://vis.cs.brown.edu/docs/pdf/Healey-1996-CEC.pdf)

So: **five categorical colours is the reliable ceiling for guaranteed rapid
search on every category. Seven to nine is achievable but degrades unevenly** —
some of your categories will pop out and some will not, which is arguably worse
than none popping out, because it silently biases attention.

Stephen Few reaches a compatible number from a different direction:

> "If you want someone to make sense of the graph as a whole, then you must limit
> the number of data components that encode distinct meanings to seven at most —
> and safer yet, to no more than five."
>
> — [Few, "Tapping the Power of Visual Perception," Perceptual Edge,
> 2004](https://www.perceptualedge.com/articles/ie/visual_perception.pdf)

Frequently quoted higher figures (e.g. "about 12 distinguishable colours") are
attributed to Ware's book; **UNVERIFIED** — I could not check that figure against
an accessible source, and note that any such number depends heavily on whether
the criterion is *identification in isolation* (higher) or *rapid search in a
dense multi-colour field* (lower, as Healey measured).

### 7.4 When enclosure or an added mark beats a colour change

Prefer a border/box (closure) or an added glyph (line termination) over a colour
change when:

- **The colour channel is already spent.** If colour carries category or
  magnitude, adding an alert hue creates the conjunction of §3.2. Closure and
  line termination are in Wolfe's "probable" tier
  ([Wolfe & Horowitz
  2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf))
  — weaker than colour, but a genuinely *different* feature map, so they do not
  collide.
- **You need the underlying colour to remain readable.** A box around a heatmap
  cell preserves the cell's value encoding; recolouring destroys it.
- **Accessibility requires redundancy.** An enclosure or mark is a non-colour
  channel, so it survives colour-vision deficiency and monochrome rendering.

Prefer colour when the target may be viewed peripherally or the table is wide and
dense — guidance to shape "will fail at a much smaller eccentricity"
([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).

### 7.5 Calling the eye without decorating everything

The constraint follows directly from the theory rather than from taste. Pop-out is
*relational*: it exists only as a difference from a homogeneous field
([Duncan & Humphreys' T-N / N-N similarity, via
Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/)). Therefore:

- **Emphasis is zero-sum within a feature map.** Two "highlighted" things in the
  same channel are not two pop-outs; they are a two-item set the eye must search.
  Every additional emphasis makes each existing one weaker.
- **The default state must be genuinely uniform.** Design the unremarkable 99%
  first, flat and low-contrast. Emphasis is then almost free. Design the emphasis
  first and you will find yourself escalating contrast forever, because the
  baseline keeps rising.
- **Budget: one channel, one meaning, a small number of marked cells.** Beyond
  roughly the five-colour bound (§7.3) you no longer have guidance, you have
  decoration.
- **Layout regularity is itself guidance.** Scene syntax is one of GS6's five
  sources
  ([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).
  A stable column position for status information guides attention without
  spending any visual contrast at all — the cheapest guidance available.

---

## 8. Do / don't rules, each traceable to a named result

| # | Rule | Traceable to |
|---|---|---|
| 1 | **Do** make an alert differ from *every* other item in *one* attribute. **Don't** define it by a combination of two shared attributes. | Conjunction search: 28.7 ms/item present, 67.1 absent, vs. flat for features — [Treisman & Gelade 1980, via Wolfe, Cave & Franzel 1989](https://search.bwh.harvard.edu/new/pubs/GS1_JEPHPP89.pdf) |
| 2 | **Do** spend pop-out on colour, motion, orientation, or size. **Don't** expect it from icon shape or semantics. | Only four "undoubted guiding attributes"; shape merely "probable" — [Wolfe & Horowitz 2017](https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf) |
| 3 | **Do** place the critical colour at an extreme of the palette. **Don't** put it between other colours in colour space. | Linear separability — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf) |
| 4 | **Do** flag exceptions by adding a mark. **Don't** flag them by removing one everything else has. | Search asymmetry: presence beats absence — [Treisman & Souther 1985 / Treisman & Gormican 1988, via Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf) |
| 5 | **Do** hold colour constant when shape or glyph must be read. **Don't** assume the reverse costs anything. | Asymmetric interference: colour masks shape; shape does not mask colour — [Healey](https://www.csc2.ncsu.edu/faculty/healey/PP/) |
| 6 | **Do** cap categorical colours at five for guaranteed search. **Don't** rely on seven-plus behaving uniformly. | 3/5-colour detection "rapid and accurate"; 7/9 "mixed" — [Healey 1996](https://vis.cs.brown.edu/docs/pdf/Healey-1996-CEC.pdf) |
| 7 | **Do** split category and magnitude across separable channels. **Don't** put them in hue and saturation. | Hue/saturation are integral dimensions — [Heer & Bostock 2010](http://vis.stanford.edu/files/2010-MTurk-CHI.pdf), citing Ware |
| 8 | **Do** use position or length where a value must be read precisely. **Don't** use colour saturation or area for magnitude. | Accuracy ordering: position > length > angle/slope > area — [Cleveland & McGill 1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf) |
| 9 | **Do** place items that must be compared near each other. **Don't** rely on expert users to compensate for a weak encoding. | Accuracy falls with distance; technical training does not affect it — [Cleveland & McGill 1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf) |
| 10 | **Do** give users a positive target to find. **Don't** design flows requiring them to verify nothing is wrong across a dense grid. | Target-absent slopes exceed 2× present slopes; imperfect memory pushes toward 3× — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf) |
| 11 | **Do** prefer colour for far-peripheral or wide-table targets. **Don't** rely on shape differences far from fixation. | Guidance to shape fails at smaller eccentricity than colour — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf) |
| 12 | **Do** keep status information in a stable, learned position. **Don't** treat layout convention as merely aesthetic. | Scene syntax/semantics is one of five guidance sources in GS6 — [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf) |
| 13 | **Do** treat "preattentive" as a continuum of guidance strength. **Don't** claim a design "is preattentive" because it uses a listed attribute. | "There is no categorical boundary between such labels; search efficiency is a continuous measure." — [Wolfe 2018, ch. 13](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf) |

---

## 9. Where the literature is genuinely contested

State these when the research is invoked in a design argument:

1. **"Preattentive" as a category is disputed.** Wolfe calls the term "nearly
   tautological" and notes it "has been controversial"
   ([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)).
2. **The parallel/serial dichotomy is mainstream-rejected but not unanimously.**
   Slopes form a continuum
   ([Wolfe 2018](https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf)),
   yet revival attempts continue (Liesefeld & Müller 2020, cited in
   [Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).
3. **The feature list is not agreed.** Healey lists intersection as
   preattentive; Wolfe files it under "probably not." Shape resists definition
   entirely.
4. **The 2:1 slope ratio is a textbook prediction that the data exceed**
   ([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).
5. **Crowding/eccentricity limits are acknowledged as "vastly understudied"** —
   Wolfe's own words
   ([Wolfe 2021](https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf)).
   Some researchers (Rosenholtz et al.) attribute most search-efficiency
   variation to crowding rather than to feature guidance at all.
6. **Cleveland & McGill's colour/shading placement is inferred, not measured** in
   the open follow-up experiment
   ([Cleveland & McGill 1986](http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf)).
7. **Laboratory slopes are not interface timings.** Abstract stimuli, controlled
   eccentricity, trained observers, no semantics. They give the shape of the cost
   curve, not a budget.

---

## Sources

**Open / author-hosted (verified directly):**

- Healey, C. G. *Perception in Visualization*. NC State University. https://www.csc2.ncsu.edu/faculty/healey/PP/
- Healey, C. G. (1996). Choosing Effective Colours for Data Visualization. *Proc. IEEE Visualization '96*, 263–270. https://vis.cs.brown.edu/docs/pdf/Healey-1996-CEC.pdf
- Wolfe, J. M. (2021). Guided Search 6.0: An updated model of visual search. *Psychonomic Bulletin & Review*. https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf · https://link.springer.com/article/10.3758/s13423-020-01859-9
- Wolfe, J. M. (2018). Visual Search. *Stevens' Handbook of Experimental Psychology and Cognitive Neuroscience*, 4th ed., ch. 13. https://search.bwh.harvard.edu/new/pubs/StevensHndbk_VisualSearch_Wolfe_2018.pdf
- Wolfe, J. M., & Horowitz, T. S. (2017). Five factors that guide attention in visual search. *Nature Human Behaviour* 1:0058. https://search.bwh.harvard.edu/new/pubs/FiveFactors_Wolfe-Horowitz_2017.pdf
- Wolfe, J. M., Cave, K. R., & Franzel, S. L. (1989). Guided Search: An Alternative to the Feature Integration Model for Visual Search. *JEP:HPP* 15(3):419–433. https://search.bwh.harvard.edu/new/pubs/GS1_JEPHPP89.pdf
- Wolfe, J. M. *Visual Search* (review). https://search.bwh.harvard.edu/new/pubs/the_review.pdf
- Cleveland, W. S., & McGill, R. (1986). An experiment in graphical perception. *Int. J. Man-Machine Studies* 25:491–500. http://snoid.sv.vt.edu/~npolys/projects/safas/science.pdf
- Heer, J., & Bostock, M. (2010). Crowdsourcing Graphical Perception. *CHI 2010*. http://vis.stanford.edu/files/2010-MTurk-CHI.pdf
- Few, S. (2004). Tapping the Power of Visual Perception. Perceptual Edge. https://www.perceptualedge.com/articles/ie/visual_perception.pdf

**Cited but not openly verifiable (limitations noted in text):**

- Treisman, A., & Gelade, G. (1980). A feature-integration theory of attention. *Cognitive Psychology* 12:97–136. Scanned PDF (image-only, no text layer): http://wexler.free.fr/library/files/treisman%20(1980)%20a%20feature-integration%20theory%20of%20attention.pdf — slope figures herein are quoted via Wolfe, Cave & Franzel (1989).
- Healey, C. G., & Enns, J. T. (2012). Attention and Visual Memory in Visualization and Computer Graphics. *IEEE TVCG* 18(7):1170–1188. https://doi.org/10.1109/TVCG.2011.127 · https://pubmed.ncbi.nlm.nih.gov/21788672/ — no open PDF located; Healey's *Perception in Visualization* pages used in its place.
- Cleveland, W. S., & McGill, R. (1984). Graphical Perception. *JASA* 79:531–554. https://doi.org/10.1080/01621459.1984.10478080 — paywalled; six-line ordering reported from secondary sources and marked UNVERIFIED.
- Ware, C. *Information Visualization: Perception for Design*, 4th ed. Morgan Kaufmann. https://shop.elsevier.com/books/information-visualization/ware/978-0-12-812875-6 — book; integral/separable claim verified only via Heer & Bostock's citation.
- Few, S. *Now You See It* (2009) / *Show Me the Numbers* (2004) — source of the enclosure / added-marks taxonomy; table contents UNVERIFIED against an open source.
