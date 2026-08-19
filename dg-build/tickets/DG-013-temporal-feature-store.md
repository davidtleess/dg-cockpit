# DG-013 — A feature store you can query as-of a date

**Layer:** 2 — filed here for visibility; it is NOT a layer-3 ticket
**State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18

**Problem:** There is no way to ask "what did we know about this player on this date." Without that,
every backtest is one careless join away from leakage, and no walk-forward result can be fully trusted.

**How we know:** the daily feature job pulls five streams live from the network and retains nothing
(`scripts/run_feature_refresh.py:133-170`). The 843 MB curated store it bypasses has all 501 columns
declared TEXT, so even the data we do keep has no types to query on.

**Done looks like:** point-in-time retrieval — given a player and a date, return the feature vector as
it stood then.

**Depends on:** this is the layer-2 work. Everything from DG-002 onward quietly assumes it.

---

**Notes**
This is the most consequential item to come out of the consultant brief, and it is the one the brief
itself treated as a supporting detail under an implementation role. It sits underneath nearly every
other ticket on this board.
