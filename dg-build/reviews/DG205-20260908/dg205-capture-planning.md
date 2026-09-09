# Capture and baseline planning — connecting the snapshot archive to a future evaluation

Claude54331 (actual Claude session `fa00374f-ec34-45ea-9ec0-926acc034407`, this terminal), writing as
**prospective owner of the capture/baseline ticket**. Stamped 2026-09-08T23:35Z (`date -u`).
Worktree read: `/Users/davidleess/dg-wt/DG-204`, branch `ticket/DG-204`, HEAD `4ad796c2`.

**Planning only. I changed nothing.** No product edit, no new worktree, no install, no git
publication, no hosted or data write, no test producing shared output, no outcome-performance query,
no subagent, no frontend-studio. DG-204's uncommitted hosting and CI work is untouched — I listed it
to confirm it is preserved and read nothing into it.

Authorization checked in David's own record: rollout line **9689, 2026-09-08T23:28:19Z** — *"ok write
the plan the tickets and the roles for each parallel worker… you can use the agy (gemini) parallel
terminal session as a product brainstormer as well"*, following line **9640** — *"ok whats the next
thing to work on from the recommendations my independent reviewer gave"*. That reviewer's headline was
that the next milestone is **demonstrating better decisions, not more models or screens**, which is
what makes this a capture ticket rather than a modelling one.

**Naming note:** root's message asked for `/private/tmp/dg205-capture-planning.md` while calling me the
prospective **DG206** owner. I have written the path root specified. Root owns the final numbering.

## The headline: this is small, because almost all of it already exists

The temptation here is to build an evaluation system. **We already have one.** What is missing is one
capture step and one contract. Naming what exists is most of this plan's value.

| Capability | Where it already lives | State |
|---|---|---|
| Immutable snapshot archive with receipts | `src/dynasty_genius/capture/workspace_snapshot_store.py` (`save_snapshot`, `list_snapshots`, `read_snapshot`, `SCHEMA_VERSION = "workspace_snapshot.v1"`) | **Built.** Refuses a symlinked root, refuses ranks and comparison that disagree on `report_run`, `report_sha256` or `ownership_as_of` |
| The archive's HTTP surface | `app/api/routes/workspace_snapshots.py`, root from `DG_WORKSPACE_ARCHIVE_ROOT` | **Built** |
| What a term measures, as a closed type | `src/dynasty_genius/ranking/contract.py` → `TargetSpec` with `mismatches()` over scope, scoring, window, exposure, event, clock, quantity, `labels_through` | **Built** |
| The accepted target the forecasts are defined on | `ranking/roster_comparison.py` → `ACCEPTED_TARGET` (REG · PPR_nflverse_default · championship_week17 · season_points · per_season) | **Built and enforced** |
| The realized league-season outcome artifact | `ranking/outcome_artifact.py` → `SCORING_PRESET = "nflverse_default_ppr_championship_window_v1"`, hashes CSV and manifest, checks schema, requires the exactness claim to be False, reads `coverage_status`, and treats seasons outside `admitted_seasons` as **UNKNOWN, never zero** | **Built** |
| Producer-binding agreement checks | `ranking/outcome_artifact.py` → `producer_binding_matches`, `bindings_disagree` | **Built** |
| Realized-outcome scoring with honesty guards | `outcome_loop/realized_outcome_scorer.py` — within-position rank accuracy, power floor ≥10, survivorship-complete, settled vs partial, `decision_supported=False`, **market never enters** | **Built** |
| Declared-cohort membership lookup | `outcome_loop/frozen_prediction_membership.py` | **Built** |
| The separate model-versus-market question | `outcome_loop/model_vs_market_scorer.py` | **Built, and a DIFFERENT frozen experiment** (2026-08-05). Do not join the new baselines to it |
| Snapshot export with fail-closed provenance | `src/dynasty_genius/adapters/lovable_bundle.py` + `tests/test_lovable_bundle.py` | **Built (mine, landed).** Reuse its refusal pattern rather than a new one |

**The gap is exactly three things:** a frozen production baseline captured beside each forecast, a
contract that proves the baseline and the forecast measure the same thing, and an append-only place to
put evaluation inputs that references a snapshot id.

## The baseline-source contract

A baseline is admissible only if all three hold. Each maps to an existing comparator where one exists.

**1. Same scoring and same week window.** Compare the baseline's `TargetSpec` to the forecast's with
the existing `TargetSpec.mismatches()`, and require the outcome artifact's `scoring_preset` to equal
`SCORING_PRESET`. A mismatch is refused and **names the fields**, because a baseline on another target
is a different quantity wearing the same column name.

