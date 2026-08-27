# Dynasty Genius Master Proposal 3

**Document type:** Three-proposal synthesis and implementation blueprint  
**Date:** 2026-08-19  
**Status:** READY_FOR_GATE  
**Product:** David's private, single-league Dynasty Genius decision-intelligence system  

**Source corpus:**

1. `/Users/davidleess/.gemini/antigravity-cli/brain/9a996d45-904b-4e21-b8a3-73ac48ecaa2f/DYNASTY_GENIUS_NORTH_STAR_ARCHITECTURE_AND_BUILD_PLAN.md`  
   SHA-256: `2aaa46a5bb23198976dc8bf1fd6b52fd3ed492b1053a9e4a8036b8b6b2ab3ecc`
2. `/Users/davidleess/dynasty-genius-product/docs/strategies/2026-08-19-dynasty-genius-target-architecture-and-build-plan-session-1.md`  
   SHA-256: `81a390e88255a9a226d70e1d2e19e5b9abe9f08d444d886603eb2fc34f48f578`
3. `/Users/davidleess/Desktop/dynasty-genius-architecture-2026-08-19.md`  
   SHA-256: `16adad9c6181ff38b6e5ddbba36ab35d0137fec2239652f4408a49527032809c`

The source files were read completely and preserved unchanged. This master is a new synthesis artifact; no product code, model, producer, or data store was changed during its creation.

## 1. Executive proposal

Dynasty Genius should be built around one unbroken, inspectable chain:

> **raw evidence → point-in-time truth → {intrinsic belief | league context | market observation} → evidence/decision scenario → screen**

The differentiator is not any one model. It is the system's ability to answer, exactly and honestly:

1. What did Dynasty Genius know at that time?
2. What did it believe about this player, and why?
3. What was the market saying independently?
4. What did this league and roster make possible?
5. What options did David have, with what upside, downside, and uncertainty?
6. What happened afterward?

The architecture therefore has two core product objects:

- **Player Value Object (PVO):** Dynasty Genius's intrinsic, market-independent belief about a player, including forecast distribution, availability state, evidence, and model provenance.
- **Decision Opportunity Object (DOO):** A time- and league-specific scenario describing what David could do, at what price, under what roster constraints, with what range of outcomes and counterarguments.

Player belief is not action value. A great player can be a bad acquisition at the current price; a modest player can be a strong roster-specific opportunity. Dynasty Genius must never collapse those questions into one opaque score.

The master architecture is a **local-first modular monolith**, not a distributed platform:

- immutable source snapshots;
- typed Parquet analytical history queried locally;
- DuckDB as the candidate analytical query engine, subject to a proof-gated migration pilot;
- SQLite for transactional control, capture ledgers, locks, and review queues;
- Python domain and application packages;
- FastAPI as a thin adapter;
- precomputed product read models;
- React/TypeScript/Vite as the decision cockpit;
- generated OpenAPI/Zod boundary validation;
- one dependency-aware daily pipeline and run ledger.

No big-bang rewrite is required. The repository already contains strong patterns worth propagating: immutable forward capture, fail-closed publication, source contracts, rigorous evaluation primitives, pure trade/roster functions, generated frontend contracts, receipt-bearing UI primitives, and an outcome scorer. The program should generalize those patterns and retire their weaker competitors.

## 2. The product north star

### 2.1 The daily loop

The landing experience is **Morning Room (Daily Open)**. Its first viewport answers the daily question in five seconds:

```text
Your roster overnight
Model: +0.4% · Market: -1.1% · 3 rows crossed a disclosed band
League: 2 roster or transaction events changed your decision context
Opportunities to review: 2 time-sensitive scenarios
```

The clauses remain separate:

- model and market values never blend;
- a band crossing is tied to a disclosed, versioned threshold;
- an opportunity is a scenario to inspect, not an instruction;
- unavailable or stale lanes say so plainly rather than disappearing.

From Morning Room, the primary journey is:

```text
Morning Room
  → changed fact or opportunity
  → player evidence
  → scenario comparison
  → Roster / Trade / League / Draft workspace
  → optional decision receipt
```

### 2.2 The primary product areas

Primary navigation should contain five workflows:

1. **Morning Room** — roster-level overnight change, changed facts, and scenarios to inspect.
2. **Roster** — roster construction, lineup and replacement context, capacity, cuts, and horizon scenarios.
3. **Trade** — David-initiated package comparison, partner evidence, market realism, and counterarguments.
4. **League** — rules, rosters, picks, transactions, positional scarcity, and observed manager behavior.
5. **Draft** — rookie beliefs, pick context, draft scenarios, and abstention when evidence is not ready.

Player detail is a shared inspection pattern, not another primary product. Model accuracy, receipts, provenance, and freshness live contextually and in a secondary **Trust & Methods** area. Deep operational diagnostics live under a separate `/ops` surface, while blocking manager-facing health remains visible in plain language.

Parked concepts and developer project tracking do not belong in David's primary navigation.

### 2.3 The moat: the belief archive

The long-term advantage is the accumulated, immutable record of what the system and market believed over time.

The archive runs on two accountability clocks:

1. **Realized-outcome clock:** Were past forecasts accurate, calibrated, and useful after their horizons closed?
2. **Self-consistency clock:** What did Dynasty Genius believe then, what changed, what evidence caused the change, and which lane moved first?

The second clock creates value immediately. It powers:

- historical player belief replay;
- model-versus-market lead/lag analysis;
- stability and revision ledgers;
- signal-pruning evidence;
- decision-history replay against actual league transactions;
- honest model-card and product accountability.

## 3. Master architecture decisions

The three source proposals contained genuine conflicts. The master resolves them as follows.

| Question | Master decision |
|---|---|
| Canonical identity | Use an opaque, immutable internal `dg_player_id`. Existing semantic keys and vendor IDs become aliases. Do not rewrite history in place; migrate through a complete dual-key bridge. |
| Fuzzy identity | Fuzzy matching creates review candidates only. It never promotes a production identity without deterministic evidence or human approval. |
| Player coverage | Guarantee **100% honest card-state coverage**, not 100% manufactured scores. Every member of a named universe has a `UniverseMemberCardState`; only canonically resolved members may receive a PVO, and every other member has one explicit unavailability reason. |
| PVO scope | PVO is intrinsic and market-independent. Market and league observations remain separate, independently versioned inputs to DOO assembly. |
| Market data | Market is a parallel overlay, evaluation comparator, price/liquidity signal, and history lane. It never enters Engine A/B training or intrinsic valuation math. |
| Decision output | Show evidence-grouped scenarios and transparent within-category ordering. Do not emit one cross-action desirability score, automated buy/sell verdict, or hidden manager rank. |
| Storage | Adopt a local-first target: immutable files + typed Parquet, DuckDB for analytical queries, SQLite for transactional control/capture. Conversion begins only after a representative pilot proves parity, recovery, performance, and backup behavior. |
| Databricks | Keep it off the critical path. Preserve portable contracts; quarantine or delete aspirational Databricks configuration only after explicit human ratification and deployment/billing verification. |
| Model recipe | One immutable, hashed `TrainingSpec` must drive training, evaluation, refit, and serving compatibility. |
| Model artifact | Define a versioned portable artifact interface. Implement inspectable JSON for the current Ridge family after equivalence testing; do not make JSON a universal future-estimator law. |
| Promotion | Evaluate frozen recipe → refit the final candidate on approved label-complete data → run post-fit sanity/calibration gates → issue a promotion receipt naming the exact final hash → change the active pointer. |
| PPG semantics | Use one versioned measurement-definition registry. Preserve the current all-games PPG decision; settle zero-snap eligibility explicitly before the next model generation. |
| Freshness | Cadence is stream-specific. A single 26-hour rule is not applied to every source. Terminal success, time bounds, and dependency hashes are evaluated by one control plane. |
| UI organization | Morning Room plus Roster, Trade, League, and Draft. Trust is contextual; operations detail is separate; model and market retain distinct visual lanes. |

## 4. Architecture topology

The six product layers remain canonical. A small honesty kernel and control plane cut across them.

```text
                           HONESTY KERNEL
       Measurement · Receipt · AsOf · Availability · Caveat · ClaimLevel
                                      │
External providers                    │                     Human decisions
       │                              │                            │
       ▼                              ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ L1  SOURCE & CAPTURE                                                   │
│ adapters · immutable raw snapshots · source contracts · run receipts   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ L2  POINT-IN-TIME TRUTH                                                │
│ canonical identity · typed facts · feature vintages · lineage          │
└──────────────┬────────────────────┬────────────────────┬────────────────┘
               │                    │                    │
               ▼                    ▼                    ▼
┌────────────────────────┐ ┌──────────────────┐ ┌────────────────────────┐
│ L3 INTRINSIC BELIEF    │ │ L4 LEAGUE CONTEXT│ │ MARKET OBSERVATIONS    │
│ Engine A · Engine B    │ │ rules · rosters  │ │ price · rank           │
│ uncertainty · PVO     │ │ picks · manager  │ │ volatility · vintage   │
└────────────┬───────────┘ └────────┬─────────┘ └──────────┬─────────────┘
             └──────────────────────┼──────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ L5  EVIDENCE & DECISION ANALYSIS                                       │
│ belief archive · common cohorts · experiment registry · DOOs · scenarios│
└───────────────────────────────┬─────────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ L6  PRODUCT EXPERIENCE                                                 │
│ read models · thin API · Morning Room · Roster · Trade · League · Draft│
└─────────────────────────────────────────────────────────────────────────┘
```

The spine is a logical provenance graph, not one synchronous pipeline. A market delay must not erase a valid intrinsic PVO; a stale manager-behavior lane must not inherit the roster lane's timestamp; a model refresh must not rewrite historical belief.

## 5. Cross-cutting honesty kernel

Honesty should be structural, not a collection of optional prose disclaimers.

### 5.1 `Measurement`

Every product number uses a receipt-bearing envelope:

```text
Measurement[T]
  value: T | null
  unit: closed unit code
  interval: lower / upper / method | unavailable
  calibration: calibrated | uncalibrated | unavailable | not_applicable
  lane: model | market | league | outcome
  as_of: hard right edge
  basis: Receipt
  availability: AvailabilityState
```

Model and market measurements should be distinct domain types or discriminated variants so model/market arithmetic cannot happen accidentally.

### 5.2 `Receipt`

A receipt links a visible value to:

- source snapshot IDs;
- identity snapshot ID;
- feature vintage and feature-definition versions;
- transformation/run ID;
- model artifact and `TrainingSpec` hash where applicable;
- market vintage where applicable;
- `effective_at`, `available_at | unknown`, `observed_at`, `ingested_at`, and `as_of`;
- caveat codes;
- claim level.

### 5.3 Temporal meanings

- `effective_at`: when the described real-world fact applies.
- `available_at`: when the provider made the fact available.
- `observed_at`: when Dynasty Genius actually captured it.
- `ingested_at`: when it was durably written.
- `as_of`: the knowledge boundary for a query or artifact.

The knowledge invariant is:

```text
observed_at <= ingested_at
if available_at is known, available_at <= observed_at
no row observed after as_of may enter an as-of result
no row known to have become available after as_of may enter an as-of result
```

When provider availability is unknowable, `observed_at` is the conservative knowledge boundary and the receipt records `availability_time_unknown`. `effective_at` is domain time and may legitimately describe a past or scheduled future event; it is not itself the knowledge boundary.

### 5.4 Closed states

Do not overload one status field. Keep these independent:

- **availability:** `available`, `withheld`, `not_eligible`, `insufficient_history`, `identity_unresolved`, `capture_incomplete`, `artifact_unavailable`;
- **calibration:** `calibrated`, `uncalibrated`, `unavailable`, `not_applicable`;
- **claim level:** `descriptive`, `diagnostic`, `replication_candidate`, `decision_supported`;
- **freshness:** `current`, `stale`, `dormant`, `failed`, `unknown`;
- **lane:** `model`, `market`, `league`, `outcome`;
- **caveat:** closed machine code plus severity and manager-language rendering.

`claim_level` is authoritative. For compatibility, a Boolean `decision_supported` may be exposed only as the derived, read-only projection `claim_level == "decision_supported"`; it is never stored as a second source of truth. Claim level defaults to `descriptive` and reaches `decision_supported` only through an explicitly ratified evidence gate. The architecture makes such a gate possible; it does not assume the product should reach it quickly.

### 5.5 Series right edge

Every time series validates that no point crosses its `as_of` boundary. A point-in-time record that can be overwritten is not a point-in-time record.

## 6. Layer 1 — source and capture plane

### 6.1 One governed source/stream catalog

Create one machine-readable catalog declaring every source and stream exactly once:

