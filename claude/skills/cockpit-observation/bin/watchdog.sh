#!/usr/bin/env bash
# watchdog.sh — Tower's watchers must be RUNNING, and their liveness must be PROVEN.
#
# WHY THIS EXISTS. 2026-07-28, ~09:05. David: "can you not see gemini needs approval on
# something?" Three lanes sat on approval dialogs — including the one writing the very
# deliverable Tower had just ordered — while Tower told David "nothing needs you right now."
#
# Tower had swept the panes at 09:03, seen no dialogs, and stopped looking. The dialogs opened
# after the read. The tooling to catch that was built on 2026-07-27 and was NOT RUNNING,
# because nothing in the boot ritual started it and nothing detected its absence.
#
# The lesson is not "sweep harder". A sweep is a SNAPSHOT; "nothing needs you" is a claim about
# an ONGOING state. Only a live watcher can support the second, so the watcher's liveness is
# now a measured precondition rather than an assumption.
#
# Idempotent. Safe to run repeatedly, from a hook or by hand.
#
#   watchdog.sh              start anything not running, then report
#   watchdog.sh --status     report only; start nothing
#   watchdog.sh --hook       for SessionStart: acts ONLY in Tower's pane, silent elsewhere
#
# Exit 0 = LIVE (both watchers running, heartbeat fresh) · 1 = DEAD/DEGRADED · 2 = not Tower's pane

set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$SKILL_DIR/bin"
RUN_DIR="${TOWER_RUN_DIR:-/tmp/tower-run}"
PANE_LOG="$RUN_DIR/pane-watch.log"
OUT_LOG="$RUN_DIR/output-watch.log"
HB="$RUN_DIR/pane-watch.hb"
PANES="${TOWER_PANES:-dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1}"
HB_STALE_SECS="${HB_STALE_SECS:-90}"   # pane-watch writes the file every POLL_SECS (default 20)

MODE="start"
case "${1:-}" in
  --status) MODE="status" ;;
  --hook)   MODE="hook" ;;
  "")       MODE="start" ;;
  *) echo "usage: watchdog.sh [--status|--hook]" >&2; exit 64 ;;
esac

# --- hook gate -------------------------------------------------------------------------------
# A SessionStart hook fires in EVERY Claude Code session on this machine, including the crew's
# own panes. Tower's watchers must never be started by a crew lane: they would duplicate alerts
# and, worse, imply supervision that nobody is reading. Act only in Tower's pane.
is_tower_pane() {
  [ -n "${TMUX:-}" ] || return 1
  local title
  title="$(tmux display-message -p '#{pane_title}' 2>/dev/null)" || return 1
  case "$title" in *tower*|*Tower*|*🗼*) return 0 ;; esac
  return 1
}

if [ "$MODE" = "hook" ]; then
  is_tower_pane || exit 2          # silent, non-fatal, in every non-Tower session
  MODE="start"
fi

mkdir -p "$RUN_DIR" 2>/dev/null || { echo "WATCHDOG=CANNOT_VERIFY reason=cannot create $RUN_DIR"; exit 1; }

running() { pgrep -f "$1" >/dev/null 2>&1; }

start_pane_watch() {
  [ -x "$BIN/pane-watch.sh" ] || { echo "MISSING $BIN/pane-watch.sh"; return 1; }
  STALL_SECS="${STALL_SECS:-300}" HEARTBEAT_FILE="$HB" \
    nohup "$BIN/pane-watch.sh" $PANES >>"$PANE_LOG" 2>&1 &
  disown 2>/dev/null || true
}

start_output_watch() {
  [ -x "$BIN/output-watch.sh" ] || { echo "MISSING $BIN/output-watch.sh"; return 1; }
  nohup "$BIN/output-watch.sh" >>"$OUT_LOG" 2>&1 &
  disown 2>/dev/null || true
}

STARTED=""
if [ "$MODE" = "start" ]; then
  running "pane-watch.sh"   || { start_pane_watch   && STARTED="$STARTED pane-watch"; }
  running "output-watch.sh" || { start_output_watch && STARTED="$STARTED output-watch"; }
  [ -n "$STARTED" ] && sleep 4
fi

# --- verdict: measured, never assumed --------------------------------------------------------
PW=no; OW=no; HB_AGE=-1; PROBLEMS=""
running "pane-watch.sh"   && PW=yes
running "output-watch.sh" && OW=yes

if [ -f "$HB" ]; then
  now=$(date +%s); then_=$(cat "$HB" 2>/dev/null || echo 0)
  case "$then_" in ''|*[!0-9]*) then_=0 ;; esac
  [ "$then_" -gt 0 ] && HB_AGE=$(( now - then_ ))
fi

[ "$PW" = yes ] || PROBLEMS="$PROBLEMS dialog-watcher-not-running"
[ "$OW" = yes ] || PROBLEMS="$PROBLEMS output-watcher-not-running"
if [ "$PW" = yes ]; then
  if [ "$HB_AGE" -lt 0 ]; then
    PROBLEMS="$PROBLEMS heartbeat-absent"
  elif [ "$HB_AGE" -gt "$HB_STALE_SECS" ]; then
    PROBLEMS="$PROBLEMS heartbeat-stale-${HB_AGE}s"
  fi
fi

echo "WATCHDOG_TIME=$(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "DIALOG_WATCHER=$PW"
echo "OUTPUT_WATCHER=$OW"
echo "HEARTBEAT_AGE_SECS=$HB_AGE"
echo "PANES=$PANES"
echo "PANE_LOG=$PANE_LOG"
echo "OUTPUT_LOG=$OUT_LOG"
[ -n "$STARTED" ] && echo "STARTED=$(echo "$STARTED" | sed 's/^ //')"

if [ -n "$PROBLEMS" ]; then
  echo "VERDICT=DEAD"
  echo "PROBLEMS=$(echo "$PROBLEMS" | sed 's/^ //')"
  echo "MEANING=Tower is BLIND. Silence from the cockpit is NOT evidence of health."
  exit 1
fi

echo "VERDICT=LIVE"
echo "MEANING=Watchers running and proven alive. Events reach the logs above; Tower must still READ them."
exit 0
