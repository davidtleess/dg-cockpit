# DG-228 — rank and season visual explanations

**Status:** READY_FOR_GATE — implemented and independently accepted in DG226; local source, not published.
**Lane:** Claude54281
**Parent:** DG-226

## Outcome
Show the exact rank disagreement, projected football trajectory, timing of credited advantage, and replacement/horizon assumptions.

## Owned files
- `lovable/src/components/dg/CohortChart.tsx`, `ValuationBreakdown.tsx`
- New `SeasonOutlook.tsx`, exporting `SeasonOutlook({ row }: { row: BoardRow })`
- New pure visualization helpers and specifically named tests.

Do not edit PlayerDrawer. DG229 owns it. Root will replace its existing local SeasonOutlook with your exported component after integration. You may wire the import only in your private preview copy for QA. No backend/schema/value/price edits.

## Acceptance
1. Label the common rank axis at 1, its midpoint and N. Use distinct blue model and amber market marks, exact interval spans and printed ranks. A neutral connector may show guaranteed separation between disjoint intervals. Never use a midpoint as an exact tied rank, exaggerate spacing or imply confidence. Handle singleton, first/last rank, broad floor ties, overlap and missing ranks. Prevent marker overflow; refuse mismatched denominators.
2. SeasonOutlook uses actual row.seasons on one clearly labelled projected-points scale anchored at zero, with negative extent when signed forecasts require it, with printed values readable at 320px. Missing values have no invented bar, zero remains zero, negative forecasts retain their sign, and starting estimates stay labelled. Do not interpolate across missing years. Use existing dependencies or SVG/CSS.
3. Separately show credited advantage in the first two versus later three seasons using validated detail. Label the exact years, sums and units. Keep football points distinct from credited advantage; zero credited never means zero projected production. Missing detail produces no invented timing split.
4. Explain the named replacement's actual projected path and the sum of annual positive margins. Retain 1/2/5-season ranks and values plus inspectable arithmetic. Do not say compounding, five fully played seasons, guaranteed longevity, or age-specific causes absent from the data. Shorter horizons may or may not change the disagreement; Stafford's ranks 9/8/10 do not establish that a shorter horizon resolves his gap. Keep the explanation concise and avoid duplicate visual clutter.
5. Test chart bounds, ties, overlap, mismatched cohorts, exact timing sums, zeros, missing values, legacy readings and starting estimates. Inspect real Stafford, Rasheen Ali, a broad floor tie and an unforecast available player at desktop/390/320. Return the new component contract clearly.

## Shared rules and handoff
Read the combined disposition at `/Users/davidleess/dg-wt/DG-226/runs/20260911T015621Z-frontend-review/combined-review-disposition.md`, plus applicable AGENTS.md and PRODUCT.md. Both independent reviews are complete. David authorized these bounded improvements. Your isolated worktree already contains the preserved DG226/DG221 baseline on main d05315e7; the baseline manifest distinguishes inherited changes from yours.

Write a short native plan before edits. Use meaningful tests for ordering, numeric mapping, missingness and changed interactions. Run relevant tests, typecheck/build and actual rendered desktop/390px/320px QA using existing dependencies. Existing Playwright is available through `createRequire('/Users/davidleess/dg-wt/DG-205/frontend/package.json')`. Use a fresh isolated headless browser. A private preview copy and data are supplied under your run directory; only that copy has release configuration set to null. Do not edit product release configuration.

No shared trunk/data/environment writes, dependency installs, frontend-studio access, model/capture/scheduler changes, commit/push/merge or publication. DG222 tracking is active and unrelated. Preserve original forecasts, ranks, source dates, prices, ownership, ties and missingness. Do not invent precision, probabilities, market movement, profit or proof of an edge. Do not overwrite completed evidence.

Return an exact changed-file manifest relative to the supplied baseline, relevant commands/results, screenshots and a HANDOFF.md in a new run directory. Root integrates explicit files and performs independent QA. Do not return every inherited dirty file as your work. Finish READY_FOR_GATE for root review.

## Final disposition

Root integrated the reviewed source and closed known findings. See [combined final handoff](/Users/davidleess/dg-wt/DG-226/runs/20260911T015621Z-frontend-review/HANDOFF.md) for exact source ownership, validation, preserved data and the publication boundary.