- provider and ownership;
- acquisition mechanism;
- allowed and prohibited roles;
- schema/parser version;
- cadence and dormancy windows;
- terminal success states;
- retention and backup class;
- downstream consumer disposition;
- licensing/manual-action requirements.

Other representations—scheduler configuration, freshness checks, backup inventories, and Daily Control—must be generated from or mechanically reconciled against this catalog.

### 6.2 Immutable snapshot vault

Every acquisition writes raw bytes before parsing, together with a content-addressed manifest. Replaying a snapshot with the same parser version must reproduce normalized content.

Manual sources use an explicit intake/acceptance workflow:

```text
file appears → inventory and validate → human accepts manifest → ingest → receipt
```

Do not automatically trust and ingest every file appearing in a download directory.

### 6.3 One dependency-aware daily pipeline

Launchd or another local scheduler triggers one repository-owned entrypoint. The pipeline owns dependency edges, locks, retries, terminal run states, and a run ledger. Wall-clock offsets are not dependency management.

The pipeline may capture event-sensitive sources more frequently, but the authoritative decision read model is materialized on the governed morning cycle or an explicit manual refresh. No streaming platform is required.

### 6.4 Health semantics

A producer is healthy only when:

- its terminal receipt is a declared success state;
- required input receipts are healthy;
- its embedded time is plausible and inside the stream-specific window;
- output hashes and substance checks pass;
- its backup class and last restore evidence are acceptable.

Fresh file modification time alone is never proof of success. Failure details remain available under `/ops`; the reader product receives a concise, manager-language status.

## 7. Layer 2 — identity and point-in-time truth

### 7.1 Canonical identity

Create one owned, append-only, bitemporal identity system:

```text
player
source_identifier
identity_assertion
identity_resolution
identity_override
identity_review_queue
identity_snapshot
```

The canonical ID is opaque and immutable. Human-readable slugs are display aliases. Source mappings are long-form rows containing validity, method, confidence, normalizer version, evidence reference, and source snapshot.

Migration does not rewrite raw history. It proceeds through:

1. mint canonical IDs;
2. map every current key as an alias;
3. dual-read and dual-write;
4. prove referential coverage and historical replay;
5. cut consumers over one at a time;
6. preserve legacy aliases indefinitely in receipts.

Exactly one versioned name normalizer produces staging keys. Fuzzy candidates never materialize into production truth without deterministic corroboration or human approval.

### 7.2 Typed point-in-time facts

Normalize raw snapshots into typed, append-only facts. Numeric values remain numeric, timestamps remain timezone-aware timestamps, and nested provider payloads are not copied into every analytical row.

### 7.3 Feature vintages

Features are immutable, dated vintages, not one mutable “latest” CSV:

```text
features/
  feature_set=<version>/
    as_of=<timestamp>/
      position=<position>/
        *.parquet
```

The canonical query is:

```python
get_features(player_id, as_of, feature_set_version)
```

It returns the exact vector plus lineage. A small runtime pointer may identify the active vintage, but it never replaces historical files.

### 7.4 Storage target and migration proof

Target storage responsibilities:

- raw immutable payloads: filesystem/object-like directory plus manifests;
- normalized and feature history: typed Parquet;
- local analytical querying and materialization: DuckDB;
- run ledger, identity review, locks, and small control state: SQLite;
- immutable forward-capture conflict enforcement: preserve the proven capture-ledger behavior, then benchmark SQLite-with-indexes versus Parquet compaction before changing it;
- product reads: compact, precomputed read-model artifacts or indexed local tables.

No large store migrates until one representative pilot proves:

- row/key/value parity;
- as-of correctness;
- append-only conflict behavior;
- deterministic replay;
- backup and restore;
- local query and materialization performance;
- rollback to the prior reader.

## 8. Layer 3 — intrinsic player belief and Model Trust Plane

### 8.1 Engine responsibilities

- **Engine A:** pre-NFL and early-career prospect belief using only information available at the relevant decision boundary.
- **Engine B:** active-player future production belief using professional opportunity, efficiency, age, role, and other validated features.

The current Ridge family remains the transparent baseline. Richer features, age curves, uncertainty methods, or alternative estimators enter as candidates and earn promotion through the same evidence system. Architecture does not ratify fixed P90 ceilings, xVAR multipliers, blend constants, trade bands, or feature effects without versioned calibration evidence.

### 8.2 One hashed `TrainingSpec`

`TrainingSpec` is the sole definition of:

- feature set and version;
- target definition and label horizon;
- eligibility/cohort filter;
- preprocessing and missing-data policy;
- estimator family;
- hyperparameter/tuning policy;
- time-split and grouping policy;
- evaluation baselines;
- calibration method.

Training, evaluation, final refit, and serving compatibility all consume this spec. Its hash is embedded in every candidate and final artifact. Serving refuses incompatible artifacts.

### 8.3 Model artifact and promotion chain

```text
DatasetManifest
  → CandidateArtifact
  → EvaluationReport
  → FinalRefitArtifact
  → PostFitVerification
  → PromotionReceipt
  → ActiveModelPointer
  → ScoringEnvelope
```

Training creates candidates only. It cannot mutate the active pointer. The promotion receipt names the exact final refit hash, spec hash, dataset/feature vintages, checks, human decision, and superseded artifact.

The stable artifact interface is safe, inspectable, versioned, and hashable. For current Ridge models, the preferred implementation is JSON containing coefficient order, coefficients, intercept, imputer values, scaler parameters, target metadata, and empirical calibration data. Equivalence tests must prove predictions match the approved pipeline before serving stops using the legacy artifact.

### 8.4 Evaluation

Required evaluation:

- rolling-origin chronological folds;
- label windows closed before each test boundary;
- player-grouped tuning where repeated players exist;
- naïve baselines;
- market comparison only as an evaluation lane, never a feature;
- subgroup, missingness, and out-of-distribution diagnostics;
- rank and error metrics appropriate to the product question;
- multiple-comparison control for exploratory cohorts;
- calibration and interval coverage;
- one sealed recent-period evaluation set per model generation, named by dataset hash and never used for feature selection, tuning, or calibration;
- exact model/spec/data hashes.

### 8.5 Uncertainty

Every PVO declares either an evidence-backed uncertainty interval or `uncalibrated`. The first implementation should be simple and measured—for example, versioned empirical residual quantiles by defensible calibration cohort. More sophisticated conformal or Bayesian methods wait until evidence shows the simple approach is inadequate.

### 8.6 Intrinsic PVO

PVO contains:

- canonical player identity;
- one or more intrinsic forecast horizons;
- forecast distribution or explicit uncalibrated state;
- model/engine path;
- availability and reason;
- model and feature receipts;
- league-neutral intrinsic normalization measurements where validated;
- change drivers that can be traced to input vintages.

PVO does **not** contain market price, manager propensity, trade fairness, or a recommended action.

PVOs exist only for canonically resolved identities. Census and product coverage use a wrapper that can also represent a source-universe member whose identity is not yet resolved:

```text
UniverseMemberCardState
  universe_member_id
  dg_player_id | null
  identity_state
  pvo_reference | null
  unavailability_reason
  receipt
```

Only `identity_state=resolved` may carry a `dg_player_id` and PVO reference. Every unresolved member carries `identity_unresolved`, no PVO, and a receipt identifying the source member and resolution evidence available at that `as_of` boundary.

Every coverage claim names a versioned `universe_snapshot_id`. Its `UniverseDefinition` records the `as_of` boundary and inclusion reasons—for example current league roster/taxi/IR membership, current waiver eligibility, current rookie/prospect cohort, recent league-transaction reference, or active governed market coverage. Coverage is counted over `UniverseMemberCardState` rows in that named snapshot—not “unique players” whose uniqueness cannot yet be established, and never an unbounded or implicit population.

### 8.7 `ScoringEnvelope`

`ScoringEnvelope` is an internal inference result carrying raw prediction output, artifact/spec references, and inference diagnostics. The intrinsic PVO assembler converts it into receipt-bearing `Measurement` objects. It does not define a competing availability, time, calibration, or provenance system.

## 9. Layer 4 — League Context Graph

The league graph is point-in-time and independently versioned by lane:

- league rules and scoring;
- lineup requirements and replacement pools;
- rosters, taxi, IR, and eligibility;
- future picks and draft order state;
- completed transactions and asset movements;
- team value/capacity views;
- manager behavior facts;
- David's declared competitive horizon and risk preferences.

League format is captured from source settings and versioned; current Superflex/PPR assumptions are not scattered as code constants.

### 9.1 Manager behavior

Profiles report facts with sample size, observation window, freshness, and uncertainty:

- transaction frequency and recency;
- trade/add/drop activity;
- acquired and sent asset classes;
- player-versus-pick flows;
- positional flows;
- recurring counterparties;
- response history only if actual offer events are captured.

Completed transactions are evidence of behavior. They are not evidence of psychology, rejected offers, willingness to trade, or a universal “risk appetite” without a validated estimand.

### 9.2 League-derived measurements

Replacement value, xVAR-like comparisons, posture, pick appreciation, and consolidation effects are versioned analytical policies with receipts. They may inform scenarios but do not modify Engine A/B predictions. Hard-coded coefficients do not become architecture.

## 10. Layer 5 — evidence, market analysis, and Decision Opportunity Objects

### 10.1 Market lane

Market observations retain source, capture time, player/cohort eligibility, volatility, and availability. Only licensed or explicitly authorized acquisition methods enter the catalog.

Model-versus-market divergence uses a **common cohort**: a player participates only when the compared model and market values both exist at the same admissible `as_of` boundary. Percentiles are recomputed within that cohort.

Descriptive change events include:

- `band_crossing`;
- `direction_reversal`;
- `lane_reconvergence`;
- `lane_divergence`;
- `volatility_regime_change` when a validated method exists.

Every band is versioned, evidence-backed, and disclosed. A band is not an implicit buy/sell threshold.

### 10.2 Evidence Registry

Every analytical claim records:

- preregistered or exploratory hypothesis;
- cohort and source hashes;
- model and market vintages;
- outcome horizon;
- test family and multiplicity policy;
- effective sample/block counts;
- uncertainty;
- claim level;
- replication and supersession relationships.

Research findings cannot silently become product recommendations.

### 10.3 Decision Opportunity Object

DOO composes—but does not merge—the intrinsic, market, league, and evidence lanes. Each lane is independently `reference(s) | unavailable | not_applicable` and carries its own receipt; a scenario declares which lanes are material rather than requiring all lanes to be populated:

```text
DecisionOpportunity
  opportunity_id
  as_of
  league_id
  action_type
  assets and scenario parameters
  intrinsic lane: PVO reference(s) | unavailable | not_applicable
  market lane: observation reference(s) | unavailable | not_applicable
  league lane: context reference(s) | unavailable | not_applicable
  evidence lane: EvidenceRecord reference(s) | unavailable | not_applicable
  outcome distribution / unavailable
  roster-impact measurements
  feasibility constraints
  time boundary or deadline
  counterarguments
  claim level
  complete receipt graph
```

Advanced fields such as championship utility, liquidity, regret, or acceptance probability are availability-gated lanes. They do not become required or visible until their estimands and calibration are validated.

DOOs may be grouped by action type and ordered by declared factual rules such as an approaching deadline, roster illegality, a user-selected objective, recency, or magnitude of a disclosed crossing. They are never combined into one hidden desirability rank.

`ClaimLevel` is an executable ordered type:

```text
descriptive < diagnostic < replication_candidate < decision_supported
```

Claim composition is fail-closed. Every displayed DOO conclusion declares its material inputs and its governing `EvidenceRecord`. A composed conclusion's level is the minimum of its material input-conclusion levels and its `EvidenceRecord` ceiling. Raw measurements may support a higher derived conclusion only through the already-described registered method: the evidence record must name the method, cohort, uncertainty, and gates. The measurements themselves are not silently relabeled. No lane may borrow freshness, calibration, availability, or support from another lane, and ordering or visual emphasis can never upgrade a claim.

### 10.4 Core decision scenarios

Build in this order:

1. roster legality and capacity scenarios;
2. hold-versus-move comparison for a David-selected player;
3. David-initiated trade package comparison;
4. trade-partner evidence panels;
5. waiver-versus-current-roster replacement gaps;
6. rookie pick and draft-board scenarios.

## 11. Layer 6 — read models, API, and experience

### 11.1 Precomputed read models

Stable product views are materialized before requests:

- Morning Room;
- universe/player summary;
- player history and evidence;
- roster state and scenarios;
- league graph summaries;
- trade asset catalog;
- belief archive;
- trust and outcome scorecards.

The API does not ingest sources, train models, scan the universe, or parse large analytical artifacts per request. Request-time work is limited to compact reads and bounded pure scenario evaluation.

### 11.2 Thin application boundary

FastAPI routes translate application results into response DTOs. They do not own artifact interpretation, health semantics, model execution, or domain state machines.

