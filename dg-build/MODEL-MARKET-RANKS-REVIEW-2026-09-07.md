> **Publication update September7:** David explicitly authorized commit, push and merge. Code is now on GitHub `main` at `2a4bcb8e124beb30187bc401fcfc696e76d338ff`; public branch `ticket/DG-183` contains `737d769c52492c58ca0dc3db2269e188edcd3be0`. Official landing gate:7489 backend passed/37 skipped and754 frontend passed. The public release is a fresh125-file code export;415 private evidence/doc paths and the preview-only market symlink were excluded. Original64-commit local history retained in `/Users/davidleess/dg-wt/DG-183`, branch `preview/DG-183-retained-20260907`, commit `c0aceadb`. Preview8789 remains running. Shared main checkout and its pre-existing dirty files are byte-preserved; no production restart/deployment. Landing evidence: DG183`runs/20260907T120803Z/landing/`. GitHub CI run34120678298 finished: frontend passed; backend7444passed/61skipped with exactly the same21 failing test IDs as parent main. No introduced CI failures. The pre-existing failures involve private input files and machine-specific paths; no CI guards were weakened.

# Us versus market — complete, READY_FOR_GATE

David can now compare our independent overall rank with FantasyCalc's market rank on the actual Roster page and player card. Both use the same388-player population, with plain higher/lower explanations, honest tied ranks, and missing values left missing. Global player search on desktop and phone reaches owned and unowned players from the full836-player comparison population. FantasyCalc represents the broader market, not a particular league mate's private price.

**Open:** http://127.0.0.1:8789/?surface=roster — opened with the macOS default-browser command. Local server PID38288, worktree `/Users/davidleess/dg-wt/DG-183`, base8960e0ec plus accepted DG180 overlay and this increment. Existing8787/PID20884 and8788/PID3357 preserved. No commits, pushes, merges, deployments, dependency installations or model promotions.

## Football meaning and limits

Our rank uses the accepted five-year2026–2030 above-replacement valuation, five equally weighted years; no market price or rankings enter its calculation. FantasyCalc values independently determine the market ordering. Both primary ranks are recomputed over the same388 players; exact equal values share inclusive rank intervals. Signed gaps are market-minus-ours, with 'at least' wording for disjoint ties. Overlapping intervals do not imply a clear preference.

Saved sources are September6:825 model players,399 market players,24 excluded draft picks,388 common,836 union. Your saved roster has27 players,26 common; Rasheen Ali has no market price and remains visible.159 common model players share rank230–388 at zero advantage; zero advantage is not zero football points or a complete valuation of speculative upside.571 of825 on the full model board have zero advantage. The UI does not fabricate a FantasyCalc-scale fair price or claim a proven edge, breakout probability or lineup gain.

League verified12-team Superflex/fullPPR/noTEpremium, championship throughWeek17 per David. Research scoring and future replacement assumptions are disclosed. FantasyCalc's raw published player rank is1–399 in this capture, excluding picks; original source field is preserved in details. Its tie-broken native rank is distinct from the tie-preserving primary market rank.

## Verification

- Final frontend gate:754 tests across104 files; typecheck, lint, banned-language and build pass. Existing lint/build warnings remain; no new failing check.
- Broad relevant backend run306 passed; final focused19 passed including portable synthetic source tests and the added report-bound snapshot-hash regression. Ruff and git diff whitespace checks pass.
- Independent raw-source counting verifies all836 rows, every paired/full-model rank interval, original FantasyCalc rank, annual values, roster flags and signed gap. Live8789 endpoint matches the saved payload. Source tamper, wrong slots/settings/dates/target and missing enabled configuration fail explicitly; absent configuration retains legacy mode.
- Built desktop1440 and phone390: all27 roster rank cells match source; no horizontal overflow; strict, missing and structural-tie cards verified. Keyboard opens details and returns focus correctly. Six primary roster/card/details axe checks and an additional phone global-search card check have zero violations.
- Global search reaches market-only/unowned Will Howard on desktop and phone and says no accepted five-year valuation. Trade search keeps the existing catalog.
- Available Players remains433=360 with numbers(349 original+4 recovered+7 labelled starting estimates)+73 missing. Browser-local watchlist persists after reload. Joe Flacco versus Tucker Kraft still opens the current/future comparison; its API response is identical to8788. Original825 forecasts preserved. Watchlists remain local to their browser origin; opening a new local port does not migrate another port's saved list.

## Evidence and coordination

Frozen inputs: DG183`runs/20260907T112015Z/inputs/market-ranks-manifest.json`. Final UI evidence: `runs/20260907T114713Z/browser-qa/` (receipt, source payload, images, axe, preservation and phone-search receipts). Final source snapshot and DG183-only patch: `runs/20260907T115732Z/handoff/` with42 exact product files and SHA256manifest. Independent reviews are archived there.

All three actual Claude sessions were freshly verified and dispatched:54331/fa00374f UI(DG184),54410/245fd3a2 API(DG185),54281/376f54b0 source/spec review. All reached the account monthly spending limit before product implementation. Their source review completed; root implemented inDG183, preserving their isolated worktrees. An internal read-only reviewer independently audited the implementation and final browser evidence; it was not represented as an actual Claude builder. No active Claude assignment remains.

The roster422configuration error was fixed on8788 earlier. New configured roster/card mode directly uses its validated source, making no legacy roster-audit or individual player-scoring request. Private cache and copied current published inputs support remaining existing routes.

**Runtime-only exclusion:** DG183`app/data/valuation/universe_market_divergence_latest.json` is a local symlink to a frozen current published copy. It is NOT in the product-file manifest and must NOT be committed or landed. Original tracked bytes are preserved at`runs/20260907T114058Z/preview-inputs/original-tracked-market.json`. Private cache/runtime/evidence and the source manifest are local setup, not model promotion. Nothing in shared data was edited. No dependency, production or off-limits directory access occurred.

No further football question is needed for this approved increment. Next action is David trying the local comparison; publication remains outside this authorization.
