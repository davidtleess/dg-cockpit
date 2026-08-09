# 019 — Your roster on the field

**Status: built, shown to David repeatedly across 2026-08-08/09, iterated on his reactions.
Not approved, nothing relayed.** It supersedes the framing in 017 and 018, both of which used a
word Studio invented.

---

## Problem

Every screen in this product prices players. None of them says what a player actually **did on the
field**, and the two surfaces Studio built before this one described it in a vocabulary no dynasty
manager uses — "the job he was given" was a coined noun for expected fantasy points. David,
2026-08-08: *"wtf is a JOB?? are you using any of your football context research?"*

## Evidence

**1. The hobby's vocabulary, taken from its own sources, not invented.** Written up in
`craft/how-the-hobby-speaks.md`. Volume is spoken as a **rank or a share**, never as points per
game. The metrics practitioners quote, with the bars they quote them against:

| metric | bar | source |
|---|---|---|
| target share | >20% → WR1/WR2 outcomes; <10% rarely rosterable; ~26% = high-end WR2 | Fantasy Footballers |
| snap share | 70%+ baseline for consistent production | Fantasy Life |
| targets per route run | **≥20% — 92% of WR2-or-better finishers since 2006 cleared it** | Fantasy Footballers |
| yards per route run | stabilises at 180+ routes; rookie yr-1 avg 1.37; **under 1.00 is dire** | Fantasy Footballers |
| bell cow | 70–75% snaps; only ~4 backs a season clear 75% | Fantasy Points |
| RB1 volume | 280+ touches appeared in 8 of 12 RB1 seasons | Fantasy Points |

**2. The data speaks all of it.** 7,113 weekly rows in `playerprofiler.db` with routes, targets,
target share, snap share and touches fully populated. Validated in both directions before use: the
2025 YPRR leaders come back Nacua 3.64, Smith-Njigba 3.50, Kincaid, Flowers, St. Brown; TPRR
leaders Nacua, Smith-Njigba, St. Brown, Rice, Chase. Population: YPRR median 1.45, TPRR median
19.3% with 42% clearing the published 20% bar.

**3. "Alpha" is relative, and the literature's bar was wrong for it.** A flat 25% target share
denies Rome Odunze the word; he leads Chicago outright at 23.6% against DJ Moore's 16.2%. Alpha is
now computed as the No. 1 target share in a player's own offence, verified against the team board
before the sentence was allowed to exist. David identified this before the measurement did.

**4. What David confirmed, twice, and it is a form not a fact.** *"this is great"* and *"i like
this a lot too"* — both times pointing at **the interpretive clause**, not the metric: *"elite
per-route production in a part-time role"*, *"under the line where analysts stop defending a
receiver"*, *"both alphas in their offenses"*, *"past the 280-touch marker"*. Every one names the
bar it rests on. **The atom of value is a scouting sentence with the numbers embedded.**

## Proposal

A scouting report of his own roster, in the units the position is discussed in.

- **Three panels** — receivers and tight ends by snap share × yards per route; backs by snap share
  × touches a game; quarterbacks by attempts × expected points, each with the published reference
  lines drawn and labelled on the figure. **The whole league sits behind his players**: lighter grey
  for unrostered, darker for another roster, his in position hue. Every mark names itself on hover,
  tap, or arrow-key traversal.
- **A card per player** carrying a generated read — computed from the same bar it names, never
  hand-written — with the evidence beneath it.
- **An expansion per player**: opportunity and efficiency metrics with ladder ticks marking a
  top-12 number, a top-24 number and this league's starter cut; weekly snap-share and target-share
  lines on a fixed 0–100% scale; and the dynasty profile — draft capital, breakout age, college
  dominator, and the best comparable.

## Prototype

`proposals/019-on-the-field/index.html`; data from `build.py`; label placement from
`kit/labeler.mjs`. Serve with `node tools/serve019.mjs` — never `python3 -m http.server`, which
caches and put a blank page in front of the client on 2026-08-07.

**Verified at 1440 / 1024 / 390:** no page overflow, **no text under 12px as rendered**, three
panels, 22 of his 27 players drawn and labelled, zero console errors, failure state fires on broken
data and clears when restored.

## Costs

- **Ownership is 47 days stale** and carries **no waiver state** — the snapshot has no
  `free_agent` field, so a player on waivers and a long-term free agent are the same dot. Stated on
  the surface; it is an engineering ask.
- **Three label-over-mark overlaps remain** on the dense receiver panel, down from 49.
- **2025 tape in August 2026.** A role can be reassigned in camp and the app's depth-chart feed has
  been static since 2026-03-14 (relay 017 R4).
- **Headshots come from sleepercdn**, keyed by the sleeper_id the app already stores, 22/22
  available. The app has the mount and an empty cache directory, so it renders initials today.
- **No charting library exists in the product** — four runtime dependencies, no viz layer — so none
  of this is directly liftable into the React codebase.
- **Five of his players have no 2025 tape** and are named rather than plotted.

## Open questions

1. Is "elite / top 24 / starter line" the right ladder, or should the rungs carry different names?
2. Should the ordinary players' generated reads be tightened further — three of the eleven still
   read similarly to one another.
3. Does the market/model pair belong on this surface at all, or is it purely a tape surface?
