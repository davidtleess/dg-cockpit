# Dynasty Genius Target Architecture and Product Build Plan

**Session:** Architecture review 1 of 3  
**Date:** 2026-08-19  
**Status:** READY_FOR_GATE

Three independent review lanes examined Layers 1–2, Layers 3–5, and Layer 6. This recommendation is intentionally forward-looking: build Dynasty Genius as a league-specific decision-intelligence system, not a collection of models, reports, and backend capabilities.

No product files, models, producers, or data were changed during the review.

## Executive recommendation

Replace the current artifact mesh with one governed decision-intelligence spine:

```text
External sources
      ↓
Immutable point-in-time captures
      ↓
Canonical identity + typed historical facts
      ↓
Player forecasts and uncertainty
      ↓
League state + manager behavior
      ↓
Decision simulation and evidence
      ↓
Morning Room / Roster / Trade / League / Draft
```

Market information remains a parallel overlay:

```text
Market captures ──→ price, liquidity, divergence, evaluation
                         never Engine A/B training
```

The most important domain distinction should be:

- **Player Value Object:** What does Dynasty Genius believe about this player?
- **Decision Opportunity Object:** Given this league, roster, market, time horizon, and available action, what could David do—and what are the likely outcomes?

A player can have high intrinsic value but be a poor acquisition at the current price. Conversely, a moderately valued player can be an excellent roster-specific opportunity. Those should never collapse into one score.

## Recommended technology shape

Keep the system local-first and monolithic. Dynasty Genius does not need microservices, Kafka, or a cloud warehouse.

- Immutable JSON/Parquet for source captures.
- DuckDB over partitioned Parquet for typed, point-in-time analytical data.
- SQLite for small transactional concerns: job state, locks, identity review, schedules, and artifact catalogs.
- Python domain and application services.
- FastAPI as a thin transport adapter.
- React/Vite as the decision cockpit.
- One generated, schema-validating frontend resource layer.
- Repository-owned job orchestration; launchd merely triggers it.

Use dual-write and shadow comparison to migrate existing CSV and JSON consumers. Do not perform a big-bang rewrite.

## Layer-by-layer target

| Layer | Target architecture | Product outcome |
|---|---|---|
| **1. Acquisition** | One source/stream catalog; immutable captures; terminal run receipts; hashes, schema versions, retention, and backup classification | Every fact can be replayed, and failed acquisition can never appear healthy |
| **2. Curated truth** | Canonical identity graph, bitemporal typed facts, point-in-time feature store | “What did we know about this player on this date?” becomes an exact query |
| **3. Models and PVO** | Immutable candidate models, chronological evaluation, human promotion, predictive distributions, explicit availability states | Trustworthy player forecasts with uncertainty and exact provenance |
| **4. League context** | Versioned league graph containing rules, rosters, picks, capacity, transactions, and sample-aware manager behavior | The same player receives different strategic context in different leagues and rosters |
| **5. Decision intelligence** | Scenario engine, Decision Opportunity Objects, experiment/edge registry, and outcome loop | Ranked options with upside, downside, timing, feasibility, and counterarguments—not opaque verdicts |
| **6. Product experience** | One daily workspace organized around real manager workflows | David sees what changed, why it matters, and what he can do next |

## Core architecture components

### 1. The point-in-time data plane

Create one machine-readable stream catalog defining:

- source and stream identity;
- acquisition owner and cadence;
- schema and parser version;
- success and failure states;
- retention and backup class;
- downstream consumer eligibility.

Every capture receives:

```text
source_snapshot_id
source_record_id
effective_at
available_at
observed_at
ingested_at
schema_version
content_hash
run_id
```

The current foundation contains good raw-capture patterns, but runtime features still resolve primarily to a latest artifact rather than historical knowledge. See `src/dynasty_genius/features/feature_source.py`.

### 2. Canonical identity

Build one identity store covering NFL, college, Sleeper, GSIS, PFR, PlayerProfiler, and market identifiers.

Mappings require validity intervals, evidence, source snapshot, and resolution status. Fuzzy matching may create review candidates but must never silently create production identity.

Unresolved identity becomes an explicit product state with measurable coverage—not a failed join that disappears.

### 3. The Model Trust Plane

