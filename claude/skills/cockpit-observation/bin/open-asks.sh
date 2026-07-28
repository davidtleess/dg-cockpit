#!/bin/bash
# Find every ask pointed AT Tower or David that has not been answered.
# Why this exists: on 2026-07-27 two lanes sat idle waiting on a word Tower owed. A lane
# waiting for Tower is INDISTINGUISHABLE from a lane resting — BUSY=no, DIALOG=none,
# COMPOSER=empty for both. The stall watcher cannot tell them apart. This can.
# Run: before every status to David, before closeout, and on any lane going quiet.
REPO="$HOME/dynasty-genius-product"
LEDGER="$REPO/docs/agent-ledger/$(date +%F).md"
PANES="${*:-dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1}"
DEPTH=${DEPTH:-120}
found=0

# HIGH — an explicit request for a decision or instruction from Tower/David
HIGH='>>> *david|never got your word|await(ing)? (your|david.?s) word|need(s|ed)? (your|david.?s) word|say the word|one instruction away|your word (is )?(required|needed)|awaiting (your|tower.?s|david.?s) (word|decision|go|call)|blocked on (you|tower|david)|not safe for me to assume|please (reply|advise|rule)|which do you want|do you want me to'
# MED — a lane parked something a recipient is waiting on, or declared itself stopped pending input
MED='parked (durably )?at|deliver(y|ed)? (failed|refused)|no third attempt|standing by|holding (until|for)|held for david|david-gated|not started —|cannot proceed without'

echo "=== OPEN ASKS SWEEP — $(date '+%F %H:%M') ==="
for p in $PANES; do
  txt=$(tmux capture-pane -t "$p" -p -S -"$DEPTH" 2>/dev/null | grep -v '^[[:space:]]*$')
  [ -z "$txt" ] && { printf '%-13s %s\n' "$p" "UNREADABLE — state unknown, do not assume rest"; found=$((found+1)); continue; }
  h=$(grep -iE "$HIGH" <<<"$txt" | tail -3)
  m=$(grep -iE "$MED"  <<<"$txt" | tail -2)
  if [ -n "$h" ]; then
    echo "── $p  ⚠ UNANSWERED ASK VISIBLE (may be incoming to Tower or outgoing to another lane — read it, do not assume)"
    sed 's/^ *//;s/^/     /' <<<"$h" | cut -c1-160
    found=$((found+1))
  elif [ -n "$m" ]; then
    echo "── $p  · parked / pending"
    sed 's/^ *//;s/^/     /' <<<"$m" | cut -c1-160
    found=$((found+1))
  else
    printf '%-13s %s\n' "$p" "no open ask detected"
  fi
done

if [ -f "$LEDGER" ]; then
  lh=$(grep -iE "$HIGH|$MED" "$LEDGER" | tail -4)
  if [ -n "$lh" ]; then
    echo "── today's ledger  · asks / parked packets recorded on disk"
    sed 's/^ *//;s/^/     /' <<<"$lh" | cut -c1-160
  fi
fi

echo
if [ "$found" = 0 ]; then
  echo "CLEAN — no lane is waiting on Tower or David."
else
  echo "$found lane(s) carry an open ask. A lane waiting on Tower looks EXACTLY like a lane at rest."
  echo "Answer it, or tell David it is his. Do not report the cockpit as quiet."
fi
exit 0
