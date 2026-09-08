---
name: project_dg184_market_ranks_frontend_2026-09-07
description: "DG-184 \"Us vs market\" rank comparison built 2026-09-07 in ~/dg-wt/DG-184 (frontend, not committed) — David's new product direction, the seam that preserved legacy, and the traps it cost."
metadata: 
  node_type: memory
  type: project
  originSessionId: fa00374f-ec34-45ea-9ec0-926acc034407
  modified: 2026-09-07T11:55:11.238Z
---

**DG-184 built 2026-09-07 ~11:24–11:53Z** in `~/dg-wt/DG-184` (branch `ticket/DG-184` from
`8960e0ec` + root's frozen DG-180 overlay via `/private/tmp/dg183_apply_baseline.py`). Handoff
`/private/tmp/dg184-handoff.md`, status `/private/tmp/dg184-status.md`. **Not committed**; root
(Codex, DG-183) integrates and serves preview 8789. Brief: `~/dg-build/MODEL-MARKET-RANKS-BUILD-2026-09-07.md`.

**⭐ THE PRODUCT DIRECTION David approved 11:15:18Z (rollout line 1434):** *"yes that's the core of
the comparison i want to make us v what we think our competitors value a player at"* — answering
"rank versus rank first", which REPLACES the older 0-100 score as the main valuation on the real
roster page and player card. His 10:44Z framing is the why: *"our model versus the fantasy calc
stuff… there's nothing that normalizes the comparison. It's apples vs oranges."* So an h5 rank
displayed BESIDE a different model's number is the bug, not the fix.

**Numbers from the frozen inputs (acceptance facts):** 825 model rows · 399 market players + 24
picks · **388 common** · 836 union · 27 roster, **26 comparable** (Rasheen Ali has no FC price) ·
**159 common rows tie at 230–388 because our five-year value is exactly 0** — one structural tie,
never 159 opinions. Roster directions actually fall 11 higher / 12 lower / 3 overlap / 1 unavailable
and **zero "same"**, so any "same" case in a fixture must be marked synthetic.

**Why:** the seam that made this safe is worth reusing — the provider lives in `App.tsx`, and the
context default with no provider is `not-configured`. That is why all nine AppShell-mounting test
files and every legacy component test needed **zero edits**, and why legacy preservation is proved
rather than asserted. The legacy `/api/roster/audit` fetch was moved into a `LegacyRosterAudit`
child so it does not fire at all in the new mode.

**How to apply:**
1. A new App-level fetch breaks `frontend/e2e/visual-smoke.spec.ts` — its `assertEveryReadFixtured`
   catch-all fails ANY surface reading an unfixtured `/api/` endpoint, and a shell-level fetch is on
   every surface. Add one entry to `SHELL_ROUTES`. It is not in `npm run gate`, so the gate stays
   green while the browser gate would fail everywhere.
2. `npm run visual:smoke` takes port 4173 with `strictPort` — do NOT run it while other lanes work.
3. `JSON.parse('1e999')` is `Infinity` and passes `z.number()`. Guard finiteness at the boundary or
   an overflowed value reaches the screen.
4. `biome-ignore` for `useSemanticElements` must sit on the line BEFORE the JSX element, never above
   the attribute (second time this cost time — see [[project_dg181_roster_comparison_frontend_2026-09-07]]).
5. New `.css` under `src` needs a row in BOTH `rawCssAuditBaseline.json` and
   `visualCraftAuditBaseline.json`; compute with the tests' own regexes.
6. `detail.identity.name` is nullable in the generated types.

⛔ Do not colour the disagreement with `--dg-up`/`--dg-down`: "we rank him higher" is a disagreement
about price, not a good/bad direction, and verdict hues remain banned. Lane hues (blue = ours,
amber = market) say only whose number it is. Related: [[david_rulings_dynasty_asset_number_2026-09-05]].
