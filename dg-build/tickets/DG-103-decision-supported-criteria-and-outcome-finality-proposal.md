# DG-103 — decision_supported criteria + outcome finality: a standing proposal so the blanks are filled before they matter

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **RATIFICATION IS DAVID'S — drafted now so December is a yes/no, not a blank page**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session). The delegation covers DRAFTING; MASTER plan §8.5 keeps the criteria themselves set explicitly by David, not by an agent — this ticket honors that split.

**Problem:** Two governance blanks have no scheduled moment: (1) what evidence would ever earn `decision_supported=true` has never been defined; (2) no authority has been named to declare realized outcomes final. Both bite the first time a measurement comes back positive (~Dec, Gate-4 on realized 2026 outcomes) — and deciding them THEN, under the excitement of a positive result, is the worst possible time.

**How we know:** MASTER plan §5/§8.5 (the criteria gate exists as a type with nothing in it); REV2:49 (the approved route: "claim-composition tests, power/replication thresholds, examples at every claim level, independent science review"); grep of docs + tickets for any criteria definition → none (2026-08-29).

**PROPOSED CRITERIA** *(for David's ratification — a lane may refine wording, never weaken substance)*: `decision_supported=true` for a lane requires ALL of:
1. **Leakage-clean measurement** — DG-026 fixed; headline numbers re-measured on the clean split.
2. **Estimator parity** — the validated artifact IS the serving artifact, byte-verified (DG-017 fix + DG-057 `verify_artifact`).
3. **A standing, pre-registered model-vs-market measurement** (DG-018 built): the model lane beats free consensus on rank quality at the claiming position with a CI excluding zero, on realized outcomes, bootstrap defect fixed, replicated across at least two independent evaluation windows.
4. **Gate-4 divergence-edge positive** on realized 2026 outcomes.
5. **Scope named** — versioned `universe_snapshot_id`; claim level composed as min of material inputs (MASTER §5); no lane borrows support from another.
6. **Promotion chain green** for the artifact making the claim (DG-058/059).
7. **David's dated word, recorded** — the flip is his act, per law.

**PROPOSED OUTCOME-FINALITY AUTHORITY:** mechanism = the realized-outcome resolver's capture at NFL week-final plus a 48-hour stat-correction window; authority = **David**, whose dated word settles disputes (postponements, stat corrections, retro-scoring). Single-user product: the resolver is the instrument; David is the authority.

**Done looks like:** David ratifies, amends, or rejects each half, dated; the result joins the MASTER plan §8 registry of his explicit words. Until then this ticket IS the standing proposal.

**Depends on:** nothing to ratify. Criteria 1-6 reference open builds by design — that is the point: the checklist exists before the first positive number does.
