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
  # Written daily by the trunk's 06:30 capture job; shared like nflverse_usage so
  # DG-049's attestation checks read trunk truth (worktrees never run producers).
  "app/data/league_transactions"
  "app/data/pff_exports"
  "app/data/footballguys"
  "app/data/sources"
  "app/data/backtest"
  # 190 MB, gitignored, and NOT optional: three contract tests shell out to a
  # node scanner and die with ERR_MODULE_NOT_FOUND without it (DG-037 §3).
  "frontend/node_modules"
  # The DEPLOYED models. Measured 2026-08-31: without this, a land worktree has
  # only the TRACKED v1 pickles -- v2_manifest.json and every served run dir are
  # gitignored -- so engine_b_service's manifest read fails, logs an error nobody
  # sees, and `_v2_bundles.get(position) or self._v1_bundle` (engine_b_service.py
  # :137) silently scored EVERY position with engine_b_v1 while production served
  # v2/v3. The gate was validating a different model than the one that ships.
  # It also left the 7 QB-1 frozen-boundary contract tests skipping on every
  # land ("F25 frozen product set absent"), which is how DG-028's registry drift
  # went unnoticed for three days.
  # share_path handles the mixed tracked/ignored tree correctly on its own:
  # tracked dirs are made real and recursed, ignored children symlinked -- so
  # this needs no run-id list and survives a retrain.
  # Proven: worktree went 177 passed/7 skipped -> 184 passed, and bundles went
  # NONE -> QB engine_b_v2_qb, RB engine_b_v2_rb, WR engine_b_v2_wr, TE engine_b_v3_te.
  "app/data/models"
)

