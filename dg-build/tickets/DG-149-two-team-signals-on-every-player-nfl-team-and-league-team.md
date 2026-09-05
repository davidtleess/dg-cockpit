# DG-149 — Two team signals on every player, in different spots: NFL team (FA when none) and league team (FA when unowned)

**Layer:** 6 (+2 for the league team name) · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **product truth / presentation · small-medium**
**Source:** David, 2026-09-04 07:3x ET, verbatim: *"there should be a signal on every player NFL Team (including the FA tag
if they don't have a team) and Team = team they are on in my league i.e. woodbury riders or if they are a FA they get the
FA tag there too. they should be in different spots - no you can leave it by dleess"* — his answer to Greg's two
questions after DG-145 landed (header "no NFL team" instead of "FA"? → no: keep FA, and show BOTH signals in different
spots; "On your roster" instead of "Rostered by Dleess"? → *"no you can leave it by dleess"*). Filed 09-04 07:3x ET by
Greg (`davidleess-eb [a78c76]`); assigned to Bob (it extends DG-145).

**Problem:** the card carries the NFL team in its header ("TE · FA · age 27" — "FA" only when Sleeper marks him Active,
DG-137's rule; blank for Inactive/IR with no team) and, since DG-145, a league-ownership line naming the OWNER
("Rostered by Dleess" / "FA · nobody in your league owns him"). David wants two clearly separate signals on every
player: **NFL team** — the team, or "FA" whenever he has none (this settles DG-145's unbuilt NFL-team discrepancy:
"FA" for ANY missing NFL team, on every surface, not only when Active); and **league team** — the fantasy TEAM NAME he
is on in David's league (e.g. "Woodbury Riders"), or "FA" when nobody owns him. The same word "FA" in both spots is
fine because the spots are labelled and apart. The owner line stays as it is.

**How we know:** David's words above; DG-145's measurement (Bob, 09-03 23:38 and 09-04 07:29 ET): roster row prints
"FA" for any missing NFL team, the card only when Active, movers print nothing; 5,950 cards carry both meanings today;
Hill / Ekeler / Joly print "FA" directly above "Rostered by …".

**Done looks like:** (1) NFL team: one rule in one place — "FA" for any player with no NFL team — on the card header,
the roster row and the movers (DG-137's SOURCE is unchanged; only the null → "FA" mapping is unified). (2) League team:
the card shows the league TEAM NAME from the latest league snapshot (Sleeper users' `team_name` for the owning roster —
measure first that the snapshot carries it; where a manager has no team name, fall back to the owner display name and
say so), or "FA" when unowned, dated the way DG-145 dates ownership; placed apart from the NFL team under its own
label. (3) Tests red first: Inactive player with no NFL team → "FA"; owned player → his league team name; unowned →
"FA"; David's own player → his team name AND "Rostered by Dleess" retained. Gate green; openapi regen if the API gains
the team name (never hand-edit `frontend/openapi.json`).

**Anti-scope:** no change to the owner line's wording; no change to where the NFL team comes from; nothing under `.oa3`.

**Depends on:** DG-145 (landed `024de1ac`).

---

**Notes**

**Acceptance — LANDED `3674d940` 2026-09-04 08:2x ET by Bob (`~/dg-build/bin/dg-land.sh DG-149`).** Built `05a3fbb0`
+ review fix `75a4d0a0`. **NOT live** (trunk `6f517027`; rides the same pull + build + restart, on David's word).

(1) **NFL team, one rule in one place.** The API serves the FACT — Sleeper's team, or null when he has none, Active or
not. DG-137's Active-only `"FA"` on the card (`_served_team_label` → `_served_nfl_team`) and `get_my_roster`'s
unconditional `or "FA"` (there since 2026-04-30) are both retired; DG-137's SOURCE rule is untouched. The word is
minted once, `copy.ts` `FREE_AGENT_LABEL` / `nflTeamLabel`, and printed by the card header, the roster row and the
movers (4 identity spots + their context strings). Verified no consumer treated `"FA"` as a sentinel: zero matches for
an equality test against it anywhere in `app/`, `src/` or `frontend/src/`.
(2) **League team.** `league_ownership` gains a required `team_name`, read per request (20 ms measured) from the
league snapshot the trade routes already read. The card prints it under the header in its own labelled line —
*"League team: Woodbury Riders"*, *"League team: FA"*, or the manager's handle plus *"no team name set"* — apart from
the NFL team and above the owner line, which is byte-for-byte unchanged (*"no you can leave it by dleess"*).
(3) Tests red first: 10 backend, 8 frontend. Backend 6,863; frontend gate 649; contract regenerated with
`npm run openapi-gen`.

**⚠ Adversarial review NEVER RAN — all three lenses died on the account spend limit before producing anything.** The
decisive questions were verified inline instead, and one of them found a real flaw:
- **Fixed (`75a4d0a0`).** The team name was joined through the snapshot's `rosters` (roster_id → owner_id →
  team_name) while ownership comes from the valuation artifact, dated by a DIFFERENT capture. The vintages can
  disagree — in a ticket worktree `load_production_league_set()` resolves to the committed SEED snapshot (the
  per-worktree `league_runtime` is empty), and that seed says 8 managers have named a team where production says 9,
  because jkazzz named his after the seed was cut. A roster changing hands between vintages would have hung one
  manager's team name on another's roster. **A team name is the MANAGER's**, so the map is now `user_id → team_name`
  and the lookup is the artifact's own `league_context.owner_user_id`; the rosters join is gone. Any vintage can now
  only give a stale name for the RIGHT manager. Pinned by a test that hands the route a snapshot naming only a
  different manager.
- Verified clean inline: rebase onto DG-147's merge (both edit `get_my_roster`, adjacent lines, no conflict); the
  OpenAPI drift contract; every consumer of a now-null team; the shared `_client` helper's new stub (tests get `{}`
  rather than reading production, which is correct).
- **Note for David, UNBUILT:** on the card of a player with no NFL team whom nobody owns, "FA" now appears three
  times — header, League team, and the DG-145 owner sentence. That is what he asked for in the two team spots; the
  third is DG-145's line, which this ticket's anti-scope holds. Say the word if the owner line should go quiet when
  the League team line already says FA.
