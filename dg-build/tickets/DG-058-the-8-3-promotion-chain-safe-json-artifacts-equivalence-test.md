# DG-058 — The §8.3 promotion chain: safe JSON artifacts, equivalence tests, and a PromotionReceipt

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** None of the six §8.3 chain stages exists — DatasetManifest, CandidateArtifact, EvaluationReport, FinalRefitArtifact, PostFitVerification, PromotionReceipt all grep to zero hits — and the served artifacts are raw pickles (app/data/models/QB_model.pkl et al.), not the safe, inspectable, versioned JSON artifact the proposal mandates for Ridge (coefficients, intercept, imputer values, scaler parameters, calibration data), with no equivalence test proving JSON predictions match the approved pipeline. This is the audit's named biggest risk: decision_supported=False is the single thread keeping an informationless model honest, and nothing may ever relax it without this evidence chain existing — a PromotionReceipt naming the exact refit hash, spec hash, dataset/feature vintages, checks, and human decision. DG-028's mutation check detects a moved artifact but does not constitute the chain; this ticket depends on the TrainingSpec ticket (receipts name the spec hash) and must land before any 2027 candidate is promoted.

**How we know:** grep 'DatasetManifest|PromotionReceipt|PostFitVerification|CandidateArtifact' src/ app/ scripts/ tests/ = 0 hits (run 2026-08-26); app/data/models/QB_model.pkl, RB_model.pkl, TE_model.pkl + engine_b/runs/ pickles; docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:401-416; audit biggest_risk (L3); tickets/DG-028-no-mutation-check-is-blind.md (fragment only)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
