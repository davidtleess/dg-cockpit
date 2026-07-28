#!/bin/bash
# Tower closeout verifier. "Safe to walk away" is a MEASURED verdict, never an assertion.
# Usage: closeout-check.sh            (report only — never changes anything)
# Every check prints PASS / FAIL / UNKNOWN / FACT and the evidence it used.
HERE="$(cd "$(dirname "$0")/.." && pwd)"   # absolute; section 5 cd's away and relative bin/ calls silently vanish
REPO="$HOME/dynasty-genius-product"
STUDIO="$HOME/frontend-studio"
HANDOFF="$HOME/.claude/projects/-Users-davidleess/memory/cockpit_handoff.md"
BOARD="$HOME/.claude/tower/BOARD.md"
DEC="$HOME/.claude/tower/DECISIONS.md"
# SESSION ledger, not calendar ledger. A cockpit that runs past midnight writes everything to
# yesterday's file; keying on today's date makes a clean closeout look broken (found 2026-07-28).
SESSION_HOURS=${SESSION_HOURS:-18}
LEDGER="$REPO/docs/agent-ledger/$(date +%F).md"
if [ ! -f "$LEDGER" ]; then
  LEDGER=$(find "$REPO/docs/agent-ledger" -maxdepth 1 -name '20*.md' -mmin -$((SESSION_HOURS*60)) 2>/dev/null | sort | tail -1)
  [ -n "$LEDGER" ] && echo "NOTE: session spans midnight — using $(basename "$LEDGER") as the session ledger"
fi
PANES="dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1"
fails=0; unknowns=0
say(){ printf '%-9s %-34s %s\n' "$1" "$2" "$3"; case "$1" in FAIL) fails=$((fails+1));; UNKNOWN) unknowns=$((unknowns+1));; esac; }
# "current" = touched within the session window, not "has today's calendar date".
today_mtime(){ [ -f "$1" ] && [ -n "$(find "$1" -mmin -$((${SESSION_HOURS:-18}*60)) 2>/dev/null)" ]; }

echo "=== TOWER CLOSEOUT VERIFIER — $(date '+%F %H:%M') ==="
echo

echo "-- 1. BACKGROUND WORK (nothing runs unattended past closeout) --"
jobs_run=$(pgrep -f "$REPO/scripts/" 2>/dev/null | wc -l | tr -d ' ')
[ "$jobs_run" = 0 ] && say PASS "no repo scripts running" "pgrep clean" \
  || say FAIL "$jobs_run repo script(s) STILL RUNNING" "$(pgrep -fl "$REPO/scripts/" | head -3)"
# Codex, 2026-07-27: "pane-at-rest is theatre once processes are independently enumerated."
# A pane can sit idle while the work it launched keeps running. Enumerate descendants.
for pane in $PANES; do
  ppid=$(tmux display -pt "$pane" '#{pane_pid}' 2>/dev/null)
  [ -z "$ppid" ] && continue
  kids=$(pgrep -P "$ppid" 2>/dev/null | wc -l | tr -d ' ')
  gk=0; for k in $(pgrep -P "$ppid" 2>/dev/null); do gk=$((gk+$(pgrep -P "$k" 2>/dev/null | wc -l | tr -d ' '))); done
  tot=$((kids+gk))
  [ "$tot" -le 1 ] && say PASS "$pane no live child work" "$tot descendant(s)" \
    || say FACT "$pane has $tot descendant process(es)" "idle pane != idle work — check before calling it rest"
done
wf=$(pgrep -f "backup_irreplaceable_data.py" 2>/dev/null | wc -l | tr -d ' ')
[ "$wf" = 0 ] && say PASS "no backup run in flight" "" || say FAIL "backup run IN FLIGHT" "pid $(pgrep -f backup_irreplaceable_data.py|tr '\n' ' ')"

echo
echo "-- 2. LANES (mid-turn work landed, no open dialog, no strand) --"
for p in $PANES; do
  st=$("$HERE/bin/pane-state.sh" "$p" 2>/dev/null)
  busy=$(sed -n 's/^BUSY=//p' <<<"$st"); dlg=$(sed -n 's/^DIALOG=//p' <<<"$st"); comp=$(sed -n 's/^COMPOSER=//p' <<<"$st")
  if [ -z "$busy" ]; then say UNKNOWN "$p unreadable" "pane-state failed"; continue; fi
  if [ "$busy" = yes ]; then say FAIL "$p STILL WORKING" "let it reach a stopping point"
  elif [ "$dlg" = open ]; then say FAIL "$p BLOCKED on a dialog" "resolve or escalate to David"
  elif [ "$comp" = real ]; then say FAIL "$p holds a REAL STRAND" "tell the SENDER to re-send — never Tower"
  else say PASS "$p at rest" "busy=no dialog=none composer=$comp"; fi
