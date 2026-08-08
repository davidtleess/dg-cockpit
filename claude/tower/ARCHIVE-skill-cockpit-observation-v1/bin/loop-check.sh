#!/usr/bin/env bash
# loop-check.sh — has anything DAVID said gone unanswered, unrouted, or unrecorded?
#
# WHY THIS EXISTS. 2026-07-30. Capture alone would not have saved the 07-25 data-source list.
# Tower READ that message. The failure came after: it was never turned into a row, never relayed
# to the crew, and never parked as a decision. Five days later David found it himself.
#
# david-intake.sh guarantees his words reach disk. THIS guarantees somebody notices when they
# stop there. It reconciles what he SAID against what the cockpit DID about it:
#
#   his message named something  ->  is there a row in DATA-SOURCE-INTAKE.md?
#                                ->  is there a ruling in DECISIONS.md?
#                                ->  did anything reach the crew ledger?
#
# A message with an entity and none of the three is an OPEN LOOP: Tower heard it and the
# cockpit did nothing. That is the exact shape of the failure, and it is now countable.
#
# Establishes facts only. Changes nothing. Run at boot, before any status to David, and at
# closeout — alongside open-asks.sh, which covers lanes waiting on Tower. This covers DAVID
# waiting on Tower without knowing it.

set -uo pipefail

LOG="${TOWER_INTAKE_LOG:-/Users/davidleess/.claude/tower/DAVID-INTAKE-LOG.md}"
INTAKE="${TOWER_SOURCE_INTAKE:-/Users/davidleess/.claude/tower/DATA-SOURCE-INTAKE.md}"
DECISIONS="${TOWER_DECISIONS:-/Users/davidleess/.claude/tower/DECISIONS.md}"
LEDGER_DIR="${TOWER_LEDGER_DIR:-/Users/davidleess/dynasty-genius-product/docs/agent-ledger}"

printf '=== LOOP CHECK — what David said vs what the cockpit did — %s ===\n' "$(date '+%Y-%m-%d %H:%M %Z')"

if [ ! -s "$LOG" ]; then
  printf 'CANNOT_ESTABLISH: no intake log at %s\n' "$LOG"
  printf '  Tower cannot prove what David said, so it cannot prove anything was dropped.\n'
  printf '  This is the pre-2026-07-31 state and it is why the 07-25 list was lost.\n'
  exit 2
fi

today="$(date '+%Y-%m-%d')"
ledger="$LEDGER_DIR/$today.md"

open=0
checked=0

# Walk each captured message; pull the entities it named.
while IFS='|' read -r stamp body; do
  [ -n "$body" ] || continue
  ents="$(printf '%s' "$body" | grep -oiE 'player ?profiler|fantasy ?pros|football ?guys|fantasy ?calc|college ?football ?data|\bcfbd\b|nflverse|nflreadpy|next ?gen ?stats|dynasty ?process|keep ?trade ?cut|\bktc\b|\bpff\b|rotowire|sportradar|\bmfl\b|rotoviz|campus2canton' 2>/dev/null | tr 'A-Z' 'a-z' | tr -d ' ' | sort -u)"
  [ -n "$ents" ] || continue
  for e in $ents; do
    checked=$((checked+1))
    in_intake=no; in_dec=no; in_ledger=no
    grep -qi "$(printf '%s' "$e" | sed 's/\(.\)/\1 ?/g; s/ ?$//')" "$INTAKE" 2>/dev/null && in_intake=yes
    grep -qi "$e" "$DECISIONS" 2>/dev/null && in_dec=yes
    [ -f "$ledger" ] && grep -qi "$e" "$ledger" 2>/dev/null && in_ledger=yes
    if [ "$in_intake" = no ] && [ "$in_dec" = no ] && [ "$in_ledger" = no ]; then
      open=$((open+1))
      printf '⚠ OPEN LOOP — "%s"\n' "$e"
      printf '    David named it at %s and it appears in NO register, NO ruling, and NO ledger entry.\n' "$stamp"
      printf '    Heard and dropped. Give it a row, route it, or park it with his name on it.\n'
    fi
  done
done < <(python3 - "$LOG" <<'PY'
import sys, re
try:
    text = open(sys.argv[1], encoding='utf-8', errors='replace').read()
except Exception:
    sys.exit(0)
blocks = re.split(r'\n---\n## ', text)
for b in blocks[1:]:
    lines = b.split('\n')
    stamp = lines[0].strip()
    body = ' '.join(lines[1:]).replace('|', ' ').strip()
    if body:
        print(f'{stamp}|{body}')
PY
)

printf -- '--- %d named item(s) checked, %d open loop(s) ---\n' "$checked" "$open"
if [ "$open" -eq 0 ]; then
  printf 'CLEAN: everything David named is registered, ruled on, or in the ledger.\n'
  printf 'NOTE: this proves it was RECORDED, never that the recording is TRUE or that the\n'
  printf 'crew acted on it. Loop-close is still Tower reading the artifact.\n'
  exit 0
fi
printf 'NOT CLEAN: %d thing(s) David said went nowhere. Do not report the board as clear.\n' "$open"
exit 1
