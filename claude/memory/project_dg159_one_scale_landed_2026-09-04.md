---
name: project_dg159_one_scale_landed_2026-09-04
description: "DG-159 landed b6b9ab3d + 96dad300 on 2026-09-04 — one denominator (20.1) for every position and both engines, plus both threshold corrections; NOT live until a chain run"
metadata: 
  node_type: memory
  type: project
  originSessionId: 117b7259-8014-45bf-986e-039a51e5410d
  modified: 2026-09-05T08:27:34.443Z
---

**LANDED on origin/main 2026-09-04 evening, `b6b9ab3d` + `96dad300`. NOT LIVE** — trunk unpulled
(17 behind), served artifact still the old scale with 18 players pinned at the ceiling. The
served universe rebuilds on the next chain run, and **that** is when 21 of David's 26 players
move. ⛔ **Greg 2026-09-04: do not pull trunk without telling him** — he wants David awake and
expecting it. Pull window is before the 09:00 chain or after the 14:00 refresh.

**David's rulings, both relayed through Greg and both re-confirmed after the numbers moved:**
anchor **20.1 points a game**; take **both** thresholds. He also **declined** a third option —
a one-morning notice at the top of the page naming the four flipped players. **So no banner, no
new morning copy, nothing added to the surface.** The DG-158 units-change refusal stays, because
it is a correctness guard against a false fallers list, not a notice.

**What shipped.** `DVS_SCALE_ANCHOR_PPG` = 20.1 at all four positions, both engines. Thresholds
QB 25 · RB **29** · WR **45** · TE 13. New derived, dated `REPLACEMENT_PPG` = 12.26 / 9.09 /
9.05 / 8.41. One replacement table for both engines (61.0 / 45.2 / 45.0 / 41.8), every lambda
1.000, all three sigma tables re-derived (B 22.4/17.8/14.4/**11.1**, A 33.2/14.8/20.5/**10.7**,
A_v3 TE **13.5**).

⛔ **`ENGINE_B_P90_PPG` is deliberately NOT the denominator and must NOT be edited to become one.**
It stays 20.1/15.7/14.5/9.4 as a measured fact, which is what keeps a position's ceiling sayable
(TE tops out at 46.8). Overwrite it and the served score is identical while two guards go silent
with every test green. Pinned by
`tests/contract/test_dg159_one_scale.py::test_the_anchor_is_a_separate_constant_from_the_position_ceilings`.

**Five places turn points a game into a score** — the assembler's Engine B path, both Engine A
heads, `trade_lab/draft_pick_valuation.py` (prices PICKS, easiest to forget, and picks are traded
FOR players), and `scripts/audit_dvs_calibration.py`. All five now divide by the anchor.

**Corrections to the record made here:** the RB threshold was **four** ranks too deep, not the
"~10" the ticket and my own summary said (the ten was POINTS); receiver was eight. And the
shipped replacement ppg had **no source** — see
[[feedback_a_test_carrying_its_own_copy_is_an_antitest]]. That stale figure, not the rank, is
4.5x of the running-back fall: Jeanty 29.67 → 21.37 (unit) → 14.06 (re-derived at the SHIPPED
rank) → 12.42 (corrected rank).

**Knife-edge worth knowing.** The RB/WR split turns on ONE player at a 0.175 ppg margin — Jordyn
Tyson, a receiver Sleeper marks Inactive, at 10.94. Counting him = RB29/WR45; excluding him =
RB30/WR44, worth 1.10 to every receiver David owns and four adjacent swaps on his roster.
**David ruled 2026-09-04 that he IS counted** — availability is already inside every served score,
so filtering on status again counts the same risk twice. The comment in the constant is now a
recorded ruling, not a rationale; leave it as written.

**On his roster when it goes live:** Dart takes the top from Jeanty; backs fall 13–17;
quarterbacks slip slightly; 21 of 26 change place; and **four** cards change their replacement
verdict — Barner up through zero, Kaelon Black / Omar Cooper Jr. / Luther Burden down through it.
Ceiling pile-up 18 → at most 1 (Puka Nacua, and only at certain availability).

Related: [[project_te_scale_ruling_2026-09-04]], [[feedback_an_approval_is_for_a_magnitude]],
[[reference_measuring_the_live_pvo_artifact]], [[reference_trunk_frontend_bundle_is_a_manual_build]].
