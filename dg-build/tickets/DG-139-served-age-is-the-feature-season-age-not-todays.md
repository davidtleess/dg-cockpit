# DG-139 — The served age is the model's feature-season age, not today's: 324 players read a year young, 255 of them scored, Garrett Wilson among them

**Layer:** 2 · **State:** open · **Lane:** Davids-MacBook-Pro-32886 · **DG 3.0** · **product truth / identity · small**
**Source:** DG-130 scope reader (2026-09-02 15:20, side finding on Wilson's row); re-measured by Tower on the live artifact (`universe_pvo_runtime.json` 14:50:57) vs the 13:00Z Sleeper snapshot; ticketed 2026-09-02 15:32 by Tower. DG-137's bug in a second coat.

**Problem:** `src/dynasty_genius/universe_pvo_batch.py:198` sets
`"age": (pvo or {}).get("age") or player.get("age")` — the PVO's age is the FEATURE-ROW age
(`pvo_assembler.py:583` `age=features.get("age")`, i.e. the player's age in the 2025 feature season),
and Sleeper's current age is only the fallback. Measured: **324 of 10,977 rows with both ages disagree,
all by exactly one year; 255 of the 324 are scored rows (of 468).** Both display surfaces prefer the
artifact: the player card (`app/api/routes/players.py:333` `age=player.get("age")` →
`PlayerDetailCard.tsx:32` "{position} · {team} · age") and the roster audit
(`app/services/roster_auditor.py:240` `age=player.get("age") or live_player.get("age")`). On David's
roster today: Garrett Wilson served **25.0**, Sleeper 26; Braelon Allen **21.0**, Sleeper 22.

**The row contradicts itself:** the age-cliff lane on the same audit row (`roster_auditor.py:172`
`audit_player(player)` on the LIVE Sleeper player) uses 26 — so Wilson's row says age 25 AND
"2 years to the 28 cliff" (`years_to_cliff=2, cliff_age=28`), and the artifact's `top_drivers` says
`age_not_near_position_cliff` while the audit says `age_within_two_years_of_position_cliff`. Two
ages on one row; the one that is printed is the wrong one.

**Fix shape (DG-137's rule, one place):** the served age is a *roster* fact, not a *model* fact.
Prefer Sleeper's age at `universe_pvo_batch.py:198` and `roster_auditor.py:240`; keep the feature
age only as model context (rename `feature_age` if it must stay on the row). Unlike team, a plain
`or` is right here — Sleeper `age: None` means unknown, not "no age now", so the model's age is an
acceptable fallback (say so in a comment). Contract test: a row whose Sleeper age differs from its
feature age serves Sleeper's; the roster row's `age` and `years_to_cliff` agree.

**Anti-scope:** no change to any model input — the feature table's age is correct FOR THE FEATURE
SEASON and must stay (Engine A `score_prospect(... age)` reads features, not the artifact); no change
to the value or the band; not the cliff math. `player.age` is likely in the capture's semantic
projection like `team` was → expect one `vintage_changed: true` flip on the first rebuild, nothing
gates on it.

**Verify:** artifact rows where served `player.age` ≠ snapshot age: 324 → 0 (or → only rows where
Sleeper has no age); Wilson's card reads 26; his roster row's age and cliff distance agree.
