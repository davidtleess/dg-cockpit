# Active build — player comparisons and reproducible scoring/transition evidence

Completion at22:08 UTC: **READY_FOR_GATE**. All three components and root's five verification receipts are complete; [final review](PLAYER-COMPARISON-REVIEW-2026-09-06.md) is authoritative. Instructions below describe the completed scope, not a request to restart it. Preserve local preview214512Z and both final audit runs; no merge or production publication.

David asked to continue building, then replied "k everyone is idle" to the three-track proposal. Root stated that it is proceeding with those tracks. This supersedes the preparation-only hold. Do not stop again to ask David technical questions or whether to continue this queue.

Approved design and invariants: [next increment design](NEXT-INCREMENT-PROPOSAL-2026-09-06.md). Each existing lane owns its isolated worktree and native implementation plan. Root owns coordination, independent review and final local-surface acceptance. The three components are independent: write a separate bite-sized plan for each, with exact files and red/green test commands, then implement that plan continuously.

## Lane 25057 — DG-178: player comparison board

Start from `d10e8b42`, preserving default run `203007Z`. Native plan: `docs/superpowers/plans/2026-09-06-player-comparison-and-current-coverage.md`.

Build:

1. In-page search over all 274 league-owned players already in each view. The default remains David's roster then league leaders; searching shows matches from the league collection, including players outside the top 40. Deterministic ordering, empty query resets, no-match state, both horizons and accessible label/clear control.
2. Zero, missing, exact-equal and near-zero explanations tied to the actual row and window. Never claim a missing veteran necessarily lacks a 2025 line. Never present zero impact as zero points/dynasty value. Braelon Allen remains 0 on two years and approximately 48.82 on five. No rounded "0 above/below" claim.
3. Existing Why details show each season's player expected points and reference expected points. Derive from finite full-precision margin plus reference only where both are present; check against actual producers, not rounded display values.
4. Bind census `runs/20260906T202057Z/dg178_current_census/` into a NEW audit. Read/hash the same bytes; verify census/report/source/league snapshot identities, season and uniqueness. Do not consume a mutable latest path. Keep unresolved/unmatched records visible and separate.
5. Show league-owned coverage first, then dated listed-player/current-status coverage, then archive scope where useful. NFL status comes from the verified census; fantasy ownership remains a separate fact. Hunt stays the selected unowned forecast reference but his NFL attachment is unverified. Do not substitute a reference or alter eligibility/value rules.
6. Refactor only as necessary into focused new helpers, such as `ranking/current_census_binding.py` and a pure frontend search/display helper. Primary files: `scripts/dg178/audit_roster_coverage.py`, `app/api/routes/research_preview.py`, `frontend/src/research/ResearchPreview.tsx` and existing CSS. Tests: focused new census-binding tests, `tests/contract/test_research_preview_route.py`, focused frontend interaction/helper tests.

Acceptance: every one of the 825 existing estimates, full-precision annual terms and reference identities unchanged; all 274 league records retained and two-/five-year prefix consistency exact. New immutable candidate audit, report provenance, focused/full relevant checks, desktop and phone browser QA. Keep 203007Z pinned until root verifies candidate. Root may then authorize isolated port-8787 pin, never production.

## Lane 23481 — DG-177: 2025 scoring audit tool

Start from `727e9648`, preserving all accepted forecast outputs. Native plan: `docs/superpowers/plans/2026-09-06-league-scoring-component-audit.md`.

Create a reusable pure scoring/attribution module, CLI and contract tests. Suggested owned files: `src/dynasty_genius/eval/league_scoring_audit.py`, `scripts/dg177/run_league_scoring_audit.py`, `tests/contract/test_league_scoring_audit.py`; choose consistent final names in your plan before edits.

Use already inspected raw weekly/PBP/Sleeper matchup files and captured saved league settings. Produce a new immutable run containing source manifest, per-player-week components, attribution/event ledger, reconciliation rows and explicit unresolved/excluded counts. Include full 2025 REG for source comparison but label championship weeks 1–17 separately; do not silently include Week18 in the championship target. Compare league-matched player-week points, record denominator/coverage and every mismatch. Never call the rostered comparison full-universe proof.

