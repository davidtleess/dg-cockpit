# DG-227 — discovery and browsing

**Status:** READY_FOR_GATE — implemented and independently accepted in DG226; local source, not published.
**Lane:** Claude54331
**Parent:** DG-226

## Outcome
Help David find model–market disagreements and browse the full player pool without endless scrolling.

## Owned files
- `lovable/src/routes/board.tsx`, `index.tsx`, `league.tsx`
- `lovable/src/components/dg/Board.tsx`, `TrackRecord.tsx`
- `lovable/src/lib/dg/queries.ts`, `search.ts` and its existing search tests (exclusive DG227 ownership for board URL-state persistence)
- New pure discovery/search/order helpers and their specifically named tests.

Do not edit Cells, AppShell, polish.css, PlayerDrawer, charts, comparison routes, backend validation or release configuration.

## Acceptance
1. Keep the full-universe default. Add a direction filter and explicit sorting by our rank, market rank or largest disagreement. Use existing comparison direction; magnitude is the minimum guaranteed absolute gap between disjoint rank intervals. Keep missing values last, overlaps distinct and ties deterministic. Never choose a hardcoded featured player.
2. Use 25-row pages with previous/next controls and a clear showing X–Y of N label. Filters and sorts reset the page; pages never renumber shared ranks. Search still reaches all 954 identities and Available retains all 433 players, including 73 without forecasts. Preserve query state, player/comparison selection, snapshots and back navigation; validate invalid query values. Bound the mounted rows to approximately 50 row images under the existing dual responsive markup.
3. Sort roster players within positions by our five-year shared rank, missing last, with an explicit sort basis. This is dynasty model order, not starting-lineup strength.
4. Show League current/future forecasts using the bundle's year labels. Root verified all 274 current league players carry them. Remove stale copy saying other teams have none; older bundles still show honest missing states.
5. Search prioritizes lexical match quality (full exact, token/prefix) before rank and stable name/id ordering, and sorts before the 20-result limit. Exact unranked names remain reachable. Do not infer starter status or hide unpriced players.
6. Add an optional forecast-points descending sort to the production Track Record table. Preserve saved-order default and all eligibility/evaluation totals. Keep null last and actual zero valid. Do not invent an ownership filter or sort market rows by a nonexistent production field.
7. Compact board controls/cards at 320/390px while keeping 44px controls, legible values and the shared-rank basis. Avoid a large sticky control panel obscuring the list. Test ties, overlaps, missing data, pages, filters, lexical search and old bundles.

## Shared rules and handoff
Read the combined disposition at `/Users/davidleess/dg-wt/DG-226/runs/20260911T015621Z-frontend-review/combined-review-disposition.md`, plus applicable AGENTS.md and PRODUCT.md. Both independent reviews are complete. David authorized these bounded improvements. Your isolated worktree already contains the preserved DG226/DG221 baseline on main d05315e7; the baseline manifest distinguishes inherited changes from yours.

Write a short native plan before edits. Use meaningful tests for ordering, numeric mapping, missingness and changed interactions. Run relevant tests, typecheck/build and actual rendered desktop/390px/320px QA using existing dependencies. Existing Playwright is available through `createRequire('/Users/davidleess/dg-wt/DG-205/frontend/package.json')`. Use a fresh isolated headless browser. A private preview copy and data are supplied under your run directory; only that copy has release configuration set to null. Do not edit product release configuration.

No shared trunk/data/environment writes, dependency installs, frontend-studio access, model/capture/scheduler changes, commit/push/merge or publication. DG222 tracking is active and unrelated. Preserve original forecasts, ranks, source dates, prices, ownership, ties and missingness. Do not invent precision, probabilities, market movement, profit or proof of an edge. Do not overwrite completed evidence.

Return an exact changed-file manifest relative to the supplied baseline, relevant commands/results, screenshots and a HANDOFF.md in a new run directory. Root integrates explicit files and performs independent QA. Do not return every inherited dirty file as your work. Finish READY_FOR_GATE for root review.

## Final disposition

Root integrated the reviewed source and closed known findings. See [combined final handoff](/Users/davidleess/dg-wt/DG-226/runs/20260911T015621Z-frontend-review/HANDOFF.md) for exact source ownership, validation, preserved data and the publication boundary.
