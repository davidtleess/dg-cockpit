# 004 — Us against the market
*(opened as "The Noise Floor"; the title changed with the argument — see the revision log at the foot)*

*Studio, 2026-07-21. Originated in this lane; nobody asked for it.*
*Relay crossed to the crew 2026-07-21 (David confirmed directly); verdicts outstanding.*

**Current prototype:** `proposals/004-noise-floor/prototype-v4.html` — position-faceted model vs.
market. **KEPT by David** 2026-07-21 ("pretty cool — we can keep this and iterate later"): a park,
not a sign-off.

**Superseded, kept for auditability:** `prototype.html` (v1, market-only) · `prototype-v2.html`
(v2, adds the juxtaposition) · `prototype-v3.html` (v3, consistent instrument, time on the wrong axis).

**Engineering brief:** `proposals/004-RELAY.md` — six items, **N0 (QB/TE position skew) highest
severity**. **Read the revision log at the foot of this file before the body:** the Problem and
Proposal sections below are v1 and were substantially superseded by client review.

**Evidence captures:** `proposals/assets/004-noise-floor/`

---

## Problem

**Ranking the tape by size of move is, in practice, ranking it by cheapness.** The result is that
the app's daily movement list systematically promotes the least meaningful moves and buries the most
meaningful ones — every day, structurally, not occasionally.

Three facts, all measured against the app's own `fc_forward_capture.db` (404 players with a complete
28-day series, 2026-06-24 → 2026-07-21):

**1. Everything moves, every day.** Across 27 consecutive comparison days, ~100% of players changed
value every single day (worst day: 95.7%). There are no flat days and no flat players. "What changed"
is, by construction, "everything." A count of moves is therefore not information — today's masthead
reads **"Moves on the tape: 52"** on a morning when the model didn't move at all and the median
player's move was **1.05×** his own ordinary day.

**2. Baseline volatility varies ~28× across the price range, and it is a stable property.**

| Player value | Median *normal day* (median absolute daily % change) |
|---|---|
| under $200 | **21.00%** |
| $200 – $750 | 10.15% |
| $750 – $2,000 | 1.51% |
| $2,000 – $5,000 | 1.26% |
| over $5,000 | **0.74%** |

Spearman correlation, log(value) vs. daily dispersion: **−0.709**. This is not noise about noise —
split-half persistence (first 13 days vs. last 13 days, n=404) is **Spearman 0.913**. A player's
price volatility is one of the most stable quantities in this dataset.

**3. The two rankings disagree, permanently.** Comparing "rank by dollar delta" (what ships) against
"rank by multiple of the player's own normal day," across 14 consecutive days:

- Mean top-10 overlap: **3.6 of 10**
- Mean top-25 overlap: **11.5 of 25**
- The #1 item differed on **13 of 14 days**

### What it costs the user, today

Screenshot: `assets/004-noise-floor/live-01-default.png` (live app, 2026-07-21).

The roster list is numbered 1–10 by dollar delta. Jaxson Dart leads at −113, which is **2.0×** an
ordinary day for him. **Omar Cooper sits ninth at −47 — which is 3.6× his ordinary day and his
largest single-day move in the entire 28-day capture.** He is the one genuinely unusual thing on
David's roster and he is rendered smallest, lowest, and in identical type to eight non-events above
him.

League-wide it is worse. In the shipped top-movers list, **Josh Cameron (+292.9%) ranks 9th**, below
Josh Allen (+1.3%). Both moved about $125. A reader cannot tell from the list that one of them
nearly quadrupled and the other did nothing.

**The obvious fix is also wrong.** Ranking by percent inverts the same error: it fills the list with
sub-$350 flotsam. Kareem Hunt at −33.8% would rank 5th on a day that was, for him, a **1.0×** —
literally average. Neither raw scale works, because there is no single scale. Each player needs his
own.

**The sparkline in each row cannot rescue this.** Each is auto-scaled to its own min/max, so a
player who wobbled ±0.5% and one who doubled render as identical full-height zigzags. The chart
normalizes away the exact quantity the list needs.

---

## Evidence

**Nobody in this category does significance-weighting — but the app's own data source does it
privately.** FantasyCalc's live payload (verified 2026-07-21, 463 players) carries per player:

- `displayTrend` — a boolean, **true for only 26 of 463 players (5.6%)**. It is FantasyCalc's own
  judgment on which trends are worth showing at all. It is not a top-N cut: the flagged set spans
  values from 1,104 to 7,491.
- `maybeMovingStandardDeviationAdjusted` — an explicit per-player noise floor that **widens as
  players get cheaper** (2 for the top ~25, rising to 5 at rank 125+). Independent third-party
  corroboration of the 28× spread measured above.
