# DG-145 — Free agents show "FA" on the card

**Layer:** 6 (+2 if the one-place decision lands in the served-team rule) · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **product truth / presentation · small**
**Source:** David, 2026-09-03 05:59 ET (Tower session `6f07a6c0`, message 09:59:20Z), verbatim: *"I think free agents
should show 'FA' on the card."* Filed 2026-09-03 23:26 ET by Greg (`davidleess-eb [a78c76]`) under David's 19:42 ET
"then plan a few hours of work and get the team going"; assigned to Bob.

**Problem (as ruled):** the card says nothing about David's league. A player nobody in his 12-team Sleeper
league owns — 11,953 of the 12,227 universe rows, 219 of the 468 scored — reads exactly like a rostered one. The
league roster capture already knows (each universe row carries `league_context.rostered` from the 09:00 ET
league snapshot, stamped `source_snapshot_captured_at`); the route `/api/players/{sleeper_id}` served none of it.

**How we know:** measured 2026-09-03 23:3x ET by Bob on the 14:00 ET artifact: universe 274 rostered / 11,953
free; scored 468 → 249 rostered / 219 free (WR 102, TE 69, RB 39, QB 9); skill 4,042 → 273 / 3,769. David's own
27: all rostered (by construction). Surfaces that print an owner today: only the trade asset search
(`roster_owner_name`), whose catalog is rostered-players-plus-picks, so a free agent never appears there;
movers and the card header print no owner. The shell search box finds ROSTERED players only, so a free agent's
card is reachable only from a what-changed / League Pulse row or by URL (Greg files DG-147).

**Reading of "free agent" — RULED by David 2026-09-03 23:35 ET (03:35:57Z).** Greg asked: *"FA: do you mean players with no NFL
team, the way Sleeper shows FA? Or players nobody in your league owns?"* David, verbatim: **"1) nobody in the league
owns."** So "FA" = a player on no roster in his 12-team Sleeper league — a LEAGUE free agent, read from the latest
league roster capture, never a training-time fact. *(Greg's first filing assumed NFL free agent; that reading is
retired. Bob's measurement before the ruling — roster row already prints "FA" for any missing NFL team; the card
prints it only when Sleeper marks him Active; movers print nothing — is a real discrepancy, recorded here, UNBUILT.)*

**Done looks like (built `2648a336` + review fix `f6ecb6de`, LANDED `024de1ac`):** the card route serves a REQUIRED
`league_ownership {status: rostered | free_agent | unknown, owner_display_name, roster_id, as_of}` read from the
row's `league_context` and dated by the artifact's `source_snapshot_captured_at` — the latest league roster capture,
on every request, never a training-time fact. A missing or non-boolean `rostered` flag, or an undated snapshot, is
served as `unknown`, never a free-agent claim the capture did not make; the API never says the word. The card
prints one line under the identity: *"FA · nobody in your league owns him · league roster as of Sep 3, 2026, 9:00 AM
EDT"*, or *"Rostered by Dleess · league roster as of …"* (handle carries `data-user-text`, DG-109), or *"Who owns him
in your league is unknown right now."* (no label, no date). **The word "FA" is minted in ONE place:
`frontend/src/lib/copy.ts` §10 `LEAGUE_FREE_AGENT_LABEL`** — recorded here as the ticket asked. Tests red first: 8
backend (`tests/contract/test_dg145_league_free_agent_on_the_card.py`, incl. "the API serves the fact not the word"
and the OpenAPI contract), 5 frontend (`PlayerDetailCard.test.jsx`). Contract regenerated with `npm run
openapi-gen`; fixtures that parse the response gained the field (`playerDetail.live.json`'s entry is HAND-ADDED, not
captured). `npm run gate` green (634 tests); backend 6,838 passed.

**Anti-scope (held):** the NFL-team rule on the card (`_served_team_label`: Sleeper-Active with no NFL team → `"FA"`,
DG-137) is untouched; no producer edit; no change to where ownership comes from; nothing under `.oa3`.

