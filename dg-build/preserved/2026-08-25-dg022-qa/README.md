# DG-022 real-surface QA evidence — 2026-08-25 (lane ClaudeFable5-DG022-20260825)

The post-rebase QA run the 08-19 WIP was blocked on. Spec run PASSED (1 passed, 2.7s) against
the live app at 127.0.0.1:8122 (uvicorn serving the rebased tree + fresh dist), system Chrome
via playwright channel (cached playwright browsers predate the installed @playwright/test).

- `dg022-tank-{desktop,mobile}{,-mid-scroll}.png` — the four required captures, real Tank Dell surface
- `dg022-axe.json` — axe scoped to .dg-frozen-prediction: `[]` (clean, after the landmark fix)
- `dg022-axe-main.json` — axe over whole `main`: 2 PRE-EXISTING violations
  (.dg-two-lane__divergence contrast; dl.dg-two-lane__facts markup) → filed DG-043
- `dg022-mobile-overflow.json` — at 390px the PAGE overflows to 776px with or without DG-022's
  elements (probe-without-dg022.mjs hides them all and re-measures: still 776) → DG-043.
  DG-022's own elements: right edge ≤ 390 on both instances.
- Coverage at QA time, live API: 218 of 272 rostered skill players in the frozen cohort (54 not).
  The spec derives the expected card text from the live API at test time (card == API), replacing
  the WIP's hardcoded 08-19 measurement "221 of 274" — these counts are dated observations of a
  daily-refreshing artifact, not contracts.
- `wip-run-20260819T185543Z/` — the 08-19 WIP session's run record (handoff, original spec,
  trace), removed from the landing tree; also preserved on origin/ticket/DG-022 @ 86e9d218.
