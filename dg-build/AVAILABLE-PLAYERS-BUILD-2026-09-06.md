# Available players — authorized build, 2026-09-06

**Closed at READY_FOR_GATE:** implementation, independent source/statistical/code review, deterministic CLI replays and desktop/mobile/watchlist QA complete. See [final acceptance](AVAILABLE-PLAYERS-REVIEW-2026-09-06.md). Local preview only; no further build assignment or production/merge authority is implied by this historical brief.

David identified the missing unowned-player discovery workflow. Root proposed an Available Players board for help now, future stashes and a watchlist, with evidence-based estimates for thin-history players and historical tests of future-contributor discovery. David explicitly replied **"ok go"**. This releases the new bounded build and supersedes the prior completion hold for this scope. Do not ask David to approve technical plans or whether to continue these tasks.

The app is the primary deliverable. Three existing isolated Claude lanes own separate implementation plans and product files. Root owns integration, scientific review, independent checks and local preview acceptance. Keep previous825 forecasts, outcomes, original audits and accepted214512Z preview preserved. No production change, merge, model promotion, dependency installation, shared-data write or paid-data upload. Root makes no commits/pushes. Existing lane ticket checkpoint workflow stays on its ticket branches, never promotion.

## Verified starting point

- DG178 starts3688e542, DG177d43102a5, DG165d625923b. Recheck current HEAD/dirty state before work; retain all old untracked data/history artifacts.
- Accepted report `DG178/runs/20260906T214512Z/dg178_audit/report.json`, SHA25619e032a4067dff1759199a84720c0f879bb61f792fd3b2703808b55485a7af37. It contains825 forecasts:274 owned and551 unowned. The latter include historical/unverified players, not551 current NFL pickup candidates.
- Dated census202057Z: verified-listed unowned active242=222 forecasts+20 missing; practice squad135=85+50; IR56=42+14. Default relevant unowned pool433=349+84. Keep68 cut,6 retired,3 contested/unverified unowned census members separate, as well as141 NFL rows without a resolved Sleeper identity. Never equate an NFL free agent with an unowned fantasy player.
- Search currently uses only view.league (274 owned). Other global search is rostered-only and Waiver Radar is parked. The new work must deliver a visible route to unowned players.
- Existing impact=sum max(0, player mean season points minus fixed selected reference player's forecast path). It is not a waiver/stash ranking:541/551 unowned are zero over two years,501/551 over five. Expected point forecasts themselves contain meaningful differences. Do not change existing impact math or reference choices to make the new screen look more exciting.

## Product design and alternatives

Chosen direction: expose the existing forecast information immediately, with explicit population/status filters and separate current/future questions; improve missing-player estimates and evaluate stash selection in independent research lanes. The alternative of only exposing existing impact ranks leaves almost every unowned player tied. The alternative of inventing an upside bonus produces a ranking without evidence. Neither meets David's request.

Five-second answer: **"Who can I actually pick up, what does the model expect now and later, and what do we not yet know?"** Ownership filters availability only; it never changes the underlying player forecast. Use position filters because raw PPR points are not comparable positional dynasty utility. No automatic FAAB bid, transaction, drop recommendation or claim of marginal lineup gain from season points alone.

Now = explicit2026 projected championship-window points, not weekly start advice. Future = expected points in the remaining shown years, with those exact years named; not a breakout probability. P(appears) must never be relabelled P(becomes useful). Negative predictions/zero predictions/missing predictions remain distinct. An undefined future year cannot silently become zero or a partial total.

Watchlist = David's own locally saved shortlist, not an invented opportunity-trend feed. If verified dated opportunity history can be exposed from existing inputs, label its actual observation period; no fabricated current momentum. A new live news/alert feed or transaction system is outside this bounded build.

## DG178 / PID25057 — Available players product

Native plan `docs/superpowers/plans/2026-09-06-available-player-discovery.md`, created before code, exact test-first steps. Prefer focused new backend catalog and frontend AvailablePlayers component/helpers rather than growing ResearchPreview.tsx into another monolith. Own DG178 files only.

Build a first-class Available players section or clearly labelled tab reachable from the current research preview. Preserve owned-player search and existing research views. Use the SAME captured report/census/snapshot bytes and verified identity joins. Add a catalog payload with all supported current unowned members including missing forecasts. Default to verified active/practice-squad/IR (433 expected before any identity correction); cut/retired/unknown/archive populations must be inspectable through explicit filters or disclosures, not falsely counted active. Never invent fantasy availability for unmatched NFL identities. Show ownership and NFL status dates and a concise freshness caveat.

Expose current-year expected points and the existing season paths, and a named-window future-production ordering. Use actual producer values, not clamped impact or rounded displayed margins; adding an independent verified projection path is preferred to deriving values from replacement subtraction. Check source hashes/arm/year/identity and finite values. Without a verified projection, retain the player with a plain-language reason; do not fabricate a number. Existing825 forecasts/references/annual terms must be byte-equivalent in the unchanged portion of the new run.

Search by name/team/position across the available catalog, with position and NFL-status filters, deterministic sorting, exact ties handled honestly, clear/no-match states, separate missing-forecast ordering, and counts consistent with the visible population. Help-now/future ordering must discriminate actual projected points even when impact is zero. State sorting basis next to the control; no overall dynasty-rank claim from raw cross-position points.

Provide local watch/unwatch persistence by stable player identity, with a watchlist filter. No network mutation or automatic acquisitions. If a watched player becomes owned or leaves the default status pool, keep his entry with explicit changed availability, never silently drop it or still call him available. Treat broken/missing stored data safely. These are personal shortlist controls, not model-nominated breakout claims.

New missing-player estimates may be integrated only after root accepts DG165's exact candidate evidence and declared interface. Do not wait idle: build all existing coverage and missing states first. No arbitrary placeholder probability or unvalidated fallback hidden as a mature forecast. Root will resolve the research gate directly.

Tests: captured ownership/census consistency, duplicate/ambiguous IDs, owned exclusion, inactive/unknown separation, unranked retained, projection/source/year mismatch refusal, zeros and negative values, full-horizon completeness, stable ties, search/filter combinations, watched player changes ownership, storage errors, accessible controls, mobile390px after details open. Run actual immutable candidate builder, relevant backend/frontend suites, TypeScript/Ruff/Biome, desktop/phone QA. Keep214512Z pinned until root authorizes the isolated8787 candidate pin.

## DG165 / PID24974 — Missing-player starting estimates

Native plan `docs/superpowers/plans/2026-09-06-unowned-cold-start-forecasts.md`. Build a reusable tested coverage/resolution tool and investigate the exact84 current-active/practice/IR missing players, with20 active first. Output a per-player ledger proving identity, NFL/fantasy status, draft facts and available NFL/college inputs. Explicitly distinguish verified UDFA, drafted, unknown draft status, no NFL stat row, zero NFL production and source join failures. Do not label absence from draft table UDFA or zero appearance as observed individual-complete truth.

The requested outcome is defensible starting estimates, not another permanent no-number policy. Identify the narrowest forecast route supported by existing data: verified joins to already produced forecasts first; then a separately labelled cold-start candidate using verified draft/age/position/experience and appropriate historical entry cohorts. Existing historical NFL/college/paid data may inform candidate features only if available at forecast time and incremental value is demonstrated. No arbitrary youth bonus, athletic score boost, position uplift, market input or global refit.

Before fitting a new candidate, send root its exact population, target, training/held-out years, no-appearance convention, baseline, features, acceptance criteria and runtime estimate. This is an engineering/scientific check with root, not a David approval pause. Then implement/run the agreed candidate with tests and an immutable manifest. A missing-coverage candidate may be evaluated on its own otherwise-uncovered population; compare training-only position/experience mean and draft-capital baseline where applicable, not just coverage. Keep busts/zero-record candidates in denominators with provenance. No contemporary NFL roster membership in historical selection, no post-outcome feature dates, no future-cutoff labels.

Export accepted new-only estimates in a separate manifest-bound sidecar keyed by verified Sleeper/GSIS identity and forecast years2026–2030. Expected season points, appearance and conditional output must have compatible definitions. Never overwrite825 accepted rows or alter original source exceptions. Root must verify before DG178 consumes a new candidate; if evidence is inadequate, report precisely which players/route remain unresolved, why and the smallest valid next experiment. Continue useful independent coverage work while awaiting root feedback.

## DG177 / PID23481 — Stash-selection evaluation

Native plan `docs/superpowers/plans/2026-09-06-stash-selection-evaluation.md`. Build a reusable tests-first evaluator using existing frozen historical forecasts and common outcomes. Goal: determine whether future-production ordering can identify later contributors among low-production/developmental candidates, not merely rank established stars.

Propose the exact candidate-cohort definition and future-contribution outcome to root before the first experiment; freeze them before seeing results. Use only origin-available NFL experience/production/draft evidence to define candidates. Compare current-production ordering, a training-only age/position or draft-capital baseline where supported, and the frozen future-production ordering on paired candidates. Use closed future horizons, chronology, source hashes and explicit artifact-backed vs no-record convention labels. Pick a league-relevant contribution definition and show sensitivity rather than pretending a convenient threshold is universal. Root will resolve this methodological choice quickly.

Report rank discrimination/realized future points and selection-at-fixed-budget results (including misses/busts), not just AUC on everyone. Resample by player and preserve origin tables; disclose repeated-player and season uncertainty. A selection budget is a declared scenario, not proof of David's optimal bench allocation. No historical fantasy-availability claim unless an actual point-in-time ownership source supports it. Otherwise call it a historical low-production candidate screen, not a waiver backtest, and explicitly name that limitation. No calibrated breakout probability unless actually fitted/evaluated/calibrated to that label.

Return tested evaluator, immutable actual-data audit, exact command/hashes, interpretation and concise truthful UI wording. Cross-check DG178 current/future projected points against the frozen annual rows. Do not retrain global models or change accepted forecasts to improve retrospective numbers. Follow-up opportunity signals may only use verified observed periods; do not invent a live trend.

## Root acceptance and execution

1. All lanes acknowledge native plan and first RED test, then continue without routine permission pauses. Raise only concrete missing authority/source/football choices.
2. Root confirms candidate research definitions before fitting; implementation details are root's responsibility, not David's.
3. Separate specification review then fresh code-quality review; fixes return to owners. Root independently reruns actual-data tools and final browser flows, checks old825 numeric parity and all new catalog denominators.
4. The app must provide usable unowned discovery even if a candidate research result is negative. Negative/insufficient evidence must remain explicit, never converted into fake rankings or a completion claim for unbuilt cold-start coverage.
5. End only with the scoped implementation/evidence genuinely complete or a concrete unresolved gate stated honestly. Preserve all worktrees/artifacts and production. No indefinite idle loop and no extra engineering questionnaires for David.
