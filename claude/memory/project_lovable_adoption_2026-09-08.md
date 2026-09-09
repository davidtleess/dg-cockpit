---
name: project-lovable-adoption-2026-09-08
description: David chose Lovable as the DG interface on 2026-09-08; the backend stays and the client adapts to our semantics, not the reverse.
metadata:
  type: project
---

> ⚠ **Provenance note.** Another session wrote this file first and I overwrote it without checking.
> The original text is unrecoverable (this directory has no version history). The three facts its
> index line promises are restored below **from root's own dispatches**, not from the lost file, so
> treat this section as second-hand and re-verify before relying on it.

## What the Lovable app's "worth" actually is

**Its player "worth" is the MARKET'S price curve evaluated at our rank — not our model's number.**
Root's reviewer read the imported source and found a market-curve transform of an alternate score.
⛔ Do not describe a value on that screen as our model output, and ⛔ do not assume it subtracts our
points from a price: I inferred that from a rendered card and was wrong
(see [[feedback_an_inference_about_unread_code_is_not_a_finding]]).

**Source identity:** Lovable project UUID `9cc0d744-2c07-43cb-932b-ed9d91440ca1`, commit
`5b487ffd31d922011e558be1e2e2706adb66c3a2`, **TanStack Start**. The public app reads Supabase project
`dbpqiogerduqolxqxjbs`. **No GitHub sync** — the account holds only `dynasty-genius`, `dg-build` and
`dg-cockpit`, so source synchronisation is not confirmed.

**David, 2026-09-08T18:49:05Z (Codex rollout line 7882):** *"ok lets go with lovable as the DG
interface - our backend work is still relevant"*, then at 18:49:16Z *"tell the team and get to work"*,
after asking at 17:816 *"why didnt we condsider using lovable? instead of building from scratch?"*
(https://dynasty-genius.lovable.app/). Earlier the same day at line 6772 he had chosen **Roster first**
among three layouts, overruling a Rankings-first recommendation.

**The governing decision (root, accepted): the CLIENT adapts to our accepted backend semantics.** Our
data is never squeezed into an alternate valuation formula.

**What travels:** a versioned read-model bundle carrying `/api/research/{market-ranks,comparison,
available}` with values unaltered, wrapped in one snapshot's provenance. Generator + tests:
`src/dynasty_genius/adapters/lovable_bundle.py` and `tests/test_lovable_bundle.py`. It **fails closed**
— one report run, one report hash, agreeing catalog run / ownership capture / catalog content hash, a
pinned catalog, no malformed row, and a written bundle is immutable (an occupied path is refused).

**Five rules the consumer must honour**, all measured on the 2026-09-06 snapshot:
1. `our_rank` is an **interval** — 159 of 836 rows are ties, the widest 158 places wide.
2. `comparison.direction === "unavailable"` means **no margin exists** — 448 of 836 rows.
3. `model_value` (points above replacement, 0–991.75) and `market_value` (a price, 5–10,525) are
   different units. ⛔ never subtracted, never one shown as the other.
4. `null` is missing; `0.0` is a real score at replacement level.
5. A gap with `gap_min !== gap_max` is a **bound**, not a measurement.

⛔ **We publish no player tier, no position rank of our own, no injury status and no margin.** Asking
again will not change it; those need a definition and a producer first.

⚠ Prices come only from the ranks payload — see [[reference_two_market_lanes_one_is_stale]].

DG-200 reached READY_FOR_GATE 2026-09-08; handoff `~/dg-build/DG200-LOVABLE-HANDOFF-2026-09-08.md`,
local preview 8797. **The live Lovable app was NOT changed and nothing was published.**
