> **Publication update (David local September 7): MERGED AND BUILT.** David authorized “merge and build.” GitHub main is `a85f726f23cad759d17877ce2762f93b30d9294f`; code commit `8db0eb80b61813fa4c03d492289583b5fd012bce`. Official `dg-land.sh` passed 7,489 backend tests / 37 skips and 832 frontend tests, merged and pushed exactly the 26 reviewed paths. Exact merged code built from clean source in `/Users/davidleess/dg-wt/DG-186-merged`; build manifest names this merge SHA and `source_dirty=false`. Original preview/evidence retained in DG-186 on `preview/DG-186-retained-20260908`, preview8790 remains available. Shared main checkout and all 46 pre-existing dirty/untracked file hashes are preserved. No production restart/deployment. Publication evidence: `/Users/davidleess/dg-wt/DG-186/runs/20260908T010036Z/publication`. GitHub CI run34175461387 completed: frontend passed; backend7444 passed/61 skipped and the same21 failing test IDs as parent run34120678298. No introduced failures; no tests or guards weakened. Exact comparison in publication/ci-comparison.json.

# DG-186 — Claude Design workspace handoff

Implemented David’s selected workspace as native Dynasty Genius React UI, backed by existing verified APIs. Paired overall ranks make our view comparable with FantasyCalc over the same 388 players. Model points and market prices retain distinct units. No model, calibration or production changes.

Preview: http://127.0.0.1:8790/?surface=workspace&view=roster

Latest implementation: `/Users/davidleess/dg-wt/DG-186`, branch `ticket/DG-186`, based on origin/main `2a4bcb8e124beb30187bc401fcfc696e76d338ff`. Not committed, pushed, merged or deployed by this increment.

## Delivered behavior
- Responsive desktop rail and phone navigation, global player search, side-by-side ranks and expandable player explanations.
- All 27 roster players and 433 relevant available players; 360 available players with numbers, 73 retained without forecasts. Missing stays distinct from zero; tied ranks remain intervals.
- Browser-local watchlist preserved across reloads. Available-versus-roster comparison separates current and future forecasts and limits point differences to matching positions.
- Today selects the five largest guaranteed positive roster rank gaps, without claiming a demonstrated edge. What changed shows actual dated market deltas and saved watch additions; it does not invent model history.
- Comparison-source failure remains visible, including during search. Availability comes from the explicit default unowned population.

## Evidence
- `npm run gate`: 111 test files / 828 tests pass, typecheck, Biome, banned-language and build pass. Final log: `DG-186/runs/20260907T145347Z/verification/frontend-gate.log`.
- `node /private/tmp/dg186-final-qa.mjs`: 18 desktop/phone states, zero axe violations, no horizontal overflow or browser errors; exact 433 available IDs, 27 roster rows, persistent watches, same/cross-position comparisons, tie/missing and source-failure states. Evidence: `DG-186/runs/20260907T144612Z/browser-qa/`.
- `.venv/bin/python scripts/dg183_verify_market_ranks.py <DG-183 frozen manifest> --url http://127.0.0.1:8790`: all 836 rank-union rows verified against original inputs. Relevant ranking/comparison backend suites: 44 passed, 4 private-fixture skips. No backend code changed.
- Actual Claude builders: sessions fa00374f-ec34-45ea-9ec0-926acc034407 (DG-187 frame/compare) and 245fd3a2-d8ac-4908-9aad-b156da509998 (DG-188 board/panel). Root integrated and inspected desktop/phone behavior.
- Independent actual Claude reviewer 376f54b0-2909-46df-837c-ace5852eb144 verified current fixes and reran all 828 tests and static checks. All 26 market deltas independently reconciled to the capture database. Final disposition 14:54Z reports no concrete open findings; its additional adversarial lenses were still pending, so those are not claimed as completed evidence.

## Preservation and publication boundary
Authenticated Claude Design import includes the selected HTML, support.js and required sibling imports. Originals and hashes remain private under `DG-186/runs/20260907T142945Z/design-source/`. The canvas support runtime and sample values are not product dependencies.

Shared trunk, shared stores and existing previews were preserved. No dependency installation. Preview 8790 remains running; temporary source-viewing server 8791 stopped. Existing CSS census rows unchanged; only new workspace rows/totals added. `git diff --check` passes.

**Do not stage `runs/` or the preview-only tracked type change at `app/data/valuation/universe_market_divergence_latest.json`.** Explicit publication allowlist and code hashes: `DG-186/runs/20260907T145551Z/handoff/publication-allowlist.json`.

Known limits: displayed football/market rank inputs are the frozen September 6 snapshots; market history separately uses September 6–7 captures. A market-wide baseline is not computed by this UI; copy explains that raw changes include market-wide movement. Watchlist history covers currently saved additions only. Rank disagreement is a hypothesis, not proof of predictive advantage.

Final post-build check: direct Available URL defaults to this-season ordering and shows all 433 players; revised History/Compare copy verified in the browser, zero axe violations. Receipt and final phone screenshots: `DG-186/runs/20260907T145347Z/verification/`.

## Follow-up after David’s “keep going” — 2026-09-07
The late independent review returned three concrete findings after the earlier gate. Root corrected all three in the same DG-186 worktree:
- Zero-tie explanation now says each season is at or below replacement and explains that the valuation floors negative advantages. The underlying contract enforces `advantage == max(0, expected_margin)` in `src/dynasty_genius/ranking/market_ranks.py:212`; no values or ranks changed.
- Available rows include the displayed forecast, precision and starting-estimate caveat in their accessible name. Four new cases cover current/future, small positives, true zero, missing forecasts and unranked identities. New expectations failed before the fix and passed after it.
- Rank markers remain within the track at its right edge. The caption explains that narrow intervals share a minimum visible width; exact printed bounds remain authoritative.

Fresh `npm run gate`: **111 files / 832 tests pass**, static checks and build pass. Focused real-browser checks at 390 and 1440 pixels verify the last market rank retains its full four-pixel marker, the large zero tie retains its true 159/388 span, forecast labels are accessible, no overflow or browser errors, and zero axe violations. Root inspected the final phone screenshot. Evidence: `DG-186/runs/20260907T160714Z/late-review-fixes/`. `git diff --check` passes.

Updated explicit publication allowlist and hashes supersede the earlier list: `DG-186/runs/20260907T160900Z/late-fixes-handoff/publication-allowlist.json`. Existing scope and publication exclusions remain in force.

Independent Claude review at 16:09Z: all three late findings independently verified fixed, full 832 tests and static checks pass; final disposition CLEAR. Preserved in `DG-186/runs/20260907T160900Z/late-fixes-handoff/independent-review.md`. Root’s browser verification also passed. READY_FOR_GATE.