Engine A and Engine B should share these immutable contracts:

- `DatasetManifest`
- `CandidateArtifact`
- `EvaluationReport`
- `PromotionReceipt`
- `ActiveModelPointer`
- `ScoringEnvelope`

Training creates candidates only. A separate human-approved promotion operation changes the active pointer.

Evaluation should use:

- rolling-origin chronological folds;
- player-grouped tuning;
- label windows that close before the test boundary;
- naïve and market comparators;
- calibration and predictive intervals;
- subgroup and out-of-distribution analysis;
- a sealed recent-period test per model generation.

After promotion, the production model may be refitted on all label-complete data using frozen features and hyperparameters. Its deployed fit history must remain distinct from its evaluation history.

### 4. A truthful PVO state machine

Split PVO construction into:

```text
predict
  → normalize
  → determine availability
  → attach uncertainty
  → attach league context
  → attach market overlay
  → generate explanations
```

Do not let engine routing, score availability, validation grade, and decision support share one ambiguous status.

Recommended availability states:

- `available`
- `withheld`
- `not_eligible`
- `insufficient_history`
- `identity_unresolved`
- `capture_incomplete`
- `artifact_unavailable`

A score-bearing state must require a score. The current assembler demonstrates why this contract matters: a no-result branch can still label the value as an Engine A prior in `src/dynasty_genius/pvo_assembler.py`.

### 5. The League Context Graph

Represent league context as independently versioned lanes:

- scoring, lineup, and roster rules;
- current rosters, taxi/IR, and picks;
- replacement levels and positional capacity;
- completed transaction facts;
- manager behavior summaries;
- current roster posture and time horizon.

The existing transaction chain is a strong foundation worth preserving; it already handles historical leagues and stable manager identity in `src/dynasty_genius/league_transactions.py`.

Manager profiles should report evidence such as transaction frequency, recency, asset flows, and counterparties. They should not infer psychology, rejected offers, or willingness to trade from completed transactions alone.

### 6. Decision Opportunity Objects

A Decision Opportunity Object should include:

```text
action type and assets
league and as-of time
intrinsic value delta distribution
roster/championship utility
market cost and liquidity
manager/partner evidence
time sensitivity
downside and regret range
confidence and availability state
counterarguments
complete provenance
```

This becomes the unit powering trade packages, waiver bids, cuts, holds, draft choices, and roster construction.

Layer 5 should also maintain an Evidence Registry that distinguishes:

- `descriptive`
- `diagnostic`
- `replication_candidate`
- `decision_supported`

That prevents an interesting cohort result from quietly becoming a product recommendation.

## Product information architecture

Primary navigation should be reduced to five workflows:

1. **Morning Room** — what changed, why it matters, and available actions.
2. **Roster** — roster construction, capacity, player inspection, and horizon scenarios.
3. **Trade** — package construction, partner fit, market realism, and counterarguments.
4. **League** — rosters, transactions, manager behavior, and positional scarcity.
5. **Draft** — rookie intelligence and pick strategy once evidence is ready.

Trust, model accuracy, provenance, and system health should appear contextually and in a secondary **Trust & Methods** area.

Remove parked products and Project Tracker from the primary product navigation. The current shell exposes seven active, three parked, and one developer surface in `frontend/src/shell/AppShell.tsx`, which makes the application read like a capability inventory.

The Morning Room’s first viewport should answer in five seconds:

```text
Your roster overnight
Model: changed / unchanged / unavailable
Market: changed / unchanged / unavailable
League: meaningful roster or transaction events
Best available actions: 0–3
```

## Build plan

### Increment 0 — architecture contracts

Build the source catalog, snapshot manifest, identity contract, PVO state machine, and Decision Opportunity schema as tests and typed interfaces.

**Exit gate:** Every existing stream and product state maps unambiguously to the new contracts.

### Increment 1 — point-in-time foundation

Implement immutable captures, canonical identity, and the DuckDB/Parquet point-in-time feature store. Dual-write the existing runtime CSV.

**Exit gates:**

- historical `as_of` queries cannot see future observations;
- captures replay deterministically;
- unresolved identity has a complete census;
- every artifact has lineage and backup classification;
- existing and new feature outputs reconcile within declared tolerances.

