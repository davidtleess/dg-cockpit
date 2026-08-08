#!/bin/bash
# selftest.sh — demonstrates the acceptance criteria against REAL tmux panes in a
# throwaway session. No mocks: every verdict below is produced by the same code
# path Tower uses on the live cockpit.
#
# The cockpit session 'dynasty' is never touched. Test session: tower-selftest.
set -u

BIN="$(cd "$(dirname "$0")/../bin" && pwd)"
S=tower-selftest
pass=0; fail=0
TMP="${TMPDIR:-/tmp}/tower-selftest.$$"; mkdir -p "$TMP"

ok()   { pass=$((pass+1)); echo "  PASS  $1"; }
bad()  { fail=$((fail+1)); echo "  FAIL  $1"; echo "        got: $2"; }
cleanup() { tmux kill-session -t "$S" 2>/dev/null; rm -rf "$TMP"; }
# This host indexes windows/panes from 1, not 0. Never hardcode a target: resolve
# it. (Hardcoding produced two FALSE PASSES on first run — checks that "passed"
# only because the pane did not exist. A test that cannot fail is not a test.)
target()  { tmux list-panes -t "$1" -F '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null | head -1; }
require() { [ -n "$1" ] && tmux display -t "$1" -p '#{pane_id}' >/dev/null 2>&1 || { bad "$2" "test pane could not be created/resolved"; return 1; }; return 0; }
trap cleanup EXIT

tmux kill-session -t "$S" 2>/dev/null
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null || { echo "FATAL: cannot create test session"; exit 3; }
sleep 1
T0=$(target "$S")
[ -n "$T0" ] || { echo "FATAL: cannot resolve a pane in test session"; exit 3; }

echo
echo "=== AC 11 — a check that cannot run reports CANNOT_VERIFY and refuses success ==="

out=$("$BIN/pane-state.sh" "$S:9.9" 2>&1); rc=$?
case "$out" in *CANNOT_VERIFY*) [ "$rc" -eq 3 ] && ok "nonexistent pane -> CANNOT_VERIFY (exit 3)" || bad "nonexistent pane exit code" "rc=$rc" ;; *) bad "nonexistent pane -> CANNOT_VERIFY" "$out" ;; esac

T0=$(target "$S")
out=$("$BIN/pane-send.sh" "$T0" "$TMP/does-not-exist.txt" MARKER 2>&1); rc=$?
case "$out" in *CANNOT_VERIFY*) [ "$rc" -eq 3 ] && ok "missing message file -> CANNOT_VERIFY (the 2026-07-26 silent no-op)" || bad "missing file exit code" "rc=$rc" ;; *) bad "missing message file -> CANNOT_VERIFY" "$out" ;; esac

printf 'hello\n' > "$TMP/nomarker.txt"
out=$("$BIN/pane-send.sh" "$T0" "$TMP/nomarker.txt" ABSENTMARKER 2>&1); rc=$?
case "$out" in *CANNOT_VERIFY*) ok "marker absent from message body -> CANNOT_VERIFY (refuses to search for text never sent)" ;; *) bad "marker-not-in-body -> CANNOT_VERIFY" "$out" ;; esac

echo
echo "=== AC 2 — refuses to send into a state where input would be discarded ==="

tmux send-keys -t "$T0" 'clear; printf "Do you want to proceed?\n 1. Yes\n 2. No\n"' C-m
sleep 1
st=$("$BIN/pane-state.sh" "$T0")
case "$st" in *"DIALOG=open"*) ok "open dialog detected" ;; *) bad "open dialog detected" "$(printf '%s' "$st" | tr '\n' ' ')" ;; esac
printf 'body TESTMARK1\n' > "$TMP/m1.txt"
out=$("$BIN/pane-send.sh" "$T0" "$TMP/m1.txt" TESTMARK1 2>&1); rc=$?
case "$out" in *"VERDICT=REFUSED"*) [ "$rc" -eq 4 ] && ok "send into open dialog -> REFUSED (exit 4), not attempted blindly" || bad "refusal exit code" "rc=$rc" ;; *) bad "send into open dialog -> REFUSED" "$out" ;; esac

