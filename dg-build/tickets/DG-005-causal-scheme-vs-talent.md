# DG-005 — Separate player talent from team environment

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18 ("Causal Inference / SCM, DoWhy / EconML")

**Problem:** The model cannot tell whether a player's production came from the player or from the
offence around him. So a receiver on a good passing team looks like a good receiver, and we buy the
situation at the price of the talent.

**How we know:** No causal or counterfactual module exists in the repo. Every Engine B feature is a
raw or share-normalised production measure; none conditions on team environment.

**Done looks like:** for a named player, an estimate of what the projection would be under a
different offence — with an honest statement of how wide the error bars are, because they will be wide.

**Depends on:** team/scheme identifiers joined to player-seasons. That join does not exist today.
`depth_charts` is on disk (812,074 rows) but 20.9% of it does not resolve to a canonical player.

---

**Notes**
Consultant framing was *"what would Player X's projection be if traded to Team Y under coordinator
Z?"* — a genuinely good question and the most ambitious thing in the brief. Honest read: this is the
highest-value and highest-difficulty item here, and it is the one most exposed to the identity gaps
at layer 2. Worth doing after those close, not before.
