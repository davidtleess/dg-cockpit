# DG-009 — Handle regime shifts: new coach, new scheme, new quarterback

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** independent consultant brief, 2026-08-18 (named failure mode #1)

**Problem:** Lagged production features assume next year's environment resembles last year's. When a
coordinator, scheme or starting quarterback changes, that assumption breaks and the model keeps
projecting confidently through the break.

**How we know:** no coach, coordinator, scheme or QB-change feature exists in
`ENGINE_B_ALLOWED_FEATURES`.

**Done looks like:** first, a measurement — how much worse is our error on player-seasons that
followed a regime change than on ones that didn't? If the answer is "not much," this ticket closes
with that finding and we save the work.

**Depends on:** DG-002 for the error baseline; a source of coaching/coordinator changes, which we do
not currently ingest.
