# 023 — The player card as a standard unit

**Status: built and self-checked 2026-08-17, not yet shown to David. Self-initiated — his words
were "the player cards are cool," which is a reaction, not a direction; this is Studio's proposal
for what to do with it.** Prototype: `proposals/023-the-player-card/index.html`
(serve: `node tools/serve022.mjs`, build: `python3 tools/card-build.py`).

## Problem

David killed 022's calendar framing and kept its player cards. Carrying the card forward meant
testing its factor rows rather than reusing them — and one of the four failed.

## Evidence — the retraction, measured before anything was drawn

**RETRACTED: the "August drift — the market moved toward / away from our board's view" row**, which
Studio shipped in 022 and named to David as the factor that compounds. Two independent reasons,
both measured (`tools/does-the-gap-path-carry-information.py`, controls pass in both directions):

1. **It is not two lanes.** Our board changed on **2 of 54 capture days** — 2026-06-26 (259
   players) and 2026-08-14 (2 players, 0.1 DVS). For 52 of 54 days our side is a fixed line, so
   "drift between the lanes" is the market moving against a constant.
2. **What it reported was noise.** In percentile space the gap's mean within-player spread is
   **0.030** against **0.167** across players — ratio 0.18. The time axis is not earned; that is
   the same test that killed 004 v3. Studio's own toward/away threshold (0.02) sat inside the
   noise floor.

**REPLACED BY: the player's own captured band** — where today's price sits inside the range the app
itself has recorded. Measured across his roster it discriminates fully (own-position 0.00–1.00,
sd 0.35) and it is the one factor here that strengthens with every capture.

**And a defect caught in the replacement before it shipped.** Normalising position-within-range
renders **Garrett Wilson (band 7.4% wide) identically to Mac Jones (43%)** — both read "at his
55-day low," one meaning the market has not moved him and the other a collapse. That is the
collapse-an-asset-into-one-number error of 2026-07-24. **The mark therefore draws the band's
width, not just the dot's position**, on a shared axis of percent-of-own-high so widths compare
across cards (the confirmed 004 N4 auto-scale defect). Population bars, computed per build from
376 players: typical band **24.4%** wide, **12.2%** of players sit at their own low, **9.0%** at
their own high.

## Proposal

Four rows, one unit, decision-agnostic — the same card serves a cut, a hold, a trade target or a
waiver claim:

1. **His own band** — length is how far the market has actually moved him; the dot is today;
   direct-labelled, with an end label dropped when the dot already carries that number.
2. **The two boards** — our positional percentile against the market's, dumbbell, best on the
   right; states plainly when our board has no score for a player rather than implying one.
3. **The wire** — the best unrostered player at that position, priced today.
4. **The read** — an analyst sentence that names the bar it rests on (the population band, the
   published wire price, the capture count), never a bare category.

Six situations prove portability: the cut (Mac Jones), the collapse (Gabriel), the absence (Ali),
**the non-event (Wilson)**, the event (Odunze), the riser (Bryant). The non-event card is
deliberate — it is the boring-player test David set on 2026-08-08, and its read says the honest
thing: nothing happened here.

## Prototype

Checks: 6/6 cards present · overflow 0 both edges · text collisions 0 · duplicate-number census
inside every band mark 0 · console errors 0 · no horizontal scroll · error boundary verified both
directions (healthy 4,790 chars / broken 356 naming the fault / restored) · deterministic build,
hash-identical across runs · build asserts the band separates the two specimens a normalised
figure would merge.

## Costs (honest)

- **55 days is a short history and the card says so.** "His 55-day low" is not an all-time low;
  there is no obtainable backfill before 2026-06-24. The statement gets stronger with time rather
  than being strong now — which is the point, but today it is thin.
- **The band says nothing about why.** It is a price record; the football reason is supplied by
  the read, which is hand-written per player here. Automating that read is unsolved and is the
  gap between this prototype and a shipped surface.
- **Three roster players carry no model score** (Wilson, Allen, Dell), so the two-boards row
  degrades to one lane for them. Shown as absence, not filled in.
- **The wire row uses market value only** — our board does not rank most unrostered players, so
  "best available" is the market's opinion, not ours.
- **Six hand-picked cases are not a surface.** How these order, filter and expand at roster scale
  is not designed here.

## Open questions

1. Is the band the right second lane on the card, or does he want his own price history as a full
   line (the KTC convention) rather than a compressed range?
2. Should the read be a written sentence at all, given it cannot be generated today?
3. Does the "non-event" card earn its place — is being told nothing happened worth a card?
