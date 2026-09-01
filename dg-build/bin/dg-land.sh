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
# NOT "$REPO/.git/..." — $REPO is itself a LINKED WORKTREE, so its .git is a
# one-line FILE ("gitdir: .../worktrees/dynasty-genius-product"), not a
# directory. Opening a lock under it fails with "Not a directory" and this
# script dies at the exec below before it does anything at all. Ask git where
# the real git dir is; --git-common-dir also keeps every worktree contending for
# the SAME lock, which is the point of serialising landings.
LOCK_ROOT="$(git -C "$REPO" rev-parse --git-common-dir)"
LOCK="$LOCK_ROOT/dg-land.lock"

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

# --- cleanup on every exit ----------------------------------------------------
# One trap owns both the lock and the temp merge worktree. DG-038's second
# finding: a failed merge left .land-<TICKET> behind and the NEXT run's rm -rf
# silently destroyed the evidence, so a failed land read as an unstarted ticket.
# Cleaning up on the failing run itself is what closes that.
# LOCKDIR stays empty until THIS run owns the lock — the trap must never remove
# another lander's lock on the refused-entry exit.
LOCKDIR=""
TMP_WT=""
cleanup() {
  if [[ -n "$TMP_WT" ]]; then
    git -C "$REPO" worktree remove --force "$TMP_WT" 2>/dev/null || rm -rf "$TMP_WT"
    git -C "$REPO" worktree prune 2>/dev/null || true
  fi
  [[ -n "$LOCKDIR" ]] && rmdir "$LOCKDIR" 2>/dev/null || true
}
trap cleanup EXIT

# --- one lander at a time -----------------------------------------------------
exec 9>"$LOCK"
if ! flock -n 9 2>/dev/null; then
  # macOS has no flock(1) by default; fall back to an atomic mkdir lock
  if ! mkdir "$LOCK_ROOT/dg-land.lockdir" 2>/dev/null; then
    echo "error: another land is in progress ($LOCK_ROOT/dg-land.lockdir exists)." >&2
    echo "       Wait for it, or remove that directory if it is stale." >&2
    exit 1
  fi
  LOCKDIR="$LOCK_ROOT/dg-land.lockdir"
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

