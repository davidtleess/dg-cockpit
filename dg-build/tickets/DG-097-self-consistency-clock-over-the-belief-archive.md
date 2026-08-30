# DG-097 — The self-consistency clock: 57+ days of captures already answer "what did you say then"

**Layer:** 6  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **IN-SEASON (explicitly NOT calendar-gated) — thin slice of DG-078**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session).

**Problem:** The master plan's INC 1p — the first user-visible value of the point-in-time plane — has no in-season carrier: show, on the morning read / player card, what the model and market said at past capture dates, so belief drift is visible without waiting for realized outcomes. INC 1p's exit is "any player, any past date, both lanes, with receipts" (MASTER :618-625); a week-back and month-back default view is THIS ticket's suggested starting point, not spec-pinned. It needs no new capture path and no season data; only the archive that already exists.

**How we know:** SEASON-BRIEF.md:139 ("The self-consistency clock: 57 days of captures already answer 'what did you say then'…" — listed among the pre-plan value items, not calendar-gated); MASTER plan §7 (INC 1p, deliberately parallel because it is user-visible value). `grep -ril "self-consistency" ~/dg-build/tickets/` → nothing (2026-08-29).

**Done looks like:** A then-vs-now element with capture dates and honest gaps — an "as-of" receipt, never a smoothed trend over missing days. Read model over existing stores only.

**Depends on:** nothing to start — the archive runs daily since 2026-06-24 and DG-050 proved replay fidelity.

---

**Notes**
- **This is the thin now-slice of DG-078** (belief-archive read model, ratified L6 roadmap). Build it AS DG-078's first increment, not beside it — whoever claims this coordinates scope with DG-078's text so the off-season full build inherits rather than rewrites. Filed separately only so the board can see the in-season commitment.
- Candidate for the DG-091 rebuild's morning read — the Studio brief should know this exists before layouts settle.
