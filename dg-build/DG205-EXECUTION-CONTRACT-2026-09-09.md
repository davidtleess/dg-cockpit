# DG205 execution contract — September 9

This additive exact shape resolves implementation details in the approved plan. Root owns amendments. No original archive/declaration changes. Numeric outcomes in examples are synthetic.

## Backend enrollment shape (DG206 → DG207/root)

`build_evaluation_inputs(...)` returns `{document: enrollment, artifacts: dict[str,bytes]}`. `snapshot` parameter is the existing `read_snapshot(...)` result `{snapshot:receipt,ranks,comparison}`; `artifacts` is the validated original raw named artifact bytes. `baseline_source`, `schedule_source`, `market_history_source` are validated data envelopes or null; null yields precise per-stream unavailable, not invented input. The builder must return a complete enrollment even if some optional future-evaluation inputs are missing. Corrupt/contradictory source bytes are errors, distinct from missing inputs.

Enrollment required keys:
```
{schema_version:'track_record.enrollment.v1', snapshot_id, forecast_identity, enrolled_at,
 source: six_source_fields, snapshot: original_receipt,
 input_hashes: {artifact_name:sha256},
 production: {state,reason,plan,plan_sha256,target,window,provenance_class,
   cutoff_at,target_start_at,target_end_at,rows:[ProductionRow]},
 market: {state,reason,plan,plan_sha256,t0,window,provenance_class,configuration,
   rows:[MarketRow]}}
```
ProductionRow: `{sleeper_id,name,position,producer,provenance,forecast:number|null,baselines:{prior_season:number|null,position_median:number|null},missing_reasons:{field:reason}}`. Source identity and per-year outcomes/baseline artifacts stay preserved. Current primary2026 only. Keep all original union population even missing. `provenance` is original/recovered/starting_estimate/unforecast. `producer` is archived identity string or null, not a made-up combined model.
MarketRow: `{sleeper_id,name,position,our_rank:[lo,hi]|null,market_rank:[lo,hi]|null,start_price:number|null,momentum:number|null,missing_reasons:{field:reason}}`. Full cohort/exclusions frozen in rows. Momentum is same-target trailing fractional price change. Keep published zeros and ties.
Window: `{label:string,start_at:string|null,end_at:string|null}`. `target` retains full archived research TargetSpec. `provenance_class` is `contemporaneous|reconstructed|unavailable`, actual source timestamps remain in artifacts. Streams use `not_registered|awaiting_horizon|awaiting_capture|input_unavailable|cutoff_ineligible|insufficient_evidence|graded`. Missing baseline files do not mean not_registered for a legacy production declaration; do mean input_unavailable for prospective evaluation inputs.

Store `save_record(root,kind,document,artifacts,recorded_at)` is KEYWORD-ONLY after root, returns `{created:boolean,record:{record_id,kind,recorded_at,snapshot_id,document,artifact_hashes}}`. `read_record(root,id)` returns this record (without outer created); `list_records(root,snapshot_id=...)` returns records in stable recorded_at/id order. `snapshot_id` for grades is read from grade document. Never omit the artifact bytes from integrity validation. Cross-record references must be verified when loading/grading (store also verifies declared reference fields when present). Save accepts only enrollment/grade kinds. Record ids immutable64hex. No code uses model prediction count as independent sample count.

## Grader envelopes (DG207 → root/UI)

Both grade functions return a complete `track_record.grade.v1` document with `snapshot_id,enrollment_id,claim,evaluated_at,policy_sha256,input_hashes,decision_supported:false` plus `{state,reason,window,provenance_class,counts,result}`. Enrollment passed to graders is a store RECORD, so its `record_id` supplies enrollment_id; enrollment.document carries the above contents. `counts:{eligible,scored,missing}` integers, no boolean. `result` is null unless a valid result/insufficient descriptive result exists. Grade must refuse policy/source binding contradiction; missing expected input returns precise unavailable/pending.

Result unified display shape:
```
{summary:string, comparisons:[{id,label,units,estimate:number|null,
 interval95:[number,number]|null,state:'favorable'|'unfavorable'|'inconclusive'|'insufficient',
 note:string,eligible:number,scored:number}],
 rows:[{sleeper_id,name,position,producer:string|null,provenance:string,
 forecast:number|null,baseline:number|null,outcome:number|null,
 error:number|null,reason:string|null}],
 details:[{label:string,value:string}]}
```
Comparison id includes producer and baseline where relevant. Include aggregate and position entries explicitly labelled; do not average producers silently. Market rows forecast=ordinalgap, baseline=momentum, outcome=adjustedreturn with units labelled in stream; error=null (no price forecast). Primary production rows can show prior-season baseline; include both-baseline row details in result.details or add dedicated per-baseline comparison detail payload only after notifying root/UI. Rows complete, UI filtering presentation only. `details` contains source limitations, actual metrics/interval interpretation, secondary sensitivity and no developer paths. Producer-specific metrics required even if all-position aggregate cannot be computed. State must reflect precision limits.

