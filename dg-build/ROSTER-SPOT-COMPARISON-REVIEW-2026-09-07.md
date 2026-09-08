# Roster-spot comparison — final handoff, 2026-09-07

**COMPLETE · READY_FOR_GATE.** David can select an available player and one of his 27 saved roster players, compare their 2026 forecasts and their 2027–2030 four-season totals, and inspect the individual seasons and evidence. Start from the Compare players tab or Compare on an Available Players row. Changes preserve the other selection; both selections and the existing watchlist survive research-tab navigation. No player is nominated automatically.

Preview: http://127.0.0.1:8788/?surface=research-preview&tab=compare

## Football and scientific disposition

This is a production comparison on the accepted research basis, not calculated lineup improvement, dynasty value, or a drop recommendation. Different positions receive no numerical winner. Same-position differences name their period; near ties under one point are explicit. Zero, negative, missing and starting-estimate values stay distinct. Future years of starting estimates are labelled historical position averages, not breakout probabilities. Taxi/IR labels describe the saved roster only, not current pickup eligibility.

Saved league settings verified against the bound September 6 snapshot: 12 teams, Superflex, full PPR, no TE premium; championship Week 17 follows David's explicit ruling. The forecasts use the disclosed research scoring, not every exact league scoring category. Ownership/status are September 6 observations and may have changed; dates are in the evidence drawer. No live roster refresh or forecast recalculation was performed.

Preserved: original 825 forecasts and the accepted report/catalog bytes; default relevant pool 433 = 349 original + 4 recovered + 7 starting estimates + 73 visible missing. Comparison search offers these 433; explicitly opened cut/retired/unknown rows retain their exclusion labels. There are 510 unowned rows across all catalog populations and 27 David-owned choices. The previous negative stash-shortlist finding remains unchanged.

## Verified delivery

- Actual Claude builders: DG181 UI, PID54331/session fa00374f; DG182 API, PID54410/session245fd3a2; independent read-only reviewer PID54281/session376f54b0. Identities, direct authority and assignments were checked. Root integration is DG180, ticket/DG-180 from accepted8960e0ecf97677b1a79d077f21f4e2a2d9d33138. No internal agent substituted for these sessions.
- Root backend: `.venv/bin/python -B -m pytest -q -p no:cacheprovider tests/ranking tests/contract/test_research_available_route.py tests/contract/test_research_preview_route.py tests/contract/test_research_comparison_route.py tests/contract/test_openapi_drift_contract.py` → 318 passed. Independent reviewer: 29 new backend tests, zero skips, 27 malformed/missing-source probes.
- Root frontend `npm run gate` → typecheck, lint, 743 tests, copy check and build passed. After the three-file phone correction, `vitest run src/research src/styles/rawCssAudit.test.js src/styles/visualCraftAudit.test.js` → 90 passed; typecheck, scoped Biome and build passed. Reviewer independently reran the final 84 research and 6 style tests. Ruff and `git diff --check` clean. Existing seven unrelated Biome warnings, legacy pickle import warning and bundle-size warning remain.
- Independent source oracle `scripts/dg180_verify_comparison.py --url http://127.0.0.1:8788/api/research/comparison --out runs/20260907T101420Z/http_oracle` verifies all 3,759 numeric fields, raw snapshot roster membership/taxi labels, catalog identities and original producer values. Roster reconstruction differs from original CSVs by at most 2.84e-14 (floating arithmetic; declared abs tolerance1e-10 / rel1e-12). Inputs verified by hashes.
- Actual built Chromium desktop1440×1000 and phone390×844 inspected. Initial phone first-fold defect fixed: final pair ends y660, bottom navigation begins y783. Both players and all four values are visible without horizontal scrolling. Real negative/zero/missing/near-tie/cross-position cases, row entry, selection/tab/watchlist behavior, keyboard activation and source dates pass. Exact tie, incomplete future and API failure tested with browser-intercepted synthetic fixtures only. No JavaScript errors; zero axe violations in the changed comparison surface. WebKit executable absent; no browser installed and no Safari/device test claimed.
- Independent final review PASS on integrated phone-fix hashes. No blocking findings remain. Optional focus movement into the reopened chooser and phone badge/name wrapping remain minor polish; controls are keyboard reachable and names legible.

## Evidence and boundaries

