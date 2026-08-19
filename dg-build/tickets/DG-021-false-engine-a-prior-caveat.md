# DG-021 — 114 players are told an Engine A prior was used when none exists

**Layer:** 3 → surfaces at 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane, 2026-08-18; independently re-derived by the judge seat the same night

**Problem:** 114 served rows carry `dvs_engine="A"` and the caveat *"Engine A prospect score used as
prior"* — emitted from the exact branch that runs **because no Engine A result was produced**. Route
assembly reads that as an Engine A route, and the player API returns the row as `modeled` with
`degradation=None` while the score is null. **The product states something about itself that is not
true**, and does it to the player card David is looking at.

**How we know:** 115 feature IDs under the eight-game gate; 115 served rows with null DVS and a
projection; intersection **114** — the two 115s were never the same set. Cohort experience: 85 with
3+ years, 38 with 7+. A rookie-prior bridge applied overwhelmingly to veterans.

**Done looks like:** a row with no prior says so. No `dvs_engine="A"`, no prior caveat, and a state
David can read as "we don't have a number for this player" rather than a blank beside a confident label.

**Depends on:** nothing.

---

**Notes**
This is the highest-priority item on the board on one criterion: it is the only one where the product
tells David something false. Everything else is a number being worse than we'd like.

The coincidence of two different 115s is what made a wrong causal story look corroborated for several
hours. Worth remembering the next time two counts match.
