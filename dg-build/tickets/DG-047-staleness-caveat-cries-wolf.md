# DG-047 — The morning report's staleness caveat cries wolf, training David to skip caveats

**Layer:** 6  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG047-20260826  ·  **DG 3.0**
**Source:** 2026-08-26 six-layer completion audit (L6 auditor); threshold verified same day.

**Problem:** `src/dynasty_genius/what_changed/report.py:54` sets `_STALE_THRESHOLD_HOURS = 24.0`
on artifacts that refresh on a 24-hour cadence — a razor-thin margin, so ordinary same-slot
timing jitter flags healthy artifacts as stale. The audit measured the caveat firing ~6 mornings
out of 7. The caveat channel is the SAME channel a real SR-11-class failure would use to reach
David inside the product; months of false staleness teach him to skip exactly that channel.
The whole honesty-markup system only works if a caveat is rare enough to mean something.

**How we know:** report.py:54 read 2026-08-26 (threshold + its comment); firing frequency is the
L6 auditor's measurement — re-measure across a week of reports before choosing the new margin.

**Done looks like:** the staleness caveat fires only on genuinely-late artifacts (threshold =
cadence + a grace that absorbs same-slot jitter, e.g. the 26h bound SR-11 uses for marker
freshness — align, don't invent a third convention); a week of healthy mornings produces ZERO
staleness caveats; a deliberately held artifact still produces one.

**Tier:** small product-code change, Tier-3-shaped polish — pre-freeze only if slack allows,
otherwise week 1 of season. **Edge distance: ENABLER** — protects the trust channel every future
edge signal must travel through.

---

**✅ BUILT AND LANDED 2026-08-26 ~15:00 (merge on `main` via dg-land, trunk pulled), on David's
"keep filling the layers."** The audit's diagnosis sharpened on live evidence: the 6-of-7 firing
is NOT daily-threshold jitter — it is the flat 24h threshold applied to `league_opportunity`,
a TUESDAY-ONLY producer (today's live report: age 24.2h → stale TRUE on an artifact exactly as
fresh as its producer can make it). This is spec SR-20's substance verbatim, so the fix followed
SR-20's five steps exactly: `_section_envelope` gains per-section threshold+basis (defaults =
daily behaviour byte-for-byte, existing contract pins untouched), weekly section judged at
7d+3h=171.0h with basis `captured_at_vs_weekly_producer_cadence`, and a genuinely-late weekly
artifact (Tuesday job failure — what the 09-01/09-08 exercises watch) STILL flags. 4 tests
RED-first; 19/19 both what-changed suites; frontend renders the new basis verbatim, no regen.
**SR-20's D10 (Thu 09-03) slot is now FREE — record in sprint planning.** The ticket's original
"widen the daily threshold to 26h" guess was WRONG and was not applied — dailies stay 24.0h.
