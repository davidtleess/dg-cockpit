# DG-059 — ScoringEnvelope — separate raw inference from PVO assembly

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 2d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §8.7 defines ScoringEnvelope as the internal inference result carrying raw predictions, artifact/spec references, and diagnostics, which the intrinsic PVO assembler converts into receipt-bearing Measurement objects; no such type exists (zero grep hits) and scoring writes straight into PVO fields today. Without this seam, a 2027 candidate cannot be shadow-scored beside the active model without touching the product surface, and inference diagnostics have nowhere to live except PVO caveat strings. Small, self-contained, and the natural last stage of the §8.3 chain — sequence it with or immediately after the promotion-chain ticket.

**How we know:** grep 'ScoringEnvelope' src/ app/ scripts/ tests/ = 0 hits (run 2026-08-26); src/dynasty_genius/models/player_value_object.py:52-125 (scoring output lands directly in PVO fields); docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:469-471

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