Frontend data access uses one generated-schema-aware resource layer with:

- request deduplication;
- cancellation;
- `loading`, `ready`, `http_unavailable`, `contract_mismatch`, and `stale` states;
- sanitized errors;
- standard cache invalidation by artifact/read-model receipt.

### 11.3 Visual grammar

The canonical player row is:

```text
rank · position · identity · one focal measurement · named trend · receipt/state chips
```

- Model lane remains blue.
- Market lane remains amber.
- League/context measurements use a neutral third treatment.
- Numeric measurements use tabular figures.
- Intervals use a receipt-bearing range primitive.
- Raw keys, paths, IDs, and timestamps stay out of primary viewports.
- Every missing value has a manager-readable reason.

### 11.4 Release evidence

Every product increment includes:

- desktop first viewport;
- mobile first viewport;
- desktop and mobile mid-scroll;
- keyboard-only journey;
- visible focus;
- reduced-motion behavior;
- zero serious/critical axe violations and no unresolved WCAG AA failure;
- no horizontal overflow;
- quiet, changed, stale, partial, unavailable, and error states;
- source SHA, OpenAPI hash, and build timestamp in a frontend build manifest.

## 12. Internal package and dependency architecture

Preserve the six product layers while making code ownership explicit:

```text
config/
  data_plane.yaml # canonical source/stream/control-plane declaration

src/dynasty_genius/
  kernel/          # receipts, measurements, states, time, caveats
  data_plane/      # catalog, manifests, runs, artifact lineage
  sources/         # provider adapters and capture
  identity/        # canonical identity and resolution
  features/        # definitions, as-of store, materialization
  modeling/        # specs, training, evaluation, artifacts, inference
  assembly/        # intrinsic PVO construction from modeling envelopes
  league/          # league graph and manager facts
  market/          # market observations and common-cohort analytics
  decision/        # DOOs and bounded scenario evaluation
  evidence/        # experiment registry and outcome accountability
  read_models/     # precomputed product projections

app/
  api/             # HTTP transport only

scripts/           # composition roots and operator commands only
frontend/          # generated contracts and product experience
```

Placement rule:

> **A module lives in the package that owns the type it returns.**

Mechanical dependency contracts must:

- forbid `src/dynasty_genius/**` from importing `app/**`;
- forbid routes from opening product artifacts directly;
- forbid modeling from importing market, league, decision, read-model, API, or frontend modules;
- forbid source adapters from importing downstream curation/model logic;
- keep scripts as callers, never as libraries imported by production packages.

## 13. What to preserve and propagate

Protect the behavior of these existing patterns while migrating around them:

- immutable forward-capture conflict detection and idempotency;
- declarative source roles and prohibited-field contracts;
- validate → fail closed → atomic publish → ready receipt with hash and drift;
- OpenAPI generation, runtime Zod validation, and drift enforcement;
- cross-language vocabulary enforcement;
- rigorous fold-level statistical evaluation;
- realized-outcome survivorship and completeness accounting;
- pure roster-capacity, trade-reconciliation, and what-changed domain functions;
- UI primitives that require an explicit basis or receipt.

Code existing in one of these areas is an asset to revalidate and generalize, not automatic proof that a product capability is ship-ready.

## 14. Build program

The program is organized into dependency-oriented **waves**. Waves communicate product sequence, but the ticket prerequisites in §14.13—not wave numbers—are the authoritative execution graph. Independent league-context and market-observation work may begin as soon as their actual prerequisites pass; neither waits for intrinsic PVO work merely because its narrative wave appears later. Each wave is decomposed into small, exclusively owned, test-first tickets. A thin Morning Room walking skeleton begins early and evolves as each authoritative lane comes online.

### Wave 0 — ratify architecture decisions and golden journey

**Goal:** Freeze the master contracts and a fixture-backed Morning Room journey before substrate migration.

**New artifacts:**

- `docs/architecture/adr-001-local-analytical-storage.md`
- `docs/architecture/adr-002-canonical-player-identity.md`
- `docs/architecture/adr-003-pvo-doo-boundary.md`
- `docs/architecture/adr-004-measurement-semantics.md`
- `docs/architecture/adr-005-model-artifact-and-promotion.md`
- `frontend/e2e/fixtures/morning-room-golden.json`
- `docs/architecture/evidence/kickoffs/<kickoff-date>/baseline_state.json`
- `tests/contract/test_architecture_decision_completeness.py`

**Human decisions:** local storage target/pilot authority; identity strategy; zero-snap PPG definition; default roster horizon/risk inputs; external-source authorizations.

The dated `baseline_state.json` is machine checked, not a prose sign-off or a history of earlier work. At execution kickoff, discovery enumerates every in-flight branch/worktree whose changed paths overlap any ticket in this plan. The manifest records `clean_start_sha`, `origin_main_sha`, capture time, discovery command/result hash, and exactly one entry per discovered overlap with ticket/branch ID, worktree, base/head SHA, dirty paths, overlap paths, authoritative scope, exact required tests, disposition (`land`, `rebase`, `abandon`, or `closed_as_baseline`), merge order, and approver.

`tests/contract/test_architecture_decision_completeness.py` fails unless the manifest's entries equal the discovered overlap set, every entry has an accepted disposition, no mutable path is assigned to two owners, and the new build worktree is clean at the one exact recorded `clean_start_sha`. “Latest” is never a value. The dated kickoff artifact—not this product architecture—carries then-current ticket names, checkout condition, commits, and dispositions.

**Exit:** No unresolved decision changes the core schemas or build order; every discovered overlapping change has a machine-blocking disposition; and one clean starting SHA is recorded.

### Wave 1 — honesty kernel and walking skeleton

**Goal:** Make the honesty kernel, ordered claim levels, and placeholder-lane contracts executable without pretending PVO or DOO data lanes are ready.

**New paths:**

- `src/dynasty_genius/kernel/measurement.py`
- `src/dynasty_genius/kernel/receipt.py`
- `src/dynasty_genius/kernel/claim_level.py`
- `src/dynasty_genius/kernel/states.py`
- `src/dynasty_genius/kernel/time.py`
- `src/dynasty_genius/read_models/contracts.py`
- `tests/contract/test_honesty_kernel.py`
- `tests/contract/test_claim_level_composition.py`

**RED first:** reject value-without-receipt; reject score-bearing available state with null value; reject a series point beyond `as_of`; preserve calibration and unavailable states as independent axes; reject a composed claim above the minimum material-input level or evidence ceiling; require every placeholder lane to be `reference(s)`, `unavailable`, or `not_applicable`, with its own receipt.

**Product slice:** Morning Room renders the golden fixture with separate model, market, league, and opportunity states; no developer scaffolding appears.

**Focused command:**

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q \
  tests/contract/test_honesty_kernel.py \
  tests/contract/test_claim_level_composition.py
