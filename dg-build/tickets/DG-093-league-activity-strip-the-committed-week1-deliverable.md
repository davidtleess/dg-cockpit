# DG-093 — League Activity strip: the committed week-1 deliverable has no ticket

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **IN-SEASON wk 1 — COMMITTED ≤2026-09-17**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session); every citation file-verified that evening.

**Problem:** David's one committed in-season deliverable — *"i will be able to add league activity after week one - but i do need to have it"* — exists only as a ruling and a retained spec body. No ticket in any tracker could see or schedule it.

**How we know:** `grep -il "league activity" ~/dg-build/tickets/*.md` → only DG-091, which names it purely as a scheduling neighbor ("alongside League Activity (≤09-17)") — no ticket carries it as WORK (2026-08-29). The ruling: SEASON-BRIEF.md:148-164 (deferred NOT cut; committed for week 1, on or before 2026-09-17; the sprint's job was to leave it buildable — it did). The build spec survives verbatim as SR-18's retained body: `docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:1465-1511`, governed by the B3 note at :28-32 — SR-18 was pulled out of the sprint per David's existing ruling, "its ticket body is retained below verbatim as the post-freeze spec; the D9 go/no-go checkpoint is cancelled."

**Done looks like:** The spec's own line (:1511): the Morning Room shows the last twelve things that happened in his league, in plain language, off the transaction store — with no score attached to any of them. Landed on or before 2026-09-17. Verification commands: spec :1490-1509.

**Depends on:** nothing hard. `league_transactions.db` already holds the data (spec :1473 measured movement rows 2023:505 / 2024:560 / 2025:500 / 2026:133); the 06:30 capture keeps it flowing; SR-10a/SR-11 cover the store.

---

**Notes** *(build pointers, all from the retained spec — read :1465-1511 in full before claiming)*
- Rides the existing what-changed report: a sixth `_section_envelope` section, no new route. Files list at :1477. N=12, capped in the producer, honest season total carried alongside (:1480-1485).
- **No scores, no ranking, no ordering by anything but time** — Ruling 10 stays disengaged by construction; that is why this ticket's spec replaced SR-17 (PT-7, :1637).
- Cut line (:1487): backend steps 1-5 (~1.0d) land alone safely; frontend step 6 (~0.5d) is what David sees. Never ship a half-rendered strip.
- OpenAPI step: REGENERATE `frontend/openapi.json`, never hand-commit the working copy (regen trap).
- Queue position: the week-1 BUILD slot — see `~/dg-build/IN-SEASON-QUEUE.md`.
