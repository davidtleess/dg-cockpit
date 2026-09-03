# DG-137 — The served team label is the model-side (2025 feature) team, not Sleeper's current team: 189 valued players disagree

**Layer:** 2 · **State:** landed `862a1afb` 09-02 07:47 · **Lane:** — · **DG 3.0** · **product truth / identity · small**
**Source:** 09:00-chain rehearsal, verify-B agent (2026-09-02 06:3x, measured on the rehearsal artifact AND the live `universe_pvo_runtime.json`); sourcing lines verified by Tower; ticketed 2026-09-02 06:40 by Tower.

**Problem:** for modeled rows the universe artifact sets
`player.team = pvo.nfl_team or player.team` (`src/dynasty_genius/universe_pvo_batch.py:173`), and
`nfl_team` comes from the prediction/feature row (`scripts/build_universe_pvo_batch.py:336`,
`pvo_assembler.py:237`) — i.e. the team the player was on in the 2025 feature season. Sleeper's
current team is only the fallback. Both surfaces that show a team prefer that field:
`app/api/routes/players.py:315` (player detail: `{position} · {team} · age` in
`PlayerDetailCard.tsx:32`) and `app/services/roster_auditor.py:222`
(`nfl_team=player.get("team") or live_player.get("team")`). Measured: **189 ENGINE_B rows carry a
team that disagrees with the SAME snapshot's Sleeper team** (e.g. Emari Demercado served as ARI
while Sleeper has him KC→none). Between the 08-31 and 09-01 snapshots Sleeper cleared the team on
337 players and flipped 27 to Inactive — cutdown week is exactly when a 2025 team label is wrong
most often, and it is wrong on the card David opens to decide a trade. Pre-existing; not caused by
DG-133 or the rehearsal.