# --- the frontend gate (DG-102) -----------------------------------------------
# pytest cannot see UI breakage. The frontend suite sat red on main 08-28→08-29
# and was only caught inside an unrelated land. Fifteen frontend tickets landed
# through this gate over the 08-30 weekend without it running once.
#
# ALWAYS-ON, not diff-conditional: a backend-only change can break the frontend
# through OpenAPI drift, which is precisely the case a "did the diff touch
# frontend/?" test would wave through. Measured cost on main: 5.6s for
# typecheck + lint + vitest + banned-language + build.
#
# SCOPE, stated so nobody trusts it further than it earns: this runs `npm run
# gate` — typecheck, biome lint, vitest, the banned-language scan and a vite
# build. It does NOT run Playwright, so it is not visual or a11y coverage; the
# visual-smoke evidence bundles additionally run under prefers-reduced-motion,
# so the default-motion path readers actually see has no axe coverage at all.
if [[ -f frontend/package.json ]]; then
  echo "→ running frontend gate (typecheck · lint · vitest · banned-language · build)"
  # npm here is nvm-managed and is NOT on a minimal PATH — `command -v npm`
  # returns nothing under launchd or a bare `env -i` shell. Same class as the
  # backup.sh nvm-PATH abort of 08-27 and the gcloud CLOUDSDK_PYTHON miss fixed
  # on 08-31. Resolve to an absolute path, and REFUSE rather than skip if it is
  # absent: a gate that silently does not run is worse than no gate, because it
  # reports success. (That is exactly how the model-resolution gap survived.)
  NPM_BIN=""
  if command -v npm >/dev/null 2>&1; then
    NPM_BIN="$(command -v npm)"
  else
    for _c in $(ls -d "$HOME"/.nvm/versions/node/*/bin/npm 2>/dev/null | sort -V) \
              /opt/homebrew/bin/npm /usr/local/bin/npm; do
      [[ -x "$_c" ]] && NPM_BIN="$_c"
    done
  fi
  if [[ -z "$NPM_BIN" ]]; then
    echo >&2
    echo "error: frontend/package.json exists but npm could not be resolved." >&2
    echo "       Not merging — refusing to report a gate that never executed." >&2
    echo "       Looked on PATH, then ~/.nvm/versions/node/*/bin/npm, then Homebrew." >&2
    exit 1
  fi
  # node lives beside npm; npm scripts spawn it by name, so put that bin dir on
  # PATH for the subshell rather than relying on the caller's environment.
  if ! ( cd frontend && PATH="$(dirname "$NPM_BIN"):$PATH" "$NPM_BIN" run gate ); then
    echo >&2
    echo "error: frontend gate failed after rebase. Not merging." >&2
    echo "       Same rule as the pytest gate — the failure may be someone else's" >&2
    echo "       change meeting yours for the first time." >&2
    exit 1
  fi
else
  echo "→ no frontend/package.json — frontend gate not applicable"
fi

# --- merge --------------------------------------------------------------------
# The merge is built on a DETACHED head in a throwaway worktree and pushed as
# HEAD:$BASE, so the base branch is never checked out here — it may be checked
# out anywhere else, which is the trunk's normal state (DG-038; git refuses to
# check one branch out in two worktrees, and that refusal killed every land
# whose base the trunk held).
# A dry run exercises this whole block too; only the push is --dry-run, so a
# green dry run finally means "this ticket can actually land", not just "the
# suite passed" (DG-038's cheap-fix note).
if [[ "$DRY" == "1" ]]; then
  echo "→ dry run: building the merge (push will be --dry-run)"
  PUSH_ARGS=(--dry-run)
else
  echo "→ merging into $BASE"
  PUSH_ARGS=()
fi
git -C "$REPO" fetch --quiet origin "$BASE"

TMP_WT="$WT_ROOT/.land-$TICKET"
if [[ -e "$TMP_WT" ]]; then
  echo "note: removing leftover temp worktree from an interrupted land: $TMP_WT"
  git -C "$REPO" worktree remove --force "$TMP_WT" 2>/dev/null || rm -rf "$TMP_WT"
fi
git -C "$REPO" worktree prune
git -C "$REPO" worktree add --quiet --detach "$TMP_WT" "origin/$BASE"
# ${PUSH_ARGS[@]+...}: bash 3.2 + set -u errors on expanding an empty array,
# and the ":-" guard would inject an empty argument git rejects.
if ! (
  cd "$TMP_WT" &&
  git merge --no-ff -m "$TICKET: $(git log -1 --format=%s "$BRANCH")" "$BRANCH" &&
  git push ${PUSH_ARGS[@]+"${PUSH_ARGS[@]}"} origin "HEAD:$BASE"
); then
  echo >&2
  echo "error: merge/push into $BASE failed. Nothing landed." >&2
  echo "       The ticket worktree, branch and claim are untouched; re-run after fixing." >&2
  exit 1
fi
git -C "$REPO" worktree remove --force "$TMP_WT"
TMP_WT=""

if [[ "$DRY" == "1" ]]; then
  echo "✔ dry run: rebase clean, tests pass, merge builds and push is accepted. Nothing pushed."
  exit 0
fi

# --- the local base branch is now behind the pushed merge ---------------------
# `fetch origin BASE:BASE` is a fast-forward-only ref update; git refuses it
# while $BASE is checked out in any worktree — and updating a shared worktree
# that carries other lanes' dirty files is not this script's call to make
# (DG-038), so in that case say where it is and leave it alone.
if git -C "$REPO" fetch --quiet origin "$BASE:$BASE" 2>/dev/null; then
  echo "→ local branch $BASE fast-forwarded to origin/$BASE"
else
  BASE_WT="$(git -C "$REPO" worktree list --porcelain | awk -v ref="branch refs/heads/$BASE" \
    '/^worktree /{wt=substr($0,10)} $0==ref{print wt; exit}')"
  echo "note: the local branch '$BASE'${BASE_WT:+ (checked out at $BASE_WT)} is now behind origin/$BASE."
  echo "      Update it from its own worktree with 'git pull --ff-only' when that tree is quiet."
fi

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
