# DG-020 — Get more than four market snapshots

**Layer:** 1  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** crew lane horse race, 2026-08-18 — named as the binding constraint

**Problem:** Four annual snapshots yield exactly two training cohorts. Every market-edge result is
therefore fragile by construction, no matter how good the modelling is. **This is a data ceiling, not
a modelling ceiling.**

**How we know:** `app/data/fc_snapshots.db` holds four annual dates — 2021-09-08, 2022-09-08,
2023-09-08, 2024-09-08. The loader that produced them is general and already approved; it was simply
never asked for more dates.

**Done looks like:** monthly or finer point-in-time market history across the same span, so the edge
work has cohorts to replicate on.

**Depends on:** nothing technical.

---

**Notes**
Stamped layer 1, not 3, though it surfaced from modelling work. Acquiring more history is ingestion.
It is also the cheapest high-leverage item on this board: no new science, no new provider, just
asking an approved loader for more dates.

Separately: `fc_snapshots.db` last advanced **2026-06-24** — 55 days ago.
