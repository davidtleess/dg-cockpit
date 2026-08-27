#!/bin/bash
# agy-scoped.sh — launch agy with exactly one authorized workspace.
#
# WHY THIS EXISTS
#   agy emits an EMPTY workspacePaths unless a folder is formally opened, so the
#   dg-autonomy PreToolUse policy fails closed with
#     {"decision":"deny","reason":"Dynasty autonomy requires one explicit authorized workspace"}
#   and every write is refused. DG_AUTONOMY_WORKTREE is the policy's own supported
#   override (read BEFORE workspacePaths in dg-antigravity-tool-policy.mjs).
#
#   It MUST be an absolute path: the policy calls Node path.resolve(), which does
#   NOT expand "~". A literal tilde silently produces a bogus root and denies
#   everything. Tower shipped that exact bug on 2026-08-19; this script refuses it.
#
# USAGE
#   agy-scoped.sh /Users/davidleess/dynasty-genius-product/docs/agent-ledger   # ledger only
#   agy-scoped.sh /Users/davidleess/dg-wt/DG-021                              # one ticket
#
# Run it at a SHELL prompt. Quit agy first — pasting this into a running agy
# session makes it spawn a nested agy instead of relaunching.

set -u
root="${1:-}"

die(){ printf 'agy-scoped: %s\n' "$1" >&2; exit 1; }

[ -n "$root" ] && die_if_empty=0 || die "no workspace given.
  usage: $(basename "$0") /absolute/path/to/workspace
  ledger:  /Users/davidleess/dynasty-genius-product/docs/agent-ledger
  ticket:  /Users/davidleess/dg-wt/DG-0NN"

case "$root" in
  '~'*) die "path starts with '~'. The policy uses path.resolve(), which does NOT expand it — every write would deny. Use the absolute path." ;;
  /*)   : ;;
  *)    die "path must be absolute (got '$root')." ;;
esac

[ -d "$root" ] || die "not a directory: $root"
root="$(cd "$root" && pwd -P)"          # canonicalise; kills symlink/.. surprises

command -v agy >/dev/null 2>&1 || die "agy not found on PATH"

printf 'agy-scoped: authorized workspace = %s\n' "$root"
printf 'agy-scoped: writes outside it will be denied by the autonomy boundary.\n\n'
cd "$root" || die "cannot cd to $root"
export DG_AUTONOMY_WORKTREE="$root"
exec agy "${@:2}"