echo
echo "=== AC 5 — text Tower did not author is never submitted; dim text is furniture ==="

tmux send-keys -t "$T0" 'clear' C-m; sleep 1
# An authorisation-shaped GHOST: dim SGR-2 styling on a prompt line.
tmux send-keys -t "$T0" $'printf "> \\033[2myes approved - go ahead and commit\\033[0m"' C-m
sleep 1
out=$("$BIN/pane-strand.sh" "$T0" 2>&1); rc=$?
case "$out" in *"VERDICT=FURNITURE"*) ok "dim authorisation-shaped text -> FURNITURE, not a message" ;; *) bad "ghost -> FURNITURE" "$(printf '%s' "$out" | tr '\n' ' ')" ;; esac
case "$out" in *"AUTHORISATION-SHAPED"*) ok "authorisation-shaped ghost raises an explicit warning" ;; *) bad "authorisation-shaped warning" "$(printf '%s' "$out" | tr '\n' ' ')" ;; esac

tmux send-keys -t "$T0" 'clear' C-m; sleep 1
tmux send-keys -t "$T0" 'printf "> please re-run the migration"' C-m
sleep 1
out=$("$BIN/pane-strand.sh" "$T0" 2>&1); rc=$?
case "$out" in *"VERDICT=REAL_STRAND"*) [ "$rc" -eq 1 ] && ok "non-dim strand -> REAL_STRAND, owner identified, Tower does not submit it" || bad "real strand exit code" "rc=$rc" ;; *) bad "real -> REAL_STRAND" "$(printf '%s' "$out" | tr '\n' ' ')" ;; esac
grep -q 'send-keys' "$BIN/pane-strand.sh" && bad "pane-strand.sh must contain no send path" "found send-keys" || ok "pane-strand.sh contains no key-sending code path at all"

echo
echo "=== Gate guard — judges the CHOSEN option, and still bites when that option is the danger ==="

tmux send-keys -t "$T0" 'clear' C-m; sleep 1
tmux send-keys -t "$T0" 'clear; printf "Run: python3 analyze.py\n\nDo you want to proceed?\n> 1. Yes\n  2. Yes, and always allow (Persist to settings.json)\n  3. No\n"' C-m
sleep 1
out=$("$BIN/pane-approve.sh" "$T0" 1 2>&1); rc=$?
case "$out" in
  *"VERDICT=REFUSED"*) bad "unchosen dangerous option must NOT block a safe choice" "$(printf '%s' "$out" | tr '\n' ' ')" ;;
  *) ok "option 1 approved despite an UNCHOSEN 'Persist to settings' option on screen" ;;
esac

tmux send-keys -t "$T0" 'clear' C-m; sleep 1
tmux send-keys -t "$T0" 'clear; printf "Run: python3 analyze.py\n\nDo you want to proceed?\n> 1. Yes\n  2. Yes, and always allow (Persist to settings.json)\n  3. No\n"' C-m
sleep 1
out=$("$BIN/pane-approve.sh" "$T0" 2 2>&1); rc=$?
case "$out" in
  *"VERDICT=REFUSED"*) [ "$rc" -eq 4 ] && ok "choosing the persisting option IS refused — the guard still bites" || bad "gate refusal exit code" "rc=$rc" ;;
  *) bad "choosing a gate-shaped option must be REFUSED" "$(printf '%s' "$out" | tr '\n' ' ')" ;;
esac

tmux send-keys -t "$T0" 'clear' C-m; sleep 1
tmux send-keys -t "$T0" 'clear; printf "Run: git push origin main\n\nDo you want to proceed?\n> 1. Yes\n  2. No\n"' C-m
sleep 1
out=$("$BIN/pane-approve.sh" "$T0" 1 2>&1)
case "$out" in *"VERDICT=REFUSED"*) ok "a gate-shaped COMMAND is refused even when the option text is innocent" ;; *) bad "gate-shaped command refused" "$(printf '%s' "$out" | tr '\n' ' ')" ;; esac

