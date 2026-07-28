#!/bin/bash
# Find every ask that is STILL OPEN — not every ask that was ever made.
#
# Why this exists: a lane waiting on Tower is indistinguishable from a lane resting
# (BUSY=no · DIALOG=none · COMPOSER=empty for both). The stall watcher calls it rest.
#
# Why v2 (2026-07-28, David: "fix the open-asks check now"): v1 matched historical text,
# so an ask Tower had already answered kept failing the closeout. Two rules make it honest:
#   1. An ASK is open only if NO reply came after it — compare line positions in the
#      transcript. Tower's own messages carry a [TW..] marker; a lane's reply follows its ask.
#   2. A PARKED PACKET is resolved when Tower has recorded evidence the recipient ACTED,
#      in ~/.claude/tower/RESOLVED-PACKETS.md. Pointing at a path is not evidence.
REPO="$HOME/dynasty-genius-product"
RESOLVED="$HOME/.claude/tower/RESOLVED-PACKETS.md"
SESSION_HOURS=${SESSION_HOURS:-18}
LEDGER="$REPO/docs/agent-ledger/$(date +%F).md"
[ -f "$LEDGER" ] || LEDGER=$(find "$REPO/docs/agent-ledger" -maxdepth 1 -name '20*.md' -mmin -$((SESSION_HOURS*60)) 2>/dev/null | sort | tail -1)
PANES="${*:-dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1}"
DEPTH=${DEPTH:-200}
found=0

ASK='>>> *david|never got your word|await(ing)? (your|david.?s) word|need(s|ed)? (your|david.?s) word|say the word|one instruction away|your word (is )?(required|needed)|awaiting (your|tower.?s|david.?s) (word|decision|go|call)|blocked on (you|tower|david)|not safe for me to assume|please reply with|which do you want|do you want me to'
REPLY='\[TW[0-9]|\[TOWER'

echo "=== OPEN ASKS SWEEP v2 — $(date '+%F %H:%M') ==="
for p in $PANES; do
  txt=$(tmux capture-pane -t "$p" -p -S -"$DEPTH" 2>/dev/null)
  if [ -z "$txt" ]; then
    printf '%-13s %s\n' "$p" "UNREADABLE — state unknown, do not assume rest"; found=$((found+1)); continue
  fi
  last_ask=$(grep -niE "$ASK" <<<"$txt" | tail -1 | cut -d: -f1)
  last_reply=$(grep -niE "$REPLY" <<<"$txt" | tail -1 | cut -d: -f1)
  if [ -n "$last_ask" ] && { [ -z "$last_reply" ] || [ "$last_reply" -lt "$last_ask" ]; }; then
    echo "── $p  ⚠ OPEN ASK — nothing answered it"
    sed -n "${last_ask}p" <<<"$txt" | sed 's/^ *//;s/^/     /' | cut -c1-170
    found=$((found+1))
  elif [ -n "$last_ask" ]; then
    printf '%-13s %s\n' "$p" "ask present but ANSWERED after it (line $last_ask, reply line $last_reply)"
  else
    printf '%-13s %s\n' "$p" "no ask detected"
  fi
done

# Parked packets: open only when Tower has recorded no consumption evidence.
if [ -f "$LEDGER" ]; then
  pk=$(grep -iE 'deliver(y|ed)? (failed|refused|did not)|parked (durably )?at|pane_claim_lost|pane_dialog|no third attempt' "$LEDGER" 2>/dev/null | grep -oE 'msg_[a-z0-9_]+\.md' | sort -u)
  unres=""
  for f in $pk; do grep -q "$f" "$RESOLVED" 2>/dev/null || unres="$unres $f"; done
  if [ -n "$(printf '%s' "$unres" | tr -d ' ')" ]; then
    echo "── parked packets with NO consumption evidence:$unres"
    echo "     confirm the recipient ACTED, then record it in RESOLVED-PACKETS.md"
    found=$((found+1))
  else
    printf '%-13s %s\n' "packets" "every parked packet has recorded consumption evidence"
  fi
fi

echo
if [ "$found" = 0 ]; then
  echo "CLEAN — no lane is waiting on Tower or David."
else
  echo "$found open item(s). A lane waiting on Tower looks EXACTLY like a lane at rest."
  echo "Answer it, or tell David it is his. Do not report the cockpit as quiet."
fi
exit 0