done

echo
echo "-- 3. CREW FLUSH (postflight in TODAY's ledger, per lane) --"
if [ -f "$LEDGER" ]; then
  for lane in "Claude Code" "Codex" "Gemini"; do
    n=$(grep -c "^## .*$lane" "$LEDGER")
    [ "$n" -gt 0 ] && say PASS "$lane wrote to today's ledger" "$n entr(ies)" \
      || say FAIL "$lane has NO ledger entry today" "$LEDGER"
  done
else say FAIL "no ledger for today" "$LEDGER missing"; fi

echo
echo "-- 4. STUDIO FLUSH (pane retains nothing — disk is the only proof) --"
today_mtime "$STUDIO/DAVID.md" && say PASS "DAVID.md logged today" "$(date -r "$STUDIO/DAVID.md" '+%H:%M')" \
  || say FAIL "DAVID.md NOT touched today" "learnings would be lost at reset"
newest=$(find "$STUDIO/proposals" "$STUDIO/for-david" -maxdepth 1 -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -1 | xargs -I{} basename {} 2>/dev/null)
say FACT "newest Studio artifact" "${newest:-none}"

echo
echo "-- 5. DURABILITY (what survives a dg rebuild) --"
cd "$REPO" 2>/dev/null || exit 1
ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null)
dirty=$(git status --porcelain | wc -l | tr -d ' ')
[ "$ahead" = 0 ] && say PASS "nothing unpushed" "" || say FACT "$ahead commit(s) UNPUSHED" "David's word required — report, do not push"
if [ "$dirty" = 0 ]; then say PASS "working tree clean" ""
else
  say FACT "$dirty uncommitted path(s)" "naming a path does NOT freeze its bytes (Codex, 2026-07-27)"
  echo "     HASH THESE INTO THE HANDOFF so the next Tower can detect drift:"
  git status --porcelain | awk '{print $NF}' | while read -r f; do
    [ -f "$f" ] && printf '       %s  %s\n' "$(shasum -a 256 "$f" | cut -c1-12)" "$f"
  done
fi
mk="$REPO/app/data/ops/backup_status_latest.json"
if [ -f "$mk" ]; then
  python3 - "$mk" <<'PY'
import json,sys
m=json.load(open(sys.argv[1]))
ok = m.get('status')=='completed' and m.get('sha256_verified') is True
print(('PASS      ' if ok else 'FAIL      ')+'%-34s'%'backup marker healthy'+f"{m.get('run_id')} {m.get('status')} files={m.get('files')} verified={m.get('sha256_verified')}")
PY
else say UNKNOWN "no backup marker" "$mk"; fi

echo
echo "-- 6. OPEN ASKS (a lane waiting on Tower looks identical to a lane at rest) --"
oa=$("$HERE/bin/open-asks.sh" 2>/dev/null)
if grep -qE '^CLEAN' <<<"$oa"; then say PASS "no lane waiting on a word" "open-asks clean"
else say FAIL "open ask(s) outstanding" "run bin/open-asks.sh and answer or escalate each"; fi

echo
echo "-- 7. TRUTH, NOT TIDINESS (crew's own words, 2026-07-27) --"
echo "     Claude: \"the list verifies things are WRITTEN and AT REST, not that what was written is TRUE.\""
echo "     Studio: \"you ask me to confirm I am finished — the one thing I cannot get wrong.\""
if [ -f "$LEDGER" ]; then
  grep -qiE 'unreviewed|author-checked only|nobody else (has )?checked|single-lane' "$LEDGER" \
    && say PASS "unreviewed claims declared today" "each lane named what only it has checked" \
    || say FAIL "NO lane declared its unreviewed claims" "ask: which figures has nobody but you checked?"
  grep -qiE 'retract|reversed|i was wrong|corrected my own|withdraw' "$LEDGER" \
    && say PASS "retractions/reversals recorded" "what changed its mind is on disk" \
    || say UNKNOWN "no retraction recorded today" "either nobody reversed anything, or nobody said so"
else say FAIL "no ledger" "cannot assess"; fi

echo
echo "-- 8. DELIVERY STATE IS TOWER'S TO ASSERT, NOT THE LANE'S --"
echo "     Studio: \"you accept my account of delivery when YOU hold the evidence. I am the interested party.\""
strand=0
for p in $PANES; do
  c=$("$HERE/bin/pane-state.sh" "$p" 2>/dev/null | sed -n 's/^COMPOSER=//p')
  [ "$c" = real ] && { say FAIL "$p holds unsent text" "identify the SENDER and have them re-send"; strand=1; }
