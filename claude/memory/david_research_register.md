# David's Research Register — Tower's intake ledger

Standing duty (David's word, 2026-07-17): Tower tracks every research document David sends
and verifies it reaches the team. A doc is CLOSED only when it is (a) filed on disk in the
product repo, (b) synthesized/read by the crew, and (c) its downstream action is either
running or explicitly parked with a named gate. Check this register at every boot and every
closeout; chase anything not CLOSED.

| # | Doc | Filed | Crew delivery | Downstream state |
|---|-----|-------|---------------|------------------|
| 1 | QB prediction research (`docs/strategies/2026-07-16-david-qb-prediction-research.md`) | 2026-07-16, committed d3c4534, pushed | 3-lane synthesis v3 (`2026-07-16-qb-research-synthesis.md`) | **ACTIVE** — fed QB-1 spec (now v8 w/ Amendment A); GREEN slice 2 SHIPPED 07-18 (`8e6b209`, CI green); slices 3+ next |
| 2 | QB valuation research (`docs/strategies/2026-07-16-david-qb-valuation-research.md`) | 2026-07-16, committed d3c4534, pushed | same synthesis | **ACTIVE/PARTIAL** — validation program running; valuation engine itself (increment 2: DCF formula, discount slider, buy/sell surfaces) NOT authorized — market-input + no-verdict corrections applied; awaits David's word after QB-1 |
| 3 | WR / Reception Perception recommendation (`docs/strategies/2026-07-16-david-wr-reception-perception-recommendation.md`) | 2026-07-16, committed d3c4534, pushed | 3-lane synthesis (`2026-07-16-wr-rp-synthesis.md`), no divergences | **PARKED** — map ready (WR-1 study → RP Phase-2 behind new-source escalation → Phase-3 conviction overlay); opens only on David's word; sequencing QB-1 → Morning Tape → League Pulse |

Corrections the crew applies to ALL of David's research docs (standing, from both syntheses):
- Market values (KTC/FC/DP) are never model inputs — comparison/overlay only.
- Buy/sell verdict outputs banned at runtime (no-verdict line); vision language only.
- KTC itself remains ruled out (2026-05-30) — reopening is David's named decision.
- Stack is nflreadpy (not nfl_data_py as the docs say).
- Doc status headers like "Approved direction" mean synthesize-only, never build authorization.

Tower read log: QB pair + WR doc + both syntheses read in full 2026-07-17/18 session.
