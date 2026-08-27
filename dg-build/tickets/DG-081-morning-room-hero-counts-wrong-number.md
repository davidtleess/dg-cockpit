# DG-081 — The Morning Room headline counts a number David does not act on (SR-16)

**Layer:** 6  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG081-20260826  ·  **DG 3.0**
**Source:** season spec SR-16 (docs/strategies/2026-08-20-dg-SEASON-BUILD-SPEC.md:1335, draft
MR-3, re-aimed PT-6). Sprint-committed Tier 0, calendar slot D10 (Thu 09-03) — **pulled forward
to the evening of D4 (08-26) on David's "go ahead with SR-16"**, same safety profile as DG-080:
pure frontend, invisible to Thursday's morning checks, disjoint from ticket/DG-045.

**Problem:** the hero on the surface David reads every morning is
`top_movers.length + roster_deltas.length + model.deltas.length` (DailyWhatChanged.tsx:304-307)
— a list-length sum, not a number he acts on. Revision 1's "fix" (league-wide
`total_movers_count` = 456) is a bigger number, not a better one: 400-something every morning
is wallpaper by week three. The same payload already carries the number he DOES act on: his own
roster's movers (`daily_diff.market.roster_deltas`, filtered to `value_delta !== 0` — the spec's
precision point: `.length` alone counts flat rows too and reinvents the wallpaper).

**How we know:** spec's live-report measurement (26 roster rows, all moved; hero rendered 51 =
25+26+0); code re-read 2026-08-26 19:1x matches spec exactly (moveCount :304, ValueHero :334,
quietDay :324, MarketRegion :446). ValueHero props are `{label, value, basis}` strings — no
component change, no new CSS.

**Fix (spec steps 1–5):** hero = count of `roster_deltas` rows with `value_delta !== 0`; label
"Your roster moved"; basis names the largest mover by |delta| ("N of your players; largest
<name> +<delta>"), or "no movement on your roster since the prior snapshot" when empty. Keep 456
as an honest secondary line under the league list ("Showing 25 of 456 market movers
league-wide"), and when `total_movers_count` is nullish render "Showing 25 market movers" —
never a total it does not have. Repoint `quietDay` at the roster-derived count and amend its
copy so it still reads true ("on your roster"). Three strings and a filter — no new section,
chart, or component.

**Done looks like:** spec's three test cases (a) 26 non-zero → hero 26 + largest name + "Showing
25 of 456"; (b) 20 of 26 flat → hero 6, not 26; (c) `total_movers_count: null` → no invented
total — case (b) and the hero rewrite watched RED first; existing quiet-day pin amended with the
truthful copy; full frontend gate green; land on `main` through dg-land.

**Tier:** 0. **Edge distance: DIRECT-adjacent trust repair** — the biggest number on the morning
surface becomes one about HIS team, with the biggest name beside it.

---

**✅ BUILT AND LANDED 2026-08-26 ~19:15 ET — merge `c606fc53` on `main`, trunk pulled same minute.**
David's "go ahead with SR-16" (~19:07). TDD per spec: all three cases watched RED first (the
"Your roster moved" label absent under old code, 15 existing tests untouched); revert re-proven
after final staging — 4 fail on old code (the 3 new cases + the amended quiet-day copy pin).
Implementation is spec steps 1–5 exactly: hero = roster rows with value_delta !== 0 (the
precision point — .length counts flat rows), label "Your roster moved", basis names the largest
mover by |delta|, league total kept as an honest truncation line under the league list, nullish
total never invented, quietDay roster-derived with its copy re-scoped to stay true. No new
component, section, or CSS token (reused dg-wc__overlay-note). Live-report check at build time:
tomorrow's hero would read **27, largest Chimere Dike** (total_movers_count 450, 25 league rows
shown). Full frontend gate green; dg-land full pytest gate passed. Spec marks pushed
(`08fee647`): SR-16 done AND the overlooked SR-20 done-mark from this afternoon's DG-047.

**SR-16 is closed. D10 (Thu 09-03) is now fully freed to buffer.**
