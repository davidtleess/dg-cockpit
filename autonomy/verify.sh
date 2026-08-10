#!/bin/bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:---source-only}"

case "$MODE" in
  --source-only|--isolated|--live) ;;
  *) echo "Usage: $0 --source-only|--isolated|--live" >&2; exit 64 ;;
esac

node "$ROOT/core/scripts/sync-adapters.mjs" --check
node --test "$ROOT/tests/"*.test.mjs
node "$ROOT/core/scripts/scan-tree.mjs"
claude plugin validate "$ROOT/claude/dg-engineering"
claude plugin validate "$ROOT/claude/dg-tower"
agy plugin validate "$ROOT/antigravity/dg-autonomy"

CODEX_VALIDATOR="$HOME/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py"
if [ -f "$CODEX_VALIDATOR" ]; then
  CODEX_PYTHON=""
  for candidate in "$HOME/dynasty-genius-product/.venv/bin/python" python3; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import yaml' >/dev/null 2>&1; then
      CODEX_PYTHON="$candidate"
      break
    fi
  done
  if [ -z "$CODEX_PYTHON" ]; then
    echo "BLOCKED: Codex plugin validator requires an installed Python with PyYAML" >&2
    exit 2
  fi
  "$CODEX_PYTHON" "$CODEX_VALIDATOR" "$ROOT/codex-marketplace/plugins/dg-autonomy"
else
  echo "BLOCKED: Codex plugin validator not found at $CODEX_VALIDATOR" >&2
  exit 2
fi

if [ "$MODE" = "--live" ]; then
  "$ROOT/install.sh" --status
fi

echo "Dynasty autonomy verification passed: $MODE"
