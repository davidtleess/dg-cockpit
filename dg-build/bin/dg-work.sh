#!/usr/bin/env bash
# dg-work.sh — create an isolated, fully-usable worktree for one ticket.
#
# Why this exists: `git worktree add` gives you the TRACKED files only. In this repo that is
# useless on its own — app/data is 15 GB and .venv is 2.3 GB, and almost none of it is tracked.
# A bare worktree cannot import nflreadpy, cannot open a store, cannot run a script.
# This links the heavy read-mostly things and keeps every WRITTEN path per-worktree.
#
#   dg-work.sh DG-014
#   dg-work.sh DG-020 --from main --writable app/data/fc_snapshots.db

set -euo pipefail

REPO="${DG_REPO:-$HOME/dynasty-genius-product}"
BUILD="${DG_BUILD:-$HOME/dg-build}"
WT_ROOT="${DG_WT_ROOT:-$HOME/dg-wt}"
BASE="main"
WRITABLE=()

usage() { sed -n '2,12p' "$0"; exit 1; }

[[ $# -ge 1 ]] || usage
TICKET="$1"; shift
[[ "$TICKET" =~ ^DG-[0-9]{3}$ ]] || { echo "error: ticket must look like DG-014, got '$TICKET'" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)     BASE="$2"; shift 2 ;;
    --writable) WRITABLE+=("$2"); shift 2 ;;
    -h|--help)  usage ;;
    *) echo "error: unknown argument '$1'" >&2; exit 1 ;;
  esac
done

# --- the ticket must exist, and must not already be claimed -------------------
TICKET_FILE="$(ls "$BUILD"/tickets/"$TICKET"-*.md 2>/dev/null | head -1 || true)"
[[ -n "$TICKET_FILE" ]] || { echo "error: no ticket file for $TICKET in $BUILD/tickets/" >&2; exit 1; }

CLAIM="$(grep -m1 -o '\*\*Lane:\*\* [^ ·]*' "$TICKET_FILE" | sed 's/.*\*\* //' || true)"
if [[ -n "$CLAIM" && "$CLAIM" != "—" ]]; then
  echo "error: $TICKET is already claimed by '$CLAIM'." >&2
  echo "       Pick another ticket, or clear the Lane field if that claim is stale." >&2
  exit 1
fi

BRANCH="ticket/$TICKET"
DEST="$WT_ROOT/$TICKET"

git -C "$REPO" show-ref --verify --quiet "refs/heads/$BRANCH" && {
  echo "error: branch $BRANCH already exists — that ticket has been started before." >&2; exit 1; }
[[ -e "$DEST" ]] && { echo "error: $DEST already exists." >&2; exit 1; }

# --- create the worktree ------------------------------------------------------
mkdir -p "$WT_ROOT"
git -C "$REPO" fetch --quiet origin "$BASE" || echo "warn: could not fetch origin/$BASE; branching from local $BASE"
git -C "$REPO" worktree add -b "$BRANCH" "$DEST" "$BASE"

# --- link the heavy, read-mostly things --------------------------------------
# Rule: SHARE what is read; NEVER share what is written.
SHARE_PATHS=(
  ".venv"
  "app/cache"
  "app/data/cfbd_cache"
  "app/data/identity"
  "app/data/nflverse_usage"
  "app/data/nflverse_usage.db"
  "app/data/model_forward_capture.db"
  "app/data/market_divergence_history.db"
  "app/data/playerprofiler.db"
  "app/data/fc_forward_capture.db"
  "app/data/fc_snapshots.db"
  "app/data/league_transactions.db"
  "app/data/pff_exports"
  "app/data/footballguys"
  "app/data/sources"
  "app/data/backtest"
)
# Per-worktree, never shared — these are OUTPUTS and sharing them is how runs clobber each other.
PRIVATE_DIRS=(
  "app/data/features_runtime"
  "app/data/valuation_runtime"
  "app/data/ops"
  "app/data/model_capture"
  "app/data/league_runtime"
  "app/data/what_changed"
  "app/data/roster_capacity"
)

is_writable() { local p="$1"; for w in "${WRITABLE[@]:-}"; do [[ "$w" == "$p" ]] && return 0; done; return 1; }

linked=0; copied=0; skipped=0
for p in "${SHARE_PATHS[@]}"; do
  src="$REPO/$p"; dst="$DEST/$p"
  [[ -e "$src" ]] || { skipped=$((skipped+1)); continue; }
  mkdir -p "$(dirname "$dst")"
  rm -rf "$dst"
  if is_writable "$p"; then
    cp -R "$src" "$dst"; copied=$((copied+1))
    echo "  copied (writable):  $p"
  else
    ln -s "$src" "$dst"; linked=$((linked+1))
  fi
done

for d in "${PRIVATE_DIRS[@]}"; do mkdir -p "$DEST/$d"; done

# --- a marker so anything running here knows it is a ticket worktree ----------
cat > "$DEST/.dg-worktree.json" <<EOF
{
  "ticket": "$TICKET",
  "branch": "$BRANCH",
  "base": "$BASE",
  "shared_readonly": $(printf '%s\n' "${SHARE_PATHS[@]}" | python3 -c 'import sys,json;print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))'),
  "writable_copies": $(printf '%s\n' "${WRITABLE[@]:-}" | python3 -c 'import sys,json;print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))'),
  "ticket_file": "$TICKET_FILE"
}
EOF

# --- claim the ticket ---------------------------------------------------------
SESSION="${DG_SESSION:-$(hostname -s)-$$}"
python3 - "$TICKET_FILE" "$SESSION" <<'PY'
import re,sys
path,session=sys.argv[1],sys.argv[2]
s=open(path).read()
s2=re.sub(r'(\*\*Lane:\*\* )—', r'\g<1>'+session, s, count=1)
if s2==s: sys.exit("warn: could not write claim into ticket; do it by hand")
open(path,'w').write(s2)
PY

echo
echo "✔ $TICKET ready"
echo "  worktree : $DEST"
echo "  branch   : $BRANCH  (from $BASE)"
echo "  claimed  : $SESSION"
echo "  shared   : $linked symlinked read-only, $copied copied writable, $skipped absent"
echo
echo "  cd $DEST"
echo
echo "  Shared paths are SYMLINKS to the real data. Reading is fine. Writing is not."
echo "  Outputs belong in a run-scoped directory inside this worktree."
