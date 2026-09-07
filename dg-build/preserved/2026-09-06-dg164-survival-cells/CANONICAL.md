# CANONICAL CELL FILE

## USE THIS ONE
    retention_R_v3.json

R(h) = mean(VOR at h, UNCONDITIONAL) / mean(VOR at 0), per cell.
    V = A(0) x sum_h d^h x R(h)

Bar: QB37 / RB45 / WR71 / TE21 (David's 2026-09-05 availability ruling).
Lookup key: projection_2y / bar_ppg. projection_2y IS E[points|plays] (pvo_assembler.py:457).
128 cells, 40 suppressed, five horizons, option-B margin bins.

## THREE WARNINGS THAT ARE IN THE FILE AND MUST BE OBEYED

1. R IS UNCONDITIONAL. Survival is already inside it. Do NOT multiply by S(h).
2. margin < 1.0 does NOT mean worth zero. Margin is a RATE ratio; qualifying is on season
   TOTALS. 100% of qualifying player-seasons below 1.0 margin have POSITIVE VOR
   (median 18.6 pts; QB median 44, max 227). Correct test: expected season points <= the
   bar player's season points.
3. Suppression is n < 12 OR mean_VOR_at_0 < 10, ENFORCED BY ASSERTION. Every suppressed
   entry carries `suppressed_because`.

## OPEN, CHOSEN NOT DERIVED
Margin is a RATE. The replacement is the best you can field each week, so one player's
season total is the wrong object. At QB - where the best available man plays about half the
weeks, and where NINE OF THE TOP 20 SIT - this rests on an UNMEASURED assumption about the
other nine weeks. Live alternative, not a derivation.

## EVERY OTHER CELL FILE IS SUPERSEDED
Eight others now carry a `_SUPERSEDED_DO_NOT_USE` key as their FIRST field, naming this file
and the reason. Nine files with three semantics existed simultaneously; that is how a wrong
one gets picked by whoever reads the directory next.

    retention_R_FIXED.json              <- FRED BUILT THE 08:xx BOARD AGAINST THIS. Fragility rule absent.
    retention_R_FINAL.json              tie defect: 284 WR rows silently dropped
    survival_FINAL_B.json               a THIRD retention semantics, since retracted
    survival_curves_FINAL.json          pre-option-B binning
    survival_curves_deepbar_decile.json wrong bar (structural)
    survival_curves_deepbar.json        wrong bar + quartiles
    survival_curves_margin.json         starter bar
    survival_curves.json                starter bar, bare list, no definition block
