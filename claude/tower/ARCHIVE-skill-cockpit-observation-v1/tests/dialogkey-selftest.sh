#!/usr/bin/env bash
# dialogkey-selftest.sh — TOWER-3, 2026-07-28. Found by DAVID, not by Tower.
#
# HIS WORDS: "figure out why your skill did not see that claude and studio are waiting on a
# 'yes'. they are both idle."
#
# THE BUG. DIALOG_KEY was hashed from `dialog_block` — the grep-matched boilerplate plus the
# cursor'd option. That excludes the COMMAND, which is the only part that varies. Every Studio
# bash prompt renders exactly:
#     Do you want to proceed?
#   ❯ 1. Yes
# so every one of them hashed to the SAME key. pane-watch.sh de-duplicates by key, so it
# alerted once and then went silent for every later dialog on that pane — permanently.
#
# This is TOWER-1 failure 7 alive again. That failure was "fixed" by keying on prompt TEXT
# instead of pane state, and the original AC6 test PASSES — because its two prompts happened to
# differ in the grep-matched lines. Real dialogs differ in the lines the grep throws away.
#
# THE LESSON, which is bigger than the bug: a key must be built from what VARIES, and it must be
# tested against the shapes the system actually emits — not shapes invented for the test.
#
# Runs against a throwaway tmux session. `dynasty` is never touched.

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$HERE/../bin"
S="dialogkey-test-$$"
PASS=0; FAIL=0

ok()  { PASS=$((PASS+1)); printf '  PASS  %s\n' "$1"; }
bad() { FAIL=$((FAIL+1)); printf '  FAIL  %s\n        got: %s\n' "$1" "$2"; }
cleanup() { tmux kill-session -t "$S" 2>/dev/null; }
trap cleanup EXIT

tmux new-session -d -s "$S" -x 100 -y 26 2>/dev/null || { echo "FATAL: cannot create test session"; exit 3; }
sleep 1
T=$(tmux list-panes -t "$S" -F '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null | head -1)
[ -n "$T" ] || { echo "FATAL: cannot resolve a pane"; exit 3; }

# render <printf-body> <confirm-token> — draw, then CONFIRM it is on screen before reading.
key_for() {
  tmux send-keys -t "$T" 'clear' C-m; sleep 0.4
  tmux send-keys -t "$T" "clear; printf '$1'" C-m
  local i=0 okrender=0
  while [ $i -lt 20 ]; do
    tmux capture-pane -t "$T" -p 2>/dev/null | grep -qF "$2" && { okrender=1; break; }
    sleep 0.3; i=$((i+1))
  done
  [ "$okrender" = 1 ] || { echo "RENDER_FAILED"; return; }
  "$BIN/pane-state.sh" "$T" 2>/dev/null | grep '^DIALOG_KEY=' | cut -d= -f2-
}

echo
echo "=== the REAL cockpit shape: identical boilerplate, different command ==="

# Exactly what Studio emits. Only the command differs; the question and options are identical.
k1=$(key_for 'Bash command\n\n   node tools/craft-gate.mjs proposals/011/prototype.html\n   Run the gate\n\n Do you want to proceed?\n ❯ 1. Yes\n   2. No\n' 'craft-gate.mjs')
k2=$(key_for 'Bash command\n\n   python3 analysis/qb-grain.py\n   Measure whether QB supports a finer ladder\n\n Do you want to proceed?\n ❯ 1. Yes\n   2. No\n' 'qb-grain.py')

case "$k1$k2" in
  *RENDER_FAILED*) bad "two different commands under identical boilerplate produce DIFFERENT keys" "a dialog failed to render; nothing was exercised" ;;
  *) if [ -z "$k1" ] || [ -z "$k2" ]; then
       bad "two different commands under identical boilerplate produce DIFFERENT keys" "empty key — dialog not detected at all (k1='$k1' k2='$k2')"
     elif [ "$k1" = "$k2" ]; then
       bad "two different commands under identical boilerplate produce DIFFERENT keys" "SAME key $k1 — the watcher would stay silent for the second dialog"
     else
       ok "two different commands under identical boilerplate produce DIFFERENT keys"
     fi ;;
esac

# Claude's edit-dialog shape: same file edited twice is legitimately the same prompt...
k3=$(key_for 'diff --git a/framing.md\n+ line one\n\n Do you want to make this edit to framing_v2.md?\n ❯ 1. Yes\n   2. No\n' 'framing_v2.md')
k4=$(key_for 'diff --git a/framing.md\n+ line one\n\n Do you want to make this edit to framing_v2.md?\n ❯ 1. Yes\n   2. No\n' 'framing_v2.md')
if [ -n "$k3" ] && [ "$k3" = "$k4" ]; then
  ok "an IDENTICAL prompt still keys the same — no alert-spam regression"
else
  bad "identical prompt keys the same" "k3='$k3' k4='$k4'"
fi

# ...but a different file must not be swallowed by the previous one's key.
k5=$(key_for 'diff --git a/other.md\n+ line one\n\n Do you want to make this edit to board_v3.md?\n ❯ 1. Yes\n   2. No\n' 'board_v3.md')
if [ -n "$k5" ] && [ "$k5" != "$k3" ]; then
  ok "a DIFFERENT edit target produces a different key"
else
  bad "different edit target differs" "k5='$k5' k3='$k3'"
fi

# The permission-request shape both Gemini and Codex emit.
k6=$(key_for 'Requesting permission for:\n   launchctl list | grep davidleess\n\n Do you want to proceed?\n ❯ 1. Yes\n   2. No\n' 'launchctl list')
k7=$(key_for 'Requesting permission for:\n   ls -la app/data/logs\n\n Do you want to proceed?\n ❯ 1. Yes\n   2. No\n' 'ls -la app/data/logs')
if [ -n "$k6" ] && [ -n "$k7" ] && [ "$k6" != "$k7" ]; then
  ok "two different permission requests produce different keys"
else
  bad "different permission requests differ" "k6='$k6' k7='$k7'"
fi

echo
echo "==================================================================="
echo "  PASS: $PASS    FAIL: $FAIL"
echo "==================================================================="
[ "$FAIL" -eq 0 ]
