# DG-007 — Learn when to act, not just what things are worth

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18 ("Contextual bandits / RL, Ray RLlib")

**Problem:** Everything the product produces is descriptive. It never says when to trade, when to
hold, or when a window is closing — which is most of the actual skill in dynasty.

**How we know:** Every surface returns `decision_supported: false`. That gate is deliberate and
correct today, because nothing has ever proven the model's calls are good.

**Done looks like:** nothing shippable yet. This ticket's honest first output is a decision: is a
learned policy the right tool here, or is the answer a small set of rules with measured hit rates.

**Depends on:** DG-003 and a season of scored outcomes. A policy learned against unvalidated
projections would optimise confidently toward the wrong thing.

---

**Notes**
Flagging plainly: this is the furthest-out item in the brief and the one most likely to produce
confident nonsense if started early. It stays filed because the underlying question — *when* — is
the right question and nothing else on the board asks it.
