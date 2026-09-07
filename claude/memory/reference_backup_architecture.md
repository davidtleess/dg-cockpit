---
name: dg-backup-architecture
description: "The three-copy backup model for Dynasty Genius — code to GitHub, data to GCS, cockpit to dg-cockpit repo — and the new-Mac migration path"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 38369f00-9dee-487c-8809-f585ebd3dff6
---

Set up 2026-07-15. Three-copy model:
1. **Product code** → github.com/davidtleess/dynasty-genius (private; crew keeps it pushed).
2. **Irreplaceable data** (point-in-time market captures, SQLite DBs, ~2.6 GiB) → gs://dynasty-genius-backup-dtl via the crew's daily 10:15 launchd job (`com.davidleess.dynasty-backup-irreplaceable`), timestamped runs + latest.json.
3. **The cockpit layer** → github.com/davidtleess/dg-cockpit (private): flight deck script, tmux.conf, dg aliases, tower.md, Claude memory dir, all of ~/frontend-studio (DAVID.md, proposals), codex/gemini configs, launchd plists. Auto-backed-up nightly at 22:00 by `com.davidleess.dg-cockpit-backup` running ~/dg-cockpit/backup.sh (rsync → commit → push; no-op when unchanged).

Secrets are NEVER in the cockpit repo — backup.sh strips the settings.json env block via `jq del(.env)`; David's global rule: gitignore before secrets, never commit them. On migration, generate a NEW GitHub PAT.

**New-Mac migration:** install brew + git/gh/jq/tmux/node/python3.14/gcloud + the three agent CLIs, auth gh + gcloud, clone dg-cockpit, run bootstrap.sh (restores configs/memory/studio/launchd, clones product repo, rsyncs latest GCS data run), then venv + frontend build + Sleeper env vars by hand, then `dg`.

**How to apply:** if any cockpit file changes location or a new durable artifact class appears (e.g., a new agent lane), add it to backup.sh the same day. Verify pushes actually land — gh repo create claimed success once while the remote stayed empty (http.postBuffer fix). See [[frontend-studio-outsider-agent]].

## VERIFIED AGAINST THE BUCKET 2026-08-22 — the "unreliable backup" reputation is STALE

Copy 2 (GCS data) is **healthy and has been for weeks.** Measured, not inferred:
- Last run `20260821T141500Z` — **completed, exit 0, `sha256_verified: true`, 642 files / 3.16 GB.**
- **Files in the run inventory MISSING from GCS: 0.** All **43** manifest `required` entries covered.
  `league_runtime/runs` (the manager-history snapshots) = **222 files** present.
- 41 of 50 runs completed. **The last failure was 2026-08-05 — 16 consecutive clean runs since**,
  growing 577 files/2.63 GB → 642/3.16 GB. **Do NOT re-quote "fails 18% of runs" or "9 runs in 49"
  as a live condition** (the season build spec still says this at lines 543 and 576). The
  conclusion those lines support — keep `league_transactions.db` excluded — still holds, but on the
  better ground that the store is rebuildable from a public API, not because the backup is flaky.
- 14 run generations retained. One optional file chronically absent:
  `app/data/footballguys/observations.db` (`missing_optional`, non-fatal).
- **Freshness:** runs 10:15 daily, so the newest copy is always up to ~24h old. `nflverse_usage.db`
  and `league_transactions.db` are DELIBERATELY excluded as rebuildable — verified that nflverse
  still serves the full 2026 depth-chart series back to March.

**Copy 3 (dg-cockpit) IS the stale one.** 2026-08-22: last commit `1cc9836` dated **2026-08-19**,
**47 files uncommitted**, 0 unpushed. Not a network problem — consistent with the known
`verify.sh` exit 127 (`node: command not found`) aborting before `git add -A`. See
[[project_loop_control]]. Untouched; outside the season sprint.

**Verification method worth reusing:** do not trust the local log. Pull
`runs/<run_id>/run_inventory.json` from the bucket and set-compare its `files[].path` against
`gcloud storage ls -r`. Note `ls -r` emits `path/:` directory headers that are NOT objects — they
inflate a naive count (915 vs 642 here) and look exactly like a discrepancy.

## ⚠️ THE FOURTH COPY THAT ISN'T ONE — `~/dg-wt` ticket worktrees, found 2026-08-23

