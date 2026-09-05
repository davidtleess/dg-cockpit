# DG-159 — One scale for every position AND both engines: the rookie engine stops flattering rookies

**Layer:** 3 · **State:** closed · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **model correctness / product truth · medium**
**Source:** David's rulings, in sequence and all verified at source:
* 2026-09-04 19:34:46Z (15:34 ET): *"we need to put the tight ends on the same kind of scale as the rest of the
  players … It can't have its own scale; it can have a calibration to the position, but it has to be on the same
  scale."*
* 2026-09-04 22:30:11Z (18:30 ET): *"take decision one now. then build before week 1"* — decision one shipped as
  DG-157; this is decision two.
* 2026-09-04 (ceiling): *"The ceiling should either be the absolute best player in the league or it should be
  something mathematically achievable because we believe it is a Hall of Fame level Dynasty asset or Contender
  asset. It shouldn't just be an unreachable or extremely reachable number."*
* 2026-09-05 00:02:06Z (20:02 ET): *"normalize the rookie rankings into the same scale as everyone else."*

**Problem:** the displayed 0-100 score divides by a per-position ceiling, and there are EIGHT of them — four per
engine. A 100 means 20.1 points a game for a veteran QB and 16.7 for a rookie one; 9.4 for a veteran TE and 9.1 for
a rookie. Same position, same football, different yardstick. Two consequences:
1. **Cross-position:** eight tight ends pile up at 100 because the whole startable TE range is 8.99→9.40 ppg.
2. **Cross-engine, and this is the one David has not seen:** the rookie engine divides by SMALLER numbers, so
   **rookies are flattered**. On his own roster Fernando Mendoza reads 85.1 — the highest number he owns — and on
   one scale reads 70.0, behind Jaxson Dart at 75.6. All four of his Engine-A players fall further than his
   Engine-B players do.

**What makes this small, verified rather than assumed (Fred, 2026-09-04):**
* Engine A **already follows the same guarded identity** Engine B is held to: `lambda[pos] == P90[pos]/P90['WR']`
  on its own anchor, all four matching to three decimals. (A review lens asserted it did not; it does.)
* **The two engines already AGREE on replacement in points per game** — QB 12.91/12.90, RB 7.29/7.28, WR 8.79/8.79,
  TE 8.99/8.99. They differ ONLY in the ceiling they divide by (anchor 12.7 vs 14.5), which is the entire 1.1417×
  cross-engine gap.

So this is not a reconciliation of two worldviews. One denominator makes every lambda 1.000, makes the two
replacement tables identical (because the underlying ppg already agree), and closes the gap. **Eight ceilings,
eight replacement tables and eight lambdas collapse to one ceiling, four replacements and one lambda.**

