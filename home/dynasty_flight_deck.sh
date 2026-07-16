#!/bin/bash
SESSION="dynasty"
PROJECT_DIR="/Users/davidleess/dynasty-genius-product"
STUDIO_DIR="/Users/davidleess/frontend-studio"

# 1. Kill any existing session to start fresh
tmux kill-session -t "$SESSION" 2>/dev/null

# 2. Start a new session in the background
tmux new-session -d -s "$SESSION" -c "$PROJECT_DIR" "/bin/bash"

# 3. Setup Pane 1: Claude Code (Left)
# Color: Deep Midnight Blue (Exec)
tmux select-pane -t "$SESSION:1.1" -P 'bg=colour232,fg=colour252'
tmux send-keys -t "$SESSION:1" "source .venv/bin/activate" C-m
tmux send-keys -t "$SESSION:1" "cat '# DYNASTY GENIUS — SESSION STARTER.md'" C-m
tmux send-keys -t "$SESSION:1" "cat docs/governance/00-product-constitution.md" C-m
tmux send-keys -t "$SESSION:1" "cat AGENT_SYNC.md" C-m
tmux send-keys -t "$SESSION:1" "claude" C-m

# 4. Setup Pane 2: Codex (Right Top)
# Color: Deep Purple (Strategy)
tmux split-window -h -p 50 -t "$SESSION:1" -c "$PROJECT_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:1.2" -P 'bg=colour234,fg=colour252'
tmux send-keys -t "$SESSION:1.2" "source .venv/bin/activate" C-m
tmux send-keys -t "$SESSION:1.2" "cat '# DYNASTY GENIUS — SESSION STARTER.md'" C-m
tmux send-keys -t "$SESSION:1.2" "cat docs/governance/00-product-constitution.md" C-m
tmux send-keys -t "$SESSION:1.2" "cat AGENT_SYNC.md" C-m
tmux send-keys -t "$SESSION:1.2" "codex" C-m

# 5. Setup Pane 3: Antigravity PM (Right Bottom)
# Color: Deep Forest Green (PM/Governance)
tmux split-window -v -p 50 -t "$SESSION:1.2" -c "$PROJECT_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:1.3" -P 'bg=colour235,fg=colour252'
tmux send-keys -t "$SESSION:1.3" "source .venv/bin/activate" C-m
tmux send-keys -t "$SESSION:1.3" "cat '# DYNASTY GENIUS — SESSION STARTER.md'" C-m
tmux send-keys -t "$SESSION:1.3" "cat docs/governance/00-product-constitution.md" C-m
tmux send-keys -t "$SESSION:1.3" "cat AGENT_SYNC.md" C-m
tmux send-keys -t "$SESSION:1.3" "agy" C-m

# 6. Setup Window 2: Studio — independent front-end practice (Ctrl-b 2)
# Deliberately NO governance reads and NOT in the project dir: Studio's
# persona loads from ~/frontend-studio/CLAUDE.md and must stay ungoverned.
# Color: Deep Maroon + Amber (Outsider — visually distinct from the gray engineering panes)
tmux new-window -t "$SESSION" -n "🎨🗼 studio·tower" -c "$STUDIO_DIR" "/bin/bash"
tmux select-pane -t "$SESSION:2.1" -P 'bg=colour52,fg=colour230'
tmux set-window-option -t "$SESSION:2" window-status-style 'fg=colour214'
tmux set-window-option -t "$SESSION:2" window-status-current-style 'fg=colour232,bg=colour214,bold'
tmux send-keys -t "$SESSION:2.1" "claude" C-m

# 7. Tower — chief of staff, right split beside Studio.
# cwd is $HOME on purpose: Tower loads its agent definition and home-dir
# memory, and must NOT inherit the repo's governance bootstrap.
# Color: Deep Navy (Control Tower)
tmux split-window -h -p 50 -t "$SESSION:2.1" -c "$HOME" "/bin/bash"
tmux select-pane -t "$SESSION:2.2" -P 'bg=colour17,fg=colour153'
tmux send-keys -t "$SESSION:2.2" "claude --agent tower" C-m
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

# 9. Finalize focus on the engineering window
tmux select-window -t "$SESSION:1"
tmux select-pane -t "$SESSION:1.1"
tmux attach-session -t "$SESSION"
