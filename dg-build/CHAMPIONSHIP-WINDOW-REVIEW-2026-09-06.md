# Week-17 increment — reviewed local research preview

The coordinated candidate is accepted for local research inspection, not production promotion, a complete dynasty valuation, or a trading-edge claim. The default preview is pinned to the reviewed run and independently verified by root.

Preview: [open the reviewed default](http://127.0.0.1:8787/?surface=research-preview). [Exact reviewed run](http://127.0.0.1:8787/?surface=research-preview&run=20260906T203007Z). Previous comparator `20260906T171037Z` and every original producer run remain preserved.

## What changed for David

- Modern fantasy-season outcomes stop at NFL Week 17, with equal weekly weighting. Both models were freshly fitted and historically evaluated against the same outcomes. Historical ability features still include all NFL games under DG-024.
- Both views provide research impact estimates for all **27 David players and 274 league-rostered players**. The complete eligible skill-player pool has 825 estimates and 3,334 without an estimate; this is not a claim that all current NFL players are covered.
- Travis Hunter now receives a WR forecast through a general historical offensive-role rule. His 2025 source contributes 63.8 research-PPR points in seven games. His current impact estimate is zero because the model forecasts him below the WR reference, not because his record is missing. This is not an instruction to drop him or a statement that his dynasty value is zero.
- Two- and five-year views share the same annual terms and reference player. All 825 checked estimates satisfy that rule. The old all-regular-season model comparison is omitted because its target differs.
- The current roster census preserves all owned players and distinguishes active, injured, practice-squad, cut, retired and uncertain identities. Reverse-ID collision guards corrected false active matches.

## Exact handoff

| Component | Accepted evidence |
|---|---|
| Shared outcomes, DG-179 | New uncommitted module/CLI/tests in `/Users/davidleess/dg-wt/DG-179`; immutable `runs/20260906T194819Z/league_season_outcomes/` |
| Rookie producer, DG-165 | `e5151cda`; immutable `runs/20260906T195904Z/dg165_rookie_capital/`; 80 current rookies; cohort companion SHA `8ef52aba8a74f038ba3805a1738f24e0e414a700db031883d8c2b7cadb91121f` |
| Veteran producer, DG-177 | `727e9648`, correction code `528f989c`; immutable `runs/20260906T195728Z/dg177_basic_horizons/`; corrected manifest and evaluation-status companions beside that directory; 759 current forecasts |
| Current census, DG-178 | Guard `a20365d5`; `runs/20260906T202057Z/dg178_current_census/`: 784 unique listed-or-owned IDs, including 274 owned; 498 active, 137 practice squad, 68 IR, 68 cut, 6 retired, 1 exempt, 3 unverified joins, 3 identity-unknown; 141 unclaimed NFL skill records remain visible |
| New-target grading | `runs/20260906T202159Z/dg178_grading/report.json`, both historical prediction files hash-bound to the common target |
| Final composition | Generated at clean `26ba557d2682a308630913bbdddc1cf54ef13e9b`; checkpoint `f023478c`; `runs/20260906T203007Z/dg178_audit/report.json` SHA `78838e5785dd7bfc9c120b0e2a4977ddaad0e4acb57e0c5a7b79d5afaa7561f8` |

Common outcome CSV SHA `199a48beb96a25f5dad50758b3f72b40a5d7d0cf2000f7cdaf2f411873c6ecb8`; manifest SHA `d3812d0d56b50971e98552fed4f791d3132eeffa7c242601e7c609285863ba18`; target `049d2229c4ba06eececba66a083a777142f85ff0f459b0499912f49fa0ca3c6a`. Both boards bind veteran evaluation status SHA `05a010038bf368ec43372209c860247f016dedc1e152bfbf0addd2241eefd2d9`.

Root recursively compared the final audit with `202257Z`: only run ID, launch provenance and evaluation-status hash fields changed. No player value, annual term, reference, target or grading number changed. Rookie evaluation comes from the separately hash-verified `evaluation.json`; its optional status-source hash is null, not an unbound external companion.

## Verification receipts

- Root common contract: `pytest -q -p no:cacheprovider tests/contract/test_league_season_outcomes.py` — **68 passed in 7.97s**. Offline Ruff passed all four new Python files.
- Root independent arithmetic script checked all **46,274** output player-seasons against **442,167** identified weekly rows, with zero discrepancies; actual hashes checked. Preserved 298 negative season totals and 821 known outside-window-only zero-appearance pairs.
- Rookie independent review reproduced all 18 outer folds, policy choices and final predictions before the guard-only correction (maximum floating-point difference 2.84e-14). All 16 declared output hashes passed. Final adapter/capital suite: **51 passed**; builder broader focused receipt: 60 passed. All 80 draft keys retained. Captured 2,238 picks, fitted cohort 2,083; 155 uncovered 1999/2000 picks excluded, never zero-labelled.
- Veteran independent review checked all 30,279 historical prediction labels against the shared artifact, all 759 forecast probability-times-conditional-value identities, historical closure and all-NFL-game features; zero discrepancies. Focused reviewer tests: **113 passed**; builder DG-177 suite: 164 passed. Outer fold counts by horizon are **14/12/9/5/1** for each position.
- Census independent review: source and census hashes pass; actual single-claim reverse-ID counterexample is unknown, not active. Census/annual-adapter tests: **60 passed**.
- Root integration/route suite: **242 passed**. One pre-existing legacy Ridge serialization-version warning remains; it is not a new producer failure. Builder full backend receipt at `09c764fa`: 7,403 passed, 32 skipped; not claimed as a full-suite run at the later metadata-only checkpoint.
- Actual Claude rookie and veteran lanes independently cross-checked the candidate joins, source bindings, reference values and annual terms; both passed. The veteran lane also checked the regenerated final audit.
- Root real-surface run: `node /private/tmp/dg178_root_preview_qa.mjs 20260906T203007Z`. Evidence `/private/tmp/dg178-root-qa-m1Lixs/result.json`; screenshots in that directory inspected. HTTP 200, no page errors, both tabs and Why/Hide controls work. At 390px, the document is 390px wide; wide tables have their own scroll container. Desktop 1440px checked. All 27 roster and 274 league rows independently compared across horizons; zero prefix/reference failures.

## Scientific limits and follow-up, not silently solved

1. The target is the explicitly named **research PPR preset**, not David's exact scoring. All-unit lost fumbles, recovery touchdowns and individual special-teams forced-fumble/recovery bonuses need additional attribution. Exact-league mode refuses incomplete attribution.
2. Game-ID coverage for 2001–2025 is checked against the official schedule, not proof of perfect individual statistics. Three missing completed games exclude 1999/2000. Six nonzero unidentified records and 524 zero placeholders are quarantined, not fabricated as player zeros. The canceled 2022 BUF-CIN game is not an appearance. [Full source review](DG179-COMMON-OUTCOME-REVIEW-2026-09-06.md).
3. Historical outcomes before 2021 use normalized source weeks 1–16; later seasons use 1–17. This is a common modelling convention, not a reconstruction of David's former league settings.
4. Historical evaluation is retrospective with forecast cutoffs enforced, not untouched confirmation. The rookie policy menu was refined after historical inspection. Veteran year five has one test season and remains weak evidence. No market-beating claim follows from these results.
5. Future comparisons carry forward the same player available today. This is an explicit scenario, not known future waiver access. Reference aging sensitivity is recorded; no new football preference was imposed. The assembled historical grade uses a replacement-rank proxy, not reconstructed historical waiver availability. Weekly lineup decisions, trade value, picks and option value remain outside the impact number.
6. Immutable metadata corrections remain explicit: the veteran corrected companion supersedes stale original/embedded text; exact producer launch code identity was not captured, although the inspected intervening diff is metadata/tests only. Future veteran runs should capture launch identity. Rookie legacy `definitions` prose still says full REG; authoritative `outcomes` and `units` specify the championship window. Future writer prose should follow those fields. The source-preparation packaging `.gitignore` hash was stale and disclosed; scientific data hashes match. No blanket claim that every original metadata field is correct.

## Human gate and preservation

No root commit, push, merge, model promotion, production restart, dependency install or paid-data upload. Shared trunk and shared datasets remain untouched by root. Actual Claude checkpoint commits stay on their ticket branches. All original evidence and worktrees are retained intentionally for review. The isolated local preview is the only surface authorized to change its default run.

Final default-pin check passed at **2026-09-06 20:34:46Z**: `source.run=20260906T203007Z`, `pinned=true`, HTTP 200, no page errors, all coverage and cross-view checks passed. Root evidence: `/private/tmp/dg178-root-qa-4oFzCz/result.json`; screenshots alongside. Mobile tables are 366px wide with contained horizontal scrolling and keyboard-focusable containers; the whole page remains 390px wide. Integration final HEAD `d10e8b42`, clean tree. DG-165 tree clean; DG-177 intentionally retains untracked historical artifacts. DG-179 intentionally retains uncommitted implementation, plan and evidence for the human gate.

Autonomy receipts are recorded in the DG-179 worktree. `dg-autonomy finish` completed successfully: phase `gate`, terminal **READY_FOR_GATE**, reason "Authorized implementation and verification are complete." This closes the bounded increment, not the broader personal-dynasty-app programme or the publication gate.
