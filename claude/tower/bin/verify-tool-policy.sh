#!/bin/bash
# verify-tool-policy.sh — boundary matrix for dg-antigravity-tool-policy.mjs.
#
# Run this BEFORE installing any change to the policy, and again AFTER installing.
# It asserts expected decisions rather than printing output for a human to squint at,
# so a regression fails loudly instead of looking plausible.
#
#   verify-tool-policy.sh                 # verifies the LIVE policy
#   verify-tool-policy.sh /path/to/candidate.mjs
#
# Exit 0 = ALL PASS. Exit 1 = at least one case behaved wrongly; do not install.
#
# Written 2026-08-19 after Tower shipped, then reverted, an unverified change that
# would have made $HOME an authorized root and breached the Studio wall.

set -u
POLICY="${1:-$HOME/.gemini/config/plugins/dg-autonomy/scripts/dg-antigravity-tool-policy.mjs}"
[ -f "$POLICY" ] || { echo "verify: no such policy file: $POLICY" >&2; exit 1; }

T="$HOME/dynasty-genius-product"
L="$T/docs/agent-ledger"
STUDIO="$HOME/frontend-studio"
AGY="[\"$T\",\"$L\"]"          # how agy really reports one workspace

pass=0; fail=0

# check <expected allow|deny> <label> <json event> [env assignment]
check() {
  local want="$1" label="$2" ev="$3" envassign="${4:-}"
  local out got
  if [ -n "$envassign" ]; then
    out=$(printf '%s' "$ev" | env "$envassign" node "$POLICY" 2>/dev/null)
  else
    out=$(printf '%s' "$ev" | node "$POLICY" 2>/dev/null)
  fi
  case "$out" in
    *'"decision":"allow"'*) got=allow ;;
    *'"decision":"deny"'*)  got=deny ;;
    *)                      got="NO-OUTPUT" ;;
  esac
  if [ "$got" = "$want" ]; then
    pass=$((pass+1)); printf '  PASS  %-8s %s\n' "$want" "$label"
  else
    fail=$((fail+1)); printf '  FAIL  want=%-6s got=%-9s %s\n' "$want" "$got" "$label"
  fi
}

# write event with agy's real PascalCase key
W() { printf '{"toolCall":{"name":"write_to_file","args":{"TargetFile":"%s","CodeContent":"x"}},"workspacePaths":%s}' "$1" "$2"; }

echo "verify-tool-policy: $POLICY"
echo
echo "-- agy's real 2-entry workspace, no env override --"
check allow "write inside repo (ledger)"        "$(W "$L/2026-08-19.md" "$AGY")"
check allow "write inside repo (product code)"  "$(W "$T/app/main.py" "$AGY")"
check deny  "write OUTSIDE repo: ~/.ssh"        "$(W "$HOME/.ssh/authorized_keys" "$AGY")"
check deny  "write OUTSIDE repo: STUDIO lane"   "$(W "$STUDIO/x.md" "$AGY")"
check deny  "write OUTSIDE repo: ~/dg-wt"       "$(W "$HOME/dg-wt/DG-021/x.md" "$AGY")"

echo
echo "-- THE STUDIO WALL: a \$HOME-rooted workspace must never be authorized --"
check deny  "workspace=[\$HOME] write to STUDIO"   "$(W "$STUDIO/x.md" "[\"$HOME\"]")"
check deny  "workspace=[\$HOME,sub] write STUDIO"  "$(W "$STUDIO/x.md" "[\"$HOME\",\"$HOME/dynasty-genius-product\"]")"
check deny  "workspace=[\$HOME] write ~/.ssh"      "$(W "$HOME/.ssh/authorized_keys" "[\"$HOME\"]")"
check deny  "workspace=[/] write anywhere"         "$(W "$T/app/main.py" '["/"]')"

echo
echo "-- ambiguous / empty workspaces must fail closed --"
check deny  "disjoint roots (repo + studio)"    "$(W "$T/app/main.py" "[\"$T\",\"$STUDIO\"]")"
check deny  "disjoint roots (repo + /tmp)"      "$(W "$T/app/main.py" "[\"$T\",\"/tmp\"]")"
check deny  "empty workspacePaths"              "$(W "$L/x.md" '[]')"
check deny  "no workspacePaths key"             '{"toolCall":{"name":"write_to_file","args":{"TargetFile":"/tmp/x"}}}'

echo
echo "-- explicit DG_AUTONOMY_WORKTREE still wins, and may be narrower --"
check allow "env=ledger, write ledger"          "$(W "$L/2026-08-19.md" "$AGY")" "DG_AUTONOMY_WORKTREE=$L"
check deny  "env=ledger, write product code"    "$(W "$T/app/main.py" "$AGY")"   "DG_AUTONOMY_WORKTREE=$L"
check deny  "env=ledger, write STUDIO"          "$(W "$STUDIO/x.md" "$AGY")"     "DG_AUTONOMY_WORKTREE=$L"

echo
echo "-- destination-key handling (agy PascalCase AND legacy snake_case) --"
check allow "legacy file_path in scope"  "{\"toolCall\":{\"name\":\"write_to_file\",\"args\":{\"file_path\":\"$L/x.md\"}},\"workspacePaths\":$AGY}"
check deny  "legacy file_path to STUDIO" "{\"toolCall\":{\"name\":\"write_to_file\",\"args\":{\"file_path\":\"$STUDIO/x.md\"}},\"workspacePaths\":$AGY}"
check deny  "write with NO target key"   "{\"toolCall\":{\"name\":\"write_to_file\",\"args\":{\"CodeContent\":\"x\"}},\"workspacePaths\":$AGY}"

echo
echo "-- other gates unchanged --"
check deny  "remote browser URL"   "{\"toolCall\":{\"name\":\"browser_navigate\",\"args\":{\"url\":\"https://evil.example.com\"}},\"workspacePaths\":$AGY}"
check allow "localhost browser"    "{\"toolCall\":{\"name\":\"browser_navigate\",\"args\":{\"url\":\"http://localhost:8000/\"}},\"workspacePaths\":$AGY}"
check deny  "tool not allowlisted" "{\"toolCall\":{\"name\":\"rm_rf_everything\",\"args\":{}},\"workspacePaths\":$AGY}"
check allow "read-only view_file"  "{\"toolCall\":{\"name\":\"view_file\",\"args\":{\"TargetFile\":\"anything\"}},\"workspacePaths\":$AGY}"

echo
if [ "$fail" -eq 0 ]; then
  echo "ALL PASS ($pass cases). Safe to install."
  exit 0
fi
echo "$fail FAILED, $pass passed. DO NOT INSTALL."
exit 1
