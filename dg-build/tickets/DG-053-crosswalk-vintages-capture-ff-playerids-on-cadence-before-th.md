# DG-053 — Crosswalk vintages: capture ff_playerids on cadence before the season burns identity truth

**Layer:** 2  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG053-20260826  ·  **DG 3.0**
**Edge distance:** foundation  ·  **Size:** 1.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**⏱ PRE-FREEZE by David's ruling 2026-08-26 ("2. pre freeze") — lands before 09-04.**
Minimal-scope option: raw content-addressed daily snapshot of ff_playerids only (~0.5d), plist
riding the SR-09 D5/D6 launchctl session; the reconciliation layers can follow post-season.

**Problem:** The product's only sanctioned identity join is a single crosswalk file frozen 2026-05-16, hard-pinned by three ingest modules, and no scheduled job captures fresh crosswalk snapshots — the eval lane loads it live but nothing archives it on cadence. Unlike stats, there is no upstream archive of the crosswalk as-it-stood-on-a-date, so every in-season identity change (rookie activations, renames, new Sleeper ids) that is not snapshotted now is point-in-time fuel the 2027 rebuild can never recover. Deliverable: a dated, content-hashed ff_playerids snapshot stream in the daily capture (an SR-09 chain step, or standalone per the current per-producer pattern), plus a documented governed-refresh procedure that promotes a chosen snapshot to the GOVERNED_CROSSWALK pointer under a receipt — resolution stays pinned and reproducible, capture goes live. Capture-shaped and small: worth putting before David as a capture-critical candidate under the post-freeze rule, without displacing sprint tickets.

**How we know:** src/dynasty_genius/nflverse_usage.py:78-80 (GOVERNED_CROSSWALK pinned to ff_playerids_20260516.json); src/dynasty_genius/playerprofiler.py:73 (same frozen pin); app/data/identity/_runs/ holds exactly one crosswalk vintage, dated 2026-05-16; src/dynasty_genius/adapters/nflreadpy_qb_adapter.py:483-497 (live load exists only in the validation lane, no scheduled capture); audit L2 biggest_risk (crosswalk 'frozen in May' rotting weekly)

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.

---

**✅ BUILT AND LANDED 2026-08-26 (merge `34a9a970` on `main`, pre-freeze per David's "2. pre
freeze"), trunk pulled.** Minimal-scope option taken: `scripts/run_ff_playerids_snapshot_capture.py`
— nflreadpy loader → deterministic canonical hash (row/key order immune) → append-only
content-addressed store `app/data/identity_snapshots/` + `latest.json` + marker; idempotent no-op
on unchanged content; fetch failure = loud failed marker + exit 1; touches NO consumer (the frozen
2026-05-16 snapshot stays where production reads it). 9 tests RED-first; plist
`com.davidleess.dynasty-ff-playerids-snapshot` (06:45) committed-not-installed —
**install rides Thursday's launchctl sitting:**
`ln -s .../ops/launchd/com.davidleess.dynasty-ff-playerids-snapshot.plist ~/Library/LaunchAgents/`
then `launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.davidleess.dynasty-ff-playerids-snapshot.plist`.
First scheduled fire Fri 06:45 (or Thu if installed before 06:45 — it wasn't). The full-scope
remainder (reconciliation layers) stays post-season per the roadmap.

*(Provenance: the closeout above was originally written 2026-08-26 to a mis-truncated filename —
`…-before-t.md`, one character short of the tooling's 60-char slug — and merged back here the
same evening; the stray file is removed.)*
