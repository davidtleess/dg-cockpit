#!/bin/bash
# heredoc-selftest.sh — a heredoc PAYLOAD is content; a heredoc payload a shell would
# EXECUTE is still a command. Four cases, all built from shapes the live cockpit emits.
#
# Why (2026-07-30): dynasty:1.3 sat blocked on a ledger-append prompt. pane-approve.sh
# refused it as GATE-SHAPED on the word "force", which appeared inside the heredoc PROSE
# — "05 §1 David-verbatim in force". The same guard would refuse most ledger entries this
# cockpit writes, because they describe commits, pushes and deletions for a living.
#
# This is the THIRD instance of one defect class in this script: the guard reading text
# that is not the action (2026-07-26 the unchosen menu option; 2026-07-28 the word
# "launchctl" in a diff body; today the heredoc payload). The lesson is now explicit in
# the source: judge the ACTION, and treat everything the action merely WRITES as content.
set -u

BIN="$(cd "$(dirname "$0")/../bin" && pwd)"
S=tower-heredoctest
pass=0; fail=0
ok()  { pass=$((pass+1)); echo "  PASS  $1"; }
bad() { fail=$((fail+1)); echo "  FAIL  $1"; echo "        got: $2"; }
cleanup() { tmux kill-session -t "$S" 2>/dev/null; rm -rf "$TMP"; }
target() { tmux list-panes -t "$1" -F '#{session_name}:#{window_index}.#{pane_index}' 2>/dev/null | head -1; }
TMP="${TMPDIR:-/tmp}/tower-heredoctest.$$"; mkdir -p "$TMP"
trap cleanup EXIT

tmux kill-session -t "$S" 2>/dev/null
tmux new-session -d -s "$S" -x 100 -y 30 2>/dev/null || { echo "FATAL: cannot create test session"; exit 3; }
sleep 1
T=$(target "$S")
[ -n "$T" ] || { echo "FATAL: cannot resolve a test pane"; exit 3; }

# pane-approve.sh sends a BARE DIGIT — correct for a real dialog, which needs no Enter.
# In a test pane that digit lands in the shell's input line and stays there, so the NEXT
# painted command becomes "1clear; cat ..." and never runs: the pane keeps showing the
# PREVIOUS fixture and every later case silently grades the wrong screen. That produced
# two false FAILs and would just as happily produce false PASSes. Clear the line first.
paint() { tmux send-keys -t "$T" C-u 2>/dev/null; tmux send-keys -t "$T" "clear; cat $1" C-m; sleep 1; }

# ---- 1. The live shape that was wrongly refused --------------------------------------
# Captured off dynasty:1.3, 2026-07-30 08:50. "in force" is the trip-word; the payload
# also names a commit, which every ledger entry does.
cat > "$TMP/ledger.txt" <<'EOF'
Requesting permission for:
   .venv/bin/python3.14 scripts/gemini_ledger_append.py << 'EOF2'
   - **Task:** morning session start and preflight registration.
   - **Governance read:** 02 v1.5.0 - 05 v1.2.1 (§1 David-verbatim in force; §2 onward
     agent-authored, PENDING ratification) - AGENT_SYNC.md - today's ledger entries.
   - **Note:** the census commit landed yesterday and was pushed after review.
Do you want to proceed?
> 1. Yes
  2. Yes, and always allow in this conversation
  3. Yes, and always allow (Persist to settings.json)
  4. No
EOF

echo
echo "=== 1 — prose inside a heredoc payload does not make a ledger append gate-shaped ==="
paint "$TMP/ledger.txt"
out=$("$BIN/pane-approve.sh" "$T" 1 2>&1); rc=$?
case "$out" in
  *"VERDICT=REFUSED"*) bad "ledger-append payload prose must not refuse" "$(printf '%s' "$out" | tr '\n' ' ')" ;;
  *) [ "$rc" -eq 0 ] && ok "approved; payload excluded from the command scan" || bad "expected approval" "rc=$rc $out" ;;
esac
case "$out" in *"heredoc payload excluded"*) ok "scope note discloses that the payload was excluded" ;; *) bad "scope note must disclose the exclusion" "$out" ;; esac

# ---- 2. A payload a SHELL would execute is still a command --------------------------
cat > "$TMP/shell.txt" <<'EOF'
Requesting permission for:
   bash << 'EOF2'
   git push origin main --force
Do you want to proceed?
> 1. Yes
  2. No
EOF

echo
echo "=== 2 — a heredoc a shell would EXECUTE is still scanned (payload retained) ==="
paint "$TMP/shell.txt"
out=$("$BIN/pane-approve.sh" "$T" 1 2>&1); rc=$?
case "$out" in
  *"VERDICT=REFUSED"*) [ "$rc" -eq 4 ] && ok "executable payload -> REFUSED (exit 4)" || bad "refusal exit code" "rc=$rc" ;;
  *) bad "shell heredoc containing a force push must be REFUSED" "$(printf '%s' "$out" | tr '\n' ' ')" ;;
esac

# ---- 3. python reading CODE from stdin is a shell for this purpose -------------------
cat > "$TMP/pystdin.txt" <<'EOF'
Requesting permission for:
   python3 << 'EOF2'
   import subprocess; subprocess.run(["git","commit","-am","x"])
Do you want to proceed?
> 1. Yes
  2. No
EOF

echo
echo "=== 3 — executable payload reaching git through CODE, not literal syntax, is refused ==="
paint "$TMP/pystdin.txt"
out=$("$BIN/pane-approve.sh" "$T" 1 2>&1)
case "$out" in
  *"VERDICT=REFUSED"*) ok "python-reading-stdin payload -> REFUSED" ;;
  *) bad "python with no script file must have its payload scanned" "$(printf '%s' "$out" | tr '\n' ' ')" ;;
esac

# ---- 4. The COMMAND LINE is never relaxed ------------------------------------------
cat > "$TMP/cmdgate.txt" <<'EOF'
Requesting permission for:
   git commit -F - << 'EOF2'
   a perfectly innocent message
Do you want to proceed?
> 1. Yes
  2. No
EOF

echo
echo "=== 4 — a gate-shaped COMMAND is refused however innocent the payload ==="
paint "$TMP/cmdgate.txt"
out=$("$BIN/pane-approve.sh" "$T" 1 2>&1)
case "$out" in
  *"VERDICT=REFUSED"*) ok "git commit with an innocent heredoc -> still REFUSED" ;;
  *) bad "gate-shaped command must refuse regardless of payload" "$(printf '%s' "$out" | tr '\n' ' ')" ;;
esac

echo
echo "==================================================================="
echo "  PASS: $pass    FAIL: $fail"
echo "==================================================================="
[ "$fail" -eq 0 ] || exit 1