```

**Exit:** The focused kernel suite rejects every named invalid construction, accepts every declared unavailable/calibration combination, and exposes no compatibility constructor that can create a receiptless measurement.

### Wave 2 — one data-plane catalog and terminal run receipt

**Goal:** Establish one control-plane truth before migrating storage or expanding sources.

**New/modified paths:**

- `config/data_plane.yaml`
- `src/dynasty_genius/data_plane/contracts.py`
- `src/dynasty_genius/data_plane/catalog.py`
- `src/dynasty_genius/data_plane/run_receipt.py`
- `src/dynasty_genius/sources/daily_control.py`
- `tests/contract/test_data_plane_catalog.py`
- `tests/contract/test_terminal_run_receipt.py`

**RED first:** every Morning Room input stream must be declared once; every producer must declare terminal states, cadence, retention, backup class, and consumer role; aborted/blocked output cannot grade healthy; future timestamps cannot grade current; scheduler/freshness/backup projections must reconcile.

**Exit:** One run receipt and one evaluator feed every health consumer.

### Wave 3 — canonical identity with dual-key migration

**Goal:** Introduce immutable identity without rewriting history.

**New/modified paths:**

- `src/dynasty_genius/identity/store.py`
- `src/dynasty_genius/identity/normalizer.py`
- `src/dynasty_genius/identity/resolution_service.py`
- `src/dynasty_genius/identity/migration_bridge.py`
- `src/dynasty_genius/identity/models.py`
- `src/dynasty_genius/models/player_identity.py` (temporary compatibility re-export)
- `tests/contract/test_identity_store.py`
- `tests/contract/test_identity_dual_key_migration.py`
- `tests/contract/test_all_materializers_use_identity_gate.py`

**RED first:** duplicate canonical IDs, overlapping source-ID validity, conflicting deterministic assertions, fuzzy auto-promotion, historical as-of mapping, incomplete legacy-key bridges, or an unresolved source-universe row emitted as resolved or without an explicit `identity_unresolved` receipt.

**Exit:** Every Morning Room/player-universe row resolves to a canonical ID or one explicit unresolved state; historical aliases remain replayable.

### Wave 3A — governed production walking skeleton

**Goal:** Ship one truthful model-lane journey through atomic read-model publication, application projection, FastAPI, generated OpenAPI/Zod, and React before deeper migration. Market, league, and opportunity lanes remain explicitly unavailable until their authoritative waves land.

**Stabilization gate:** `A0.1` must be GREEN at the dated kickoff manifest's exact `clean_start_sha`; every discovered overlapping change must have an accepted disposition. No architecture migration begins from a dirty shared checkout.

**New/modified paths:**

- `src/dynasty_genius/read_models/store.py`
- `src/dynasty_genius/read_models/publisher.py`
- `src/dynasty_genius/read_models/morning_room.py`
- `src/dynasty_genius/read_models/morning_room_service.py`
- `app/api/routes/morning_room_models.py`
- `app/api/routes/morning_room.py`
- `app/api/error_handlers.py`
- `app/main.py`
- `scripts/run_local_reader.py`
- `scripts/dump_openapi.py`
- `frontend/openapi.json`
- `frontend/src/lib/api/index.ts`
- `frontend/src/lib/api/types.gen.ts`
- `frontend/src/lib/api/zod.gen.ts`
- `frontend/src/morning-room/`
- `frontend/src/lib/api/resource.ts`
- `frontend/src/ui/MetricCell.tsx`
- `frontend/scripts/check-receipt-bearing-metrics.mjs`
- `tests/contract/test_read_model_atomic_publish.py`
- `tests/contract/test_morning_room_endpoint.py`
- `tests/contract/test_openapi_drift_contract.py`
- `frontend/src/morning-room/MorningRoom.contract.test.tsx`

**RED first:** partial publication replaces last-good state; response receipt/hash differs from published artifact; stale/partial state maps to ready; route opens analytical files directly; OpenAPI/generated-client drift; runtime Zod accepts a malformed measurement; a product measurement bypasses `MetricCell`; unavailable lanes disappear; the reader binds off-loopback, exposes a local path/traceback, or lets API/docs/static fallback mask one another.

**Exit:** the built product publishes a model lane only when its existing source receipt satisfies the kernel contract; otherwise it publishes explicit `artifact_unavailable`. It never synthesizes provenance. Every other lane is explicitly unavailable, every rendered measurement passes the receipt-bearing primitive, generated contracts match the API, and no route reads analytical stores directly.

### Wave 4 — point-in-time storage pilot

**Goal:** Migrate one representative existing all-TEXT analytical store into typed Parquet and prove the local DuckDB target, alongside one feature vintage, before wider adoption.

**New paths:**

- `src/dynasty_genius/data_plane/snapshot_manifest.py`
- `src/dynasty_genius/data_plane/parquet_store.py`
- `scripts/run_storage_migration_pilot.py`
- `requirements.txt` (pin the pilot dependency only after ADR authorization)
- `tests/contract/test_storage_pilot_parity.py`
- `tests/contract/test_feature_store_as_of.py`

**RED first:** late corrections must not rewrite prior as-of results; future-known facts cannot leak backward; same input/version must produce the same content hash; numeric and timestamp types must round-trip; backup/restore and rollback must pass.

**Pilot evidence:** row/key/value parity, query timings on declared workloads, storage size, materialization duration, recovery rehearsal, and shadow-read parity.

**Human gate:** approve, revise, or reject wider DuckDB/Parquet migration based on the evidence.

### Wave 5 — feature vintages and dependency-aware daily DAG

**Goal:** Ensure every feature/model/read-model build consumes pinned captures and emits immutable receipts.

**New/modified paths:**

- `src/dynasty_genius/features/definitions.py`
- `src/dynasty_genius/features/store.py`
- `src/dynasty_genius/features/feature_refresh_runner.py`
- `scripts/materialize_feature_vintage.py`
- `scripts/run_daily_pipeline.py`
- `tests/contract/test_feature_vintage_lineage.py`
- `tests/contract/test_daily_pipeline_dependencies.py`

**RED first:** no feature producer may call a live provider loader; missing upstream receipts fail closed; replay produces the same normalized/feature hash; the DAG cannot start a consumer before successful dependencies; market fields fail structural feature validation.

**Exit:** The as-of test matrix proves the canonical feature query against past, late-arriving, missing, and future-known fixtures; the DAG suite proves no consumer runs before successful, hash-pinned dependencies.

### Wave 6 — Model Trust Plane

**Goal:** Make train/evaluate/refit/promote/serve equivalence structural.

**New/modified paths:**

- `src/dynasty_genius/modeling/training_spec.py`
- `src/dynasty_genius/modeling/artifact.py`
- `src/dynasty_genius/modeling/registry.py`
- `src/dynasty_genius/modeling/inference.py`
- `src/dynasty_genius/modeling/evaluation/backtest_harness.py`
- `src/dynasty_genius/eval/backtest_harness.py` (temporary compatibility re-export)
- `scripts/train_engine_b.py`
- `scripts/promote_model.py`
- `scripts/generate_model_cards.py`
- `app/services/engine_b_service.py` (compatibility adapter, then removal after callers migrate)
- `tests/contract/test_training_spec_equivalence.py`
- `tests/contract/test_model_promotion_boundary.py`
- `tests/contract/test_model_artifact_portability.py`
- `tests/contract/test_sealed_evaluation_boundary.py`

**RED first:** preprocessing/spec mismatch between evaluation and serving; label-window overlap; random player leakage; sealed-period rows used in tuning/calibration; training mutating active pointer; card/served-artifact hash mismatch; incompatible spec hash at load; market contamination; portable Ridge prediction mismatch.

**Exit:** The promotion receipt names the exact final artifact being served, and its model card describes that artifact and its separate evaluation evidence truthfully.

### Wave 7 — intrinsic PVO and belief archive

**Goal:** Materialize truthful intrinsic player beliefs and historical change drivers.

**New/modified paths:**

- `src/dynasty_genius/assembly/player_value_object.py`
- `src/dynasty_genius/assembly/universe_member_card_state.py`
- `src/dynasty_genius/models/player_value_object.py` (temporary compatibility re-export)
- `src/dynasty_genius/modeling/scoring_envelope.py`
- `src/dynasty_genius/assembly/pvo_assembler.py`
- `src/dynasty_genius/pvo_assembler.py` (compatibility re-export, then removal)
- `src/dynasty_genius/read_models/player_belief.py`
- `src/dynasty_genius/evidence/belief_archive.py`
- `tests/contract/test_pvo_availability_state.py`
- `tests/contract/test_belief_archive_append_only.py`
- `tests/architecture/test_import_boundaries.py`

**RED first:** Engine A provenance without an Engine A result; modeled state with null score; market or manager fields in intrinsic PVO; missing receipt; uncalibrated interval rendered as measured; historical belief overwrite.

**Exit:** Every named universe member has a `UniverseMemberCardState`; only canonically resolved members may reference a PVO, unresolved members carry an explicit `identity_unresolved` receipt, any historical belief can be reproduced from its receipt graph, and no production package imports `app` or `scripts`.

### Wave 8 — League Context Graph and manager facts

**Goal:** Build league-specific context without behavioral overclaim.

**New/modified paths:**

- `src/dynasty_genius/league/context_graph.py`
- `src/dynasty_genius/league/manager_behavior.py`
- `src/dynasty_genius/league/replacement_policy.py`
- `src/dynasty_genius/league/transactions.py`
- `src/dynasty_genius/league_transactions.py` (temporary compatibility re-export)
- `tests/contract/test_league_context_as_of.py`
- `tests/contract/test_manager_behavior_facts.py`

**RED first:** lane freshness inheritance; sample-free tendency labels; unsupported psychology/preference claims; transaction identity drift across league seasons; hard-coded league format overriding captured rules.

**Exit:** Each manager/roster/pick statement carries sample, time window, freshness, and evidence; missing lanes stay missing rather than borrowing certainty.

### Wave 9 — market lane, common cohorts, and DOOs

**Goal:** Create descriptive opportunity scenarios from independently trustworthy lanes.

The market-observation ticket `MK1.1` is independent of intrinsic PVO work and may start once identity and control-plane receipts are ready. Common-cohort comparison `MK2.1` waits for both governed market observations and intrinsic PVO output. The lane-optional DOO contract `D1.1` can start from the kernel alone; each concrete `D3.*` scenario waits only for the material lanes declared in its ticket row.

**New/modified paths:**

- `src/dynasty_genius/market/observation.py`
- `src/dynasty_genius/market/common_cohort.py`
- `src/dynasty_genius/decision/opportunity.py`
- `src/dynasty_genius/decision/scenario_service.py`
- `src/dynasty_genius/evidence/experiment_registry.py`
- `src/dynasty_genius/evidence/decision_ledger.py`
- `tests/contract/test_common_cohort_divergence.py`
- `tests/contract/test_decision_opportunity_receipts.py`
- `tests/contract/test_decision_ledger_append_only.py`
- `tests/contract/test_no_hidden_action_rank.py`

**RED first:** mismatched model/market populations; stale-lane timestamp laundering; market entering PVO/model features; unsupported DOO field presented as available; cross-action desirability ranking; missing counterargument or receipt graph; decision receipt overwrite; decision capture using evidence after the DOO `as_of`.

**Exit:** The released scenario contracts contain no directive/verdict field or cross-action rank; every material conclusion passes claim-composition and receipt tests; and append-only decision capture is GREEN before any production DOO feature flag is enabled.

### Wave 10 — production Morning Room and workflow consolidation

**Goal:** Replace capability-oriented navigation with the five decision workflows.

**New/modified paths:**

- `frontend/src/morning-room/`
- `frontend/src/shell/AppShell.tsx`
- `frontend/e2e/visual-smoke.spec.ts`
- `tests/contract/test_frontend_build_manifest.py`

`U1.1` reuses the already-GREEN `R0.2`, `G1.x`, `U2.1`, and `R0.4` contracts. It does not take ownership of their API, generated-client, receipt-primitive, scanner, or release-manifest paths.

**Surface migration order:** Morning Room → Players → Roster → Trade → League → Draft → Trust & Methods. Each migrated route moves artifact access into its owning application/read-model package before the next surface begins.

**RED first:** first viewport lacks roster-level model/market summary; duplicate players inflate summary counts; parked/developer surfaces appear; model/market lanes visually or semantically blend; a product measurement renders outside an allowlisted receipt-bearing primitive; `MetricCell.receipt` is optional; stale/partial/unavailable states disappear; duplicate consumers issue duplicate GETs; stale frontend build serves against a different OpenAPI/source hash.

**Exit:** Morning Room → evidence → scenario → workflow passes desktop, mobile, keyboard, accessibility, contract, and build-provenance gates; migrated product routes contain no direct analytical-artifact reads.

### Wave 11 — outcome accountability and compounding evidence

**Goal:** Close both accountability clocks and make learning durable.

**New/modified paths:**

- `src/dynasty_genius/evidence/outcome_registry.py`
- `src/dynasty_genius/evidence/realized_outcome_scorer.py`
- `src/dynasty_genius/outcome_loop/realized_outcome_scorer.py` (temporary compatibility re-export)
- `src/dynasty_genius/evidence/outcome_finality.py`
- `src/dynasty_genius/read_models/trust_scoreboard.py`
- `tests/contract/test_outcome_finality.py`
- `tests/contract/test_decision_ledger_replay.py`
- `tests/contract/test_evidence_claim_levels.py`

**RED first:** an unauthorized or unhashed finality attestation settles a week; unsettled outcomes grade final; survivorship exclusions are hidden; decision replay uses later-known evidence; descriptive result promotes without replication/power gate; historical claim supersedes without linkage.

**Exit:** Forecasts and voluntary decision receipts grade forward with complete denominators, and evidence levels update without rewriting prior claims.

### 14.13 Binding ticket protocol and ownership matrix

The waves above describe architectural outcomes. Execution occurs only through the tickets below. One ticket owns each contract or mutable path at a time; “parallel” never means two worktrees editing the same boundary.

#### Required ticket evidence

Every ticket creates `runs/<run_id>/<ticket_id>/` containing:

- `scope.json` — base SHA, authorized paths, prerequisites, and owner;
- `inputs.manifest.json` — fixture/source hashes and environment identity;
- `red.txt` — exact command and expected failing assertion;
- `green.txt` — focused passing command;
- `affected-suite.txt` — passing affected-layer command;
- `parity.json` — shadow/parity results and declared tolerance, or `not_applicable`;
- `security.json` — applicable security/operations checks;
- `real-surface/` — required browser evidence, or `not_applicable` with reason;
- `rollback.md` — exact rollback/read-pointer action;
- `review.md` — independent review result and unresolved findings;
- `handoff.json` — changed paths, compatibility seam, retirement state, and human gate.

Command conventions are binding:

```bash
# Python RED/focused GREEN
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q <exact-test-node>

# Python affected suite
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q <listed-suite-paths>

# Frontend RED/focused GREEN
npm --prefix frontend run test -- <exact-test-file>

# Generated contract check
npm --prefix frontend run openapi-gen
git diff --exit-code -- frontend/openapi.json frontend/src/lib/api

