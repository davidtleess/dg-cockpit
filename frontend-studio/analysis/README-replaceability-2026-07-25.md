# Replaceability — the numbers quoted to David on 2026-07-25

**Written because these existed only in a pane transcript.** They are now reproducible.

- `replaceability.py` — the derivation, re-runnable.
- `replaceability-2026-07-25.json` — 219 rows, every rostered player outside David's team with a
  model output and a market price.
- `league-players-2026-07-24.json` — the per-player DVS pull this depends on.

## Status of these numbers: UNVERIFIED

**Computed by Studio and reviewed by nobody.** Reproducible from the script, never re-run
independently. Do not treat as established.

Four caveats that materially affect them:

1. **They are built on the fresh on-disk artifact (`league-20260724T132000Z`), not on what the
   running app serves.** `/api/league/pulse`, `/api/trade/assets` and `/api/roster/capacity` all
   still serve the **2026-06-23** snapshot. This is relay 009 item P1 and it is undelivered.
2. **Relay P2 contaminates the ranking lane.** Fifteen rostered players are graded `ACTIVE_B` while
   returning `null` for both value fields, and the league layer stores that null as `0.0`. Players
   with a null DVS are *excluded* from the rank columns here, so the `ours` ranks are computed over
   242 modelled players — but the population itself is the one P2 corrupts, and the effect on these
   ranks has **not** been quantified.
3. **`cost` and `gain` are market-value units** (FantasyCalc, fetched 2026-07-24T19:59:08Z),
   measured as best-legal-lineup differences. The lineup maths is unaffected by P2 because it uses
   market value, not model output.
4. **Do not fuse `cost` and `gain`.** `gain − cost` was tried and is **degenerate** — it returns a
   team-pair constant (910, 910, 910 …) because it reduces to *their* replacement level minus
   *mine*, saying nothing about the player. A ratio is worse: `cost` is exactly 0 for any bench
   player, so `gain/cost` is unbounded. Rank on quality; show cost as a separate dimension.

## Where the idea came from

David, 2026-07-25: *"not just that they cant start — but what if they have a backfill for a starter
that they may be satisfied with."* The tradeable asset is the **replaceable** one, and a starter
with a good backup can be more available than a bench player.

## The figures quoted to him

**Cost** = what losing the player costs his owner's best legal lineup.
**Adds** = what he would add to David's.

### The cases that make the point — a starter cheap to lose

| player | ours / market | age | owner · posture | their depth | costs them | adds to David |
|---|---|---|---|---|---|---|
| **Cam Skattebo** | RB16 / RB17 | 24.5 | Florida Man · ascending | their **RB2 — a starter** | **289** | **1,199** |
| **Jadarian Price** | RB8 / RB19 | 22.8 | Florida Man · ascending | their RB3 — a starter | **114** | **1,024** |
| D'Andre Swift | RB20 / RB26 | 27.5 | Kissane's Team · balanced | their RB3 | 64 | 232 |
| Breece Hall | RB15 / RB14 | 25.2 | Florida Man · ascending | their RB1 | 899 | 1,809 |

Skattebo is the case David predicted: a **starting** RB2 whose removal costs his owner only 289
because the backfill behind him is adequate. Bench-only logic misses him entirely.
**Florida Man appears three times** — RB1, RB2 and RB3 all comparatively cheap to lose.

### Zero-cost targets (bench pieces their owner cannot play)

| player | ours / market | age | owner · posture | costs them | adds to David |
|---|---|---|---|---|---|
| **DeVonta Smith** | WR24 / WR19 | 27.7 | YippeKiYay · contender | **0** | **1,551** |
| **Kyle Pitts** | TE11 / TE8 | 25.8 | Florida Man · ascending | **0** | **910** |
| **Derrick Henry** | RB11 / RB22 | 32.6 | YippeKiYay · contender | **0** | 843 |
| Christian Watson | WR44 / WR30 | 27.2 | YippeKiYay · contender | 0 | 243 |
| Terry McLaurin | WR54 / WR31 | 30.9 | Kissane's Team · balanced | 0 | 168 |
| Quentin Johnston | WR28 / WR34 | 24.9 | Free Kelly · contender | 0 | 56 |
| Eli Stowers | TE25 / TE11 | 23.3 | jkazzz · ascending | 0 | 32 |

### For contrast — expensive, i.e. not realistically available

| player | ours / market | owner | costs them | adds to David |
|---|---|---|---|---|
| Josh Allen | QB1 / QB1 | Free Kelly | 6,282 | 6,281 |
| Bijan Robinson | RB2 / RB1 | jgil96 | 8,344 | 8,206 |
| Ja'Marr Chase | WR2 / WR1 | rzalika | 8,258 | 7,883 |
| Puka Nacua | WR3 / WR2 | YippeKiYay | 5,083 | 6,634 |

The pattern across the whole table: **for the genuine stars, cost ≈ gain.** The market is efficient
on the players everyone wants. The asymmetry only appears further down a roster, which is exactly
why David's backfill refinement is the right lens and why "is their best better than mine" was the
wrong question.

## Also persisted from the earlier, superseded pass

David's own bench surplus — what he could send — and the earlier "cannot start" candidate list are
regenerable from the same script. **`proposals/009-who-holds-what/target-data.js` must not be used:**
it was written before the degeneracy was found and still carries the invalid `surplus` field.
