---
name: project_live_2026-09-04_morning
description: "2026-09-04 08:15 ET — the switch-on HAPPENED on David's 'yes': trunk pulled to c7ac3484, frontend rebuilt, API restarted (pid 39384). Range gone, rookie marker, ownership line all LIVE and verified. DG-143's 114 players NOT visible until the 09:00 chain rebuilds the artifact."
metadata:
  type: project
---

**THE SWITCH-ON HAPPENED — 2026-09-04 08:15 ET, on David's "yes" at 08:13** (he had said "tomorrow is fine"
09-03 19:26, "land it when the review is clean" 19:42, and at 08:11 "you can commit and push the work you have
ready all of it" — which Greg read as git-only and asked again before pulling; "yes" was the go).

Sequence, all verified: overlap check first (`comm -12` of the trunk's 25 dirty paths against the 31 files in the
17 incoming commits = **empty**) → `git pull --ff-only` `6f517027` → **`c7ac3484`** 08:15:00 → `npm run build` in
`frontend/` → bundle **`index-Cxw-1PE3.js`** → `launchctl kickstart -k gui/501/com.davidleess.dynasty-api`
→ **pid 50754 → 39384** at 08:15:28. David's 3 modified + 22 untracked trunk files intact.

**LIVE AND VERIFIED ON HIS OWN DATA (not tests):** served page references the new bundle; bundle carries
0 × "Likely range", 0 × `dg-roster__band`, 1 × `dg-roster__rookie`, "Rookies" filter; his 4 rookies flag
`is_prospect` AND now carry `draft_class` 2026 (4 of 27, was 0 of 27 — DG-147's roster half is live);
`/api/players/<his>` serves `league_ownership {rostered, Dleess, roster_id 1, as_of 2026-09-03T13:00:45Z}`.

**⚠ THE SECOND HALF OF "LIVE": THE ARTIFACT.** A pull + build + restart does NOT change the numbers. The API
serves `app/data/valuation_runtime/universe_pvo_runtime.json`, which at the switch-on was still **09-03 14:00**.
So DG-143's 114 unlocked players (Wilson, Allen) were STILL BLANK at 08:16 — the gate constant is 4 in the code,
but the served numbers come from the artifact. The **09:00 daily chain** rebuilds it. Same for DG-147's 255→263.
**Add this to [[reference_trunk_frontend_bundle_is_a_manual_build]]: pull → build → restart → AND the next
artifact rebuild, for anything that changes a NUMBER rather than a rendering.**

**Landed after the pull, therefore NOT live today:** DG-149 (`3674d940`, Bob — two team signals) and DG-141
(Fred, David ruled **"B"** at ~08:10: drop the Sleeper player-list hash from the content check as well as the
timestamp from provenance). Trunk is 3 behind at 08:18. **Next safe pull window: after 14:00** (Fred: the 11:30
and 14:00 refreshes also capture, so a pull between 09:00 and 14:00 splits the day's vintage pair).

**Open for David:** on a card for a player with no NFL team whom nobody owns, "FA" now appears **three** times —
the header (his ruling), the League team line (his ruling), and DG-145's owner sentence. Bob offers a one-line
copy change to quiet the third. Also parked on his word: DG-148 (Sleeper's "0" starter placeholder served as a
rostered player — producer path).

**Trap Bob measured, worth keeping:** inside a ticket worktree `app/data/league_runtime` is empty and
`load_production_league_set` falls back to the COMMITTED SEED snapshot, so league facts measured in a worktree are
seed answers (he saw 8 managers named instead of production's 9). **Measure league data only in
`~/dynasty-genius-product`.**

## ✅ THE 09:00 CHAIN PROVED IT — 09:01:29 ET, measured on the live product

Artifact rebuilt 09-03 14:00 → 09-04 09:00. **DG-143 is real:** universe scored **468 → 582** (exactly the 114),
David's roster **24 → 26 of 27**, **Garrett Wilson 68.5**, **Braelon Allen 20.5**. **DG-147 is real:** all eight
rostered-not-drafted rookies now carry numbers (Douglas 61.39, Hibner 50.28, Benson 22.03, Joly 59.05, Allen 27.14,
Lance 38.12, Raridon 69.69, McGowan 5.35). ⚠ Do NOT verify DG-147 by counting `league_context.rostered` (274 both
days — that is the league's roster count, not the index-admission count Bob measured as 255→263); check the eight
names.

**The morning read HEALED, as predicted:** before the chain `/api/league/what-changed` served
`model_multi_vintage_ambiguous`, **0 deltas**, overall `degraded` — caused by the manual 09-02 14:50 re-capture, NOT
by a quiet night. After: model `ok`, window 09-03 → 09-04, **387 deltas**, market ok with 25 top movers, overall `ok`.
**Read `daily_diff.model.status` before ever believing "nothing moved".**

**Tank Dell is the one remaining blank on his roster** and no threshold reaches him: `PRE_MODEL`, completeness 24%,
`games_t` itself missing. He is the honest case for a future "score from prior seasons only" decision — David's.

**Still NOT live (trunk 8 behind after the 09:00 chain):** DG-149 `3674d940` (two team signals) and DG-141
`ea067645` (David's B). Next window: **after the 14:00 refresh today, or tomorrow before 09:00** — Fred recommends
tomorrow (nothing can capture between the pull and the chain). Before pulling after 14:00, require
`model_forward_capture_latest_report.json` capture_date 2026-09-04 with artifact_vintage ≥ 2026-09-04T18:00Z.
⛔ NO MANUAL PVO REFRESH on a pull day after the pull — that is what cost 09-02.

**Open for David:** the second-pull window · Bob's replacement sentence for the flag (DG-150, held at `83fdf701`):
*"Something behind these numbers changed since yesterday, and none of the players we could compare moved."* ·
whether to quiet the third "FA" on a card · DG-148 (producer, parked on his word).

**⚠ Greg's own error, recorded because it nearly shipped:** filing DG-150 I told Bob the new sentence "has to say a
PLAYER changed" — inferred from Fred's summary, not read from the producer. Bob read `daily_diff.py:305` and refuted
it: the emit carries status, two vintage hashes and an empty delta list — no field, no player, no cause — and the
flag fires for at least four causes (player details, compared population, a `governance_version` bump which is still
hashed, and a genuine model rebuild). A sentence naming players would be as false as today's naming models.
**Do not put a causal claim in a ticket without reading the producer.**