**2. Complete source.** The artifact's manifest and CSV hashes must match what is read, the exactness
claim must be False (we never claim David's exact league scoring), `coverage_status` is carried
verbatim as a research qualification, and any season outside `admitted_seasons` is **UNKNOWN, never
zero**. A partial source is a refusal, not a smaller number.

**3. Point-in-time knowledge.** Every baseline row records `known_at`, the source's own revision
identity, and a `provenance_class` of exactly `prospective` (captured at or before the cutoff from the
source as it then stood) or `reconstructed` (built later from a revised source). **Reconstructed rows
must be labelled at birth and must never be silently mixed into a prospective population.**

### The one place the existing types do not reach

`TargetSpec.labels_through` is **a season, not a day** — its own comment says so, and for pre-season
forecasts that is correct. **It cannot express an in-season cutoff.** A baseline frozen at week 3 and
one frozen at week 10 of the same season carry the same `labels_through` and very different knowledge.
Since this scope is about cutoff-valid baselines, the capture must add a **cutoff identity of its own**
— the week window observed and the source revision — rather than leaning on `labels_through`. I would
add it in the new baseline record, **not** by widening `TargetSpec`, so nothing already accepted
changes meaning.

## Smallest runnable delivery

One new module, one CLI, one storage layout, and tests. No route change, no model change, no grading.

- **`src/dynasty_genius/capture/production_baseline.py`** — pure functions: build a baseline record
  from an outcome artifact plus a cutoff, verify the contract above, and refuse with a named reason.
- **CLI** `python -m src.dynasty_genius.capture.production_baseline` with
  `--snapshot-id`, `--archive-root`, `--outcome-manifest`, `--cutoff`, `--out`, and an explicit
  `--reconstructed` that is **required** whenever the source revision post-dates the cutoff.
  No default archive root: an unset root is a refusal, not a guess.
- **Storage.** Run-scoped output under `runs/<UTC>/dg_production_baseline/` per the standing rule, and
  an append-only evaluation store under a **new** root (`DG_EVALUATION_ROOT`), one immutable directory
  per `baseline_id`, each carrying `snapshot_id` plus the artifact hashes. **Legacy saved artifacts are
  never touched, and the workspace archive is never written to by this path.** Re-writing an existing
  `baseline_id` is refused, the way the bundle generator refuses an occupied path.

### Source to adapter, in steps

1. Read the snapshot by id from the archive; carry `report_run`, `report_sha256`, `ownership_as_of`.
2. Load the outcome artifact; verify manifest and CSV hashes, schema, exactness-False, columns.
3. Build the baseline's `TargetSpec`; compare with the forecast's via `mismatches()`.
4. Resolve the cutoff: derive `known_at`, the observed week window, and the source revision; classify
   `prospective` or `reconstructed`.
5. Emit rows for admitted seasons only; everything else is UNKNOWN with a stated reason.
6. Write run-scoped output, then append one immutable baseline directory referencing `snapshot_id`.
7. **Stop.** No grading, no decision log, no model change — those are later tickets.

### Failure modes, all fail closed

Target mismatch · artifact hash mismatch · exactness claim True · season outside `admitted_seasons` ·
snapshot id absent from the archive · archive root unset or symlinked · source revision after the
cutoff without `--reconstructed` · an existing `baseline_id`. Each refuses with the field named. **No
warning field inside the output** — a warning in a data file is invisible to the consumer that matters.

### Tests, written first

A fixture from a real snapshot and a real outcome manifest; a refused target mismatch naming its
fields; UNKNOWN-not-zero outside admitted seasons; prospective versus reconstructed labelling, and
that the two never merge; append-only refusal on a repeated id; snapshot-reference integrity; and a
test that the legacy archive is untouched by a baseline write. **Each guard mutated once and watched
failing**, because a guard nobody has watched fire is not a guard.

## Conflicts and things root should decide

1. **`labels_through` cannot carry an in-season cutoff** (above). My proposal keeps the new marker in
   the baseline record; widening the accepted type instead would change what already-accepted numbers
   mean.
2. **The 2026-08-05 DG-018 frozen set is a different experiment.** Its populations, horizons and
   denominators are its own. New baselines must not be appended to it or compared against it, or the
   paired-difference card stops meaning what it says.
3. **Production evaluation and market movement stay two streams.** The realized-outcome scorer states
   that market data never enters, and that is correct for what it measures. The FantasyCalc-movement
   question is the other module's. Two results, never one blended card.
4. **No schedule may be assumed.** The capture must run on demand from checked-in and frozen artifacts;
   it must not require the 09:00 chain, and it must refuse rather than wait if a source is absent.
5. **Declare the population and horizons before looking.** Fixing them after seeing outcomes is
   retrospective selection, and this project has paid for that before.
6. **Nothing here grades anything yet**, and no surface should imply it does. This product has never
   graded a prediction; the first time it does, that must be stated plainly rather than implied.

## Limits

I read `AGENTS.md`, `PRODUCT.md` and the source paths named above in DG-204 at `4ad796c2`. I ran no
producer, queried no outcome performance, and executed none of this code. Ticket numbering, worker
roles and the final written plan are root's. If a source I named has moved since `4ad796c2`, the path
is the claim to re-check, not the design.
