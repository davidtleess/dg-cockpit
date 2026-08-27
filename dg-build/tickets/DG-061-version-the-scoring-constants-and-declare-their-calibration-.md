# DG-061 — Version the scoring constants and declare their calibration-evidence state

**Layer:** 3  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 1.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** §8.1 says architecture does not ratify fixed P90 ceilings, xVAR multipliers, or blend constants without versioned calibration evidence — and production carries exactly those as frozen code constants: _P90_PPG (engine_a.py:31), ENGINE_B_P90_PPG (engine_b_contract.py:24), XVAR_LAMBDA_ENGINE_B (engine_b_contract.py:47), replacement baselines 'Frozen at May 2026 values' (engine_b_contract.py:73). Move them into a versioned config artifact that carries an explicit calibration_evidence field (currently 'none'), so the 2027 evaluation program can supersede them with receipts instead of silent code edits. Scope note: this ticket versions and discloses; it asserts nothing about the current values being wrong (the earlier XVAR_LAMBDA_ENGINE_B defect finding was retracted — do not edit the values).

**How we know:** src/dynasty_genius/scoring/engine_a.py:31; src/dynasty_genius/models/engine_b_contract.py:24,45-61,73,82; docs/strategies/2026-08-19-dynasty-genius-master-proposal-3.md:383

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
