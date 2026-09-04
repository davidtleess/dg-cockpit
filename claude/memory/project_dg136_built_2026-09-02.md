---
name: project_dg136_built_2026-09-02
description: "DG-136 (capture refusal exits 0) LIVE on trunk 2026-09-02 21:34 — landed a1f1023f 21:29, Fred pulled trunk 21:33 + rebuilt bundle (for DG-135) + kickstarted API pid 90590 on David's go; first scheduled run to execute it = 09-03 09:00 chain; never exercised by a real refusal yet"
metadata:
  type: project
---

**DG-136 LIVE ON TRUNK 2026-09-02 21:34** — landed `a1f1023f` on main 21:29 (David ran the push and `dg-land.sh DG-136` himself); on his "go" Fred ran, from `~/dynasty-genius-product`: 21:33:34 `git pull --ff-only` 862a1afb → a1f1023f · 21:33:41 `npm --prefix frontend run build` → `index-C6XzDCYI.js` (replaces 07:44's `index-BZ1jEJNN.js`; needed for DG-135's generated client) · 21:34:03 `launchctl kickstart -k` → **API pid 90590** (was 95078) · probes 200 on /api/health, /api/engine-b/scores (contract now lists 503), /api/system/capture-health, /api/roster/audit (27 players), /api/roster/capacity · Greg (`davidleess-0b`) sent the pid 21:35. Worktree `~/dg-wt/DG-136` is GONE (don't cd there). Remote branch `origin/ticket/DG-136` still exists at `11646a09` (merged). **The tests are the only evidence — no real refusal has run through this code yet; the 09-03 09:00 chain is the first scheduled run to execute it.**

- Fix: `_capture_refusal()` in `scripts/run_pvo_refresh.py`; both runner paths; fail closed (only a
  literal capture `status == "ok"` clears the stage); pair never rolled back; driver untouched.
  7 contract tests, 4 red on old main. Suite 6778 / 33 skipped.
- **Attribution that the ticket TITLE gets wrong:** the chain did NOT mark 08-31 ok — its 09:00 step
  failed on a raised symlink error. The two exit-0 refusals were the STANDALONE label's 11:30/14:00
  runs. The T+1 10:30 store-hole alert DID name the missing day. Don't requote "chain reported green
  on 08-31" or "unnoticed".
- **Product-visible tradeoff David may overrule later:** on a refusal morning the shell pill reads
  "Attention" and System Health shows pvo_refresh `producer_failed` even though the served pair is
  fresh (core_substrate rollup). A distinct "refreshed, not captured" state would be a card change.
- Both launchers (09:00 chain, 11:30/14:00 standalone label) run the script from trunk's checkout, so
  the pull alone made THIS ticket live; the restart was for DG-135's client.
- dg-build local commits (closeout + board row + acceptance + live record `077fc54`) unpushed, ahead 3;
  I held the push for David's word. **Provenance corrected 2026-09-02: that is MY convention, not a
  rule David issued** — see [[feedback_my_conventions_are_not_davids_rules]].

Related: [[project_dg135_landed_dg130_scoped_2026-09-02]], [[reference_sleep_catchup_guard]],
[[feedback_check_when_not_just_what]], [[reference_symlink_write_through]].
