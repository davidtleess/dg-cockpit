# 015 — The evidence card nobody can read

**Status: defect report, measured and reproduced. Relay authored (`015-RELAY.md`), NOT authorised.**

## Problem

The player evidence card — the product's flagship two-lane player view, and the surface the entire
"grounding" thread has been about — renders its model and market lanes as **unlabelled values run
together into a single string**. For Josh Allen, the most valuable player in the league:

```
model lane   ENGINE_BACTIVE_B9948.23——19.901—
market lane  FantasyCalc10183Overall 1Position 12026-07-29T13:00:10.941198+00:00market_overlay_static_caveat…
```

Measured: `.dg-two-lane__facts` holds **8 bare `<span>` children in the model lane and 7 in the market
lane, all `display:inline`, with zero `<dt>` elements**. The labels are not hidden by CSS — they are not
in the DOM at all. Reproduced on three players including a fully-modelled one, so it is not an artifact
of a degraded record.

Alongside it, **thirteen internal snake_case identifiers** reach the user verbatim across the card and
Trade Lab, including `decision_supported_false` — the product's own central doctrine, rendered as a
field name.

## Evidence

Screenshots: `analysis/app-player-detail-sharp.png`, `analysis/app-trade-lab-sharp.png`.
Full item list, severity ranking and exact repro paths: `015-RELAY.md`.

## How this was found, because the route matters more than the finding

It came out of a craft instrument, not a bug hunt. `tools/craft-profile.mjs` measured this product
against three category leaders on every token mechanism and found **none of them separates us**
(`craft/craft-profile-findings.md`) — so the deficit is composition. That produced `tools/squint.mjs`,
the Nielsen Norman squint test mechanised, which on Studio's own 014 found the page's central argument
was the first thing to dissolve at a glance.

**The generalisation was the valuable step:** if the model-vs-market comparison disappeared at a glance
on my page, what happens on the shipped ones? Running that question across the live app is what walked
into P1.

**Two instrument defects were caught on the way, both mine, both the same family — the tool choosing
its own population:** a fixed 2.2s wait captured Roster Audit's *loading screen* and dutifully reported
lane counts for 23 elements that were not the surface (now polls until the DOM settles and the loading
copy clears); and a constant "14 model / 2 market" across five different screens turned out to be the
nav rail and status pill, not content (now scoped to `<main>`).

## Proposal

No design proposal. **This is a defect report and the fix is engineering's to choose** — the markup is
already a `<dl>`, so `<dt>`/`<dd>` pairs would close P1 and P6 together, but that is their call.

Studio deliberately did **not** design a replacement card. The 2026-07-22 governing method says a
surface must carry a thesis, and there is a real design conversation to be had about what this card
should say — but it cannot start while the current one is unreadable, and proposing a redesign would
bundle a taste argument into a defect that stands on its own.

## Costs — honest

1. **P5 carries an observation, not a defect** — that Trade Lab renders zero lane-hue elements — and it
   is marked as such in the relay. Whether the constitutional hues *should* appear there is a design
   judgement, and Studio has flagged it without asserting it.
2. **Studio cannot see the code that produces these lanes** and has not looked. Every claim is from the
   rendered DOM, so the *cause* is unknown and the relay does not speculate about it.
3. **The severity ranking is Studio's**, and P1's "critical" is a judgement about user impact on a
   single-user app, not an outage.

## Open questions

1. Whether the missing labels are a regression or were never built — visible from the code, not from
   the DOM.
2. Whether the snake_case codes are placeholders awaiting copy, in which case P2 is a known gap rather
   than a defect.
