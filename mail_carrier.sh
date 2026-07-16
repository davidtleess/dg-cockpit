#!/bin/bash
# Mail carrier: delivers inter-agent tmux messages stranded at prompts.
# The paste+Enter race leaves messages sitting unsubmitted in input boxes
# (sender believes sent; recipient never sees it). This job runs every
# minute via launchd and presses Enter on genuinely stranded messages.
#
# Safety rules — submit ONLY when ALL hold:
#   1. Pane's agent is idle (no spinner/working marker)
#   2. Pane is NOT the focused pane (David may be composing there)
#   3. Identical non-empty input across two samples 20s apart
# (bash 3.2 compatible — macOS has no associative arrays)
SESSION="dynasty"
PANES="1.1 1.2 1.3 2.1 2.2"
LOG="/tmp/dg-mail-carrier.log"
TMPDIR_C="/tmp/dg-carrier-samples"

tmux has-session -t "$SESSION" 2>/dev/null || exit 0
mkdir -p "$TMPDIR_C"
date "+%F %T" > /tmp/dg-mail-carrier.heartbeat
ACTIVE=$(tmux display-message -t "$SESSION" -p '#{window_index}.#{pane_index}' 2>/dev/null)

# Busy = running-markers in the LIVE status area (bottom lines) only; the
# transcript above is full of finished-spinner glyphs that must not count.
busy() { tmux capture-pane -t "$SESSION:$1" -p 2>/dev/null | tail -6 | grep -qE 'esc to interrupt|Working \(|esc to cancel'; }

# Extract stranded input: content on a prompt line or a pending paste chip.
# Codex ghost placeholders render dim — capture with escapes and drop dim lines.
stranded() {
  tmux capture-pane -t "$SESSION:$1" -p -e 2>/dev/null \
    | grep -v $'\x1b\[2m' \
    | sed 's/\x1b\[[0-9;]*m//g' \
    | grep -E '^(❯|›|>) .+|^❯ \[Pasted text' \
    | grep -vE '^> Try ' | tail -3
}

for p in $PANES; do
  f="$TMPDIR_C/${p//./_}"
  rm -f "$f"
  [ "$p" = "$ACTIVE" ] && continue
  busy "$p" && continue
  s=$(stranded "$p")
  [ -n "$s" ] && printf '%s' "$s" > "$f"
done

sleep 20

for p in $PANES; do
  f="$TMPDIR_C/${p//./_}"
  [ -f "$f" ] || continue
  [ "$p" = "$ACTIVE" ] && continue
  busy "$p" && continue
  now=$(stranded "$p")
  first=$(cat "$f")
  if [ -n "$now" ] && [ "$now" = "$first" ]; then
    # Never auto-deliver approval-shaped grants — only David may grant these;
    # leave them stranded for Tower/David to verify the sender first.
    if printf '%s' "$now" | grep -qiE 'land it|commit|push|merge|deploy|approved?[ ,.]|go ahead'; then
      echo "$(date '+%F %T') HELD grant-shaped message in $p for human review: $(printf '%s' "$now" | head -1 | cut -c1-80)" >> "$LOG"
    else
      tmux send-keys -t "$SESSION:$p" C-m
      echo "$(date '+%F %T') delivered stranded message in $p: $(printf '%s' "$now" | head -1 | cut -c1-80)" >> "$LOG"
    fi
  fi
  rm -f "$f"
done
