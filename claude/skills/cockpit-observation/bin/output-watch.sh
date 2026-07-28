#!/bin/bash
# Fires when a lane PRODUCES something. The dialog watcher only fires when a lane gets STUCK.
LEDGER_DIR="$HOME/dynasty-genius-product/docs/agent-ledger"
STUDIO_DIRS="$HOME/frontend-studio/proposals $HOME/frontend-studio/for-david"
STUDIO_DAVID="$HOME/frontend-studio/DAVID.md"
POLL=${POLL:-45}

today() { date +%Y-%m-%d; }
lcount() { [ -f "$1" ] && wc -l < "$1" | tr -d ' ' || echo 0; }

L=$(lcount "$LEDGER_DIR/$(today).md")
S=$(ls -1 $STUDIO_DIRS 2>/dev/null | wc -l | tr -d ' ')
DM=$(stat -f %m "$STUDIO_DAVID" 2>/dev/null || echo 0)
echo "OUTPUT-WATCH START ledger=$L studio_files=$S"

while true; do
  sleep "$POLL"
  f="$LEDGER_DIR/$(today).md"
  n=$(lcount "$f")
  if [ "$n" -gt "$L" ]; then
    hdr=$(grep '^## ' "$f" | tail -1)
    echo "LEDGER +$((n-L)) lines — newest entry: ${hdr:-<no header>}"
    # A lane that PARKED a packet is a lane whose recipient is now waiting on Tower.
    # Missed on 2026-07-27: Codex logged "delivery failed twice; parked at <path>" and Tower
    # read the entry for content, skipped the state line, and the whole cockpit went idle.
    newtext=$(tail -n "$((n-L))" "$f")
    if grep -qiE 'deliver(y|ed)? (failed|refused)|parked (durably )?at|pane_claim_lost|pane_dialog|not deliver|could not deliver|no third attempt|awaiting relay' <<<"$newtext"; then
      echo "⚠ UNDELIVERED PACKET — a lane parked a message it could not deliver. ACT NOW: point the recipient at the parked path. Evidence:"
      grep -iE 'deliver(y|ed)? (failed|refused)|parked (durably )?at|pane_claim_lost|pane_dialog|no third attempt' <<<"$newtext" | sed 's/^ *//' | cut -c1-220 | head -3
    fi
    L=$n
  fi
  s=$(ls -1 $STUDIO_DIRS 2>/dev/null | wc -l | tr -d ' ')
  if [ "$s" -ne "$S" ]; then
    newest=$(ls -t $STUDIO_DIRS 2>/dev/null | head -1)
    echo "STUDIO produced a file — newest: $newest"
    S=$s
  fi
  dm=$(stat -f %m "$STUDIO_DAVID" 2>/dev/null || echo 0)
  if [ "$dm" -ne "$DM" ]; then echo "STUDIO logged new DAVID.md feedback"; DM=$dm; fi
done
