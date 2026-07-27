#!/bin/bash
# dg-cockpit backup: snapshot the cockpit layer into this repo and push.
# Run manually or via the nightly launchd job. Secrets are stripped, never stored.
set -euo pipefail
# launchd jobs get a bare PATH (/usr/bin:/bin:...) — add Homebrew/local so jq and git helpers resolve
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
REPO="$HOME/dg-cockpit"
cd "$REPO"

mkdir -p home claude/agents claude/memory claude/tower claude/skills frontend-studio codex gemini launchagents

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
#   skills/ — Tower-authored skills, notably cockpit-observation.
# Excludes transient watcher state; those are runtime artifacts, not durable.
rsync -a --delete --exclude '*.heartbeat' --exclude 'tower-watch-*' \
      "$HOME/.claude/tower/" claude/tower/
rsync -a --delete --exclude '__pycache__' \
      "$HOME/.claude/skills/cockpit-observation/" claude/skills/cockpit-observation/

# Studio's entire world: persona, DAVID.md, proposals, prototypes, bus protocol, permissions
rsync -a --delete --exclude '.git' "$HOME/frontend-studio/" frontend-studio/

# Other agent CLI configs (no secrets present; verify before widening)
cp "$HOME/.codex/config.toml" codex/ 2>/dev/null || true
cp "$HOME/.gemini/settings.json" gemini/ 2>/dev/null || true

# The launchd job definitions (the jobs themselves are the schedule's source of truth)
cp "$HOME"/Library/LaunchAgents/com.davidleess.dynasty-*.plist launchagents/ 2>/dev/null || true
cp "$HOME"/Library/LaunchAgents/com.davidleess.dg-*.plist      launchagents/ 2>/dev/null || true

# Commit and push only if something changed
git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "cockpit backup $(date '+%Y-%m-%d %H:%M')"
  git push -q origin main 2>/dev/null || echo "push failed — will retry next run"
  echo "backed up and pushed"
else
  echo "no changes"
fi
