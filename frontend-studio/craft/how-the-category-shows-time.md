# How the category shows data that accumulates

**Looked at 2026-08-09 with a browser, not a search engine**, on David's instruction (*"just look at
dynasty sites like dynasty nerds, footballguys, playerprofiler, KTC, Sleeper"*) after he set the
criterion *"the thing needed is surfaces that will become valuable with more and more data."*

**Scope, stated honestly.** KeepTradeCut rankings, KTC player page, KTC trade database,
PlayerProfiler player page. Dynasty Nerds' August guidance read via search, not browsed.
**Footballguys not reached. Sleeper's app is login-gated and was not seen.** Captures:
`ktc-rankings.png`, `ktc-player-jeanty.png`, `ktc-tradedb.png`, `pp-jeanty2.png`, all in `craft/refs/category-2026-08-09/`.

**Contamination note, and it is a repeat class:** PlayerProfiler served a full-screen "GO AD-FREE"
modal over the whole page; the first capture is unusable. KTC did the same thing on 2026-07-30 with
its "Your Thoughts?" modal. **Dismiss the modal before capturing, every time, on every one of these
sites.**

---

## 1. The settled pattern for a metric over time — KTC's player page

This is the category's answer and it is not in dispute. Four parts:

1. **One metric, one line.** Not a dashboard of small charts — a single big time series.
2. **A range selector**: `1 mo. · 3 mo. · 6 mo. · 1 yr. · All Time`, with one selected.
3. **A change readout for the selected range**, top-right of the chart: `▲ 574 / 6 MONTH CHANGE`.
   The delta belongs to the range the reader chose, not to a fixed window.
4. **The current value direct-labelled at the end of the line**, large — `7603` — rather than on an
   axis the reader has to trace back to.

Then it **stacks**: Dynasty Value, and immediately below, Positional Rank, in the identical
furniture with its own range selector and its own change readout.

**What this solves that matters for a compounding surface: there is no empty state.** A player with
two weeks of history has a short line. Nothing says *insufficient data*, nothing renders a
placeholder. The range selector degrades naturally because a range that does not exist yet simply
shows what does.

**And the accumulation is sold as credibility, not hidden as a caveat:** every page carries
*"crowdsourced from 26,369,404 data points (and counting)"*. The words **and counting** are the
whole idea — the product tells you it is getting better.

## 2. The row convention, confirmed again

KTC rankings row: `RANK | PLAYER + team | POS · AGE | TIER | 30 DAY TREND | VALUE`, with a faint
per-row sparkline at the right edge. Change is a single integer with a green ▲ / red ▼, not a chart.

**Change is exiled to a rail**, exactly as recorded on 2026-07-22: an `INSIGHTS` panel with
`TOP 5 RISERS (30 DAYS)` and `TOP 5 FALLERS (30 DAYS)`, five names each with a signed number. The
main surface is state; the rail is movement.

**Tiers are numbered** (`Tier 1` … `Tier 5`) — the form David rejected outright on 2026-07-15
(*"I have no idea what 1–9 means"*). **The category is wrong here and his objection stands.** Do not
copy this one.

**Player value is also quoted in pick currency**: `Current pick value: >2026 1.01` and
`Future pick value: >2027 Early 1st`. Translating a player into the draft-pick unit is the hobby's
own idiom and it is free grounding.

## 3. The profile genre — PlayerProfiler

A different job from the time series, and it is the Savant lineage David endorsed on 2026-07-15.

- **Every number carries its percentile in parentheses**: `BMI 32.1 (89th)`,
  `COLLEGE DOMINATOR 43.7% (96th)`, `COLLEGE YPC 7.0 (93rd)`, `COLLEGE TARGET SHARE 10.8% (83rd)`.
  Raw value and population position, always together, never one without the other.
- **A named comparable, given prominence and a face**: `BEST COMPARABLE PLAYER — LaDainian
  Tomlinson`, top-right of the hero. Naming comparables is the device David called *"a great call."*
- **Missing measurements render as dimmed, greyed icons** — Burst Score, Agility Score and Bench
  Press are drawn as inert circles beside the bars for 40-yard dash and Speed Score. Absence as
  missing, never as zero, done by the category without comment.
- Identity-dense bio in the hero: height, weight, BMI, draft pick with year, college, age.

## 4. THE GAP — the category has a trade surface and it has no memory

**KTC Dynasty Trade Database**: *"Real dynasty trades pulled from 200,813 real dynasty leagues"*,
25,000 recent trades, 500 pages. Filters are all about matching **your league's settings** —
quarterbacks (1, 2), PPR, teams, starters slider, number of assets. Rows are
`DATE | TEAM 1 RECEIVED | TEAM 2 RECEIVED | SETTINGS`, the two sides' assets facing each other,
players and picks in one list, league-format chips on the right.

It is a **comparables** tool, and a good one: it prices your proposed deal against what other people
actually agreed to.

**It never says what happened next.** No outcome, no follow-up, no what-those-assets-are-worth-now.
And it structurally cannot — it aggregates *across* two hundred thousand leagues and therefore
remembers none of them.

**Dynasty Genius holds the exact inverse:** one league, four seasons, **39 completed trades with
both sides captured symmetrically** (73 players and 92 picks, balancing exactly), a live ledger
through 2026-08-05, and 47 days of daily prices on two lanes.

**The design consequence:** copy KTC's trade row unchanged — it is the shape every dynasty manager
already reads — and spend the entire originality budget on the one column they cannot have.

## 5. What to take, and what to refuse

| take | from | why |
|---|---|---|
| range selector + change-for-that-range + value labelled at line end | KTC player page | the settled answer for a metric over time |
| short line rather than a placeholder when history is thin | KTC | the empty-state problem, already solved |
| stating the accumulation as a credibility line ("and counting") | KTC | a compounding surface should say so |
| raw value with its percentile in the same breath | PlayerProfiler | the grounding ladder David ruled on 2026-07-15 |
| named comparable, given real prominence | PlayerProfiler | confirmed device |
| dimmed marks for measurements that do not exist | PlayerProfiler | absence as missing, in the category's own hand |
| the two-sided trade row | KTC trade database | the familiar substrate |

| refuse | why |
|---|---|
| numbered tiers | David ruled against them 2026-07-15 and the reasoning holds |
| a trade surface that stops at the handshake | the whole gap; it is what we have and they do not |
