# DG-022 — Players with no canonical id can never be graded, and nothing says so

**Layer:** 2  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane, 2026-08-18; carried forward by the judge seat as real and separate

**Problem:** A player can be present in the market data, present on a roster, and carry
`dg_player_id: None` in the served artifact. He joins to nothing, so the realized-outcome scorer can
never score him — not this week, not ever. Tank Dell (sleeper_id 9502) is the named case.

**How we know:** he appears in `fc_forward_capture_joinable` at `snapshot_date=2026-08-18`; a query
for him in `model_forward_capture_joinable` returns empty.

**Done looks like:** the count of never-gradable players is known, visible, and shrinking — and a
player in that state is not presented as if he were being tracked.

**Depends on:** the identity work at layer 2. This is a symptom of it, not a separate bug.

---

**Notes**
The scorer's own accounting is honest — orphans are recorded with a reason rather than dropped. The
gap is that nothing surfaces the consequence to David.
