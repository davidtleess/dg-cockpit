# DG-231 — laptop board usability

**Lane:** Claude54331
**Status:** APPROVED — bounded follow-through under DG230.

Fix the observed sticky-filter collision and laptop board density, using the accepted DG226 source as baseline. Own lovable/src/components/dg/Board.tsx, lovable/src/routes/board.tsx, AppShell.tsx for dynamic header offset if needed, and narrowly scoped polish.css. Evidence and meaningful behavioral tests stay in your worktree. No ranking/data/navigation semantics changes; no other route/components or shared helper edits without coordination.

Acceptance: controls visible and hit-testable after scroll and resize; header/control heights may wrap;1280/1366 get readable dense rows with every existing figure and no horizontal overflow;1024 has useful viewport space;320/390 retain readable values and44px controls. Measure the real minimum widths, do not merely lower1400breakpoint and cause overlap. Keep paging behavior unchanged. Relevant tests/types/lint/build and actual Chromium frames. No source publication, dependency install, shared writes, production, frontend-studio, or old evidence edits. Root owns integration and gate.
