# 003-RELAY — League data must refresh on the daily cadence (client directive)

**David's 60-second review**

| ID | Summary | Severity |
|----|---------|----------|
| F1 | League snapshot capture is manual, 22 days stale | High |
| F2 | Derived league artifacts frozen with the snapshot | High |
| F3 | Every league-data surface shows June realities today | High |
| F4 | Artifact age should be visible on-surface | Medium |

---

From: Studio. This item carries a direct client instruction, given 2026-07-15 in review:
**"we have to have frequent refreshes of our league data."** Treat the requirement as ruled; the
mechanism below is my read of the gap — correct it if the real cause is different.

## F1 — The league snapshot is captured manually and is 22 days stale

**Claim:** the Sleeper league snapshot — the source for rosters, ownership, and all cross-league
artifacts — is not on the scheduled capture cadence.

**Evidence:** `app/data/league_snapshots/sleeper_universe_snapshot_latest.json` is dated
**2026-06-23 11:36**. Every file in that directory is named `phase17`/`phase18` with hand-run
timestamps (May 21, May 24, Jun 23) — development-phase runs, not scheduled ones. The seven
scheduled daily jobs (09:00 FantasyCalc → 10:15 backup) cover market and model data; none of them
captures the league. Market data has a robot; league data waits for a human.

**Expected:** a scheduled league snapshot capture. Sleeper's API is unauthenticated, read-only,
and already called live by Roster Audit at request time — the same client, run once daily before
the 09:45 What-Changed build, closes the gap. Frequency is yours to cost (the client said
"frequent"; daily matches the rest of the cadence; his league runs daily waivers).

## F2 — Everything derived from the snapshot is frozen with it

**Claim:** the downstream league artifacts carry the same June 23 stamp and will stay frozen until
the snapshot refreshes and their builders re-run.

**Evidence:** `team_posture_latest.json` (2026-06-23), `team_value_matrix_latest.json`
(2026-06-23), `roster_cut_report_latest.json` (2026-06-23), and the trade-assets ownership flag
already relayed as **001b N7** (Bo Nix, QB12 market / QB4 model, shown unrostered on June 23 data).
Live check: `GET /api/league/pulse` today reports `source_artifacts.team_posture.captured_at` and
`.team_value_matrix.captured_at` = 2026-06-23T13:17Z beside `league_opportunity` = 2026-07-15 —
three-week-old and same-day data composited on one screen.

**Expected:** the derivation chain (snapshot → posture / value matrix / cut report / trade assets)
runs on the same schedule as the capture, so "latest" means yesterday at worst. Note N7's live-read
fix for ownership remains right and is complementary — this item is about the artifact chain.

## F3 — User cost, concretely

One month into the offseason, every league-facing read is a June photograph: partner postures may
have flipped (a rebuilder who just bought veterans is a contender), rosters have moved through
trades and daily waivers, and the Trade Lab's counterparty inputs describe teams as they were
three weeks ago. The client is actively rebuilding — counterparty scouting is his weekly question —
and the surface answering it cannot currently be trusted without a manual Sleeper cross-check,
which defeats the product's purpose.

## F4 — Artifact age should be legible on-surface

League Pulse returns `status: degraded` permanently and buries per-artifact dates in a provenance
rail. Once the capture is scheduled, surface the snapshot's age as plainly as What-Changed's
stale-data badge (≥26h rule) on every league-derived module, so a missed run is visible the
morning it happens rather than three weeks later.

---

F1 is the fix; F2 follows from it; F4 is an hour of UI. Please confirm, fix, or refute with a
concrete technical reason — and if a league-snapshot schedule already exists and is failing
silently, that is worse than absent, and worth saying so.

— Studio

---

## Disposition (engineering response, 2026-07-15 — see docs/studio-relays/2026-07-15-003-RESPONSE-draft.md)

All four items confirmed/accepted. Their strengthened mechanism, which Studio endorses: capture
is absent, not silently failing (the better answer to the closing question); daily runs publish
to a runtime location with immutable per-run retention (league history becomes queryable — the
Bo Nix case answerable historically); snapshot + derived artifacts publish as one atomic set, so
a consumer can never composite a new snapshot with an old matrix; a failed run leaves the last
complete set readable and raises a named degraded state. F4 ships as one module-level age badge
(descriptive only) plus an age-skew guard beyond the ask: fresh market prices composited over
stale rosters raise a named flag, compared on true source clocks. Complementary to 001b N7;
neither waits on the other.
