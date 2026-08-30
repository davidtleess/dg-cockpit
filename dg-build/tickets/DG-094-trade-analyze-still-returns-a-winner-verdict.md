# DG-094 — POST /api/trade/analyze still returns a trade winner (Ruling 07 violation, live)

**Layer:** 6  ·  **State:** dropped  ·  **Lane:** —  ·  **DG 3.0**  ·  **DROPPED 2026-08-29 late — David's frontend ruling**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session); site re-verified on trunk that evening.

**Problem:** `compute_delta_status` returns `"Likely_Favors_You"` / `"Likely_Favors_Opponent"` and the analyzer surfaces it as `delta_status` over POST /api/trade/analyze — a trade winner verdict. Ruling 07: trade math is an input, never an output; no side total, fairness score, or winner ever surfaces. The master plan names this exact site: "The failure mode is in the product now."

**How we know:** Read on trunk 2026-08-29: `app/services/trade_analyzer.py:228-233` (the verdict strings), :245 + :257 (surfaced in the return envelope), `app/api/routes/trade.py:83-86` (served, untyped `-> dict`). Ruling text: `docs/strategies/2026-08-20-dynasty-genius-MASTER-architecture-and-build-plan.md:195-206`. Frontend consumers: ZERO — grep of frontend/src for `delta_status` / `Likely_Favors` returns nothing; only the generated route registration exists.

**Done looks like:** /api/trade/analyze returns per-side PVO evidence only (my_assets / their_assets, status, engine, decision_supported, reason, caveats, uncertainty_note). A contract test asserts `delta_status` is ABSENT. Suite green, OpenAPI regenerated.

**Depends on:** nothing.

---

**Notes**
- DECIDED cut (smallest honest one): delete `compute_delta_status` (:192-233) WITH its only caller — grep shows nothing else calls it. The side totals `my_proj` / `their_proj` (:208, :210) die with it; Ruling 07 bars side totals surfacing too, so nothing may re-expose them.
- What breaks, by design: the 4 delta_status assertions among the 6 tests in `tests/contract/test_trade_delta_status.py` (:14-15, :36, :71, :90) — rewrite them to assert absence; that IS the compliant contract test. The other two tests there (:38, :47) and `test_surface2_trade_typing.py` pass unchanged.
- `frontend/openapi.json`: REGENERATE, never hand-commit the working copy (regen trap — a dirty copy can silently revert landed commits).
- A beneficiary-free `within_model_error` boolean was considered and NOT chosen — it names no winner but churns the contract just as much. David can ask for it later as a separate disclosure decision.

---

**DROPPED 2026-08-29 late night — DAVID'S RULING, verbatim (gap-audit session):** *"I don't care to persist the governance of language and caveats and lack of overall recommendation from the back end into the front end. I'd rather use layman's terms and call a spade a spade, and I've given it the green light to do so."* The frontend is now authorized to present overall recommendations; deleting `delta_status` would strip the exact signal that presentation consumes. Backend evidence-typing is unchanged by the ruling. Revive only on David's word.
