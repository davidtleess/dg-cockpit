# DG-056 — Owned bitemporal identity: mint canonical IDs and run the six-step migration

**Layer:** 2  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 10d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** There is no owned identity system: the canonical key is external gsis_id resolved through the frozen crosswalk, and none of §7.1's seven tables exists — identity_assertion has zero hits in src/, app/, or scripts/. The prospect-lane identity machinery (review queue, overrides, snapshots, coverage matrix) is real code but one-off scripted, with run artifacts stale since June, so nothing bitemporal accrues daily. Without an owned opaque immutable ID, every store keys on an identifier the product does not control, and the 2027 rebuild inherits whatever the external key-space did in the meantime. Deliverable: the seven-table bitemporal schema (SQLite per §7.4), minted opaque canonical IDs, every current key mapped as an alias, dual-read/dual-write, referential-coverage and historical-replay proof, one-at-a-time consumer cutover, legacy aliases preserved indefinitely in receipts. Post-season shaped; depends on the versioned normalizer, and the crosswalk-vintage stream becomes its assertion evidence rows.

**How we know:** docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:306-327 (seven tables + six-step migration); grep identity_assertion across src/, app/, scripts/ returns zero hits (verified 2026-08-26); src/dynasty_genius/nflverse_usage.py:78-80 and league_transactions.py:90-100 (external gsis_id keying); src/dynasty_genius/identity/ and audit/identity_*.py dormant, run artifacts app/data/identity/ dated 2026-05-15..06-03

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
