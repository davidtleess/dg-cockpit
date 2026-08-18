# The age curve, measured in-house — and why most published age-decline numbers are inflated

**Measured 2026-08-17.** Reproduce:
`python3 tools/does-the-age-cliff-land-where-the-code-says.py`

**Why this exists.** The product hard-codes age-cliff thresholds — **RB 26, WR 28, TE 30, QB 33** —
and the Layer-2 dynasty research came back with a contradicting figure for backs (26 flat, 27 the
drop). A shipped constant does not get corrected on a web citation. This measures it against the
app's own eight seasons of weekly data before anything is claimed. **The web claim was not
reproduced**, and neither was the code's threshold, quite.

## Method

`ff_opportunity` weekly 2018–2025 (**regular season only** — the source carries weeks 1–22 and
postseason weeks inflate per-game rates for players on good teams), PPR points per game, joined to
`contracts.date_of_birth` on `gsis_id`, age taken at 1 September of each season. Same player,
season N → N+1, bucketed by his age in season N, minimum 8 games in season N.

Controls ran before any real number: halving → −50%, doubling → +100%, zero base → guarded; 2025
scoring leaders came back McCaffrey, Nacua, Robinson, Gibbs, Allen at PPR magnitudes.

**One defect caught by the tool's own refusal.** The first run parsed zero birth dates — the source
stores `"November 29, 1988"`, not ISO — and reported *"no measurable transitions"* rather than a
clean pass. A pass on an empty population would have been a claim about something never examined.

## THE HEADLINE, and it is methodological

**The median qualifying player loses 17.1% of his points per game year over year, at every age**
(n=956, all positions and ages pooled). Conditioning on "played at least 8 games" selects players
who were healthy and productive, and next season they regress. **So most of any raw year-over-year
decline figure — including the ones the hobby publishes as evidence of ageing — is selection, not
age.** Every number below is therefore reported as a difference from that baseline.

## The result

Positive = better than the −17.1% baseline for a player of any age.

| pos | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 |
|---|---|---|---|---|---|---|---|---|---|---|
| **RB** | +20.5 | −0.5 | +1.5 | −0.6 | **−9.8** | −0.0 | −8.5 | **−32.1** | −8.0 | — |
| **WR** | +7.4 | −9.3 | +2.3 | +6.7 | **+10.6** | **−11.5** | −8.4 | −6.4 | −2.5 | −14.0 |
| **TE** | — | — | −16.8 | +5.1 | +13.5 | +12.6 | +4.4 | −7.3 | **−14.7** | +15.1 |

**Versus the shipped constants:**

- **RB 26 — the code is early, and it misses the real wall.** Age 26 is only 9.8 points below
  baseline. The catastrophe is **29**: 32 points below baseline, **92% of survivors decline**, 14 of
  27 are gone the following season, and the median including the departed is **−100%** — i.e. the
  median 29-year-old back is out of the league a year later. *(The web claim that 26 is flat and 27
  is the drop was NOT reproduced: 27 lands exactly on baseline here.)*
- **WR 28 — the code is a year late.** Receivers are *above* baseline through 26 (peak +10.6), and
  the drop arrives at **27** (−11.5).
- **TE 30 — the code is right.** Tight ends run above baseline 25–28 and fall at 29–30.
- **QB 33 — unmeasurable by this method.** No age bucket cleared the minimum sample; quarterbacks
  are too few per age-year in eight seasons. **A hole, not a pass.**

## What this means for design, and it is the same lesson twice

Bucket-to-bucket wiggles of 8–10 points sit inside the noise at n≈20–60 per cell. Only two effects
here are large enough to lean on: **the receiver peak at 25–26** and **the running-back wall at 29**.
Everything else is a gentle slope.

So **"age cliff" is a categorical label placed on a continuous, noisy quantity** — which is exactly
the failure David named on 2026-08-08 (Jeanty called a "committee" back at 19.9 touches). A
threshold flag on a player at 26 years 1 month, and none on the same player at 25 years 11 months,
is a lie at the boundary. **The honest rendering is the curve with its uncertainty drawn, and the
player positioned on it** — never a binary flag.

## Limits, stated

- Survivorship is reported both ways throughout, but the surviving-player medians still understate
  decline because the worst outcomes leave the sample entirely.
- Points per game mixes role and efficiency; a decline may be a lost job rather than lost ability.
  Distinguishing those needs the opportunity metrics, which are in the same database.
- Eight seasons, one league's scoring assumption (PPR), and small per-cell samples.
- QB is unmeasured, so the shipped 33 is neither confirmed nor challenged here.
