# The claim inventory — running the falsifiability test BEFORE building, and what died

**2026-07-30 night, self-directed.** Follow-on to `the-falsifiability-test.md`, which established
that the only sentence worth surfacing is one the product could be **wrong** about — but only ever
scored finished pages. This ran it forward, on the domain rather than on a drawing.

Reproduce: `node tools/claim-inventory.mjs` (deterministic — verified identical across two runs).
Source: `proposals/011-what-is-he/ladder-data.js`, both boards ranked over only the **337 players
they share**, which is mandatory before any model-vs-market comparison is drawn.

---

## The test got a third part, and then a fourth, because the first version was too weak

The writeup's test was *"could the product be wrong about this?"* That does not separate David's
reactions. *"17 of your 23 agree"* is falsifiable, could have come out otherwise, and he rejected it
flat — *"not telling me anything."* What it lacks is a **named entity**. Every line he kept names
something: *"worst room in the league, three bodies."*

So: **WRONGABLE · CONTINGENT · NAMED**, all three required. Calibrated in both directions against
one specimen he approved and one he rejected.

**Then the first run passed 11 of 11 candidates, which is a battery that is not a test.** The gates
only ever convicted unnamed aggregates. A fourth was added — **SOUND**: every artifact test *this
particular claim was subjected to* came back clean, and a claim never subjected to one is **not
credited** for passing it. The report prints `artifact tests run: NONE — untested, not credited`
rather than letting silence read as a pass. (An empty population is a SKIP, never a PASS — 2026-07-29.)

## THE SIGN WAS INVERTED, and it produced a confident wrong sentence about a real person

`gap = mrank - drank`. Luther Burden reads market WR17, our board WR53, gap **−36** — so a
**negative** gap means the market's rank number is smaller, the market rates him **better**, and our
board is **lower**. The first run sorted ascending and announced that the most-negative team was the
one *"our board is highest on."* Exactly backwards, in the most load-bearing clause of the sentence.

It is now **asserted against a known specimen at load time**, not commented — a comment cannot fail.
If the convention ever flips, every claim below refuses to compute.

## What survived

| claim | reading | why it holds |
|---|---|---|
| **Room standing, per position** | QB 3/12 ours · 3/12 market · RB **12/12 · 11/12** · WR 3/12 · 2/12 · TE 4/12 · **7/12** | contingent (cv 0.22–0.40), named, unique. The 006 shape, validated. |
| **Widest split he holds** | Burden: market WR17, ours WR53, **36 apart** | survives the boundary test (corr \|gap\| vs distance-from-list-end **0.187**) |
| **Start-split, at n=2** | market starts **Henderson and Burden** weekly, our board does not | survives cut perturbation ±3 |

**RETRACTED from this table before it left the file:** *team-level divergence* was listed here as a
survivor on the strength of two confounder tests that were the wrong two. It is killed below.

## What was downgraded, and the number is the part that dies

**"You are 11th of 12 in players who start weekly."** Perturb the starting cut and he moves between
**9th and 11th** (3 to 6 starters). The *direction* is robust; the *rank number* is not supported at
the precision it is stated. Say bottom-of-the-league, not 11th — and note that 006's approved
*"last in the league in what you can start today"* is, on this test, mildly overstated.

**TE room standing carries a disclosed caveat:** our board resolves only **78%** of the TE room
(49 distinct ranks over 63 players) because DVS saturates and 19 TEs sit in ties. QB is 100%, RB 93%,
WR 94%. The claim stands; the caveat ships with it.

## What was killed

1. **"X is your cleanest trade fit."** **Three teams tie at the top** (MJLeess318, jspringe88,
   jspagnola) and array order was picking the winner. A tie printed as a single answer, in the most
   authoritative position — the same defect caught on 014 and rendered there as `1–11`, reintroduced
   in prose a day later. **A lesson that lives in one file is not learned** (2026-07-29): it now
   renders as a tie.
