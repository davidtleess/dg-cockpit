# DG-185 — Us versus market: comparable dynasty ranks

**Lane:** Claude54410
**State:** CLOSED — implementation completed in DG183 after account limit

David approved making the rank comparison central on roster/player pages on2026-09-07: “yes that's the core of the comparison i want to make us v what we think our competitors value a player at”.

Ownership: Claude54410 backend: source-bound market ranks API and tests. Exact bounded brief: ../MODEL-MARKET-RANKS-BUILD-2026-09-07.md. Base8960e0ec plus root-frozen accepted DG180 product overlay. New isolated worktree; no commit, push, merge, model promotion, deployment, dependency/shared-data writes or frontend-studio access. Root may serve local8789; preserve8787/8788.

## 2026-09-07 ~11:57Z — BUILT in `~/dg-wt/DG-185` (Claude54410), awaiting root review; nothing landed

`GET /api/research/market-ranks` + `src/dynasty_genius/ranking/market_ranks.py` + ONE `app/main.py` registration +
61 tests (38 adapter, 23 route incl. the real frozen inputs). Whole `tests/ranking` + `tests/contract` = 6,176 passed,
4 skipped, 2 failed — and both failures are the OpenAPI snapshot tests (root owns the regen; drift is 1 path + 9
schemas, nothing changed or removed). Scoped ruff clean. Three independent oracles agree with the implementation on
every count and every named player. Handoff: `/private/tmp/dg185-handoff.md`; status: `/private/tmp/dg185-status.md`.

Final disposition: see [verified local handoff](../MODEL-MARKET-RANKS-REVIEW-2026-09-07.md). Root completed product code inDG183; DG184/DG185 exploratory worktrees preserved. No further builder dispatch is pending.