# Real-surface ticket journey
npm --prefix frontend run visual:smoke -- --grep '@<ticket-id>'
```

The RED evidence must show the named assertion failing for the intended reason—not an import, fixture, environment, or collection failure. GREEN reuses the same node. Affected-suite scope is listed in the matrix. Full-suite success never substitutes for missing focused RED evidence.

#### Exclusive ownership and cutover matrix

| Ticket | Single owner and exclusive mutable paths | Prerequisites | Exact RED node and expected failure | Affected suite | Cutover, retirement, and rollback proof |
|---|---|---|---|---|---|
| `A0.1` | Architecture lane: `docs/architecture/adr-001-*` through `adr-005-*`, dated `docs/architecture/evidence/kickoffs/<kickoff-date>/baseline_state.json` | Complete discovered overlap set and current `origin/main` | `tests/contract/test_architecture_decision_completeness.py`; RED = unresolved schema-changing decision, discovered/manifest set mismatch, missing disposition, ambiguous overlap owner, dirty worktree, or missing exact clean/source/master SHA | Focused contract plus `scripts/validate_governance.py` | No code cutover. Dated manifest must name one clean SHA and an accepted disposition for every discovered overlap. Rejected ADR leaves runtime unchanged. |
| `K1.1` | Kernel lane: `kernel/measurement.py`, `receipt.py`, `claim_level.py`, `states.py`, `time.py` | `A0.1` | `tests/contract/test_honesty_kernel.py` and `test_claim_level_composition.py`; RED = receiptless measurement, right-edge violation, invalid placeholder lane, or composed claim above the minimum input/evidence ceiling accepted | Both focused nodes plus `tests/contract/test_pvo_schema.py` | Additive types only. Rollback removes unused types; enforcement waits for consumers. |
| `C1.1` | Data-plane catalog: `config/data_plane.yaml`, `data_plane/contracts.py`, `catalog.py` | `A0.1` | `tests/contract/test_data_plane_catalog.py`; RED = Morning Room stream undeclared/duplicated or lacks cadence, terminal state, retention, backup class | `tests/contract/test_data_plane_catalog.py tests/test_source_registry.py` | Catalog shadows existing configs. Retire duplicate declarations only after byte-equivalent generated projections. Rollback keeps existing configs authoritative. |
| `C2.1` | Run truth: `data_plane/run_receipt.py`, health application evaluators | `C1.1`, `K1.1` | `tests/contract/test_terminal_run_receipt.py`; RED = aborted/future/failed dependency graded healthy | `tests/contract/test_terminal_run_receipt.py tests/contract/test_system_capture_health_t1.py tests/contract/test_system_capture_health_t4.py` | Shadow old/new health for seven successful scheduled runs. Switch all consumers together; rollback restores old evaluator pointer. |
| `C3.1` | Pipeline/schedule lane: `scripts/run_daily_pipeline.py`, `scripts/install_daily_pipeline.py`, `src/dynasty_genius/sources/daily_control.py`, new `ops/launchd/com.davidleess.dynasty-daily-pipeline.plist`, and the existing `ops/launchd/com.davidleess.dynasty-*.plist` retirement manifest | `C2.1`, `F2.1` | `tests/contract/test_daily_pipeline_safety.py`; RED = concurrent lock, duplicate run, crash resume, failed dependency can publish, or an unrecorded legacy plist remains active | `tests/contract/test_daily_pipeline_dependencies.py tests/contract/test_daily_pipeline_safety.py tests/contract/test_scheduler_cutover_manifest.py` | Run new DAG in shadow for seven complete cycles. Human scheduler-cutover gate; disable named legacy plists only after parity. Rollback re-enables the exact manifest-recorded schedule. |
| `I1.1` | Identity schema/normalizer: `identity/models.py`, `store.py`, `normalizer.py` | `C1.1`, `K1.1` | `tests/contract/test_identity_store.py`; RED = overlapping source validity, mutable canonical ID, or fuzzy production write accepted | `tests/contract/test_identity_store.py tests/test_identity_materialization_gate.py tests/test_identity_override_registry.py` | Additive store. No consumer cutover. Rollback drops only newly generated pilot store. |
| `I2.1` | Resolver/review: `identity/resolution_service.py`, review queue adapter | `I1.1` | `tests/contract/test_identity_resolution_service.py`; RED = unresolved/fuzzy candidate materializes without deterministic evidence or approval receipt | `tests/contract/test_identity_resolution_service.py tests/contract/test_identity_store.py` | Shadow against current crosswalk; disagreements all enter review. No automatic cutover. |
| `I3.1` | Dual-key bridge: `identity/migration_bridge.py`, compatibility re-export in `models/player_identity.py` | `I2.1` | `tests/contract/test_identity_dual_key_migration.py`; RED = legacy key missing alias, historical as-of changes, or collision hidden | `tests/contract/test_identity_dual_key_migration.py tests/contract/test_outcome_identity_bridge.py` | Require exact key-count equality and explicit unresolved reasons. Human identity-cutover gate. Rollback selects legacy-key reader; bridge remains append-only. |
| `I4.x` | One consumer per ticket: feature materializer → PVO → scorer → market → league → read models | `I3.1`; prior consumer GREEN | Consumer-specific node under `tests/contract/identity_cutover/`; RED = consumer bypasses identity gate | Consumer module suite plus `test_all_materializers_use_identity_gate.py` | Shadow exact keys/counts; retire each legacy lookup only after its ticket. Rollback is consumer-specific reader flag. |
| `R0.1` | Read-model store/publisher: `read_models/store.py`, `publisher.py` | `C2.1`, `I3.1`, `K1.1` | `tests/contract/test_read_model_atomic_publish.py`; RED = partial/mismatched publication replaces last-good | `tests/contract/test_read_model_atomic_publish.py tests/contract/test_feature_publish.py` | Canonical JSON must be byte-stable for identical inputs. Atomic pointer switch; rollback selects last-good receipt. |
| `R0.2` | Morning reader/security lane: `read_models/morning_room.py`, `morning_room_service.py`, `app/api/routes/morning_room_models.py`, `app/api/routes/morning_room.py`, `app/api/error_handlers.py`, `app/main.py`, `scripts/run_local_reader.py` | `R0.1` | `tests/contract/test_morning_room_endpoint.py` and `test_local_reader_security.py`; RED = route reads analytical store, response receipt/hash mismatch, stale/partial maps ready, source receipt is invented, off-loopback bind, local path/traceback leak, or fallback masking | `tests/contract/test_morning_room_endpoint.py tests/contract/test_frontend_static_mount.py tests/contract/test_local_reader_security.py tests/contract/test_reader_error_sanitization.py` | Publish model lane only from a kernel-valid existing source receipt; otherwise `artifact_unavailable`. Other lanes unavailable. Rollback removes route and keeps old shell entry. |
| `G1.1` | Generated-contract lane only: `scripts/dump_openapi.py`, `frontend/openapi.json`, `frontend/src/lib/api/index.ts`, `types.gen.ts`, `zod.gen.ts` | `R0.2` | `tests/contract/test_openapi_drift_contract.py`; RED = source schema, checked-in OpenAPI, generated TypeScript, or runtime Zod disagree | Focused contract plus `npm --prefix frontend run openapi-gen` and `git diff --exit-code -- frontend/openapi.json frontend/src/lib/api` | One serialized `G1.x` regeneration owns these paths for every later API schema change. Generated outputs are retained on UI rollback and must match the still-active API. |
| `U2.1` | Receipt UI lane: `frontend/src/ui/MetricCell.tsx`, receipt primitives, `frontend/scripts/check-receipt-bearing-metrics.mjs` | `K1.1`, `G1.1` | `frontend/src/ui/MetricCell.receipt.test.tsx`; RED = product measurement renders outside an allowlisted receipt primitive or receipt prop is optional | UI tests plus `npm --prefix frontend run banned-language` and receipt scanner | Executes in Wave 3A before any product surface. Ratchet new/changed surfaces first, then burn down allowlist. Rollback restores an allowlist entry, never removes receipt data. |
| `R0.3` | Walking-product candidate: `frontend/src/lib/api/resource.ts`, `frontend/src/morning-room/` | `R0.2`, `G1.1`, `U2.1` | `frontend/src/morning-room/MorningRoom.contract.test.tsx`; RED = malformed Zod payload renders, unavailable lane disappears, receipt primitive is bypassed, or duplicate request occurs | `frontend/src/morning-room/*.test.tsx frontend/src/lib/**/*.test.ts`, receipt scanner, generated-contract check | Candidate only; production flag stays off. Handoff names exact build/read-model hashes for `PERF1.1` and `R0.4`. Rollback removes candidate UI; generated artifacts remain aligned with active API. |
| `R0.4` | Walking-skeleton release: `config/features/R0-morning-room.yaml`, `frontend/e2e/morning-room-release.spec.ts` | `R0.3`, `PERF1.1` | `frontend/e2e/morning-room-release.spec.ts`; RED = flag can expose a build without matching source/OpenAPI/read-model hashes, performance proof, or real-surface states | Tagged `@R0.4` desktop/mobile/keyboard/a11y journey plus receipt scanner and product verifier subset | Human walking-skeleton gate. Enable only the exact candidate manifest. Rollback disables the flag; read-model and immutable evidence remain. |
| `S1.1` | Storage pilot only: `data_plane/parquet_store.py`, `run_storage_migration_pilot.py`, immutable `docs/architecture/evidence/storage-pilot/<run_id>/` evidence | `C1.1`, `I3.1`, storage ADR approval to install dependency | `tests/contract/test_storage_pilot_parity.py`; RED = typed target differs from frozen source beyond tolerance, mutates source, or overwrites a prior run's evidence | `tests/contract/test_storage_pilot_parity.py tests/contract/test_feature_store_as_of.py` | Read-only source; no production cutover. Human storage gate decides wider work. Rollback deletes only derived Parquet/DuckDB working outputs and permanently retains manifests, reports, receipts, and review evidence. |
| `O2.1` | Backup/restore lane: `app/config/backup_manifest.json`, `scripts/backup_irreplaceable_data.py`, restore harness and its contract test | `C1.1`; `S1.1` before classifying pilot-derived persistent stores | `tests/contract/test_backup_classification_and_restore.py`; RED = irreplaceable store absent/misclassified, hash differs after restore, or restore targets an active path | Backup/restore contract plus a `mktemp -d` restore rehearsal | Human gate before persistent-store reader cutover. Each later persistent store gets one serialized `O2.x` update/rehearsal; rollback restores prior manifest pointer without deleting receipts. |
| `F1.1` | Feature API: `features/definitions.py`, `features/store.py` | Approved `S1.1`, `I3.1` | `tests/contract/test_feature_store_as_of.py`; RED = future observation enters as-of result, historical vintage rewrites, market field accepted | `tests/contract/test_feature_store_as_of.py tests/contract/test_feature_vintage_lineage.py` | Dual-write current CSV and vintage store. No consumer switches in this ticket. |
| `F2.1` | Feature publisher: `features/feature_refresh_runner.py`, `materialize_feature_vintage.py` | `F1.1`, `C2.1` | `tests/contract/test_feature_vintage_publish.py`; RED = missing upstream receipt or failed validation changes active pointer | `tests/contract/test_feature_vintage_publish.py tests/contract/test_feature_refresh_runner.py tests/contract/test_feature_publish.py` | Seven-run shadow; exact key/null mask, numeric `atol=1e-12`, `rtol=0`. Rollback selects prior CSV pointer. |
| `F3.x` | One consumer per ticket: Engine B → PVO → outcome research → remaining analysis | `F2.1`; prior consumer GREEN | `tests/contract/feature_cutover/test_<consumer>.py`; RED = consumer live-loads provider or uses unpinned latest | Consumer suite plus `test_feature_vintage_lineage.py` | Shadow predictions/rows under declared tolerance. Retire old read only after each consumer gate. |
| `M1.1` | `modeling/training_spec.py` | `F2.1`, measurement semantics ADR | `tests/contract/test_training_spec_equivalence.py`; RED = train/eval/refit/serve can express different preprocessing or target under same hash | `tests/contract/test_training_spec_equivalence.py tests/test_backtest_gates.py` | Additive spec alongside legacy config. Rollback keeps legacy until M5.1. |
| `M2.1` | Portable artifact: `modeling/artifact.py` | `M1.1` | `tests/contract/test_model_artifact_portability.py`; RED = JSON Ridge differs from approved pipeline (`atol=1e-10`, `rtol=1e-12`) or omits spec/data hashes | `tests/contract/test_model_artifact_portability.py tests/test_engine_b_service.py` | No serve cutover. Preserve legacy artifact. Evidence includes prediction vector/hash parity. |
| `M3.1` | Evaluation/refit: `modeling/evaluation/backtest_harness.py`, compatibility re-export, `train_engine_b.py` | `M1.1`, `M2.1` | `tests/contract/test_sealed_evaluation_boundary.py`; RED = label overlap, player leakage, or sealed rows influence tuning/calibration | `tests/contract/test_sealed_evaluation_boundary.py tests/test_backtest_gates.py tests/test_backtest_harness.py` | Produces candidate/final-refit artifacts only. No active pointer mutation. Rollback discards candidate. |
| `M4.1` | Registry/promotion lane: `modeling/registry.py`, `scripts/promote_model.py`, `scripts/generate_model_cards.py`, append-only `runs/model-registry/receipts/`, mutable `config/active_model.json`; `app/config/model_registry.json` is a temporary compatibility pointer only | `M3.1` | `tests/contract/test_model_promotion_boundary.py`; RED = trainer mutates pointer, immutable `PromotionReceipt` can be edited, active pointer embeds receipt history, or receipt/card/final hash differs | `tests/contract/test_model_promotion_boundary.py tests/test_model_card.py` | Human gate creates immutable `PromotionReceipt`, then atomically switches `config/active_model.json`. Rollback promotes prior artifact through a new receipt. `X1.model-registry-pointer` retires `app/config/model_registry.json` after all readers migrate. |
| `M5.1` | Serving: `modeling/inference.py`, compatibility adapter in `app/services/engine_b_service.py` | `M4.1` | `tests/contract/test_model_serving_spec_hash.py`; RED = incompatible spec loads, request-time pickle loads, or served vector differs | `tests/contract/test_model_serving_spec_hash.py tests/test_engine_b_service.py tests/contract/test_system_model_provenance_t2.py` | Shadow old/new predictions, `atol=1e-10`, `rtol=1e-12`. Switch pointer reader; retire pickle path after seven healthy materializations. |
| `P1.1` | PVO/census types: `assembly/player_value_object.py`, `assembly/universe_member_card_state.py`, compatibility re-export | `K1.1`, `M5.1` | `tests/contract/test_pvo_availability_state.py`; RED = available null score, unresolved member receives PVO, resolved member lacks canonical ID, market/league field enters intrinsic PVO, or receipt is missing | `tests/contract/test_pvo_availability_state.py tests/contract/test_pvo_schema.py tests/contract/test_universe_member_card_state.py` | Additive schema version; old PVO remains readable during shadow. |
| `P2.1` | PVO assembly: `assembly/pvo_assembler.py`, root compatibility re-export | `P1.1` | `tests/contract/test_pvo_assembler_truth.py`; RED = false engine provenance, uncalibrated band rendered calibrated, `universe_snapshot_id` denominator absent, or unresolved row emitted as resolved | `tests/contract/test_pvo_assembler_truth.py tests/test_pvo_assembler.py tests/test_phase17_universe_pvo_batch.py` | Shadow all member-card rows in one named universe; require exact population accounting and explicit unresolved/unavailability reason for every changed row. Rollback selects prior PVO pointer. |
| `P3.1` | Belief archive/read model: `evidence/belief_archive.py`, `read_models/player_belief.py` | `P2.1`, `R0.1` | `tests/contract/test_belief_archive_append_only.py`; RED = historical belief overwrites or receipt graph cannot replay | `tests/contract/test_belief_archive_append_only.py tests/contract/test_read_model_atomic_publish.py` | Append-only dual publication. Rollback reader pointer; never delete archive rows. |
| `L1.1` | League graph: `league/context_graph.py` | `I3.1`, `C2.1` | `tests/contract/test_league_context_as_of.py`; RED = hard-coded rules override source or one lane borrows another's freshness | `tests/contract/test_league_context_as_of.py tests/contract/test_league_snapshot_capture_red.py` | Shadow current league artifacts. Cut lane by lane; rollback pointer per lane. |
| `L2.1` | Transactions/manager facts: `league/transactions.py`, `manager_behavior.py`, root compatibility re-export | `L1.1` | `tests/contract/test_manager_behavior_facts.py`; RED = psychology/preference claim without estimand/sample or manager identity drifts | `tests/contract/test_manager_behavior_facts.py tests/contract/test_league_transaction_chain_red.py` | Facts only; current opportunity composite remains unchanged until D tickets. |
| `L3.1` | Replacement policy: `league/replacement_policy.py` | `L1.1`, approved measurement semantics | `tests/contract/test_replacement_policy.py`; RED = hard-coded league assumption or unversioned coefficient affects output | `tests/contract/test_replacement_policy.py tests/test_phase17_5_league_opportunity_roster_cut_wiring.py` | Candidate policy shadows current xVAR/replacement views; no decision use before review. |
| `MK1.1` | Market-observation lane: `market/observation.py`, its capture adapter and receipt contract | `I3.1`, `C2.1` | `tests/contract/test_market_observation_as_of.py`; RED = unresolved identity promoted, source/as-of/eligibility absent, unauthorized acquisition accepted, or market field reaches modeling | Focused node plus `tests/test_market_leakage_gate.py` | Shadow governed observations independently of PVO. No common-cohort publication. Rollback selects prior market-observation pointer. |
| `MK2.1` | Common-cohort lane: `market/common_cohort.py`, divergence materializer | `MK1.1`, `P2.1` | `tests/contract/test_common_cohort_divergence.py`; RED = model and market populations/as-of boundaries differ or percentiles use a wider denominator | `tests/contract/test_common_cohort_divergence.py tests/contract/test_market_divergence_rebase_red.py tests/test_market_leakage_gate.py` | Shadow current divergence. Switch only common-cohort artifact pointer; rollback selects old artifact with explicit legacy caveat. |
| `D1.1` | Lane-optional DOO contract: `decision/opportunity.py` | `K1.1` | `tests/contract/test_decision_opportunity_receipts.py`; RED = a lane is not one of `reference(s)`, `unavailable`, or `not_applicable`, lacks its own receipt, conclusion exceeds minimum material-input/evidence ceiling, borrows freshness, or lacks counterargument | `tests/contract/test_decision_opportunity_receipts.py tests/contract/test_pvo_doo_boundary.py tests/contract/test_claim_level_composition.py` | Contract only; no lane is required merely because it exists in the type, and no product is released. |
| `D2.1` | Decision capture: `evidence/decision_ledger.py` | `D1.1` | `tests/contract/test_decision_ledger_append_only.py`; RED = receipt overwrite or later-known evidence captured as original basis | `tests/contract/test_decision_ledger_append_only.py` | Must be GREEN before first production DOO workflow. Rollback disables capture endpoint; ledger remains immutable. |
| `D3.a-f` | One scenario per ticket under `decision/scenarios/`: capacity, hold/move, trade package, partner evidence, waiver gap, draft | `D2.1` plus the row's declared material-lane prerequisites | `tests/contract/decision/test_<scenario>.py`; RED = unbounded inputs, timeout breach, hidden rank, invalid lane state, or unavailable advanced field displayed | Scenario node plus relevant roster/trade/league suite and `PERF2.x` before release | Backend candidate registry only; mapped `U3.x` owns every product flag, real-surface gate, and rollback. |
| `U1.1` | Full Morning Room composition: `frontend/src/morning-room/`, `AppShell.tsx` | `R0.4`, at least one authoritative changed-fact lane | `frontend/src/morning-room/MorningRoom.product.test.tsx`; RED = five-second summary absent, duplicate counts, parked/dev chrome, or lane blending | All `morning-room` and `shell` tests plus `@U1.1` Playwright journey | Human cockpit-framing/visual gate. Rollback keeps governed walking skeleton. |
| `U3.a-g` | One surface per ticket: Players, Roster, Trade, League, Draft, Trust, ops separation | `U1.1`; required authoritative lane | Surface-local test file; RED = direct artifact fetch/read, duplicated transport state, raw keys, or missing state matrix | Surface tests + generated-contract check + tagged Playwright journey | One route/surface flag per ticket. Retire legacy surface only after real-surface and contract parity. |
| `E1.1` | Finality/registry: `evidence/outcome_finality.py`, `outcome_registry.py`, `experiment_registry.py` | Human finality-authority decision | `tests/contract/test_outcome_finality.py`; RED = unauthorized/unhashed attestation settles week or claim upgrades without evidence | `tests/contract/test_outcome_finality.py tests/contract/test_evidence_claim_levels.py` | No scoring cutover. Immutable authority/attestation receipts. |
| `E2.1` | Realized scorer migration: `evidence/realized_outcome_scorer.py`, compatibility re-export | `E1.1`, `P3.1` | `tests/contract/test_realized_outcome_settlement.py`; RED = unsettled outcome grades, exclusion denominator hidden, or later evidence leaks backward | Outcome-loop and realized-scorecard contract suites | Shadow existing scorer on frozen beliefs; exact denominator/key parity. Rollback selects prior scorer module. |
| `E3.1` | Trust read model: `read_models/trust_scoreboard.py` | `E2.1`, `R0.1` | `tests/contract/test_trust_scoreboard_claims.py`; RED = descriptive result presented at higher claim level or coverage omitted | Trust/model-scoreboard frontend and backend suites | Publish through atomic read model; rollback pointer to prior trust artifact. |
| `PERF1.1` | Product benchmark harness: `scripts/benchmark_product_read_models.py`, `tests/performance/test_product_budgets.py`, `tests/fixtures/performance/morning_room_v1.json`, `frontend/e2e/performance.spec.ts` | `R0.3`, `C2.1` | `tests/performance/test_product_budgets.py`; RED = warmed GET p95 >250 ms, cold Morning API >1 s, health >250 ms, first meaningful render >1.5 s, or reference-machine manifest missing | Thirty measured runs after three warm-ups plus `npm --prefix frontend exec playwright test e2e/performance.spec.ts`; budgets in §17 | No production flag changes. Store immutable raw samples/summary at `runs/<run_id>/PERF1.1/`; evidence-backed ADR required to change a budget. |
| `PERF2.x` | One scenario benchmark per `D3.x`: `tests/fixtures/performance/scenarios/<scenario>.json`, `tests/performance/scenarios/test_<scenario>_budget.py` | `PERF1.1`, matching `D3.x` | Scenario performance node; RED = declared maximum fixture exceeds 500 ms, violates cancellation/bounds, or omits machine/input hashes | Thirty measured runs after three warm-ups using the shared immutable harness; p95 ≤500 ms | Benchmark-only; writes `runs/<run_id>/PERF2.<scenario>/`. Scenario cannot enter its mapped `U3.x` release without GREEN. |
| `V1.1` | Foundation verifier: `scripts/verify_data_foundation.py` | `C3.1`, `I4.x`, `F3.x` | `tests/contract/test_verify_data_foundation.py`; RED = verifier passes with missing census/replay/restore/lineage proof | Data-plane, identity, feature contract suites | Verification-only; no cutover. Writes `runs/<run_id>/V1.1/report.json`. |
| `V2.1` | Model verifier: `scripts/verify_model_provenance.py` | `M5.1`, `P2.1` | `tests/contract/test_verify_model_provenance.py`; RED = served/card/receipt/spec hashes differ or PVO lacks receipt | Modeling, PVO, model-card suites | Verification-only. Writes `runs/<run_id>/V2.1/report.json`. |
| `V3.1` | Product verifier: `scripts/verify_product_read_models.py` | `U1.1`, released `U3.x` | `tests/contract/test_verify_product_read_models.py`; RED = source/OpenAPI/build/read-model hashes differ or route reads analytical artifact | Frontend gate, API/read-model contracts, tagged Playwright journeys | Verification-only. Writes `runs/<run_id>/V3.1/report.json`. |
| `X1.model-registry-pointer` | Compatibility cleanup: `app/config/model_registry.json` and only its remaining import/read callers | All readers use `config/active_model.json`; rollback window expired | `tests/architecture/test_no_legacy_imports.py::test_model_registry_compatibility_pointer`; RED = any production caller still reads compatibility pointer | Import-boundary test plus model serving, promotion, provenance, and health suites | Delete compatibility pointer only after zero callers. Rollback restores the pointer from the last immutable `PromotionReceipt`; receipt history is untouched. |
| `X1.x` | One compatibility cleanup per migrated package; only the named legacy re-export and its import callers | All consumer cutovers for that shim; rollback window expired | `tests/architecture/test_no_legacy_imports.py::<shim>`; RED = any production caller still imports the legacy path | Import-boundary test plus all migrated consumer suites | Delete shim only after test proves zero production callers. Rollback restores the shim without changing canonical storage or artifacts. |

#### Expanded one-consumer/one-scenario/one-surface tickets

The grouped rows above expand into these independent tickets; none may be bundled:

| ID | Exclusive mutable paths | Prerequisites | Exact RED and expected failure | Affected suite / tolerance | Flag, cutover, and rollback |
|---|---|---|---|---|---|
| `I4.a` | `features/feature_assembly.py`, `features/identity_adapter.py`, `config/migrations/I4a-feature-identity.yaml` | `I3.1` | `tests/contract/identity_cutover/test_feature_materializer.py`; bypassed identity gate or hidden unresolved row | Identity-cutover node + feature assembly/refresh suites; exact keys/counts/null mask | Shadow both IDs; switch `reader: canonical`; rollback to `legacy` flag |
| `I4.b` | `universe_pvo_batch.py`, `assembly/identity_adapter.py`, `config/migrations/I4b-pvo-identity.yaml` | `I3.1` | `tests/contract/identity_cutover/test_pvo.py`; PVO population loses/duplicates a legacy player | Node + universe-PVO suites; exact `universe_snapshot_id`, keys, counts, explicit unresolved reasons | Shadow full universe; rollback PVO identity reader flag |
| `I4.c` | `outcome_loop/` identity adapter, `config/migrations/I4c-scorer-identity.yaml` | `I3.1` | `tests/contract/identity_cutover/test_realized_scorer.py`; frozen belief/outcome join changes silently | Node + outcome identity/scorer suites; exact denominator/key parity | Shadow frozen cohort; rollback scorer identity reader flag |
| `I4.d` | `market_divergence_rebase.py`, `market/identity_adapter.py`, `config/migrations/I4d-market-identity.yaml` | `I3.1` | `tests/contract/identity_cutover/test_market.py`; market/model cohort loses, duplicates, or silently remaps player | Node + divergence/leakage suites; exact cohort membership before value recomputation | Shadow cohort; rollback market identity reader flag |
| `I4.e` | `league_transactions.py`, `league/identity_adapter.py`, `config/migrations/I4e-league-identity.yaml` | `I3.1` | `tests/contract/identity_cutover/test_league.py`; manager/player identity changes across league-season chain | Node + transaction/snapshot suites; exact movement keys and explicit unresolved reasons | Shadow league chain; rollback league identity reader flag |
| `I4.f` | `read_models/identity_adapter.py`, `config/migrations/I4f-read-model-identity.yaml` | `I3.1` | `tests/contract/identity_cutover/test_read_models.py`; canonical read-model join differs without receipt | Node + read-model atomicity suite; exact canonical response after volatile-time normalization | New read models use canonical by construction; rollback disables read-model publication |
| `F3.a` | `features/feature_source.py`, `modeling/feature_adapter.py`, `config/migrations/F3a-engine-b-features.yaml` | `F2.1`, `I4.a` | `tests/contract/feature_cutover/test_engine_b.py`; provider/latest read or unpinned vintage accepted | Node + Engine B service/backtest suites; prediction parity `atol=1e-10`, `rtol=1e-12` | Seven shadow runs; rollback Engine B feature reader flag |
| `F3.b` | `assembly/pvo_feature_adapter.py`, `config/migrations/F3b-pvo-features.yaml` | `F2.1`, `I4.b` | `tests/contract/feature_cutover/test_pvo.py`; PVO reads mutable latest or loses vintage receipt | Node + PVO suites; exact population, numeric tolerance declared per measurement | Seven shadow materializations; rollback PVO feature reader flag |
| `F3.c` | `evidence/feature_adapter.py`, `config/migrations/F3c-outcome-features.yaml` | `F2.1`, `I4.c` | `tests/contract/feature_cutover/test_outcome_research.py`; later vintage enters historical study | Node + outcome/research suites; exact as-of keys and hashes | Shadow registered studies; rollback evidence feature reader flag |
| `F3.d` | `features/consumer_registry.py`, `config/migrations/F3d-registered-consumers.yaml` | `F3.a-c` | `tests/contract/feature_cutover/test_registered_consumers.py`; undeclared legacy/live consumer remains | Node + every registry-listed suite; zero unregistered consumers | Switch one registry entry per sub-run; rollback that entry only |
| `D3.a` | `decision/scenarios/roster_capacity.py`, `config/features/D3a-roster-capacity.yaml` | `D2.1`, `P2.1`, `L3.1`; material lanes = intrinsic + league; market = `not_applicable` | `tests/contract/decision/test_roster_capacity.py` + `test_roster_capacity_bounds.py`; verdict/rank or bounds/time budget violated | Decision nodes + roster-capacity domain suite; deterministic fixture exact | Backend candidate only; release through `U3.b`. Rollback disables scenario registry entry |
| `D3.b` | `decision/scenarios/hold_move.py`, `config/features/D3b-hold-move.yaml` | `D2.1`, `P2.1`, `L1.1`, `MK2.1`; material lanes = intrinsic + league + common-cohort market | `tests/contract/decision/test_hold_move.py` + bounds node; lane absent without its own receipt, lanes blend, or hidden desirability appears | Decision nodes + PVO/market suites; deterministic measurement equality | Backend candidate only; release through `U3.c`; rollback registry entry |
| `D3.c` | `decision/scenarios/trade_package.py`, `config/features/D3c-trade-package.yaml` | `D2.1`, `P2.1`, `L3.1`, `MK2.1`; material lanes = intrinsic + league + common-cohort market | `tests/contract/decision/test_trade_package.py` + bounds node; opaque fairness scalar/verdict, missing lane receipt, or input limit accepted | Decision nodes + trade-lab suites; exact fixture outputs/ranges | Backend candidate only; release through `U3.c`; rollback registry entry |
| `D3.d` | `decision/scenarios/partner_evidence.py`, `config/features/D3d-partner-evidence.yaml` | `D2.1`, `L2.1`; material lane = league facts; intrinsic/market = `not_applicable` | `tests/contract/decision/test_partner_evidence.py` + bounds node; psychology/willingness claim or receiptless fact emitted | Decision nodes + manager-facts suite; exact fact/sample receipts | Backend candidate only; release through `U3.c`; rollback registry entry |
| `D3.e` | `decision/scenarios/waiver_gap.py`, `config/features/D3e-waiver-gap.yaml` | `D2.1`, `P2.1`, `L3.1`; material lanes = intrinsic + league; market = `not_applicable` | `tests/contract/decision/test_waiver_gap.py` + bounds node; pickup rank/verdict or absent replacement receipt | Decision nodes + roster suites; deterministic gap interval | Backend candidate only; release through `U3.b`; rollback registry entry |
| `D3.f` | `decision/scenarios/draft.py`, `config/features/D3f-draft.yaml` | `D2.1`, `P2.1`, `L1.1`; material lanes = intrinsic + league; market = `not_applicable` | `tests/contract/decision/test_draft.py` + bounds node; unsupported prospect score, missing lane receipt, or directive pick order | Decision nodes + rookie/mock-consensus suites; exact abstention states | Backend candidate only; release through `U3.e`; rollback registry entry |
| `U3.a` | `app/api/routes/players.py`, `players_models.py`, `frontend/src/player/`, `config/features/U3a-players.yaml` | `U2.1`, `P3.1`, serialized `G1.x` | `PlayerSurface.migration.test.tsx`; direct artifact fetch, raw token, receiptless metric, or missing state | Player backend/frontend suites + `@U3.a`; canonical DTO exact after volatile-time normalization | Flag new Player read model; rollback flag to legacy surface |
| `U3.b` | Roster/roster-capacity routes and DTOs, `frontend/src/roster/`, `roster-capacity/`, `config/features/U3b-roster.yaml` | `U2.1`, `L3.1`, `D3.a`, `D3.e`, `PERF2.a`, `PERF2.e`, serialized `G1.x` | `RosterSurface.migration.test.tsx`; scenario missing, hidden rank, or transport duplication | Roster suites + `@U3.b`; scenario fixtures exact | Owns release flags for capacity/waiver; rollback to legacy Roster |
| `U3.c` | Trade/trade-market routes and DTOs, `frontend/src/trade/`, `config/features/U3c-trade.yaml` | `U2.1`, `D3.b-d`, `PERF2.b-d`, serialized `G1.x` | `TradeSurface.migration.test.tsx`; lanes blend, verdict/fairness scalar, or decision capture absent | Trade suites + `@U3.c`; scenario/receipt fixtures exact | Owns hold/trade/partner flags; rollback to legacy Trade |
| `U3.d` | League-pulse route/DTO, `frontend/src/league-pulse/`, `config/features/U3d-league.yaml` | `U2.1`, `L2.1`, serialized `G1.x` | `LeagueSurface.migration.test.tsx`; manager claim lacks sample/receipt or freshness borrows | League suites + `@U3.d`; canonical DTO exact | Flag new League read model; rollback to legacy League |
| `U3.e` | Rookie/draft route/DTO, `frontend/src/draft/`, `config/features/U3e-draft.yaml` | `U2.1`, `D3.f`, `PERF2.f`, serialized `G1.x` | `DraftSurface.migration.test.tsx`; abstention missing or directive ordering rendered | Rookie/draft suites + `@U3.e`; fixture exact | Owns draft scenario flag; rollback hides Draft workflow |
| `U3.f` | Trust/model-scoreboard/outcome DTOs, `frontend/src/trust/`, model-scoreboard and realized-outcome UI, `config/features/U3f-trust.yaml` | `U2.1`, `E3.1`, serialized `G1.x` | `TrustSurface.migration.test.tsx`; coverage/claim level/hash omitted or inflated | Trust/outcome suites + `@U3.f`; receipt/hash exact | Owns Trust read-model release; rollback to prior trust surface |
| `U3.g` | System routes/application services, `frontend/src/system-health/`, shell ops link, `config/features/U3g-ops.yaml` | `U2.1`, `C2.1`, serialized `G1.x` | `OpsSurface.migration.test.tsx`; deep diagnostics lead reader UI or blocking status disappears | System-health suites + `@U3.g`; health projection exact | Separate `/ops`; rollback keeps manager status and old diagnostics route |

#### Storage pilot specification (`S1.1`)

The representative analytical source is `app/data/nflverse_usage.db`, opened with SQLite URI `mode=ro`; the feature specimen is `app/data/features_runtime/engine_b_features_runtime.csv`. Before conversion, `S1.1` writes exact SHA-256, byte size, schema DDL, row counts, null masks, and maximum observed timestamps to the immutable run-scoped path `docs/architecture/evidence/storage-pilot/<run_id>/input_manifest.json`.

The pilot converts the existing all-TEXT `ff_opportunity` table into typed Parquet and materializes the feature CSV into a separate feature-vintage partition. Baseline queries are:

1. exact lookup by `row_key`;
2. player/season/week slice;
3. position/season aggregate over declared numeric metrics;
4. latest observed snapshot/capture by stream;
5. as-of feature vector retrieval;
6. full key-count and null-mask reconciliation.

Parity requirements:

- primary keys, identity/status codes, text, timestamps, row counts, and null masks: exact;
- canonicalized numeric values: `rtol=0`, `atol=1e-12`;
- same source manifest and transform version: identical output content hash;
- source database and CSV remain byte-identical before and after the pilot.

Benchmark protocol:

- record `sw_vers`, `uname -a`, Python/DuckDB/SQLite versions, CPU, memory, and free disk;
- use a frozen query fixture and input manifest;
- three warm-up executions per query;
- thirty measured executions per query;
- report p50, p95, maximum, peak RSS, output bytes, and materialization duration;
- store outputs under `docs/architecture/evidence/storage-pilot/<run_id>/`;
- restore into a `mktemp -d` target and prove the restored store independently;
- rollback means deleting only derived Parquet/DuckDB working outputs and leaving all active readers on the pre-pilot source; the run-scoped input manifest, benchmark/parity reports, receipts, restore evidence, review, and decision record are retained permanently.

The decision is recorded in `docs/architecture/adr-001-local-analytical-storage.md`. Wider migration is rejected unless correctness, restore, rollback, and the declared Morning Room/as-of workload improve or remain within the approved budget.

#### User-facing ticket QA (`R0.4`, `U1.1`, `U3.*`)

`D3.*` produces bounded backend scenario candidates and `E3.1` produces a backend trust read model; neither is a user-facing release. The mapped `U3.b`/`U3.c`/`U3.e` and `U3.f` tickets own their integration, feature flag, tagged Playwright journey, visual review, and human release gate.

Every user-facing ticket must tag a real built-app Playwright journey `@<ticket-id>` and write evidence to `runs/<run_id>/<ticket-id>/real-surface/`:

- 1440×1000 and 390×844 first viewport;
- desktop and mobile mid-scroll;
- quiet, changed, stale, partial, unavailable, contract-error, and transport-error states;
- keyboard-only navigation, visible focus, Escape/back behavior, and focus return;
- reduced-motion run;
- horizontal-overflow assertion;
- axe scan with zero serious/critical violations and no unresolved WCAG AA failure;
- sanitized response/DOM proof with no local path, traceback, or secret;
- source SHA, OpenAPI hash, generated-client hash, read-model receipt, and build-manifest agreement;
- two independent visual reviews using the product rubric;
- David's final visual gate for cockpit framing or a new primary workflow.

“Where applicable” is not a waiver. A user-facing ticket without this bundle is not complete.

#### Security and operations ownership

| Boundary | Owning ticket | Binding test |
|---|---|---|
| Localhost-only default bind and launcher (`scripts/run_local_reader.py`); API/docs/static separation in `app/main.py` | `R0.2` | `tests/contract/test_local_reader_security.py` |
| Configured-root confinement and path traversal rejection | `C1.1`, `S1.1` | `tests/contract/test_configured_path_confinement.py` |
| Sanitized errors, tracebacks, paths, and secrets through `app/api/error_handlers.py` | `R0.2`, every `U3.x` | `tests/contract/test_reader_error_sanitization.py` plus surface DOM assertion |
| Scheduler lock, idempotency, crash recovery, failed-dependency stop in `scripts/run_daily_pipeline.py` and `src/dynasty_genius/sources/daily_control.py` | `C3.1` | `tests/contract/test_daily_pipeline_safety.py` |
| New daily plist and exact `ops/launchd/com.davidleess.dynasty-*.plist` shadow/retirement manifest | `C3.1` | `tests/contract/test_scheduler_cutover_manifest.py` |
| `app/config/backup_manifest.json` classification and `scripts/backup_irreplaceable_data.py` restore rehearsal | `O2.1`, then one serialized `O2.x` per persistent store | `tests/contract/test_backup_classification_and_restore.py` |
| Safe artifact loading; no request-time pickle | `M5.1` | `tests/contract/test_model_serving_spec_hash.py` |
| Bounded scenario counts/values/runtime and cancellation | each `D3.*` | `tests/contract/decision/test_<scenario>_bounds.py` |
| Atomic publication and last-good rollback | `R0.1`, `F2.1`, `P3.1`, `E3.1` | each publisher's atomicity contract |

A human gate is mandatory before scheduler cutover, persistent-store reader cutover, model promotion, schema/API-breaking cutover, or release of a new primary workflow.

## 15. Parallel product lane

The following can proceed alongside deeper foundation work because they consume fixtures or already-materialized contracts rather than inventing substrate. Ownership remains exclusive under §14.13:

- Morning Room candidate, performance proof, and golden release — `R0.3`, `PERF1.1`, `R0.4`, then `U1.1`;
- canonical row and receipt-bearing metric primitives — `U2.1`;
- shared frontend resource boundary — `R0.3`;
- product navigation consolidation — `U1.1`;
- frontend build/release manifest — `R0.4`;
- revalidation and surfacing of existing roster/trade/what-changed capabilities — one `U3.x` ticket per surface;
- materialized-read and real-product performance benchmark — `S1.1`, `PERF1.1`, and one `PERF2.x` per released scenario.

They must not bypass unavailable states, fabricate receipts, or declare existing code ship-ready without current semantic and real-surface verification. If a parallel ticket discovers that it must modify another ticket's exclusive path, it stops and adds an interface request to that owner's handoff; it does not edit the path concurrently.

## 16. Verification ladder

Every increment follows:

```text
contract RED
  → smallest domain implementation
  → focused unit/integration GREEN
  → shadow or replay reconciliation
  → full affected-layer suite
  → cross-layer contract verification
  → real-surface QA for every user-facing ticket; explicit `not_applicable` evidence for non-user-facing work
  → independent review
  → human gate