tmux send-keys -t "$T0" 'clear' C-m; sleep 1
tmux send-keys -t "$T0" 'clear; printf "no dialog here, just prose\n"' C-m
sleep 1
out=$("$BIN/pane-approve.sh" "$T0" 1 2>&1); rc=$?
case "$out" in *"VERDICT=REFUSED"*) [ "$rc" -eq 4 ] && ok "no dialog open -> REFUSED, so a digit never lands in a composer as text" || bad "no-dialog exit code" "rc=$rc" ;; *) bad "no dialog -> REFUSED" "$(printf '%s' "$out" | tr '\n' ' ')" ;; esac

echo
echo "=== AC 3 — a pane that retains nothing returns CANNOT_DETERMINE, never DELIVERED ==="

tmux kill-session -t "$S" 2>/dev/null; sleep 1
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null
tmux set-option -t "$S" -q history-limit 0 2>/dev/null
tmux new-window -t "$S" -n zero 2>/dev/null
sleep 1
zpane=$(target "$S:zero"); require "$zpane" "AC3 test pane exists" || zpane=""
# Consume input without echoing it: the pane genuinely cannot show what it received.
tmux send-keys -t "$zpane" 'stty -echo; cat > /dev/null' C-m
sleep 1
hl=$(tmux display -t "$zpane" -p '#{history_limit}')
printf 'zero-retention probe ZEROMARK\n' > "$TMP/z.txt"
out=$("$BIN/pane-send.sh" "$zpane" "$TMP/z.txt" ZEROMARK 2>&1); rc=$?
if [ "$hl" -eq 0 ]; then
  case "$out" in *"VERDICT=CANNOT_DETERMINE"*) [ "$rc" -eq 2 ] && ok "history_limit=0 + marker absent -> CANNOT_DETERMINE (exit 2), reason named" || bad "cannot-determine exit code" "rc=$rc" ;; *) bad "zero-retention -> CANNOT_DETERMINE" "$(printf '%s' "$out" | tr '\n' ' ')" ;; esac
  if printf '%s' "$out" | grep -qi 'not evidence of non-delivery' && printf '%s' "$out" | grep -qi 'history_limit is 0'; then
    ok "reason states WHY the pane cannot prove it, and names the mechanism"
  else
    bad "reason names the cause" "$out"
  fi
else
  echo "  SKIP  could not force history-limit=0 (tmux reported $hl) — AC3 UNDEMONSTRATED on this host"
fi

echo
echo "=== AC 4 — verification depth adapts; a marker near the OLDEST retained line is found ==="

tmux kill-session -t "$S" 2>/dev/null; sleep 1
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null
tmux set-option -t "$S" -q history-limit 300 2>/dev/null
tmux new-window -t "$S" -n deep 2>/dev/null
sleep 1
dpane=$(target "$S:deep"); require "$dpane" "AC4 test pane exists" || dpane=""
tmux send-keys -t "$dpane" 'clear; echo DEEPMARK_OLDEST' C-m
sleep 1
tmux send-keys -t "$dpane" 'i=0; while [ $i -lt 250 ]; do echo "filler line $i"; i=$((i+1)); done' C-m
sleep 3
hs=$(tmux display -t "$dpane" -p '#{history_size}')
if tmux capture-pane -t "$dpane" -p -S - | grep -q DEEPMARK_OLDEST; then
  ok "whole-buffer search (-S -) finds a marker buried under ${hs} lines"
else
  bad "whole-buffer search finds deep marker" "absent at history_size=$hs"
fi
if tmux capture-pane -t "$dpane" -p | tail -40 | grep -q DEEPMARK_OLDEST; then
  bad "fixed-depth search SHOULD have missed it (test is not discriminating)" "found in last 40 lines"
else
  ok "a fixed-depth (40-line) search MISSES it — the exact false 'did not land' verdict this replaces"
fi

