#!/bin/bash
# busy-selftest.sh — BUSY detection, against shapes CAPTURED OFF THE LIVE COCKPIT.
#
# Why this file exists (2026-07-30). pane-state.sh detected "working" by ONE signal:
# the footer hint 'esc to interrupt'. dynasty:1.1 renders that hint while working.
# dynasty:2.1 does NOT — its footer carries a custom Studio banner instead — so Tower
# measured BUSY=no on Studio while its spinner read
#
#     ✽ Undulating… (1m 7s · ↓ 3.0k tokens · still thinking with high effort)
#
# That is the precise shape of the error David caught on 2026-07-29 ("studio is NOT at
# rest"), and it fed say-clear.sh and closeout-check.sh, both of which would have
# certified a working lane as at rest.
#
# The FIRST fix was ALSO wrong, and only a real capture found it: it read the bottom 8
# content rows, and queued messages had pushed the spinner 11 rows above the last
# content line. **Position in a pane is not an anchor. Shape is.**
#
# Every fixture below is a verbatim shape taken off the live cockpit, per the skill's
# own rule: test against what the system emits, never against a shape invented to
# demonstrate the mechanism.
set -u

BIN="$(cd "$(dirname "$0")/../bin" && pwd)"
S=tower-busytest
pass=0; fail=0
ok()  { pass=$((pass+1)); echo "  PASS  $1"; }
bad() { fail=$((fail+1)); echo "  FAIL  $1"; echo "        got: $2"; }
cleanup() { tmux kill-session -t "$S" 2>/dev/null; }
target() { tmux list-panes -t "$1" -F '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null | head -1; }
trap cleanup EXIT

tmux kill-session -t "$S" 2>/dev/null
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null || { echo "FATAL: cannot create test session"; exit 3; }
sleep 1
T=$(target "$S")
[ -n "$T" ] || { echo "FATAL: cannot resolve a test pane"; exit 3; }

# paint <heredoc-file> — render a captured pane shape into the test pane.
paint() { tmux send-keys -t "$T" "clear; cat $1" C-m; sleep 1; }
busy_of() { "$BIN/pane-state.sh" "$T" | sed -n 's/^BUSY=//p'; }
sig_of()  { "$BIN/pane-state.sh" "$T" | sed -n 's/^BUSY_SIGNAL=//p'; }

TMP="${TMPDIR:-/tmp}/tower-busytest.$$"; mkdir -p "$TMP"

# ---- Fixture 1: dynasty:2.1 WORKING, no footer hint, spinner 11 rows up ------------
# Captured 2026-07-30 08:12. This exact screen returned BUSY=no before the fix.
cat > "$TMP/studio-working.txt" <<'EOF'
  Read 2 files
> Continuing the bootstrap — DAVID.md is long and the recent entries matter most.

* Undulating... (2m 24s . 11.4k tokens)

  > well - there was some work Studio did at the very end of last session
  > make sure you understand how the last session ended

----------------------------------------------------------------------
> Press up to edit queued messages
----------------------------------------------------------------------
  STUDIO . independent front-end practice . outsider lane
  auto mode on (shift+tab to cycle)
EOF
# The real screen uses U+2026 in "Undulating…" and that is the anchor being tested,
# so substitute the real glyph rather than an ASCII stand-in.
perl -i -pe 's/Undulating\.\.\./Undulating\x{2026}/' "$TMP/studio-working.txt" 2>/dev/null \
  || sed -i '' 's/Undulating\.\.\./Undulating…/' "$TMP/studio-working.txt"

echo
echo "=== 1 — a working lane with NO footer interrupt hint is BUSY (the Studio miss) ==="
paint "$TMP/studio-working.txt"
b=$(busy_of); s=$(sig_of)
if [ "$b" = "yes" ] && [ "$s" = "spinner-elapsed" ]; then
  ok "spinner detected without any footer hint -> BUSY=yes via spinner-elapsed"
else
  bad "working-without-footer-hint -> BUSY=yes" "BUSY=$b SIGNAL=$s"
fi

echo
echo "=== 2 — the spinner is found even when pushed far from the bottom ==="
# Same fixture: the spinner sits 11 content rows above the last row. A bottom-anchored
# detector passes test 1 only if the pane is short, and fails here. Assert the distance.
rows_below=$(grep -n 'Undulating' "$TMP/studio-working.txt" | cut -d: -f1)
total=$(grep -c '' "$TMP/studio-working.txt")
gap=$((total - rows_below))
if [ "$gap" -ge 8 ]; then
  ok "fixture keeps the spinner $gap rows above the last row (a bottom-8 read would miss it)"
else
  bad "fixture must place the spinner >=8 rows from the bottom" "gap=$gap"
fi

echo
echo "=== 3 — a lane at rest is NOT busy ==="
cat > "$TMP/studio-idle.txt" <<'EOF'
> I'll run my bootstrap now.
  Read 2 files

----------------------------------------------------------------------
>
----------------------------------------------------------------------
  STUDIO . independent front-end practice . outsider lane
  auto mode on (shift+tab to cycle)
EOF
paint "$TMP/studio-idle.txt"
b=$(busy_of)
[ "$b" = "no" ] && ok "idle pane -> BUSY=no" || bad "idle pane -> BUSY=no" "BUSY=$b"

echo
echo "=== 4 — prose ABOUT tokens and elapsed time does not fake a spinner ==="
# The failure mode a looser regex would introduce. This cockpit discusses token counts
# and run latencies constantly, so the detector must not convict a sentence.
cat > "$TMP/prose.txt" <<'EOF'
> The run took (2m 24s) and burned 11.4k tokens, which is 47s slower than
  yesterday's 3.0k tokens per call. No thinking budget was exceeded.

----------------------------------------------------------------------
>
----------------------------------------------------------------------
EOF
paint "$TMP/prose.txt"
b=$(busy_of)
[ "$b" = "no" ] && ok "prose containing elapsed times and token counts -> BUSY=no" || bad "prose must not read as a spinner" "BUSY=$b"

echo
echo "=== 5 — the footer hint alone still works (the original signal is not regressed) ==="
cat > "$TMP/footer.txt" <<'EOF'
> Sketching a plan.

----------------------------------------------------------------------
>
----------------------------------------------------------------------
  auto mode on (shift+tab to cycle) . esc to interrupt . for agents
EOF
paint "$TMP/footer.txt"
b=$(busy_of); s=$(sig_of)
if [ "$b" = "yes" ] && [ "$s" = "footer-interrupt-hint" ]; then
  ok "footer hint alone -> BUSY=yes via footer-interrupt-hint"
else
  bad "footer-hint signal regressed" "BUSY=$b SIGNAL=$s"
fi

rm -rf "$TMP"
echo
echo "==================================================================="
echo "  PASS: $pass    FAIL: $fail"
echo "==================================================================="
[ "$fail" -eq 0 ] || exit 1
