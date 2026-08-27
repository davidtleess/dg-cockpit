# DG-021 — 114 players are told an Engine A prior was used when none exists

**Layer:** 3 → surfaces at 6  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG021-20260825  ·  **DG 3.0**
**Source:** crew lane, 2026-08-18; independently re-derived by the judge seat the same night

**Problem:** 114 served rows carry `dvs_engine="A"` and the caveat *"Engine A prospect score used as
prior"* — emitted from the exact branch that runs **because no Engine A result was produced**. Route
assembly reads that as an Engine A route, and the player API returns the row as `modeled` with
`degradation=None` while the score is null. **The product states something about itself that is not
true**, and does it to the player card David is looking at.

**How we know:** 115 feature IDs under the eight-game gate; 115 served rows with null DVS and a
projection; intersection **114** — the two 115s were never the same set. Cohort experience: 85 with
3+ years, 38 with 7+. A rookie-prior bridge applied overwhelmingly to veterans.

**Done looks like:** a row with no prior says so. No `dvs_engine="A"`, no prior caveat, and a state
David can read as "we don't have a number for this player" rather than a blank beside a confident label.

**Depends on:** nothing.

---

**Notes**
This is the highest-priority item on the board on one criterion: it is the only one where the product
tells David something false. Everything else is a number being worse than we'd like.

The coincidence of two different 115s is what made a wrong causal story look corroborated for several
hours. Worth remembering the next time two counts match.

---

**CLOSED (code) 2026-08-25, lane ClaudeFable5-DG021-20260825. Landed as merge `b291107f` on
`origin/main` through `dg-land.sh` (gate: full suite green after rebase; local run 6042 passed /
0 failed / zero collection errors).**

**Root cause:** the dead-window else-arm (`pvo_assembler.py`, prior `:459-467`) — the branch that
runs *because* no Engine A and no Engine B score exist — stamped `dvs_engine="A"` ("Spec 3.4:
'A' as provenance marker", i.e. the spec itself encoded the lie) and appended the same
"Engine A prospect score used as prior" caveat the genuine elif-arm uses. Downstream,
`app/api/routes/players.py` served any `modeled` row as `degradation=None` even with a null score.

**Fix (TDD; RED watched — 3 failures, each for the expected reason — then GREEN):**
1. `pvo_assembler.py`: no A and no B → `dvs_engine` stays `None`; caveat now reads
   "Insufficient professional season data — no dynasty value score available (no Engine A prior,
   no reliable Engine B projection)". The elif-arm's TRUE claim survives and is pinned by test.
2. `app/api/routes/players.py`: a modeled row with a null score always carries a degradation
   notice ("Model lane active without a dynasty value score — …").

**Two existing tests pinned the false behavior and were amended with disclosure comments**
(DG-031 precedent): `test_phase15_blend.py` spec 5.10 and `test_phase14_dvs.py` spec 5.5. New:
`tests/contract/test_dg021_no_prior_says_so.py` — 6 tests pinning both caveat directions, route
honesty (`dvs_engine=None` never files under ENGINE_A), and the serving surface both ways. No API
schema change (`degradation` field and plain-`str` `model_status` already existed → no OpenAPI regen).

```
$ .venv/bin/python3.14 -m pytest tests/contract/test_dg021_no_prior_says_so.py \
    tests/contract/test_phase15_blend.py tests/contract/test_surface3_player_detail_endpoint.py -q
17 passed
$ .venv/bin/python3.14 -m pytest -q          # full suite, worktree, pre-land
6042 passed, 38 skipped                       # zero failures, zero collection errors
```

**DEPLOYED 2026-08-25 10:21 EDT, on David's "go ahead".** Trunk switched to `main@b291107f`
(post-window; the three dirty files on main-deleted paths were archived to
`dg-build/preserved/2026-08-25-trunk-switch/` AND stashed — `stash@{0}` — before the switch;
dirty count 47→25, remainder carried over untouched). Producer hand-run with launchd's exact
invocation: `run_pvo_refresh.py` → report `status: ok`, `EXIT=0`, artifact vintage
`2026-08-25T14:21:18Z`.

**Acceptance measured, before vs after, same artifact path (`universe_pvo_runtime.json`, 12,225
rows both times):**
```
09:30 artifact (old code):  falseA_nullDVS=114  old_caveat_rows=114
10:21 artifact (fixed):     falseA_nullDVS=0    old_caveat_rows=0
                            honest_caveat_rows=114, all dvs_engine=None
```
The 114 is conserved — the exact cohort the ticket counted now says the truth about itself.

**CONFIRMED 2026-08-25 11:38.** The 11:30 scheduled run fired from launchd's own trigger:
`launchctl list` exit 0, report `status ok`, artifact vintage `2026-08-25T15:30:02Z`, and the
acceptance held on the fresh artifact — `falseA_nullDVS=0`, `old_caveat=0`, `honest=114`.
Nothing about this ticket remains open.
