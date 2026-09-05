---
name: project_dg147_dg149_landed_2026-09-04
description: DG-147 (rostered rookie gets his number) LIVE 08:15 09-04; DG-149 (two team signals, FA on every teamless player) landed 3674d940 but NOT live; both reviews died on the spend limit and were judged inline
metadata:
  type: project
---

**DG-147 LANDED `c7ac3484` and is LIVE** (David said go 08:13; trunk pulled 08:15:00, frontend rebuilt, API restarted
pid 50754 → 39384). **DG-149 LANDED `3674d940` — NOT live**; trunk is 3 behind, next window after 14:00 on his word.

**DG-147:** the roster index admitted a rookie-model (ENGINE_A) row only when THIS league's draft picked him, so a
rookie off waivers or on a taxi squad fell to the fallback: no number, no "Rookie" word, while his card scored him.
Now: any ROSTERED rookie-model row is admitted (255 → 263 on the served artifact, exactly 8 names: Douglas, Hibner,
Benson, Joly, Allen, Lance, Raridon, McGowan — none David's); `is_prospect` is **Sleeper's `years_exp == 0`**, engine
standing in only when Sleeper never said; `draft_class` rides the row. **Verified live on his roster: 4 rookies
flagged, `draft_class` 2026 where all 27 were null.** The 8 need the next artifact rebuild to show on their owners'
rosters.

**DG-149** (David 09-04 07:35 ET, verbatim: *"there should be a signal on every player NFL Team (including the FA tag
if they don't have a team) and Team = team they are on in my league i.e. woodbury riders or if they are a FA they get
the FA tag there too. they should be in different spots - no you can leave it by dleess"*): the API serves the NFL
team as a FACT (null when none, Active or not — **DG-137's Active-only "FA" and `get_my_roster`'s `or "FA"` are both
retired**, its SOURCE rule untouched) and **"FA" is minted once in `copy.ts` (`FREE_AGENT_LABEL`/`nflTeamLabel`)** for
the card header, roster row and movers. `league_ownership.team_name` is the manager's Sleeper team name, in its own
labelled card line; the DG-145 owner line is unchanged by his word.

⚠ **BOTH reviews died on the account spend limit** — DG-147 lost all 21 verifiers, DG-149 lost all 3 lenses before
producing anything. Judged inline; three real defects found and fixed, so a dead review is not a clean review:
1. A fallback rookie made the backend say *"Engine A (prospect) not yet validated"* while `copy.ts` matched the token
   prefix and returned ONE sentence blaming the ACTIVE-PLAYER model. The screen named a model never consulted.
2. The universe path read the ARTIFACT's `years_exp` while team and age beside it read the LIVE row (DG-137/DG-139).
3. **DG-149's team name was joined through roster_id**, while ownership comes from the artifact at a DIFFERENT
   vintage — a roster changing hands would hang one manager's team name on another's roster. **A team name is the
   MANAGER's**: the map is now `user_id → team_name`, looked up by the artifact's own `owner_user_id`.

⚠ **A ticket worktree's `league_runtime` is EMPTY (gitignored), so `load_production_league_set()` there resolves to the
committed SEED snapshot** — measuring league facts inside a worktree gives seed answers (8 managers named a team vs
production's 9). Measure league data against `~/dynasty-genius-product`, never the worktree.

**Open for David:** on a card for a teamless player nobody owns, "FA" now appears three times (header, League team,
and DG-145's owner sentence). Two are his ruling; the third is DG-145's line held by anti-scope.
Related: [[project_dg145_landed_2026-09-04]], [[feedback_workflows_die_on_spend_limit]], [[project_dg137_served_team_landed]].
