# Studio proposals — status

## Current

### 2026-07-28 — TIER-LADDER GRAIN: ANSWERED **COARSE**. Tower's ruling on the evidence, NOT David's taste.

**Attribution, kept straight because it matters.** David instructed that the parked question be
answered ("answer studio's tier ladder question"); the answer itself is **Tower's, reasoned from the
evidence**, and David can overrule it. **It is not his signature on the surface, and it must never be
recorded or cited as his ruling** — that is the 2026-07-23 stray-keystroke rule (never attribute a
direction to David unless he stated it in his own words). **David's own taste on grain remains
unruled.** Nothing about the 011 surface is approved by this.

**No rebuild follows.** 011 v3 already draws the coarse ladder, and it was carried as
"accepted-in-practice, not decided." The ruling confirms what exists rather than changing it.

**The reasoning, which is stronger than a preference:** fine grain is *unavailable* exactly where it
would be most wanted. Our DVS saturates at 100.0 — 11 TEs, 6 WRs and 6 RBs share one identical
number — so any finer ordering inside those groups comes from a sort's tiebreaker, not from the
model. That is a precision claim the number cannot support, drawn where a reader trusts it most.
**Tie bars stay** — a bar across the ranks the model cannot separate is the honest expression of the
constraint, and beats both alternatives (inventing an order, or hiding the tie).

**PARKED ON A CONDITION, not closed:** the question becomes live and genuinely open **if the DVS
ceiling is ever fixed** (011-RELAY R1, not yet authorised to cross).

**The live thread it opens — QB, and it is Studio's to measure before it is anyone's to design.**
QB is the one position that does **not** saturate (max 99.0, held by one) and it is the position this
league's lineup makes decisive (superflex → QB2 is a starting job; David holds 5, exactly 2
start-grade against 2 he must field). Tower's caution, which is correct and is my own finding wearing
a different coat: **a grain that varies by position is the same hazard as per-panel normalisation** —
if QB goes finer, the difference must be **stated on-surface, never inferred**.
**MEASURED SAME SESSION — the QB exception is REFUTED, and COARSE gets a better reason than the
ceiling.** (`analysis/qb-grain.py` + `README-qb-grain-2026-07-28.md`.)

- **QB does resolve, and that is the trap.** 47 players, **46 distinct values (97.9%)**, zero at the
  ceiling, **zero ties in the top 24**, and **none of the 11 finer cuts falls inside a tie**. On the
  saturation test the exception looks real.
- **It is not.** A finer boundary sits on a gap of **0.50 points at QB** (0.23 WR / 0.60 RB / 0.81
  TE) on a 0–100 score — while a real model revision moves a player a median of **7.50 points**
  (10.6 WR / 9.4 RB / 9.9 TE). **The boundary is 12–46× narrower than the model's own movement.**
  Distinct is not resolved.
- **In interpretable form:** across the revisions on record, **fine (blocks of 4) sub-tier churn
  exceeds coarse (blocks of 12) churn at every position** — QB **34% vs 19%**, nearly double; TE
  81% vs 54%.
- **So the coarse ruling now rests on the whole population at all four positions**, not on 23
  saturated players at the top of three. And **QB is the worst place to go finer, not the safest** —
  it fails *invisibly*, with no tie bar to warn the reader, unlike TE where the constraint is at
  least drawn.
- **Honest limits, stated because they are not small:** only **2 of 34 transitions** show any change,
  both are early **population-build** events (QB 36→47, WR 147→199), and the model has been static
  since 06-27. **Absolute churn rates are NOT projectable to a future run and that claim must not be
  made.** What is robust is the *relative* coarse-vs-fine comparison and the order-of-magnitude gap
  between boundary width and revision magnitude, which does not depend on the churn rates at all.
- **A method error caught on myself:** I measured "97.9% distinct" first and came close to reporting
  it as support for a finer QB ladder. **Resolution of the encoding says nothing about resolution of
  the estimate** — the same class of error as the 2026-07-24 cost-per-hit metric, precision
  manufactured by arithmetic producing decimals.
- **Extends `011-RELAY.md` R2, not yet relayed** (R2 is not authorised to cross): the model is not
  merely frozen — when it does move, it moves ~9 points and reshuffles a large share of any ranking
  built on it. Recorded, not sent.
- **No surface change follows.** 011 already draws coarse with tie bars. Nothing rebuilt.

**Also handled by Tower, not Studio:** David is being told plainly about the WR holdings reading
**14** on the full market board and **12** on the shared two-lane board — both correct on their own
basis, with the earlier figure never retracted to him in words. Off Studio's plate.

### 2026-07-28 — The density gate. CRAFT (strand 2), self-directed. No David gate, no relay.

**Why this and not more 011.** 011 sits at a direction checkpoint with its coarse-vs-fine
question parked with Tower for David. Redrawing a surface while its premise question is
unanswered is verbatim the 008 and 010 failure ("the craft improved every time and the
outcome did not"). So: sharpen the instrument instead.

**What it is.** `tools/craft-gate.mjs` — six measured checks on any prototype, each traceable
to a documented rejection and to a source. Density per unit **area** (not per unit); legend
entries × units = the lookups a reader actually performs; hue-family count against Healey's
five; content type below the ramp's 12px first step; WCAG 2.5.8 hit targets; and **C6 — does
the dominant mark's channel actually vary and use its range**, which is the automated form of
Studio's single most-repeated failure (*encoding a variable that barely varies*).

**It failed its own validation first, and that was the useful part.** v1 scored the APPROVED
006 front door at 5 FAIL and the REJECTED 009 matrix at 1 FAIL. Four instrument bugs, each a
reusable lesson, all recorded in `craft/T4-2-density-gate.md` §B:
`getComputedStyle(div).fill` computes to opaque black so every OKLCH lane colour read as grey
(parse colour through a 1×1 canvas, never a regex); a mark inside a clickable row is not
itself a 24px target; 10–11px is a legitimate *label* size and the 009 conviction was for
*content*; and channel inference is fooled by categorical size differences (a filled dot and
a hollow ring) and by one tag serving several roles.

**Validated against six prototypes whose verdicts David has already given.** Ordering tracks
the verdicts: 009 matrix (rejected) density **3.95** / 3 fail; 006 front door (approved)
2.13 / 1 fail; 004 v4 (kept) **1.60** / 1 fail. C6 independently reproduces the two figures
hand-measured after the matrix-v2 rejection — **15.2% IQR of a 214px cell, 4.3% ink**.
Honest limit stated in the file: six examples, all Studio's own, graded by one reader.

**The finding it produced immediately, NOT tuned away:** sub-12px *content* fires on every
surface Studio has built, approved ones included (144 nodes in the matrix, 88 in the front
door, 55 in 004). And **011 carries 14 distinct type sizes, 11 off the ramp** — the exact
failure `typography.md` was written against. David has already said "all the visuals are very
small" once (2026-07-23); it is now measurable rather than anecdotal. Studio's to fix on the
next surface, not a question for him.

**What the gate cannot see, printed on every run so a green result is never mistaken for a
good surface:** whether the question is worth asking (what actually sank 008 and 010),
whether the units are the hobby's own, page structure (the stray `grid-row: span 2` passed
every probe and was caught only by eye), and whether any number is true.

**Also run against the LIVE APP** (it accepts URLs, not just files) — the test that it is an
instrument rather than Studio marking its own homework. Daily What-Changed player row measures
density **4.15**, the highest figure anywhere; **deliberately not over-read**, because the two
calibration points are chart rows and this is a text table, so it says "go and look," not
"worse than what David rejected." Hue count sits **exactly at Healey's ceiling of 5**. **30
failed requests on every load**, all `/assets/headshots/*.jpg` 404s — the known briefing §5
defect, now with a number. Roster Audit, Roster Capacity and League Pulse return **no repeating
unit and zero data marks** — text tables end to end.

**Two limitations the live run exposed, recorded not hidden:** C6 measures bounding boxes, so a
path-shaped mark is unreadable to it — twenty sparklines with identical boxes classify as chrome,
and whether they share a scale (the confirmed 004 N4) stays invisible. And a surface with no marks
returns mostly SKIP, which *reads* like a pass and is not one.

**Unverified at close:** every threshold except WCAG 2.5.8 and Healey's five is Studio's own
reading of a source, and C1's cut-point is fitted to two examples. Nobody but Studio has checked
any figure in this thread.

---

### 2026-07-28 (second session) — THE RULER CORRECTION. Studio's own new instrument caught doing the exact thing it was built to prevent.

**Followed my own named next step** (take the type-size finding seriously before drawing another
surface) and the first move — check whether the product already defines a type scale before
authoring one — is what caught it.

**It does.** `tokens.css:50-52` ships exactly three type tokens: **13 / 15 / 18px** (no rem-base
override). The gate had shipped with **Carbon's** ramp (12/14/16/18…), so run against the live app
it flagged **13px and 15px as "off the ramp" on every surface — the product's own tokens.**

**That is the 2026-07-25 lane-colour violation repeating in the type channel, inside the instrument
built to stop that class of error.** David's ruling that day — consistency with the product outranks
an internal craft-tool heuristic unless the heuristic is a legibility failure — was recorded as a
rule about *colour*. It is not about colour. **It is about every token channel**, and a craft tool
carrying a rival ruler is the most durable way to get it wrong, because it turns a one-off drift
into an enforced standard. Gate now takes the ruler from the product, with `--scale` to override.

