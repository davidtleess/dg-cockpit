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

# ---- Verify over the WHOLE buffer, EXCLUDING the composer (AC 4 + AC 12) --------
# TOWER-1 failure 1: searching 300-400 lines of a ~1900-line buffer produced
# false "did not land" verdicts and needless re-sends, at least three times.
# -S - means "from the oldest retained line", so a marker anywhere in retained
# history is found regardless of how deep the buffer has grown.
#
# TOWER-3 failure, 2026-07-28: `-S -` also captures the COMPOSER. A message still
# sitting UNSENT in the input box therefore satisfied the marker check, and this
# script reported DELIVERED for a message the recipient had never seen. It was
# caught only because the NEXT send was refused for a composer strand — and the
# strand was this script's own previous "delivered" message, quoted verbatim.
#
# The skill already teaches "an empty composer is not proof of delivery." This is
# the inverse and it was never written down: SEEING THE TEXT IS NOT PROOF EITHER,
# if where you are seeing it is the input box. Delivery means the recipient's
# TRANSCRIPT, so the composer is excluded before matching.

# transcript_of <pane> — the buffer with the composer region removed.
# Falls back to the whole buffer when the composer cannot be located, which is the
# pre-fix behaviour: no regression, and the failure direction stays the safe one
# for the depth bug this replaced.
# Cut using TMUX'S OWN line coordinates, not by counting lines in two captures.
# Counting was tried first and is wrong: `capture-pane -p` pads the visible screen with
# trailing blank rows while `-p -S -` does not, so the two captures do not align and the
# composer survived the cut. In tmux coordinates, row 0 is the top of the VISIBLE pane and
# negative rows are scrollback — so "-S - -E <n>" means "oldest retained line through row n"
# with no arithmetic against a padded capture.
transcript_of() {
  local p="$1" vis cur end
  vis=$(tmux capture-pane -t "$p" -p 2>/dev/null) || return 1
  cur=$(printf '%s\n' "$vis" | grep -nE '❯|›|^[[:space:]]*>([[:space:]]|$)' | tail -1 | cut -d: -f1)
  if [ -z "$cur" ]; then
    tmux capture-pane -t "$p" -p -S - 2>/dev/null
    return 0
  fi
  end=$(( cur - 2 ))                 # 1-based row -> 0-based, then one row ABOVE it
  [ "$end" -lt -1 ] && end=-1        # composer at the very top: keep scrollback only
  tmux capture-pane -t "$p" -p -S - -E "$end" 2>/dev/null
}

# composer_region <pane> — only the input box and below.
composer_region() {
  local p="$1" vis cur
  vis=$(tmux capture-pane -t "$p" -p 2>/dev/null) || return 1
  cur=$(printf '%s\n' "$vis" | grep -nE '❯|›|^[[:space:]]*>([[:space:]]|$)' | tail -1 | cut -d: -f1)
  [ -n "$cur" ] || return 1
  printf '%s\n' "$vis" | tail -n +"$cur"
}

found=0
stuck_retries=0
i=0
while [ "$i" -lt 6 ]; do
  sleep 1
  if transcript_of "$pane" | grep -qF -- "$marker"; then
    found=1; break
  fi
  # STUCK PASTE: our own text is sitting in the input box unsubmitted. Pressing
  # Enter here is legal — this is Tower's OWN message, identified by the marker
  # this script required be present in the body before sending. It is never
  # another lane's text and never a suggestion: furniture cannot contain a marker
  # that was written into the message file seconds ago.
  if [ "$stuck_retries" -lt 2 ] && composer_region "$pane" | grep -qF -- "$marker"; then
    stuck_retries=$((stuck_retries + 1))
    tmux send-keys -t "$pane" C-m 2>/dev/null
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
