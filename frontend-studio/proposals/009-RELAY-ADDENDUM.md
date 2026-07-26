# 009 — Relay addendum: one correction to the closing note

*Authored 2026-07-25, after 009 crossed. **Authorised by David and CROSSED to the crew 2026-07-25** (relayed to all three panes, verified in each buffer). Corrects a figure in `009-RELAY.md`, closing section
("Note on what I did not claim"). No item P1–P6 is affected.*

## What was wrong

The closing note reported the age contamination of the model-vs-market gap as **r = +0.313 in the
xVAR lane** and **+0.218 in the DVS lane**. Both were computed over a population that **included the
fifteen players described in item P2** — the ones graded `ACTIVE_B` while returning `null` for both
value fields, whose null the league layer stores as `0.0`.

Those coerced zeros are ranked as though they were genuine low opinions, so they sit inside the very
population the correlation was measured over. I flagged this to David as a possible defect in my own
reported numbers and had not re-run them at the time 009 crossed. I have now.

## The corrected figures

| lane | as relayed (zeros included) | corrected (zeros excluded) | n |
|---|---|---|---|
| **xVAR** | +0.313 | **+0.340** | 269 → 254 |
| **DVS** | +0.218 | **+0.218** (unchanged) | 242 |

Two things to note:

- **The DVS figure was never affected.** Those fifteen players have no dynasty value score at all, so
  they were already excluded from that lane by construction. The +0.218 stands exactly as relayed.
- **The xVAR figure moves up, not down.** Removing the coerced zeros *increases* the measured age
  contamination in that lane from +0.313 to +0.340 — so the relayed number slightly **understated**
  the problem rather than overstating it.

## What this changes

**Nothing in P1–P6, and nothing in the argument.** The point the closing note was making — that the
DVS lane is materially better matched to a dynasty price than the xVAR lane the league layer actually
uses — is **strengthened**. The gap between the two lanes widens from 0.218 vs 0.313 to 0.218 vs 0.340.

The qualitative claim also stands unchanged: age *contaminates* the model-vs-market gap and does not
*explain* it. Both correlations remain modest.

## Method

Ranks computed within position in both lanes over rostered players holding a market price; gap =
market rank minus model rank; Pearson r against age, pooled across QB/RB/WR/TE. The corrected run
drops the fifteen `ACTIVE_B`-with-null players identified in P2. Reproducible from the same artifacts
named in `009-RELAY.md` — the on-disk `league-20260724T132000Z` run plus the 2026-07-24 FantasyCalc
cache.

**Asked:** nothing. This is a correction to my own arithmetic, issued because the original figure
went out with a caveat I had not yet discharged.
