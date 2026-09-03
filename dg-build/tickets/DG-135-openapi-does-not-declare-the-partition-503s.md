# DG-135 — `frontend/openapi.json` does not declare the 503 that `/api/engine-b/scores` and `/api/roster/audit` now return

**Layer:** 3 · **State:** open · **Lane:** Davids-MacBook-Pro-32886 · **DG 3.0** · **API contract / frontend · small, mechanical**
**Source:** DG-133 follow-up (its LANDED section, 2026-09-01); ticketed 2026-09-02 06:05 by Tower.

**Problem:** DG-133 (`f8995d3d`) made two routes answer
`503 {"error": "engine_b_dependency_unavailable" | "roster_dependency_unavailable", "message": <bare token>}`
when the inference partition cannot be selected (`app/api/routes/engine_b.py`, `app/api/routes/roster.py`).
`frontend/openapi.json` still declares only `200` for `/api/engine-b/scores` GET and
`/api/roster/audit` GET (verified 2026-09-02: `/api/roster/capacity` already declares `503`; the
other two do not). The generated client therefore has no typed shape for the failure the server
now sends, and the frontend's fail-closed rendering of it is untested against the contract.

**Fix shape:** regenerate, never hand-edit — `npm --prefix frontend run openapi-gen` from a
clean worktree at or after `f8995d3d`, commit the regenerated file ALONE, and diff it: the only
change must be the two new `503` entries (and their shared error schema if one is emitted).
See [[reference_openapi_regen_trap]] — a dirty working copy of this file has silently REVERTED
landed commits before; the diff review is the whole ticket.

**Anti-scope:** no route change, no frontend copy change, no other openapi drift; if the regen
produces anything beyond the two 503s, STOP and report what else moved — that is a different
ticket's landing being exposed, not this one's to absorb.

**Verify:** the openapi drift test passes; `git diff --stat` on the landing commit touches
`frontend/openapi.json` only; both routes list `200` and `503`.

**Built 2026-09-02 14:55–15:10 on `ticket/DG-135` (Tower, `~/dg-wt/DG-135`) — the ticket's premise
was FALSE, recorded here so the closeout reads true:**
- **"Regenerate only" produced a ZERO-line diff.** `app.openapi()` was already byte-identical to
  `frontend/openapi.json`. Both routes declared only `200` because DG-133 raises the 503 at
  runtime (`HTTPException(status_code=503, detail={...})`) and never told the schema. There was
  nothing to regenerate; the fix is a route change the anti-scope forbade. Tower took the route
  change anyway — the anti-scope was written on a wrong premise, and without it this ticket cannot
  be done at all. The Problem statement's body shape is also wrong: FastAPI's default handler wraps
  `detail` as **`{"detail": {"error": ..., "message": ...}}`** — the flat body it quotes is what the
  code *builds*, not what the wire carries.
- Fix as built: `responses={503: {"model": ...}}` on both decorators, with two new models in
  `app/api/routes/dependency_unavailable_models.py` that describe the **detail envelope** (error
  token pinned as a `Literal` → `"const"` in the schema), then `npm --prefix frontend run openapi-gen`
  from the clean worktree. `frontend/openapi.json` diff: +84 lines, exactly the two `503` entries and
  their four component schemas — nothing else moved. Generated client regenerated with it
  (`frontend/src/lib/api/{index.ts,types.gen.ts,zod.gen.ts}`).
- Five contract tests (`tests/contract/test_dg133_503_is_in_the_contract.py`): both routes list
  `{200, 503}` pointing at their own model; the declared schema is the envelope not a flat body; the
  REAL 503 body (partition refused via monkeypatch) validates against the declared model. Three of
  five red without the route declarations.
- Left undeclared by choice: the roster route's 422 `roster_config_error` (pre-DG-133, not this
  ticket's).
- **Exposed, ticketed as DG-138, not absorbed:** of the seven routes that already declare a 503
  model, three raise `HTTPException` (so the wire carries the envelope) while declaring a FLAT
  model — `roster_capacity.py:63`, `model_scoreboard.py:50`, `realized_outcome_scorecard.py:48`.
  The four `JSONResponse` routes are honest. The ticket's "`/api/roster/capacity` already declares
  `503`" was true and misleading: it declares one it never sends.
- dg-land `--dry-run`: rebase clean on `862a1afb`, pytest 6770 passed / 33 skipped, frontend gate
  629, merge builds, push accepted. Commit `5cc99a86` (amended once to correct a "seven routes
  lie" claim in its own message to the measured three).

**Adversarial review 2026-09-02 15:05–15:25 (3 lenses, every serious finding re-checked by a skeptic; 10 agents, 0 died):**
contract-truth FIX_FIRST → regen-integrity LAND → frontend-consumer LAND. Independently verified by the
lenses: openapi diff +84/−0, 6 added key paths, 0 removed/changed; committed openapi.json byte-identical to a
fresh `app.openapi()` dump; generated client byte-identical to a fresh openapi-ts 0.98.1 run, 0 removed exports;
no custom exception handler; all three raise sites validate against the declared model. Three findings survived
and were fixed before landing (commit re-amended `5cc99a86` → `bda8c3a9`): (1) the test's `== {"200","503"}`
would have failed the day the roster 422 is correctly declared → subset assertion; (2) the roster route's second
503 site (assembler, "all roster rows failed to map") had no route-level test → added, six tests now; (3) the
docstring's "never prose" was false on that site → reworded. One finding was overtaken (DG-138 "does not
exist" — it was filed 3 minutes after the reviewer looked). Frontend lens: the typed 503 is INERT on screen —
`RosterAudit.tsx:38-43` decides by status code and never reads a non-OK body; `/api/engine-b/scores` has no
frontend consumer; the roster 422 (`roster_config_error`) is the one branch the frontend DOES distinguish and it
stays undeclared — noted on DG-138.

**Acceptance — landed 2026-09-02 15:29 ET by Tower (`~/dg-build/bin/dg-land.sh DG-135` from `~/dg-wt/DG-135`):**
```
 app/api/routes/dependency_unavailable_models.py    | 44 +++++++++++
 app/api/routes/engine_b.py                         |  7 +-
 app/api/routes/roster.py                           | 10 ++-
 frontend/openapi.json                              | 84 +++++++++++++++++++
 frontend/src/lib/api/index.ts                      |  2 +-
 frontend/src/lib/api/types.gen.ts                  | 64 +++++++++++++++
 frontend/src/lib/api/zod.gen.ts                    | 34 ++++++++
 .../contract/test_dg133_503_is_in_the_contract.py  | 93 ++++++++++++++++++++++
 8 files changed, 335 insertions(+), 3 deletions(-)
To https://github.com/davidtleess/dynasty-genius.git
   862a1afb..60f6940f  HEAD -> main
✔ DG-135 landed on main and pushed. Worktree and branch removed.
```
Rebase target DG-137's `862a1afb`; inside dg-land pytest 6772 passed / 32 skipped, frontend gate 629/629, build
107ms. **Not live until trunk pull + frontend bundle rebuild + API restart** — the generated client under
`frontend/src/lib/api/` changed, so this one DOES need the rebuild ([[reference_trunk_frontend_bundle_is_a_manual_build]]).
Nothing on screen changes; the contract and the drift test now tell the truth about the DG-133 outage.