done
[ "$strand" = 0 ] && say PASS "no unsent text in any composer" "Tower measured this, did not ask"
# A parked packet is resolved only when Tower has EVIDENCE the recipient acted on it,
# recorded in RESOLVED-PACKETS.md. Pointing at a path is not evidence.
RESOLVED="$HOME/.claude/tower/RESOLVED-PACKETS.md"
# Only packets named on a line that ALSO reports a parking/delivery failure. Every other
# evidence file was delivered normally and is not a stranded packet.
pk=$(grep -iE 'deliver(y|ed)? (failed|refused|did not)|parked (durably )?at|pane_claim_lost|pane_dialog|no third attempt' "$LEDGER" 2>/dev/null \
     | grep -oE 'msg_[a-z0-9_]+\.md' | sort -u)
unres=""
for f in $pk; do
  grep -q "$f" "$RESOLVED" 2>/dev/null || unres="$unres $f"
done
if [ -z "$(printf '%s' "$unres" | tr -d ' ')" ]; then
  say PASS "every parked packet confirmed consumed" "evidence in RESOLVED-PACKETS.md"
else
  say FAIL "parked packet(s) with no consumption evidence:$unres" "confirm the recipient ACTED, then record it"
fi

echo
echo "-- 8b. TOWER'S OWN MACHINERY IS BACKED UP (coverage, not execution) --"
# 2026-07-28: everything built to fix Tower existed on ONE machine because the cockpit
# backup runs at 22:00 and nobody ever compared its CONTENTS to what is live.
# A backup that ran is not a backup that covers. Compare byte-for-byte.
CB="$HOME/dg-cockpit"
if [ -d "$CB" ]; then
  drift=0; checked=0
  compare_tree() { # <live dir> <backup dir> <label>
    [ -d "$1" ] || return 0
    while IFS= read -r f; do
      rel="${f#$1/}"; checked=$((checked+1))
      if [ ! -f "$2/$rel" ]; then echo "     MISSING FROM BACKUP: $3/$rel"; drift=$((drift+1))
      elif ! cmp -s "$f" "$2/$rel"; then echo "     STALE IN BACKUP:    $3/$rel"; drift=$((drift+1)); fi
    done < <(find "$1" -type f ! -name '*.heartbeat' ! -path '*__pycache__*' 2>/dev/null)
  }
  compare_tree "$HOME/.claude/skills/cockpit-observation" "$CB/claude/skills/cockpit-observation" "skill"
  compare_tree "$HOME/.claude/tower" "$CB/claude/tower" "tower"
  if [ -f "$CB/claude/agents/tower.md" ] && cmp -s "$HOME/.claude/agents/tower.md" "$CB/claude/agents/tower.md"; then :
  else echo "     STALE IN BACKUP:    charter (agents/tower.md) — CHARTER EDITS NOT PROTECTED"; drift=$((drift+1)); fi
  checked=$((checked+1))
  if [ "$drift" = 0 ]; then say PASS "Tower's machinery fully backed up" "$checked files byte-identical"
  else say FAIL "$drift of $checked Tower files STALE or MISSING in the backup" "run the cockpit backup — David's word"; fi
  # and did the last backup actually REACH the remote?
  if git -C "$CB" rev-list --count origin/main..HEAD >/dev/null 2>&1; then
    ah=$(git -C "$CB" rev-list --count origin/main..HEAD 2>/dev/null)
    [ "$ah" = 0 ] && say PASS "cockpit backup is on its remote" "" \
      || say FAIL "$ah cockpit backup commit(s) NEVER PUSHED" "backup.sh swallows a failed push and exits 0"
  fi
else say UNKNOWN "no dg-cockpit repo found" "$CB"; fi

echo
echo "-- 9. TOWER'S OWN RECORDS --"
today_mtime "$BOARD"   && say PASS "BOARD.md rebuilt today"    "$(date -r "$BOARD" '+%H:%M')"   || say FAIL "BOARD.md stale"    "rebuild from source before the debrief"
today_mtime "$DEC"     && say PASS "DECISIONS.md current"      "$(date -r "$DEC" '+%H:%M')"     || say FAIL "DECISIONS.md stale" "log today's rulings with authorities"
today_mtime "$HANDOFF" && say PASS "handoff written today"     "$(date -r "$HANDOFF" '+%H:%M')" || say FAIL "HANDOFF NOT WRITTEN" "the next Tower boots blind without it"

echo
echo "=== VERDICT ==="
if [ "$fails" = 0 ] && [ "$unknowns" = 0 ]; then
  echo "ALL CHECKS PASS — the words 'safe to walk away' are earned."
  exit 0
elif [ "$fails" = 0 ]; then
  echo "$unknowns UNKNOWN — say what could not be established. Do NOT say safe to walk away."
  exit 2
else
  echo "$fails FAIL / $unknowns UNKNOWN — closeout is NOT complete. Fix or tell David the cost of leaving."
  exit 1
fi