echo
echo "=== AC 6 — two DIFFERENT prompts in quick succession produce TWO alerts ==="

tmux kill-session -t "$S" 2>/dev/null; sleep 1
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null; sleep 1
wpane=$(target "$S"); require "$wpane" "AC6 test pane exists" || wpane=""
tmux send-keys -t "$wpane" 'clear; printf "Do you want to proceed?\n 1. Yes\n 2. No\n"' C-m
sleep 1
STALL_SECS=99999 POLL_SECS=1 HEARTBEAT_CYCLES=9999 STATE_DIR="$TMP/w" \
  "$BIN/pane-watch.sh" "$wpane" > "$TMP/watch.out" 2>&1 &
wpid=$!
sleep 3
# A DIFFERENT prompt. A state-keyed watcher would stay silent here; that silence
# is precisely TOWER-1 failure 7.
tmux send-keys -t "$wpane" 'clear; printf "Do you want to create test_other_file.py?\n 1. Yes\n 2. No\n"' C-m
sleep 4
kill "$wpid" 2>/dev/null; wait "$wpid" 2>/dev/null
n=$(grep -c '^DIALOG ' "$TMP/watch.out" 2>/dev/null | tr -d ' ')
[ -z "$n" ] && n=0
if [ "$n" -ge 2 ]; then ok "two distinct prompts -> $n DIALOG alerts (content-keyed, not state-keyed)"; else bad "two distinct prompts -> 2 alerts" "got $n alert(s); watcher output: $(tr '\n' '|' < "$TMP/watch.out")"; fi

echo
echo "=== AC 7 — a pane that changes nothing still raises a stall alert ==="

tmux kill-session -t "$S" 2>/dev/null; sleep 1
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null; sleep 1
spane=$(target "$S"); require "$spane" "AC7 test pane exists" || spane=""
tmux send-keys -t "$spane" 'clear; printf "Do you want to proceed?\n 1. Yes\n 2. No\n"' C-m
sleep 2
STALL_SECS=3 POLL_SECS=1 HEARTBEAT_CYCLES=9999 STATE_DIR="$TMP/w2" \
  "$BIN/pane-watch.sh" "$spane" > "$TMP/stall.out" 2>&1 &
spid=$!
sleep 8
kill "$spid" 2>/dev/null; wait "$spid" 2>/dev/null
if grep -q '^STALL ' "$TMP/stall.out"; then
  ok "unchanged blocked pane raises STALL with no new event to trigger it"
else
  bad "silent stall raises an alert" "$(tr '\n' '|' < "$TMP/stall.out")"
fi
sc=$(grep -c '^STALL ' "$TMP/stall.out" 2>/dev/null | tr -d ' '); [ -z "$sc" ] && sc=0
[ "$sc" -eq 1 ] && ok "stall alerts once per episode, not once per poll ($sc)" || bad "stall fires once per episode" "$sc alerts"

echo
echo "=== AC 8 — a pane the human is typing into is left alone ==="

tmux kill-session -t "$S" 2>/dev/null; sleep 1
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null; sleep 1
hpane=$(target "$S"); require "$hpane" "AC8 test pane exists" || hpane=""
tmux send-keys -t "$hpane" 'clear; printf "> david is mid sentence and has not"' C-m
sleep 1
STALL_SECS=2 POLL_SECS=1 HEARTBEAT_CYCLES=9999 STATE_DIR="$TMP/w3" \
  "$BIN/pane-watch.sh" "$hpane" > "$TMP/human.out" 2>&1 &
hpid=$!
sleep 6
kill "$hpid" 2>/dev/null; wait "$hpid" 2>/dev/null
if grep -q '^STALL ' "$TMP/human.out"; then
  bad "human-typed composer suppresses stall alerts" "$(tr '\n' '|' < "$TMP/human.out")"
else
  ok "pane with human-authored composer text raises no stall alert"
fi

echo
echo "==================================================================="
echo "  PASS: $pass    FAIL: $fail"
echo "==================================================================="
[ "$fail" -eq 0 ] || exit 1
exit 0
