# DG-205 — scientific evaluation planning (prospective DG-207 owner + independent plan reviewer)

Session `376f54b0-2909-46df-837c-ace5852eb144`, PPID 54281. Old worktree `/Users/davidleess/dg-wt/DG-202`
(`ticket/DG-202`, idle, blocked only on Lovable credits). **Planning only — no product edit, worktree,
install, publication, hosted write, data write, shared-output test, outcome query or frontend-studio
access.** DG-204's uncommitted hosting/CI work is untouched.

## ⛔ Read this before anything else is scheduled: there is no archive

`app/api/routes/workspace_snapshots.py:55` resolves the archive from the environment variable
**`DG_WORKSPACE_ARCHIVE_ROOT`**. It is unset, and a filesystem search finds **zero** workspace snapshot
archives and zero workspace `snapshot.json` files anywhere on this machine.

**The DG-189 store is merged and working, and nothing has ever been saved through it.** So "connect the
existing snapshot archive to Lovable" starts from an empty archive. Every plan below has to be written for a
**first freeze that has not happened yet**, not for an existing corpus.

This also makes root's post-freeze concern concrete rather than hypothetical, which is the next section.

## 1. Production scope, resolved under the existing declaration — unchanged

`app/config/workspace_evaluation_plan.json`, plan `workspace-production-2026-v1`, status
`declared_not_graded`. **I propose no amendment.** It already answers the scope question, and its
`revision_rule` makes amending-after-looking the thing not to do.

Two of its clauses decide the matter between them:

- `forecast_origin`: *"The first actual saved_at is the freeze cutoff; do not backdate it to a nominal
  forecast date."*
- `primary_production.window`: *"NFL regular-season weeks 1 through 17 inclusive."*

**The conflict, stated plainly.** It is 2026-09-08 23:31Z. Kickoff is 2026-09-10. The archive is empty, so
the earliest possible freeze is now, and realistically lands at or after week 1. **Any week already under
way at the freeze is not a forecast for that week.** Grading the declared weeks 1–17 window against a freeze
that post-dates kickoff would silently mix prediction with observation.

**Resolution that keeps the declaration intact:** derive eligibility rather than redefine the window. For
each archive, compute the weeks that begin strictly after its own `saved_at`. If those are not the full
declared window, the 2026 primary production metric is **`unavailable_post_freeze_remainder`** and is
reported as unavailable — never as a degraded grade, never as a narrowed window presented as the declared
one. That is an honest unavailable state, which is exactly what the accepted scope asks for, and it needs no
change to a frozen plan.

**Consequence to say out loud now, before anyone is disappointed later:** if the first freeze lands after
week 1 kicks off, **2026 yields no clean full-season production grade at all**, and the first genuinely
prospective full-season test is **2027**. AGENTS.md already records the standing truth — *"Nothing in this
product has ever graded a prediction against a real football outcome"* — and this plan does not change that
this year.

**Baselines (the part that is actionable now).** `baseline_rule` already requires it: formulas are declared,
values and hashes are not captured, and reconstructions must be labelled retrospective. So the runnable work
is to **freeze the two declared baselines beside the forecasts at first-save time**, with source bytes,
URLs, capture times and SHA256, each carrying `reconstruction: "retrospective"`. A reconstructed baseline is
never presented as contemporaneous.

## 2. First prospective market-movement test — precise registration

`market_movement.status` is **`not_registered_for_grading`** and its rule demands an exact future capture
window, matching rules, baselines and a market-wide adjustment **before** outcomes are examined. This is
that registration, to be frozen before any T+90 capture is read.

**⛔ The framing constraint that shapes everything: a rank disagreement is not a numerical price forecast.**
We never predicted a price. So the hypothesis must be **ordinal**, and the outcome must be **relative**:

> Among players we and the market both rank, do those we rank higher than the market subsequently rise in
> **market-adjusted** price more than those we rank lower?

That is falsifiable, and it does not claim we forecast a number.

| element | registration |
|---|---|
| **T0** | the `saved_at` of the first archived snapshot — the freeze, not a nominal date |
| **T+90 (primary)** | first market capture with `market_as_of ≥ T0 + 90 days`, tolerance +3 days; none in window ⇒ **unavailable** |
| **T+30** | **descriptive only**, explicitly not a decision point, published as such to avoid multiple looks |
| **Cohort** | players carrying both `our_rank` and `market_rank` at T0 (the paired set), one row per `sleeper_id` |
| **Predictor** | signed rank gap at T0, `market_rank − our_rank`, ordinal only |
| **Outcome** | log price ratio T0→T+90, **minus the cohort median log change** (the market-wide adjustment) |
| **Primary statistic** | Spearman correlation between signed gap and adjusted movement, equal-weighted across the four positions |
| **Baseline** | 30-day trailing price trend at T0 (momentum). Pre-registered null: **the gap adds nothing beyond momentum** |
| **Decision rule** | claim a relationship only if the 95% interval excludes zero **and** it survives the momentum baseline; everything else exploratory |
| **Uncertainty** | stratified paired bootstrap within position, 10,000 resamples, **fixed seed 205**, declared now |
| **Cluster sensitivity** | second bootstrap clustering by NFL team, because teammates' prices co-move — same-cohort dependence is real and one interval will understate it |

