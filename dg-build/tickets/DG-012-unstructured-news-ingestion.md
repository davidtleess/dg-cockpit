# DG-012 — Turn news, injury reports and pressers into features

**Layer:** 1 — filed here for visibility; it is NOT a layer-3 ticket
**State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18

**Problem:** Beat-reporter notes, press conferences and practice reports carry information days
before it shows up in any box score. We ingest none of it.

**How we know:** the repo ingests no unstructured text source of any kind. There is also no weather
ingestion, checked in the same sweep.

**Done looks like:** one source, captured exactly as published, before anyone tries to derive a
feature from it.

**Depends on:** nothing technically. Realistically this competes with layer-1 work that is already
inventoried and unfinished.

---

**Notes**
Filed at layer 1 deliberately rather than forced to 3. The consultant put this under a modelling
role, but capturing a new source is ingestion, and calling it otherwise is how a data problem ends up
being worked on the wrong floor.

Also worth stating: the product's live injury data today comes only from the nflverse weekly injury
report (45,337 rows, last written 2026-08-08). There is no live injury feed.
