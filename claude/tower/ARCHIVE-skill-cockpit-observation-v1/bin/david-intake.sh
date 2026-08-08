#!/usr/bin/env bash
# david-intake.sh — capture what DAVID SAID, before Tower composes a reply.
#
# WHY THIS EXISTS. 2026-07-30. David named six data sources to Tower on 2026-07-25 — five of
# them paid subscriptions. Tower read the message, answered it, and the list evaporated. It was
# never relayed, never ledgered, never inventoried. The crew spent five days building "the
# foundation" without ever being told what the foundation was supposed to contain. David found
# it himself, five days later, and his verdict was exact:
#
#     "with your hours and hours of tooling work - you did't keep track of the fuel that runs
#      this ship"  ...  "let alone filling the tank with the fuel!!"
#
# He was right, and the reason is structural rather than careless. Tower owns twelve scripts.
# Every one of them watches AGENTS: pane state, dialogs, delivery verdicts, ghost text, watcher
# liveness, backup coverage, commit reachability. NOT ONE of them looks at what DAVID said.
# The one channel that actually decides what this cockpit builds had no instrument on it at all.
#
# This is that instrument. It does one thing and it does it whether Tower remembers or not:
# every message David sends is appended VERBATIM to a durable log before Tower replies, and if
# it names something — a source, a repo, a URL, a subscription, a directive to compile or
# inventory — the turn brief says so loudly enough that ignoring it is a choice.
#
# It does NOT decide, route, summarise or judge. Capture is never gated on evaluation; that
# coupling is exactly what lost the list. Tower still owes the routing and the loop-close.
#
# Self-gates to Tower's pane. Never fails a turn: every path exits 0.

set -uo pipefail

LOG="${TOWER_INTAKE_LOG:-/Users/davidleess/.claude/tower/DAVID-INTAKE-LOG.md}"
INTAKE="${TOWER_SOURCE_INTAKE:-/Users/davidleess/.claude/tower/DATA-SOURCE-INTAKE.md}"

# --- gate: Tower's pane only, same rule as turn-brief -------------------------------------
if [ -n "${TMUX:-}" ]; then
  title="$(tmux display-message -p '#{pane_title}' 2>/dev/null)" || exit 0
  case "$title" in *tower*|*Tower*|*🗼*) ;; *) exit 0 ;; esac
fi

payload="$(cat 2>/dev/null || true)"
[ -n "$payload" ] || exit 0

prompt="$(printf '%s' "$payload" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
p = d.get("prompt") or d.get("user_prompt") or ""
if isinstance(p, str):
    sys.stdout.write(p)
' 2>/dev/null || true)"

[ -n "$prompt" ] || exit 0

stamp="$(date '+%Y-%m-%d %H:%M:%S %Z')"
mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
if [ ! -s "$LOG" ]; then
  {
    printf '# DAVID INTAKE LOG — every message he sends Tower, verbatim, captured before Tower replies\n\n'
    printf 'Created 2026-07-31 after his 07-25 data-source list died inside a Tower session.\n'
    printf 'Append-only. Tower does not edit or summarise entries here. Capture is not gated on\n'
    printf 'evaluation — that coupling is what lost the list.\n\n'
  } >> "$LOG"
fi
{
  printf -- '---\n## %s\n\n' "$stamp"
  printf '%s\n\n' "$prompt"
} >> "$LOG" 2>/dev/null || true

# --- does this message NAME something that must not evaporate? ---------------------------
hits="$(printf '%s' "$prompt" | grep -oiE 'https?://[^ ]+|\bpff\b|player ?profiler|fantasy ?pros|football ?guys|fantasy ?calc|college ?football ?data|\bcfbd\b|nflverse|nflreadpy|next ?gen ?stats|dynasty ?process|keep ?trade ?cut|\bktc\b|next gen|rotowire|sportradar|\bmfl\b|dynasty nerds|rotoviz|campus2canton|subscription|i pay|premium data|data source|inventory|compile|repos?\b' 2>/dev/null | sort -fu | tr '\n' ' ')"

if [ -n "$hits" ]; then
  printf '=== ⚠ DAVID NAMED SOMETHING — CAPTURE BEFORE YOU REPLY ===\n'
  printf '  triggered on: %s\n' "$hits"
  printf '  His words are already appended verbatim to:\n    %s\n' "$LOG"
  printf '  YOU still owe the three things capture does not do:\n'
  printf '    1. a ROW in %s\n' "$INTAKE"
  printf '    2. ROUTING — does the crew need this, and did it actually land?\n'
  printf '    3. the LOOP CLOSE — decided, or parked with DAVID owning it.\n'
  printf '  On 2026-07-25 all three were skipped and nobody noticed for five days.\n'
fi

exit 0
