# DG-065 — Posture label contradiction on the morning surface (REBUILDING vs UNCLASSIFIED)

**Layer:** 4  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 0.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** team_posture.david_posture says REBUILDING while team_value.david_value_summary.posture_label says UNCLASSIFIED, both about the owner's own team on the same morning surface. The season spec names this 'Real, unfixed' and calls it the 'first post-kickoff correctness item on a surface' — but assigns it no SR number and no board ticket carries it, so it is currently on track to be lost. A self-contradicting verdict about his own roster teaches the owner to distrust the surface every value-bearing signal must travel through. Fix is small: one source of truth for the posture verdict, the other surface reads it or is removed.

**How we know:** SEASON-BUILD-SPEC.md:105 ('Real, unfixed, named here so it is not lost'); SEASON-BUILD-SPEC.md:1595 ('NEW · the posture_label contradiction... First post-kickoff correctness item on a surface' — unnumbered); src/dynasty_genius/team_posture.py:10 (schema team_posture.v1); BOARD.md Layer column shows no ticket for it

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
