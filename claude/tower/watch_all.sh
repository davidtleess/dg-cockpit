#!/bin/bash
# Tower all-pane watcher (bash 3.2 safe): fires on DIALOG or TURN-COMPLETION in any cockpit pane.
PANES="1.1 1.2 1.3 2.1"
ST=$(mktemp -d)
for p in $PANES; do
  tmux capture-pane -t dynasty:$p -p | tr -d "[:space:]" | md5 > "$ST/$p"
done
while true; do
  for p in $PANES; do
    out=$(tmux capture-pane -t dynasty:$p -p)
    if echo "$out" | grep -qE "Do you want to proceed|Would you like to (make|run)|Press enter to confirm"; then
      echo "DIALOG:$p"; rm -rf "$ST"; exit 0
    fi
    h=$(echo "$out" | tr -d "[:space:]" | md5)
    if ! echo "$out" | grep -qE "esc to interrupt|Working \(|… \(|thinking|Thinking"; then
      if [ "$(cat "$ST/$p")" != "$h" ]; then
        echo "OUTPUT:$p"; rm -rf "$ST"; exit 0
      fi
    fi
    echo "$h" > "$ST/$p"
  done
  sleep 6
done
