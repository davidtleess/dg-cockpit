---
name: project_dg192_headshot_sources_2026-09-08
description: "DG-192 headshots — where player photo identity actually lives on this machine: 950 of the 954 workspace players resolve to an exact ESPN id from two LOCAL files, no Sleeper API call needed."
metadata:
  node_type: memory
  type: project
---

**Measured 2026-09-08, read-only.** Population = `~/dg-wt/DG-192/runs/20260908T102054Z/players.json`, **954 unique
all-numeric sleeper ids** (WR 387 / RB 243 / TE 197 / QB 127). Review: `/private/tmp/dg192-source-review.md`.

**The two local sources that solve it — no network call:**
1. `~/dg-wt/DG-178/runs/20260906T191548Z/dg178_nfl_roster_capture/roster_2026.csv` — carries `sleeper_id`,
   `espn_id` **and a direct per-player `headshot_url`** (host `static.www.nfl.com`). 775 of the 954 present, 775
   with espn_id, **765 with a real URL**. ⭐ A captured URL beats an ESPN URL built from a template — the brief
   never mentioned this column existed.
2. `app/data/identity_snapshots/ff_playerids_20260904_f95b7460aa55.json` — 20-way crosswalk, **949 of the 954**
   carry an espn_id, closing 178 of the 182 the roster capture misses.

Union = **950 of 954**. The only four with no id anywhere: 13270 CJ Daniels, 13516 Max Bredeson, 13602 Jack
Strand, 6618 Isaiah Searight.

⛔ **Two dead ends, do not re-check:** `universe_pvo_runtime.json` `identity_ids.espn_id` is **null on all 12,226
rows**; the league snapshot player records carry **no external ids at all** (age/name/position/team only).

**Join integrity (the wrong-face question):** across the 775 joinable, **position agrees 775/775**, and where both
sources carry an espn_id **775 agree, 0 disagree**; the 949 crosswalk espn_ids are **949 distinct, 0 collisions**.
Names differ on 7, all nickname variants of the same man (Nate/Nathan Carter, Kenny/Kenneth Gainwell, Chig/Chigoziem
Okonkwo …) — which is the concrete argument for id joins over the fuzzy name joins the brief forbids.

**Baseline for duplicate detection:** the seed cache `app/data/assets/headshots` held **261 jpg, 261 distinct
hashes, 0 duplicate groups, 0 orphans** — so any duplicate group after a fetch run is NEWLY introduced, not
inherited. ⚠ Group by hash, never size: two seed images share byte size 111,643 with different content.

⭐ **RESOLVED 09-08, and my aim was wrong — the placeholder trap is NFL.com, not ESPN.**
- **ESPN is honest:** `a.espncdn.com/i/headshots/nfl/players/full/<id>.png` returns **404** for a missing photo
  (2 such 404s in root's own attempt log, plus root's 99999999 probe). My silhouette hypothesis about ESPN is
  **REFUTED — do not repeat it.**
- ⛔ **NFL.com's PLAYER PAGE serves the generic black-helmet silhouette at HTTP 200**, a well-formed 400x400 PNG,
  56,300 bytes, sha256 `9f9ae21279f4ae92…b26bf27`. Found live on Isaiah Searight. Status 200 + decodable bytes is
  NOT evidence of a face — you must LOOK at it. A [[feedback_the_failure_path_returns_the_success_signal]] instance.
- ✅ The safe/unsafe line: a **captured per-player** `headshot_url` (`/image/upload/f_auto,q_auto/league/<asset>`,
  from the DG-178 capture) is real; an asset **scraped from a player page** (`/image/private/…`) can be the
  placeholder. Extending a fallback chain by page-scraping reintroduces the trap.

**Why:** the next lane to touch photos will otherwise burn a Sleeper fetch re-deriving a mapping that two files on
disk already contain, and will not know the clean-261 baseline that makes a duplicate report meaningful.
**How to apply:** resolve identity locally first, prefer the captured `headshot_url` over any constructed URL, and
hash-check every constructed-URL fetch against the 261-image zero-duplicate baseline.

## ⭐ 09-08 addendum — the Izzo/Conklin ESPN id SWAP, and CFBD as the independent adjudicator

⛔ **The current Sleeper dump has two espn_ids exactly SWAPPED**: sleeper 5094 Ryan Izzo and 5133 Tyler Conklin
each carry the other's id. Both are TEs, so a position check cannot catch it. Local sources are CORRECT.

⭐ **The adjudicator is `app/data/cfbd_cache/player_receiving_<year>.json` — College Football Data, a provider
independent of nflverse/DynastyProcess.** Its `playerId` field IS the ESPN athlete id, and rows bind it to a
COLLEGE TEAM across seasons: 3122920 → Izzo, Florida State 2014-17; 3915486 → Conklin, Central Michigan 2015-17.
Corroborated by `app/data/identity/_runs/te_cohort_2018_2025.json` (college + DOB + 10 id systems per player).
**Use this to settle any future espn_id dispute — it binds id → school → man, not id → name.**

⛔ **Sleeper's `espn_id` column is NON-AUTHORITATIVE**: null for 666 of 950, and across the 284 it does populate
it agrees 282 / disagrees 2, both being this swap. Never let it overwrite the local mapping. Its value is the
**CDN photo keyed by sleeper_id**, which is unambiguous (945 of 951 photos came from there).

**Correction to my own numbers above:** "950 resolve to an ESPN id" was imprecise — my predicate was "has an id
OR already has bytes". Precisely: **949 have a local espn_id, 950 counting root's Sleeper fetch, 951 adding
13324 Matthew Hibner's existing seed bytes.** Hibner has NO espn_id anywhere; he was the difference. The four
with no id at all are 13270 CJ Daniels, 13602 Jack Strand, 13324 Matthew Hibner, 13516 Max Bredeson.

**Isaiah Searight 6618 recovered:** the NFL has no photo of him (hence the silhouette). The only real image is
his official Fordham college portrait, `https://fordhamsports.com/images/2018/8/20/SearightHS.jpg` (1486x2000,
sha256 `c39f104a…cd1e17b9`), served as **WebP**, verified by eye and by four independent id bindings.

⚠ **Allow-listing that Fordham host — two traps.** Match the parsed lowercased hostname with **equality**, never
`endswith`, or `notfordhamsports.com` and `evil-fordhamsports.com` both pass. And under equality
`www.fordhamsports.com` is a **different host**: the real URL carries no `www`, so a scraped `www` variant is
refused at run time and reads like a bug. Same rule already guards `static.www.nfl.com` in
`scripts/build_workspace_headshots.py`.