**The three-copy model above does not cover work in progress, and that gap was live for days.**
Measured at closeout on 2026-08-23: `git ls-remote --heads origin 'refs/heads/ticket/*'` returned
only DG-031 and DG-035. **Seven other ticket branches had no upstream at all** — DG-014, 015, 020,
021, 022, 023, 029. `~/dg-wt` appears nowhere in `dg-cockpit/backup.sh`, and it is code, so GCS
(copy 2) is not its home either. `~/dg-wt/DG-022` alone held **1,579 uncommitted insertions**
including a new source module, a contract test and a React component; DG-021 held a real
`pvo_assembler.py` fix; DG-015/023/029 each carried a finished commit that had never left the disk.

All nine are on `origin` as of 2026-08-23. **But nothing prevents this recurring** — `dg-work.sh`
creates a branch with no upstream, and `dg-land.sh` only pushes at merge time, so every in-flight
ticket is single-copy by default from creation until it lands.

**How to apply:** treat an unpushed `ticket/DG-NNN` branch as unbacked-up work, not as "in progress".
When checking backup health, `git ls-remote --heads origin 'refs/heads/ticket/*'` against
`git branch --list 'ticket/*'` is the check — the three-copy story will otherwise read as green while
a day of work sits on one disk. **Never advise recreating a worktree (`dg-work.sh` refuses in place,
so the only repair is remove-and-recreate) until its branch is confirmed pushed** — that sequence is
how the work would actually be destroyed. See [[dg3-build-system]].

---

## ⛔ 2026-09-06 — A FULL DAY'S WORK WAS ONE REBOOT FROM GONE, AND NOTHING DISTINGUISHED THE TWO DIRECTORIES

The entire dynasty-asset assembly — `v2.py`, the built board (4,041 rows), both isolation baselines, and the
**predictions recorded in advance**, which were the only evidence that two findings were predicted rather than
rationalised — lived in **`/tmp`**, uncommitted, untouched by the repo. Not the session scratchpad. `/tmp` is the
system temp directory and clears on reboot.

**Why it went unnoticed for a whole day: nothing rebooted.** The scratchpad and `/tmp` behave identically right up
until they do not — the same shape as every green check thrown out this week, where the failure path and the
success path were indistinguishable until someone asked.

⚠ **THE INPUT LOOKED GONE AND WAS NOT — ✅ RECOVERED, and this is the more useful half.** The board was built against the served artifact
`2026-09-05T13:00:48Z`; the 14:00 refresh had already overwritten it with `18:00:02Z`. **The runtime artifact is
rewritten at 09:00 / 11:30 / 14:00, so anything built from the live file has a shelf life measured in hours.**
The rows looked like an output nobody could reproduce — precisely the state we had spent two days refusing to
accept from anyone else.

✅ **BUT `app/data/model_forward_capture.db` HAD IT.** It carries `artifact_vintage` across two tables — served
scores in the joinable table, projections in `model_forward_prediction_snapshot` — and all 583 rows of the
overwritten `13:00:48Z` vintage were there, with every one of the 490 projections matching the built board
exactly. **Ten minutes of looking turned an orphan into an artifact of record.** ⛔ So do NOT declare a runtime
vintage lost without querying that store first; unlike
[[reference_te_v3_metadata_unrecoverable]], this one is genuinely recoverable.

**How to apply:**
1. **Never `/tmp`.** Use the session scratchpad named in the environment block, and move anything that matters
   into a ticket branch in the repo the moment it is worth keeping.
2. **Preserve the INPUT, not only the output.** Snapshot the artifact rows a result consumed, beside the code that
   consumed them. Otherwise the next refresh makes your own work unreproducible.
3. **Before declaring a vintage lost, check `app/data/model_forward_capture.db`** (`model_forward_prediction_snapshot`,
   keyed by `capture_date`) — it holds dated rows and may reconstruct an overwritten vintage.
4. **An output you cannot regenerate is not evidence.** If it cannot be re-derived, label it a superseded snapshot
   and re-derive fresh. No exception because the work is ours.
See [[reference_measuring_the_live_pvo_artifact]], [[feedback_a_rebuild_invalidates_every_claim_from_the_old_build]].
