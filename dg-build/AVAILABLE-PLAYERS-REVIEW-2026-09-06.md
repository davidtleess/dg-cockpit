# Available players — final root acceptance record

Status: READY_FOR_GATE — built and independently verified on the local preview, 2026-09-07 01:43 UTC (David local September6). David approved with “ok go”; no production change, promotion, or merge authorized. Earlier sections preserve the order of hypotheses, amendments, failures and checks; the final closure below controls status.

## Baseline and population

Accepted comparison report `DG178/runs/20260906T214512Z/dg178_audit/report.json`, sha256 `19e032a4067dff1759199a84720c0f879bb61f792fd3b2703808b55485a7af37`, remains immutable. All825 accepted forecasts/references/annualterms must remain identical.

Captured relevant unowned pool433: active242 (222forecast+20missing), practice135 (85+50), injuredreserve56 (42+14). Other verifiedlisted unowned74=cut68+retired6; three unverifiedidentityrows are disclosures, notconfirmedavailable. Ownership is snapshot2026-09-06T13:00:52Z, NFLstatuscapture19:15:49Z; notlivewaivers.

Independent cold-start acceptance verified four missing fantasyRB players have EXISTING accepted DG177forecastrows and verifiedcensus identities:

| Player | Sleeper | GSIS |
| --- | --- | --- |
| Alec Ingold | 6109 | 00-0035125 |
| Kyle Juszczyk | 1379 | 00-0029892 |
| Michael Burton | 2471 | 00-0031595 |
| Adam Prentice | 8025 | 00-0036727 |

Root authorizes exactnew-only catalogrecovery after source/identityverification; not a fit, not changes to original825. Expected postrecovery353forecast+80missing=433. DG165 owns boundrecovery ledger; DG178 owns consumption.

Remaining80 by fullNFLhistory/source:68 noNFLhistory (10verifieddrafted+58draftunknown),12 leftcohortaftermultipleabsentseasons (7drafted+5unknown). Windowabsence is separate: NickMuse has week18NFLrecord but no championshipwindowappearance. Never infer UDFA from missingdraftrecord.

## Frozen methodological amendments — before candidate results

Root sent exactgates to actualsessions at approximately00:47–00:48Z2026-09-07 (localSep6); delivery acknowledgement remains toverify. Original lane proposals are preserved in git. These are scientificscope choices, not Davidtechnicalquestions.

### DG165 starting estimates

Rejected historicalpopulation selected by annualroster earliestweek/status: inspected2018seasonalrecords wereweeks17–21; historicalroster population also changes sharply2015–2016. This cannot establish preseasoneligibility and creates outcomeperiodsurvivorselection.

Preferred narrowexperiment: seven2025draftedskillplayers with no fullREGstatrecord through rookieseason (Rourke,McCord,Howard,Bartholomew,Mertz,Lohner,RickyWhite). Forecastcareer2–6 in2026–2030. Historicalcohort ALLverifieddraftedQB/RB/WR/TE with no fullREGrecord throughdraftseason, regardlesslaterroster. Target remainsDG179championshipwindow. Independenthashchecked25rawREGfiles found424resolvedhistoricalentrants2001–2025:QB118/RB85/TE71/WR150. Using windowabsence instead adds35finalweekplayers and is rejected for the noNFLhistorylabel.

OriginT=draftclass+1; evaluateT2012–2025; trainlabels satisfy draftclass+h<T. Closedtestsupporth1–5=210/199/187/179/172; firstfoldtrain199/184/164/141/119, independentlyreconcile. Positionmean and draftcapitalcandidate must both train only on matchingcohort and closedlabels. Do not reset existingchainappearance while retaining incorrectlyconditioned severity. No currentroster conditioning, no collegebonus, no market. Newcandidateperhorizonacceptance/minimumsupport still pending ownerproposal/rootgate; h1 improvement does not validateh5. Honestbaselinecandidate may remain useful even if complexity doesnotwin, but mustcarrymeasuredsample/error and not masquerade as acceptedforecast.

Otherverifieddrafted currentplayers require distinctsupport: FBoutsideQB/RB/WR/TEdraftcohort; oldentrantsneedlatercareeryears; dormantpopulation differs. Draftunknown58lackverifiedcompleteentrantdenominator. Keepunresolvedledger/smallestvalidnextstep, not fabricatedvalues.

### DG177 stash evaluation

