#!/usr/bin/env bash
# send-composer-selftest.sh — TOWER-3, 2026-07-28.
#
# THE BUG: pane-send.sh verified delivery with `capture-pane -S -`, which includes the
# COMPOSER. A message still sitting UNSENT in the input box satisfied the marker check,
# so the script reported DELIVERED for a message the recipient had never seen. It was
# caught only because the next send was refused for a composer strand, and the strand was
# the script's own previously "delivered" message.
#
# The skill already taught "an empty composer is not proof of delivery." Nobody had written
# down the inverse: SEEING YOUR OWN TEXT IS NOT PROOF EITHER, if you are seeing it in the
# input box.
#
# Every case is paired: the false positive must die, AND real delivery must still verify.
# Runs against a throwaway tmux session. `dynasty` is never touched.

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$HERE/../bin"
S="sendcomposer-test-$$"
STUCKFILE=""
PASS=0; FAIL=0

ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n        got: %s\n' "$1" "$2"; }
cleanup() { tmux kill-session -t "$S" 2>/dev/null; [ -n "${STUCKFILE:-}" ] && rm -f "$STUCKFILE"; }
trap cleanup EXIT

tmux new-session -d -s "$S" -x 100 -y 24 2>/dev/null || { echo "FATAL: cannot create test session"; exit 3; }
sleep 1
T=$(tmux list-panes -t "$S" -F '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null | head -1)
[ -n "$T" ] || { echo "FATAL: cannot resolve a pane"; exit 3; }

# The functions under test live inside pane-send.sh, which sends on load. Re-declare the
# EXACT logic here would test a copy, not the code. Instead drive them by sourcing only the
# function bodies, extracted by name — if the extraction fails, the test fails rather than
# silently passing against nothing.
fnsrc=$(awk '/^transcript_of\(\) \{/,/^\}/' "$BIN/pane-send.sh"; awk '/^composer_region\(\) \{/,/^\}/' "$BIN/pane-send.sh")
case "$fnsrc" in
  *transcript_of*composer_region*) : ;;
  *) echo "FATAL: could not extract transcript_of/composer_region from pane-send.sh"; exit 3 ;;
esac
eval "$fnsrc"

echo
echo "=== the composer must be excluded from the delivery search ==="

# A pane whose TRANSCRIPT holds the marker: real delivery.
tmux send-keys -t "$T" 'clear; echo "MARKER-DELIVERED-XYZ received and processed"' C-m; sleep 1
if transcript_of "$T" | grep -qF "MARKER-DELIVERED-XYZ"; then
  ok "a marker in the TRANSCRIPT is still found (no regression on real delivery)"
else
  bad "a marker in the TRANSCRIPT is still found" "not found"
fi

# A pane whose COMPOSER holds the marker, unsubmitted: the exact false positive.
# Render a REAL composer shape: a prompt-cursor line as the last content on screen, with
# the shell frozen afterwards so no shell prompt reappears below it. Typing at a bash prompt
# does NOT reproduce this — the shell prefixes its own prompt, so the cursor is not at line
# start and the heuristic never fires.
#
# The marker is written to a FILE and cat'd, never typed into the command. First attempt put
# it inline, so the shell's own echo of the command put the marker into SCROLLBACK — and the
# test then failed a fix that was working, because the marker really was in the transcript.
# A test that plants its needle in the haystack it is searching proves nothing.
STUCKFILE=$(mktemp /tmp/tower-stuck-XXXXXX)
printf '\xe2\x9d\xaf MARKER-STUCK-ABC this text is sitting in the input box\n' > "$STUCKFILE"
tmux send-keys -t "$T" "clear; printf 'some earlier transcript output\n\n'; cat $STUCKFILE; stty -echo; cat > /dev/null" C-m
sleep 2
if transcript_of "$T" | grep -qF "MARKER-STUCK-ABC"; then
  bad "a marker ONLY in the composer must NOT count as delivered" "found in transcript_of — the false positive is still live"
else
  ok "a marker ONLY in the composer is NOT counted as delivered"
fi
if composer_region "$T" | grep -qF "MARKER-STUCK-ABC"; then
  ok "the same marker IS visible in composer_region — so a stuck paste is detectable"
else
  bad "composer_region sees the stuck text" "not found"
fi

# Earlier transcript content must survive composer exclusion — the cut must not eat history.
if transcript_of "$T" | grep -qF "some earlier transcript output"; then
  ok "excluding the composer does NOT discard real transcript history above it"
else
  bad "transcript above the composer survives" "history was over-trimmed"
fi

echo
echo "=== fail-safe: no composer found means fall back, never silently empty ==="
tmux kill-session -t "$S" 2>/dev/null
tmux new-session -d -s "$S" -x 100 -y 24 2>/dev/null; sleep 1
T=$(tmux list-panes -t "$S" -F '#{session_name}:#{window_index}.#{pane_index}' | head -1)
tmux send-keys -t "$T" 'clear; printf "NOPROMPT-CASE-123\n"; stty -echo; cat > /dev/null' C-m
sleep 2
out=$(transcript_of "$T")
if printf '%s' "$out" | grep -qF "NOPROMPT-CASE-123"; then
  ok "with no locatable composer it falls back to the whole buffer (pre-fix behaviour, no regression)"
else
  bad "fallback returns the whole buffer" "marker lost — the fix would cause false NOT_DELIVERED"
fi

echo
echo "==================================================================="
echo "  PASS: $PASS    FAIL: $FAIL"
echo "==================================================================="
[ "$FAIL" -eq 0 ]