Credit individual scoring keys only. Team `fum_rec`, `ff` and other DST keys must not become individual offensive-player bonuses. Test the own-recovery counterexample from preflight, multi-event plays, event ordering, no-play/nullified events, missing IDs, muffs/out-of-bounds, negative scores, overlapping touchdowns, settings mismatch, duplicate player-weeks and unknown source coverage. Do not hardcode player names or patch the eight observed residuals. Classify unexplained differences as unresolved. Re-audit the PPR quarantine under any added components, preserving original exceptions. Unsupported applicable keys or required unresolved attribution forbid exact qualification.

Also fix the already scoped future-run launch provenance capture so a run records start HEAD/dirty state rather than pretending finish HEAD proves launch identity; test it without rerunning the forecasts.

No full-history new labels, no model refit, no revised player forecasts. Once the tool passes, run it on the actual 2025 captured files and hand root exact command, source/output hashes, residual counts and examples. Then cross-check the DG-178 new player/reference details against your frozen annual forecasts.

## Lane 24974 — DG-165: transition-audit tool

Start from `e5151cda`; accepted rookie/veteran outputs stay frozen. Native plan: `docs/superpowers/plans/2026-09-06-rookie-veteran-transition-audit.md`.

Create a reusable audited join/diagnostic module, CLI and contract tests. Suggested files: `src/dynasty_genius/rookie/transition_audit.py`, `scripts/dg165/audit_rookie_transition.py`, `tests/contract/test_rookie_transition_audit.py`; choose final consistent names in plan before edits.

Join the accepted rookie year2 and veteran horizon1 after the rookie season by verified identity and draft/feature/target years, not row order. Verify actual input hashes, same target and identical labels; assert unique keys. Record both forecast origins because the veteran has one more year of NFL information. Capture players who lack a rookie-year veteran cohort row, especially no-stat/zero-appearance cases; do not hide them from the denominator or fabricate forecasts.

Produce immutable joined rows, exclusions/coverage ledger and metrics by position, draft class, NFL experience and thin-history status. Primary evidence is paired errors and appearance/points calibration on the shared cohort; report bias separately from accuracy. Deterministic seeded uncertainty grouped by a justified unit, preserve temporal folds and state what the interval is conditional on. Do not treat the 885 paired records as all drafted players. Drafted, undrafted and unknown identity are different cases.

This queue is an AUDIT, not the preflight proposal to add log-pick/round/UDFA columns to all veteran fits. No +40 QB uplift, arbitrary blend, market input, blanket youth bonus, added production feature or full refit. If evidence warrants a candidate experiment, deliver its exact prospective comparison as a subsequent plan; existing differently targeted QB prior evidence is not approval of a new global feature.

Fix the already logged future-writer definitions prose to derive its window from authoritative outcome fields, with a test. Preserve every frozen run/companion byte. After actual audit, cross-check DG-178 all-league search/placement and rookie expected-point details against your frozen export.

## Shared execution and finish rules

- First action: inspect current worktree/HEAD and baseline tests; write the exact native plan; then tests-first implementation. Report plan path and first expected red test. Continue through implementation, fresh tests, actual-data run and cross-review without parking after routine notes or commits.
- Never edit another lane's product code. Shared trunk, symlinked data and environments remain read-only; no install, paid-data upload or frontend-studio access. All outputs use new run directories, never overwrites.
- Root makes no commits/pushes. Existing lane checkpoint workflow remains on ticket branches; no merge, promotion, publication, destructive cleanup or production restart. Retain all artifacts and the accepted local preview.
- A concrete source ambiguity may block an exact claim, but does not block producing a faithful discrepancy ledger. Bring football questions to root; root resolves engineering/statistical details and asks David only when genuinely needed.
- Root will independently review specifications and implementation, rerun checks, inspect final artifacts and exercise the real page. Final readiness is local research only and requires all scoped evidence.
