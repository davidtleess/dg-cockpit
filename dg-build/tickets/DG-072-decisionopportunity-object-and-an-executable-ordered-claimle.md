# DG-072 — DecisionOpportunity Object and an executable ordered ClaimLevel with fail-closed composition

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 10.3's core types do not exist: no DecisionOpportunity, no ClaimLevel ordered type (descriptive < diagnostic < replication_candidate < decision_supported), no per-lane availability states (reference|unavailable|not_applicable), no receipt graph, no minimum-of-material-inputs composition rule — zero code hits. The philosophy is already proven in fragments: mandatory counter-arguments attach to PVOs, and cross-lane review composes model and market lanes scale-blind without merging them, while gate4 derives an ad-hoc string claim level. Until ClaimLevel is an executable type with fail-closed min-composition, every decision surface re-invents claim honesty by hand, and decision_supported=false — the single thread the L3 audit says holds the product honest — has no typed enforcement a future surface cannot quietly bypass. First deliverable is the ClaimLevel type and lane-availability states; the full DOO with receipt graph composes on top.

**How we know:** grep for DecisionOpportunity/ClaimLevel: zero code hits (verified 2026-08-26); src/dynasty_genius/decision_logic/counter_arguments.py:6-11 and src/dynasty_genius/trade_lab/cross_lane_review.py:1-15 (fragments to build on); src/dynasty_genius/eval/gate4_divergence_edge.py:305-312 (ad-hoc claim level); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:540-574

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
