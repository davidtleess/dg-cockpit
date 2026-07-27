#!/bin/bash
# pane-send.sh <pane> <message-file> <marker> — send a message Tower AUTHORED and
# establish what actually happened. Returns exactly one of three verdicts.
# Guessing is not an available outcome.
#
#   DELIVERED        the marker is present in the recipient's transcript
#   NOT_DELIVERED    the marker is absent from a pane that CAN retain it
#   CANNOT_DETERMINE the marker is absent from a pane that cannot prove anything
#   REFUSED          pre-send state would have discarded or misdirected the input
#   CANNOT_VERIFY    one of this script's own checks could not run
#
# Exit: 0 DELIVERED | 1 NOT_DELIVERED | 2 CANNOT_DETERMINE | 3 CANNOT_VERIFY | 4 REFUSED
#
# This script sends ONLY the contents of <message-file>. It has no mode in which
# it submits text found in a pane. Sender owns delivery; a strand belongs to the
# lane that wrote it (see pane-strand.sh).
set -u

here="$(cd "$(dirname "$0")" && pwd)"
pane="${1:?usage: pane-send.sh <pane> <message-file> <marker>}"
msgfile="${2:?usage: pane-send.sh <pane> <message-file> <marker>}"
marker="${3:?a unique marker string is REQUIRED — verification without one is guessing}"

verdict() { echo "VERDICT=$1"; echo "REASON=$2"; exit "$3"; }

# ---- Fail loudly if our own preconditions are not met (AC 11) -----------------
command -v tmux >/dev/null 2>&1 || verdict CANNOT_VERIFY "tmux is not on PATH" 3
[ -x "$here/pane-state.sh" ]     || verdict CANNOT_VERIFY "pane-state.sh missing or not executable" 3
[ -f "$msgfile" ]                || verdict CANNOT_VERIFY "message file '$msgfile' does not exist — the silent no-op that produced a false send on 2026-07-26" 3
[ -s "$msgfile" ]                || verdict CANNOT_VERIFY "message file '$msgfile' is empty" 3
grep -qF -- "$marker" "$msgfile" || verdict CANNOT_VERIFY "marker '$marker' does not appear in the message file; verification would search for text never sent" 3

# ---- Pre-send state (AC 2) -----------------------------------------------------
state=$("$here/pane-state.sh" "$pane") || verdict CANNOT_VERIFY "pane-state.sh could not establish state for $pane" 3
get() { printf '%s\n' "$state" | grep "^$1=" | head -1 | cut -d= -f2-; }

[ "$(get STATUS)" = "OK" ] || verdict CANNOT_VERIFY "$(get REASON)" 3

if [ "$(get SENDABLE)" != "yes" ]; then
  verdict REFUSED "$(get SEND_REFUSAL) [DIALOG=$(get DIALOG) COMPOSER=$(get COMPOSER)]" 4
fi

retention=$(get RETENTION)
retention_reason=$(get RETENTION_REASON)
pre_hist=$(get HISTORY_SIZE)

# ---- Send ----------------------------------------------------------------------
buf="towersend$$"
tmux load-buffer -b "$buf" "$msgfile"  2>/dev/null || verdict CANNOT_VERIFY "tmux load-buffer failed" 3
tmux paste-buffer -b "$buf" -t "$pane" -p 2>/dev/null || verdict CANNOT_VERIFY "tmux paste-buffer failed" 3
sleep 1
tmux send-keys -t "$pane" C-m 2>/dev/null || verdict CANNOT_VERIFY "tmux send-keys failed" 3
tmux delete-buffer -b "$buf" 2>/dev/null

# ---- Verify over the WHOLE buffer, never a fixed depth (AC 4) -------------------
# TOWER-1 failure 1: searching 300-400 lines of a ~1900-line buffer produced
# false "did not land" verdicts and needless re-sends, at least three times.
# -S - means "from the oldest retained line", so a marker anywhere in retained
# history is found regardless of how deep the buffer has grown.
found=0
i=0
while [ "$i" -lt 6 ]; do
  sleep 1
  if tmux capture-pane -t "$pane" -p -S - 2>/dev/null | grep -qF -- "$marker"; then
    found=1; break
  fi
  i=$((i + 1))
done

post_hist=$(tmux display -t "$pane" -p '#{history_size}' 2>/dev/null)

if [ "$found" -eq 1 ]; then
  verdict DELIVERED "marker found in transcript of $pane (history ${pre_hist}->${post_hist}, searched whole buffer)" 0
fi

# ---- Second probe: the OPENING of the message ---------------------------------
# TOWER-1 failure 6, reproduced live 2026-07-26: a recipient that QUEUES an
# incoming message renders a truncated preview ("…"), so a marker placed at the
# END of the body is genuinely absent from the pane while the message is present
# and about to be processed. Searching only for the trailing marker returns a
# FALSE NOT_DELIVERED, and re-sending on that verdict double-delivers.
# So: if the marker is missing, probe a distinctive slice of the message's FIRST
# line before concluding anything.
opening=$(grep -v '^[[:space:]]*$' "$msgfile" | head -1 | cut -c1-60)
if [ -n "$opening" ] && tmux capture-pane -t "$pane" -p -S - 2>/dev/null | grep -qF -- "$opening"; then
  if tmux capture-pane -t "$pane" -p 2>/dev/null | grep -qE 'Messages to be submitted|queued message'; then
    verdict DELIVERED "message present and QUEUED in $pane (opening text matched; trailing marker not yet rendered because the queued preview is truncated). Do NOT re-send — it will process after the current tool call." 0
  fi
  verdict DELIVERED "message present in $pane (matched by opening text; trailing marker not rendered — long pastes collapse or truncate in display)" 0
fi

# ---- Absent. Is this pane even capable of proving delivery? (AC 3) -------------
if [ "$retention" != "yes" ]; then
  verdict CANNOT_DETERMINE "pane $pane cannot prove delivery — $retention_reason. Absence of the marker is NOT evidence of non-delivery here. Obtain the recipient's own acknowledgment instead, and do not re-send blindly." 2
fi

verdict NOT_DELIVERED "marker absent from $pane after 6s; this pane DOES retain scrollback (size=$post_hist) so absence is meaningful evidence. Re-send." 1
