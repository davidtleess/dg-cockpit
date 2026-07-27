#!/bin/bash
# Tower pane watcher — blocks until an agent pane needs Tower, then exits (re-invoking Tower).
# Watches the 4 agent panes; ignores Tower's own pane (2.2).
# Actionable = an open dialog/permission prompt, OR a pane idle & static ~90s.
# Bash 3.2 compatible (no associative arrays): per-pane state kept in files.
# Mutes a persistent state by hash so the same resting pane / unanswered dialog
# is flagged only ONCE (until its content changes).
PANES="dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1"
MAX_SECONDS=1500      # ~25 min heartbeat re-arm
INTERVAL=30
IDLE_THRESHOLD=3      # consecutive static samples (~90s) before flagging idle
STATE=/tmp/tower_watch
mkdir -p "$STATE"
# Clear volatile stability counters on (re)launch; keep .flagged mutes across re-arms.
rm -f "$STATE"/*.hash "$STATE"/*.count 2>/dev/null

emit() { # $1=type $2=pane $3=cap
  echo "ACTIONABLE=$1 PANE=$2"
  echo "---- tail ----"
  echo "$3" | grep -vE "^[[:space:]]*$" | tail -22
}

start=$SECONDS
while [ $((SECONDS - start)) -lt $MAX_SECONDS ]; do
  for p in $PANES; do
    key=$(echo "$p" | tr ':.' '__')
    cap="$(tmux capture-pane -t "$p" -p 2>/dev/null)"
    [ -z "$cap" ] && continue
    h="$(echo "$cap" | md5)"
    flagged="$(cat "$STATE/$key.flagged" 2>/dev/null)"

    # --- Dialog / prompt-for-a-keypress (highest priority) ---
    # Only the LIVE region (last 10 lines) + live-dialog chrome, so stale
    # "requires approval" scrollback and agent narration don't false-trip.
    tailcap="$(echo "$cap" | tail -10)"
    if echo "$tailcap" | grep -qiE "Esc to cancel.*(amend|explain|confirm)|Press enter to (confirm|continue)|Do you want to proceed\?|Would you like to run|^[[:space:]]*[>|❯][[:space:]]*1\.[[:space:]]*(Yes|Update|Proceed)|1\. Yes, proceed"; then
      if [ "$flagged" != "$h" ]; then
        echo "$h" > "$STATE/$key.flagged"
        emit dialog "$p" "$cap"
        exit 0
      fi
      continue   # same dialog already surfaced — muted
    fi

    # --- Working: leave it alone, reset counters/mute ---
    if echo "$cap" | grep -qiE "esc to interrupt|esc to cancel|Working \(|Generating\.\.\.|Fermenting|Booping|Beboppin|Smooshing|Shimmying|Churn|Percolat|Simmer|Noodling|Puzzl|thinking|Running.*command"; then
      echo 0 > "$STATE/$key.count"
      rm -f "$STATE/$key.flagged" 2>/dev/null   # clear mute — new work in progress
      echo "$h" > "$STATE/$key.hash"
      continue
    fi

    # --- Idle candidate: require a static frame across samples ---
    prev="$(cat "$STATE/$key.hash" 2>/dev/null)"
    if [ "$prev" = "$h" ]; then
      c=$(( $(cat "$STATE/$key.count" 2>/dev/null || echo 0) + 1 ))
    else
      c=0
    fi
    echo "$h" > "$STATE/$key.hash"
    echo "$c" > "$STATE/$key.count"
    if [ "$c" -ge "$IDLE_THRESHOLD" ] && [ "$flagged" != "$h" ]; then
      echo "$h" > "$STATE/$key.flagged"
      emit idle "$p" "$cap"
      exit 0
    fi
  done
  sleep $INTERVAL
done
echo "HEARTBEAT: no actionable condition in ${MAX_SECONDS}s — re-arm the watcher."
exit 0