⛔ **THE DENOMINATOR VALUE IS DAVID'S AND IS NOT SETTLED.** Measured band that satisfies his ruling — exactly one
player at or just under 100, nobody else — is **D ∈ [19.70, 20.31]**. Below ~15.9 many players pin ("extremely
reachable"); at/above ~22.0 nobody can reach 90 ("unreachable"). ⚠ An excellence standard drawn from REAL achieved
production fails his own test: at D=29.45 (best achieved) nobody in the league scores above 68.9, because the
model's forecasts run ~30% below real outcomes (regression plus the availability discount). **Do not assume a value
in the preparation commit.**

**Shape, per Greg's sequencing ruling:**
1. **PREP — behaviour-neutral, lands early.** A single scale module whose derivations (ceiling → lambda, ceiling →
   replacement DVS, rmse → sigma) **reproduce today's shipped constants exactly** from today's per-position
   ceilings. Nothing wired, no served number changes. That reproduction IS the evidence the switch is correct.
2. **SWITCH — ONE atomic commit.** Every constant that moves and every test that moves with it, together. The
   coupled family cannot move in pieces and the change must revert in one commit.

⛔ **ON THE DG-092 GUARD — do not let it pass vacuously.** Under one denominator `lambda == P90[pos]/P90[anchor]`
becomes trivially 1.000, and *a guard that becomes trivially true has stopped guarding*. The replacement invariant
must be **stronger**: every lambda IS 1.000 and nothing can set it otherwise; **all four positions and BOTH engines
divide by the SAME named constant**; and a second denominator cannot be reintroduced. The commit must state what
the old test caught, what the new one catches, and why the new one is not weaker.

**Depends on:** DG-158 (Bob) must land FIRST — its four score-unit constants break quietly when the scale moves,
and they are defensive: dormant until scores actually move. This ticket's switch commit is what arms them.

**Anti-scope:** no model retrain or promotion (David's word, and DG-058/059 are unbuilt). No tuning a constant to
make a position look right (his 2026-08-31 ruling 5). No market anchor (his ruling 8: market price is never a model
input). The replacement RANKS are a separate open question (the RB threshold is ~10 ranks too deep) and are NOT in
this ticket.

**Verify:** the prep module reproduces all eight ceilings' derived constants exactly; after the switch every lambda
is 1.000, both engines read one constant, no test passes vacuously, and David's four Engine-A players move as
measured.

---

## ACCEPTANCE — LANDED `b6b9ab3d` + `96dad300`, 2026-09-04 21:0x–21:5x ET. **NOT LIVE.**

Gate green both times: backend **7071 passed / 33 skipped**, frontend **95 files / 661 tests**,
OpenAPI regenerated with **zero diff** (no API shape changed). Trunk is unpulled and the served
universe is rebuilt by the next chain run — that is when this reaches David.

### What David ruled, and what shipped

**Anchor 20.1** (relayed via Greg, taken knowing every cross-positional number falls ~28% and
Kraft goes 100 → ~47). **Both thresholds.** Scope on the thresholds CHANGED from this ticket's
original text on his ruling — the ranks were filed here as "a separate open question… NOT in this
ticket" and he merged them.

    DVS_SCALE_ANCHOR_PPG   QB/RB/WR/TE all 20.1        (new constant, both engines)
    ENGINE_B_P90_PPG       unchanged 20.1/15.7/14.5/9.4 (no longer a denominator — see below)
    ENGINE_B_VAR_THRESHOLDS QB 25 · RB 29 · WR 45 · TE 13   (was 25/33/53/13)
    REPLACEMENT_PPG        QB 12.26 · RB 9.09 · WR 9.05 · TE 8.41   (NEW named constant)
    ENGINE_*_REPLACEMENT_DVS  61.0 / 45.2 / 45.0 / 41.8  (one table, both engines)
    XVAR_LAMBDA_ENGINE_*   1.000 everywhere
    DVS_SIGMA_B            22.4 / 17.8 / 14.4 / 11.1
    DVS_SIGMA_A            33.2 / 14.8 / 20.5 / 10.7
    DVS_SIGMA_A_V3         TE 13.5

### ⛔ TWO CORRECTIONS TO THIS TICKET'S OWN TEXT

**1. "the RB threshold is ~10 ranks too deep" is WRONG.** The ten was POINTS, not ranks. Measured:
RB shipped 33 against a structural 29 — **four ranks**. Receiver is the big one at **eight**
(53 → 45). The ten is what a running back's cross-positional value falls by.

**2. "both engines already agree on replacement ppg (12.91/7.29/8.79/8.99)" — those four numbers
have NO SOURCE.** They existed only as inline comments citing
`app/data/backtest/phase14/var_batch_20260516_190328.json`, which holds **13.47 / 8.59 / 8.65 /
9.76**. No feature season of `engine_b_features_v2.csv` reproduces them at the shipped ranks, and
neither does any population of the served artifact (all-scored, Engine-B-only, Active-only, raw
`projection_2y` — all checked). `test_phase15_xvar.py` carried its own restated copy, so the test
and the code agreed with each other while neither agreed with anything measured. They are now
derived from the served population at the corrected ranks and dated.

**The rank correction is the smaller half of the running-back move.** Decomposed on Jeanty
(11.586 ppg): 29.67 today → 21.37 on the unit change alone → 14.06 once replacement is re-derived
at the SHIPPED rank → 12.42 at the corrected rank. The stale replacement figure is worth −7.31 and
the rank −1.64.

### ⛔ THE SHAPE — do not "simplify" this

`ENGINE_B_P90_PPG` is deliberately NOT the denominator and is deliberately unchanged. Overwrite it
with 20.1s and the served score is identical while **two of DG-158's guards go silent with every
test green**: `position_ceiling` becomes `P90/P90*100` (identically 100 forever), and the prospect
gate's scale token stops changing. `test_dg159_one_scale.py::test_the_anchor_is_a_separate_constant_from_the_position_ceilings`
pins the separation.

### DG-158's guards — VERIFIED BY RUNNING, and three needed repair

| guard | verdict |
|---|---|
| top-asset threshold as a share of the ceiling | ⚠ **wired to the P90s — would not have fired.** Repointed. Population 57 → **52** (the 5 lost are Engine-A receivers whose own ceiling sits below the position's), not the 57 → 9 catastrophe it was built to stop |
| prospect gate told of a declared scale | ⚠ **wired to the P90s — token would not have changed**, all 80 cards → `undeclared_drift`, `sys.exit(1)`, boards not rebuilding on rescale morning. Repointed; refresh then ran clean, declared the move, and held invariance again on a second run |
| units-change refusal | ⚠ **fired at NONE of the four positions on the real move.** Two causes its author could not see: the two engines divide by different OLD ceilings so each position has TWO factors, and 1-dp rounding scatters small-score ratios far past a 0.5% tolerance (a receiver at 0.1 → 0.1 has ratio 1.0). Rewritten to group by position AND engine and to ask whether one factor is consistent with every player once the rounding is carried. **Replayed over all 70 day-to-day comparisons in the capture DB: silent on every one. On the rescale: fires at 7 groups, section returns 0 per-player fallers** |
| model movers capped at 25 | ✅ shape-independent. Ordinary morning: 25 of 387, status `ok` |
| band guards | ✅ sigmas re-derived. ⚠ but `test_the_band_reads_the_same_denominator` asserted `pvo_assembler.X is X` — **true whether or not the assembler used X**. Rewritten to score a player and read the denominator back out |

### Found in passing, would have shipped

* **the roster-audit replacement sentence** back-derived its points a game as
  `replacement_DVS/100 * P90`. Correct only while the denominator WAS the P90 — it would have gone
  on reading confidently while quoting **6.53** for receiver replacement instead of 9.05.
* **`dvs_p90_ref` on an Engine A row was asserted by the ASSEMBLER**, not reported by the scorer.
  A private ceiling reintroduced in the rookie engine passed every test including the new guard.
  Both heads now bind the denominator to a name, divide by it once and report it
  (`dvs_scale_denominator`); the guard recovers it from `y24_ppg_raw / score * 100`.
* **the draft pick value curve** (`trade_lab/draft_pick_valuation.py`) was a fourth normalisation
  site. Left behind, picks would be priced on a scale no player is on — and picks are traded FOR
  players. Curve artifact rebuilt: slot 1 26.25 → 24.08.
* `scripts/audit_dvs_calibration.py` — a fifth. Spearman would not notice (a rank); ECE would.

### The DG-092 successor is stronger, and it is mutation-tested

The old identity becomes trivially 1.000 under one denominator. The replacement **scores players
and recovers the denominator from the served number**. Eight mutants, seven killed, one equivalent:

    rookie engine given a private ceiling      KILLED  (survived the first version — that is why 96dad300 exists)
    veteran engine divided by a position P90   KILLED
    one lambda edited alone (the 0.703 shape)  KILLED
    anchor aliased back to the P90 table       KILLED
    a sigma left on the old scale              KILLED
    receiver threshold put back to 53          KILLED
    a replacement baseline off its own ppg     KILLED
    reported denominator → the literal it equals  EQUIVALENT

### Measured, on the 2026-09-04T18:00:04Z artifact (582 scored)

* **Players pinned at the ceiling: 18 → at most 1** (8 of the 18 were tight ends — what David saw).
  The one is Puka Nacua and only if his availability is certain; his raw projection is 20.302.
* His roster: **21 of 26 change place. Jaxson Dart takes the top from Ashton Jeanty.**
* **Four cards change what they SAY about replacement level, not one:** AJ Barner −3.63 → **+0.30**
  (below → above); **Kaelon Black +13.40 → −0.49**, Omar Cooper Jr. +1.79 → −0.14, Luther Burden
  +0.80 → −0.70 (above → below).
* Running backs fall **13–17**, not the ~10 David was shown. Quarterbacks fall slightly
  (Dart 16.91 → 15.40) rather than rising 4–5. **These are larger than the figures he approved
  against; the direction he chose is unchanged.** Reported to Greg the same evening.

### A knife-edge worth knowing

The RB/WR split is decided at a margin of **0.175 points a game**, and **one player sits across
it** — Jordyn Tyson, a receiver Sleeper marks Inactive, at 10.94. Counting him gives RB29/WR45;
excluding him gives RB30/WR44, worth **1.10 cross-positional points to every receiver** and four
adjacent swaps on David's roster. He is counted, because availability is already inside every
served score (`apply_availability`) and filtering on status on top would discount him twice. The
choice is recorded in the constant's comment rather than left implicit.

### Two artifacts rebuilt (scored data, not code)

`resources/prospect_cards.json`/`.js` (80 cards; max score now 74.93, no rookie clamps) and
`app/data/valuation/draft_pick_value_curve_v1.json`. The served universe was NOT touched.
