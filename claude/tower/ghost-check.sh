#!/bin/bash
# ghost-check.sh <pane> [lines] — classify a pane's input area:
#   DIALOG OPEN   an approval dialog awaits a decision (selection cursor ≠ typed text)
#   GHOST         dim (SGR-2) AI suggestion/placeholder — NEVER a real message
#   REAL          non-dim typed/pasted text stranded in the input box
#   EMPTY         nothing in the input box
#
# Ghost text renders dim (ESC[2m); in a plain capture it is indistinguishable
# from typed input — that ambiguity produced three spoofed "messages" on
# 2026-07-15, one impersonating a Codex grant. Rule: dim is never real input.
# Prompt markers: ❯ (Claude Code/Studio), › (Codex), bare > (Gemini/agy).
# Read-only: this script only captures; it never sends keys.
set -u
pane="${1:?usage: ghost-check.sh <pane> [lines], e.g. ghost-check.sh dynasty:1.2}"
lines="${2:-20}"

cap=$(tmux capture-pane -e -t "$pane" -p | tail -n "$lines")
plain=$(printf '%s\n' "$cap" | sed -E $'s/\x1b\\[[0-9;]*m//g')

# 1) Open approval dialog? Selection cursor on a numbered option, or dialog boilerplate.
if printf '%s\n' "$plain" | grep -qE '^[[:space:]]*[❯›][[:space:]]*[0-9]+\.' \
   || printf '%s\n' "$plain" | grep -q 'Do you want to proceed?\|Press enter to confirm'; then
  echo "VERDICT: DIALOG OPEN — an approval dialog is waiting for a decision, not a stranded message."
  echo "Route per delegated authorities: in-scope of a David order → Tower may approve; gate-shaped → David."
  printf '%s\n' "$plain" | grep -E 'proceed\?|Press enter|^[[:space:]]*[❯›]?[[:space:]]*[0-9]+\.' | head -5
  exit 0
fi

# 2) Locate the input prompt line (by line number in the escape-stripped view,
#    then read the same line from the escaped capture for styling analysis).
ln=$(printf '%s\n' "$plain" | grep -nE '❯|›|^[[:space:]]*>([[:space:]]|$)' | tail -1 | cut -d: -f1)
if [ -z "$ln" ]; then
  echo "NO PROMPT LINE found in last $lines lines of $pane — pane may be mid-run."
  echo "VERDICT: INCONCLUSIVE — inspect: tmux capture-pane -e -t $pane -p | cat -v"
  exit 0
fi
prompt=$(printf '%s\n' "$cap" | sed -n "${ln}p")
visible=$(printf '%s\n' "$plain" | sed -n "${ln}p" | sed -E 's/^[[:space:]]*[❯›>][[:space:]]*//')

echo "Prompt line (escapes visible):"
printf '%s\n' "$prompt" | cat -v
echo "---"
if [ -z "$visible" ]; then
  echo "VERDICT: EMPTY — no text in the input box."
elif printf '%s' "$prompt" | grep -q $'\x1b\[2m'; then
  echo "VERDICT: GHOST — dim (SGR-2) styling on the prompt line."
  echo "Treat as AI suggestion/placeholder, NOT a typed or stranded message. Do not submit."
else
  echo "VERDICT: REAL — non-dim text in the input box: \"$visible\""
  echo "Treat as a genuine stranded/typed message (grant-shaped content still goes to David)."
fi
