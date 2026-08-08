#!/usr/bin/env bash
# turn-brief.sh — measure the cockpit and print it, FAST, at the start of every Tower turn.
#
# WHY THIS EXISTS. 2026-07-28. Tower built `say-clear.sh` in the morning specifically so it
# could never again tell David the cockpit was quiet from a stale snapshot — and then said
# "nothing needs you" three more times that day WITHOUT RUNNING IT. The script was correct
# every time it ran. The failure was that running it was Tower's choice.
#
# The skill already names this as the residual risk: "no script can force Tower to run it."
# This is the answer to that. Wired to the UserPromptSubmit hook, the measurement arrives
# BEFORE Tower composes a word, so speaking from an unmeasured board requires ignoring a
# fresh reading rather than merely forgetting to take one.
#
# Deliberately FAST and deliberately incomplete. It reports dialogs, busy state, composer
# strands and watcher liveness — the things that decay in seconds. It does NOT replace
# say-clear.sh, open-asks.sh or reading the ledger; it is the thing that tells Tower it
# needs to.
#
# Self-gates to Tower's pane: prints nothing anywhere else, so crew sessions are untouched.

set -uo pipefail
BIN="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PANES="${TOWER_PANES:-dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1}"
HB="${TOWER_RUN_DIR:-/tmp/tower-run}/pane-watch.hb"

# --- gate: Tower's pane only -------------------------------------------------------------
[ -n "${TMUX:-}" ] || exit 0
title="$(tmux display-message -p '#{pane_title}' 2>/dev/null)" || exit 0
case "$title" in *tower*|*Tower*|*🗼*) ;; *) exit 0 ;; esac

out=""; flags=""
for p in $PANES; do
  st="$("$BIN/pane-state.sh" "$p" 2>/dev/null)" || { out="$out
  $p UNREADABLE — state unknown, do not assume rest"; flags="x"; continue; }
  g() { printf '%s\n' "$st" | grep "^$1=" | head -1 | cut -d= -f2-; }
  d=$(g DIALOG); b=$(g BUSY); c=$(g COMPOSER)
  line="  $p dialog=$d busy=$b composer=$c"
  case "$d" in open) line="$line   <-- BLOCKED"; flags="x" ;; esac
  case "$c" in real) line="$line   <-- REAL STRAND, not Tower's to submit unless Tower wrote it"; flags="x" ;; esac
  out="$out
$line"
done

# --- watcher liveness: silence is only evidence if the watch is alive ---------------------
wl="DEAD"
if [ -f "$HB" ]; then
  now=$(date +%s); t=$(cat "$HB" 2>/dev/null || echo 0)
  case "$t" in ''|*[!0-9]*) t=0 ;; esac
  [ "$t" -gt 0 ] && [ $(( now - t )) -le 90 ] && wl="LIVE ($(( now - t ))s)"
fi
[ "$wl" = "DEAD" ] && flags="x"

echo "=== TOWER TURN BRIEF — measured $(date '+%H:%M:%S %Z') ==="
printf '%s\n' "$out" | sed '/^$/d'
echo "  watchers $wl"
if [ -n "$flags" ]; then
  echo "  ⚠ Something above needs handling. Do NOT describe the cockpit as clear or quiet."
  echo "    Run bin/say-clear.sh before any statement about the board's state."
else
  echo "  Nothing blocked at this instant. This is a SNAPSHOT — it supports a statement about"
  echo "    now and nothing longer. bin/say-clear.sh is still required before saying 'clear'."
fi
exit 0
