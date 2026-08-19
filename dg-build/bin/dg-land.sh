#!/usr/bin/env bash
# dg-land.sh — land one ticket branch, one at a time, with a real gate.
#
#   dg-land.sh DG-014            # rebase on trunk, test, merge, push, clean up
#   dg-land.sh DG-014 --dry-run  # do everything except merge/push
#
# Serialisation is a lock file, not a convention: two agents cannot merge at once.

set -euo pipefail

REPO="${DG_REPO:-$HOME/dynasty-genius-product}"
BUILD="${DG_BUILD:-$HOME/dg-build}"
WT_ROOT="${DG_WT_ROOT:-$HOME/dg-wt}"
BASE="main"
DRY=0
LOCK="$REPO/.git/dg-land.lock"

[[ $# -ge 1 ]] || { echo "usage: dg-land.sh DG-NNN [--from main] [--dry-run]" >&2; exit 1; }
TICKET="$1"; shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --from) BASE="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) echo "error: unknown argument '$1'" >&2; exit 1 ;;
  esac
done

BRANCH="ticket/$TICKET"
DEST="$WT_ROOT/$TICKET"
[[ -d "$DEST" ]] || { echo "error: no worktree at $DEST" >&2; exit 1; }

# --- one lander at a time -----------------------------------------------------
exec 9>"$LOCK"
if ! flock -n 9 2>/dev/null; then
  # macOS has no flock(1) by default; fall back to an atomic mkdir lock
  LOCKDIR="$REPO/.git/dg-land.lockdir"
  if ! mkdir "$LOCKDIR" 2>/dev/null; then
    echo "error: another land is in progress ($LOCKDIR exists)." >&2
    echo "       Wait for it, or remove that directory if it is stale." >&2
    exit 1
  fi
  trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT
fi

cd "$DEST"

# --- refuse on a dirty tree ---------------------------------------------------
if [[ -n "$(git status --porcelain)" ]]; then
  echo "error: uncommitted changes in $DEST. Commit or discard them first:" >&2
  git status --short >&2
  exit 1
fi

echo "→ fetching origin/$BASE"
git fetch --quiet origin "$BASE"

echo "→ rebasing $BRANCH onto origin/$BASE"
if ! git rebase "origin/$BASE"; then
  echo >&2
  echo "error: rebase hit conflicts. Resolve them here, then re-run dg-land.sh." >&2
  echo "       To abandon:  git rebase --abort" >&2
  exit 1
fi

# --- the gate -----------------------------------------------------------------
echo "→ running tests"
if [[ -x .venv/bin/python3.14 ]]; then PY=.venv/bin/python3.14; else PY=python3; fi
if ! "$PY" -m pytest -q; then
  echo >&2
  echo "error: tests failed after rebase. Not merging." >&2
  echo "       This is the point of the gate — the failure may be someone else's change" >&2
  echo "       meeting yours for the first time." >&2
  exit 1
fi

if [[ "$DRY" == "1" ]]; then
  echo "✔ dry run: rebase clean, tests pass. Nothing merged."
  exit 0
fi

# --- merge --------------------------------------------------------------------
echo "→ merging into $BASE"
git -C "$REPO" fetch --quiet origin "$BASE"
git -C "$REPO" worktree list >/dev/null

TMP_WT="$WT_ROOT/.land-$TICKET"
rm -rf "$TMP_WT"
git -C "$REPO" worktree add --quiet --detach "$TMP_WT" "origin/$BASE"
(
  cd "$TMP_WT"
  git checkout -q -B "$BASE" "origin/$BASE"
  git merge --no-ff -m "$TICKET: $(git log -1 --format=%s "$BRANCH")" "$BRANCH"
  git push origin "$BASE"
)
git -C "$REPO" worktree remove --force "$TMP_WT"

# --- clean up -----------------------------------------------------------------
git -C "$REPO" worktree remove --force "$DEST"
git -C "$REPO" branch -d "$BRANCH" 2>/dev/null || git -C "$REPO" branch -D "$BRANCH"

# --- release the ticket -------------------------------------------------------
TICKET_FILE="$(ls "$BUILD"/tickets/"$TICKET"-*.md 2>/dev/null | head -1 || true)"
if [[ -n "$TICKET_FILE" ]]; then
  python3 - "$TICKET_FILE" <<'PY'
import re,sys
p=sys.argv[1]; s=open(p).read()
s=re.sub(r'(\*\*State:\*\* )todo', r'\1done', s, count=1)
open(p,'w').write(s)
PY
fi

echo
echo "✔ $TICKET landed on $BASE and pushed. Worktree and branch removed."
echo "  Update BOARD.md and paste your acceptance output into the ticket."
