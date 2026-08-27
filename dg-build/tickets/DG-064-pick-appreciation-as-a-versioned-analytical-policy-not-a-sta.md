# DG-064 — Pick appreciation as a versioned analytical policy, not a static slot curve

**Layer:** 4  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** direct  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Future picks (109 in today's snapshot) are valued through a static historical slot curve frozen since the David-approved 2026-05-26 decision; §9.2 requires pick appreciation as a versioned analytical policy — how a future pick's value evolves with time-to-draft and the owning team's trajectory. Pick values feed the trade lab and team value matrix, which are numbers the owner acts on whenever a pick is in a package, so a real appreciation policy moves a served number directly toward decision-grade. Caveat to carry in the ticket: pick values are currently expressed in xVAR units, which inherit the untrusted model signal — build the appreciation policy as model-independent structure (slot × time × standings) so it survives the 2027 rebuild.

**How we know:** src/dynasty_genius/sleeper_universe.py:29-31 (PICK_VALUE_STATUS = 'active_v1_historical', historical slot curve, David-approved 2026-05-26); sleeper_universe.py:111-127 (pick reconstruction + valuation); today's snapshot.json carries 109 future_picks with draft_order (L4 audit, run league-20260826T132000Z)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
