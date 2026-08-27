# DG-074 — Scenario 4: trade-partner EVIDENCE panels — receipts, not context cards

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** direct  ·  **Size:** 2.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 10.4's fourth scenario specifies evidence panels for trade partners; what runs today — the weekly league opportunity map's surplus/deficit team cards — is context, not evidence: no receipts, no claim levels, no EvidenceRecord backing. The honest version renders each partner's panel as claims drawn from the Evidence Registry and composed under DOO rules, so a stated surplus or deficit carries its cohort, vintage, and uncertainty. Depends on the Evidence Registry and DOO tickets, and its manager-behavior half draws on L4's §9.1 profiles, which do not exist this season — so this ticket sequences last in the layer and should start from what is real: the opportunity map plus the 4-season transaction store.

**How we know:** src/dynasty_genius/league_opportunity_map.py:14-19 (league_opportunity.v2, banned-language guard — context, not evidence); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:576-586 (scenario 4); L4 audit: §9.1 manager profiles 0% built, league_transactions.py scopes analysis out

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
