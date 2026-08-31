# DG-120 — The receipt layer still speaks pipeline, and David is one click from it

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-66345 · **DG 3.0** · **frontend-only · DG-091 follow-on**
**Source:** David, 2026-08-30: *"do the trade partners view and the raw token"*; and the closeout
audit, which found that ONE CLICK on the header pill "Attention — details inside" — the first
affordance in the top bar — puts raw pipeline strings on screen.

**Problem.** DG-109's render rule exempts two declared subtrees, `[data-receipt]` and
`[data-user-text]`. That exemption is CORRECT in principle — a receipt naming
`run_pvo_refresh.py` or an artifact hash is real provenance a person may want to copy. But the
exemption is currently doing double duty, and unreadable STATUS MESSAGES are hiding behind it:
- `roster_capacity: live_precondition_not_ok:capture_health_ok=degraded`
- `daily_what_changed: live_precondition_not_ok:captu…`
- `2 of 3 stores degraded — model_forward_capture: missing 1 of 67 days (2026-08-12); market_divergence_history: missing 4 …`
- bare keys as headings: `model_provenance`, `capture_health`, `tier_readiness`, `adapter_status:ok`
Measured live on 2026-08-30 by walking the DOM including exempt subtrees.

**The principle to build (this is the ticket's real deliverable):** inside a receipt, distinguish
**IDENTIFIERS** from **MESSAGES**.
- **Identifiers stay raw and copyable** — file paths, artifact ids, run ids, hashes, git shas,
  schema versions. They are addresses; rewording them destroys them.
- **Messages must be prose** — statuses, reasons, conditions, counts, anything a sentence.
  `live_precondition_not_ok:capture_health_ok=degraded` is not an address, it is a sentence
  someone declined to write.

**Build:** route receipt MESSAGES through the DG-109 dictionary (`lib/copy.ts`); give each receipt
row a human label with the identifier beneath it; keep every identifier byte-exact. Extend the
render rule so the exemption covers identifiers only — a message inside `[data-receipt]` that
looks like a sentence-in-snake_case should FAIL the rule, so this cannot silently return.

**Honesty law:** nothing is removed. Every fact a receipt carries today it carries after — the
degraded stores, the missing dates, the precondition that failed. This is translation, not
deletion, and the raw identifier stays visible so provenance survives.
**Done:** clicking "Attention — details inside" shows sentences, with identifiers intact beneath
them; the render rule fails a snake_case MESSAGE inside a receipt (watch it fail, then fix);
verified in a real browser at 1440 and 390.