Primarycohort: frozenDG177origins with verifieddraftclassc,1<=t-c+1<=3, no contributionbarseasonc..t usingDG179windowpoints. This is draftedearlycareernot-yet-contributors, notallstashcandidates or historicalwaiveravailability. Observedstatrowseasons since2005 is NOTNFLexperience and may only be labelledexploratorystratum.

PrimarybarQB37/RB45/WR71/TE21 is deeprosterrelevance. StrictersensitivityQB24/RB36/WR48/TE12 is positionaldepthscenario, notguaranteedlineupgain. Bars derivefromfullpositionalpanel; preservepositionconvention. Futurelabel requiresappearance AND points>=bar. Keepeligibilitycohortfixedwhilevaryingfuturelabel.

PrimaryFuturewindowt+2,t+3 summed, paired againstoriginDG179points, frozenyear1policyexpectation, draftpick onidenticalcompletecandidatecells. Years2–5exploratory: frozenyear5supportONLYorigin2020. Pivotexact(player,position,origin,horizon), checktarget=t+j, requirecompletefinitewindows. Sparseunsupportedoriginscountasexclusions, neverzero. Existingbaselineispersistence×trainingretention, notpositionconstantnull.

Budgettwo perposition/originprimary,one/threesensitivities;fractionalboundaryties. Reporthits,misses,zeroappearancebusts,realizedfuturepoints/slot,pairedplayerclusteruncertainty and originresults. Directartifactlabelprovenance, no-recordconvention, unresolved/openexclusions. Preferfixedselectionunknownlabelhitbounds. Bootstrapconditionalonrealizedorigins/fixedfits, notfutureseason/modelselectionuncertainty. Historicalpolicyalreadyretrospectivelyselected; notuntouchedconfirmation.

## Checks so far

- RootDG179freshbaseline: `.venv/bin/python -B -m pytest -q -p no:cacheprovider tests/contract/test_league_season_outcomes.py` —68passed7.56s.
- Nativeplans andRED→GREENownercheckpoints observed for allthreeactualsessions.
- Independentread-only coldstartpopulation/sourceaudit and stashmethodreview complete; no performancescoresused tochoose amendments.
- DG178catalogspecificationreview active; browser/component/productchecks pending. No candidate sidecar accepted yet.

### Subsequent active checks (before final acceptance)

- Root authorized the revised DG165 seven-player experiment before fitting. Preprocessing is training-only; exact same supported rows compare both arms; per-horizon selection is retrospective, not untouched confirmation. Candidate requires both favorable paired 90% intervals against the matching position baseline; otherwise a separately labelled baseline research candidate is retained for review. Conditional models require at least60 training rows/15 appearers and both binary classes; baseline position support and zero-appearer handling must be explicit. Current-roster transport bias is unmeasured, not proven conservative.
- Root numerical acceptance script: `DG179/docs/agent-ledger/evidence/2026-09-06/dg179_available_player_qa.py`. Expected RED against initial catalog004643Z (owned watch identities absent); GREEN against004943Z:784 identities=274owned+510unowned,433 relevant=353forecast+80missing,7,720 original producer terms verified, original825 report hash unchanged. Intermediate004943Z catalog sha256 `b95e153493628df095d4692b0d44a4889292748e8b020f5191be9c304f1314de`. This is numerical acceptance only, not final reusable-code or UI acceptance. Root script Ruff passed.
- Independent DG165 actual recovery audit: allfour005402Z output hashes verified; all100 numeric recovery fields exactly match the accepted DG177 producer. Published005402Z is preserved while reusable source/identity/year guards are hardened and reissued.
- Independent DG177 positional-panel coverage:2009–2025 all9,447 DG179 appeared skill-player seasons with corresponding frozen REG evidence occur in the basic-cohort panel;0missing,0duplicate player/season. Minimum positional panel rows QB84/RB170/TE131/WR244 exceed every prescribed cutoff. Actual panel accepted with source-role convention; generic missing/short panels still require explicit unsupported handling.
- Concrete fail-open regressions sent to owners: duplicate/conflicting identities, stale origin/year/arm, invalid-present outcomes converted to absence, finite-sum overflow, report/catalog byte binding, first-row-only recovery validation, incorrect fractional-tie unknown-label bounds, and watchlist/filter/basis-count semantics. Fixes are in progress; final source runs and fresh independent reviews still required.

## Completed scientific gates and independent replays

### DG177 — accepted at 89a36364130286e6c275f6f0c1b82294076e0d8b

