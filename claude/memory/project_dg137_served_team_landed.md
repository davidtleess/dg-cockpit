---
name: project_dg137_served_team_landed
description: DG-137 (served team = Sleeper's current team, not the model's 2025 feature team) landed 862a1afb on origin/main 2026-09-02 07:47 and LIVE in trunk since 14:30 (Fred's pull + restart on David's "go"; pid 95078 was replaced by 90590 at 21:34 for DG-135/136, API pid 95078); artifact player.team flips on the first green refresh after that (14:00 run)
metadata:
  type: project
---

**DG-137 landed `862a1afb` on `main` 2026-09-02 07:47 ET (Tower, via dg-land.sh on top of Fred's DG-128 merge `1dff211f`).**
One rule in one place: `served_team(sleeper_player, fallback)` in `src/dynasty_genius/universe_pvo_batch.py`,
imported by `app/services/roster_auditor.py`. Sleeper wins whenever its block carries the `team` KEY
(`None` = Sleeper says no team now; `""` reads as None); the model's `nfl_team` fills only a block with NO key,
which the snapshot builder (`sleeper_universe.py:236-249`) never writes. A plain `or`-flip would have served
the 2025 team for every cut player. Player-detail route (`app/api/routes/players.py` `_served_team_label`)
serves "FA" only when `sleeper_status == "Active"` and no team (5,567 rows); Inactive/IR/PUP/NFI no-team keep
the blank (3,511) — **David never ruled on the FA-for-Active-only choice; he may overrule it.**
Tests: `tests/contract/test_served_team_is_sleepers.py` (12; 7 red on old code); the old pin in
`test_surface3_pvo_preservation.py` flipped KC→FA.

**Trunk at land time:** HEAD `1dff211f`, API pid 4070 (07:44:16), `frontend/dist` rebuilt 07:44 — all Fred's
doing on David's "go", NOT Tower's. DG-137 is backend-only: OpenAPI byte-identical, no bundle rebuild needed.

**LIVE 2026-09-02 14:30 (Fred, on David's "go"):** trunk `git pull --ff-only` 1dff211f → 862a1afb; NO bundle
rebuild (0 files under frontend/ in the diff; index-BZ1jEJNN.js still served); `launchctl kickstart -k` → API
pid 4070 → **95078** (14:30:23). Verified on the live API: Mitchell NYJ, Mendoza LV, Black SF; 27 rows, 24 with
range. Tower (davidleess-0b) told the pid and watches the 14:00 refresh for 189 → 0.

**What went live when:** roster audit + card label → trunk pull (David's/Fred's hand) + API restart. On
David's roster the audit flips 3/27: Adonai Mitchell IND→NYJ (real move), Mendoza LVR→LV, Black SFO→SF
(nflverse vs Sleeper abbreviations). Artifact `player.team` (189 disagreeing ENGINE_B rows → 0) only on the
first GREEN `run_pvo_refresh` from a trunk that has 862a1afb (labels 09:00 chain / 11:30 / 14:00); that
rebuild flips `vintage_changed=true` once — reports only, nothing gates (`daily_diff.py:37`).

**Why:** cutdown week is when a 2025 team label is wrong most often, on the card David opens to decide a trade.
**How to apply:** verify "live" by reading the roster audit for Mitchell = NYJ, never by the land. See
[[project_dg133_partition_fix_landed]], [[reference_trunk_frontend_bundle_is_a_manual_build]],
[[feedback_check_when_not_just_what]].