# Directories that must exist as REAL directories in the worktree even though
# nothing under them is tracked. Contract tests run `git check-ignore` on paths
# inside these, and check-ignore refuses to traverse a symlinked parent
# ("fatal: pathspec ... is beyond a symbolic link"). Their children are still
# shared by symlink, so this costs one inode, not a copy.
MUST_BE_REAL=(
  "app/data/footballguys"
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

# --- tell git what this script is about to create -----------------------------
# These MUST be written before anything is shared: the sharing step below asks
# git whether each path it creates is ignored, and materialises the ones that are
# not. Written afterwards, node_modules would read un-ignored and get expanded
# into a real directory of a thousand packages.
#
# They go in $GIT_COMMON_DIR/info/exclude, because that is the ONLY exclude file
# git ever reads. `rev-parse --git-dir` resolves to .git/worktrees/<TICKET>/
# inside a worktree, and nothing under there is ever consulted — writing there
# looks like it works and does nothing at all. That was the bug this ticket
# found; the block already sitting in the common exclude (added 2026-08-19 by
# hand, after DG-015/022/031 each hit it) is the same discovery made the hard way.
#
# The common dir is shared by every worktree, so each line is written ONCE and
# only if absent. Every ticket produces the identical set, so there is nothing
# worktree-specific to leak between worktrees and nothing to accumulate.
COMMON_EXCLUDE="$(git -C "$DEST" rev-parse --git-common-dir)/info/exclude"
mkdir -p "$(dirname "$COMMON_EXCLUDE")"
touch "$COMMON_EXCLUDE"
add_exclude() {
  local pattern="$1"
  grep -qxF -- "$pattern" "$COMMON_EXCLUDE" && return 0
  [[ -s "$COMMON_EXCLUDE" && -n "$(tail -c1 "$COMMON_EXCLUDE")" ]] && echo >> "$COMMON_EXCLUDE"
  echo "$pattern" >> "$COMMON_EXCLUDE"
  echo "  exclude  : + $pattern (added to the shared info/exclude)"
}
add_exclude ".dg-worktree.json"
# Both .gitignore:192 and frontend/.gitignore:1 say `node_modules/` — a trailing
# slash matches a DIRECTORY, so neither pattern ever matches a symlink.
add_exclude "frontend/node_modules"

# --- share the heavy, read-mostly things --------------------------------------
# A subtree is symlinked WHOLE only when nothing under it is tracked. When a
# shared path contains tracked files, the directory is MATERIALISED — created for
# real — and its children are shared one at a time, so git finds its own
# checked-out files exactly where it expects them.
#
# Why that distinction is the whole fix (all four measured 2026-08-23, DG-037):
# symlinking a directory git cares about breaks four things at once —
#   1. every tracked file under it reads as DELETED (~72 per worktree), and
#   2. the symlink itself reads as UNTRACKED — either one makes dg-land.sh
#      refuse the tree before it runs a single test;
#   3. `git check-ignore` will not look through a symlinked parent, failing 13
#      gitignore contract tests;
#   4. Path.relative_to() against a resolved shared path escapes the worktree,
#      failing 3 more.
# Materialising removes all four CAUSES. The previous approach papered over (1)
# with `update-index --skip-worktree` and tried to paper over (2) with an exclude
# file written to `rev-parse --git-dir` — which in a worktree is
# .git/worktrees/<T>/info/exclude, a path git never reads (it reads
# --git-common-dir). That half silently did nothing, and 2-4 were untouched.
SHARE_OUT="$(mktemp)"
trap 'rm -f "$SHARE_OUT"' EXIT
DG_REPO_ROOT="$REPO" DG_DEST="$DEST" \
DG_SHARE="$(printf '%s\n' "${SHARE_PATHS[@]}")" \
DG_WRITABLE="$(printf '%s\n' "${WRITABLE[@]:-}")" \
DG_REAL="$(printf '%s\n' "${MUST_BE_REAL[@]}")" \
python3 - > "$SHARE_OUT" <<'PY'
import os, shutil, subprocess
from pathlib import Path

repo = Path(os.environ["DG_REPO_ROOT"])
dest = Path(os.environ["DG_DEST"])
def lines(k): return [l.strip() for l in os.environ.get(k, "").splitlines() if l.strip()]
share, writable, must_real = lines("DG_SHARE"), lines("DG_WRITABLE"), lines("DG_REAL")

# One `git ls-files` for the whole repo beats one per path: this walk visits a
# few hundred nodes and a subprocess each would dominate the runtime.
tracked = set(subprocess.run(
    ["git", "-C", str(repo), "ls-files"],
    capture_output=True, text=True, check=True).stdout.splitlines())
tracked_dirs = set()
for f in tracked:
    parts = f.split("/")
    for i in range(1, len(parts)):
        tracked_dirs.add("/".join(parts[:i]))

stats = {"linked": 0, "copied": 0, "real": 0, "kept": 0, "skipped": 0}

def is_ignored(rel: str) -> bool:
    return subprocess.run(
        ["git", "-C", str(dest), "check-ignore", "-q", "--", rel]
    ).returncode == 0

def share_path(rel: str) -> None:
    src, dst = repo / rel, dest / rel
    if not src.exists():
        stats["skipped"] += 1
        return
    if rel in writable:
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.is_symlink() or dst.is_file(): dst.unlink()
        elif dst.is_dir(): shutil.rmtree(dst)
        shutil.copytree(src, dst) if src.is_dir() else shutil.copy2(src, dst)
        stats["copied"] += 1
        print(f"  copied (writable):  {rel}")
        return
    # A tracked file is already checked out by git. Replacing it with a symlink
    # would read as a type change — the very dirt this function exists to avoid.
    if rel in tracked:
        stats["kept"] += 1
        return
    # `must_real` applies to the whole subtree in BOTH directions: an ancestor of
    # a listed path has to be real to reach it, and every directory UNDER one has
    # to be real too, because check-ignore refuses at the first symlinked
    # component — e.g. app/data/footballguys/intake/staging/stage-abc.tmp needs
    # intake/ and intake/staging/ real, not just footballguys/.
    needs_real = rel in tracked_dirs or any(
        m == rel or m.startswith(rel + "/") or rel.startswith(m + "/")
        for m in must_real
    )
    if src.is_dir() and needs_real:
        dst.mkdir(parents=True, exist_ok=True)
        stats["real"] += 1
        for child in sorted(src.iterdir()):
            share_path(f"{rel}/{child.name}")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.is_symlink() or dst.is_file(): dst.unlink()
    elif dst.is_dir(): shutil.rmtree(dst)
    dst.symlink_to(src)
    stats["linked"] += 1
    # Self-correcting, so nobody has to maintain a list of exceptions: a
    # directory ignored as `foo/` (trailing slash — the repo's usual style, e.g.
    # .gitignore:162 `app/data/backtest/qb_validation/`) matches a DIRECTORY and
    # therefore does NOT match the symlink just created. Git would call it
    # untracked and dg-land.sh would refuse the tree. If git does not consider
    # this path ignored, it has to be a real directory. Ask git rather than
    # guess, because the answer depends on pattern syntax we do not own.
    if src.is_dir() and not is_ignored(rel):
        dst.unlink()
        stats["linked"] -= 1
        dst.mkdir(parents=True, exist_ok=True)
        stats["real"] += 1
        for child in sorted(src.iterdir()):
            share_path(f"{rel}/{child.name}")

for rel in share:
    share_path(rel)
print("SUMMARY:{linked} {copied} {real} {kept} {skipped}".format(**stats))
PY
grep -v '^SUMMARY:' "$SHARE_OUT" || true
read -r linked copied realdirs kept skipped <<<"$(sed -n 's/^SUMMARY://p' "$SHARE_OUT")"

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

# --- verify the tree is landable ----------------------------------------------
# Anything still untracked is a defect in the sharing rule, not something to
# hand-exclude. Say so loudly rather than papering over it — a worktree that
# quietly reports success and then fails dg-land.sh is how DG-037 stayed hidden.
LEFTOVER="$(git -C "$DEST" status --porcelain | grep '^??' || true)"
if [[ -n "$LEFTOVER" ]]; then
  echo
  echo "  ⚠ worktree is NOT clean — dg-land.sh will refuse it:"
  echo "$LEFTOVER" | sed 's/^/      /'
  echo "    That is a dg-work.sh bug (DG-037). Report it; do not hand-exclude it."
else
  echo "  landable : clean tree, no phantom deletions, no untracked leftovers"
fi

# --- claim the ticket ---------------------------------------------------------
# Stamp the long-lived agent process, not this script. `$$` is dg-work.sh's own PID and dies at
# exit, so a Lane PID stamped that way could never be checked with `ps -p` (found 2026-09-01: every
# claim on the board was dead by construction). Walk up to the nearest `claude` ancestor; fall back
# to `$$` only when there is none (a human at a terminal).
owner_pid() {
  local p=$$ c i
  for i in 1 2 3 4 5 6; do
    c="$(ps -o comm= -p "$p" 2>/dev/null || true)"
    case "$(basename "${c:-}")" in claude) echo "$p"; return;; esac
    p="$(ps -o ppid= -p "$p" 2>/dev/null | tr -d ' ')"
    [ -n "$p" ] && [ "$p" != 1 ] || break
  done
  echo "$$"
}
SESSION="${DG_SESSION:-$(hostname -s)-$(owner_pid)}"
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
echo "  shared   : $linked symlinked read-only, $realdirs dirs materialised, $kept tracked files left to git, $copied copied writable, $skipped absent"
echo
echo "  cd $DEST"
echo
echo "  Shared paths are SYMLINKS to the real data. Reading is fine. Writing is not."
echo "  Outputs belong in a run-scoped directory inside this worktree."
