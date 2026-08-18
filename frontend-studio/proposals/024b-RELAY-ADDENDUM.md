# RELAY 024b — addendum: six live findings, found while answering 024's open question

**From:** Studio (independent front-end practice)
**Date:** 2026-08-18
**Provenance:** every item below was found *after* the 024 response arrived, while verifying the one
question it handed back (does the DVS comparator in `roster_cut_engine` mix positions in practice?).
The answer to that question is in `024-RELAY.md` under Dispositions: **measured, and dormant on this
roster.** These six are what the same pass turned up.
**Verified against:** the running app at `127.0.0.1:8000` on 2026-08-18, at 1440x900 and 1920x1080.

## Summary

| ID | summary | severity |
|---|---|---|
| A1 | Two surfaces disagree whether the model scored 20 players | high |
| A2 | 23 of 27 rows say do-not-use, for data on disk | high |
| A3 | Closing the inspector hides the control that reopens it | high |
| A4 | Capacity has points-per-game and renders raw xVAR | medium |
| A5 | Player card prints eight unlabelled numbers | medium |
| A6 | The DVS ceiling fires on David's own tight end | medium |

---

## A1 — the same player, the same day, two answers about whether the model has scored him

**Claim.** For 20 of the 27 players on the roster, `/api/roster/audit` reports `model_grade:
PRE_MODEL`, `model_status_applies: false` and `dynasty_value_score: null`, while
`/api/players/{sleeper_id}` reports `model_grade: ACTIVE_B` with a real DVS and a 2-year projection —
on the same day, from the same running instance.

**Reproduce.** `python3 tools/do-two-surfaces-agree-about-the-model.py` (Studio's script; prints the
full 27-row table, the contradiction list and the counts). Deterministic across two consecutive runs.
Spot check without the script:
```
curl -s localhost:8000/api/players/12527 | python3 -m json.tool   # Jeanty: ACTIVE_B, DVS 75.3, proj_2y 11.822
curl -s localhost:8000/api/roster/audit | python3 -c "import json,sys;print([ (p['full_name'],p['model_grade'],p['dynasty_value_score']) for p in json.load(sys.stdin)['players'] if p['full_name']=='Ashton Jeanty'])"
# ('Ashton Jeanty', 'PRE_MODEL', None)
```

**A self-contradiction inside a single response.** `/api/roster/audit` carries
`model_status_by_position: {QB: PROVISIONAL, RB: VALIDATED, TE: VALIDATED, WR: VALIDATED}` in its
header, and the Rasheen Ali row (RB) carries the caveat *"dynasty_value_score unavailable: Engine B
(active player) not yet validated; model_grade is PRE_MODEL."* The header says RB is validated; the
row says Engine B is not yet validated. Both sentences are in the same payload.

**Observed.** Roster Audit renders `—` in its DVS column for 22 of 27 rows.
**Expected.** Either surface may gate a number, but two surfaces should not answer the same question
differently without saying which rule they applied.

**Why the user pays.** The one user opens Roster Audit to see what the model thinks of his roster and
is told the model has no view on Jeanty, Odunze, Dart, Burden and sixteen others. The model has a
view on every one of them, and the cut ordering on Roster Capacity is *already computed from it*. He
is being shown two different pictures of the same model and given no way to tell which is current.

**Studio's own honesty note:** it is possible the audit's stricter gate is deliberate — it may be
refusing to show a score whose inputs are 29% complete, which would be a defensible disclosure rule.
Studio cannot tell from outside, and does not assert that the audit is the wrong one. The defect
being reported is the *unexplained disagreement*, not the gate.

**Confirm, fix, or refute with a concrete technical reason.** Specifically: is the audit's
`model_status_applies` gate deliberate, and if so should the other surfaces inherit it?

---

## A2 — "do not use for dynasty decisions" on 23 of 27 rows, for signals that are on disk

**Claim.** The active Roster Audit surface disclaims itself on 85% of the roster, and the inputs it
names as missing are the ones held in the unserved store confirmed under 024 R5.

**Reproduce.** Same script; or read any `PRE_MODEL` row's `caveats` and `inputs_missing`:
```
Fewer than 50% of required signals present — do not use for dynasty decisions until data is refreshed
inputs_missing: aging_curve_value, games_t, ppg_t, ppg_t_minus_1, ppg_t_minus_2, snap_share, snap_share_t_minus_1
signal_completeness: 0.2857
```
`ppg_t`, `games_t` and `snap_share` are exactly what `ff_opportunity` (47,282 weekly rows, 2018-2025)
and the snap-count tables hold.

**Observed.** 23 of 27 rows carry the do-not-use caveat; `signal_completeness` reads 22-29% on every
`PRE_MODEL` row.
**Expected.** Either the signals are wired to the surface, or the caveat names what specifically is
absent (the 2026 vintage) rather than reading as a general data failure.

**Why the user pays.** This is 024 R5's cost, made concrete: it is not only two parked screens. The
flagship roster surface currently tells its only user not to use it, for want of data the repository
already holds for eight prior seasons. Every design conversation this lane has had about grounding
the model's numbers in usage terminates here.

**Confirm, fix, or refute with a concrete technical reason.**

---

## A3 — closing the player inspector removes the only control that reopens it

**Claim.** `button.dg-shell__inspector-toggle` is positioned outside the viewport whenever
`aside.dg-shell__inspector` is `data-state="closed"`, and the document is not horizontally
scrollable, so there is no mouse path back.

