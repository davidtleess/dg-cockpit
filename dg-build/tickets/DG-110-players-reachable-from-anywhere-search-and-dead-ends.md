# DG-110 — Players reachable from anywhere: global search and the remaining dead ends

**Layer:** 6  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-80053  ·  **DG 3.0**  ·  **frontend-only · DG-091 phase 2A**
**Source:** David's first-user verdict dimension 4 — *"hard to find things/clunky."* Direct
consequence of his words; builds without the phase-2B design answers.

**Problem:** Roster Audit — the surface listing ALL of David's players — has NO path to any
player's card (`shell/AppShell.tsx:175` passes no `onSelectPlayer` while `RosterAuditRow` already
renders the name as a button). Same dead end on Roster Capacity, League Pulse pools, QB context
cards, Trade Lab result lanes, and the front page's Entered/Exited chips and hero-basis name.
There is NO global player search: the only search box is Trade Lab's, and clicking a result
**adds the player to a persisted trade draft** as a side effect (`trade/TradeLab.tsx:73-81`,
`tradeState.ts:34-36`) — there is no inspect-without-adding path.

**Build:** (1) global player search in the shell reusing `trade/AssetSearch.tsx` against the
generic read-only `/api/trade/assets?q=` endpoint with `onSelect = selectPlayer` — zero backend
work, and it retires the draft-pollution defect; index players in the ⌘K palette too, and give
the palette a visible trigger + placeholder. (2) Pass the existing selection sink to every
surface that renders a player name. (3) Fix the empty inspector on first load
(`AppShell.tsx:73` `useState(true)` → `false`).

**Explicitly NOT in scope:** `?player=` URL addressability — it reverses a recorded deferral
("I3-owned", `useUrlSurfaceState.ts:2-4`) and is one of David's open decisions.

**Done looks like:** from every surface, a player's name opens the card; a global search finds any
tracked player from anywhere and never mutates a trade draft; vitest green; proven in a real
browser (click-path recorded per surface).
