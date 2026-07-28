#!/bin/bash
# macOS banner when a Claude Code pane needs David — notification only.
# Wired to the PermissionRequest hook event. Emits NO stdout and always
# exits 0 so the permission dialog proceeds untouched (exit 2 would DENY).
# Banner title comes from the tmux pane badge ("🗼 tower" → "Tower needs you"),
# so lane identity tracks the flight-deck stamps with no per-agent config.
# Every execution logs to ~/.claude/notification-hook.log for wire-health evidence.
payload=$(cat)
event=$(printf '%s' "$payload" | jq -r '.hook_event_name // "Notification"' 2>/dev/null)
detail=$(printf '%s' "$payload" | jq -r '.tool_input.command // .message // .tool_name // "needs your input"' 2>/dev/null | head -c 120 | tr -d '"\\')
[ -n "$detail" ] || detail="needs your input"

title=""
if [ -n "$TMUX_PANE" ]; then
  pt=$(tmux display-message -p -t "$TMUX_PANE" '#{pane_title}' 2>/dev/null)
  name=$(printf '%s' "$pt" | sed -E 's/^[^[:alpha:]]+//' | awk '{ print toupper(substr($0,1,1)) substr($0,2) }')
  [ -n "$name" ] && title="$name needs you"
fi
[ -n "$title" ] || title="Claude — $(basename "$PWD") — needs you"

printf '%s event=%s pane=%s cwd=%s title=%s msg=%s\n' "$(date '+%F %T')" "$event" "${TMUX_PANE:-none}" "$PWD" "$title" "$detail" >> "$HOME/.claude/notification-hook.log"
osascript -e "display notification \"$detail\" with title \"$title\"" >/dev/null 2>&1
exit 0
