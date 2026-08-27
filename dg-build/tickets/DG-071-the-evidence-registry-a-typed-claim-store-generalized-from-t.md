# DG-071 — The Evidence Registry: a typed claim store, generalized from the QB-1 program

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 10.2's registry — EvidenceRecord with hypothesis preregistration status, cohort and source hashes, model/market vintages, outcome horizon, test family and multiplicity policy, uncertainty, claim level, replication and supersession links — has zero code hits in src/, app/, or scripts/. What exists is one hash-sealed, fail-closed validation program (QB-1: registration hash gates every fit; verdicts hold decision_supported=False) that proves the method but stores nothing reusable. Without the registry, DG-018's standing model-vs-market measurement has no home and can drift back to unknown (its ticket's own words), research findings have no typed barrier against silently becoming recommendations, and there is no legitimate mechanism by which the 2027 rebuild's claims can ever flip decision_supported — this is the machinery that certifies every future decision-grade number.

**How we know:** grep for EvidenceRecord/registry types: zero code hits (verified 2026-08-26); src/dynasty_genius/eval/qb_validation/registration.py:1-11 (the pattern to generalize); src/dynasty_genius/eval/gate4_divergence_edge.py:349-357 (fail-closed verdict, decision_supported always False); tickets/DG-018-does-the-model-beat-the-market.md:29 (the measurement that earns the flip); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:524-538

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