**Depends on:** nothing. **Goes live:** trunk pull + API restart (the route changed); the artifact side needs nothing. **NOT live as of 07:30 ET 09-04** — trunk `6f517027`, API pid 50754 from 09-03 05:30.

---

**Notes**

- **Findings, measured, UNBUILT — for David through Greg:**
  1. *Two "FA"s with two meanings on one card.* For a player Sleeper lists Active with no NFL team the header meta
     line already prints *"TE · FA · age 27"* (NFL meaning, DG-137); the new line prints *"FA · nobody in your league
     owns him"* (David's meaning). Under his 23:35 ET definition the meta line's "FA" now says the wrong thing.
     Cheapest honest fix: the meta line says *"no NFL team"* there instead of "FA" (a copy change; one ticket).
  2. *The NFL-team discrepancy across surfaces* (measured before the rescope): the roster row's backend turns ANY
     missing NFL team into "FA" (`roster_auditor.get_my_roster`, `or "FA"`, since 04-30); the card only when
     Sleeper marks him Active; movers print nothing. 0 of David's 27 affected today. Tower's 05:51 ET list item 12
     asked David "FA on the card only when active — my call, yours to overrule"; his 05:59 answer is the sentence
     this ticket cites, and it turned out to mean the league.
  3. *The best-scored free agents are tight ends* (Parkinson 78.2, Tonges 73.0, Roush 73.0, Otton 71.4): the
     pinned-TE constant wearing an FA label. Relayed to David by Greg.
- **Clock:** Greg's evening stamps ran ~2 h early; David's ruling is 03:35:57Z = 23:35 ET (bare enqueue in Greg's
  transcript `dd3c4b75`), corrected by Greg in board and memory.

- **Adversarial review before landing (Bob, 3 lenses × 2 skeptics, 19 agents, 00:0x ET 09-04):** 8 findings, all
  refuted; one skeptic died on the spend limit and its finding was judged inline — the contract's `as_of` is nullable
  for every status, so a `free_agent` with no date (which the route never serves) would still have put an undated "FA"
  on screen; the card now holds the route's own line at its boundary, pinned by a test (`f6ecb6de`). Verified by the
  reviewers, not by me alone: `owner_display_name` is the manager's Sleeper `display_name` (sleeper_universe.py:222);
  `source_snapshot_captured_at` is stamped seconds after the live roster fetch, so "as of" is the true roster time;
  the committed seed carries the field and full `league_context`, so a seed-served card says "as of Jun 23, 2026",
  never unknown, never undated; `frontend/openapi.json` byte-matches `app.openapi()`.
- **Findings for David (measured by the reviewers on the served artifact), UNBUILT:** (a) the two-"FA" collision is
  **5,950 cards** today, 24 of them scored veterans (Hopkins, Ertz, Thielen, Chubb, Hunt…), and **3 cards contradict
  themselves** — Tyreek Hill, Austin Ekeler, Justin Joly are NFL free agents on somebody's roster, so they print "FA"
  directly above "Rostered by …"; (b) his own 27 cards say *"Rostered by Dleess"* in the third person — "On your
  roster" is derivable (`resources/david_league_context.json` has `david_roster_id 1`); (c) pre-existing producer bug:
  Sleeper's empty-starter placeholder `"0"` passes `if pid` in `sleeper_universe.py:95-98`, so a phantom row
  `sleeper_player_id "0"` is served as rostered by Dseidman and counts in the "274"; (d) `playerDetail.live.json`'s
  `league_ownership` is hand-added — re-capture from the running product after the restart (DG-118 lock).

**Acceptance — landed 2026-09-04 07:29 ET by Bob (`~/dg-build/bin/dg-land.sh DG-145`):**
```
→ merging into main
Merge made by the 'ort' strategy.
 13 files changed, 563 insertions(+), 2 deletions(-)
To https://github.com/davidtleess/dynasty-genius.git
   22d904b0..024de1ac  HEAD -> main
✔ DG-145 landed on main and pushed. Worktree and branch removed.
```
Backend 6,838 passed / 32 skipped; frontend gate 635 tests, typecheck, lint, banned-language, build — all green in the land run.