Stash run `DG177/runs/20260907T010712Z/dg177_stash_selection/`; corrected companion sha256 `acd4cf3fa1ff250dd7c2cdb00f04ab45599b2684359a3e8e42fbf38d7d37dc1a` binds unchanged original outputs and truthful method caveats. Definitions were fixed before results. Independent reviewer reconstructed all168 bars,10,228 eligibility decisions,1147 primary rows, selections/ties/unknown-label bounds and paired intervals. Root CLI replay `DG179/runs/20260907T011345Z/dg177_stash_selection/` reproduced all11 numeric files byte-for-byte. Fresh root126 relevant tests passed6.61s; scoped Ruff passed.

Primary evaluation:1147 player-origin rows,563 distinct players,9 origins2014–2022,166 later contributors. Future ordering has Spearman0.483 versus origin production0.430,year-one forecast0.459,draft0.301,persistence0.440; all four paired ranking intervals favor Future. The two-slot screen selects72 weighted slots:27 contribution hits,15 no-appearance busts,10,319 future points. Origin production also27 hits; persistence33. Every paired hit/point interval crosses zero. **No demonstrated small-shortlist pickup edge**, no historic fantasy ownership and no claim of validated waiver returns. Repeated-player/fixed-fit/realized-origin intervals exclude season and model-selection uncertainty; source-position retrospective risk remains explicit. Years2–5 secondary has only one origin. No tuning after results.

### DG165 — accepted final source and numerical artifact

Final tool `0e2db9e1e2ef0fe823e061f45c3cf1c4a949e06f`, clean lane HEAD `f712188f466f6a5633bbb2bb32b5f9e62c1ab6c1`. Final run `DG165/runs/20260907T012231Z/dg165_cold_start_candidate/`, manifest sha256 `2d4594863649c042fb10dad54d986e82aaf1d38cca986d52791fa76db2f13b98`, estimates sha256 `93bc11aaf6781fb98f678ed52ce47417a04945c3b9b4b62363eef105dcc4eff7`. Earlier011503Z numerical results were accepted independently;012231Z preserves all values and corrects metadata/caveats/partition wording.

Independent reviewer reconstructed424 unique draft-population entrants,947 paired rows across five horizons, all metrics and2,000-draw paired intervals, and all seven final paths. Only year1 passes both declared candidate-versus-position-baseline interval gates (n210; Brier0.2293 vs0.2474; RMSE24.50 vs28.19); years2–5 retain position means as explicitly labelled baseline research candidates. This is pooled retrospective selection, not independent confirmation or a WR-specific improvement; current-roster transport bias unmeasured. Default-PPR championship-window labels are not exact league scoring. Rourke's slightly negative year1 estimate is preserved, not converted to zero/missing.

Root final-tool CLI replay `DG179/runs/20260907T013023Z/dg165_cold_start_candidate/` reproduced all five CSVs and entire evaluation.json byte-for-byte against012231Z. Fresh root43 cold-start tests passed4.30s; all six relevant Python source/test files passed Ruff. Producer boundary guards reviewed independently. Low-risk nonblocking tool limitation: capture helpers reread locally frozen files after verifying them; adversarial concurrent file mutation is outside this run's read-only-input assumption. No actual source mismatch occurred; all captured/output hashes and independent replay agree. A future mutable-source workflow must parse and hash the same buffered snapshot.

### DG178 — integrated values accepted; final reusable/UI checks still active

Root final-source CLI replay `DG179/runs/20260907T013359Z/dg178_available_catalog/` binds012231Z and passes independent stdlib QA:784 identities,274 owned status-only rows,433 relevant unowned=353 frozen forecasts+7 starting estimates+73 without forecasts. All7,720 original producer fields and140 starting-estimate fields equal their accepted source bytes; all825 original accepted report bytes remain unchanged. Root authorizes these seven new-only estimates, no impact-score fabrication, no replacement/reference changes.

Actual browser intermediate013005Z passed default/future independent orderings, position/status/cut/retired/unknown filters, empty/no-match states, recovered forecast with missing impact, signed near-zero value,390px containment and keyboard table scrolling, watch reload, simulated owned/missing identity transitions, and blocked-storage tab persistence. Evidence `/private/tmp/dg179-available-qa-9n46Lz/result.json`; desktop/mobile screenshots inspected. Native browser connection was unavailable; installed Playwright fallback was disclosed and used with isolated temporary contexts, never David's watchlist or league transactions. Final candidate metadata binding, complete supported cold-start terms/integral years/games-domain guards, special-owned-status watch transition and final rebuilt screenshots remain acceptance items.

