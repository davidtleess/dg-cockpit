# DG-102 — The land gate is blind to frontend breakage

**Layer:** process  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**  ·  **PRE-FREEZE buffer (hours; dg-build tooling, not product code)**
**Source:** filed 2026-08-29 night on David's delegation ("u decide", gap-audit session); gate read first-hand that night.

**Problem:** `dg-land.sh` gates a land on `"$PY" -m pytest -q` alone (`bin/dg-land.sh:92`) — the frontend suite is invisible to it. Proven consequence: the frontend suite sat red on main from 08-28 to 08-29 and was only caught inside DG-086's land (BOARD.md DG-086 row: "frontend-suite-red-since-08-28 fixture repaired"). Post-freeze emergency lands and the season-weeks-1-2 frontend program (DG-091/DG-093) would run through a gate that cannot see UI breakage.

**How we know:** `grep -n pytest ~/dg-build/bin/dg-land.sh` → :92, read 2026-08-29. BOARD.md DG-086 row for the red-suite incident.

**Done looks like:** dg-land runs the frontend gate (vitest + governance lint — e.g. `npm run gate`) whenever the ticket's diff touches `frontend/` (always-on acceptable if runtime stays sane); `tests/test-dg-land.sh` (the 21-check hermetic harness) extended to prove BOTH the fire path and the skip path; a deliberately red frontend fixture cannot land.

**Depends on:** nothing. Coordinate the land itself: dg-land is the shared landing path — change it when no other lane is mid-land, and run the extended test harness green before the new gate guards anyone's work.

---

**Notes**
- Keep the failure message as loud as the pytest one (":94 error: tests failed after rebase. Not merging." has the right shape).
- Node/npm availability inside the land environment is the likely gotcha — the backup.sh verify abort of 08-27 was an nvm PATH problem of exactly this class; test for it explicitly.
- **⚠ AMENDED 08-29 late (from the DG-090A land, night lane):** the daily-open axe assertion (`visual-smoke.spec.ts:453`) is NONDETERMINISTIC on main — 3 pass / 4 fail over 7 same-tree runs (failures report the real ~39-node contrast debt). **Gate on `vitest` ONLY (311/311 stable) until DG-091's visual pass retires the debt or the run is made deterministic** — wiring `npx playwright test` in now would coin-flip every land. Full record in DG-090's ticket.
- **Sequencing per David's 08-29 frontend ruling:** this gate lands AFTER DG-104 re-scopes the banned-language checks, so it never blocks the green-lit language.