- `maybeTradeFrequency` (399/463 populated) and `maybeRosterPercent` (399/463) — the liquidity and
  ownership signals that finance uses to separate a real move from a thin-market artifact.

The app's capture retains `market_volatility` (populated on ~16% of rows) and **does not retain
`displayTrend`, `maybeTradeFrequency`, or `maybeRosterPercent`.** The app fetches the vendor's answer
to "is this worth showing?" every morning and discards it, then shows all 463 moves undifferentiated.

**Competitors (researched, cited):**

- **KeepTradeCut** ships `30 DAY TREND` as raw signed integers and `Top 5 Risers (30 Days)`. Captured
  live 2026-07-21, all five of their risers rank **293rd, 302nd, 312th, 331st, 338th** overall. A
  size-of-move leaderboard on the largest dynasty value site is, in practice, a rookie-and-fringe
  leaderboard. This is the same defect, in the wild, at scale.
- **DynastyProcess** ships no change columns at all. **Sleeper**'s trending endpoint returns raw add
  counts with no denominator. **ESPN/NFL.com** use % change only on *ownership*, never on value.
- Nobody displays a per-player volatility band. The category has not solved this.

**Finance solved it, and the vocabulary is settled.** Finviz ships a signal literally named
**"Unusual Volume"** (relative volume vs. 3-month average). TradingView ships `Rel Vol at Time`.
Barchart's unusual-options-activity table gates on Vol/OI ≥ 1.25 — today's activity over that
contract's own base. The retail convention is a **multiple** ("3× its usual"), and no consumer
product surfaces sigma or z-scores. Practitioner bands: >1.5 elevated, >2 unusual, >3 likely a
catalyst.

**Consumer products already ship personal-baseline flags.** Whoop's Health Monitor compares each
metric to that user's own trailing baseline and badges anything outside it. Oura's Symptom Radar
ships three named states — *No signs / Minor signs / Major signs* — and surfaces contributing
metrics **only when signs exist**, so the quiet state is short by design. Amplitude's anomaly view
states it plainly: *"If no orange dots are present, all data points are within the confidence
interval."*