### Increment 2 — model trust plane

Separate training, evaluation, and promotion. Introduce immutable model artifacts and exact provenance between model card, PVO, and served model.

**Exit gates:**

- training cannot mutate the active model;
- served hash equals the promotion receipt;
- chronological evaluation and naïve baselines pass;
- predictive intervals and calibration are present;
- model and market remain structurally separated.

### Increment 3 — PVO materialization

Produce one immutable, daily universe PVO snapshot through the new state machine. Introduce a central Artifact Gateway/read-model service.

FastAPI routes should stop independently interpreting files. The current dependency cycle between `src/dynasty_genius/pvo_assembler.py` and `app/services/roster_auditor.py` should disappear as domain and application services move below the API layer.

**Exit gate:** Every player is either modeled or carries one truthful, actionable unavailability reason.

### Increment 4 — league and decision intelligence

Materialize the League Context Graph, manager behavior facts, and Decision Opportunity Objects. Start with:

- trade-partner exploration;
- roster-capacity scenarios;
- waiver/cut alternatives;
- hold-versus-trade scenarios.

**Exit gate:** Deterministic fixtures produce explainable decisions whose player, market, league, and manager lanes remain independently inspectable.

### Increment 5 — Morning Room vertical slice

Build one complete production journey:

```text
Morning Room
  → opportunity
  → player evidence
  → scenario comparison
  → Trade/Roster workspace
```

Then consolidate the existing Roster, Trade, and League capabilities behind it.

**Exit gates:**

- clear first viewport at desktop and mobile;
- quiet, stale, unavailable, and changed states;
- keyboard navigation and zero axe violations;
- generated API contracts and request deduplication;
- no developer language, paths, or raw engine tokens in the UI.

### Increment 6 — Draft and research intelligence

Build the Draft workflow, Cohort Atlas, and Validated Edge Registry. Add news and unstructured sources only through the established capture and evidence contracts.

### Increment 7 — compounding outcome loop

Capture every frozen forecast and meaningful user decision, then grade outcomes forward.

Use this to improve:

- calibration;
- cohort reliability;
- market-versus-model evidence;
- decision timing;
- manager-behavior estimates;
- product prioritization.

Only after this loop is operating should sequence models, policy learning, or an evidence-grounded research assistant become priorities.

## Test-first implementation gates

Every increment begins with contract tests for its boundaries, then unit and integration tests, shadow reconciliation, and finally real-surface verification.

Representative repository gates:

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python3.14 -m pytest -q
.venv/bin/ruff check src app
npm --prefix frontend run gate
npm --prefix frontend run visual:smoke
```

Frontend ship evidence should include:

- 1440px and 390px first viewport;
- desktop and mobile mid-scroll;
- keyboard-only navigation and visible focus;
- reduced-motion behavior;
- zero axe violations;
- no horizontal overflow;
- sanitized API errors;
- source SHA and OpenAPI hash embedded in a frontend build manifest.

## Recommended gates and open decisions

Human approval is needed for:

- adopting DuckDB/Parquet;
- model evaluation-then-refit policy;
- acquiring historical market data versus forward accrual;
- default contention horizon and risk posture;
- paid/manual source cadence;
- any eventual automated external action.

Recommendations:

- Approve DuckDB/Parquet.
- Use rolling evaluation followed by controlled refit.
- Protect transaction history as irreplaceable.
- Keep all external league actions human-executed.
- Defer natural-language recommendations until Decision Opportunity evidence is mature.

## What not to build

- No distributed platform or microservices.
- No broad rewrite.
- No single omnibus dynasty score.
- No market data inside player forecasting.
- No opaque manager ranking.
- No LLM-generated verdict layer before the evidence spine exists.
- No additional primary UI surfaces until the Morning Room journey works end to end.
- No advanced model family before the point-in-time and evaluation systems are trustworthy.

## Merger summary

The strongest proposal for the master architecture is:

> Build an immutable point-in-time truth plane, generate probabilistic Player Value Objects from it, combine those with a separate League Context Graph, and make Decision Opportunity Objects—not scores—the core product output. Deliver those opportunities through a five-workflow decision cockpit led by the Morning Room, while preserving exact evidence, uncertainty, and human promotion at every boundary.
