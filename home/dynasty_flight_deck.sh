#!/bin/bash
SESSION="dynasty"
PROJECT_DIR="/Users/davidleess/dynasty-genius-product"
STUDIO_DIR="/Users/davidleess/frontend-studio"
COCKPIT_DIR="/Users/davidleess/dg-cockpit"

# 1. Kill any existing session to start fresh
tmux kill-session -t "$SESSION" 2>/dev/null

# 2. Start a new session in the background
tmux new-session -d -s "$SESSION" -c "$PROJECT_DIR" "/bin/bash"

# 3. Setup Pane 1: Claude Code (Left)
# Crew palette is Kanagawa (Hokusai's Great Wave) — David's pick, 2026-08-14.
# Color: Kanagawa waveBlue2 "storm blue" (Exec)
tmux select-pane -t "$SESSION:1.1" -P 'bg=#2D4F67,fg=#DCD7BA'
tmux send-keys -t "$SESSION:1" "source .venv/bin/activate" C-m
tmux send-keys -t "$SESSION:1" "cat '# DYNASTY GENIUS — SESSION STARTER.md'" C-m
tmux send-keys -t "$SESSION:1" "cat docs/governance/00-product-constitution.md" C-m
tmux send-keys -t "$SESSION:1" "cat AGENT_SYNC.md" C-m
tmux send-keys -t "$SESSION:1" 'claude --plugin-dir "/Users/davidleess/dg-cockpit/autonomy/claude/dg-engineering"' C-m

# 4. Setup Pane 2: Codex (Right Top)
# Color: Kanagawa winterRed "oxblood ink" (Reviewer)
tmux split-window -h -p 50 -t "$SESSION:1" -c "$PROJECT_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:1.2" -P 'bg=#43242B,fg=#DCD7BA'
tmux send-keys -t "$SESSION:1.2" "source .venv/bin/activate" C-m
tmux send-keys -t "$SESSION:1.2" "cat '# DYNASTY GENIUS — SESSION STARTER.md'" C-m
tmux send-keys -t "$SESSION:1.2" "cat docs/governance/00-product-constitution.md" C-m
tmux send-keys -t "$SESSION:1.2" "cat AGENT_SYNC.md" C-m
tmux send-keys -t "$SESSION:1.2" "codex" C-m

# 5. Setup Pane 3: Antigravity PM (Right Bottom)
# Color: Kanagawa autumnGreen "moss", sumi-ink text (PM/Governance)
tmux split-window -v -p 50 -t "$SESSION:1.2" -c "$PROJECT_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:1.3" -P 'bg=#76946A,fg=#1F1F28'
tmux send-keys -t "$SESSION:1.3" "source .venv/bin/activate" C-m
tmux send-keys -t "$SESSION:1.3" "cat '# DYNASTY GENIUS — SESSION STARTER.md'" C-m
tmux send-keys -t "$SESSION:1.3" "cat docs/governance/00-product-constitution.md" C-m
tmux send-keys -t "$SESSION:1.3" "cat AGENT_SYNC.md" C-m
tmux send-keys -t "$SESSION:1.3" "agy" C-m

# 6. Setup Window 2: Studio — independent front-end practice (Ctrl-b 2)
# Deliberately NO governance reads and NOT in the project dir: Studio's
# persona loads from ~/frontend-studio/CLAUDE.md and must stay ungoverned.
# Color: Deep Maroon + Amber (Outsider — visually distinct from the gray engineering panes)
tmux new-window -t "$SESSION" -n "🎨🗼⚖ studio·tower·judge" -c "$STUDIO_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:2.1" -P 'bg=colour52,fg=colour230'
tmux set-window-option -t "$SESSION:2" window-status-style 'fg=#DCA561'
tmux set-window-option -t "$SESSION:2" window-status-current-style 'bg=#DCA561,fg=#16161D,bold'
tmux send-keys -t "$SESSION:2.1" "claude" C-m

