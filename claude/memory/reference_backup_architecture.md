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
