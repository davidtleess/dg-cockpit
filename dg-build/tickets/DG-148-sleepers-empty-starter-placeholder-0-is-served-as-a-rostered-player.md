# DG-148 — Sleeper's empty-starter placeholder "0" is served as a rostered player

**Layer:** 3 (producer: league snapshot) · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **product truth / data · small**
**Source:** DG-145 adversarial review (data-correctness lens), 2026-09-04 00:1x ET, reproduced by two refuters and by Bob
on the served artifact; filed 09-04 07:5x ET by Bob (`davidleess-08 [b202b7]`) at Greg's request. Unassigned.
**⛔ Producer path:** `src/dynasty_genius/sleeper_universe.py` writes the league snapshot the 09:00 chain consumes. Post-chain
only, and not without David's word to touch a producer. This ticket is the record.

**Problem:** Sleeper fills an EMPTY starter slot with the string `"0"`. `_build_roster_context`
(`src/dynasty_genius/sleeper_universe.py:95-98`) unions `starters | taxi | reserve | players` and filters with `if pid`, which
`"0"` passes. So a phantom player `sleeper_player_id "0"` is written into the snapshot and the universe artifact as
`rostered: True, in_starters: True`, owned by whichever roster with an empty slot is processed LAST — today roster 9
(Dseidman). It is one of the "274 rostered" rows, it is `UNRESOLVED_IDENTITY` (no name, no position), and since DG-145
`GET /api/players/0` returns 200 with `league_ownership {status: rostered, owner_display_name: "Dseidman", roster_id: 9}`.

**How we know (2026-09-04 07:4x ET, read-only):** league snapshot `league-20260903T130044Z/snapshot.json`: roster 1
(David) has `"0"` in **7 of 9** starter slots, roster 9 in **1 of 9**; `"0"` is in NO roster's `players` list.
`universe_pvo_runtime.json` (18:00Z 09-03): exactly one row with `sleeper_player_id == "0"`: `player` all null,
`dg_status UNRESOLVED_IDENTITY`, `league_context {rostered: True, in_starters: True, roster_id: 9, owner_display_name:
"Dseidman"}`. `curl -s :8000/api/players/0` → 200, identity all null. It is the only `UNRESOLVED_IDENTITY` row among the
274 rostered (rostered by engine_path: ENGINE_B 219 / ENGINE_A 44 / PRE_MODEL 10 / UNRESOLVED_IDENTITY 1).

**Why it matters:** every "rostered" count in the product (274; `coverage.rostered_skill_players_missing_route`; the
trade catalog "rostered-players-plus-picks"; League Pulse roster sizes) is off by one, attributed to the wrong manager,
and the placeholder is reachable as a card. Harmless today; a real-name identity resolution on `"0"` would not be.

**Done looks like:** `_build_roster_context` defines rostered from `players | taxi | reserve` and treats `starters` only as
a flag on players already rostered (a starter that is not in `players` is a placeholder, not a player); `"0"` is dropped
explicitly with a comment naming Sleeper's convention; a unit test with a roster whose `starters` carry `"0"` asserts no
`"0"` key in the context and `in_starters` still True for the real starters; after the next 09:00 chain the runtime
artifact has no row `"0"` and rostered == 273 (or whatever the league truly holds); `GET /api/players/0` → 404.

**Anti-scope:** no change to the served-team, age or ownership rules; no frontend change.

**Depends on:** David's word to touch a producer (his standing guard on producers); land post-chain.

---

**Notes**

**AUTHORIZED** — David, 2026-09-04 19:34:46Z (15:34 ET), verbatim in his own bare message (verified at source, not
from a relay): *"Yes, you have permission to touch a data capture."*

**Acceptance — LANDED `144f1dfc` 2026-09-04 ~15:5x ET by Bob (`~/dg-build/bin/dg-land.sh DG-148`).** Backend 6,950.
**Takes effect on the next SCHEDULED capture — no manual refresh** (a same-day re-capture costs the morning
comparison; see the DG-137 lesson). Idempotent by construction: the capture writes a new run directory each time and
`_build_roster_context` is a pure function of the roster payload.

**⚠ THE COUNT MOVES AND IT IS NOT DATA LOSS.** Measured on the 2026-09-04 13:00 capture:
**rostered ids 274 → 273**, and the single id that goes is `"0"` — nothing else. The placeholder appears **8 times,
all in starter slots, in no roster's `players` list**, and it is the ONLY id anywhere in starters/taxi/reserve
missing from `players` across all 12 rosters. Anyone reading a 274→273 drop in a future report should read it here.

**One deliberate departure from this ticket's "Done".** It said membership should be defined from
`players | taxi | reserve` with starters as a flag. Membership KEEPS THE UNION and only the placeholder is excluded.
The tidier rule gives the identical answer on every roster today, but a real player who ever appeared only in a
starter slot would then vanish silently from David's roster — a far worse failure than the one visible junk row this
removes. The reason is in the code beside the choice.

**Tests red first: 3 of 6.** The placeholder in a starter slot creating no row; never taking a manager's name (it was
attributed to whichever roster was processed last, so the phantom CHANGED OWNER as roster order changed); ignored in
every list it can appear in. Also pinned green: a real starter keeps his flag and his roster, a player listed only as
a starter is still rostered (the union, guarded), and falsy ids are still ignored.

**Knock-on, measured on the 18:00 artifact 09-04:** the phantom was one of the **3** cards that print "FA" in the NFL
slot directly above "Rostered by <manager>". After the next capture that is **2** — Tyreek Hill and Austin Ekeler,
both Dseidman's. Those two are a real contradiction on any reading and are held pending David's ruling on which
instance of "FA" is the wrong one (see DG-150 / the third-FA question).
