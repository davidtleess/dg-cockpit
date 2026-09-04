# DG-139 — The served age is the model's feature-season age, not today's: 324 players read a year young, 255 of them scored, Garrett Wilson among them

**Layer:** 2 · **State:** landed `c62783b1` 09-02 22:18 · **Lane:** — · **DG 3.0** · **product truth / identity · small**
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

**Built + landed 2026-09-02 21:40–22:18 on `ticket/DG-139` (Tower), `~/dg-build/bin/dg-land.sh DG-139`:**
```
 app/services/roster_auditor.py                   |   6 +-
 src/dynasty_genius/universe_pvo_batch.py         |  15 ++-
 tests/contract/test_served_age_is_sleepers.py    | 115 ++++++++++++++++++++
 tests/contract/test_surface3_pvo_preservation.py |   4 +-
   a1f1023f..c62783b1  HEAD -> main
```
Gate green inside dg-land (pytest + typecheck · lint · vitest · banned-language · build; bundle
`index-C6XzDCYI.js` UNCHANGED — backend-only, no openapi regen, served OpenAPI byte-identical to the
committed `frontend/openapi.json` at 133,284 bytes).

**Review — 3 lenses + 7 skeptics, 10 agents, 0 died (a first relaunch lost all 3 lenses: two to the monthly
spend limit, one to a 21:45:52 machine sleep; David said "start the review agents again" and the relaunch
returned complete). All three lenses returned FIX_FIRST; every skeptic downgraded the blocking finding.
Corrections the review forced, recorded so the closeout reads true:**
- **The commit message named 3 consumers; there are 5.** Missing: `roster_cut_engine.py:243` (the
  `age_cliff_warning` and the `age_at_or_past_position_cliff` cut rationale — 20 league-wide cliff warnings flip
  on, 10 rostered; cut ORDERING is unaffected, rank comes from `_tier_sort_key`) and `team_posture.py:75-87`
  (`_age_window_score`, 0.20 of the published score — flips on 5 of 12 teams, moving `posture.score` by 0.12,
  rendered to 3 decimals at `TeamPostureTable.tsx:31`; all 12 labels hold today, roster 3 sits 0.63 from the
  next boundary). It also cited `app/services/team_value_matrix.py`, which does not exist — the file is
  `src/dynasty_genius/team_value_matrix.py:124`. Message amended before landing.
- **"324, all by exactly one year" was wrong: 318 are exactly one.** Gage Larvadain is two (22.0 vs 24, scored,
  nobody has adjudicated it) and five 2026 prospects carry a fractional college age against Sleeper's integer
  (Omar Cooper Jr. 22.4 → 22, Kevin Coleman Jr. 22.66 → 22) — those five get YOUNGER by tenths. Immaterial
  downstream: the cliff math already truncates with `int(age)`.
- **The headline numbers reproduced exactly** on three independent recomputes: 324 of 10,977 rows carrying both
  ages, 255 of the 468 that carry a value. The fallback fires on exactly ONE scored row (Jam Miller).
- Design confirmed: `age` is present as a key on all 12,227 blocks, always `int` when present, `None` on 1,250,
  and Sleeper derives it from `birth_date` — so None genuinely means unknown, unlike DG-137's team where None
  means free agent. The asymmetry with `served_team` is correct, not an oversight.
- One finding REFUTED: "the feature-season age is dropped with no `feature_age` key". The record survives —
  503 of 503 ENGINE_B rows re-join `engine_b_features_runtime.csv` on `dg_player_id` with the pre-change served
  age matching the 2025 feature age on 503/503, and the codebase already uses that join
  (`model_forward_capture_driver.py:390-419`). The ticket's wording was conditional and the key is not needed.
- The float→int JSON type change on 582 artifact rows is harmless (Pydantic coerces to `float` on both response
  models; `team_value_matrix` casts). `player.age` IS inside the semantic hash (`_semantic_projection`,
  `model_forward_capture_driver.py:78-84`), so `semantic_output_hash` will move. **But the "expect ONE spurious
  `vintage_changed: true`" wording carried here from DG-137 is RETRACTED as misleading — measured 2026-09-02
  night, `vintage_changed` has been true on 9 of 9 consecutive capture-date pairs because a microsecond
  timestamp is hashed into `provenance_hash` (`:158`). The flag was always going to be true tomorrow. Filed as
  DG-141.** Do not read tomorrow's flip as evidence that DG-139 reached the artifact — count served ages.
- **The blocking finding, and why it did not block: DG-140.** All three lenses found that the artifact's age
  DRIVERS are computed at the feature age and are not recomputed, so on the card a true age would sit beside a
  cliff sentence computed from the stale one on 97 rows. The skeptics established that those 97 sentences are
  ALREADY FALSE TODAY at the players' real ages — this commit removes a false number and adds no false claim —
  and that the card only rebuilds on a green refresh, so the pair never reaches a screen if DG-140 lands first.
  The roster audit row is unaffected (`roster_auditor.py:198,217` recomputes drivers from the live Sleeper row).

**When it is live:** the roster audit row's age needs trunk pull + API restart (no bundle rebuild — none of the
4 files is under `frontend/`). The card, League Pulse's age profile, team posture and the roster cut report only
move at the next green `run_pvo_refresh` from trunk (the 09:00 chain), which flips `vintage_changed` once.
**Verify then:** artifact rows whose served age ≠ snapshot age 324 → 0 (or only rows where Sleeper has no age);
Wilson's card reads 26; his roster row's age and cliff distance agree.
