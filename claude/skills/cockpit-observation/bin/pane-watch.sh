#!/bin/bash
# pane-watch.sh [pane ...] — watch panes and emit ONE LINE PER EVENT on stdout.
# Designed to be driven by the Monitor tool. Default panes: the dynasty cockpit.
#
# Answers the two failure classes a naive watcher cannot see:
#
#  * DIALOGS ARE KEYED BY PROMPT CONTENT, not by pane state. TOWER-1 failure 7:
#    a state-keyed watcher collapsed two consecutive DISTINCT prompts into one
#    alert, so two lanes sat blocked while Tower reported them working. Here a
#    different prompt is always a different event.
#
#  * SILENCE IS AN EVENT. TOWER-1 failure/self-analysis §5: "any watcher that
#    cannot alert on the absence of change is blind to the failure that matters
#    most." A pane that is idle, not busy, and unchanged past STALL_SECS raises
#    an alert even though nothing happened.
#
# Human-typing suppression (AC 8): a pane whose composer holds non-dim text is
# considered to belong to the human right now. No stall alerts, and the watcher
# never sends a key to any pane under any condition.
#
# Liveness (failure 9): a HEARTBEAT line is emitted every HEARTBEAT_CYCLES cycles
# and a timestamp file is refreshed every cycle, so a throttled or dead watcher
# is detectable rather than being mistaken for a quiet cockpit.
set -u

here="$(cd "$(dirname "$0")" && pwd)"
STALL_SECS="${STALL_SECS:-300}"
POLL_SECS="${POLL_SECS:-20}"
HEARTBEAT_CYCLES="${HEARTBEAT_CYCLES:-15}"
STATE_DIR="${STATE_DIR:-${TMPDIR:-/tmp}/tower-watch-$$}"
HEARTBEAT_FILE="${HEARTBEAT_FILE:-${TMPDIR:-/tmp}/tower-watch.heartbeat}"

panes="$*"
[ -n "$panes" ] || panes="dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1"

if [ ! -x "$here/pane-state.sh" ]; then
  echo "FATAL watcher cannot run: pane-state.sh missing or not executable. Silence from this watcher must NOT be read as cockpit health."
  exit 3
fi
mkdir -p "$STATE_DIR" || { echo "FATAL watcher cannot create state dir $STATE_DIR"; exit 3; }

key_of() { printf '%s' "$1" | tr -c 'A-Za-z0-9' '_'; }
now()    { date +%s; }

echo "WATCH START panes=[$panes] stall=${STALL_SECS}s poll=${POLL_SECS}s state=$STATE_DIR"

cycle=0
while true; do
  cycle=$((cycle + 1))
  date +%s > "$HEARTBEAT_FILE" 2>/dev/null

  for p in $panes; do
    k="$(key_of "$p")"
    f_dialog="$STATE_DIR/$k.dialog"
    f_content="$STATE_DIR/$k.content"
    f_since="$STATE_DIR/$k.since"
    f_stalled="$STATE_DIR/$k.stalled"

    if ! state=$("$here/pane-state.sh" "$p" 2>/dev/null); then
      echo "CANNOT_VERIFY $p — pane-state.sh failed. This pane's health is UNKNOWN, not good."
      continue
    fi
    get() { printf '%s\n' "$state" | grep "^$1=" | head -1 | cut -d= -f2-; }

    if [ "$(get STATUS)" != "OK" ]; then
      echo "CANNOT_VERIFY $p — $(get REASON)"
      continue
    fi

    dialog="$(get DIALOG)"
    dkey="$(get DIALOG_KEY)"
    ckey="$(get CONTENT_KEY)"
    busy="$(get BUSY)"
    composer="$(get COMPOSER)"

    # ---- Dialog events, keyed by prompt CONTENT ------------------------------
    prev_dkey=""
    [ -f "$f_dialog" ] && prev_dkey=$(cat "$f_dialog" 2>/dev/null)
    if [ "$dialog" = "open" ]; then
      if [ "$dkey" != "$prev_dkey" ]; then
        echo "DIALOG $p — approval prompt awaiting a decision (key ${dkey}). Tower may approve only if plainly a step of work David already ordered; gate-shaped prompts go to David."
        printf '%s' "$dkey" > "$f_dialog"
      fi
    else
      [ -n "$prev_dkey" ] && : > "$f_dialog"
    fi

    # ---- Silent-stall detection ----------------------------------------------
    prev_ckey=""
    [ -f "$f_content" ] && prev_ckey=$(cat "$f_content" 2>/dev/null)
    if [ "$ckey" != "$prev_ckey" ]; then
      printf '%s' "$ckey" > "$f_content"
      now > "$f_since"
      : > "$f_stalled"
      continue
    fi

    # unchanged since last cycle
    [ -f "$f_since" ] || now > "$f_since"
    since=$(cat "$f_since" 2>/dev/null); [ -n "$since" ] || since=$(now)
    idle=$(( $(now) - since ))

    # A pane the human is typing into belongs to the human (AC 8).
    [ "$composer" = "real" ] && continue
    # A pane genuinely working is not stalled.
    [ "$busy" = "yes" ] && continue

    already=""
    [ -f "$f_stalled" ] && already=$(cat "$f_stalled" 2>/dev/null)
    if [ "$idle" -ge "$STALL_SECS" ] && [ -z "$already" ]; then
      if [ "$dialog" = "open" ]; then
        echo "STALL $p — BLOCKED on an approval prompt for ${idle}s with no change. A blocked pane emits no events; this alert exists because nothing happened."
      else
        echo "STALL $p — idle and unchanged for ${idle}s, not busy, composer ${composer}. Lane may be waiting on something nobody is carrying."
      fi
      printf 'yes' > "$f_stalled"
    fi
  done

  if [ $((cycle % HEARTBEAT_CYCLES)) -eq 0 ]; then
    echo "HEARTBEAT cycle=$cycle — watcher alive. Absence of heartbeats means the watcher died, NOT that the cockpit is quiet."
  fi
  sleep "$POLL_SECS"
done
