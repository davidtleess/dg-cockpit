# Ranking strengthening — approved scope and contract

David approved the DG217 assessment's follow-up: “Let's work on the gaps and strengthen them.” Complete the missing forecast explanations and run stronger, explicitly retrospective validation. This authorizes implementation and bounded evidence calculations, not default-ranking/model promotion or publishing. Implementation decisions belong to root. Do not ask David about APIs, files or worktrees.

Authoritative audit: /Users/davidleess/dg-wt/DG-217/runs/20260910T182259Z-rankings-audit/root/ASSESSMENT.md. Read final root findings, not superseded lane drafts. All original 825 values and 388 paired ranks are correct arithmetically and must remain unchanged. All825 identities resolve through preserved crosswalks. Zero floors are real values. The concrete delivery defect is that248 paired players lack season football points in the comparison payload even though their source forecasts exist.

## Work and ownership

- DG218 / Claude54281: Python derivation and additive rank payload. Own src/dynasty_genius/ranking/valuation_details.py (new), market_ranks.py, tests/ranking/test_valuation_details.py (new), and necessary additions to tests/ranking/test_market_ranks.py only. No frontend edits.
- DG219 / Claude54331: Lovable validation, normalization and player explanation UI. Own lovable/src/lib/dg/backend.ts; optional new valuation.ts pure helper; lovable/src/components/dg/PlayerDrawer.tsx, optional ValuationBreakdown.tsx; necessary backend/new valuation tests. May adjust ReceiptSheet.tsx for reference explanation; no shell/release config/dependency changes. Depends only on exact additive contract below; work with synthetic fixtures while DG218 builds.
- DG220 / Claude54410: standalone historical validation tool and tests, output evidence. Own scripts/evaluate_ranking_gaps.py, tests/unit/test_evaluate_ranking_gaps.py, isolated runs. Read protocol appendix before numerical evaluation; root will freeze that before any results. No research producer/refit imports, default ranking changes, frontend edits or general source cleanup.
- DG221 / Codex root: exact contract, independent source checks, integration by explicit file copies after review (no git merge), local augmented bundle and local preview, meaningful regression/static/build checks, actual desktop/mobile QA, independent review and handoff.

All trees already created at /Users/davidleess/dg-wt/DG-218,219,220,221, branch ticket/DG-NNN, base4f93a380. Each builder must verify its tree and use it as cwd. Session metadata cwd remains David's home; that is not the assigned editing location. Write a plan and observe failing tests before product code. User's existing authorization and requested autonomy override skill boilerplate asking them to approve routine implementation again. No artificial time-limit claims; use actual clock, report concrete blockers, keep working until acceptance. Initial progress in10minutes, working result target30minutes, not permission to stop incomplete.

## DG218→DG219 contract (version1 additive, frozen before implementation)

Legacy bundle_version1 remains valid. Do not remove, change or reinterpret existing payload fields, populations, prices, dates, ranks, floors or comparisons. Add `valuation_detail` to each market_ranks row (object for a model row where the full reference basis exists; null for market-only/legacy without basis):

```ts
type ValuationDetail = {
  schema_version: 1;
  producer: string;
  estimate_class: string;
  reference_player: string;
  seasons: Array<{
    season: number;
    points: number;
    reference_points: number;
    expected_margin: number;
    advantage: number;
  }>;
  horizons: {
    "1": { advantage: number; rank: RankInterval | null };
    "2": { advantage: number; rank: RankInterval | null };
    "5": { advantage: number; rank: RankInterval | null };
  };
};
// RankInterval = {start:number,end:number,total:number}; same common population as current rank.
```

Also add `basis.references` keyed QB/RB/WR/TE, values `{player_name:string,seasons:Array<{season:number,points:number}>}`. Annual detail points = source expected_margin + that position's accepted per-season reference. Advantage = max(0,margin). Sum equals the exact saved model_value within1e-8. Derive from `report.horizon_board.all_inspectable` and `horizon_board.annual_producers` entry with model_version `union_replacement`, whose replacement[pos][0] contains player_name/reference_series. Confirm actual name key rather than guess; contract player_name is fixed. Check rows agree with reference name and first-year quantity. Each yearly reference entry contains the full reference_series; validate consistency if multiple entries present. Reject malformed/nonfinite/inconsistent present detail; do not silently omit malformed detail.

Horizons sum the first1,2,5 advantages and rank on the SAME complete paired population used by current ranks. Our-only player gets a real advantage but null comparable rank. Preserve closed intervals for ties; five-year rank must exactly match current paired our_rank. No filter-dependent re-ranking and no changes to default sort. Absent annual_producers in genuinely legacy payloads may yield no detail; present malformed expected union reference must fail. Unit fixtures may be extended to supply this basis rather than weaken checks.