**Fix shape:** the served team is a *roster* fact, not a *model* fact — prefer Sleeper's current
team wherever a team is displayed, and keep the feature-season team only as the model's context
(rename it if it must be kept on the row: `feature_team` / `season_team`). One-line change at
`universe_pvo_batch.py:173` (flip the `or`) plus the same flip at `roster_auditor.py:222`, and a
contract test that a row whose Sleeper team differs from its feature team serves Sleeper's.
Check what `PRE_MODEL`/`INACTIVE` rows do today (they have no pvo, so they already show Sleeper's).

**Anti-scope:** no change to the value, the band, or any model input — `team` is not an Engine B
feature (`ENGINE_B_BASE_FEATURES`); no change to the roster route's own rows
(`roster_auditor.py:694` already reads the Sleeper snapshot); do not "fix" it by re-running
feature assembly — the feature table's team is correct FOR THE FEATURE SEASON and must stay.

**Verify:** count of ENGINE_B rows whose served `player.team` ≠ snapshot team goes 189 → 0 on the
next artifact; Demercado's card shows Sleeper's team.

**Built 2026-09-02 07:10–07:55 on `ticket/DG-137` (Tower), reviewed by 2 of 5 adversarial lenses
(3 died on the spend limit) — corrections the review forced, recorded here so the closeout reads true:**
- **"David's roster rows unchanged" above was FALSE for the roster audit** — that is the surface the
  `roster_auditor.py:222` flip changes. Measured on the live artifact (captured 09-01 10:02Z) vs the
  09-01 snapshot, 3 of his 27 rows change at API restart: Adonai Mitchell IND→NYJ (real move),
  Fernando Mendoza LVR→LV and Kaelon Black SFO→SF (nflverse vs Sleeper abbreviation conventions).
  The untouched line is `roster_auditor.py:694` (no-universe-row fallback), which already reads live.
- One rule, one place: `served_team(sleeper_player, fallback)` in `universe_pvo_batch.py`, imported
  by the roster audit. Sleeper wins whenever its block carries the `team` key — **`None` is Sleeper
  speaking** (no team now; `""` reads the same) — the fallback is only for a block with no key, which
  the snapshot builder never writes (12,226/12,226 rows carry it). A plain `or`-flip would have
  served the 2025 team for every cut player, which is the bug in a new coat.
- **Presentation decision (beyond the ticket's fix shape, David may overrule):** the player-detail
  route serves `"FA"` for a player Sleeper lists **Active** with no team (5,567 rows today) — the
  roster audit's existing convention — and keeps the blank for Inactive/IR/PUP/NFI with no team
  (3,511 rows; Larry Fitzgerald is not a free agent). `PlayerIdentity.team` stays `str | None`;
  OpenAPI component byte-identical, no `frontend/openapi.json` regen.
- The one existing test that pinned the OLD precedence (`test_surface3_pvo_preservation.py`, PVO
  "KC" over snapshot "FA") was deliberately flipped to "FA" — it was the single failure of the
  first full run.
- **When it is live:** the roster audit + detail-card label change need trunk pull + API restart;
  the artifact half only changes when `run_pvo_refresh` next runs TRUNK's
  `build_universe_pvo_batch.py` green (09:00 chain, or the standalone label at 11:30/14:00) —
  every scheduled refresh 09-01 06:02 → 14:00 aborted on DG-133. `player.team` is in the capture's
  semantic projection, so that first rebuild flips `vintage_changed=true` ONCE; nothing gates on it
  (`daily_diff` reports `vintage_changed_no_score_delta`, an OK status).
- Not pinned, by choice: `get_my_roster`'s `or "FA"` (`roster_auditor.py:481`) — pre-existing,
  needs three Sleeper mocks, and with the key-presence rule it is no longer load-bearing.

**Acceptance — landed 2026-09-02 07:47 ET by Tower (`~/dg-build/bin/dg-land.sh DG-137` from `~/dg-wt/DG-137`):**
```
→ merging into main
Merge made by the 'ort' strategy.
 app/api/routes/players.py                        |  13 +-
 app/services/roster_auditor.py                   |   5 +-
 src/dynasty_genius/universe_pvo_batch.py         |  17 +-
 tests/contract/test_served_team_is_sleepers.py   | 199 +++++++++++++++++++++++
 tests/contract/test_surface3_pvo_preservation.py |   4 +-
 5 files changed, 234 insertions(+), 4 deletions(-)
To https://github.com/davidtleess/dynasty-genius.git
   1dff211f..862a1afb  HEAD -> main
✔ DG-137 landed on main and pushed. Worktree and branch removed.
```
Rebase target was DG-128's `1dff211f`; pytest + `npm run gate` green inside dg-land (frontend built in 87ms,
bundle `index-BZ1jEJNN.js` unchanged — DG-137 is backend-only). Not live until trunk pull + API restart
(roster audit + card) and the next green `run_pvo_refresh` from trunk (artifact `player.team`, 189 → 0 check).

**LIVE 2026-09-02 — both halves, verified by Tower on the machine, not from the relay:**
- 14:30:23 Fred pulled trunk `--ff-only 1dff211f → 862a1afb` and kickstarted the API on David's "go": pid
  4070 → **95078**. No bundle rebuild (none of the 5 files is under `frontend/`). Live `/api/roster/audit`:
  Adonai Mitchell → NYJ, Fernando Mendoza → LV, Kaelon Black → SF — the 3 of 27 predicted above.
- The 14:00 standalone refresh had run 30 min BEFORE the pull, so its artifact was still built by `1dff211f`:
  142 of 468 scored rows disagreed with the 13:00Z Sleeper snapshot (Demercado served ARI, Sleeper DAL).
  On David's word (verbatim: "send your recommendation to fred as an authotized next move") Fred kicked
  `com.davidleess.dynasty-model-pvo-refresh` at 14:50:55: label exit 0, receipt `ok / ok`, `aborted_reason`
  null, 12,227 rows, `vintage_changed: true` (the predicted one-time flip), artifact rewritten 14:50:57.
- Tower's count on that artifact vs the same snapshot: scored rows served ≠ Sleeper **142 → 0**; across
  ALL 12,227 rows **0**; Demercado → DAL; bands still 468. No restart needed — the audit route reads the
  artifact per request (200 in 0.76s after the rewrite).
- The ticket's "189" was measured 09-01 artifact vs 09-01 snapshot; the same measure on 09-02 data was 142
  before the fix. Both go to 0 by the same rule.
