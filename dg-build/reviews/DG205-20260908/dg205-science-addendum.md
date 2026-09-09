# DG-205 addendum — correcting my "no archive" finding, and what it changes

Correction to `/private/tmp/dg205-science-planning.md`, which is preserved unchanged. Planning only, no
product code, no outcome query.

## 1. My finding was false. The archive exists.

**Verified at the path root named:**

```
/Users/davidleess/dg-wt/DG-189/runs/20260908T014624Z/archive/
  f67ae44e44fd51f0534f92c875a01d2bfc1b8a720bfc96025fc6115d45220dc0/
```

All nine files present — `snapshot.json`, `ranks.json`, `market.json`, `comparison.json`, `catalog.json`,
`catalog-companion.json`, `league.json`, `report.json`, `evaluation-plan.json` — with a valid
`workspace_snapshot.v1` receipt, `evaluation_status: ungraded`, and counts `paired 388 · model 825 ·
market 399 · roster 27 · available 433`.

**Two mistakes, both mine.**

**The search was broken and I read its silence as evidence.** I looked for a directory named
`workspace_snapshots` and for `snapshot.json` on a path containing `workspace`. The real directory is named
`archive` and its path contains no `workspace` segment, so **both patterns excluded the target by
construction**. A `find` that cannot match the thing returns nothing, and nothing is not absence.

**I over-claimed from an unset environment variable.** `DG_WORKSPACE_ARCHIVE_ROOT` being unset in my shell
says only that *my shell* has no configured root. It says nothing about whether an archive exists, and the
handoff had already named the exact path. Root is right: an unset env var never proves a negative.

## 2. The conclusion that reversed — in David's favour

My planning report said: if the first freeze lands after week 1 begins, **2026 yields no clean full-season
production grade and the first prospective one is 2027.** That rested entirely on the false premise, and it
is **wrong**.

**The real freeze is `saved_at 2026-09-08T01:48:12.679083+00:00` — before the 2026-09-10 kickoff.**

So NFL regular-season weeks 1–17 are **entirely after the cutoff**. The declared window in
`workspace-production-2026-v1` is **intact**, and the 2026 primary production evaluation is a genuinely
prospective test. The archive also carries `forecast_date 2026-09-06` and `market_as_of
2026-09-06T13:00:02Z`, both comfortably pre-kickoff.

The `eligible_outcome_weeks` guard I proposed still earns its place — it is what *proves* the window is
intact rather than assuming it, and it protects any later archive — but its verdict here is
`declared_window_intact: true`, not the unavailable state I predicted. **Please carry the corrected version
to David**; my earlier framing would have told him something discouraging and untrue.

## 3. Root's contract decisions — accepted, with three of my proposals corrected

**Enrollment.** The 90-day market experiment is **never retroactively registered at the old `saved_at`**. It
takes a **new enrollment T0 with a fresh complete market snapshot**; the original board forecast is retained
and carries an **explicit age disclosure**, since its market leg is dated 2026-09-06. Registration precedes
any endpoint read.

**⛔ My log-return was wrong.** A published zero makes a log ratio undefined or infinite. Corrected to
**arithmetic percentage return**, admitted only for **strictly positive start prices**; a true published end
zero is **−100%**; an absent end price is **missing**, never a −100%. The four states stay distinct:
pending, missing, delisted, published zero.

**⛔ My tie handling was wrong.** I proposed excluding the 159 floor players from the primary. That is
dropping a real cohort to make a statistic behave, which is the selection I would object to in anyone
else's design. Corrected: **genuine ties are preserved as midranks and stay in the fixed cohort**, all
positions retained.

**Momentum comparison, stated precisely** — replacing my vague "survives the baseline":

> **Primary statistic:** the paired difference
> `Spearman(signed_rank_gap_T0, adjusted_return) − Spearman(trailing_30d_momentum_T0, adjusted_return)`,
> computed on the identical fixed cohort, equal-weighted across positions, with a stratified paired
> bootstrap (within position, 10,000 resamples, fixed seed 205) recomputing **the difference** in every
> resample and a percentile 95% interval.

Both component correlations are published regardless of direction. The claim is only that our ordinal
disagreement carries information **beyond momentum**, or that it does not.

**The trailing-30-day momentum source must be frozen at enrollment.** If it is not captured and hashed at
T0, the **baseline is unavailable** and the comparison does not run. No substitution, no later
reconstruction, no tuning.

**⛔ My invariance test case was mathematically wrong.** I wrote that a whole-market constant move gives a
correlation of "~0". It does not. If every price moves by the same factor, the market-wide adjustment makes
every adjusted return exactly 0, the outcome has **zero variance**, and Spearman is **undefined** — 0/0, not
zero. The test must assert `correlation: undefined` and a stated reason, never a numeric 0, because a
printed 0 would read as "measured no relationship" when nothing was measurable at all.

**Claim discipline.** Ordinal association and ordinal comparison only. **Not** a point price forecast, not a
decision edge, not a demonstrated gain. `decision_supported: False` stays on every card root.

## 4. What still stands from the original report

Everything not corrected above: the declaration stays unamended; results are append-only and joined to the
original snapshot id; both endpoints carry immutable hashes; 90 days primary with 30 days descriptive only;
one row per `sleeper_id` with duplicates raising; equal-position weighting; the four-state distinction; the
fail-closed input contract; and the module and signature sketch, with `market_movement_scorer` written fresh
rather than repurposing the DG-018 `model_vs_market_scorer`, which grades ranking against realized football
points and answers a different question.

## 5. The lesson I am recording against myself

A search that cannot match its target returns clean, and clean reads like proof. I have flagged that exact
trap in other lanes' work in this session and then walked into it. The guard is to verify the instrument
against a known-present case before trusting a negative — and when a handoff names an exact path, check the
path before searching for the pattern.
