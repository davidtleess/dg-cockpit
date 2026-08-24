---
name: reference-openapi-regen-trap
description: "In dynasty-genius-product, a dirty frontend/openapi.json can silently REVERT landed commits — always regenerate, never commit the working copy"
metadata:
  type: reference
---

**`frontend/openapi.json` and `frontend/src/lib/api/*.gen.ts` are generated artifacts. A dirty
working copy of them is not a diff — it is whatever spec the last lane happened to generate, and it
can silently delete other lanes' shipped endpoints.**

Measured 2026-08-23: the working `openapi.json` was `+133/−472` against HEAD. The 472 deletions
reverted three landed commits — `ee22a5db` (model-scoreboard), `e691f5e6` (scorecard coverage),
`62768d09` (inputs_degraded). Committing it would have destroyed shipped work while looking like a
routine "include the generated files" step.

**The trap has two jaws.** Adding a required field to a response model breaks **two independent
byte-compare gates** — `tests/contract/test_openapi_drift_contract.py` AND a second one buried in
`test_daily_what_changed_api.py:347`. Committing backend-only fails CI; the obvious fix (add the
dirty generated files) reverts the three commits. Both roads are wrong.

**How to apply:** run `npm --prefix frontend run openapi-gen` from the current tree, then confirm the
diff is **additive** (`git diff --numstat frontend/openapi.json` → `N 0`). Any large deletion count
means you are about to revert someone. Regeneration also drags in pre-existing client staleness
(e.g. `ModelScoreboard*` types) — expected, since the generated client is a single artifact.

Verify with the full suite, never a cherry-picked file: `pytest tests/contract/ -q` plus
`npm --prefix frontend run typecheck`. On 08-23 two files gave `25 passed` while the suite had
17 failures.

Related: [[project_season_readiness_2026]], [[machine_macbook_pro_m5_migration]]
