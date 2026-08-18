# The domain foundation

**Standing, every Studio session.** David, 2026-08-17: *"make this research really important for
all Studio sessions."* Built to his layering: **standard fantasy → dynasty → advanced statistics →
our special sauce.**

`PRODUCT_BRIEFING.md` says what the app is. This says what the **domain** is. Both are ground truth.

## Use it in this order

1. **`facts.json`** — the register. Machine-readable, graded, dated. **This is the source of
   truth**; every prose number in the layer documents below is derived from it and can go stale.
2. **`node tools/foundation-check.mjs <file>`** — run before showing David anything. Convicts
   already-refuted claims and prints the correction. `--selftest` proves it is calibrated in both
   directions.
3. The layer documents, when you need the reasoning rather than the number.

| file | layer | author |
|---|---|---|
| `L1-standard-fantasy-football.md` | the baseline every manager knows | researched |
| `L2-dynasty.md` | what changes in dynasty; picks, windows, the trade calendar, the value ecosystem | researched |
| `L3-advanced-stats.md` | opportunity vs efficiency, stability thresholds, sources, how to render them | researched |
| `L4-our-special-sauce.md` | what our model is, how good it is, what is genuinely ours | **measured in-house** |
| `age-curve-measured-in-house.md` | where the age cliff actually lands, and the regression baseline | **measured in-house** |

## The precedence rule

**Intuition < published research < Studio's own measurement.** If an in-house measurement
contradicts a researched fact, the measurement wins: update `facts.json` with its date, grade and
the tool that produced it. Do not argue with it in prose, and do not pass the losing claim to David.

This is not hypothetical. The dynasty layer returned *"the running-back cliff is 27; 26 is flat."*
Measuring the app's own eight seasons put the wall at **29**, with 26 barely distinguishable from
25. The researched claim never left the studio.

## Grades — every fact carries one

- **`measured-in-house`** — computed from the app's own data with controls run in both directions.
- **`published-primary`** — traced to the original research, not a secondary article.
- **`published-secondary`** — widely repeated in the hobby; the source is an article.
- **`unverified`** — encountered, not confirmed. **Never quote without saying so.**

## What this cannot do

The check matches known-refuted claims by pattern. It cannot verify a *new* number, cannot read a
chart, and **cannot catch an invented word** — which is the failure that cost the most (2026-08-08,
a coined unit of vocabulary carried two whole surfaces). It is a floor. The ceiling is still
research before designing.

## Keeping it alive

Each session: if you measured something the register should hold, add it with its grade and its
tool. If a fact here is contradicted, correct it at the source and note where the stale copy was
fixed. **The test of whether this is working is not that the files got bigger — it is whether a
number reaches David that the register already knew was wrong.** Today that number was one:
the 180-route YPRR threshold, measured wrong in-house on 2026-08-09 and cited for eight more days
because nothing made the correction fire.
