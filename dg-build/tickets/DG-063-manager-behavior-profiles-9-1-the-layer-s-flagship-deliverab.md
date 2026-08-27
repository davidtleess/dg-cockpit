# DG-063 — Manager behavior profiles (§9.1) — the layer's flagship deliverable

**Layer:** 4  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** direct  ·  **Size:** 3d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** No code anywhere computes the §9.1 deliverable: per-manager transaction frequency, asset-class flows (player-vs-pick), positional flows, and counterparties, each with sample size, window, freshness, and uncertainty attached. This is the strongest decision-grade number L4 can produce in 2026, because it is derived purely from the transaction archive and does not touch xVAR at all — with the deployed model ruled informationless, transaction-derived tendencies (who moves picks, who churns, who hoards, who trades with whom) are real, model-independent edge at the trade table, and descriptive stats do not engage the no-buy/sell ruling. Depends on the manager-identity-reconciliation ticket; the four-season evidence store is already captured, daily-updated, and live-fire proven.

**How we know:** src/dynasty_genius/league_transactions.py:3-4 (capture module scopes analysis out); L4 audit 2026-08-26 (zero code hits for frequency/flows/counterparty computation; store current through 2026-08-24, daily 06:30 job); SEASON-BUILD-SPEC.md:555 (08-21 transaction captured unprompted); master-proposal-3 §9.1

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
