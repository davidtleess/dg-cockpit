# DG-096 — Replay the 39 historical trades: the spec's RPL-1..4 program has no ticket

**Layer:** 5  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **IN-SEASON wks 1-4 per the spec's own schedule (RPL-1 first)**
**Source:** filed 2026-08-29 night on David's delegation ("u decide" — recorded in IN-SEASON-QUEUE.md); corrected same night after adversarial verification.

**Problem:** REV2's arithmetic shows the forward decision ledger cannot reach statistical power this century at league trade volume, and the retrospective replay of the 39 real trades is the counter-move — "~13x the forward ledger's lifetime sample, gradeable today." The SEASON-BUILD-SPEC already scopes it as a four-part program: **RPL-1** (replay engine), **RPL-2** (route), **RPL-3** (panel), **RPL-4** (groundability bridge, 21→30), with the schedule "Build it in weeks 1-4 of the season. Start with RPL-1." But NO TICKET carries any of it — work the spec schedules for season weeks 1-4 is invisible to the board.

**How we know:** `docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:1571-1579` (the RPL program, with its measured ceilings: "all 39 trades, honest per-trade status — only 21 are fully groundable today" :1573; "Zero of 39 trades have a local point-in-time market snapshot; the PICK question may collapse the deliverable to ~5 usable trades" :1577; "Start with RPL-1" :1579). `docs/strategies/2026-08-20-dg-product-law-amendments-REV2.md:74` (the fatal forward arithmetic: completed trades 2023=12 / 2024=11 / 2025=9 / 2026=7), :88, :158-159 (:159 — check the pick fraction before scoping further). `grep -ril "RPL-1\|39 trades\|retrospective" ~/dg-build/tickets/` → nothing before this file (2026-08-29). Note: REV2:88's pointer "already scoped at MASTER…:550" is off by a section — the actual scoping passage is MASTER plan :569-572 ("the strongest thing shippable this month").

**Done looks like:** RPL-1 landed: both lanes replayed against all 39 trades with **honest per-trade status** — graded / partially groundable / not groundable — never a silent collapse to a clean subset. The pick-fraction measurement (REV2:159) then decides whether RPL-2..4 proceed. Reports filed under `docs/experiments/` like the DG-017 falsifier.

**Depends on:** DG-020 (landed) — it improved market DATE coverage (dp_archive monthly 2021-02→2025-06, FC daily from 2025-07) but does nothing for pick valuation or model-side groundability; the spec's ceilings stand until re-measured.

---

**Notes**
- This ticket carries the RPL-1..4 program onto the board; the spec text at :1571-1579 remains the build spec — read it in full before claiming.
- REV2:99's honest-scope framing binds every write-up: this is a durable record of what the lanes would have said, NOT "the road to decision_supported."
- Survivor-bias disclosure required: fc_history_api rows are a TODAY-anchored universe (label `fantasycalc_history_api_survivor_biased`).
- Name matching: check DG-054's frozen normalizer for staging-key use only (consumers stay unmigrated by law).
