#!/bin/bash
# dg-cockpit backup: snapshot the cockpit layer into this repo and push.
# Run manually or via the nightly launchd job. Secrets are stripped, never stored.
set -euo pipefail
# launchd jobs get a bare PATH (/usr/bin:/bin:...) — add Homebrew/local so jq and git helpers resolve
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
REPO="$HOME/dg-cockpit"
cd "$REPO"

mkdir -p home claude/agents claude/memory claude/tower claude/skills claude/hooks frontend-studio codex gemini launchagents

# Cockpit scripts and terminal config
cp "$HOME/dynasty_flight_deck.sh"  home/
cp "$HOME/.tmux.conf"              home/tmux.conf
# Only the dg-relevant aliases, not the whole profile (which may hold private lines)
grep -E "alias dg|alias dg-|claude --agent" "$HOME/.bash_profile" > home/dg_aliases.sh || true

# Claude Code: Tower's charter, memory, and SANITIZED settings (env block stripped — it holds tokens)
cp "$HOME/.claude/agents/tower.md" claude/agents/
jq 'del(.env)' "$HOME/.claude/settings.json" > claude/settings.sanitized.json
rsync -a --delete "$HOME/.claude/projects/-Users-davidleess/memory/" claude/memory/

# Tower's WORKING LAYER — added 2026-07-26 on David's word. The charter and memory
# above tell a new Tower what the board is; these tell it how to observe and what
# the doctrine was learned from. Without them a fresh Tower boots knowing the rules
# and holding no instrument.
#   tower/  — the TOWER-1 ticket, the 2026-07-25 failure record, ghost-check and
#             the pane watchers, and durable measurement evidence.
#   skills/ — Tower-authored skills.
# Excludes transient watcher state; those are runtime artifacts, not durable.
#
# 2026-08-08: this loop replaced a HARDCODED single-skill rsync. Tower's role changed that day
# and its new skill (product-health-verification) would have been outside the backup entirely —
# the exact coverage hole found on 2026-07-28, when 12 of 24 Tower files were stale or missing
# while the backup reported healthy. A NEW TOWER-AUTHORED SKILL MUST BE ADDED TO THIS LIST.
TOWER_SKILLS=(product-health-verification cockpit-observation)

rsync -a --delete --exclude '*.heartbeat' --exclude 'tower-watch-*' \
      "$HOME/.claude/tower/" claude/tower/
for _skill in "${TOWER_SKILLS[@]}"; do
  if [ -d "$HOME/.claude/skills/$_skill" ]; then
    mkdir -p "claude/skills/$_skill"
    rsync -a --delete --exclude '__pycache__' \
          "$HOME/.claude/skills/$_skill/" "claude/skills/$_skill/"
  else
    echo "BACKUP FAIL: declared Tower skill '$_skill' not found at \$HOME/.claude/skills/$_skill" >&2
    exit 1
  fi
done

# Hook SCRIPTS — added 2026-07-28. settings.sanitized.json above records that a hook is
# WIRED, but not what it does; the scripts it invokes lived only on this machine. That is
# the same coverage hole DGX-02 and the 07-28 cockpit-backup audit each found once already:
# a manifest that names the pointer and not the payload. notify-permission.sh drives David's
# macOS "needs you" banners and writes the permission-request evidence log.
rsync -a --delete "$HOME/.claude/hooks/" claude/hooks/

# Studio's entire world: persona, DAVID.md, proposals, prototypes, bus protocol, permissions
rsync -a --delete --exclude '.git' "$HOME/frontend-studio/" frontend-studio/

# Other agent CLI configs (no secrets present; verify before widening)
cp "$HOME/.codex/config.toml" codex/ 2>/dev/null || true
cp "$HOME/.gemini/settings.json" gemini/ 2>/dev/null || true

# The launchd job definitions (the jobs themselves are the schedule's source of truth)
cp "$HOME"/Library/LaunchAgents/com.davidleess.dynasty-*.plist launchagents/ 2>/dev/null || true
cp "$HOME"/Library/LaunchAgents/com.davidleess.dg-*.plist      launchagents/ 2>/dev/null || true

# Autonomy source is repository-owned; verify it before backup. Runtime ownership,
# generated host caches, and run state are deliberately not copied into this repo.
"$REPO/autonomy/verify.sh" --source-only

# Commit and push only if something changed
git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "cockpit backup $(date '+%Y-%m-%d %H:%M')"
  # 2026-07-28, David's word: "fix the silent push."
  # This previously swallowed a failed push with an echo and still exited 0, so launchd
  # recorded a clean run on a backup that never reached GitHub — the same silent-success
  # disease DGX-02 cured in the data backup. A backup that did not land must SAY SO.
  if ! git push origin main; then
    echo "BACKUP FAILED: push to origin/main did not succeed." >&2
    echo "The cockpit snapshot is committed LOCALLY ONLY and is NOT protected." >&2
    exit 1
  fi
  # Verify presence on the remote. An exit code is not evidence.
  git fetch -q origin main
  if [ "$(git rev-list --count origin/main..HEAD)" -ne 0 ]; then
    echo "BACKUP FAILED: push reported success but the commit is NOT on origin/main." >&2
    exit 1
  fi
  echo "backed up and pushed — verified present on origin/main"
else
  echo "no changes"
fi