Frontend: optional contract supports old releases. Extend BoardRow with valuation_detail or null. Prefer existing valid comparison season points; use valuation detail for missing comparison coverage. If both exist, reject inconsistent annual values/sums rather than pick one silently. Validate schema, finite quantities, allfive unique ordered basis years, sum identities, reference/margin/positive-part relations, horizon sums, paired-rank denominator/ties, and five-year rank equality. Never manufacture a forecast from a floored advantage alone. For truly missing forecasts, keep no-forecast behavior. Starting/recovered estimates remain labelled and do not gain an accepted overall rank.

## Product behavior

1. All ranked players show their actual existing 2026 and2027–30 points, including opponent rosters. Stafford's268.2 must agree with Track Record. Every reference/forecast belongs to the same unchanged source snapshot.
2. Player drawer adds an understandable annual breakdown: projected points, named replacement's projected points, and advantage credited. A zero credited advantage must remain distinct from zero points. A collapsed explanation can hold the full five rows on phone; no horizontal page overflow.
3. A compact horizon comparison shows one-, two- and five-year comparable ranks and advantages, with same388 population explained once. This is assumption sensitivity, not three validated trade prices. Main board remains five-year.
4. If first-year advantage is zero and later advantage positive, explain that its modeled advantage comes later. No buy/sell label or breakout-probability claim is inferred.
5. Older bundles without detail continue to work; explain the unavailable breakdown without implying the old ranks changed. No new screens, market-scale value, ad hoc tiebreak, forced rank correction, or arbitrary forecast estimates.

## Frozen sources and evidence

- /Users/davidleess/dg-wt/DG-178/runs/20260906T214512Z/dg178_audit/report.json (hash19e032a4067dff1759199a84720c0f879bb61f792fd3b2703808b55485a7af37)
- /Users/davidleess/dg-wt/DG-183/runs/20260907T112015Z/inputs/market-ranks-manifest.json pins original report, market and league. Load readonly; never use today's mutable universe to rebuild historical identities.
- /Users/davidleess/dg-wt/DG-213/runs/20260910T001646Z-release-exporter/delivery-assets-v4 contains reviewed bundle, ledger and954 headshots. Root creates NEW local export, never overwrites it.
- /Users/davidleess/dg-wt/DG-217/runs/20260910T182259Z-rankings-audit/root/{source_reconciliation.py,identity_reconciliation.py,horizon_audit.py,market_rank_reconciliation.py} are independent worked derivations and validated examples.
- Veteran producer /Users/davidleess/dg-wt/DG-177/runs/20260906T195728Z/dg177_basic_horizons; actual consumer manifest beside it is dg177_basic_horizons.manifest.corrected.json. Rookie /Users/davidleess/dg-wt/DG-165/runs/20260906T195904Z/dg165_rookie_capital. Common outcome /Users/davidleess/dg-wt/DG-179/runs/20260906T194819Z/league_season_outcomes.

## Acceptance

Backend tests falsify corrupt reference/signed-margin/season/source/duplicate rows and compute known1/2/5 ties on complete populations. Client tests falsify mismatched details and legacy compatibility; rendered QA proves real Stafford/Terry/Jefferson/Lamb/Rasheen Ali and a later-only stash, desktop1440 and phone390/320. Every original parsed value/rank/price/ownership, original comparison rows, ledger and image stays identical apart from the defined additive data and new delivery generation metadata. All825 new details match source, all388 sensitivity ranks independently recompute. Build and targeted integration checks pass. No network/private paths in exported detail.

Scientific acceptance: executable reproducible tool and its meaningful cutoff/missing-zero/baseline test fixtures; frozen protocol, all-result evidence including failures, same eligible rows per comparison, grouped uncertainty, honest retrospective status. A finding of no improvement is a successful result, not a reason to tune until a win appears. Root owns any recommendation on changing default rankings; that is not authorized automatically by a passing test.

No commits/pushes/merges, publication, paid-source pulls, dependency installs, shared data mutation, model training/promotion, scheduler operations or access to /Users/davidleess/frontend-studio. Reuse/copy existing dependencies into private worktrees; no writing through shared symlinks. Each handoff lists exact changed paths, commands and evidence, remaining concerns. Root handles final integration.

### Adapter compatibility clarification, September 10

The existing shipped comparison consumer also accepts a complete five-entry per-season replacement series whose legacy field is `rate_ppg` and whose explicit quantity is `expected_season_points_same_window`. The adapter may support that lossless representation when the redundant `reference_series` field is absent: require all five entries, explicit season-point quantity, matching position/name and all four positions. Present malformed or inconsistent `reference_series` remains an error; when both representations are supplied, they must agree. Never infer PPG-to-season conversion or insert default bars. This preserves valid older report inputs; it changes neither the client contract nor the frozen scientific study or current forecasts.