DG207 owns exact explicit outcome envelope, documented with synthetic fixture early and shared with DG206/root before CLI binding. It must include validated source buffers/hashes, complete-window evidence, target identity and per-player values. No runtime fallback to legacy outcome-loop experiment. DG207 must coordinate with DG206 on baseline envelope before implementing incompatible schemas.

## Browser view (root → DG208)

```
{schema_version:'track_record.view.v1',status:'available'|'not_configured'|'unavailable',
 reason:string|null,snapshots:[SafeReceipt],selected:SafeReceipt|null,
 production:Stream,market:Stream,
 save_capability:{enabled:boolean,reason:string|null,expected:SixSourceFields|null}}
```
SafeReceipt: `{snapshot_id,saved_at,forecast_date,market_as_of,ownership_as_of,report_generated_at:string|null,catalog_generated_at:string|null,years:number[],counts:{model,market,market_picks,paired,roster,available,available_total,available_with_forecasts,available_without_forecasts,starting_estimates},source:SixSourceFields,evaluation_status:'ungraded',evaluation_plan:object}`. No rawfiles/absolute paths. Existing receipt may include other hashes; adapter projects only these.
Stream `{state,reason,window,provenance_class,counts:{eligible,scored,missing},result:null|Result}`. root produces explicit states for no registration and no baseline records, never treats no grade as empty archive. Invalid selectedid=>404; knownselectedid stays pinned on refresh. No selected query defaults newest receipt deterministically; browser then writes thatid to URL.
UI GET `/api/private/track-record?snapshot_id=...` or without query initially. POST `/api/private/track-record/capture` `{expected:SixSourceFields}`. Response `{snapshot_status:'saved'|'already_saved',snapshot:SafeReceipt,enrollment_status:'saved'|'already_saved'|'input_unavailable',reason:string|null}`. Non2xx refusalbody `{detail:string}`. Save is explicitly **Save current board reading**, not pretend archived selectedreading is a new forecast. DG208 obtains the current board bundle via existing bundleQuery and only enables button if its six-source tuple matches server save_capability.expected; display current board source date beside save. Selected history snapshot is separate. No source tuple from historical selection used as current automatically. Root current API configuration binds same accepted report/catalog as the bundle.

GET never creates enrollments. A deliberate save may archive then enroll; missing baselineconfig yields partialsuccess. UI errors must distinguish this. Transport unavailable is not an empty archive. New API/client refuses malformed requiredfields rather than converting them to null silently.

Root owns bridge and all API mutations. DG208 owns dedicated client/query; root does not edit it until integrated fixes. Root handles generation of routeTree. No dependencies installed. Changes in this document override worker assumptions; meaningful amendments go through root.

## Observation display amendment

Executioncontract additive clarification: Stream adds `observations:ResultRow[]` ALWAYS (empty if unavailable), separate from result. This lets ungraded enrollment show frozen forecasts and baselines now; no invented outcome/grade. ResultRow same canonical shape; producer/provenance retained. Root derives from enrollment rows with outcome/error null when pending. Add optional `baseline_position_median:number|null` to ResultRow so both production baselines visible, no need duplicated table. Graded rows preserve this field when possible. Root will pass observations in every synthetic view fixture. UI should show these in pending enrolledstates, and result.rows for graded. No visual accuracy score before maturedata. DG206source-reviewfinding (independent internal reviewer): canonical report/catalogunion953Sleeper ids,825original reports; report.all_inspectable stores expected_margins not rawpoints, so reconstruct verifiedbaseline reference as existingrostercomparison does; catalog.player_id mixedSleeper/GSIS need frozenbridge evidence. Historical raw2025position/completeparticipant source exists; report /private/tmp/dg205-source-inventory-20260909.md when reviewer finishes. Do NOT assume every absentrow=zero. Exact target_identity hashes entire admittedseason windows so future2026source differshash even same measurement: validate relevant measurementfields/window plus boundrawhash, not naive target_identity equality acrossyears. Root will validate source mapping independently.

## Frozen game coverage clarification — September 9

Enrollment production.expected_game_ids contains the sorted complete game IDs from the verified frozen schedule for the declared target; production.weeks_expected is [1,2,...,17]. Outcome coverage expected_game_ids and observed_game_ids must exactly equal the frozen enrollment membership, with unique IDs and strict integer (not boolean) counts. A prepared outcome cannot shrink its own expected universe to one week or one game while retaining a full-season label. DG206 owns schedule binding; DG207 owns comparison against that frozen universe. This strengthens the existing full-window rule without changing the production declaration or hash.
