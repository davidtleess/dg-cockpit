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
- **Sequencing per David's 08-29 frontend ruling:** this gate lands AFTER DG-104 re-scopes the banned-language checks, so it never blocks the green-lit language. (DG-104 landed 08-30 `67cf9f8b`, so this is unblocked.)
- **⚠ AMENDED 08-30 — the axe flake is dead, but read HOW.** DG-105 landed and the daily-open axe assertion now runs 0/10 failures. It achieves that partly by running the evidence bundles under `prefers-reduced-motion`. So a Playwright slice added to this gate **covers the reduced-motion path only** — it is not general visual coverage, and the gate's own message must say so rather than implying the UI is fully guarded. State the scope explicitly or a future reader will trust it further than it deserves.
- **⚠ Measurement hygiene, learned 08-30 the hard way:** a load test's 36 orphaned busy-loops sat at ~45% CPU each for 90 minutes (load average 63) and made `/api/health` take 8.75s. Any timing-sensitive gate — and any perf number — measured under that is worthless. If this gate ever grows a timing assertion, it must check machine load first and refuse rather than fail.
