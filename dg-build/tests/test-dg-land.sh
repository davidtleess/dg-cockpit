#!/usr/bin/env bash
# test-dg-land.sh — regression tests for dg-land.sh, hermetic in a temp sandbox.
#
# Born from DG-038: the merge block checked the base branch out in a second
# worktree, which git refuses whenever the base is checked out anywhere — the
# normal state of the trunk. Every scenario here builds the production layout
# (bare origin → clone → LINKED-WORKTREE trunk with the base checked out →
# ticket worktree) so that exact condition is always present.
#
#   tests/test-dg-land.sh            # runs all scenarios, exits nonzero on failure

set -uo pipefail

DG_LAND="$(cd "$(dirname "$0")/.." && pwd)/bin/dg-land.sh"
[[ -x "$DG_LAND" ]] || { echo "FATAL: $DG_LAND not found or not executable" >&2; exit 2; }

FAILURES=0
check() { # check <description> <command...>
  local desc="$1"; shift
  if "$@" >/dev/null 2>&1; then
    echo "  ok   : $desc"
  else
    echo "  FAIL : $desc" >&2
    FAILURES=$((FAILURES + 1))
  fi
}

# --- sandbox: the production layout in miniature ------------------------------
# $SB/origin.git      bare remote
# $SB/clone           main clone, checked out on 'other' (like ~/dynasty-genius)
# $SB/trunk           linked worktree with BASE checked out (like the product trunk)
# $SB/wt/DG-999       ticket worktree on ticket/DG-999, one commit ahead, clean
# $SB/build/tickets   a claimed ticket file for the State-flip bookkeeping
# The ticket worktree carries a fake .venv/bin/python3.14 (exit 0) so the pytest
# gate passes without a real suite; .gitignore covers .venv so the tree is clean.
make_sandbox() {
  SB="$(mktemp -d "${TMPDIR:-/tmp}/dg-land-test.XXXXXX")"
  git init --quiet --bare -b other "$SB/origin.git"
  git init --quiet -b other "$SB/clone"
  git -C "$SB/clone" config user.name "dg-land-test"
  git -C "$SB/clone" config user.email "dg-land-test@localhost"
  printf '.venv/\n' > "$SB/clone/.gitignore"
  printf 'trunk file\n' > "$SB/clone/README.txt"
  git -C "$SB/clone" add .gitignore README.txt
  git -C "$SB/clone" commit --quiet -m "base commit"
  git -C "$SB/clone" branch base
  git -C "$SB/clone" remote add origin "$SB/origin.git"
  git -C "$SB/clone" push --quiet origin other base

  git -C "$SB/clone" worktree add --quiet "$SB/trunk" base

  mkdir -p "$SB/wt"
  git -C "$SB/trunk" worktree add --quiet -b ticket/DG-999 "$SB/wt/DG-999" base
  printf 'the change\n' > "$SB/wt/DG-999/feature.txt"
  git -C "$SB/wt/DG-999" add feature.txt
  git -C "$SB/wt/DG-999" commit --quiet -m "DG-999 adds a feature"

  mkdir -p "$SB/wt/DG-999/.venv/bin"
  printf '#!/bin/sh\nexit 0\n' > "$SB/wt/DG-999/.venv/bin/python3.14"
  chmod +x "$SB/wt/DG-999/.venv/bin/python3.14"

  mkdir -p "$SB/build/tickets"
  cat > "$SB/build/tickets/DG-999-test-ticket.md" <<'EOF'
# DG-999 — test ticket

**Layer:** test  ·  **State:** todo  ·  **Lane:** test-lane  ·  **DG 3.0**
EOF
}

run_land() { # run_land <sandbox> [extra args...] — captures output + exit code
  local sb="$1"; shift
  set +e
  OUT="$(DG_REPO="$sb/trunk" DG_BUILD="$sb/build" DG_WT_ROOT="$sb/wt" \
        "$DG_LAND" DG-999 --from base "$@" 2>&1)"
  RC=$?
  set -e
}

# --- scenario 1: a real land, with the base checked out in the trunk ----------
echo "scenario 1: land into a base that the trunk has checked out"
make_sandbox; SB1="$SB"
run_land "$SB1"
check "exits 0"                                  test "$RC" -eq 0
check "origin/base got the merge commit"         sh -c "git -C '$SB1/origin.git' log -1 --format=%s base | grep -q '^DG-999: '"
check "origin/base contains the ticket's change" git -C "$SB1/origin.git" cat-file -e base:feature.txt
check "temp worktree removed"                    test ! -e "$SB1/wt/.land-DG-999"
check "ticket worktree removed"                  test ! -e "$SB1/wt/DG-999"
check "ticket branch deleted"                    sh -c "! git -C '$SB1/trunk' show-ref --verify --quiet refs/heads/ticket/DG-999"
check "ticket State flipped to done"             grep -q '\*\*State:\*\* done' "$SB1/build/tickets/DG-999-test-ticket.md"
check "says the trunk's local base is behind"    sh -c "printf '%s' \"$OUT\" | grep -qi 'behind'"

# --- scenario 2: dry run proves the merge, pushes nothing ---------------------
echo "scenario 2: --dry-run exercises the merge path without pushing"
make_sandbox; SB2="$SB"
run_land "$SB2" --dry-run
check "exits 0"                                  test "$RC" -eq 0
check "output proves the merge was exercised"    sh -c "printf '%s' \"$OUT\" | grep -q 'merge builds and push is accepted'"
check "origin/base did NOT advance"              sh -c "git -C '$SB2/origin.git' log -1 --format=%s base | grep -qx 'base commit'"
check "temp worktree removed"                    test ! -e "$SB2/wt/.land-DG-999"
check "ticket worktree still present"            test -d "$SB2/wt/DG-999"
check "ticket branch still present"              git -C "$SB2/trunk" show-ref --verify --quiet refs/heads/ticket/DG-999
check "ticket State still todo"                  grep -q '\*\*State:\*\* todo' "$SB2/build/tickets/DG-999-test-ticket.md"

# --- scenario 3: a rejected push leaves no debris and no half-done bookkeeping -
echo "scenario 3: push rejected by the remote (pre-receive exit 1)"
make_sandbox; SB3="$SB"
mkdir -p "$SB3/origin.git/hooks"
printf '#!/bin/sh\necho "rejected by test hook" >&2\nexit 1\n' > "$SB3/origin.git/hooks/pre-receive"
chmod +x "$SB3/origin.git/hooks/pre-receive"
run_land "$SB3"
check "exits nonzero"                            test "$RC" -ne 0
check "origin/base did NOT advance"              sh -c "git -C '$SB3/origin.git' log -1 --format=%s base | grep -qx 'base commit'"
check "temp worktree removed on failure"         test ! -e "$SB3/wt/.land-DG-999"
check "ticket worktree survives the failure"     test -d "$SB3/wt/DG-999"
check "ticket branch survives the failure"       git -C "$SB3/trunk" show-ref --verify --quiet refs/heads/ticket/DG-999
check "ticket State still todo"                  grep -q '\*\*State:\*\* todo' "$SB3/build/tickets/DG-999-test-ticket.md"

# --- verdict ------------------------------------------------------------------
rm -rf "$SB1" "$SB2" "$SB3"
echo
if [[ "$FAILURES" -gt 0 ]]; then
  echo "✗ $FAILURES check(s) failed"
  exit 1
fi
echo "✔ all scenarios pass"
