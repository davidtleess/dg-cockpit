# 010 — Where you're thin, and who you can actually get

**Status: CLOSED 2026-07-26 — DID NOT LAND. DO NOT RESUME THIS SURFACE.**
David, after six versions in one session: *"i dont know — its not speaking to me. might need to call it
a day. were not getting better."* Nothing approved. The relay items Q1–Q2 are NOT authorised to cross
and are the only part of this thread still worth anything.

**The through-line, and it is the 008 lesson repeated verbatim: the craft improved every version and
the outcome did not.** v1→v6 fixed real defects each time — inferred lineups replaced by Sleeper's
real ones, David put on his own board, a hover layer, filters, named views, a measured square-root
scale. Every fix was correct. None of them made the surface speak, because **the premise was never
re-examined; only the drawing was.** Studio was told this exact thing on 2026-07-24 and did it again.

**The likely root cause, stated for whoever picks this up next.** Every version was denominated in
**units Studio invented** — "what he adds to your best legal lineup," "what his owner would lose,"
best-legal-lineup slot standing. A dynasty manager does not think *"this player adds 1,184 to my
optimal lineup."* That number is an optimiser's output, not the hobby's language. Contrast what David
has reacted well to across this engagement: **prose tiers** ("the market prices him a high-end WR2,
our model sees a mid WR1"), **named comparables**, **rank and rank movement**, the **aging curve**.
All of those speak the game's own language. Cost/gain lineup deltas speak nobody's. A surface can be
measured, honest, literature-defensible and well drawn, and still say nothing if its units are foreign
to the reader. **Do not restart this by redrawing it. Restart, if at all, from the language.**

Self-directed, strand 1. This is the surface for the question David **confirmed on 2026-07-25**:

> *"who holds a player at my position of need that they can AFFORD TO LOSE — because the drop-off to
> their backfill is small?"*

It replaces the two matrices he rejected the same day. Those failed on the *question*
(*"is their best better than mine?" — "why is that even the question???"*), not on the drawing.

---

## Problem

The confirmed question has two halves, and the previous pass built only the second.

**"My position of need" was never measured.** `replaceability.py` computed what every player would cost
his owner and add to David, but nothing established *where David actually needs help*. Without that,
the surface is a map again — 243 players and a search problem.

The app's own answer to "where is my need" cannot discriminate. `/api/league/pulse` →
`team_values[roster 1].positional_summary` returns, live:

| position | `surplus_label` | `z_score` | `starter_xvar` |
|---|---|---|---|
| QB | `deficit` | −1.907 | **0.0** |
| RB | `deficit` | −1.457 | 13.4 |
| WR | `deficit` | −1.739 | 2.4 |
| TE | `deficit` | −2.72 | −16.85 |

All four read `deficit`, so the label separates nothing (relay 009 P5 — it is a z-score against the
league, and the weakest team saturates). And QB `starter_xvar` is **exactly 0.0** — the IR/taxi
exclusion already filed as relay 009 P3 — so the app prices his quarterback room at nothing.

---

## What the measurement found

Method: best legal lineup (QB, RB, RB, WR, WR, TE, FLEX, FLEX, SUPER_FLEX) filled greedily by market
value, computed for all 12 teams. `need(slot)` = his filler's value against the same slot on the other
eleven rosters. Reproducible: `analysis/need-and-targets.py`.

### 1. His weakest slot is QB — but the "twice the next gap" half is RETRACTED

**CORRECTION, 2026-07-26, after Tower's verified test (TW26R).** FantasyCalc's superflex values are
its one-QB values times a **fixed per-position constant** — QB ×1.8711, RB ×0.9179, WR ×1.0012,
TE ×1.0936, picks ×1.0521 — measured across 475 players in both pulls, with no drift by rank inside
quarterbacks (QB1–24 mean 1.872356, sd 0.00033; QB25–48 mean 1.872639). It is a blanket positional
adjustment, not a superflex-specific valuation.

**What survives:** every slot **rank** below, because a positive constant cannot reorder players
within a position. QB 9th of 12 holds.

**What does not:** the claim that QB is his hole *by twice the next gap*. That compares a QB-sized gap
against a WR-sized gap across positions, so it rides entirely on the 1.8711. Divide the constants out
and the two are effectively tied:

| | as published | deflated to 1QB units |
|---|---|---|
| QB gap | −1,568 | −838 |
| WR1 gap | −768 | −767 |
| **ratio** | **2.04×** | **1.09×** |

**The honest finding is therefore: he has two roughly equal weakest slots, QB and WR1 — not one
dominant hole.** Which sits better with the rest of the measurement anyway: fourteen receivers with
no top is exactly what a WR1 hole looks like. Two cross-position slots also move on deflation
(FLEX1 4th→5th, SF 4th→6th); the single-position slots do not move at all.

**Standing bar from this:** never rest an argument on the *shape* or cross-position *magnitude* of
the FantasyCalc curve. Ordering within a position is sound. Cross-position gaps must name the
adjustment. Curve steepness is not evidence about superflex at all.

### 1a. The slot standing itself

| slot | his starter | standing | vs league median |
|---|---|---|---|
| **QB** | Jaxson Dart | **9th of 12** | **−1,568** |
| WR1 | Garrett Wilson | 8th of 12 | −768 |
| FLEX2 | Parker Washington | 9th of 12 | −220 |
| WR2 | Luther Burden | 8th of 12 | −123 |
| TE | Tucker Kraft | 5th of 12 | +176 |
| FLEX1 | Rome Odunze | 4th of 12 | +211 |
| RB2 | TreVeyon Henderson | 5th of 12 | +431 |
| SF | Fernando Mendoza | 4th of 12 | +500 |
| RB1 | Ashton Jeanty | 3rd of 12 | +2,113 |

**This contradicts a thesis I had been carrying.** 006's approved front door calls TE "the hole." In
lineup terms TE is his *fifth-best* slot and above median. The two lanes genuinely disagree here —
our `positional_summary` makes TE his worst z-score (−2.72) — and that disagreement is worth reading
rather than resolving. But part of it is not a disagreement at all: the QB `0.0` is a defect.

**It is a hole and a bet at the same time, and the surface should not flatten that.** His top-two QB
room averages **age 23.0**, the youngest in the league by 1.4 years over the next (jgil96, 25.0).
He is 9th of 12 *today* holding the youngest room in the league. Both facts are true.

### 2. QB is where replacement cover is thinnest — but the starter/bench framing was wrong

**RETRACTED (David, 2026-07-26).** v1 claimed *"all 13 QBs who would improve his lineup are their
owner's starter, zero on a bench."* That rested on a **greedy market-value lineup optimiser Studio
built**, not on what owners actually do. David: *"some managers have their best qbs on the bench
sometimes."*

**He is right, and it is measurable at the very top of the board.** Sleeper carries real saved
lineups — **92% of slots set league-wide, 10 of 12 teams complete** — and they disagree with the
optimiser for **10 players**. Most importantly: **Free Kelly bench Josh Allen (10,232, the most
valuable player in the league) and start Dak Prescott (3,970).**

Neither lineup is authoritative in July: Studio's is inferred, Sleeper's may not have been touched
since last season. So **starter/bench is now recorded per player and used to rank nothing.**

**A second correction, from the craft library (Tower, 2026-07-26) and verified against this league.**
v1 also said *"nobody is holding a startable QB spare."* Too loose, and the superflex reference
contradicts it: leagues do carry deep QB benches. Checked here — **46 QBs are rostered against 24
QB-capable slots (12 QB + 12 SUPER_FLEX), so 22 sit beyond the starting slots. Spare QBs plainly
exist.**

The precise, verified statement for this league is narrower and more useful:

- **19 QBs are third-or-deeper on their own roster.** They exist, and they are gettable.
- **Every one of them is market QB16 or worse** — Dak Prescott (QB16) is the best of them.
- **David's own starter is market QB10.** So **zero** of the 19 spare QBs is an upgrade.
- Every QB who *would* improve him is his owner's **QB1 (10) or QB2 (3)**. None is deeper.

This independently reproduces the reference's finding that the superflex squeeze lives around
**QB25–48 rather than at the top**. The spares are real; they are simply all worse than what he
already has. **That is now shown rather than asserted** — his own best is drawn as a dashed reference
line through every row, so "the spare QBs all sit left of my guy" is a spatial read, not a claim.

Also carried forward as an **unverified risk**: the reference reports FantasyCalc's superflex values
as a flat 1.872× scalar on its 1QB values. If that were a uniform all-player scalar it would leave
cross-position ratios at their 1QB relationship, and every lineup number here would understate QBs.
Checked against the cache: **QB1 prices at 1.04× WR1 and 8 of the top 24 players are QBs**, which is
not a 1QB relationship. So the values in use do appear to reprice quarterbacks. Confirming it properly
needs a 1QB fetch that has not been made.

### 3. Where cover is deep, the cheap-to-lose players concentrate on two owners

An **analysis** cut (not a filter on the surface — the surface shows everyone): cost under 40% of gain,
gain ≥ 500.

| player | ours / market | costs owner | adds here | owner · posture |
|---|---|---|---|---|
| Chris Olave | WR9 / WR16 | 435 | 1,937 | YippeKiYay · **Contender** |
| DeVonta Smith | WR24 / WR22 | **0** | 1,502 | YippeKiYay · **Contender** |
| Marvin Harrison Jr. | WR45 / WR23 | 474 | 1,377 | Florida Man · Ascending |
| Brian Thomas Jr. | WR30 / WR26 | 360 | 1,263 | Florida Man · Ascending |
| Makai Lemon | WR18 / WR27 | 335 | 1,238 | Florida Man · Ascending |
| Cam Skattebo | RB16 / RB17 | 281 | 1,184 | Florida Man · Ascending |
| Jadarian Price | RB8 / RB19 | 125 | 1,028 | Florida Man · Ascending |
| Kyle Pitts | TE11 / TE8 | **0** | 903 | Florida Man · Ascending |
| Derrick Henry | RB11 / RB22 | **0** | 848 | YippeKiYay · **Contender** |

Five of nine sit on **Florida Man**, three on **YippeKiYay**. That is the conjunction David described
— a specific counterparty you can do business with — arrived at from his need rather than from a map.

Skattebo is the case David predicted: he is **in Florida Man's saved lineup** and still costs them
only 281, because the FLEX behind him absorbs it. Bench-only logic misses him entirely.

**And the same check corrects yesterday's list in the other direction.** `replaceability.py` filed
Derrick Henry and Kyle Pitts under *"zero-cost targets — bench pieces their owner cannot play."*
Sleeper says **both are in their owners' saved lineups.** Their cost is zero against a best-value
optimiser, not against what their owner actually does. Cost-zero means "a value-maximising lineup
would not use him" — it does **not** license the claim that he is benched, and the surface no longer
makes it.

---

## Proposal

Two regions, in the order the question asks them.

**Region 1 — your starting nine, against the league.** Nine rows in lineup order, one shared market-value
scale, every team's filler at that slot drawn as recessed ground with his own as the figure, and a median
reference tick per row. The same nine rows render every day in the same shape; which one looks wrong is
determined by the data, never by copy. Right column states standing and gap in numbers.

**Region 2 — who's gettable there.** Opens on his measured weakest slot and shows **every player at
that position in the league** — 41 QBs, 76 RBs, 89 WRs, 37 TEs — nothing pre-filtered. Per row: our
rank against the market's as a dumbbell (best right, both direct-labelled at their own dot); owner and
**posture**; the owner's saved-lineup designation recorded but never used to rank; an availability mark
whose trough is the player's own market value and whose fill is what his owner's lineup actually loses,
**with the replacement named**; and what he would add here. Ordering is the tool for directing
attention — sort by market rank (default), our rank, what their owner would lose, or what he'd add.
Rows expand inline to the owner's full depth chart at that position.

**The two quantities are never fused.** `adds − costs` is degenerate (it collapses to a team-pair
constant — re-verified on fresh data: Free Kelly's starters all return −12/+47). `adds ÷ costs` is
unbounded because cost is exactly zero for any bench player. The list ranks on one dimension at a
time and always shows the other; nothing is hidden and no threshold decides what he sees.

**Region 2 has two views over one query — plot first, table second.** A filterable grid is still a
*tool*, and the governing method says a tool may exist but is never a region's default view. So the
default is now a **plot**: four position panels, every player a dot, his own filled, an agreement
diagonal where the two lanes concur. **Both axes are reader-selectable** (market rank, our rank, market
value, age, what their owner would lose, what he'd add to you), which is what makes one instrument
answer many questions — model-vs-market disagreement, the age/value curve, and the availability-vs-fit
conjunction that no earlier version could show at all. Rank axes are drawn as **percentile within
position** so the four panels share one scale, with the raw rank on hover.

**Measured before drawing** (the standing rule): the two lanes correlate **0.775–0.859** — a real
scatter, not a diagonal with nothing on it — and **49 players sit 15+ rank places off the agreement
line** (32 of them WRs). The picture has structure to show.

**Region 1 and 2 are joined.** Region 1 speaks in lineup slots (FLEX1, FLEX2, SF), region 2 in
positions — so a weak FLEX slot had no chip to click. Slot rows are now buttons that open the position
filling them.

**Your own players are on both boards.** Region 2 originally excluded David's roster, which meant
shopping 41 quarterbacks with his own five deleted from the list: "is this an upgrade?" could only be
answered by trusting a computed number, and that number is a dash on **68% of every list**. His players
are now in the list, marked, and his best at each position is drawn as a **dashed reference line
through every row** — right of it is an upgrade. This is what makes the 68% legible rather than odd:
those rows are blank because they sit left of his line.

**Every mark answers "what is this?" on hover** (David, 2026-07-26: *"there are so many dots on the my
team scale — who are they?? and how am i supposed to know what the dotted lines represent"*). A single
delegated hover layer covers league dots, both rank dots, the reference lines, the cost trough and the
adds bar. Both reference lines are additionally **labelled on the graphic** the first time they appear
— a key you have to memorise is the failure Okabe & Ito warn against and the one that sank the 009
matrix. Hit targets are widened well beyond the 1px rules. Nothing lives only in a tooltip: touch has
no hover, so every tip restates what the row, the expansion or the aria-label already carries.

**Prototype:** `010-who-can-i-get/prototype.html` — real data, app tokens and typefaces, lane colours
verbatim, inline row expansion, no verdict colouring.

---

## Costs, honestly

- **It cannot ship until relay 009 P1 lands.** Built on the fresh on-disk artifact
  (`league-20260725T132000Z`); the league endpoints still serve 2026-06-23.
- **Cross-position value is market units only.** Comparing a QB slot to a TE slot needs one currency
  and DVS cannot be ranked across positions (009 P4). Our lane appears only *within* a position.
- **Fifteen players have no model view** (009 P2), rendered with the market dot only — including the
  market's QB3 Jayden Daniels and his own Garrett Wilson.
- **"Costs them" is a lineup measurement, not a price.** It is not what an owner would ask for, and it
  cannot see whether they want to trade at all — Sleeper's transactions endpoint is never called.
- **Posture is the app's own heuristic**, computed on the same IR/taxi-excluding number as 009 P3.
- **Region 1 measures market value, not projected points.** It is a proxy for lineup strength.

## Open questions

1. **Does region 1 belong here, or on the 006 front door?** It answers "where do I stand," which is
   ladder region 1, and 006 already owns that. My read: it earns its place here because it is the input
   to the trade question, but it may be duplicating the approved front door's job.
2. **Is the QB finding the headline, or a footnote?** The most useful thing measured today is that his
   one real hole has no cheap answer. That is closer to a *conclusion* than an instrument, and the
   standing rule is to render the mechanism and let him read it. Currently it appears only as an empty
   state behind a filter.
3. **His QB room is the youngest in the league.** "9th of 12 at QB" and "the bet is intact" are the
   same fact seen twice. The surface reports the standing and does not yet carry the bet.