**Reproduce.** Load any surface at 1920x1080, click **Inspector** to close it, then try to reopen it.
Measured in the page (DOM measurement, not a screenshot — the evidence here is a rectangle, and a
picture of an absent control proves nothing):

| inspector state | viewport | toggle left..right | fraction visible | page scrolls horizontally |
|---|---|---|---|---|
| open | 1920 | on-screen | **1.000** | no |
| closed | 1440 | 1425 .. 1502.4 | **0.194** | no |
| closed | 1920 | 1905 .. 1982.4 | **0.000** | no |

At 1440 a 15px sliver remains clickable. At 1920 nothing does: `document.elementFromPoint()` at the
button's centre returns `null` because the centre lies outside the viewport.

**Observed.** The control is not disabled and is not broken — `tabIndex 0`, keyboard-focusable, and a
programmatic `.click()` reopens the panel correctly. It is simply drawn where the mouse cannot reach.
**Expected.** A toggle that closes a panel stays reachable in the closed state.

**Why the user pays.** The inspector is the route to the player evidence card — the surface this
engagement's client has responded to most positively. Closing it is a one-way door for a mouse user
at 1920x1080. The escape hatches are a keyboard tab or a page reload, neither of which the interface
suggests.

**Confirm, fix, or refute with a concrete technical reason.**

---

## A4 — Roster Capacity is served points per game and renders raw xVAR instead

**Claim.** `/api/roster/capacity` returns `median_projection_2y` for every candidate;
`RosterCapacitySandbox.tsx` renders `raw_xvar` and drops it.

**Reproduce.** The payload carries `dvs`, `xvar_pct` and `median_projection_2y` per candidate
(`frontend/src/lib/api/types.gen.ts:156` types it). The table at
`RosterCapacitySandbox.tsx:147-170` renders four columns: Player, Pos, Cut exposure rank, xVAR — and
xVAR as its raw value (`-27.83`, `-9.40`). Screenshot: `proposals/assets/024-roster-capacity-live-2026-08-18.png`.

**Observed.** The reader sees `Mac Jones · QB · 8 · -10.39` and `AJ Barner · TE · 10 · -5.64`.
**Expected.** The same rows can read `11.4 points a game` and `8.2 points a game` from data already
in the component's own props.

**Why the user pays.** This is 024 R3 with the fix reduced to a render change: no model work, no new
field, no migration. The ordering claims Jones is more cut-exposed than Barner; the projection says
Jones produces 3.2 more points a week. Whether the ordering is right depends on replacement value —
which is the argument xVAR is making and never shows. The surface renders the conclusion and the
machinery, and withholds the one number a football person could check them against.

**Confirm, fix, or refute with a concrete technical reason.**

---

## A5 — the player card's model lane is eight unlabelled numbers

**Claim.** `ValuationTwoLane.tsx:48-58` renders `engine_path`, `model_grade`,
`dynasty_value_score`, `xvar`, `xvar_percentile_position`, `projection_1y`, `projection_2y` and
`projection_3y` as eight bare `<span>` elements inside a `<dl>` that contains no `<dt>` or `<dd>`.

**Reproduce.** Read the component; then `frontend/src/player/PlayerDetail.css` — `.dg-two-lane__facts`
has no rule at all, and the file contains no `content:` or `::before` declaration, so no label is
injected. Verified by source and stylesheet rather than by rendering: Studio could not reopen the
inspector to reach the card (that is A3).

**Observed.** A column of values with nothing naming them, in markup where a definition list promises
term/description pairs and supplies neither. Assistive technology gets a `<dl>` with no terms.
**Expected.** Each value labelled, and the projections carrying their unit — they are points per
game, and nothing on the surface says so. `RosterAuditRow.tsx:58` has the same shape:
`Projections: 8.2 / 9.5 / 9.1`, one label over three numbers, no unit, no year markers.

**Why the user pays.** This is where 024 R3's "publish the points instead" turns out to be already
half-done: the points-per-game figure *is* on the surface, unnamed and unitless, beside the 0-100
score that gets the visual weight. The remedy is smaller than the relay claimed and the defect is
worse — the number is present and unreadable.

**Confirm, fix, or refute with a concrete technical reason.**

---

## A6 — the DVS ceiling fires on this roster, silently

**Claim.** 024 R1 is not abstract for this user. **Tucker Kraft** (TE) carries `projection_2y`
10.329, which is a raw DVS of 109.9 under `dvs_raw = projection_2y / 9.4 * 100`; the served value is
**100.0**, indistinguishable from a true 100.

**Reproduce.**
```
curl -s localhost:8000/api/players/9484 | python3 -m json.tool   # projection_2y 10.329, dynasty_value_score 100.0
```
`ENGINE_B_P90_PPG["TE"] = 9.4` (`engine_b_contract.py:24-29`, per the 024 response).

**Observed.** Nothing on any surface indicates the value was capped — `dvs_clamped` is computed and
never served (024 R1 dispositions).
**Expected.** A capped value says it is capped, or the surface shows the projection instead.

**Why the user pays.** His best tight end reads as a perfect score. So does every other clamped
player in the league. When he compares Kraft to a trade target at 100, the model has no opinion left
to give him, and the surface does not tell him the opinion was removed rather than absent.

**Confirm, fix, or refute with a concrete technical reason.**

---

*Studio measures against the running app and never writes to this repository. Where a finding rests
on Studio's own instrument, the script is named so the measurement can be re-run or refuted.*
