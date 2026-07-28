#!/usr/bin/env bash
# guardfix-selftest.sh — the two guard fixes David authorised on 2026-07-28.
#
# FIX A  edit dialogs judge WHERE they write, never the diff body.
# FIX B  launchctl reads are permitted; anything that mutates a scheduled job is David's.
#
# Both narrow the guard's REACH while TIGHTENING what it protects, so every case below
# exists in a pair: the thing that was wrongly refused must now pass, AND the thing it
# was protecting must still be refused. A fix that only proves the first half is how a
# guard quietly stops guarding.
#
# Runs against a throwaway tmux session. `dynasty` is never touched.

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$HERE/../bin"
S="guardfix-test-$$"
PASS=0; FAIL=0

ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n        got: %s\n' "$1" "$2"; }
cleanup() { tmux kill-session -t "$S" 2>/dev/null; }
trap cleanup EXIT

tmux new-session -d -s "$S" -x 110 -y 30 2>/dev/null || { echo "FATAL: cannot create test session"; exit 3; }
sleep 1
# Resolve the pane rather than assuming index 0 — David's tmux.conf sets base-index 1,
# so a hardcoded :0.0 silently addresses nothing. That is how the first run of THIS file
# produced two green lines against a pane that did not exist.
T=$(tmux list-panes -t "$S" -F '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null | head -1)
[ -n "$T" ] || { echo "FATAL: cannot resolve a pane in test session"; exit 3; }

# render <printf-body> <token> — draw a fake dialog and CONFIRM it is actually on screen
# before anything judges it. A permitted case sends "1"+Enter into the pane, and that stray
# input can still be settling when the next dialog is drawn; judging a guard against a pane
# whose content has not been confirmed produced two false FAILs on the first run of this file.
# Never judge a guard against unconfirmed content — in either direction.
RENDER_OK=1
render() {
  tmux send-keys -t "$T" 'clear' C-m; sleep 0.4
  tmux send-keys -t "$T" "clear; printf '$1'" C-m
  local tok="$2" i=0
  RENDER_OK=0
  while [ $i -lt 20 ]; do
    if tmux capture-pane -t "$T" -p 2>/dev/null | grep -qF "$tok"; then RENDER_OK=1; break; fi
    sleep 0.3; i=$((i+1))
  done
}
verdict() {
  [ "$RENDER_OK" = 1 ] || { echo "VERDICT=CANNOT_VERIFY REASON=cannot establish state — test dialog never rendered"; return; }
  "$BIN/pane-approve.sh" "$T" 1 2>&1
}

# An UNREADABLE pane must never produce a pass, in either direction. On the first run of
# this file, CANNOT_VERIFY on a dead pane counted as "not refused" and printed two green
# lines for guards that were never exercised. Same class of bug as the one being fixed.
#
# But not every CANNOT_VERIFY means blindness. These dialogs are printf'd text that cannot
# close, so a keystroke that IS allowed through leaves the prompt on screen and correctly
# reports "the same prompt is still open after the keystroke". That verdict PROVES the guard
# ran and permitted the press — it is exactly what a permitted case should look like here.
# Only a genuine failure to read the pane counts as unreadable.
readable() {
  printf '%s' "$1" | grep -qE 'cannot establish state|state lost' && return 1
  return 0
}

expect_refused() { # <label> <verdict-output>
  if ! readable "$2"; then bad "$1" "UNREADABLE PANE — no verdict was exercised"; return; fi
  printf '%s' "$2" | grep -q 'VERDICT=REFUSED' && ok "$1" || bad "$1" "$(printf '%s' "$2" | head -2 | tr '\n' ' ')"
}
expect_not_refused() {
  if ! readable "$2"; then bad "$1" "UNREADABLE PANE — no verdict was exercised"; return; fi
  printf '%s' "$2" | grep -q 'VERDICT=REFUSED' && bad "$1" "$(printf '%s' "$2" | head -2 | tr '\n' ' ')" || ok "$1"
}

echo
echo "=== FIX A — an edit dialog is judged by its TARGET, not its diff body ==="

# The exact 2026-07-28 failure: a ledger entry whose PROSE mentions launchctl.
render 'diff --git a/docs/agent-ledger/2026-07-28.md\n+ Gemini was blocked on launchctl list and\n+ the commit was deferred; we did not delete anything.\n\nDo you want to make this edit to 2026-07-28.md?\n 1. Yes\n 2. No\n' '2026-07-28.md?'
expect_not_refused "prose containing launchctl/commit/delete in a DIFF no longer refuses the edit" "$(verdict)"

# The other half: the target itself is gate-shaped, and must be refused ON SIGHT.
render 'Do you want to make this edit to settings.json?\n 1. Yes\n 2. No\n' 'settings.json?'
expect_refused "an edit TARGETING settings.json is refused" "$(verdict)"

render 'Do you want to create com.davidleess.dynasty-fc-snapshot.plist?\n 1. Yes\n 2. No\n' 'fc-snapshot.plist?'
expect_refused "an edit TARGETING a launchd .plist is refused" "$(verdict)"

render 'Do you want to write to /Users/davidleess/.bash_profile?\n 1. Yes\n 2. No\n' '.bash_profile?'
expect_refused "an edit TARGETING shell config is refused" "$(verdict)"

# Fix A must not become a bypass: a real COMMAND dialog is still scanned as a command.
render 'Run: git push origin main\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'git push origin main'
expect_refused "a git push COMMAND dialog is still refused (Fix A is not a bypass)" "$(verdict)"

echo
echo "=== FIX B — launchctl reads pass; anything that mutates a job is David's ==="

render 'Requesting permission for:\n   launchctl list | grep davidleess\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl list'
expect_not_refused "launchctl list is permitted (the command that froze Gemini three times)" "$(verdict)"

render 'Requesting permission for:\n   launchctl print gui/501/com.davidleess.dg-cockpit-backup\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl print'
expect_not_refused "launchctl print is permitted" "$(verdict)"

render 'Requesting permission for:\n   launchctl unload ~/Library/LaunchAgents/com.davidleess.dynasty-fc-snapshot.plist\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl unload'
expect_refused "launchctl unload is REFUSED" "$(verdict)"

render 'Requesting permission for:\n   launchctl bootout gui/501/com.davidleess.dg-mail-carrier\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl bootout'
expect_refused "launchctl bootout is REFUSED" "$(verdict)"

# The allowlist must fail CLOSED on anything it does not recognise.
render 'Requesting permission for:\n   launchctl\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl'
expect_refused "bare launchctl with no subcommand is REFUSED (allowlist fails closed)" "$(verdict)"

render 'Requesting permission for:\n   launchctl frobnicate com.example.thing\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl frobnicate'
expect_refused "an UNKNOWN launchctl subcommand is REFUSED (future-proof)" "$(verdict)"

# A read smuggled in front of a mutation must not launder the mutation.
render 'Requesting permission for:\n   launchctl list && launchctl unload ~/Library/LaunchAgents/x.plist\n\nDo you want to proceed?\n 1. Yes\n 2. No\n' 'launchctl list &&'
expect_refused "a permitted read does NOT launder a mutation in the same command" "$(verdict)"

echo
echo "==================================================================="
echo "  PASS: $PASS    FAIL: $FAIL"
echo "==================================================================="
[ "$FAIL" -eq 0 ]