```

Representative final commands, after the named tests exist:

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q
.venv/bin/ruff check src app
npm --prefix frontend run openapi-gen
git diff --exit-code -- frontend/openapi.json frontend/src/lib/api
npm --prefix frontend run gate
npm --prefix frontend run visual:smoke
.venv/bin/python3.14 scripts/verify_data_foundation.py
.venv/bin/python3.14 scripts/verify_model_provenance.py
.venv/bin/python3.14 scripts/verify_product_read_models.py
```

Expected final system evidence:

- declared/captured/curated stream census;
- deterministic raw and feature replay;
- backup and restore evidence by class;
- canonical identity coverage and explicit unresolved census;
- point-in-time query proof;
- model recipe/artifact/card/serving hash equality;
- PVO availability-state coverage;
- common-cohort and market-leakage proofs;
- DOO receipt completeness and no-hidden-rank proof;
- read-model performance budgets on the reference Mac;
- OpenAPI/source/frontend build-hash agreement;
- desktop/mobile/keyboard/accessibility evidence;
- outcome and decision-ledger completeness.

Do not report a global green state if the local Python environment cannot load the declared test dependencies. Environment failure is a named blocker, not evidence that tests passed.

## 17. Performance, safety, and operations

### Performance budgets

`PERF1.1` and `PERF2.x` enforce—not merely describe—the following starting budgets on the reference Mac:

