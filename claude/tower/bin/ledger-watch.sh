#!/bin/bash
# ledger-watch.sh  Tower's ledger observer.  David-requested 2026-08-19.
#
# DOES        Watches docs/agent-ledger and reports three things to David:
#               1. NEW ENTRY         any new or changed ledger file
#               2. BALLOT INCOMPLETE  vote slots still unfilled, and whose
#               3. BRIEF UNANSWERED  a brief with no response artifact after N min
#
# NEVER       writes to the ledger  sends keys to a pane  messages a lane 
#             assigns, approves, routes or chases.
#             Tower reports; David decides.  (Charter Rule 3, 2026-08-08.)
#
# WHY LEDGER-ONLY SIGNALS: earlier drafts tried to prove "did agent X read this"
# from process/session forensics. All of it was unreliable  Tower's own session
# shares Claude's transcript dir, transcript birth != process launch, and tty
# mtime updates on cursor blink. The ledger IS the read receipt: if an agent
# acted, the ledger shows it. Everything below is provable from the ledger alone.
#
# USAGE   ledger-watch.sh            poll forever (default 30s)
#         ledger-watch.sh --once     print current state, exit
#         INTERVAL=60 STALE_MIN=20 ledger-watch.sh

LEDGER_DIR="${LEDGER_DIR:-$HOME/dynasty-genius-product/docs/agent-ledger}"
STATE_DIR="${STATE_DIR:-$HOME/.claude/tower/ledger-watch}"
ALERTS="${ALERTS:-$HOME/.claude/tower/ledger-alerts.md}"
INTERVAL="${INTERVAL:-30}"
STALE_MIN="${STALE_MIN:-15}"

mkdir -p "$STATE_DIR"
SEEN="$STATE_DIR/seen.txt"; touch "$SEEN"
ts(){ date '+%Y-%m-%d %H:%M:%S %Z'; }
mt(){ stat -f '%m' "$1" 2>/dev/null || echo 0; }
hm(){ date -r "$1" '+%H:%M:%S' 2>/dev/null; }
agemin(){ echo $(( ( $(date +%s) - $1 ) / 60 )); }

# 1  new or changed ledger files (seeded silently on first run, so no flood)
check_new(){
  local f key
  while IFS= read -r f; do
    key="${f#$LEDGER_DIR/}|$(mt "$f")"
    grep -qxF "$key" "$SEEN" && continue
    printf '%s\n' "$key" >> "$SEEN"
    [ "$SEED" = yes ] && continue
    echo "- **NEW ENTRY** \`${f#$LEDGER_DIR/}\` at $(hm "$(mt "$f")")"
  done < <(find "$LEDGER_DIR" -type f -name '*.md' -newermt '-2 days' 2>/dev/null)
}

# 2  ballot slots still carrying the placeholder, with the voter above each
check_ballot(){
  local f n who
  f="$LEDGER_DIR/$(date '+%Y-%m-%d').md"; [ -f "$f" ] || return 0
  n=$(grep -c 'append your three lines here' "$f" 2>/dev/null) || n=0
  [ "${n:-0}" -eq 0 ] && return 0
  who=$(awk '/^### /{h=$0} /append your three lines here/{sub(/^### /,"",h); printf "%s; ",h}' "$f")
  echo "- **BALLOT INCOMPLETE** $n slot(s) unfilled in $(basename "$f")  ${who%; }"
}

# 3  a brief with no later artifact naming the same host = nobody answered it
check_briefs(){
  local day f base host bm newer
  day=$(date '+%Y-%m-%d')
  for f in "$LEDGER_DIR/evidence/$day"/*brief*; do
    [ -f "$f" ] || continue
    base=$(basename "$f"); bm=$(mt "$f")
    [ "$(agemin "$bm")" -lt "$STALE_MIN" ] && continue
    case "$base" in *claude*) host=claude;; *codex*) host=codex;; *gemini*) host=gemini;; *) continue;; esac
    # any artifact for this host newer than the brief counts as a response
    newer=$(find "$LEDGER_DIR/evidence/$day" "$LEDGER_DIR/$day.md" -newer "$f" -type f 2>/dev/null \
            | grep -i "$host" | grep -iv brief | head -1)
    [ -n "$newer" ] && continue
    echo "- **BRIEF UNANSWERED** \`$base\` landed $(hm "$bm"), $(agemin "$bm")m ago  no $host artifact since"
  done
}

sweep(){ check_new; check_ballot; check_briefs; }

SEED=no; [ -s "$SEEN" ] || SEED=yes      # first run: record state, stay quiet

if [ "${1:-}" = "--once" ]; then
  echo "=== ledger state $(ts) ==="
  out=$(sweep); [ -n "$out" ] && echo "$out" || echo "  (nothing outstanding)"
  echo "=== end ==="; exit 0
fi

echo "$(ts) started pid $$ interval ${INTERVAL}s" >> "$STATE_DIR/watch.log"
sweep >/dev/null 2>&1; SEED=no           # seed, then go live
while true; do
  out=$(sweep 2>/dev/null)
  [ -n "$out" ] && { printf '\n### %s\n%s\n' "$(ts)" "$out" >> "$ALERTS"; }
  date +%s > "$STATE_DIR/heartbeat"
  sleep "$INTERVAL"
done
