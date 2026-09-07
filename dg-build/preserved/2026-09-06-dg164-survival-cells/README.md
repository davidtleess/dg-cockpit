# DG-164 survival cells — PRESERVED 2026-09-06

Moved out of the session scratchpad (`/private/tmp/...`) because that is a temp directory:
a reboot or session cleanup would take the canonical cell file another lane is building
against. Findings live in the tickets; **the DATA only lived here.**

## Canonical
`retention_R_v3.json` — 128 cells, 40 suppressed. See `CANONICAL.md` for semantics, the
three warnings, and the list of superseded files.

## Inputs preserved too, not just outputs
`followup_FIXED.parquet` is the cohort table the cells are computed from. With it and the
scripts below the cells regenerate without touching the live runtime artifact — which is
rewritten at 09:00 / 11:30 / 14:00 and therefore has a shelf life of hours.

## Regenerate
    panel.py           1999-2025 player-season panel from nflreadpy   (slow, network)
    rebuild_fixed.py   cohorts + tie-robust bar -> followup_FIXED.parquet
    publish_v3.py      -> retention_R_v3.json, fragility rule ASSERTED

## What is NOT here
The market-format work (DG-169) needs nothing preserved: it reads `nflreadpy` 2025 season
stats, which are immutable upstream, and his league settings from
`league_runtime/runs/league-20260904T130046Z/` — a DATED snapshot, not the rewritten latest.
