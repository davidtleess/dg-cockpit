# DG-104 — Re-scope the banned-language enforcement to David's frontend ruling

**Layer:** 6  ·  **State:** todo  ·  **Lane:** Davids-MacBook-Pro-60551  ·  **DG 3.0**  ·  **UNBLOCKS the frontend green light — do with/before the first plain-language land**
**Source:** David's ruling 2026-08-29 late night, verbatim in the IN-SEASON-QUEUE amendment and in DG-094/DG-095's drop blocks: the frontend speaks layman's terms and may state overall recommendations; backend governance is not persisted into the frontend.

**Problem:** CI carries a banned-language linter built to enforce the no-verdict law on frontend surfaces (`npm run test:governance` — the No-Verdict Line "enforced by a banned-language LINTER in CI"). Under David's ruling it now enforces a repealed presentation law and will mechanically BLOCK the exact language he green-lit. Any dg-land frontend gate (DG-102) would harden the blockade if wired first.

**How we know:** the linter's existence and purpose are recorded in the product docs/test suite (governance lint target in frontend package scripts); David's ruling verbatim, recorded 2026-08-29 in this repo. Verify the linter's exact file list at claim time — the claim here is its purpose, not its line numbers.

**Done looks like:** Presentation-language checks on frontend surfaces removed or re-scoped per the ruling. **BACKEND evidence-typing checks stay ARMED** — fail-closed `decision_supported`, claim-level machinery, and `validate_no_prohibited_features` (no market data in training) are measurement law, untouched by a presentation ruling. DG-102's frontend gate sequences AFTER this ticket so the gate never blocks the ruling.

**Depends on:** nothing. Natural owner: the frontend lane — it hits the linter first.

---

**Notes**
- The ruling changed what the product SAYS, not what it MEASURES. Any check that keeps the numbers honest survives; any check that polices tone/verdict wording on the frontend goes.
- If a check is ambiguous (serves both purposes), split it rather than drop it, and record which half died under which authority.
