#!/usr/bin/env bash
# say-clear.sh — the gate Tower must pass BEFORE telling David anything is clear.
#
# WHY THIS EXISTS. 2026-07-28, ~09:05. Tower ended a message with "Nothing needs you right now"
# while THREE approval dialogs were open — one of them blocking the very deliverable Tower had
# just told David was coming. David caught it. Tower had swept at 09:03, seen nothing, and let
# a two-minute-old snapshot stand in for an ongoing claim.
#
# THE RULE THIS ENFORCES:
#   "Clear", "quiet", "at rest", "nothing needs you", "safe to walk away" and every phrasing of
#   them are claims about an ONGOING state. Tower may not make one from a snapshot, from memory,
#   or from an earlier message. Run this. Read the verdict. Then speak.
#
# It changes nothing. It only establishes facts.
#
#   say-clear.sh            full gate
#   say-clear.sh --quiet    verdict line only
#
# Exit 0 = CLEAR · 1 = NOT CLEAR (reasons listed) · 2 = CANNOT ESTABLISH (say so; never say clear)

set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN="$SKILL_DIR/bin"
PANES="${TOWER_PANES:-dynasty:1.1 dynasty:1.2 dynasty:1.3 dynasty:2.1}"
QUIET=no
[ "${1:-}" = "--quiet" ] && QUIET=yes

say() { [ "$QUIET" = yes ] || echo "$@"; }

BLOCKERS=""
UNKNOWNS=""

say "=== SAY-CLEAR GATE — $(date '+%Y-%m-%d %H:%M:%S %Z') ==="

# --- 1. Are the watchers alive? ---------------------------------------------------------------
# Without a live watcher, "nothing needs you" cannot be supported by anything but a snapshot.
# This is the check whose absence caused the 2026-07-28 miss.
if [ -x "$BIN/watchdog.sh" ]; then
  wd="$("$BIN/watchdog.sh" --status 2>&1)"; wd_rc=$?
  if [ "$wd_rc" -eq 0 ]; then
    say "watchers      LIVE ($(echo "$wd" | grep '^HEARTBEAT_AGE_SECS=' | cut -d= -f2)s since last heartbeat)"
  else
    p="$(echo "$wd" | grep '^PROBLEMS=' | cut -d= -f2-)"
    say "watchers      DEAD — ${p:-unknown}"
    BLOCKERS="$BLOCKERS
  - Tower is BLIND: ${p:-watchers not running}. Start them (watchdog.sh) before claiming any ongoing state."
  fi
else
  say "watchers      CANNOT VERIFY — watchdog.sh missing"
  UNKNOWNS="$UNKNOWNS
  - watchdog.sh missing; watcher liveness unknown"
fi

# --- 2. Open dialogs, measured NOW -------------------------------------------------------------
for p in $PANES; do
  st="$("$BIN/pane-state.sh" "$p" 2>&1)" || {
    say "$p   CANNOT VERIFY"
    UNKNOWNS="$UNKNOWNS
  - $p: pane-state.sh failed; this pane's state is UNKNOWN, not good"
    continue
  }
  dlg="$(echo "$st" | grep '^DIALOG=' | cut -d= -f2)"
  busy="$(echo "$st" | grep '^BUSY=' | cut -d= -f2)"
  comp="$(echo "$st" | grep '^COMPOSER=' | cut -d= -f2)"
  say "$p   dialog=$dlg busy=$busy composer=$comp"
  if [ "$dlg" = "open" ]; then
    BLOCKERS="$BLOCKERS
  - $p is BLOCKED on an approval dialog. A blocked lane emits no events and looks exactly like a resting one."
  fi
  # A REAL strand belongs to its sender; Tower never submits it, but it is never "clear" either.
  if [ "$comp" = "real" ]; then
    BLOCKERS="$BLOCKERS
  - $p has REAL text in its composer. Identify the sender and tell them to re-send; Tower does not submit it."
  fi
done

# --- 3. Is anyone waiting on Tower or David? ---------------------------------------------------
# BUSY=no · DIALOG=none · COMPOSER=empty is the signature of a lane at rest AND of a lane
# waiting on words Tower owes. Only this sweep tells them apart.
if [ -x "$BIN/open-asks.sh" ]; then
  oa="$("$BIN/open-asks.sh" 2>&1)"; oa_rc=$?
  if [ "$oa_rc" -eq 0 ] && echo "$oa" | grep -q "CLEAN"; then
    say "open asks     CLEAN"
  else
    say "open asks     NOT CLEAN"
    BLOCKERS="$BLOCKERS
  - open-asks.sh did not return CLEAN. A lane is waiting on Tower or David:
$(echo "$oa" | sed 's/^/      /')"
  fi
else
  UNKNOWNS="$UNKNOWNS
  - open-asks.sh missing; cannot tell a waiting lane from a resting one"
fi

say ""

if [ -n "$BLOCKERS" ]; then
  echo "VERDICT=NOT_CLEAR"
  echo "DO NOT tell David the cockpit is clear, quiet, at rest, or that nothing needs him."
  echo "REASONS:$BLOCKERS"
  [ -n "$UNKNOWNS" ] && echo "ALSO UNKNOWN:$UNKNOWNS"
  exit 1
fi

if [ -n "$UNKNOWNS" ]; then
  echo "VERDICT=CANNOT_ESTABLISH"
  echo "Say what could not be established. Never substitute 'clear' for 'unverified'."
  echo "UNKNOWN:$UNKNOWNS"
  exit 2
fi

echo "VERDICT=CLEAR"
echo "Measured now: watchers live, no lane blocked on a dialog, no strand, nobody waiting on Tower or David."
echo "This verdict decays. It supports a statement about NOW, and only holds while the watchers stay live."
exit 0