**Ties.** Our board carries a 159-player tie at `230–388` and 571 zero-floor model values. The declaration
is explicit: *"Clipped valuation ties remain ties; alphabetical order is never a prediction"* and ordering
inside tied groups cannot be inferred. Therefore: **midranks for the correlation, and the tied block is a
single stratum, excluded from the primary ordinal test** and reported separately as a descriptive block.
Ranking inside a tie would be inventing a prediction we never made.

**Missing and delisting**, pre-registered so they cannot be decided after seeing them:
- No T+90 price ⇒ **missing, never zero**; counted and published, excluded from the primary.
- **Delisted** (present at T0, absent from the T+90 capture entirely) ⇒ its own declared category, excluded
  from the primary, reported as a count, with **one pre-registered sensitivity** assigning delisted players
  the worst observed decile of adjusted movement. Both results published regardless of direction.
- A price of zero that is genuinely published as zero is a value, not a missing — the two must not merge.

**Weighting and dedup.** One row per `sleeper_id`, duplicates are an error not a silent last-wins. Positions
equal-weighted so 387 receivers cannot swamp 127 quarterbacks; the unweighted figure is descriptive only.

## 3. Concrete modules and signatures

Style follows the existing outcome-loop modules: pure functions, injected inputs, no I/O, no wall-clock,
`decision_supported: False` on every card root.

```python
# src/dynasty_genius/outcome_loop/freeze_eligibility.py   (NEW)
def eligible_outcome_weeks(*, freeze_at: datetime, declared_window: tuple[int, int],
                           week_boundaries: list[dict]) -> dict:
    """-> {eligible_weeks, excluded_weeks, declared_window_intact: bool,
           primary_production_status: 'available' | 'unavailable_post_freeze_remainder'}"""

# src/dynasty_genius/eval/production_baselines.py         (NEW)
def reconstruct_cutoff_baselines(*, season: int, scoring_preset: str,
                                 week_window: tuple[int, int],
                                 weekly_records: Iterable[dict],
                                 eligible_players: list[dict]) -> dict:
    """Both declared baselines. Every row carries reconstruction='retrospective' and the
       source bytes hash. Never labelled contemporaneous."""

# src/dynasty_genius/outcome_loop/market_movement_registry.py  (NEW)
def register_market_movement(*, plan_id: str, t0_snapshot_id: str, t0_saved_at: datetime,
                             horizon_days: int, tolerance_days: int, seed: int) -> dict:
    """The frozen registration document. Must be archived BEFORE any T+90 capture is read."""

# src/dynasty_genius/outcome_loop/market_movement_scorer.py   (NEW)
def score_market_movement(*, t0_rows: list[dict], t90_rows: list[dict],
                          registration: dict) -> dict:
    """-> per-position blocks + roll-up: paired_n, missing_n, delisted_n, tied_block_n,
       spearman, ci95, momentum_baseline_spearman, adjusted_median_log_change,
       decision_supported: False"""
```

**Do not reuse `model_vs_market_scorer.py` for this.** It is DG-018, a separate frozen experiment on the
2026-08-05 set, and it grades *ranking against realized football points* via nDCG. Different outcome
variable, different question. Borrow its three rules — denominator on the face of the card, a null is a
result, skill not agreement — and write a new module.

## 4. Test cases that would actually catch something

1. **Freeze before week 1** ⇒ `declared_window_intact` True. **Freeze mid-week-1** ⇒ week 1 excluded and
   status `unavailable_post_freeze_remainder`. This is the test that stops a silently narrowed window.
2. **Whole market doubles** ⇒ every adjusted movement ≈ 0 and the correlation is ~0, not a spurious signal.
   The invariance test for the market-wide adjustment.
3. **Tied block** ⇒ excluded from the primary; a fixture that orders within the tie must not change the
   statistic.
4. **Delisted player** ⇒ not counted as a price fall in the primary; appears in `delisted_n`; the sensitivity
   is a separate number.
5. **Missing T+90 price** ⇒ `missing_n`, never a zero movement.
6. **Duplicate `sleeper_id`** ⇒ raises, never last-wins.
7. **Equal-position weighting** ⇒ a WR-heavy fixture cannot move the aggregate the way a raw pool would.
8. **Fixed seed** ⇒ identical interval across reruns; a changed seed is a code change, not a re-roll.
9. **Reconstructed baseline** ⇒ every row carries `reconstruction: "retrospective"`; a fixture asserting the
   absence of that label fails.
