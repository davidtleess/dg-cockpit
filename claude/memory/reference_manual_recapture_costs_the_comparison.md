---
name: reference_manual_recapture_costs_the_comparison
description: A same-day manual re-capture gives that date two vintages, and the what-changed model half then refuses ALL deltas for any window touching it — measured live 2026-09-04, zero model deltas on David's morning read
metadata:
  type: reference
---

**A manual PVO/model re-capture on a date that already captured costs David the "what changed" model
comparison for every window touching that date — it emits ZERO deltas, and the screen reads like a quiet
morning rather than a broken one.**

**Mechanism (`src/dynasty_genius/what_changed/daily_diff.py:245-270`):** the vintage is the PAIR
`(semantic_output_hash, provenance_hash)`. If either compared date carries more than one distinct pair,
`daily_diff` returns `status: model_multi_vintage_ambiguous`, `decision_supported: False` and
`"deltas": []` — a deliberate, honest refusal to emit an internally inconsistent comparison, NOT a bug.
The store key includes the vintage pair, so a same-day re-capture legitimately creates the second one.

**Measured live 2026-09-04 08:3x ET** (`curl :8000/api/league/what-changed`):
`comparison_window {from 2026-09-02, to 2026-09-03, ambiguous_dates ["2026-09-02"]}`, model deltas **0**,
market half `ok`. The cause is DG-137's manual 14:50 re-capture on 09-02.

**This resolves an apparent contradiction, it does not create one.** DG-137's record calls that same 14:50
rerun the CLEAN counter-example (same `provenance_hash`, moved `semantic_output_hash` — that is what
detected the 142 team labels), and Fred calls it the thing that put 09-02 into the ambiguous state. **Both
are true of the same event**: the moved semantic hash is exactly the second vintage. See
[[project_dg134_landed_2026-09-03]].

**It self-heals as the window advances** — once 09-04 captures, the window becomes 09-03 → 09-04 and 09-02
drops out — **but only if no manual re-capture happens that day**, which would push the ambiguity forward a
day. Hence Fred's 2026-09-04 constraint, relayed through Greg, that no lane run a manual refresh that day:
read the artifact and the API, or wait for a scheduled run (09:00 chain, 11:30, 14:00).

**How to apply:** never run a manual refresh to "check" a landed change — the check costs the next
morning's comparison. Verify a landed change by reading the served artifact and the API instead. When the
model half shows nothing moved, read `comparison_window.status` before believing it was a quiet night.
Related: [[reference_nflverse_unchanged_trap]], [[project_dg137_served_team_landed]].