## Human gate

At final backend checkpoint `74dc624de7ee4e0879d0af9b19ba6640241ec8d8`, source-bound catalog013635Z SHA `d08e89087c5038439d81421cfacba186ebedd4619be9d0015a9c42b74938597e` is independently accepted. Root final CLI replay013805Z catalog.csv is byte-identical. Complete cold-start term/game/integral-year refusal guards and source partition are fixed; fresh independent backend review is GREEN. Root284 ranking/route tests,78 frontend tests, TypeScript, Biome and scoped Ruff all pass. Existing sklearn pickle-version warning originates in route-test loading of the unchanged legacy model, not this CSV-backed research consumer; no dependency changes or refit attempted.

Original825 dual-horizon values,274 league/27 David rows,825 identical year prefixes and references independently pass again at01:36:41Z. Actual old-board search/Why/mobile tests also pass at `/private/tmp/dg178-root-search-M888Tb/result.json` on default pinned214512Z, preserving named zero-impact explanations and both horizons.

Final functional browser receipt `/private/tmp/dg179-available-qa-acFCt3/result.json` passes16 cases with zero errors, including actual starting-estimate metadata and the newly added owned-exempt watch transition. **Manual screenshot inspection adds an unresolved visual gate:** horizontal-table scrolling leaves expanded phone explanations clipped/pan-required, although document-width checks pass. Owner is fixing responsive prose/scroll anchoring; root added explicit paragraph-box bounds and requires actual phone Why-tap screenshots. Final completion/cleanup receipts remain pending that bounded fix and fresh verification. Root autonomy ACTIVE; no completion claim.

### Final closure — all bounded requirements met

The visual gate above is CLOSED at frontend HEAD `8960e0ecf97677b1a79d077f21f4e2a2d9d33138`, clean tree. The smallest fix wraps explanation prose within the viewport and returns horizontal scroll to the player identity on Why tap. Root and an independent reviewer manually inspected both final phone screenshots: paragraph left/right16–350 inside390, full line beginnings/ends visible; comparison columns retain keyboard-accessible horizontal scrolling. Fresh root79 frontend tests, TypeScript and Biome pass. Owner also reports full backend7446 passed/32 skipped on unchanged backend74dc; root independently ran the284 relevant ranking/route tests rather than treating that owner receipt as its own run.

Final root direct-link browser QA at01:42:46Z passes all16 cases and zero JS errors: `/private/tmp/dg179-available-qa-RgP6qb/result.json`. It opens `http://127.0.0.1:8787/?surface=research-preview&tab=available` directly, verifies the selected tab, frozen214512Z report and013635Z catalog, both exact numeric orderings, all status/search/empty states, watch reload/owned-exempt/missing-identity/blocked-storage transitions, recovered forecast without impact, signed values and year-specific starting-estimate caveats. The added paragraph-bounds regression failed on the old layout (`rzbj1g`) and passes after the fix (`96V35K` and final `RgP6qb`). Both root and reviewer visually inspected the96V35K images, with the same final bundle as the direct-link replay.

Delivered:433 relevant unowned players =349 original forecast joins+4 exact recoveries+7 starting estimates+73 explicitly missing. Search/position/status filters, Now2026/Future2027–2030 and existing impact comparisons, and a browser-local watchlist are implemented. No automatic pickup, drop, trade, FAAB action or live-ownership guarantee. Missing forecasts remain discoverable; this increment does not claim universal coverage or demonstrated profitable stash selection. Model outcomes still use the disclosed research PPR/window, not exact league scoring.

All scientific/specification/code/actual-data/UI reviews are GREEN within the frozen-source boundary, with the DG165 mutable-source reread advisory retained above. Exact source/report/forecast825 bytes are unchanged. Root made no product/trunk edits, commit, push, merge, production change, dependency install or shared-data write. All root browser contexts closed in finally; all root test/replay commands completed. No material files deleted; isolated evidence and previous worktrees/runs are deliberately preserved. The local preview remains running for David. Actual Claude lanes acknowledged acceptance and are idle/closing bookkeeping, not awaiting undispatched implementation work. Root autonomy records tests/static-analysis/real-surface-qa/review/cleanup and finishes READY_FOR_GATE for David's review, not publication.