**RETRACTED from this morning's report:** *"sub-12px content fires on every surface including the
app's."* Artifact of the wrong ruler. **The corrected finding inverts and is sharper:** with the
product's ruler the live app's default screen has **zero** sub-13px content and **one** off-scale
size (a 24px heading) — it respects its own scale. Studio's prototypes do not: 144 sub-13px content
nodes in the matrix, 88 in the front door, 55 in 004, and 011 carries **11 sizes off the product's
three tokens**. So *"all the visuals are very small"* (David, 2026-07-23) is a **Studio** defect,
not one inherited from the app. Still mine to fix, now correctly aimed.

**Also fixed:** C4's content/label split has no basis on a page with no repeating unit (everything
falls to "label" and the finding is understated). The gate now says so in its output instead of
reporting a quiet warn — 011 is exactly that case.

**THEN APPLIED IT — 011's type retrofitted to the product's scale.** Not a redraw and not a premise
change: the surface's argument, data, layout and marks are untouched. Only the type roles moved.

- **Audited by role first, which killed the blanket-lift instinct.** Of 011's small text, **71 nodes
  were SVG axis annotation** (tick values, position labels on a 153-player axis) — legitimately
  label-sized, and lifting them to 13px would have wrecked the chart. The actual defect was **~96
  HTML nodes at 10–12.5px carrying content**: table column headers, IR/taxi badges, a section
  heading at 11px, caveat prose, and the roster-count readouts. The table body sat at 13.5px — off
  the scale in the other direction.