**Heuristics.** Nielsen Norman Group on empty states: a brief explicit system message ("no records
for the selected range") *increases* confidence in the result. The current surface does the
opposite — it pads a quiet morning with 52 counted "moves," which trains the user to distrust or
ignore the count.

---

## Proposal

**Read every move against that player's own normal day, and rank by that.**

1. **A per-player baseline.** For each player, the median absolute deviation of his daily percent
   changes across the captured window, scaled ×1.4826. The median rather than the mean because one
   genuine jump would otherwise inflate the baseline and mask the next real move.
2. **One ranking: multiple of a normal day.** `|today's % change| ÷ normal day`. Sorting by this is
   the default; sorting by dollars and by player rank remain available as sorts, not as separate
   views.
3. **Three prose bands, in the market's own words** — under 2× *inside his normal range*; 2–3×
   *unusual for him*; 3×+ *well outside his range*, or *biggest move in 28 days* where literally
   true. Never a z-score, never a sigma, on screen.
4. **A verdict headline that is allowed to say nothing happened.** "Quiet on your roster." /
   "One move on your roster." The count of *unusual* moves replaces the count of *all* moves.
5. **The signature visual: a shared-scale deviation lane on every row.** A shaded lane = his routine
   range; a single mark = today, placed left of centre if the price fell and right if it rose. Every
   row uses the same axis, so rows are comparable — which the current per-row sparklines are not.
   Direction is encoded by **position, never by hue** (per the standing ruling: green/red is
   reserved for rank-movement arrows only).
6. **Raw grounding beside the normalized reading**, per the Savant device: `normal day ±0.62%` in
   mono under every plot. Every number readable three ways — raw, as a multiple, and as a position.

### Why this is a materiality ranking, not a curiosity ranking

The obvious objection is that normalizing will surface trivial moves on cheap players. It does not.
A 3× move is worth roughly the same in dollars at every price level:

| Player value | Median dollar value of a 3× move |
|---|---|
| under $200 | ~$71 |
| $200 – $750 | ~$101 |
| $750 – $2,000 | ~$59 |
| over $2,000 | ~$122 |

A ~2× spread, against the 28× spread in percent volatility. Ranking by the multiple approximately
equalizes dollar impact — which is exactly what ranking by raw dollars fails to do once you account
for how often each player moves that far.

---

## Prototype

`proposals/004-noise-floor/prototype.html` — self-contained, real data, no network dependency
(fonts and data are local; headshots load from the running app and fall back to initials).

Built on the app's own token system and typefaces so it reads as the product, not as an outsider's
mockup. States captured in `assets/004-noise-floor/`:

| Capture | What it shows |
|---|---|
| `proto-01-top.png` | The verdict headline and the day's whole market on one axis |
| `proto-02-expanded.png` | Inline row expansion — Cooper's month-long slide, today's step drawn heavier |
| `proto-03-sort-dollar.png` | **The argument.** Sorted the way the app sorts today: eight consecutive "inside his normal range" rows above the one real event |
| `proto-04-sort-signal.png` | The same 26 players, ranked by signal |
| `proto-05-league.png` | Around the league |
| `proto-07-mobile.png` | 390px |

Detail expands **inline, in the row**, pushing the next row down — per the standing preference, not
a tray and not a sidebar.

---

## Costs — honest

**Statistical limits I cannot design away.** These are real and the surface discloses them:

- **28 days is a short window.** A baseline built on it is provisional. It firms up daily.
- **Masking.** A player's first genuine jump inflates his own baseline for the following month, so a
  second real move scores lower than it should. MAD reduces this substantially versus standard
  deviation (breakdown point 0.5 vs. ~0) but does not eliminate it.
- **The ghost effect.** With a flat equal-weighted window, a shock leaves the window abruptly on day
  N+1, stepping the baseline with no change in the underlying process. An EWMA or Qn estimator is the
  known remedy; I am not proposing one yet on 28 days of history.
- **MAD can degenerate to zero** if more than half the window is tied — and then *everything* flags.
  It does not happen today (0 of 404 players; worst case 8 tied days of 27), but it is a live risk in
  a deep-freeze stretch. The guard should be **holding the player out with an explicit "no usable
  baseline" state, not flooring the denominator.** A denominator floor is common engineering practice
  but has no basis in the robust-statistics literature; the literature says switch estimator.
- **A ~5× ceiling.** With n=27, a z-type score against a window containing the scored point is
  bounded near 5. My display clamps at 6× and labels the ends `6×+` rather than implying the scale
  continues.

**What it breaks.**

- The masthead's "Moves on the tape: 52" number goes away. It is the current hero figure.
- The list's 1–10 ordering changes, which changes what a returning user expects to see at the top.
- It adds a computed field to a payload that currently ships raw deltas. It is cheap — a median over
  a series the app already stores — but it is new surface area, and it needs a defined state for
  players with insufficient history.

**What I am unsure of.**

- **The 2× / 3× boundaries are borrowed, not derived.** They come from retail-finance practitioner
  convention, not from this dataset. They produce a sane volume today (42 players past 2×, 11 past
  3×, of 404) but I have not calibrated them against realized outcomes, and I could not — the
  realized-outcome loop is inactive until September.
- **Whether a 1-day window is even the right unit.** FantasyCalc publishes a 30-day trend and gates
  *that*. A daily surface may be the wrong frame in an off-season where the real signal is a
  multi-week drift — Cooper's chart is a clean month-long slide, and the "biggest single day" framing
  arguably undersells it. A drift detector may matter more than a spike detector. I have not built one.
- Whether trade frequency should gate the flag (a move on an untraded player is a thin-market
  artifact) or merely annotate it. I show it; I do not gate on it.

---

## Open questions

1. Is `displayTrend` dropped from the capture deliberately or incidentally? If deliberately, the
   reason changes what I should propose.
2. Does the model lane have a comparable dispersion story? Model deltas were empty today; I have
   only looked at market.
3. Is there an appetite for the drift frame (multi-week) alongside or instead of the daily frame?

---

# Revision log — what David's review changed

The proposal above is the first version. Two rounds of client review reshaped it substantially;
both prototypes are preserved so the reasoning is auditable.

## v2 — the juxtaposition (`prototype-v2.html`)

David, on v1: *"I have a bit of concern about the practicality. A player could move after a big week,
or after an injury to someone ahead of him on the depth chart, or after earning a starting role — but
should I really be ACTING on those signals? I also think it's important that we show a juxtaposition
of our rank or value compared to the market rank or value, otherwise I wouldn't know if we agree or
disagree with the signals."*

He is right, and the second half was already standing doctrine that v1 violated: v1 was a market-only
surface. Changes:

- **The move stopped being the finding.** Detecting an unusual move is now a filter that decides what
  is worth printing. The headline is the model-vs-market gap, because that comparison is the only
  thing on the screen a user cannot get from news or Twitter.
- **Every row leads with both lanes**: our percentile and the market's on one scale, the span between
  them shaded, and a ghost mark showing where the market sat at the previous capture.
- Source: `app/data/market_divergence_history.db` — 10 captures, `model_percentile`,
  `market_percentile`, `model_minus_market_delta`, and the app's own signal vocabulary
  (`MODEL_HIGH_MARKET_LOW`, `MODEL_LOW_MARKET_HIGH`, `INSIDE_BAND`), which the prototype translates
  into prose rather than inventing new terms.

**This immediately falsified v1's headline.** v1 led with Omar Cooper as the roster's biggest unusual
move. With both lanes visible he is a non-event: we have him 75th percentile, the market 76th — the
market simply repriced into line with us. The real item was **Kaelon Black**: a standing 33-point
disagreement (we 73rd, market 40th) that the market moved *further away from* that day.

## v3 — the instrument (`prototype-v3.html`) — current

David, on v2: *"The top header is a lot better but still feels like we're making a HUGE statement
about one player at the top — what if there's not an outlier and it's just a normal day or week? Are
we still going to have a huge headline about a player that barely moved? I'd think a more consistent
approach to that section would be just as valuable — consistent color coding and ways to show the
shape of the data over time. I'll recognize the anomalies and outliers — I just need the mechanism
and design so I can see it."*

This lands on Studio's own error. 004 v1 criticised the app's "Moves on the tape: 52" for
manufacturing significance on a quiet day, then v2 committed the same fault in prose by always
naming a protagonist. Changes:

- **The narrative headline is gone.** A fixed seven-cell state strip renders the same shape every
  day; only the counts change.
- **The hero is now an instrument**: one small-multiple card per player, gap-over-time, all on one
  shared scale, sorted by a stable rule (widest disagreement first). Blue fill above the zero line
  means we rate him higher, amber below means the market does — the app's own lane tokens, so the
  encoding is learned once and means the same thing everywhere. Position relative to the zero line
  carries the same information as the hue, so nothing depends on colour alone.
- Palette checked rather than eyeballed: colour-blind separation ΔE **22.5** (protan) / **22.8**
  (tritan) against a threshold of 8; normal-vision ΔE **24.3**; both clear 3:1 on the surface. The
  validator's categorical lightness-band check fails, but it is scoped to categorical palettes and
  this is a diverging pair with a neutral midpoint.

**The data supports his scepticism about a daily frame.** Across the 10 captures, 22 of 23 roster
gaps moved 8 points or less; most moved 2–5. The gap is a stable structural fact, not a daily event.
Only one card visibly drifts (Dillon Gabriel, −1 → +13) and it is legible without any label —
which is the design working as he specified.

**And the consistent view surfaced the biggest finding of the engagement**, which no
player-by-player reading would have produced: the divergence is systematic by position. Median gap
is **+13.6 for TEs** and **−10.8 for QBs**, with the QB distribution almost entirely one-sided. This
may be a superflex scaling artifact rather than an analytical edge — it is filed as **N0** in the
relay, the highest-severity item there, and it is an engineering question, not a design one.

## v4 — the right axis (`prototype-v4.html`) — current

David, on v3: *"This feels worse. All the trend lines are flat. Perhaps it's just the data we're
looking at, but this doesn't feel right. Overall you're thinking the right way about our
juxtaposition — but the design is largely hiding anything of value in the data. You might want to
take a step back and think for a second or two before iterating again."*

Correct, and measurable. I put time on the axis of a quantity that does not move:

| Where the variance is | Magnitude |
|---|---|
| Across time — one player's gap over 10 captures (median travel) | **3.9 pts** |
| Across players — spread of gaps today (10th–90th percentile) | **40.0 pts** |

The overview spent its entire vertical axis on roughly a tenth of the available signal. The
tell was already on the record: **the biggest finding of the day — the position skew — came out of a
table printed in a terminal, not out of the visualisation.** A design that cannot show the most
important thing in its own dataset is the wrong design.

Changes:

- **Time is removed from the overview** and lives only in the per-player drill-down, where the small
  travel is the actual subject. Reporting the flatness honestly beats plotting it repeatedly.
- **The overview is now faceted by position** — four panels, our percentile against the market's,
  with the agreement diagonal in each. The structure that the terminal table found is now the first
  thing on the screen: the QB cloud sits below the line, the TE and WR clouds above it.

  | Position | Above the agreement line |
  |---|---|
  | QB | 12 / 44 (27%) |
  | RB | 45 / 79 (57%) |
  | WR | 93 / 122 (76%) |
  | TE | 44 / 54 (81%) |

- Roster players are drawn bright over a dimmed league; the three furthest from the diagonal in each
  panel are named by a fixed rule, with the table below naming every one.
- The state strip and the consistency requirement from v3 are unchanged — the four panels render the
  same way every day.

## Still open after v4

- **Does a daily surface earn its place at all?** The gap barely moves day to day. The honest reading
  is that this is a standing board consulted when wanted, not a morning tape. Put to David; not yet
  answered.
- Whether position is the right cut, or whether the roster wants slicing another way (by tier, by
  contend/rebuild role). Put to David.
- Whether the position skew should be corrected, surfaced, or both, depends entirely on the answer
  to N0.
