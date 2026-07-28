#!/bin/bash
# Self-test for bin/open-asks.sh v2. Uses a throwaway tmux session; `dynasty` is never touched.
cd "$(dirname "$0")/.." || exit 1
S="oa-selftest-$$"
pass=0; fail=0
cleanup(){ tmux kill-session -t "$S" 2>/dev/null; }
trap cleanup EXIT
tmux new-session -d -s "$S" -x 120 -y 40 'cat' 2>/dev/null || { echo "cannot create tmux session"; exit 1; }
# base-index may be 1 (it is in this cockpit) — never assume 0.
P=$(tmux list-panes -t "$S" -F '#{session_name}:#{window_index}.#{pane_index}' | head -1)
[ -n "$P" ] || { echo "cannot resolve pane"; exit 1; }
feed(){ tmux send-keys -t "$1" "$2" C-m; }
check(){ # check <name> <pane> <should-be-open: yes|no>
  out=$(./bin/open-asks.sh "$2" 2>&1)
  if grep -q "UNREADABLE" <<<"$out"; then
    echo "  FAIL  $1 (pane unreadable — a pass here would be for the wrong reason)"; fail=$((fail+1)); return
  fi
  # match the FINDING line, not the banner ("OPEN ASKS SWEEP" contains "OPEN ASK")
  if grep -q "⚠ OPEN ASK" <<<"$out"; then got=yes; else got=no; fi
  if [ "$got" = "$3" ]; then echo "  PASS  $1"; pass=$((pass+1))
  else echo "  FAIL  $1 (expected open=$3, got $got)"; sed 's/^/        /' <<<"$out"; fail=$((fail+1)); fi
}
echo "open-asks v2 self-test"

feed "$P" "some ordinary work output"
check "AC1 no ask at all -> clean" "$P" no

feed "$P" "I never got your word to fire those asks."
check "AC2 unanswered ask -> OPEN" "$P" yes

feed "$P" "[TW28Z] Word given - fire the asks now."
check "AC3 same ask, Tower replied after it -> NOT open" "$P" no

feed "$P" ">>> DAVID: react to the tier ladder"
check "AC4 a NEW ask after the reply -> OPEN again" "$P" yes

feed "$P" "[TW29A] parked with me, going to him tomorrow"
check "AC5 answered again -> clean" "$P" no

out=$(./bin/open-asks.sh "$S:9.9" 2>&1)
if grep -q "UNREADABLE" <<<"$out"; then echo "  PASS  AC6 unreadable pane is flagged, never assumed at rest"; pass=$((pass+1))
else echo "  FAIL  AC6 unreadable pane not flagged"; fail=$((fail+1)); fi

echo
echo "open-asks: $pass passed, $fail failed"
[ "$fail" = 0 ]