- **Result: 14 distinct sizes → 6**, of which three are the product's own tokens (13/15/18) and
  three are stated extensions (22, 44 for headings; **11px for SVG axis annotation only** — an
  explicit exception below the product's floor, with the reason written in the file). **HTML content
  below the product's 13px floor: 96 → 0.** Table body lifted 13.5 → 15px.
- **A real regression found and fixed, and it is a reusable defect class.** The lift made two cliff
  tags overprint, because the dodge compared x against a **magic `34px` threshold tuned to the old
  9.5px tag**. Replaced with a dodge that measures the rendered text extent. **A dodge keyed to a
  font size is a defect waiting for the next edit** — it passes every probe until someone touches
  the type.
- **Verified:** 0 SVG text collisions, 0 clipped, no overflow DOM-measured at 1400 and 390, 0 page
  errors, crosshair still resolves **10 distinct players over 10 scrub positions** (8/8 last
  session), keyboard focus still reaches the SVG hit target. Eye pass done on the full-page capture
  — the table is materially more legible at 15px. Backup of the pre-change file kept in scratch.

**Fresh-eyes covenant judgement, recorded.** The product's frontend contains `visualCraftAudit.test.js`
and `visualCraftAuditBaseline.json`. **Deliberately not read.** A visual-craft audit with a baseline
is plausibly the executable form of the in-house design doctrine, and reading it would correlate
Studio's instrument with theirs — the precise harm the covenant exists to prevent. Only raw CSS
token values were read, which are product contract, not doctrine. **No exposure occurred.**

Files: `tools/craft-gate.mjs`, `craft/T4-2-density-gate.md`; `CRAFT-LIBRARY.md` Tier 4 item 4
marked partly discharged (the layered-reading glance/scan/study canon is still wanted).

---

### 2026-07-27 — 011 "What is he?" — the prose tier ladder. SHOWN TO DAVID; REACTED, NOT APPROVED.

**Self-directed, strand 1.** Closes the oldest open item on this board: the prose tier
ladder, client-mandated 2026-07-15 ("statistically sound and representative, but it must
be prose") and carried unbuilt for eleven days. Chosen deliberately as the answer to the
010 closeout diagnosis — *check the units before building; a number no dynasty manager
would say out loud will not speak* — because a tier name is pure hobby language.

**The load-bearing new input: the league's own lineup, read for the first time.**
`QB 1 · RB 2 · WR 2 · TE 1 · FLEX 2 · SUPER_FLEX 1 · BN 11`, 12 teams, full PPR, no TE
premium. Harstad's positional-baseline formulas parameterised by it give this league's
real startable depth: **QB ~21 start weekly / replacement QB33; RB 24 / RB39;
WR 24 / WR52; TE 12 / TE22.** The superflex slot makes QB2 a starting job; TE is only
~22 deep while WR runs ~52 deep.

**Measured findings:**
- **The vernacular's twelve-blocks are not the market's breaks.** Of the 32 largest
  single-step drops across the four boards, exactly one lands on a twelve-boundary
  (RB24→25, −8.9%, only the 6th-largest RB break). Real cliffs: TE4→5 −26.6%,
  RB2→3 −26.1%, QB27→28 −22.6%, WR3→4 −18.0%. Names are a coordinate system; cliffs are
  the structure. The surface draws both rather than conflating them.
- **The roster in hobby units:** WR hold 14 / 5 clear replacement / **3 start-grade /
  0 top-12**; QB hold 5 / **exactly 2 start-grade** against 2 he must field; RB 4/2/2/1;
  TE 3/1/1/1. Nine of the fourteen receivers clear no bar in this league — a materially
  different statement from a count.
- **Sqrt y-axis, measured not chosen by taste:** on a linear axis ~45% of every position
  sits in the bottom tenth of the height; middle-half occupancy 15–31% linear vs 25–42%
  sqrt. Disclosed on-surface with the reason.
- **y = share of the position's #1 cancels the superflex constant exactly**, so the axis
  is invariant to the ×1.8711 QB adjustment and all four panels honestly share a scale.

**Model lane deliberately WITHHELD in v1/v2** as a labelled pending lane, per TW27E.
**Superseded by v3 below** — David asked for both lanes directly, and the lane is now
drawn, rebased onto the shared population rather than quoting the broken comparison.

**Self-review caught four real defects the automated probes could not** — a
self-crossing area-fill path rendering as a diagonal wedge; a label dodge that compared
offsets instead of final positions so names still overprinted; cliff tags overprinting
at TE; and, surfaced by the interaction test, **per-dot hit targets that made most
players unhoverable** (153 WRs at ~3.2px spacing under 9px targets — replaced with a
crosshair scrubber). Clean: 0 errors, 0 SVG text overlaps measured pairwise, 0 clipped,
no overflow 390/1360 DOM-measured, keyboard traversal works.

**One claim retracted by my own check before it left the lane:** I had flagged "no
surface reads `roster_positions`" as a candidate relay item, checked it, and found it
false — the field is read in `roster_cut_engine.py`, `team_value_matrix.py` and
`trade_lab/reconciler.py`. Corrected in the proposal. **No relay authored; nothing here
warrants an engineer's time yet.**

**v2 same session — I answered my own open question #2 rather than parking it.** I had
named the replacement line the surface's weakest joint and then shipped it with a
footnote, which is the failure the 2026-07-24 epiphany names ("if a footnote invalidates
the mark above it, the mark is wrong"). Four things came out of going back at it:
1. **A plain error in my own honest-costs section, corrected.** I wrote that the
   seasonal-points baseline "understates young players." Backwards. A dynasty ordering
   ranks a 22-year-old above his current production, so the line **overstates** his
   present startability and understates an older producer.
2. **Tried to validate it, and could not.** FantasyCalc's
   `redraftDynastyValuePercDifference` survives in the raw cache on all 475 rows, but is
   **unsigned and saturates at 100** (extremes are all sub-$40 players; age correlation
   only −0.193), so no redraft ordering is recoverable — and §4 rules out production data
   outright. The estimate stands unvalidated and the surface now says so.
3. **The mark's form now carries its epistemic status.** A crisp replacement rule asserts
   a sharp startable/not cutoff the data does not contain — the binary within/without
   heuristic in Correll & Gleicher, whose tested replacement is a gradient. Redrawn as a
   depth ruler under the axis: solid across the exact span, fading where the estimate
   does. Moved out of the plot after the first attempt washed amber over the curve fill
   and the tier bands.
4. **A comparability flaw I found by looking and then measured.** Each panel's rank axis
   is normalized to its own pool, so WR's 52-deep ruler and TE's 22-deep ruler render at
   **33.6% vs 31.3% of width — near-identical lengths for a 2.4× difference.** The depth
   spread is the best cross-position finding here, so it is now carried in numbers stated
   in the copy, with the limit named on-surface and in costs. Shared-axis alternative
   rejected on the record (would leave QB/TE panels 55% empty); a defensible call, not an
   obviously right one.

Re-verified after every change: 0 errors, 0 SVG text overlaps, 0 clipped, no overflow
390/1360, crosshair still reaches 8/8 distinct players.

**v3 — DAVID ASKED FOR BOTH LANES, and reacted.** He answered the parked question directly:
*"i would like to see both side by side but can we do that without creating an
apples-to-oranges comparison? i don't want arbitrary tiering."* Built same session; shown via
the ritual. **His reaction: "this is interesting - we can work with this - i especially like
the charts. the table is clear to read." A DIRECTION CHECKPOINT, NOT AN APPROVAL** — nothing
signed off. He did **not** answer the coarse-vs-fine question put to him; the coarse ladder is
accepted-in-practice, not ruled.

The two-fix principle is logged in DAVID.md: a two-lane comparison needs **one population**
(rank both over the 337 shared) **and one ruler** (boundaries from the league's starting
structure, belonging to the position rather than either lane) — because per-lane cut-points
would make "our WR2" and "the market's WR2" different-sized objects, the deeper
apples-to-oranges.

**The measurement that decided the grain, and it is now a relay:** DVS **saturates at 100.0**.
23 players clipped — TE 11 tied (market prices them 1,467→7,730, a **5.3× spread on one
number**; Brock Bowers 23 rated level with Travis Kelce 37), WR 6, RB 6 with a 7.7-point gap
below the tie (a clip, not a cluster). QB does not saturate. So a fine sub-tier was not merely
arbitrary — **at the top of three positions it is undefined.** Ties are drawn as a bar across
the ranks the model cannot separate.

**011-RELAY.md AUTHORED — R1 ceiling saturation (Critical), R2 model values unchanged 17
consecutive days / last change 2026-07-10 (High), R3 xVAR null on all 468 rows (Medium), R4
per-position coverage figures for the rebase already in flight (Info). NOT AUTHORISED TO
CROSS.** R1 is the direct blocker on David's standing 2026-07-15 "publish market-comparable
rankings" ask — the ceiling, not the ranking method, is what stops it.

Honest costs now on-surface: rebasing drops **4 of his 27 players** entirely; tier names drift
from the full market board (median 2 places); the disagreement view's top row is Keenan Allen
(34.3y, market WR107 / ours WR67) — the 005 age artifact showing through, not an edge.

**CLOSEOUT 2026-07-27 — unverified and retracted, per the new close questions.**
*Unverified (Studio alone, nobody has checked):* every figure in `011-RELAY.md` R1–R3 (DVS
ceiling saturation, the 17-day freeze, null xVAR) — reproducible via the `sqlite3` commands in
the brief, but **not reviewed**; plus the Harstad depth lines (QB33/RB39/WR52/TE22, an estimate
applied to a dynasty ordering it was not derived for), the 1-of-32 twelve-boundary finding, the
sqrt-axis occupancy figures, and the 337/62/131 shared-population numbers.
*Retracted today:* the `roster_positions` claim (false — read in three modules; killed before it
left the lane) and the replacement-line caveat, which I had written **backwards**. Design
retraction: the crisp replacement rule, replaced by a fading ruler.
*One number told to David two ways:* his WR holdings read **14** on the full market board and
**12** on the shared two-lane board — both correct on their own basis; the surface says "4 of
your 27 are absent," but the earlier 14 was never retracted to him in words. **Next session
should say so plainly if the roster counts come up.**

Files: `proposals/011-what-is-he.md`, `011-RELAY.md`, `011-what-is-he/prototype.html` +
`ladder-data.js`, `analysis/two-lane-feasibility.py`, `build-two-lane-data.py`,
`tier-ladder.py`, `tier-ladder-roster.py`, `build-ladder-data.py`.

Files: `proposals/011-what-is-he.md`, `011-what-is-he/prototype.html` + `ladder-data.js`,
`analysis/tier-ladder.py`, `tier-ladder-roster.py`, `build-ladder-data.py`.

---

### Open threads at 2026-07-25 closeout, and exactly where each is parked

| thread | state | parked at |
|---|---|---|
| **009 relay, P1–P6** | **Crossed and acknowledged.** Awaiting verdicts. Two criticals to watch: P1 (surfaces serving the 2026-06-23 artifact; 4 of 12 postures wrong) and P2 (15 `ACTIVE_B` players returning null, stored as `0.0`, incl. the market's QB3). | `proposals/009-RELAY.md` — log dispositions at its foot |
| **009 relay addendum** | **CROSSED 2026-07-25** — relayed to all three crew panes and verified in each buffer. Tower's acknowledgment received. Corrects the xVAR age correlation +0.313 → +0.340; DVS +0.218 unaffected. Strengthens the argument, changes no item. Sent on David's instruction rather than held for the first verdicts. | `proposals/009-RELAY-ADDENDUM.md` |
| **The position board ("Who holds what")** | Built, probe-clean, lane colours corrected. David: *"pretty solid… very logical slicing"* — **direction checkpoint, NOT approval.** Cannot ship until P1 lands, since it runs on data the API does not serve. | `proposals/009-who-holds-what/prototype.html` |
| **010 — CLOSED, did not land** | **CLOSED 2026-07-26 by David: *"its not speaking to me… were not getting better."* DO NOT RESUME the surface.** Six versions in one session; the craft improved every time and the outcome did not — **the 008 lesson repeated verbatim** (premise never re-examined, only the drawing). **Root cause recorded in the proposal:** every version was denominated in units Studio invented (lineup-delta "adds to you", "costs them", best-legal-lineup slot standing) rather than the hobby's own language — the prose tiers, comparables, rank and aging curves David has consistently responded to. **What survives, independent of the framing:** the measured findings (QB is his weakest slot 9/12 — but **"twice the next gap" RETRACTED 2026-07-26** after Tower's verified constant test: deflating FantasyCalc's blanket QB ×1.8711 makes QB −838 vs WR1 −767, i.e. **two roughly equal holes, ratio 2.04× → 1.09×**; ranks all hold, cross-position magnitudes do not; **TE is NOT the hole**, contradicting 006's approved thesis; Sleeper's real lineups are 92% populated and Studio had inferred them — Free Kelly bench Josh Allen; 19 spare QBs exist and all sit below his own starter) and **relay Q1–Q2**, NOT authorised to cross. | `proposals/010-who-can-i-get.md` (closed, with the diagnosis), `010-RELAY.md` (Q1–Q2, unauthorised), `analysis/need-and-targets.py` |
| **Two rejected matrices** | Rejected by David — *"extremely confusing and hard to read"*, then the question itself refuted. Kept for audit, not for resumption. | `proposals/009-who-holds-what/matrix.html`, `matrix-v2.html` |
| **004 N1+N4** | Confirmed by engineering as Studio's forward thread; **untouched today and David was never told it was deprioritised.** | foot of `proposals/004-RELAY.md` |
| **006 per-player model curve fork** | Unruled since 2026-07-24. Studio's rec: pursue as an engineering capability ask. | `DAVID.md`, this board |
| **008** | Closed did-not-land, do-not-resume. Its engineering findings were never ruled on. | `proposals/008-RELAY.md` |
| **Craft pulls** | Tier 4 (visual search, matrices, disclosure, density) and Tier 5 (domain fluency, approved) curated; Tower fetching. Priority named to Tower 2026-07-26: **T5.1 nflverse, T5.2 VOR/replacement level, T5.3 superflex QB value, T4.1 preattentive/visual search** — first three all load-bearing for 010. | `CRAFT-LIBRARY.md` |

**Quarantined:** `proposals/009-who-holds-what/INVALID-target-data.js.donotuse` — contains a `surplus`
metric proved degenerate (returns a team-pair constant). README beside it. Superseded by `analysis/`.

**Background jobs in Studio's lane at closeout: NONE.** Verified — no jobs, no processes.


**2026-07-25 — 009 RELAY CROSSED TO CREW AND ACKNOWLEDGED** (David: *"009 relayed to crew."*). Six items, P1–P6, awaiting
verdicts; log dispositions at the foot of `proposals/009-RELAY.md` when they land. The two criticals to
watch: **P1** (league surfaces serving the 2026-06-23 artifact while the daily job writes a fresh one —
4 of 12 posture labels wrong) and **P2** (fifteen `ACTIVE_B` players returning null values silently
stored as `0.0`, including the market's QB3, 31,550 of market value zeroed then *ranked*).

**009-RELAY-ADDENDUM.md written the same day, NOT yet authorised to cross.** It corrects one figure in
the relay's closing note, discharging the caveat Studio disclosed in the accountability probe: the
xVAR-lane age correlation was computed over a population containing P2's coerced zeros. Re-run without
them it is **+0.340, not +0.313** — the relayed number *understated* the contamination. **The DVS-lane
figure (+0.218) was never affected** — those fifteen have no DVS, so they were excluded by construction.
Nothing in P1–P6 changes and the argument is strengthened: the lane gap widens from 0.218-vs-0.313 to
0.218-vs-0.340.

| Item | State |
|---|---|
| **009 Who holds what** (proposal + RELAY + prototype) | **Built 2026-07-25. Self-directed, strand 1 — nobody asked for it.** Started from the morning ritual in the live app; **League Pulse** — the app's only answer to "who do I trade with" — renders as a **43,634-pixel raw key/value dump**, which sent me into the data rather than into a chart (the 008 lesson). **Six measured relay findings, all reproducible.** **P1 (critical):** `/api/league/pulse`, `/api/trade/assets` and `/api/roster/capacity` all serve the **2026-06-23** artifact while the daily 09:20 job has been writing fresh `snapshot/team_posture/team_value_matrix` to `app/data/league_runtime/runs/` through **2026-07-24** — 003's F1 landed, F2 did not. Cost: **4 of 12 posture labels wrong in both directions** (MDEF and Free Kelly BALANCED→CONTENDER; Seidmans ASCENDING→REBUILDING; Kissane CONTENDER→BALANCED); David's own z moved −2.258→−1.404 unseen. **P2 (critical):** **15 rostered players graded `ACTIVE_B` return `dynasty_value_score: null` and `xvar: null`, and the league layer stores that null as `0.0` — 15 of 15.** Includes **Jayden Daniels (market #9, $7,369), Malik Nabers (#17), Garrett Wilson (#43)**; 31,550 of market value silently zeroed, then *ranked* as if it were a low opinion. **P3:** `starter_xvar` drops `ir`/`taxi`; roster 1 has **26.6% of its value excluded vs a 3.4% league median (7×)** — our own lineup starts **AJ Barner at −5.64 xVAR** at TE while Tucker Kraft is `ir`, and puts **Tank Dell at 0.0 in SUPER_FLEX** while Mendoza (10.31) is `taxi`, in July, in a league where taxi is rookies-only by rule. **P4:** **DVS cannot be ranked across positions** — 12 players tie at exactly 100.0 spanning market #3 to #137; TE median 81.4 (p75 = 100.0) vs RB 56.8; top-50 by DVS is 19 TE vs the market's 4. This blocks David's standing "publish market-comparable rankings" ask. **P5:** `surplus_label` reads **deficit at all four positions** for roster 1 on fresh data (it is a z-score against the league, so the weakest team saturates) — yet it drives the `ROSTER_SURPLUS_DEFICIT_MATCH` cards. **P6:** the League Pulse dump itself. **Two things I killed before drawing** (measure-the-variance-first rule): "idle bench value" (he is 33.7% vs a 21–38.5% league range — does not separate him) and top-3 concentration / value-weighted age (cv 0.12 and 0.05). **The domain finding that redirected the design:** the rebuilder's playbook David taught me — sell aging vets to contenders for picks — **is unavailable to him: 0.0% of his value is aged 28+**, lowest in the league with rzalika. He already ran that play. His actual shape is **4th of 12 in total value, 6th in starting lineup, ONE top-25 asset against jspagnola's seven** — breadth without a top. **Prototype** (`009-who-holds-what/prototype.html`): position-first (QB→RB→WR→TE per the 2026-07-22 ruling, and the only altitude where both lanes honestly exist given P4) — a fixed four-cell state line that renders the same shape every day, then one row per team on the position's full-pool rank scale, each team's best asset drawn as a **single labelled dumbbell** (name + both ranks set directly against the mark, best on the right), a window column (share of value 28+, the second-highest-variance measure), and inline expansion to every asset on the *same* axis. **The instrument surfaced its own finding:** on the TE board David's row reads **Tucker Kraft market TE5 / ours TE1**, blue right of amber — our model calls him the best TE in the league, while 006's approved thesis calls TE "the hole." Geometry said it, not prose. Encodings cited (Cleveland–McGill position-first; Mackinlay hue-for-identity; Heer & Bostock reference frame licensing the ticks; Okabe–Ito direct labels + shape cue). **DAVID REACTED 2026-07-25: "pretty solid - i like where you're going with this - very logical slicing and analysis" — a direction checkpoint, NOT an approval; relay still not authorised.** His one correction: **colour consistency.** Studio had shifted both lane hues a half-step darker than the app's tokens to clear the dataviz validator's dark lightness band, and disclosed it only in a file he does not read — on screen that read as the scheme changing. **Reverted to the app's verbatim tokens** (model `oklch(0.72 0.11 255)`, market `oklch(0.76 0.13 75)`), which fail only the glare band and pass every legibility check (CVD protan ΔE 22.5, tritan 22.8, normal-vision 24.3, contrast ≥3:1). Rank readouts also realigned to lead **ours / market**. Rule logged in DAVID.md: **lane colours are constitutional; consistency with the product outranks a craft-tool heuristic, and any deviation goes in the pane, never silently in a file.** Clean: 0 errors, 0 collisions, 0 clipped, no overflow 390/1360 DOM-measured. **RELAY NOT AUTHORISED TO CROSS. Prototype NOT YET SHOWN to David.** Honest costs on-surface: built on data the app does not serve (P1); cannot see who *wants* to trade (Sleeper's transactions endpoint is never called); ranks within position only (P4); 30 of 272 players unplaceable; picks absent. Open: does a counterparty surface earn its place in the off-season at all? **DAVID PUSHED AT THE GATE 2026-07-25: does the framework actually surface opportunity, or just render data? ANSWERED BY MEASUREMENT — the board ORIENTS, it does not surface opportunity** (it encodes rank while a trade is denominated in value; it shows one player per team while opportunity lives in depth; it never shows two sides at once). **Three measured findings:** (a) **the complementarity premise is empirically dead in this league** — my best idle asset upgrades another roster's lineup by at most **642** against ~50,000 rosters, and every star costs its owner almost exactly what it gains me (Bijan +8,206/−8,344; Chase +7,883/−8,258) — this refutes the premise under the app's `ROSTER_SURPLUS_DEFICIT_MATCH` cards and KTC's advertised use case; (b) **translating our rank into market currency DOES produce a concentrated signal** (Rice +6,302, McCaffrey +5,982, Kittle +4,245; median |edge| 434 so it is a short head, not smeared) — and this is exactly the normalisation David asked engineering for on 2026-07-15; (c) **it is NOT the 005 age artifact — age explains only 10.7% of the edge pooled, 89.3% survives**; rank space compresses magnitude while value space preserves it, which is why the same data reads as an age sort in one and not the other. **His own top five all carry negative edge (Jeanty −4,018, Burden −1,976, Henderson −1,916, Dart −1,722, Odunze −1,443; net −2,663).** **Deliberately NOT turned into a buy/sell surface** — that is the 2026-07-23 Garrett Wilson bar, and two things block it: P2's null-stored-as-0.0 poisons any edge computed from our ranks, and "the market overpays for what he holds" has a live alternative explanation in 004's still-open N0 position skew. **The framework fix, parked not started:** the same board denominated in market currency instead of rank, showing roster depth and both sides of a deal at once. **HELD by Tower 2026-07-25, then David asked directly to see the concept — hold released by the principal for that purpose.** **MATRIX SKETCH BUILT** (`009-who-holds-what/matrix.html`, + `matrix-data.js`): 12 teams down × QB/RB/WR/TE across, **rows ordered by posture** (contender → balanced → ascending → rebuilding) so the conjunction David described is read spatially — a row near the top, then a column where their mark sits left of yours. **Each cell is a FRAMED RECTANGLE, not shading** — David proposed shading; Studio pushed back from his own 2026-07-23 literature bar: Cleveland & McGill put shading/saturation in the **bottom tier** for magnitude and their named replacement for a shaded cell is exactly the framed rectangle (constant frame, position read inside it). Shading kept as legitimate for *where-do-I-look*, refused for *how-much*. Cell contents: their best at the position as a **dumbbell** (our filled dot + market ring, the confirmed mechanic), **their other top-15 players as smaller faint dots so depth is geometry not text**, a **solid rule at rank 15** (roughly where startable ends — added after self-review caught that a linear rank axis flatters a deep-but-unstartable position), and **your own best drawn as a dashed rule in every cell** so "weak where I am deep" is a distance, not a number to hold in your head. Row header carries posture + an **IR count**. **The conjunction lands on real data: MDEF is a contender, RB3 with 8 held and 2 top-15 (RB-rich), and simultaneously WR27 with 8 held and 0 top-15 (WR-poor) — while David is RB18/4 held/0 top-15 and WR29 with FOURTEEN held and 0 top-15.** His 14-WR "surplus" is quantity that clears no startable line in our lane — rendered as geometry, not asserted. Self-critiqued via headless screenshots; **3 defects found + fixed**: the reference rule was indistinguishable from the midpoint tick (now dashed model-blue vs a solid rank-15 rule), depth was readable only as text (now faint dots), and the column header printed "WR15" centred while the actual rank-15 rule sat at 84% across (**a label not over the thing it names** — now absolutely positioned). Clean: 0 errors, 0 collisions, 0 clipped, no overflow 390/1400 DOM-measured. Honest limits on-surface: **injury is NOT observable** (normalizer keeps six fields, no injury field; transactions endpoint never called) — the IR badge is a proxy for a thinned room and says nothing about severity or timeline; posture is the app's own heuristic and is itself computed on the IR/taxi-excluding number (P3). **v1 REJECTED BY DAVID 2026-07-25: "this is extremely confusing and hard to read."** Measured rather than guessed: **265 marks + 192 numbers over 48 cells (5.5 marks/cell), a 4-item legend re-applied 48 times, 35 dot-pairs within 10px, and two same-form vertical rules meaning different things.** Deeper fault: 48 equally-weighted cells with the conjunction left for David to find — homework, not an answer. **David returned the decision to Studio and pointed at the Tier 2 craft tools**; those files convict the page directly (Okabe & Ito: label on the graphic, never a key, and never small faint colour-only marks; Butterick: 11px is a *label* size and Studio set *content* there 192 times; layout §G: cells sharing no bands). **Also named and logged: Studio had misread "instrument, don't editorialize" as "render everything at uniform weight" — David's actual words were "I just need the mechanism and design so I can SEE it."** **v2 BUILT (`matrix-v2.html` + `gap-data.js`): subtraction.** One question per cell — *is their best here better than mine?* — as **one diverging quantity on one shared scale** (max |gap| 28 rank places across all 44 cells); two bars, ours and market, from a shared centre that IS David; right = ahead of him, left = behind. **No legend** — identity direct-labelled once on the first cell. Marks 265 → 88, numbers 192 → 0 (detail on hover). Four named type roles, nothing under 12px carrying content. His own row cut (all zeros read as missing data; the baseline is the centre line plus the "you:" line in each heading). **A structural grid bug — a stray `grid-row: span 2` shifting every row one cell so team names landed in the last column — passed both automated probes and was caught only by eye.** The data has real structure: **the WR column is a wall of right-pointing bars (everyone ahead of him) and TE runs left (he is ahead of nearly everyone)**; MDEF shows the sharpest lane disagreement at RB (+15 ours / −4 market). **Sketch for reaction; nothing approved, relay still not crossed.** |
| **008 Your draft capital** (proposal + RELAY + prototype) | **Built 2026-07-24. Self-directed, strand 1 — nobody asked for it.** The finding: David holds **16 picks, most in the league** (next 11), ~a third of his franchise in market terms — and the app renders that third as a **count**. The approved 006 "what you hold" skeleton (QB→RB→WR→TE) has **no home for picks at all**. Measured, all reproducible: our model prices every future pick as one of **exactly two numbers** (1st = 11.1553, everything else = 0.1076) with **no origin team, no year decay, and round 2 == round 3**; the market has all three (1st:2nd = 1.93× vs our 103.7×; 2nd:3rd = 1.44× vs our 1.00×; 2029 1st = 0.64× a 2027 1st vs our 1.00×). **FantasyCalc publishes slot-level prices 1.01–4.12 and the app already caches all 48** — 3.06× spread inside round one alone — and no surface reads them; the market lane's `bucket` field returns `fantasycalc_bucket_pick_unavailable` for all 27 year×round×bucket combinations. **The flat model is biased against exactly David's profile**: slot-aware, his 16 picks are worth **+29.6%** more than the generic total (25,747 → 33,359), because he's 12th of 12 and owns 11 of his own picks. His own 2027 1st (projecting 1.01, ~5,769) would be his **second most valuable asset**, ahead of Dart. **Prototype** (`008-draft-capital/prototype.html`): three regions from the rebuilder's question ladder — (1) league capital strip, (2) **the comparison LEADING** — two lanes on one geometry, market spread vs our model's two towers of 11 and 5, (3) the board: 16 picks on one shared value axis grouped by draft year, ±3-place finish bands as recessed ground, **his own players drawn as vertical rules for scale** (first time a pick and a player share an axis in this app), rows expanding inline via the 007 disclosure recipe to the full 12-slot value curve. Encodings position-first (Mackinlay), overplotting resolved by stacking never transparency, stacks labelled "at exactly this price" only on genuine ties, slot curves zero-based and labelled. Palette re-validated on the dark surface (ΔE 25.1 protan, all 6 checks pass). Self-critiqued via headless screenshots: **5 defects found + fixed** — the two lanes overlapped catastrophically (lane spacing now budgeted against the tallest possible stack), the market lane was mislabelled "11 picks at one price" from a proximity dodge, reference players clustered in the top half of the range (now span 1,235–7,166), `"2th of 12"` ordinal bug, and a clipped slot-curve label. Zero real text overlaps or clipped labels with all 16 rows expanded; no page errors; no overflow at 390/1280 (DOM-measured, per the 2026-07-24 headless-viewport lesson). **RELAY drafted (P1–P5), NOT authorised to cross.** Honest costs on-surface and in the proposal: projected slot is an inference from current roster value not standings, ±3 band is a stated display assumption not a modelled CI, slot ladder borrowed across years, league snapshot 31 days old (003's freshness defect now has a second dependent surface). **v1 REJECTED IN PART by David 2026-07-24** — *"the first two boards make hardly any sense to me… go back to the drawing board — what questions do I ask, why do I ask those questions, what do the answers help me do. the bottom section makes more sense."* **Region A (league capital standing) CUT** — a leaderboard with no consequence; "am I first in picks" changes nothing he does. **Region B (two boards) MOVED TO THE RELAY** — it was a critic finding dressed as a user module, the exact error named in DAVID.md 2026-07-22 ("Studio keeps smuggling critic findings into the user surface"), shipped again anyway. Root cause of both: designed from what Studio *found*, not from a question David asks. **v2 BUILT 2026-07-24 from a written question ladder** (in the proposal): (1) *when does this capital arrive, and will my team still be good?* — the timing question underneath the whole rebuild; (2) *what is each one worth?* — the validated board, unchanged; (3) *what could it buy?* — two prose sentences, not a chart. **The v2 hero:** one time axis 2026–2035, roster-in-its-prime curve above (window **2028–2032**, peak 2030 at 68.7% of held value in-band), one row per pick class below (draft tick + that class's own prime band), a single recessed window band spanning both panels so **overlap reads as geometry**. **The finding, non-obvious and actionable:** the overlap shrinks every class — **3 window-seasons for 2027, 2 for 2028, 1 for 2029**; none is early. He's buying his second team while the first peaks — the argument for spending the furthest-out picks rather than collecting more. Caught in self-review: the first draft of the new copy asserted "only the 2027 class reaches its prime in your window" — **false, the 2028 class overlaps by two seasons**; copy now *counts* the overlap instead of asserting it (the recurring let-copy-outrun-the-data failure, caught before delivery this time). Honest limits on-surface: peak bands are position priors not measured production, the curve holds today's market values fixed and is not a team-strength projection, rookie assumed ~22 and prime 3–6 years later (early for a QB, late for an RB). Clean: 0 page errors, 0 text overlaps/clipped labels with all 16 rows open, no overflow at 390/1280 (DOM-measured). **v2 ALSO REJECTED 2026-07-24** — *"take a step back and re-think what you should be visualizing here — and what data should be visualized."* **v3 = the audit that should have come first.** Studio sorted every mark by distance from a measured number, and the pattern is exact: **everything David rejected was built from priors/assumptions; everything he kept was built from measured data.** The timing curve was position priors + "a rookie is 22" + "prime is +3..+6y" + today's prices held fixed, projected ten years out — **four assumptions producing one smooth confident line**, the same error as the flat window bar in a new costume. **DELETED from the prototype, not demoted.** What the measured data actually says (three findings, live endpoints + market cache, nothing projected): **(1) He cannot roster what he owns** — 27 players vs a 26-man cap, one cut required *today* before any pick arrives; 9 picks land in the 2027 draft alone; to keep all nine he'd shed ten players. **The picks are not inventory, they're currency he's obliged to spend.** Arithmetic from two live endpoints, zero assumptions, and no surface puts the two numbers side by side. **(2) It's three picks and a tail** — top 3 of 16 hold 41% of value, bottom 8 hold 28%, and all three top ones are his OWN firsts (only that valuable while he stays bad). **(3) "A first-round pick" is not a unit** — the ladder falls **34% from 1.01 to 1.02**, while a 1.12 (2,249) beats a 2.01 (2,134) by only **5%**: the round boundary everyone negotiates around is nearly meaningless, the gap *inside* round one is 3.06×. Finding (1) is the candidate thesis — reframes the portfolio from "nice war chest" to "which three am I keeping, what am I turning the other thirteen into," and is the only one that changes what he does this month. **Studio deliberately did NOT build a third chart** — guessed wrong twice, so the cheap step is confirming the reading first (the validate-cheaply lesson Studio violated twice today). Surface now = three measured facts as prose + the validated board. Clean, 0 errors, no overflow. **v3 THESIS REFUTED BY DAVID 2026-07-24 on domain grounds** — *"that's not really how it works in dynasty fantasy football"* + a terminology correction (**dynasty rookie draft** — every draft after the startup is rookies-only, the class that just came off the NFL board; startup drafts are a different thing and one Studio search was contaminated by them). **Three things Studio had wrong, all conceded: (1) Never checked the roster rules.** League is **20 active (9 starters + 11 bench) + 4 IR + 2 taxi = 26**, taxi is **rookies-only/1yr** — a slot type that exists to absorb rookie picks; he's 1 over in an offseason where over is legal, with until Week 1. "Shed ten players" was wrong on rule and timing. **(2) Room was never the constraint** — his **bottom 10 players = 8,033 < his top 3 picks = 13,743**; 9 of those 10 are NFL rd3–4. David's *"I won't have a problem dropping players for my first round picks"* is correct on measured numbers. **(3) "The round boundary is nearly meaningless" was the OPPOSITE of true** — Studio read adjacent prices (1.12 = 2,249 vs 2.01 = 2,134, 5% apart) and mistook *price continuity between adjacent picks* for *value continuity across rounds*. **RESEARCH DONE (David-ordered):** NBC Sports/Rotoworld, **504 rookie picks 2010–17**, 12-team PPR six-round dynasty rookie drafts, hit = ≥1 season top-12 QB/TE or top-24 RB/WR → **R1 47.6% / R2 31.0% / R3+ 7.0%**; corroborated by Advanced Sports Logic (**29 of top 42 dynasty assets from the top 15 rookie-draft picks**, six from 2.04–3.12). Derived **cost per startable player: R1 6,107 / R2 4,871 / R3 14,971** — a starter is *cheapest through a second*, and thirds cost **3.1×** as much per starter. **v4 BUILT:** new hero = cost-per-startable-player by round (one axis, zero baseline, uniform fill — opacity-as-valence removed), lead rewritten (the old lead claimed "the biggest driver is not the round," now refuted by Studio's own research), an explicit **on-surface retraction region** for the roster-crunch error, and a **calendar region** — picks trough Sept–Nov / peak Feb–Apr, vets peak Nov–Dec, i.e. David's own described play (sell aging vets to contenders, buy picks cheap) is the documented rebuilder playbook; app's own capture corroborates direction (**picks −1.6% over 30 days**, 26,167→25,747). Also measured: **9 NFL 1st-rounders = 53% of his roster's market value** (vs 17.7/16.2/9.5/3.7 for rds 2/3/4/6) — his roster is the mechanism. **RELAY P1 STRENGTHENED** — our model prices a 2nd and a 3rd identically while observed hit rates differ **4.4×**. Honest limits on-surface: hit rates are 12-team PPR **not superflex** (likely understates early firsts), "hit" is binary (counts a league-winning 1.01 = a flex-only 2.10), app market history is only 29 days so it cannot verify the annual cycle. Clean: 0 errors, 0 overlaps/clipped, no overflow 390/1280. **v4 HERO REJECTED 2026-07-24** — cost-per-startable-player chart, captioned *"shorter is better"*, showed 2nds shorter than 1sts. David: *"your saying shorter is better which is weird and then the 2nds are shorter than the firsts?? wtf man - you gotta have a serious epiphany."* **Two failures, one serious: (1) inverted encoding** (length meant worse); **(2) the metric was invalid and Studio had ALREADY WRITTEN THE REASON in the chart's own footnote** — "a hit is binary, it counts a league-winning 1.01 and a flex-only 2.10 the same, which understates the firsts." Dividing price by a binary hit rate makes cheap picks win by construction. **Studio noted the flaw in the caveat and then made it the headline.** **THE EPIPHANY (the durable lesson):** Studio kept **collapsing a pick into a single number so it could draw a bar** — cost per hit, expected hits, value per pick — and every one averages away the only thing that makes a first valuable. **A rookie pick is an option with a fat right tail; an option cannot be represented by its average.** The 1.01 isn't worth 3x the 1.12 because it hits more often, but because the top of its outcome range contains a league-winner. **v5 BUILT:** one bar per pick, length = chance it returns ≥1 startable season, **longer is better**, zero baseline, grouped by round, his own picks marked; deliberately **ONE source** for the bars rather than fusing studies with different definitions/eras into a stacked mark. The within-round-1 slot premium (**1.01–1.03 ≈42% stud vs ≈21% for 1.04–1.06**, DLF) stays in **prose, unfused**, cited as reported since the primary is paywalled — **three of his picks project into that top band**. Clean: 0 errors, 0 overlaps/clipped, no overflow 390/1280. **v5 FOUNDATION ACCEPTED, YEAR AXIS MISSING (David 2026-07-24):** *"your foundation is now on track but there is a recency bias — draft picks closer to real time hold higher value (more demand, more certainty); further out = less. Exceptions i.e. the 2027 draft is 'loaded' and that's been expert consensus for 2 years."* Studio had **measured this in hour one** (it's in the relay as "no year decay") then built three surfaces around round/slot and dropped year — v5 showed all five firsts at an identical 48%, silently claiming a 2029 1st = a 2027 1st. **v6 BUILT.** Measured discount (FantasyCalc generic year+round, live): 1st **−25.9%** 27→28 then **−13.4%** to 29; 2nd −15.4% / −3.8%; 3rd −10.5% / **+1.6%** — **the discount stops working by round 3** (a 2029 third prices *above* a 2028 third: already near the floor, little certainty left to lose). **THE 2027 EXCEPTION VALIDATES INDEPENDENTLY 3×:** take the 28→29 gap as the ordinary one-year step and carry it back — a 2027 1st *should* cost 2,485, costs **2,907 = +17% above trend**; same premium in rd2 (**+14%**) and rd3 (**+14%**). Three rounds agreeing within three points is not noise — **the market prices the 2027 class above its own trend exactly as the consensus David describes says it should.** And **9 of his 16 picks (64% of portfolio value) sit in 2027** — cuts both ways, explicitly left as his call (best to keep if the class delivers / best to convert today). **v6 hero:** three small multiples, one per round, **on ONE shared price scale** (within-panel = year discount, across-panel = round cliff); a single constructed mark — a dashed tick at what 2027 would cost on the ordinary one-year step, so the premium is seen not asserted, labelled a counterfactual not a forecast. Caught pre-delivery: chart rendered +14% for rd3 while prose said +13% — prose corrected to match. Clean: 0 errors, 0 overlaps/clipped, no overflow 390/1280. **ALSO ANSWERED:** David asked why Studio uses `frontend-design` and not "impeccable" — **no such skill is available to Studio**; the brief names frontend-design + dataviz, and Studio disclosed that **this session it loaded only `dataviz`**, reusing the approved 006 visual language instead of re-deriving the aesthetic. David is looking into providing "impeccable." **DAVID REACTED 2026-07-24: "yep you're now heading in the right direction."** A **direction checkpoint, NOT an approval** — surface not signed off, RELAY still not authorised to cross. Confirmed-good so far: round-level outcome odds (longer=better, one source, zero baseline), the year-discount small multiples on one shared price scale with the 2027 premium as a dashed counterfactual tick, the on-surface retraction of the wrong roster-crunch claim, and the validated board underneath. **All four domain corrections + the option-vs-average epiphany logged to DAVID.md so they never need repeating.** **THREAD CLOSED BY DAVID 2026-07-24 — DID NOT LAND. DO NOT RESUME.** *"we dont have 4 rounds we only have 3 - lets stop here. you've tried but we need a fresh perspective."* The craft improved across all seven versions and the outcome did not, because the domain was never understood first; five corrections were paid (rookie-draft-vs-startup, roster rules, first-round value, the year premium, the round count). **What survives independent of the framing:** the measured relay items P1–P5 in `008-RELAY.md` (the flat pick model, the unread FantasyCalc slot prices) — those are engineering facts and remain valid. The *surface* does not. |
| **007 Disclosure motion** (craft bench, `007-disclosure-motion/motion-lab.html`) | **Built 2026-07-23. Craft/sharpening thread — NOT a proposal, no relay, no David gate.** Self-directed strand-2 (motion technique, outward-grounded). The gap it closes: the approved 006 front door has *zero* disclosure motion — `row.after(card)` snaps the card into the DOM instantly (frontdoor.html:398); the only transition in the whole file is the chevron rotate. Every accordion surface Studio has drawn inherits that snap, and inline-row-expansion is now standing doctrine everywhere (DAVID.md 2026-07-15). The bench gets the motion right once on the **real 006 WR card** (real WR data, real tokens/fonts) so future surfaces pull a proven recipe. Three height mechanisms toggleable — **grid `0fr→1fr` (the recommended default: cross-browser, no JS measuring, reverses mid-flight)**, native `height:auto` via `interpolate-size` (Chrome/Edge 129+, graceful snap elsewhere), and `max-height` (the anti-pattern, shown to contrast). Plus a **content-choreography toggle** (columns fade+rise staggered vs height-only), **slow-mo** (1×/2×/4×) to study the stagger, **reduced-motion simulate**, and full a11y floor (real buttons, focus rings, `prefers-reduced-motion`). Copy-paste recipe + sources in the notes rail. Grounded in current best practice (Chrome/Bramus/MDN/Material, searched 2026-07-23). Self-critiqued via headless screenshots; one bug found+fixed (name/meta run-together → stacked). Clean, responsive, 0 errors. **This is the recipe that replaces the front-door snap whenever 006 is next touched.** |
| **006 State of your franchise** (real front door built) | **Full front door built 2026-07-22 (`frontdoor.html`), awaiting David's review.** Real data throughout. Hero = franchise verdict ("A rebuild, still early", measured-honest voice per ruling) + standing (12/12 value & starters, 3rd-youngest, 16 picks) + positional-shape bars. "What you hold" = **position groups QB→RB→WR→TE** (per David's team-page ruling), each header carrying its thesis (QB=the bet; RB=Jeanty+Henderson; WR=14-deep surplus/currency; TE=the hole), rows show our-vs-market positional rank + trajectory + market sparkline, **click any row → the July-15 approved player card inline** (our-vs-market lanes, percentile-in-pool bars w/ raw rank, comparables on each board, in-season placeholder). Lower: derived "your board this month" + demoted market feed. One interactive page, position-grouped, thesis-driven. Clean at mobile/tablet/desktop, 0 console errors. Stale-standing-data (Jun 23) flagged honestly on-surface. Skeleton (`wireframe.html`) preserved. **v2 2026-07-22 per David feedback ("we can work with this"): (1) card de-cluttered from 4 numbers to 2 — rank as the raw number at each percentile bar's end, overall moved to prose; (2) row's abstract gap-bar replaced with a dumbbell on the position's pool scale (best-left, our dot vs market dot, connector=disagreement) — standing + disagreement now read at a glance. Direction confirmed "heading in the right direction." **v3 2026-07-23: lower two regions reworked with the same lens — "Your board this month" now names concrete moves (sell chips Wilson/Burden/Odunze, cut Rasheen Ali, Dart leads the QB bet) instead of static advice; "What's moving" is now a consistent instrument pairing each 7-day market move with our-vs-market rank ("read the gap, not the arrow") rather than a bare change log. Front door regions 1–4 now all thesis-driven. Clean at all breakpoints. **DUMBBELL SCALE FLIPPED 2026-07-23 — best=right/worst=left (#1 far right), per David (Savant convention). RANK-AXIS CONVENTION LOGGED in DAVID.md.** **"YOUR BOARD THIS MONTH" REGION PULLED BACK FOR REWORK 2026-07-23:** David rejected shallow prescriptions ("sell Garrett Wilson" reasoned only from WR surplus) — proven indefensible (we don't even model Wilson; he's near a 29-day low not a high; window argues hold; he's the best WR). Region must become **decision-support not decision-making** — assemble the deep case (window alignment, our-vs-market, value trajectory, replacement), no verdicts. David's steer: "lean HEAVILY on the decision data — evidence, combination of factors, reasoning — then softer earned tagging, not prescription." **REBUILT 2026-07-23 as evidence cards:** each real decision (Garrett Wilson, Rasheen Ali, the QB bet) assembles the bearing factors (window alignment, our-view-vs-market, value trajectory over available history, replacement) + a "The read" synthesis + a soft neutral lean tag ("lean: hold" / "lean: cut candidate" / "unresolved") — never a command, tags un-colored. Wilson (the wrongly-recommended sell) now correctly reads lean:hold with the full case. Clean all breakpoints, 0 errors. Principle logged in DAVID.md as a top governing rule. **DAVID REACTION 2026-07-23: "calls worth weighing looks solid. something we can build upon."** Evidence-cards region CONFIRMED; with it the full front door is approved in principle region by region (hero, position groups, evidence cards, feed). "Build upon," not yet relayed to engineering. **CORRECTION 2026-07-23: the "deepen the evidence" menu selection was a STRAY TOWER KEYSTROKE, NOT David's choice** (logged in DAVID.md). David is fine with Studio pursuing it — the work is kept — but it must be presented at review as **Studio's own proposal for his reaction**, not a direction he chose. **BUILT `evidence-deepened.html` 2026-07-23 (Studio's own direction):** each factor now SHOWS its case via a grounding visual, prose demoted to caption — **window** = a timeline of the player's productive runway (to his position age-cliff) against the core's peak band (the overlap is the read); **our view** = the confirmed dumbbell (our rank vs market, best-right); **value now** = a 29-day market-rank sparkline (up=better) with the recent range + honest "only 29 days captured" limit; **replacement** = drop-to-next-man on the pool scale (Wilson) / roster-capacity slot strip (Ali). Scoped to the two clean leans (Wilson hold, Ali cut) to validate the pattern cheaply before widening. **Before/After toggle** shows exactly what deepening adds vs the approved prose-only. Model/market pair re-validated on the dark surface via the dataviz script (CVD ΔE 25.1, all 6 checks pass). No verdict coloring; lean tags stay neutral; instrument-not-editorial (renders geometry, David reads it). Self-critiqued via headless screenshots; 3 bugs found+fixed (window label collision, swapped best/soft sparkline labels, Ali caption over-claiming "flat"). Clean all breakpoints. **Delivery HELD by Tower 2026-07-23 (David deep in engineering — timing, not judgment); parked, Tower brings it when David surfaces. Present as Studio's proposal.** Open craft question to raise at review: the value-now sparkline auto-scales to recent range, which can make a parked player's noise look active — kept the time-shape per his "shape over time" preference. **NOTE: this same auto-scale problem is the sparkline half of the confirmed 004 N1+N4 thread — solve once across both.** **DAVID REACTED 2026-07-23 (viewed live): direction VALIDATED — grounded visuals "great in theory," window concept "excellent" — but execution not there: (1) the straight-line window is MISLEADING (conceded logic error — production is non-linear rookie/peak/decline; must render the real production curve, not a flat bar); (2) visuals too small + under-labeled; (3) NEW STANDING BAR — ground every encoding in peer-reviewed viz literature (Mackinlay effectiveness ranking, Rougier "Ten Simple Rules," Gestalt/PRISMA, Material/CMU), not taste. Logged in DAVID.md. NEXT: research the canon, rebuild the window as a true labeled aging-curve at proper scale, re-validate one mark cheaply before propagating.** **RESEARCHED + REBUILT 2026-07-23 (`window-redesign.html`):** window is now a real per-position **aging curve** (position encoding per Mackinlay; data-ink per Rougier; shapes from 4for4 / Dynasty Edge / Fantasy Points aging-curve studies — WR broad peak 26–30, RB narrow peak then steep fall, QB wide 28–33, TE Y2 jump + long plateau). Player's current age marked ON the curve (ascending/peak/declining read from slope); "your window" = ages he'll be during the core's 2–4-yr-out peak, shaded — so "peaking into your window vs declining out of it" reads off the picture. Honestly labeled a lifecycle **prior**, not his stats (no games played). ~4× larger than the old micro-viz; before/after concession strip makes the straight-line error concrete. Sources cited on-surface. Self-critiqued (axis-label collision fixed). Scoped to ONE mark (window) for cheap re-validation before applying the same rigor to the other 3 factors. **Delivered to David 2026-07-23 via ritual; reaction pending.** **CORPUS MINED 2026-07-23** (David handed the full URL list; tracking params stripped): subagent read CMU/Gestalt/JHU/luiscruz/experimentology/awesome-viz-research → cited principles saved to `dataviz-principles.md` as the engagement's viz standard. **Verdict: the aging-curve FORM is literature-correct** (position = most accurate channel, Mackinlay/Cleveland-McGill) — clears the bar on form. Applied one research-driven refinement to the window: a faint **uncertainty halo** so the curve reads as a typical prior, not measured precision (uncertainty-shading lit). **THE UNIFYING LESSON: shared/fixed rank scales across cards is the literature's #1 rule AND the confirmed 004 N4 AND the value-now flaw Studio flagged — three roads, one fix.** **FULL CARD REBUILT 2026-07-23 (`evidence-deepened-v2.html`; v1 preserved for audit):** all four factors to the literature standard. Window = the aging curve (full-width hero, halo). Our-view = dumbbell on a fixed per-position pool scale + **CVD-safe shape cue (our=filled dot, market=hollow ring)** + direct labels. Value-now = sparkline on a **fixed rank-per-pixel scale** (the unifying shared-scale fix — a real move and a flat week now look different; parked players read flat) + recessed band (no competing borders) + endpoint labels. Replacement = two dots on the SAME fixed scale (consistent grammar) / capacity strip for the cut. All visuals ~3–4× larger (answers "too small"). Honest limits preserved on-surface (prior-not-stats + halo; 29-day window; rank≠value at the floor). No verdict coloring; neutral leans. Self-critiqued (fixed: clipped value labels, best→ collisions, Ali caption over-claiming "flat"). **NOT YET SHOWN — the browser-open was intercepted at session closeout; v2 is built, clean, on disk, awaiting David's FIRST look next session.** Same standard now ready to fold into the front door's other marks. **PARKED THREAD (a): deepened evidence cards v1+v2 await David's react — the standing question is "does deepening each factor earn its place — build it out to the rest, or too much?" He reacted to v1 (great in theory, needs polish+logic → drove the window rebuild + v2); v2 is the literature-grounded answer and he hasn't seen it yet.** **v2 POLISHED 2026-07-23 (session start, fresh-eyes self-review before gating): two real defects caught + fixed. (1) The redundant "● ascending" trajectory chip contradicted Ali's own "cut candidate" thesis at a glance (a 24-yo RB on the RB curve's rising limb reads "ascending" while the card argues cut) — REMOVED, not relabeled: the NOW-dot's position on the curve already carries trajectory (Mackinlay's most-accurate channel) and the caption states it in prose, so the chip was a third, misfiring copy; removal maximizes data-ink (Rougier) and matches David's own "read trajectory from the slope" model. (2) The value-now sparkline's #lo/#hi range labels collided (~6px apart on a thin fixed-scale band) — replaced with a single direct label on the current rank (the value that matters), band carries the range visually, prose carries the numbers. Re-screenshotted both cards + top; clean, 0 page JS errors. Dead CSS removed. **v2 now gate-ready; pitching to David this session as STUDIO'S OWN PROPOSAL (per the stray-keystroke correction) with his parked question: does deepening each factor earn its place — build the standard out to the rest of the region, or is a card this heavy too much for a front-door region?** **DAVID REACTED 2026-07-23: "I like it… this is good — we can keep going with this." Deepening EARNS ITS PLACE (thread-a answered: build the standard out).** New direction + data ruling logged in DAVID.md: **the aging curve should carry his own track record — right-of-now = position prior, left-of-now = HIS realized history (our past model prediction vs his actual production, per season), answering "have we been accurate on HIM, and improving?"** Verified live: FORWARD half buildable by construction (the app's realized-outcome loop is per-player by design — `tracking_rows` — but inactive, accrues from Sept); BACKWARD half blocked (no per-player historical actuals in-app; §4 hard constraint; Model Trust exposes only position-aggregate backtest folds, not per-player residuals). NEXT: design the curve's left-of-now realized-track region with an honest pending state ("accrues from September"), never fabricating past actuals; bring to David's gate when worth his eyes. **DAVID GREENLIT THE BUILD 2026-07-23 ("alright, lets give it a shot").** **BUILT `window-track-record.html` 2026-07-24:** the aging curve's NOW-dot becomes a HINGE — right = outlook (position prior + your window, unchanged); left = HIS TRACK RECORD, our past call vs his actual per finalized season, drawn as **per-season vertical dumbbells** (blue call dot + neutral-ink actual dot + connector; connector LENGTH = the miss). Accuracy-over-time reads directly as the connectors tightening toward now (wider→closer) — David's exact question in the two most-accurate channels (position + length, Mackinlay). **Honesty mechanism = a state toggle:** *Illustrative* (populated sample, clearly stamped "ILLUSTRATIVE — not his real seasons") and *Today* (honest pending: faint dashed ghost-dumbbells + "AWAITING SEPT" chip; caption explains "accrues from September, one mark per finalized week"). No fabricated real actuals; reuses the approved dumbbell grammar; neutral (no verdict color). Self-critiqued via headless screenshots — fixed: dropped a zigzag call-line for clean vertical dumbbells, sharpened the tightening to monotone (0.20/0.11/0.03), rebuilt the Today state after the pending text collided with the prior curve. A headless viewport-emulation quirk made me briefly chase a phantom mobile-overflow bug (DOM measured no overflow — desktop review surface is clean). Delivered to David's gate 2026-07-24 via ritual. **PARKED THREAD (b): the track-record left-half — reaction pending; the question is whether the dumbbell-over-time reads the accuracy trend, and whether the Illustrative/Today toggle is the right honesty device or if Today-only is more honest for a surface with no real data yet.** **DAVID REACTED 2026-07-24 with a sharp conceptual push: shouldn't the CURVE ITSELF be our model's per-player prediction (we're supposed to model production over a career)? If so, drop the separate "our call" dots and just show his ACTUALS as dots vs the line.** VERIFIED live what the model actually emits per player (`/api/players/{id}`): DVS value + xVAR + **sparse** `projection_1y/2y/3y` (Rice: only 2y populated; Ali: only 2y) — **NO per-player production-by-age curve**. The curve Studio drew was a generic POSITION prior, explicitly not our model — David correctly caught this weakness. **REBUILT to his spec 2026-07-24:** the line is now **"our model's arc for him"** (model-blue), his **actual seasons = white dots**, the gap from each dot to the line = model-vs-reality; call-dots removed; convergence (dots settling onto the line, wider→closer) = our read on him sharpening. **The honest catch surfaced on-surface + in the pitch:** for the line to truly BE our model per-player, the model must EMIT a per-player production-by-age arc — it does not today (only value + sparse projections). That's an **engineering ask**, shown illustratively. **THE FORK POSED TO DAVID:** pursue "the curve is our model, per player" as an engineering capability ask (the better design, answers his question, and its past portion gives a baseline to compare past actuals against), or fall back to a position-prior backdrop with our-model marks overlaid (works today, but the line isn't our model). Studio's rec: pursue the ask. Clean, 0 JS errors, both states verified. |
| **005 Where we stand** (proposal + RELAY + prototype) | **DESIGN REJECTED by David 2026-07-22 (v1 and v2 both).** "Really bad… awful visual experience": two long parallel lists, no interactivity, drift column backwards + verdict-colored. Root causes recorded in DAVID.md (designed from data not the question ladder; violated ≥3 standing rulings; over-built before validating IA). **The analysis survives** — frozen model (25 days), no published overall rank, superflex contamination, the age-artifact finding, and the 004 N0 withdrawal are all sound and belong in the RELAY. **The design restarts** from one interactive filterable list defaulted to My Roster. RELAY still NOT authorised to cross. Next step gated on David confirming the corrected design direction before any rebuild. |
| **004 Us against the market** (proposal + RELAY + 4 prototypes) | **v4 KEPT by David 2026-07-21.** **VERDICTS IN 2026-07-23 (via Tower); dispositions logged at foot of 004-RELAY.md.** N1+N4 CONFIRMED as **one design problem, Studio's forward thread** (dollar-ranking buries big %-moves on cheap players + sparklines auto-scale so rows can't compare — design what deserves attention + comparable magnitude; prototype; no rush). N3 CONFIRMED worse (52 shown vs 448 actual; engineers fix). N6 CONFIRMED trivial (engineers). **N0 pattern real but Studio's Superflex-baseline CAUSE REFUTED (ranking-pool artifact; model does NOT mis-value QBs) — retracted.** N2 CLOSED — retracted. N5 approved for research capture (verdict after ~a week). **The sparkline-comparability half of N1+N4 = the same auto-scale issue in the 006 deepened value-now mark — solve once across both.** |
| 000 first impressions + RELAY | Crossed. Verdicts were still outbound at last session close. |
| 001 Morning Tape + grounded analysis layer | Crossed. Verdicts still outbound at last close. |
| 001b RELAY addendum (rank-first defaults, N1–N8) | Crossed 2026-07-15, **fully accepted** same-day (disposition at foot of file). |
| 003 League data freshness (F1–F4) | Crossed 2026-07-15, **fully accepted** same-day (disposition at foot of file). |
| 002 question ladder / IA | Written 2026-07-15 from the dynasty-strategy deep research. |

## 004 — what it is (one line)

Ranking daily market movement by size of move is, measurably, ranking it by cheapness; this proposes
ranking every move against that player's own normal day instead, and lets the surface say "nothing
happened" when nothing did.

**Evidence base (all reproducible):** 404 players × 28 days from `app/data/fc_forward_capture.db`.
Volatility runs 28× from cheap to expensive (−0.709 Spearman vs. log value) and is a stable player
property (0.913 split-half). Dollar-ranking and signal-ranking overlap only 3.6/10 in the top ten,
averaged over 14 straight days, with a different #1 on 13 of 14. FantasyCalc ships `displayTrend`
(true for 26 of 463) plus trade frequency and roster percent; the capture retains none of the three.

**Prototype:** `004-noise-floor/prototype.html` — self-contained, real data, app tokens and typefaces,
inline row expansion, no red/green outside the standing rank-arrow ruling.

**Revised twice by client review.** v1 was market-only — David called it on practicality ("should I
really be ACTING on those signals?") and on the missing model-vs-market juxtaposition. v2 added both
lanes and immediately falsified v1's headline (Omar Cooper: we 75th, market 76th — a non-event). v3
removed the narrative headline entirely after David asked for a consistent instrument rather than a
daily protagonist, and replaced it with a fixed state strip plus small-multiple gap-over-time cards
on one shared scale. Full revision log at the foot of the proposal; all three prototypes preserved.

**Biggest finding, surfaced only by the consistent view — filed as relay item N0 (High):** the
model-market divergence is systematic by position. Median gap +13.6 for TEs, −10.8 for QBs, with the
QB distribution nearly one-sided. Plausibly a superflex scaling artifact (market is pulled at
numQbs=2) rather than an analytical edge. Engineering question, not a design one.

**Revised four times in one session.** v1 market-only → v2 added the model-vs-market juxtaposition →
v3 replaced the narrative headline with a consistent instrument → v4 removed time from the overview
and faceted by position. Full revision log at the foot of the proposal; all four prototypes preserved
so the reasoning is auditable.

**Relay status:** 004 crossed 2026-07-21 (David confirmed directly). Six items; **N0 — the QB/TE
position skew and whether it is a Superflex scaling artifact — is the one to watch**, because the
answer determines whether anything built on the model-vs-market comparison is measuring analysis or
league settings. Log dispositions at the foot of `004-RELAY.md` when verdicts land.

**Parked, awaiting David:**
1. Whether a *daily* surface earns its place at all — 22 of 23 roster gaps moved ≤8 points across 10
   captures, so the disagreement is structural, not daily. Asked twice; unanswered.
3. Whether position is the right cut for the overview, or the roster wants slicing another way.

## Carried forward from 2026-07-15 (unchanged, still open)

1. Prototype rework of the 001 morning-tape artifact to the corrected xVAR model-rank basis
   (per-lane denominators, "gap" not "opportunities", honest tie rendering). **Not started in code.**
2. Scouting-view proposal (question 6) from `assets/league-pulse-capture-2026-07-15.json`.
3. Tier-boundary derivation analysis — prose ladder is client-mandated, gated on calibration.
4. Crew verdicts on 000 and 001 still outbound.
5. Bo Nix live-ownership verification (market QB12 / model QB4 / FA per the Jun 23 artifact).

## 005 — what it is (one line)

The app has no rankings list, which is the one surface every product in this category leads with;
this builds it with both lanes in rank space, and reports that our lane has been frozen for 25 days
and has no agreed definition of "our rank."

**Evidence base (all reproducible):** `model_forward_capture.db` across 29 days — last day with any
`dynasty_value_score` change was 2026-06-27; 0 of 581 scores and 0 of 12,200 projections changed
overnight; live `/api/league/what-changed` returns `daily_diff.model.deltas: []` with status
`vintage_changed_no_score_delta`. Market re-ranked 370 of 452 the same night. Top-25 position mix:
ours 3 QB / 15 RB / 7 WR / 0 TE (xVAR basis) or 1/6/6/12 (DVS basis) against the market's 9/7/7/2.
Age gap monotone within Engine B (−22 → +28) and within every position.

**Prototype:** `005-where-we-stand/prototype.html` — 340 players, both lanes, fixed-scale gap track
per row, position-faceted age instrument, inline row expansion. Palette validated (all checks pass).

## Notes on the product, observed 2026-07-21

Shipped since 2026-07-14: headshots now render throughout; per-row 28-point sparklines exist;
`/api/health` returns 200 (was 503); capture health is 28/28 days with zero gaps on both stores.
Still open from the briefing's defect list: Movement history card still reads "Series pending" while
sparklines render beside it (filed as 004 N6).