All paths below are relative to DG180 unless otherwise stated:
- `runs/20260907T101420Z/http_oracle`: served payload, original-source expectations and result.
- `runs/20260907T102022Z/browser-behavior`: final behavior result and starting-estimate evidence.
- `runs/20260907T102035Z/final-surface`: final desktop/phone PNGs, axe result and geometry.
- `runs/20260907T102129Z/handoff`: original builder handoffs, phone-fix handoff, independent spec/backend/final reviews, full frontend gate log, reproducible browser scripts and final file hashes.
- Integration manifests: backend100444Z, frontend100955Z, phone-fix102000Z (all September7 runs).

No commit, push, merge, production deployment/restart, model promotion/refit, dependency installation or shared-data write. DG178 preview8787 PID20884 is preserved; DG180 preview8788 PID81550 is intentionally left running for David, cwdDG180, log `runs/20260907T101344Z/preview/server.log`. Browser contexts closed; worktrees and immutable evidence retained. No frontend-studio access.

Reviewer disclosed a design-skill update check that wrote its own `~/.impeccable/update-check.json` cache despite the review's /private/tmp-only output instruction. This did not touch product/shared data; root stopped further such checks. No claim is made that literally every tool wrote only inside a worktree.

Verification harness development failures are retained in earlier runs: an initial frontend wrong-cwd invocation, browser assertion spelling/rounding expectations and axe requiring an explicit browser context were corrected without product changes. The real product defect was the phone layout, fixed and independently verified. Latest results above supersede intermediate failures.

The authorized local increment is finished. Further product direction, merge and production publication are unapproved; no new builder work dispatched.

## Follow-up: roster navigation configuration corrected, 2026-09-07 10:49 UTC

David reported the main Roster page saying league/roster configuration missing. Root reproduced HTTP422: missing DYNASTY_SLEEPER_USERNAME. The isolated preview had no .env and the initial launch omitted the existing Sleeper configuration. Corrected ONLY preview8788 environment using the three allowlisted settings from the existing authorized .env: DYNASTY_SLEEPER_USERNAME, DYNASTY_SLEEPER_LEAGUE_ID and DYNASTY_SEASON. League ID and2026season match the bound September6snapshot. NFLREADPY_CACHE=memory. The main Roster route can refresh FantasyCalc's cache, so the DG180 app/cache symlink was first redirected to a private copy; shared cache hashes verified unchanged. No product/model code changed.

Current8788 process is PID3357 (supersedes PID81550 above), same DG180 cwd and frozen research pins. Evidence/response/desktop+phone screenshots, private cache and process record: DG180/runs/20260907T104929Z/roster-preview-fix. API200, all27 roster IDs match saved snapshot, actual roster navigation renders players, no config error. Existing legacy model-validation warnings/missing legacy scores are still shown; this fix does not claim to resolve those or replace the main roster's legacy model with the accepted research forecasts. Comparison payload unchanged. Preview8787 preserved.

For a future8788 relaunch, load only the three named configuration variables into the process from the existing authorized.env, keep app/cache private and NFLREADPY_CACHE=memory, and retain DG178_RUNS_ROOT=/Users/davidleess/dg-wt/DG-178/runs and DG178_PREVIEW_RUN=20260906T214512Z. Never source/export the full secrets file or restore a shared writable cache.

### Final follow-up disposition: current published inputs restored, 2026-09-07 11:01 UTC

The environment correction exposed a second preview defect: empty private runtime directories caused a June PVO seed fallback, and the tracked market file was July. That intermediate HTTP200 was NOT final acceptance. Root copied the existing published September6 PVO pair+marker and feature CSV+marker into empty DG180 private directories, checking hashes before/after. Root also copied the marker-pinned September6 league six-artifact set plus status/ready markers. The old tracked July market file was preserved intact in run-scoped evidence, and ONLY DG180's file reference now points to an immutable copy of the already-published September6 market artifact. This local absolute symlink MUST NOT be committed/landed. No original artifact bytes were overwritten and no shared source was changed.

Final evidence: DG180/runs/20260907T105539Z/published-runtime-copy and runs/20260907T105828Z/league-market-preview-copy. All27 roster scores match current published PVO rows by Sleeper ID; four league replacement explanations present. Player-detail check: Tucker Kraft model46.9 and FantasyCalc3264, September6 capture. Actual desktop/mobile roster navigation and player drawer inspected. The main roster still honestly shows existing legacy trust warnings and some missing legacy scores; those are separate from this fixed configuration/vintage problem. Accepted research comparison JSON remains exactly equal to the original verified payload. Shared source hashes unchanged. Port8788 PID3357 retained; no second restart needed because these loaders read per request. All browser contexts closed.

David's model/market comparability request remains a NEW PRODUCT DIRECTION under assessment/proposal, separate from this fixed preview bug. No common-rank feature or market-scale valuation has been implemented or claimed complete.
