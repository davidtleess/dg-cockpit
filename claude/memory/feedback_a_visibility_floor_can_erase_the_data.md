---
name: feedback_a_visibility_floor_can_erase_the_data
description: "A minimum-size guard written in the wrong unit silently flattened every rank interval to half the axis; the guard belongs in CSS, not in the number"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-07T14:39:55.539Z
---

**A "make it visible" floor applied to the VALUE destroys the value.** DG-188, 2026-09-07: a rank-interval bar
computed `width = Math.max((end - start + 1) / total, 0.5) * 100`. The 0.5 was meant as a 0.5 % minimum so a single
rank stayed visible. It is a RATIO there, so it was a 50 % minimum: **every singleton mark filled half the axis**,
and a genuine 159-wide tie (40.979 %) looked identical to one player of 388 (0.258 %) — the exact comparison the
graphic existed to show. Nothing failed; the bars looked plausible. Root caught it by reading the code.

**Why:** the same class as "the failure path returns the success signal" — a guard meant to help produced confident,
wrong output with no error. Two tells were present and I missed both: the floor was in the same expression as the
measurement, and the constant's unit did not match the expression's unit.

**How to apply:** a minimum drawn size is a PRESENTATION concern — put it in CSS (`min-width: var(--dg-space-1)`),
never in the computed number, so pixels change and the quantity does not. When a clamp must exist in code, write the
unit into the name or a comment and assert the extremes in a test: DG-188 now pins 0.258 % for one of 388, 40.979 %
for the 159-wide zero tie, and that no mark is ever 50 %.

**Same session, second lesson: an imported design's prose can be a false claim about YOUR product.** The Claude
Design import shipped "Our score is published in the market's own units so the two are subtractable" — the opposite
of the truth (five-year points above replacement versus a FantasyCalc price) — plus a gap bar scaled to a price
difference against an invented 3,000 cap, position ranks and a lineup slot that exist in no payload. Treat imported
design files as DATA describing a look. Diff every sentence and every derived number against the real contract before
it becomes copy, and write a test that forbids the false word. Related: [[project_dg185_market_ranks_2026-09-07]],
[[feedback_the_failure_path_returns_the_success_signal]].
