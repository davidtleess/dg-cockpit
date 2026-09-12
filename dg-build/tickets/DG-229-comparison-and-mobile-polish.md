# DG-229 — immediate comparison and phone polish

**Status:** READY_FOR_GATE — implemented and independently accepted in DG226; local source, not published.
**Lane:** Claude54410
**Parent:** DG-226

## Outcome
Show the selected pair immediately and make the comparison, labels and phone controls easy to use.

## Owned files
- `lovable/src/components/dg/PlayerDrawer.tsx`, `AppShell.tsx`, `Cells.tsx`, `polish.css`
- `lovable/src/routes/trades.tsx` and a new `compare.tsx` alias
- New PlayerComparison component, pure comparison helpers and specifically named tests as needed.

Root integrates the generated route manifest. Do not edit discovery routes, queries, TrackRecord, charts, valuation breakdown, validation or release config. Keep the current local SeasonOutlook function unchanged; root will replace it with DG228's exported component after your handoff.

## Acceptance
1. On the comparison route, the selected pair renders on the main canvas below selectors without an unsolicited full player-dossier overlay. From an individual drawer, a selected comparison appears before long valuation sections. Preserve shared URLs, back/forward, snapshots, clear/loading/error/missing behavior and ordinary single-player inspection. Existing `/trades?player=421&compare=3294` links remain usable. Handle identical-player selections honestly.
2. Show distinct model points and market prices, exact 1/2/5-season ranks on the same cohort with tie intervals, and actual annual points side by side. Missing/legacy/unpriced values stay missing. Use data-driven years and readable 320px layout. No ROI, trade equivalence, lineup gain or validation claims.
3. Use compact values inside panels/table rows whose headers already declare units. Remove duplicated FantasyCalc price and points suffixes while keeping the units clearly visible and accessible.
4. GapCell may add a small neutral directional glyph alongside higher/lower text. Cross-source disagreement is not a price change over time: do not apply green/red movement or buy/sell colors. Ties, overlap and unavailable remain distinct. Blue and amber remain the model/market lanes.
5. Bottom navigation, drawer close and comparison clear controls are at least 44px at 320/390px. Preserve Lovable badge and safe-area clearance. Keep drawer identity/close reachable while scrolling long content. Preserve focus containment and Escape.
6. `/compare` redirects to or renders the same working comparison view, preserving query parameters. Existing `/trades` links remain valid; the existing nav was not broken.
7. Verify changed pair/deep-link/query behavior, legacy/missing/zero and annual/horizon cases, plus real desktop/phone keyboard/touch interactions. New-flow tests should protect existing deep links; do not add redundant tests merely because the old flow already worked.

## Shared rules and handoff
Read the combined disposition at `/Users/davidleess/dg-wt/DG-226/runs/20260911T015621Z-frontend-review/combined-review-disposition.md`, plus applicable AGENTS.md and PRODUCT.md. Both independent reviews are complete. David authorized these bounded improvements. Your isolated worktree already contains the preserved DG226/DG221 baseline on main d05315e7; the baseline manifest distinguishes inherited changes from yours.

Write a short native plan before edits. Use meaningful tests for ordering, numeric mapping, missingness and changed interactions. Run relevant tests, typecheck/build and actual rendered desktop/390px/320px QA using existing dependencies. Existing Playwright is available through `createRequire('/Users/davidleess/dg-wt/DG-205/frontend/package.json')`. Use a fresh isolated headless browser. A private preview copy and data are supplied under your run directory; only that copy has release configuration set to null. Do not edit product release configuration.

No shared trunk/data/environment writes, dependency installs, frontend-studio access, model/capture/scheduler changes, commit/push/merge or publication. DG222 tracking is active and unrelated. Preserve original forecasts, ranks, source dates, prices, ownership, ties and missingness. Do not invent precision, probabilities, market movement, profit or proof of an edge. Do not overwrite completed evidence.

Return an exact changed-file manifest relative to the supplied baseline, relevant commands/results, screenshots and a HANDOFF.md in a new run directory. Root integrates explicit files and performs independent QA. Do not return every inherited dirty file as your work. Finish READY_FOR_GATE for root review.

## Final disposition

Root integrated the reviewed source and closed known findings. See [combined final handoff](/Users/davidleess/dg-wt/DG-226/runs/20260911T015621Z-frontend-review/HANDOFF.md) for exact source ownership, validation, preserved data and the publication boundary.
