# DG-079 — Turn release evidence into a gate — goldens, state matrix, CI wiring

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 1.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 11.4 requires per-increment evidence including the quiet/changed/stale/partial/unavailable/error state matrix and zero serious axe violations; today's visual-smoke spec declares itself 'not a pass gate ... No goldens, no toHaveScreenshot, no CI wiring' and covers one surface. Every other post-freeze L6 ticket (read-model route rewires, resource-layer rework, belief archive) will churn surfaces with nothing catching regressions the way DG-022's one-off QA caught DG-043. Wire goldens and the state matrix into the npm gate across the active surfaces. Sequence after DG-043 lands — the axe-zero requirement fails on the player card until then — and ideally before the read-model rewires begin.

**How we know:** frontend/e2e/visual-smoke.spec.ts:2-6 (self-description verified 2026-08-26); proposal :633-645 (release-evidence requirements incl. state matrix and axe-zero); DG-043 open at /Users/davidleess/dg-build/BOARD.md:49; precedent: DG-022 QA catching three pre-existing defects (BOARD.md:249-258)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
