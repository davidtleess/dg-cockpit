# DG-098 — A1a shadow ledgers: the one instrument that can detect the product harming its user

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **IN-SEASON — Ledger B wants an early start (usable n in ONE season)**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session).

**Problem:** REV2's A1a survives A1's withdrawal as "the record," and nothing tracks it. Two ledgers: **Ledger A** — census prediction ledger at compute-time, pre-registered emission policy (policy_id, thresholds, declared_by/at; rows never pool across policy_id), a cheap schema swap on the proven capture-store template. **Ledger B** — the anchoring monitor: David records his own call and confidence BEFORE the model's number is revealed; on a randomized ~30% of items the reveal is withheld; the estimand is influence, not accuracy. Four reviewers independently flagged anchoring as the failure mode, and "Ledger B is the only mechanism in the entire plan that can detect the product harming you."

**How we know:** `docs/strategies/2026-08-20-dg-product-law-amendments-REV2.md` :91-103 — Ledger A :93, Ledger B :95, the harm-detection line :97, honest scope :99, build notes :101-103. `grep -ril "ledger" ~/dg-build/tickets/` → no A1a ticket (2026-08-29).

**Done looks like:** Ledger A capturing on cadence under a pre-registered policy. Ledger B live in the UI flow with the withhold arm working. Both append-only FOR REAL: `BEFORE UPDATE` / `BEFORE DELETE` triggers that `RAISE(ABORT)` plus a `prev_row_hash` chain (~40 LOC, REV2:103 — "the difference between a ledger and a log"; the existing stores are append-only by Python convention only).

**Depends on:** the capture-store template (proven). Ledger B needs a UI touchpoint — **coordinate with the DG-091 rebuild so the pre-reveal prompt is designed in, not bolted on.**

---

**Notes**
- Timing rationale: Ledger B "reaches usable n in one season, not sixty" (REV2:95) — every week not recording is sample permanently lost. Earliest honest slot after the committed week-1 items; the withhold arm's randomization is pre-registered like everything else.
- Honest scope binds the build and the write-ups: neither ledger is "the road to decision_supported" (REV2:99). Ledger B's product question is falsifiable: if the pre/post delta does not shrink as claim level falls, the claim chip is decorative and the surface should be withdrawn.