- warmed primary GET p95: ≤250 ms;
- cold Morning Room API response: ≤1 second;
- first meaningful Morning Room render: ≤1.5 seconds on local desktop;
- bounded scenario evaluation: ≤500 ms for declared fixture sizes;
- health summary: ≤250 ms without full-store scans.

The benchmark manifest records source/build/OpenAPI/read-model/fixture hashes, machine model, CPU, memory, OS, Python/Node/browser versions, thermal/power state, warm-up count, sample count, and raw durations. Core product evidence is immutable under `runs/<run_id>/PERF1.1/`; each scenario uses `runs/<run_id>/PERF2.<scenario>/`. The binding commands are:

```bash
.venv/bin/python3.14 scripts/benchmark_product_read_models.py \
  --fixture tests/fixtures/performance/morning_room_v1.json \
  --warmups 3 --runs 30 --output runs/<run_id>/PERF1.1/benchmark.json
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q \
  tests/performance/test_product_budgets.py
npm --prefix frontend exec playwright test e2e/performance.spec.ts
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q \
  tests/performance/scenarios/test_<scenario>_budget.py
```

`PERF1.1` cannot GREEN without warmed primary GET, cold Morning Room, first meaningful render, and health-summary samples. Each scenario mapped to a released `U3.x` cannot GREEN without its `PERF2.x` maximum-size fixture, cancellation proof, and ≤500 ms result. Budgets may change only through an evidence-backed ADR with old/new raw samples; they are never silently relaxed.

