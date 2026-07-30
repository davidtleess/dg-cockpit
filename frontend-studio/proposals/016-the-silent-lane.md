# 016 — The silent lane: why the front door reads as a market feed

**Status: measured finding. Nothing relayed, nothing approved.**
Figure: `proposals/016-silent-lane/figure.html` · data: `lanes.json`, generated from the app's own
capture databases.

**This is evidence for a direction David already ruled, not a new one.** On 2026-07-22 he ruled *the
front door is STATE, not CHANGE*. That ruling was reached by reasoning about the manager's questions.
This is the same conclusion arriving from the data, which matters because a measured argument survives
a disagreement that a preference does not.

## Problem

The app's default screen — the first thing the user sees every morning — is split into **"Model output
changes"** and **"Market movement."** Measured live on 2026-07-30:

| region | rows rendered | height |
|---|---|---|
| Model output changes | **0** | **71px** |
| Market movement | **36** | **1,401px** |

The model region's copy reads *"Projections held steady — no player movement on this tape."*

**That 20:1 split is not a layout decision. It is what the data does.** Read from
`model_forward_capture.db` and `fc_forward_capture.db` across **36 overnight transitions**
(2026-06-24 → 2026-07-30):

| lane | transitions | silent | median players moved |
|---|---|---|---|
| our model | 36 | **33 (92%)** | **0** |
| the market | 36 | **0 (0%)** | **456** |

The market has moved someone every single morning without exception. The model has moved nobody on 33
of 36. Its last change was **2026-07-10 — twenty days ago.**

## Evidence

`proposals/016-silent-lane/figure.html` — both lanes, one bar per overnight transition, on one shared
scale. Every bar names its own date and count on hover. A measured zero renders as a baseline tick
rather than as nothing, so *silent* cannot be misread as *no capture*.

Squint render of the live front door: `analysis/app-daily-what-changed-blur.png`. Blurred to the point
where type dissolves, the page is **a single column of amber sparklines** — the market lane doing all
of the visual work, with no blue anywhere in the row area.

## Why it matters

David's standing doctrine, twice-stated: *"a market move alone is not actionable; the juxtaposition is
the product"* (2026-07-21), and *"it's important that we show a juxtaposition of our rank or value
compared to the market rank or value, otherwise I wouldn't know if we agree or disagree with the
signals"* (2026-07-21, after a market-only surface had to be sent back).

**The shipped front door cannot satisfy that on 92% of mornings, by construction.** A region keyed to
model *change* has something to show only on the days the model moves. The juxtaposition is therefore
structurally absent from the product's opening screen on almost every day it is opened.

**The fix is a change of quantity, not of layout.** Model *position* — our rank beside the market's —
exists every single day, because a rank does not need to have moved to be true. That is precisely what
006 and 014 are built on.

## The follow-on, and it changes what 016 asks for

Pursuing "is anything else on this screen keyed to a quantity that is usually zero?" turned up
something better than another zero: **a condition that is never true.**

The front door already contains a component built for exactly the case measured above —
`BaselineRosterRows`, whose own comment reads *"Quiet-day baseline (spec v3 key-state 1): David's
roster locked flat."* It renders his 27 players when the model has nothing to report.

**It cannot fire.** Its gate is `moveCount === 0`, where `moveCount` sums the two *market* lists and
the model list (`DailyWhatChanged.tsx:304, :324, :360`). Rendering the quiet-day baseline therefore
requires the **market** to have moved nobody — which has happened on **0 of 36 mornings**. Live today
the producer supplied all 27 rows and `moveCount` was 51, so none rendered.

**This makes 016 a much cheaper ask than it was.** The original argument was that the front door is
keyed to the wrong quantity, which implies a redesign. This says the team already built the right
thing for the common case and gated it on the wrong condition. Issued as `016-RELAY.md` Q1.

**A hypothesis I had and killed before it reached the relay:** the same rows ship
`model_lane_value: 0` and `market_lane_value: 0`, hardcoded in the producer, for all 27 players. I
expected a user-facing zeros defect. It is not — `BaselineRosterRows` never reads those fields and
renders neutral dashes. Reported as low severity for the next consumer rather than as the defect I
went looking for.

## Costs — honest

1. **Two of the three model changes are suspect, and they cut in my favour, so they deserve naming.**
   06-26 (430 players) and 06-27 (79) fall in the first four days of capture and may be
   initialisation rather than genuine revision. If so, genuine model revisions are **1 in 36**, not 3.
   I have not established which, and the headline figure deliberately uses the **weaker** claim.
2. **This is not evidence the model is broken, and I want to be explicit.** A dynasty valuation
   *should* be stable; a model that churned daily would be the more alarming artifact. The finding is
   about which quantity the opening screen is keyed to, not about model quality.
3. **It overlaps a relayed finding.** 005 already reported the frozen model lane and 011 relayed the
   DVS ceiling. What is new here is the *front-door consequence* and the region-height measurement —
   not the staleness itself.
4. **No prototype is attached, deliberately.** The alternative has already been built twice (006's
   approved state-first front door, 014's two-lane roster). Building a third would be redrawing rather
   than arguing.

## Open questions

1. Whether the model is *intended* to move daily — if it is, 92% silence is a pipeline finding for
   engineering rather than a design one, and the right response changes completely.
2. Whether the two June changes are real revisions or capture initialisation.