2. **"The market is coming round to our view."** The most seductive sentence this product could say,
   so it got the hardest test. League-wide, the market moved *toward* our view on **150 of 323
   players = 46.4%** — **below a coin flip** (z = −1.28). His roster's 14-of-23 is noise at n=23.
   **There is no convergence to report, and the tool now prints `NO CLAIM AVAILABLE` rather than a
   number.** A failed search is a finding; the test was not weakened to obtain an answer.
3. **Rome Odunze as a third named starter-split.** Market rank **24**, cut **24**, margin **0** — one
   rank of market movement erases him. True today, fragile tomorrow, and needs a footnote to survive.

## The design finding that fell out of killing Odunze

The binary is the problem, not Odunze. *"The market starts him weekly and our model doesn't"* is a
threshold struck through a continuum, so a player at the cut and a player 29 ranks outside it read
identically in prose. **Draw the margin and the picture carries what the sentence has to caveat** —
Odunze sitting exactly on the line is self-evidently marginal when you can see the line.

## The one nobody was asking for — proposed, then KILLED, and this is the night's real result

**Team-level model-vs-market divergence.** Apply the two-lane comparison to *rosters* rather than to
players: whose team does our board price differently from the market's? No other product can compute
it — KeepTradeCut and FantasyCalc rank players and have no second board to disagree with; Sleeper
knows ownership and has no valuation. It needs both lanes plus league ownership, which exists in
exactly one place. It sits on rung 3, the rung that matters. **It was one step from being drawn.**

### It died twice on the way to the figure.

**First, the units were wrong.** Averaging raw rank gaps across positions treats 36 ranks among 45 QBs
as equal to 36 among 140 WRs. Normalising each gap by its own pool size **reorders the league**
(Spearman **0.83** against the raw order) — **kgelardi moves from 1st to 5th.** The first version of
this claim named the wrong team, for the second time in one night, for a different reason than the
first. *Per-player prose still speaks raw positional rank, because "WR17 vs WR53" is the hobby's unit;
aggregation across positions must normalise. The two are different jobs.*

**Then age killed it outright.**

```
corr(team mean gap, team mean AGE)   = 0.771     <-- the claim is mostly this
corr(team mean gap, team market value) = 0.073
corr(team mean gap, roster size)       = 0.126
slope: +1.43 pool-% of gap per year of age
```

rzalika holds the **youngest** roster (23.9) and the most negative gap; jgil96 the **oldest** (27.7)
and the most positive. So *"whose roster does our board disagree with the market about"* substantially
restates *"whose roster is young"* — **which David can read off Sleeper for free.** Age-adjusted the
tilt survives but compresses hard (rzalika −10.0 → **−7.1**, jgil96 +3.8 → **+1.3**), and an ordering
that is 0.90-correlated with the age ordering is not a second opinion, it is a birthday list.

This is **David's own finding of 2026-07-22** — *"a raw model-vs-market gap sort is mostly an age
sort; our 'market is sleeping, buy low' list came out as 30–35-year-olds"* — reappearing one level up,
at team scale, where it was not recognised.

### The lesson, and it is about the shape of my own checking

`claim-inventory.mjs` tested **team value** and **roster size**, found 0.008 and −0.074, and printed
`independent: true`. Both were confounders **I invented**. The one that mattered was already written
in the client file, dated, with the reasoning attached — and it was never run.

**A confounder list assembled from imagination will omit the ones already paid for.** The tool now
checks age by name with the date of the ruling in the comment, and when a confound clears 0.3 it
prints `NO CLAIM AVAILABLE` instead of a sentence. The claim can no longer be made by a future
session that has forgotten why.

### What is left standing, stated as the smaller true thing

A **residual** tilt does survive age adjustment, and it is not nothing — but it is a weak second-order
effect on 16–23 players per team, from one dated snapshot, and it does not carry a surface. **No new
unasked claim survived tonight.** That is the finding, and the test was not weakened to produce a
better one.

## The score at the end of the night

**Four claims killed, one downgraded, one sign error caught, one unit error caught, and no new
surface.** Nothing was drawn. The whole night lives upstream of form, which is where the two surfaces
David rejected on 2026-07-29 went wrong by not spending any time at all.

