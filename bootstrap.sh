#!/bin/bash
# New-Mac migration: restore the entire Dynasty Genius cockpit from this repo.
# Prereqs (install first): Xcode CLT, Homebrew, then:
#   brew install git gh jq tmux node python@3.14 google-cloud-sdk
#   npm i -g @anthropic-ai/claude-code @openai/codex   (+ gemini CLI of choice)
#   gh auth login && gcloud auth login
# Then: git clone https://github.com/davidtleess/dg-cockpit && cd dg-cockpit && ./bootstrap.sh
set -euo pipefail
REPO="$(cd "$(dirname "$0")" && pwd)"

echo "== 1/7 product repo =="
[ -d "$HOME/dynasty-genius-product" ] || git clone https://github.com/davidtleess/dynasty-genius.git "$HOME/dynasty-genius-product"

echo "== 2/7 cockpit scripts + terminal config =="
cp "$REPO/home/dynasty_flight_deck.sh" "$HOME/" && chmod +x "$HOME/dynasty_flight_deck.sh"
cp "$REPO/home/tmux.conf" "$HOME/.tmux.conf"
grep -q "dynasty_flight_deck" "$HOME/.bash_profile" 2>/dev/null || cat "$REPO/home/dg_aliases.sh" >> "$HOME/.bash_profile"

echo "== 3/7 claude: tower, memory, settings =="
mkdir -p "$HOME/.claude/agents" "$HOME/.claude/projects/-Users-davidleess"
cp "$REPO/claude/agents/tower.md" "$HOME/.claude/agents/"
rsync -a "$REPO/claude/memory/" "$HOME/.claude/projects/-Users-davidleess/memory/"
[ -f "$HOME/.claude/settings.json" ] || cp "$REPO/claude/settings.sanitized.json" "$HOME/.claude/settings.json"
echo "  NOTE: settings.json is sanitized — re-add the env block (GitHub PAT: generate a NEW one, never reuse)."

echo "== 4/7 studio =="
rsync -a "$REPO/frontend-studio/" "$HOME/frontend-studio/"

echo "== 5/7 other agent configs + launchd jobs =="
mkdir -p "$HOME/.codex" "$HOME/.gemini"
[ -f "$HOME/.codex/config.toml" ]    || cp "$REPO/codex/config.toml" "$HOME/.codex/" 2>/dev/null || true
[ -f "$HOME/.gemini/settings.json" ] || cp "$REPO/gemini/settings.json" "$HOME/.gemini/" 2>/dev/null || true
mkdir -p "$HOME/Library/LaunchAgents"
cp "$REPO"/launchagents/*.plist "$HOME/Library/LaunchAgents/"
for p in "$HOME"/Library/LaunchAgents/com.davidleess.d*.plist; do launchctl load "$p" 2>/dev/null || true; done

echo "== 6/7 Dynasty autonomy layer =="
"$REPO/autonomy/install.sh" --activate

echo "== 7/7 data restore from GCS =="
LATEST=$(gsutil ls gs://dynasty-genius-backup-dtl/dynasty-genius/runs/ | tail -1)
echo "  latest backup run: $LATEST"
gsutil -m rsync -r "${LATEST}app/data" "$HOME/dynasty-genius-product/app/data"

echo ""
echo "Done. Remaining by hand: repo venv (python3.14 -m venv .venv && pip install -r requirements*.txt),"
echo "frontend build (cd frontend && npm ci && npm run build), Sleeper env vars, claude/codex/gemini logins."
echo "Then: source ~/.bash_profile && dg"
