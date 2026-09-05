# DG-147 — A rookie the league did not draft gets no number and no "Rookie" word on the roster, while his card scores him

**Layer:** 3 (+6) · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **product truth / coverage · small-medium**
**Source:** DG-146 review panel, honesty lens, 2026-09-04 00:1x ET, confirmed by both refuters and reproduced by Greg;
filed 09-04 00:3x ET by Greg (`davidleess-eb [a78c76]`). Unassigned.

**Problem:** the roster route admits a rookie-model (ENGINE_A) universe row only when `league_context.in_current_draft`
is True (`app/services/roster_auditor.py:176-183`) — picked in THIS league's 2026 draft. A 2026 rookie acquired off
waivers or onto a taxi squad is dropped from the index and falls to the fallback assembler (`:732`), whose
`is_prospect` defaults False (`pvo_assembler.py:269`): his roster row prints "Not scored yet", a blank value and no
"Rookie" word — while the player card (`app/api/routes/players.py:325-353`, no draft gate) says "Scored by the rookie
model" with his ENGINE_A number. `is_prospect` itself is derived (`is_veteran = engine_path in {ENGINE_B, BLEND_AB}`;
`is_prospect = not is_veteran`, `:220/:260`), and `draft_class` is null on all 27 served rows (never copied from the
universe row, though `PlayerValueObject` carries it).

**How we know:** read-only python over `app/data/valuation_runtime/universe_pvo_runtime.json` (captured 2026-09-03
18:00:02Z): 80 ENGINE_A rows, all draft_class 2026 / years_exp 0; rostered × in_current_draft = {(T,T): 36, (F,F): 36,
(T,F): 8}. The 8 rostered-but-not-drafted rookies: Caleb Douglas, Matthew Hibner, Malik Benson, Justin Joly, Cyrus
Allen, Bryce Lance, Eli Raridon, Seth McGowan (5 on taxi squads; owners rkissane / jspringe88 / jkazzz / rzalika; none
on David's roster). `curl -s :8000/api/roster/audit` → `draft_class` None on 27/27.

**Why it matters in-season:** the first rookie David picks up off waivers shows a blank and "Not scored yet" on his
roster and a number on the card — the exact contradiction DG-130 named, on a path DG-143 does not touch.

**Done looks like:** the roster index admits an ENGINE_A row for any ROSTERED rookie, not only a drafted one;
`is_prospect` keyed on the universe row's draft class (== the current season) / `years_exp == 0`, not on the engine
path; `draft_class` served on the roster row; a contract test with a rostered-not-drafted 2026 rookie fixture goes red
on trunk and green after; the 8 players above carry a number on their owners' rosters at the next refresh. DG-146's
word then rests on a player fact with no frontend change.

**Anti-scope:** no change to who the rookie model scores or how; no card change; nothing under `.oa3`.

**Depends on:** DG-146.

---

**Notes**

**Acceptance — LANDED `c7ac3484` 2026-09-04 08:0x ET by Bob (`~/dg-build/bin/dg-land.sh DG-147`).** Built `f1da0029`
+ review fix `e8ee6c11`. **NOT live** (trunk `6f517027`; needs the pull + build + restart on David's word).

Three seams as specified: the index admits an ENGINE_A row for any ROSTERED rookie (measured on the served artifact:
255 → 263, and the newly admitted rows are exactly the eight named above, nothing else); `is_prospect` is Sleeper's
`years_exp == 0`, with the engine standing in only when Sleeper never said; `draft_class` rides the roster row.
Verified through the ROUTE, not only `run_audit_pvo`: `draft_class` is in `_SCALARS` and `map_player` copies it, so
the served row carries 2026 where it carried null. All 44 rostered ENGINE_A rows are `years_exp` 0; no rostered
non-ENGINE_A row is; David's four rookies were already drafted in-league, so his screen is unchanged. Backend 6,850;
frontend gate 639.

**Adversarial review: 3 lenses ran, EVERY verifier died on the account spend limit** (21 of 29 agents lost). The two
should-fix findings were judged inline against the code and the data, and both were real:
- **Fixed.** Routing a fallback rookie through the ROOKIE contract made the backend emit *"Engine A (prospect) not yet
  validated"*, while `copy.ts` matched the token prefix and returned ONE fixed sentence blaming the ACTIVE-PLAYER
  model — the screen named a model the backend never consulted. The dictionary now answers the Engine A variant with
  the honest fact (*"the rookie model has not scored him"*) and keeps the active-player wording for Engine B. This is
  the sentence on the first waiver rookie David adds: 364 of the 400 free-agent 2026 skill rookies have no
  rookie-model row.
- **Fixed.** The universe path read the ARTIFACT's `years_exp` while team and age two lines above read the LIVE
  Sleeper row (DG-137 / DG-139). The live row now wins, artifact as fallback; pinned both ways.
- Note, unbuilt: DG-146's comments still describe the flag's source as the draft class. Cosmetic, in DG-146's file.
