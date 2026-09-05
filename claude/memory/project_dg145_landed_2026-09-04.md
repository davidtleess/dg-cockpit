---
name: project_dg145_landed_2026-09-04
description: DG-145 ("FA" on the card) landed 024de1ac 09-04 07:29 ET, NOT live; "FA" = nobody in David's LEAGUE owns him (his 23:35 ET ruling), not no-NFL-team; four unbuilt findings incl. a two-"FA" collision on 5,950 cards
metadata:
  type: project
---

**DG-145 landed on origin/main as `024de1ac` 2026-09-04 07:29 ET (Bob, `davidleess-08`). NOT live at 07:30:
trunk `6f517027`, API pid 50754 from 09-03 05:30 — needs the trunk pull + API restart (the route changed).**

**The ruling that defines "FA" on the card is LEAGUE ownership, not NFL team.** David 09-03 05:59 ET: "I think free
agents should show 'FA' on the card." Asked by Greg whether that meant no NFL team (Sleeper's FA) or nobody in his
league, David 23:35 ET (03:35:57Z, bare enqueue in Greg's transcript `dd3c4b75`): **"1) nobody in the league owns."**
Greg's first ticket filing assumed NFL free agent and Bob measured that reading before the correction; both are
recorded in the ticket, the NFL reading retired.

**What ships:** `GET /api/players/{id}` serves a REQUIRED `league_ownership {status: rostered|free_agent|unknown,
owner_display_name, roster_id, as_of}` from the universe row's `league_context` (the 09:00 ET league roster capture),
dated by the artifact's `source_snapshot_captured_at`. Missing/non-boolean `rostered` or an undated snapshot →
`unknown`, never a free-agent claim. **The API never says "FA"; the word is minted ONCE in `frontend/src/lib/copy.ts`
§10 `LEAGUE_FREE_AGENT_LABEL`.** The card prints one line with the capture time always on screen. The card also
refuses "FA" without a date at its own boundary (review fix `f6ecb6de`). A seed-served card says "as of Jun 23, 2026".

**Counts (14:00 ET 09-03 artifact):** 274 of 12,227 rostered, 11,953 league free agents; of 468 scored, 219 free
(WR 102, TE 69, RB 39, QB 9); the best-scored free agents are all TEs (Parkinson 78.2 …) = the pinned-TE constant.

**Four findings for David, UNBUILT (in the ticket):** (1) two "FA"s with two meanings on 5,950 cards — header
`_served_team_label` "FA" (Sleeper-Active, no NFL team; DG-137) above the league "FA"; 3 cards contradict themselves
(Tyreek Hill, Austin Ekeler, Justin Joly: NFL free agents on a roster). Cheapest fix: header says "no NFL team".
(2) His own 27 cards read "Rostered by Dleess" (third person); `resources/david_league_context.json` has
`david_roster_id 1`. (3) Pre-existing producer bug: Sleeper's empty-starter placeholder `"0"` passes `if pid` in
`sleeper_universe.py:95-98` → phantom row `"0"` served as rostered by Dseidman, inside the "274". (4)
`playerDetail.live.json`'s `league_ownership` is hand-added; re-capture after the restart (DG-118 lock).

**Also measured, not changed:** the roster row's backend turns ANY missing NFL team into "FA" (`get_my_roster`,
`or "FA"`, since 04-30) while the card does so only for Sleeper-Active; movers print nothing; the shell search finds
ROSTERED players only, so a free agent's card is reachable only from a what-changed/League Pulse row or by URL (Greg
filed DG-147). Related: [[project_dg137_served_team_landed]], [[reference_lane_names_are_not_addresses]],
[[feedback_workflows_die_on_spend_limit]] (one of 19 review agents died on the limit; judged inline).
