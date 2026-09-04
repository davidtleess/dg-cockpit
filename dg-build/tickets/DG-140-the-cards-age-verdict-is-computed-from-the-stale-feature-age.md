# DG-140 — The player card's age verdict is computed from the feature-season age, so it contradicts the age printed beside it on 97 rows

**Layer:** 2 · **State:** open · **Lane:** Davids-MacBook-Pro-32886 · **DG 3.0** · **product truth · small-medium**
**Source:** DG-139's adversarial review, 2026-09-02 22:0x — found independently by all three lenses, reproduced by
five skeptics against the live artifact (`captured_at 2026-09-02T18:50:56Z`) and the snapshot it was built from
(`league-20260902T130044Z/snapshot.json`, `lineage.sleeper_snapshot_hash` matches, so the pairing is exact).

**Problem:** the artifact's age-derived evidence tokens are computed at the MODEL's feature-season age and never
recomputed. `pvo_assembler.py:226-240` builds `player = {..., **features}` and calls `audit_player(player)`;
`:340-345` turns `roster_audit.signal_drivers` into `top_drivers`; `universe_pvo_batch.py:224-225` copies
`top_drivers`/`risk_flags` onto the row verbatim; `players.py:364-365` serves them on the card beside the age at
`:333`. **Measured with the repo's own `audit_player` over all 12,227 rows: 583 rows carry an age cliff driver;
97 of them state a cliff verdict that is FALSE at the player's real age — 46 rostered, exactly one on David's
roster (Garrett Wilson, driver `age_not_near_position_cliff` computed at 25.0, real age 26, WR cliff 28).**
Transitions, every one understating age risk: 44 `not_near`→`within_two_years`, 33 `at_cliff`→`past_cliff`,
20 `within_two_years`→`at_cliff`. **33 players are past their position cliff and carry no
`age_past_position_cliff` risk flag.** `copy.ts:401-404,441-444` render these as prose, so the card can say
"Age is on his side — he is years away from the usual decline at his position" about a player who is past it.

**This predates DG-139 and is not caused by it.** The same 97 sentences are false today; DG-139 (`c62783b1`)
removed the stale age printed beside them, which is what makes the falsehood visible rather than hidden. The
roster audit row is NOT affected — it recomputes drivers from the live Sleeper player
(`roster_auditor.py:198,217`), which is why the card and the audit row already disagree about Wilson today:
card `age_not_near_position_cliff`, audit row `age_within_two_years_of_position_cliff`, `years_to_cliff` 2.

**⏱ TIMING — this is why it is urgent, not merely true:** the card serves the ARTIFACT, so nothing on it moves
until the next green `run_pvo_refresh` from trunk. **If this lands before the 09:00 chain, the card goes from
coherent-and-false straight to coherent-and-true and the contradictory pair never reaches the screen.** If it
does not, the 09:00 rebuild puts a true age beside a false verdict on 97 cards.

**Fix shape:** recompute the age-derived drivers/risk flags from the SERVED age at build time — at
`universe_pvo_batch.py:211` both ages are already in scope in the same expression, and `top_drivers` is copied
from the same `pvo` fourteen lines later. **Watch the import direction: `roster_auditor` imports `served_age`
FROM `universe_pvo_batch`, so importing `audit_player` back is circular** — pass the recomputed signals in from
the caller, or lift the cliff banding (`roster_auditor.py:62` `CLIFF_AGES`, `:515-531` the years-to-cliff bands)
into a module both can import. Do NOT duplicate the banding rule — two copies of an age law is the maintenance
hazard, not the fix.

**Anti-scope:** no change to any value, band, projection or model input; no change to the age itself (DG-139 owns
that and has landed); do not "fix" it by reverting DG-139 — that restores a false number to hide a false
sentence. Do not touch the roster audit row's driver path, which is already correct.

**Verify:** rows whose age driver disagrees with their own served age: 97 → 0; Wilson's card carries a
within-two-years verdict, matching his roster row; the 33 past-cliff players carry `age_past_position_cliff`.

**Landed 2026-09-03 06:53 by Tower (`dg-land.sh DG-140`), `32ceb8fb..6f517027`.** 6 files, none under
`frontend/`; suite 6816 passed / 33 skipped; OpenAPI byte-identical.

**Review — 3 lenses + 6 skeptics, 9 agents, 0 died. One blocking finding, FIXED before landing:**
- **`counter_argument` is a FUNCTION of `risk_flags`** (`pvo_assembler.py:623` -> `counter_arguments.py:15`,
  where `age_past_position_cliff` is the priority-1 branch). Restating the flags and copying the argument
  verbatim left 33 rows inconsistent and **dropped the mandatory counter-argument entirely on 16 of them**,
  against Product Constitution Rule 4. Fixed with `counter_argument_for()`, regenerating only when the flags
  actually moved. Measured 16 -> 0.
- **Crash risk introduced by the fix:** `int(age)` ran on Sleeper's uncoerced value inside the single
  artifact-build loop, so one bad value would abort the whole 12,227-row build. Guarded + pinned.
- **"The rule now lives in one place" was FALSE when written** — `roster_cut_engine.py` held a third
  `CLIFF_AGES` and `age_cliff` had added a FOURTH copy of the banding ladder while consolidating the
  constants. Both actually consolidated before landing; there is now one table and one ladder.
- Noted, not fixed (out of scope): `position` is still served model-first while team and age are Sleeper-first,
  so 4 rows compute the age band at the model's position (Bo Melton, served CB, loses a verdict true at WR).

**LIVE 2026-09-03 09:00:47** — the chain rebuilt the artifact from `league-20260903T130044Z`. Measured by Tower
on that artifact: age verdicts contradicting the served age **97 -> 0**; past-cliff rows with no
counter-argument **16 -> 0**; rows flagged past-cliff 108 -> 141; served age != Sleeper 0; served team != Sleeper 0.
Garrett Wilson serves age 26 with `age_within_two_years_of_position_cliff`.

**⚠ NEAR MISS worth keeping:** landing was NOT enough. The scheduled chain runs from trunk's checkout and
nothing pulls it; at 08:05 trunk was still `32ceb8fb`, so the 09:00 rebuild would have served DG-139's true ages
beside DG-140-less stale verdicts — the exact 97-card contradiction this ticket exists to prevent. Caught by
Fred (davidleess-45) at 08:04; David ran `git pull --ff-only` himself at 08:06.
