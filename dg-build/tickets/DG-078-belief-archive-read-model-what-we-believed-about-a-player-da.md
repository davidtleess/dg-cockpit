# DG-078 — Belief archive read model — what we believed about a player, dated

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 11.1 names a belief archive among the eight read models; 'belief' has zero occurrences in app/ or frontend/src. The substrate already runs: the append-only model_forward_capture store keys every day's model belief by capture_date with enforced immutability, so the archive is a read model over data being captured daily — no new capture needed. Its edge value: it makes the 2026 point-in-time archive — the declared fuel of the 2027 model rebuild — inspectable during the season, so identity drift and capture holes are caught while they can still be fixed rather than discovered in 2027 when gaps are permanent. Depends on the read-model store ticket for its publisher and receipts.

**How we know:** proposal :599 (belief archive in the 11.1 read-model list); grep -ri belief app/ frontend/src = 0 hits (verified 2026-08-26); substrate src/dynasty_genius/capture/model_forward_capture_store.py:27-55 (append-only, capture_date-keyed, cited approvingly in SEASON-BUILD-SPEC.md:227)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