| | |
|---|---|
| killed | market-convergence (below chance) · cleanest-trade-fit (3-way tie) · Odunze as a third split (margin 0) · **team divergence (age, r=0.77)** |
| downgraded | "11th of 12" → bottom-of-league; the rank number is not supported |
| corrected | gap sign inverted · raw ranks averaged across incomparable pools |
| survived | room standing per position · Burden's 36-rank split · start-split at n=2 |

## What is NOT concluded

- The battery passes 8 of 12. It convicts ties, chance, unnamed aggregates and known confounders; it
  does **not** yet convict a claim that is sound and boring. That gap is real and unmeasured.
- Four claims carry no artifact test at all and are labelled as such rather than credited.
- The residual after age adjustment was **not** further tested — against position mix, against
  rookie share, against anything. It is parked as weak, not as disproved.
- Every figure here is one dataset, dated **2026-07-27 market / 2026-07-26 snapshot**, one league,
  one snapshot in an off-season. Nothing here is a time series.

---

## The inventory's first act was to convict the lab it was meant to feed

**Same night.** `craft/lab-004-the-claim-and-the-crossing.html` — the slope chart built to fix the
dumbbell's failure to show disagreement across a group — was headed:

> **"The market is paying for your receivers. We are not."**
> *On 7 of your 12 receivers the market ranks the player higher than we do…*

**That is an aggregate direction claim, which is the shape the age finding invalidates.** Measured:
his WR room averages **23.7** against the pool's **25.7**; league-wide the market is higher on
**56%** of receivers under 24; his 7-of-12 is **58%**. *The headline was reporting the age baseline.*
It was one polish pass away from being shown.

### What replaced it, and why the form got better rather than just more honest

The surviving claim is a **threshold crossing** — not a direction, not an average: *which players does
the market start every week that our board does not?* Robust to moving the cut ±3.

> **"The market starts Burden every week. Our board has him on the bench."**

**The cut line stopped being furniture and became the spine.** Once WR24 is drawn across both scales,
the claim is not asserted — it is visible as two bright slopes crossing a dashed rule. And it solves
the Odunze problem that killed him as a third name: at market WR24 he sits **exactly on the line**, so
the reader sees the margin instead of reading a footnote that retracts him. **Draw the margin and the
picture carries what the sentence would have to caveat.**

### Three defects found by looking, none of which any check caught

1. **Identity broke while the collision census read zero.** De-collision pushed labels down 15px and
   left the dots behind, so "Kyle Williams" had no dot beside it and "Chris Bell" sat next to
   Burden's. **A text-overlap check cannot see a label attached to the wrong mark.** Displaced labels
   now carry a leader back to their dot.
2. **A 54-character annotation ran across the slope field** and a line passed through the words
   "every week" — text-on-line, the third appearance of this defect class, and invisible to a census
   that only compares text against text. The sentence was **deleted**, not moved: the decoder under
   the figure already said it.
3. **The gap numbers were cut, and the zoom is what settled it.** Each sat at its own line's
   midpoint, so the halo protecting it punched a visible notch *through* the line carrying the
   argument. Repositioning was the obvious fix and the wrong one — on a shared scale the slope's
   steepness **is** the magnitude, and the body already gives the ranks. `market +36` was a fourth
   number for one quantity, and a different number from the three in the prose.

**Net: three things removed, one added (the leaders).** When a surface has landed, the default move is
subtraction.

### Gate reading, and it convicts the control rather than the proposal

`tools/craft-gate.mjs` — **3 fail, 1 warn, 1 pass, identical across two runs.** All three failures
localise to the **dumbbell panel kept in the lab as the shipped-form control**: C4's 11px content is
`.dtier` ("ours WR3 / market WR4"), C6's 172px track is `.dtrack`, and C2's per-row legend is the
dumbbell's `ours`/`market` pair repeated 12 times. **The gate independently convicts the form this lab
argues against.** The slope chart's own text now sits at 13px throughout.

**Still not run, and stated rather than implied:** keyboard pass, reduced-motion pass, and the squint
test on the rebuilt figure. **Not shown to David.**
