# DG-138 — Three routes declare a flat 503 model the server never sends: `HTTPException.detail` is wrapped as `{"detail": ...}` on the wire

**Layer:** 3 · **State:** open · **Lane:** — · **DG 3.0** · **API contract truth · small, mechanical**
**Source:** exposed while building DG-135 (2026-09-02 ~15:00, Tower); every line below re-measured in trunk at `862a1afb` before filing; ticketed 2026-09-02 15:15 by Tower.

**Problem:** seven routes declare `responses={503: {"model": <X>ErrorResponse}}`, but they raise the
503 two different ways, and only one of them matches the model they declare:

- **Three build a `HTTPException(status_code=503, detail=body.model_dump())`** and raise it —
  `app/api/routes/roster_capacity.py:63` (declared at `:138`, `RosterCapacityErrorResponse`),
  `model_scoreboard.py:50` (`:114`, `ModelScoreboardErrorResponse`),
  `realized_outcome_scorecard.py:48` (`:103`, `RealizedOutcomeScorecardErrorResponse`).
  FastAPI's default handler (no custom one in `app/main.py`) serialises that as
  **`{"detail": {…flat body…}}`**. The declared model is the flat body. The generated client's
  type for the 503 is therefore wrong on all three — a caller that trusts `zod.gen.ts` would
  reject the real response. The project's own tests already know the truth: they read
  `response.json()["detail"]` (`tests/contract/test_roster_capacity_route.py:150,189`,
  `test_realized_outcome_scorecard_route.py:208,242,285`) — the tests pin the wire, the schema
  pins a fiction.
- **Four return `JSONResponse(status_code=503, content=body.model_dump())`** — honest, flat body
  = flat model: `system_health.py:169`, `system_tier_readiness.py:117`,
  `system_capture_health.py:69`, `system_model_provenance.py:59`. Nothing to do here.

DG-135 declared its two new 503s in the envelope shape the server actually sends
(`app/api/routes/dependency_unavailable_models.py`), so as of DG-135 the contract has THREE
conventions for "503 body": envelope-declared-as-envelope (DG-135, true), flat-declared-as-flat
(the four `JSONResponse` routes, true), flat-declared-but-envelope-sent (these three, false).

**Why it is not urgent:** no live surface reads the 503 body. The frontend gates on status —
`LeaguePulse.tsx:16` ("any non-OK incl. 503/422 → unavailable"), `TradeLab.tsx:30`,
`SystemHealthCard.tsx:75` — so nothing on David's screen is wrong today. It is a contract lie
waiting for the first consumer that believes the contract.

**Fix shape — pick ONE convention, do not add a fourth:**
- (a) **Make the three honest the cheap way:** change each `HTTPException(...)` builder to return
  a `JSONResponse(status_code=503, content=body.model_dump())` like the four honest routes, and
  `raise` → `return` at the call sites. Body on the wire becomes flat = declared model. The five
  tests that read `["detail"]` flip to reading the flat body — which is the point: they were
  pinning the bug. Regenerate `frontend/openapi.json` (should be a ZERO-line diff — the declared
  models do not change; if it is not zero, STOP and report).
- (b) Or declare the envelope like DG-135 did (wrap each model in a `{"detail": …}` response
  model). Keeps the raise style, changes the contract, regen is a non-zero diff on all three.
Tower's recommendation is (a): it removes a convention instead of blessing one, the wire gets
simpler, and the four honest routes are already the majority. Either way, one landing, all three
routes together, and DG-135's contract test pattern (real body validates against the declared
model) added for each.

**Also in this ticket — the roster 422:** `app/api/routes/roster.py:26-30` raises
`HTTPException(422, detail={"error": "roster_config_error", ...})` (since `64fbef20`, 2026-04-30) and it
has NEVER been declared (`git log -S roster_config_error -- frontend/openapi.json` is empty) — yet it is the
one error branch the frontend actually distinguishes (`frontend/src/roster/RosterAudit.tsx:40`, since
2026-06-19). Declare it the DG-135 way (envelope model, `Literal` token). DG-135's route test uses a subset
assertion precisely so this declaration can land without failing it.

**Anti-scope:** no change to what any 503 SAYS (error tokens, messages) — only the envelope; no
change to the four `JSONResponse` routes; no touching DG-135's two routes; never hand-edit
`frontend/openapi.json` ([[reference_openapi_regen_trap]]).

**Verify:** for each of the three routes, a contract test in the DG-135 style — force the 503
and `Model.model_validate(response.json())` against the DECLARED model — goes red on trunk and
green on the branch; `frontend/openapi.json` regen diff is exactly what the chosen option
predicts; the five `["detail"]` reads are gone (option a) or still true (option b).
