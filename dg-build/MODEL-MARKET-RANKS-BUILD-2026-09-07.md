# Us versus market — approved bounded build, 2026-09-07

## Authority, goal and ownership
David approved replacing the older model-score comparison on the actual roster/player pages with the new comparable-rank view: “yes that's the core of the comparison i want to make us v what we think our competitors value a player at”. Direct user record: /Users/davidleess/.codex/sessions/2026/09/07/rollout-2026-09-07T05-28-23-01a07b32-8430-7e20-a1d0-e5a24eebd830.jsonl, payload.role=user, line1434 timestamp11:15:18Z (proposal immediately preceding). Earlier mandate explicitly authorizes coordinating actual Claude builders. Read those direct records; do not ask David routine approval again.

Five-second answer: Our rank · Market rank · We rank him higher/lower. FantasyCalc is a proxy for the broader market, not a measurement of any particular league mate's private preferences. Same player universe on both sides. No value on a fabricated FC price scale, no market features, refit, new replacement/discount policy, automatic trade/drop action or proven-edge claim.

- DG183: Codex integration/source freeze/oracle/generated schema/runtime8789/browser/final acceptance.
- DG184: Claude54331 UI. Own new frontend/src/market-ranks/* and minimal App/provider, roster/RosterAudit.tsx, player/PlayerDetailCard.tsx, PlayerDetailPage.tsx and ValuationTwoLane integration as needed, related tests. May mechanically register newCSS census rows; do not relax unrelated audit baselines. Do not edit backend or generated client.
- DG185: Claude54410 API. Own src/dynasty_genius/ranking/market_ranks.py, app/api/routes/research_market_ranks.py, ONE import/router registration in app/main.py, adapter/route tests. No frontend changes.
- Claude54281: independent spec/source and final review, READ ONLY product files; output only /private/tmp. No other skills' updater/cache writes or internal subagents.

Create each worktree with dg-work.sh DG184/DG185 --from8960e0ecf97677b1a79d077f21f4e2a2d9d33138 (include hyphen in ticket IDs). Root froze the accepted DG180 PRODUCT baseline at /Users/davidleess/dg-wt/DG-183/runs/20260907T111832Z/inputs/accepted_baseline. A root copy helper /private/tmp/dg183_apply_baseline.py copies ONLY listed files into a fresh same-base tree, asserts preimages and verifies hashes. Run it with your worktree path BEFORE edits. Do not copy DG180's preview-only market symlink, runtime dirs, runs or dependency dirs. No commit/push/merge/deploy/promotion/install/shared writes/frontend-studio. Do not spawn internal subagents. Native exact plan + meaningful RED→GREEN tests in your tree; proceed through fixes and handoff without further approval. Root integrates exact reviewed snapshots, not git merge.

## Frozen inputs
Root manifest /Users/davidleess/dg-wt/DG-183/runs/20260907T112015Z/inputs/market-ranks-manifest.json (schema_version1, report_run, files report/market/league each path+sha256). The three files are read-only for everyone:
- report.json accepted DG178214512Z sha19e032a4067dff1759199a84720c0f879bb61f792fd3b2703808b55485a7af37.
- market.json sha05bce6dd9d76198ecca2a2f0f1493b4e99f02da1f4dd9a5c1b5b85ec8e01a339: exported FC forward-capture rows, sourcefc_native, September6, 423assets=399players+24picks. Root independently verified EVERY row content hash and the aggregate capture store_hash. Schema: schema_version, source, snapshot_date, retrieved_at, settings{isDynasty:true,numQbs:2,numTeams:12,ppr:1}, settings_hash e27351d720e9fcf0, capture_report, entries(list of exactSQLite rowdicts: player_key,sleeper_id,player_name,position,value,overall_rank,position_rank,trend_30day,retrieved_at,payload_hash,source,snapshot_date,settings_hash,market_volatility,market_volatility_status).
- league_snapshot.json September6 bound snapshot sha ece82e24a66d50882345733971a8e1c66d1c0bae020496c2f48a8ff8a8ad8a35. 12teamSF/fullPPR/noTEpremium. Week17 explicit David ruling; research scoring gaps still disclosed, no exact-league points claim.
Report+FC same day; no silently choosing latest input on request. Setting env DG_MARKET_RANKS_MANIFEST to this manifest enables the new LOCAL preview. Without env return explicit not_configured. Present but invalid/missing/hash mismatch must fail, never fallback to old scores.

## Mathematical contract
Use report.comparable_views.h5 to resolve horizon_board.all_inspectable. Accepted model value is the EXISTING value, five equally weighted seasons2026–2030, per-season advantage=max(0, expected_margin) above that position's available replacement. Validate target/horizon/evidence/readiness, all finite values and membership; do not recalculate a different value basis or use oldDVS/rawpoints. Match roster to raw saved snapshot by stableSleeperID; report flags must agree. Model-only rows still have full-model rank; market-only rows have market price/native rank; absent is notzero. Expected825 model rows,388common,836union,27savedroster26common. Counts are acceptance facts from frozen inputs, not hardcoded filtering policy.

Primary ranks on the intersection of accepted model rows and FC QB/RB/WR/TE player rows only. Both sides rank descending by own value. Exact ties get inclusive rank intervals {start,end,total}: start=1+strictlyhighercount, end=highercount+equalcount. NO alphabetical/market tie breaking. Sorting tied rows for stable display may use name/id but rank remains shared. 571/825 modelzero rows;159/388 commonzero rows; common zero group230–388. This is a structural tie, not 159 distinct opinions. No preference assertion inside overlapping rank intervals.

Gap interval lower=market.start−ours.end, upper=market.end−ours.start. If lower>0: higher; if upper<0: lower; both singleton equal: same; otherwise overlap. Exact gaps can say Nplaces higher/lower; interval nonoverlap says AT LEAST the minimum defensible magnitude, with tie explanation. Missing either common rank: unavailable. Never present one population's rank against another as a computed difference. Native FC overall_rank (399 players in this snapshot; excludes picks) and full-model825 rank belong only in details with population labels, not the primary pair. Never reconstruct the native FC rank using enumerate (raw native field is source truth).

## Exact API consumed by UI
GET /api/research/market-ranks. Return {status:"not_configured"} if env absent. Configured success:
{
 status:"available",
 source:{report_run:string,report_sha256:string,market_sha256:string,league_sha256:string,forecast_date:string,market_as_of:string,ownership_as_of:string},
 basis:{years:number[],season_weights:number[],summary:string,market_proxy_note:string,scoring_note:string},
 coverage:{model_players:number,market_players:number,market_picks:number,common_players:number,total_players:number,roster_players:number,roster_common_players:number},
 rows: MarketRankPlayer[]
}
RankInterval={start:number,end:number,total:number}.
MarketRankPlayer={
 sleeper_id:string,name:string,position:string,team:string|null,on_roster:boolean,taxi_or_reserve:boolean|null,
 model_value:number|null,market_value:number|null,
 our_rank:RankInterval|null,market_rank:RankInterval|null,model_rank_all:RankInterval|null,
 market_rank_published:number|null,
 comparison:{direction:"higher"|"lower"|"same"|"overlap"|"unavailable",gap_min:number|null,gap_max:number|null},
 missing_reason:string|null,model_zero_tie:boolean,
 seasons:{season:number,advantage:number}[],reference_player:string|null
}
Rows are union836; on_roster27. Noncovered global player lookup: UI says no comparable ranking, not0 and notfallbackoldDVS. A source-valid per-player missing value remains unranked; malformed source refuses payload. If the schema needs a correction, flag it early to root; do not silently diverge. Prefer typed response models for generated schema; root regenerates client. Source errors HTTP503 with readable detail; unconfigured200 is separate.

## Main product behavior
New feature capability provided once by an App-level context/provider (UI owner can choose equivalent shared clean approach): explicit status not_configured preserves legacy components. Loading/error/invalid configured data must not briefly show oldDVS or fail back to legacy numbers. Default context for isolated legacy component tests can be not_configured; app provider must actually fetch. No queryflag David must know; local server config enables mainnav behavior.

Roster: primary actual Roster/All players surface renders the27 saved roster rows FROM THIS source, with header/context "Us vs market" and human capturedate. Table/list: player identity with existingheadshotfallback andteam/position, Our rank (blue), Market rank (amber), plain comparison. Search andpositionfilter, sensible default ourrank order; no system-selected hero. Keep missing-market RasheenAli visible, zero ties explicit. Opening any row goes to the SAME player's existing drawer. Existing legacy roster scoring/aging status must not dominate or masquerade as evidence for this new rank; new mode should not need /api/roster/audit or its runtimefallback at all. Other roster subview navigation can remain but do not claim it uses thisrank.

Player: actual drawer andfullpage use identical primary rank pair and sentence. Replace legacy0–100DVS/xVAR/oldprojection/olddivergence as the main valuation panel; do not display an h5rank beside a different model's number/rationale. Keepidentity/ownership. New model explanation comes from thispayload (five equally weighted years andavailable replacements; source-defined0tie). Existing age-cliff/counterargument/oldtrust fields must not be presented as reasons for the h5rank. Details disclose modelbasis, savedmarketproxy/ownershipdates, native marketpriceandpublishedrank among399players, full-modelrank, annualadvantage andlimits. No rawIDs/ISOdates/hashdiagnostics in mainviewport; provenance can be in details.

Macro composition: both ranknumbers + clear direction should be first usable answer ondesktop and390phone. Avoid rendering long metadata/caveats or redundant headings before it. Two rankcolumns/list aligned onphone, no document/tablepan for corecomparison. On playerdrawer move existing2026evaluationbadge below mainanswer or omit fromnewrankmode; it is oldevaluationcontext, not proof of newranking. Visible ranktie range is essential, not a forecastconfidence-band reintroduction. KeepAvailablePlayers/Compare tab functionality andwatchlist. Do not add another disconnected researchtab as substitute for mainpages.

## Acceptance and handoff
Unit/contract tests: known rankpairs, alltie/zero/negativeinvalid/missing, overlapping/disjointties, nativeFCvscommon separation, no picks, no namejoins, roster27missingmarket, per-row/source tamper/settings mismatch/date/identity corruption, malformed enabled config vsabsent config. Root independent fullpopulation oracle from rawFCrows/report/snapshot, not ownerhelper. Freeze order beforelooking at disagreements; no retrospective policy tuning to matchFC. No correlationdashboard/model accuracy claim.

UI tests loading/notconfigured/error, newroster27search/filter/openstableid, playerselectionchange/no staleidentity/rank, pairedsamebasis, ties/missing, nooldscore/rationale leaking, legacymodepreserved. Run relevantfullsuite/typecheck/lint/build, then actualbuilt desktop+phone screenshots, keyboardinteraction andaxe. Root handlesnewpreview8789, keeps8787/8788 untouched, copies necessarypublishedruntimeinputs safely ifremaininglegacy identity routes needthem. No sharedcache writes.

Write concise /private/tmp/dg184-handoff.md or dg185-handoff.md with exactpaths/tests/limitations; acknowledge /private/tmp/dg184-status.md or dg185-status.md. Independent reviewer /private/tmp/dg183-spec-review.md then finalreview. Do useful ownedwork concurrently, no duplicate full audits. Final state only after integrated behavior is independently verified.

## Source review correction and execution update 11:31Z
FantasyCalc published overall_rank is players-only1–399 in this capture; picks carry overlapping numbers and must not enter its denominator. Signed gap_min/gap_max are market-minus-ours; nearest-zero bound is the minimum defensible magnitude. Source reviewer reproduced all cohort/tie/roster counts. All three actual Claude sessions then hit their monthly account limit before product implementation. Root continues authorized implementation in DG183 and preserves DG184/DG185 exploratory work unchanged.