10. **Registration precedes observation** ⇒ scoring with a registration whose `registered_at` is later than
    the T+90 capture raises.

## 5. Code paths and conflicts to hand root

| # | conflict | path |
|---|---|---|
| 1 | **No archive exists**; root is an unset env var | `app/api/routes/workspace_snapshots.py:55` (`DG_WORKSPACE_ARCHIVE_ROOT`) |
| 2 | Declared weeks 1–17 vs a freeze at/after kickoff | `app/config/workspace_evaluation_plan.json` `primary_production.window` + `forecast_origin` |
| 3 | DG-018 scorer is a different experiment; do not repurpose | `src/dynasty_genius/outcome_loop/model_vs_market_scorer.py` |
| 4 | Market movement is unregistered by design; §2 is the registration to freeze | plan `market_movement.status` |
| 5 | Honest-unavailable states have nowhere to render yet | Lovable `src/routes/track-record.tsx` is a placeholder |
| 6 | Store is content-addressed with receipt re-derivation; reuse it rather than inventing storage | `src/dynasty_genius/capture/workspace_snapshot_store.py` (`save_snapshot`, `read_snapshot`, `list_snapshots`) |

## 6. Smallest runnable increment, and the future-data input contract

**Smallest thing that runs and is worth running:** set `DG_WORKSPACE_ARCHIVE_ROOT`, save the **first**
snapshot, and freeze the two reconstructed baselines and the market-movement registration **beside** it in
the same archive. Nothing is graded. The deliverable is a dated, hashed, immutable freeze plus two
`declared_not_graded` documents.

**Explicit future-data input contract** — what a later grading run must be handed, and must refuse without:
weekly player records for the exact archived scoring preset and week window with source URLs, capture times
and SHA256; the scoring-code identity; an NFL week-boundary table; and for the market test a capture whose
`market_as_of` falls in the registered window. **Missing required fields block grading rather than changing
the target** — the declaration already says this, and the loader should enforce it rather than restate it.

**Honest unavailable states to render:** `unavailable_post_freeze_remainder`, `awaiting_horizon`,
`registration_not_frozen`, `outcome_feed_incomplete`. Each says which input is missing and when it could
become available. None of them ever shows a number.

## 7. Scope boundary

Root owns the final plan, the tickets and the worker roles; I have not written them. What is here is the
science for the evaluation lane I would own as DG-207, plus the conflicts a plan must route around. No
decision logging, no model change, no historical outcome grade, and no outcome query was performed.

---

## 8. Closing addendum — the four points to carry into the contract verbatim

Written at root's request to conclude; these sharpen §2 rather than replace it.

**1. Enrollment is prospective and the cohort is fixed at T0.** The scored set is frozen when the
registration is frozen: every player carrying both `our_rank` and `market_rank` in the T0 archive, listed by
`sleeper_id` **in the registration document itself**. A player who appears in the market only later is
**never added**, no matter how interesting. Late enrollment is how a cohort quietly becomes a selection.

**2. Both endpoints carry immutable source hashes, not just the start.** The registration freezes the T0
snapshot id and its content hash; the grading run freezes the T+90 capture bytes, source URL, capture time
and SHA256 **before computing anything**. A movement result whose endpoint bytes were never hashed is not
reproducible and should not be published. Results are **append-only, joined to the original snapshot id** —
never written back into it.

**3. Pending and missing are different states and must never share a cell.**
- **`pending`** — the horizon has not elapsed, or the capture window has not opened. Nothing is wrong.
- **`missing`** — the horizon elapsed and the value is absent: no T+90 price, incomplete feed, unresolved
  identity.
- **`delisted`** — present at T0, absent from the T+90 capture entirely.
- **a published zero** — a real value.

Four states, four labels. Collapsing `pending` into `missing` would make an unfinished test look like a
degraded one; collapsing `delisted` into a zero price would invent a total loss the market never printed.

**4. Fail closed on any input we cannot name today.** Where a technical source is not yet known — the exact
NFL week-boundary table, the market capture cadence at T+90, the scoring-code identity at grading time —
**declare the input contract and refuse without it.** Do not treat an unnamed source as available and do not
substitute a nearby one. Acceptance is: the grading run reads only inputs the registration named, verifies
their hashes, and **raises rather than degrades** when one is absent. A grade that silently proceeded on a
substituted input is worse than no grade, because it looks like evidence.

## Conclusion

The plan is complete as scoped. The market proposal is §2 plus this addendum; the cutoff cautions are §1,
and the one that matters most is verified rather than assumed: **the archive is empty, `DG_WORKSPACE_ARCHIVE_ROOT`
is unset, so the first freeze has not happened and will land at or after kickoff.** If it lands after week 1
begins, 2026 has no clean full-season production grade and the first genuinely prospective one is 2027. That
should be said to David in those words rather than discovered in January.

No outcome query was run at any point, and no declaration was amended.