# 7. Tower — product steward, right split beside Studio.
# Role changed 2026-08-08 on David's word: Tower owns Dynasty Genius's operational
# health (data freshness, model honesty, the truth David is told when he sits down)
# plus Studio's bridge and David's dated commitments. It is NOT an orchestrator —
# it does not relay between lanes, approve crew dialogs, or gate work.
# cwd is $HOME on purpose: Tower loads its agent definition and home-dir
# memory, and must NOT inherit the repo's governance bootstrap.
# Color: Deep Navy (Control Tower)
tmux split-window -h -p 50 -t "$SESSION:2.1" -c "$HOME" "/bin/bash"
tmux select-pane -t "$SESSION:2.2" -P 'bg=colour17,fg=colour153'
tmux send-keys -t "$SESSION:2.2" 'claude --agent tower --plugin-dir "/Users/davidleess/dg-cockpit/autonomy/claude/dg-tower"' C-m

# 7b. Judge — standing adjudication seat, below Tower (David's word, 2026-08-12).
# Rules bindingly on loop-control gates (review caps, diminishing returns,
# referrals): SHIP is what ships, STOP parks for David. Consults Tower for
# verified operational facts. Never touches Studio (TW29-WALL-35). cwd is the
# product repo: rulings bootstrap from governance and the disputed run's records.
# Color: Deep Olive/Bronze (Judicial)
tmux split-window -v -p 40 -t "$SESSION:2.2" -c "$PROJECT_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:2.3" -P 'bg=colour58,fg=colour229'
tmux send-keys -t "$SESSION:2.3" "claude --agent judge" C-m
tmux select-pane -t "$SESSION:2.1"

# 8. Crew badges: window names and a title bar on every pane
# Note: keep window/pane emoji to single-codepoint characters — compound
# (ZWJ) emoji like 👨‍✈️ break tmux's status-line width math and garble the footer
tmux rename-window -t "$SESSION:1" "👥 crew"
for w in 1 2; do
  tmux setw -t "$SESSION:$w" pane-border-status top
  tmux setw -t "$SESSION:$w" pane-border-format " #{pane_title} "
done
tmux set -p -t "$SESSION:1.1" allow-set-title off; tmux select-pane -t "$SESSION:1.1" -T "✳ claude"
tmux set -p -t "$SESSION:1.2" allow-set-title off; tmux select-pane -t "$SESSION:1.2" -T "⬡ codex"
tmux set -p -t "$SESSION:1.3" allow-set-title off; tmux select-pane -t "$SESSION:1.3" -T "✦ gemini"
tmux set -p -t "$SESSION:2.1" allow-set-title off; tmux select-pane -t "$SESSION:2.1" -T "🎨 studio"
tmux set -p -t "$SESSION:2.2" allow-set-title off; tmux select-pane -t "$SESSION:2.2" -T "🗼 tower"
tmux set -p -t "$SESSION:2.3" allow-set-title off; tmux select-pane -t "$SESSION:2.3" -T "⚖ judge"

# 8b. Status bar and borders — Kanagawa ink, matching the crew palette
# (sumiInk0 bar, storm-blue active tab, autumnYellow keeps window 2's
# outsider cue, crystalBlue marks the focused pane). David, 2026-08-14.
tmux set -g status-style 'bg=#16161D,fg=#727169'
tmux set -g status-left '#[fg=#DCD7BA,bold] dynasty #[fg=#727169]· '
tmux set -g status-left-length 20
tmux set -g window-status-format ' #I #W '
tmux set -g window-status-current-format '#[bg=#2D4F67,fg=#DCD7BA,bold] #I #W #[default]'
tmux set -g status-right '#[fg=#727169]%a %H:%M '
tmux set -g pane-border-style 'fg=#363646'
tmux set -g pane-active-border-style 'fg=#7E9CD8'

# 9. Finalize focus on the engineering window
tmux select-window -t "$SESSION:1"
tmux select-pane -t "$SESSION:1.1"
tmux attach-session -t "$SESSION"