### Safety and security

- Bind the reader application to localhost by default.
- Keep all league actions human-executed unless separately authorized.
- Treat manual/imported payloads as untrusted.
- Confine all configured paths to declared roots.
- Never expose local paths, tracebacks, or provider secrets in reader responses.
- Prefer safe, versioned model artifacts; eliminate request-time unpickling from the target serving path.
- Maintain content hashes and restore drills for irreplaceable stores.
- Preserve API/docs/static fallback separation.

## 18. Human gates

Routine tickets require focused evidence and independent review, but not a product-owner decision. Human approval is mandatory only at the material gates below or when a ticket expands scope into one of them.

| Gate | Approver | Required evidence and hashes | Accept criterion | Reject/rollback authority | Downstream work blocked | Decision record |
|---|---|---|---|---|---|---|
| Core architecture/ADRs | David | Source hashes, master SHA, ADR alternatives, contract diagrams, unresolved-decision audit | No unresolved choice changes canonical schemas or sequence | David; no runtime change exists | `K1.1` onward where affected | `docs/architecture/adr-000-master-ratification.md` |
| Storage pilot and persistent-reader cutover | David | `S1.1` input/output hashes, parity, benchmark, immutable input manifest, `O2.1` backup classification/restore, rollback rehearsal, independent review | Exact structural parity, numeric tolerance met, restore and rollback pass, approved performance result | David or storage ticket owner executes recorded reader rollback | `F1.1` wider storage use and each persistent-reader switch | `docs/architecture/adr-001-local-analytical-storage.md` |
| Canonical identity cutover | David | Dual-key coverage by `universe_snapshot_id`, collision/unresolved census, historical replay, consumer shadow results | Every denominator row resolves or has explicit unresolved reason; zero hidden collision; rollback proven | David or identity ticket owner restores legacy reader flag | `I4.x`, then model/PVO/league cutovers | `docs/architecture/adr-002-canonical-player-identity.md` |
| Scheduler cutover | David | Seven shadow cycles, lock/idempotency/crash evidence, dependency parity, legacy schedule manifest, backup proof | No duplicate/missed publish; failed dependency stops consumer; exact rollback tested | David or pipeline owner re-enables recorded legacy schedule | Retirement of any legacy plist | `docs/architecture/decisions/scheduler-cutover-<date>.md` |
| Measurement semantics or target/horizon change | David | Definition diff, all-games/zero-snap decision, affected rows, label-window audit, planned model-generation ID | Semantics are singular, versioned, testable, and accepted for the named generation | David rejects; prior definition remains active | `M1.1` for affected model generation | `docs/architecture/adr-004-measurement-semantics.md` |
| Schema/API-breaking cutover | David | OpenAPI diff, compatibility plan, generated-client/Zod hashes, consumer inventory, rollback flag, real-surface evidence | All consumers migrated or compatibility period named; old and new contracts independently valid | David or API owner restores prior route/schema version | Removal of compatibility route/type | `docs/architecture/decisions/api-cutover-<version>.md` |
| Model promotion | David | Final artifact, `TrainingSpec`, dataset, feature, sealed-set and evaluation hashes; post-fit verification; independent review | Immutable `PromotionReceipt` under `runs/model-registry/receipts/` names exact final served hash; mutable `config/active_model.json` points to that receipt/artifact; all gates pass or exceptions are explicitly accepted | David promotes prior artifact through a new immutable receipt, then switches the pointer | `M5.1`, `P2.1` use of new generation | immutable receipt plus `docs/architecture/decisions/model-promotion-<id>.md`; `app/config/model_registry.json` remains a compatibility pointer only until `X1.model-registry-pointer` |
| Outcome-finality authority | David | Proposed provider/attestor, finality schema, hash/signature method, correction policy, sample attestations | One named authority and immutable evidence can settle/correct a week without rewriting history | David; scorer remains unsettled | `E1.1`, `E2.1` settlement | `docs/architecture/decisions/outcome-finality-authority.md` |
| `decision_supported` criteria | David | Claim-composition tests, power/replication thresholds, examples at every claim level, independent science review | Criteria are explicit, fail-closed, and tied to immutable evidence | David; highest available claim remains below decision-supported | Any product projection at that claim level | `docs/architecture/decisions/decision-supported-v1.md` |
| New paid/manual/licensed source | David | License/terms, cost, acquisition method, cadence, retention, backup, allowed/prohibited roles | Authorized use is explicit and catalog contract is complete | David; adapter remains disabled and data excluded | Source adapter activation | `docs/architecture/decisions/source-<name>.md` |
| Default roster horizon/risk inputs | David | Scenario definitions, sensitivity examples, default-vs-user override behavior | Defaults reflect David's intent and remain visible/editable inputs, not hidden weights | David; no default is applied | DOO surfaces depending on defaults | `docs/architecture/decisions/roster-objective-v1.md` |
| First production DOO workflow / automated external action | David | `D3.*` backend proof, `PERF2.x`, mapped `U3.x` integration/flag, decision-ledger proof, no-hidden-rank review, real-surface bundle; separate authorization for any write action | Scenario is descriptive, reversible in-product, receipt-complete; external action scope explicitly authorized | David disables the mapped `U3.x` scenario/action flag; no history deletion | Each mapped `U3.b`/`U3.c`/`U3.e` release or external connector write | `docs/architecture/decisions/doo-<scenario>-release.md` |
| Databricks retirement or recommitment | David | Deployment/billing verification, dependency inventory, local pilot outcome, portability/backup comparison | One platform is named for each responsibility; stale configs cannot imply a false substrate | David; leave quarantined configs unchanged until decision | Deletion or activation of Databricks assets | `docs/architecture/decisions/databricks-disposition.md` |
| Cockpit framing / new primary workflow / final release | David | Tagged real-surface bundle, two independent reviews, accessibility, performance, source/OpenAPI/build/read-model hashes | Product answers the five-second question, has no blocking usability/a11y defect, and exact build provenance agrees | David or UI owner disables feature/surface flag | `U1.1`, each primary `U3.x`, release | `docs/design-audits/<date>/<ticket-id>/david-gate.md` |

## 19. Deliberate non-goals

- No microservices, message queue, streaming platform, or container fleet.
- No broad rewrite.
- No cloud warehouse on the critical path without an evidenced need.
- No multi-tenancy or auth expansion for the current local personal product.
- No single omnibus dynasty, roster, manager, trade-fairness, or action score.
- No market fields in intrinsic player models.
- No fuzzy identity auto-promotion.
- No opaque manager psychology.
- No automatic buy/sell/hold verdict layer.
- No deep model family before point-in-time truth, train/serve equivalence, and outcome accountability work.
- No natural-language assistant issuing recommendations before the evidence and DOO contracts are mature.
- No additional primary UI surface until the Morning Room journey works end to end.

## 20. Three-source merge register

### Source A — `DYNASTY_GENIUS_NORTH_STAR_ARCHITECTURE_AND_BUILD_PLAN.md`

Preserved:

- immutable snapshot vault;
- analytical/runtime serving separation;
- common-cohort divergence;
- band crossing and direction reversal;
- canonical row and two-lane visual grammar;
- roster-level Daily Open;
- historical transaction foundation for manager context;
- visual/accessibility release evidence.

Refined or rejected:

- semantic name-derived IDs → opaque ID plus aliases;
- fuzzy auto-resolution → review staging only;
- 100% scored coverage → 100% honest state coverage;
- Databricks assumption → proof-gated local-first target;
- REG-only PPG → current all-games definition plus explicit zero-snap decision;
- fixed xVAR/blend/trade constants → versioned candidate policies requiring calibration;
- algorithmic trade/cut verdicts → David-initiated evidence scenarios;
- unsupported automatic market acquisition → licensed/authorized sources only;
- watched-directory auto-ingest → inventory, validation, and human manifest acceptance;
- universal 26-hour staleness → stream-specific cadence and dormancy windows.

### Source B — `2026-08-19-dynasty-genius-target-architecture-and-build-plan-session-1.md`

Preserved:

- PVO/DOO distinction;
- point-in-time data plane;
- Model Trust Plane and human promotion boundary;
- explicit PVO availability states;
- League Context Graph;
- Evidence Registry claim ladder;
- Morning Room and five-workflow navigation;
- evolutionary dual-write/shadow migration;
- compounding outcome loop.

Refined:

- PVO remains intrinsic rather than carrying market/league overlays;
- final refit occurs before the promotion receipt and pointer change;
- “best actions” becomes “opportunities to review”;
- storage recommendation receives a representative proof gate;
- oversized increments split into executable contracts;
- advanced DOO fields become availability-gated.

### Source C — `dynasty-genius-architecture-2026-08-19.md`

Preserved:

- “the unbroken chain from a raw byte to a number on David's screen”;
- propagation, not invention;
- strict dependency direction and module-placement rule;
- hashed `TrainingSpec` across train/evaluate/refit/serve;
- append-only dated feature vintages;
- precomputed read models;
- dependency-aware daily DAG;
- structural receipt/measurement/caveat/right-edge honesty;
- belief archive and two accountability clocks;
- protect-known-good-patterns discipline;
- proportional non-goals.

Refined:

- global ULID re-key → opaque identity through dual-key migration without rewriting raw history;
- universal JSON artifact law → stable artifact interface, JSON first for Ridge after equivalence;
- blanket SQLite replacement → store-by-store proof-gated migration;
- hidden operations → separate deep operations with visible manager-facing blocking status;
- time-sensitive operational claims → excluded from timeless architecture unless reverified;
- broad no-ranking rule → no hidden cross-action rank, while factual and user-selected ordering remains allowed.

## 21. Final architecture thesis

> **Build an immutable point-in-time truth plane; produce market-independent, probabilistic Player Value Objects from one hashed and promoted model recipe; combine them with separately versioned market observations and a League Context Graph; express user-relevant scenarios as receipt-complete Decision Opportunity Objects; and deliver those scenarios through a five-workflow cockpit led by Morning Room. Make every visible number traceable, every unavailable state explicit, every historical belief replayable, and every promotion human-gated.**

That architecture builds the best Dynasty Genius because it compounds three advantages simultaneously:

1. **better truth** through replayable point-in-time evidence;
2. **better judgment** through league-specific, uncertainty-aware scenario comparison;
3. **better trust** through an immutable belief archive that can prove what the system knew, believed, and learned.
