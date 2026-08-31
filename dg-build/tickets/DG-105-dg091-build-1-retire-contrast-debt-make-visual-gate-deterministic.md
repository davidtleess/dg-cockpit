# DG-105 — DG-091 build 1: retire the contrast debt and make the visual evidence gate deterministic

**Layer:** 6  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-60710  ·  **DG 3.0**  ·  **frontend-only · DG-091 program (David: "start building", 2026-08-29 night)**
**Source:** DG-090 Problem B (transferred here via DG-091) + the 08-29 night discovery that the
daily-open axe assertion (frontend/e2e/visual-smoke.spec.ts:453) is NONDETERMINISTIC — 3 pass /
4 fail over 7 same-tree runs; failures report ~39 serious color-contrast nodes (measured fg
`#767a7e` on `#161c21` = 3.97:1 @13px). Note the rendered fg differs from the declared
`--dg-text-muted` value — find the dimmer (candidates: the `dg-wc-settle` opacity entrance
animation DailyWhatChanged.css:283-291 sampled mid-run; the `.dg-wc--stale` saturate filter
:319-321) before retuning anything blind.

**Problem:** (a) the shipped dark canvas carries light-theme raw literals that never flip —
`trust/TrustConsole.css` (26 raw oklch, text down to 1.53:1), `roster-capacity/
RosterCapacitySandbox.css` (9 raw hex, body text 1.25:1), `trade/TradeLab.css:55`,
`project/ProjectTracker.css:12` (`#d18`, the only red-family literal, evades the token hue
ban); (b) the token pair behind DG-090's 46-node census (`--dg-text-muted`) needs headroom;
(c) the evidence gate that must prove all of this is a coin flip, so nothing can be proven.

**Scope (this ticket):** convert those literal-painted surfaces to tokens (EXCLUDING
player/PlayerDetail.css + ValuationTwoLane — those are DG-043's, in flight tonight); retune
`--dg-text-muted` (and settle `--dg-caveat`'s text-usage question) so the debt clears; make
the visual-smoke daily-open run DETERMINISTIC (run axe after animation settle and/or under
prefers-reduced-motion — never by excluding the color-contrast rule); prove it.

**Contracts to land inside:** tokensI1 fallback pinning (every `var(--dg-X, fallback)`
string-identical to `:root` — update fallbacks in the same change); rawCssAuditBaseline.json +
visualCraftAuditBaseline.json exact-equality (regenerate in the same change, and again after
any dg-land rebase over DG-043's land — both tickets shrink the same census); tokens.test.js
hue bans; uiCssContract.

**Done looks like:** the daily-open evidence bundle passes **7 consecutive full runs** (no
overflow at 1440/390, axe `[]`, screenshots archived) on a clean tree; every converted surface
reads ≥4.5:1 on the shipped dark canvas; vitest suite green.

**Depends on:** nothing (coordinates with DG-043 on the shared baselines at rebase time).
