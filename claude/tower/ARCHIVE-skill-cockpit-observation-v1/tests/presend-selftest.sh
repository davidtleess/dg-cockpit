#!/bin/bash
# Self-test for bin/presend-check.sh — the Tower pre-send gate.
# Cases 1-4 and 7-8 are REAL 2026-07-27 messages or real mistakes, not invented ones.
cd "$(dirname "$0")/.." || exit 1
G=bin/presend-check.sh
pass=0; fail=0
t() { # t <name> <expected-exit> <pane> <body>
  local name="$1" want="$2" pane="$3" body="$4" f; f=$(mktemp)
  printf '%s\n' "$body" > "$f"
  out=$("$G" "$pane" "$f" 2>&1); got=$?
  rm -f "$f"
  if [ "$got" = "$want" ]; then echo "  PASS  $name"; pass=$((pass+1))
  else echo "  FAIL  $name (want exit $want, got $got)"; echo "        $out"; fail=$((fail+1)); fi
}
echo "presend-check self-test"
t "AC1 contamination: figures + independence ask (real 2026-07-27 error)" 2 dynasty:1.2 \
  "The pointer names run 20260727T125127Z and the backup is intact at 273 objects. Re-derive that independently."
t "AC2 contamination: independence ask with NO figures passes" 0 dynasty:1.2 \
  "Re-derive the bucket state independently. Do not take the other lane's narrative on trust."
t "AC3 studio firewall: names the crew" 1 dynasty:2.1 \
  "Codex cleared it and the crew committed after three review rounds."
t "AC4 studio firewall: governance vocabulary" 1 dynasty:2.1 \
  "Per the governance operating loop, this needs a ledger entry against the sprint ticket."
t "AC5 studio inversion: handing Studio a task list" 1 dynasty:2.1 \
  "Your next task is to work on the roster surface, that is the priority."
t "AC6 studio: legitimate product fact passes" 0 dynasty:2.1 \
  "The model value score saturates at its ceiling, so eleven tight ends share one number while the market prices them across a fivefold range."
t "AC7 delivery: telling a lane to submit foreign text" 1 dynasty:1.1 \
  "There is a strand in the other pane, press enter on it so the lane can continue."
t "AC8 gate: unattributed commit authorisation" 1 dynasty:1.1 \
  "You are cleared to commit once the tests pass."
t "AC9 gate: authorisation WITH David's word passes" 0 dynasty:1.1 \
  "David's word, verbatim: fold it in now, commit once Codex clears. You are cleared to commit on that conditional."
t "AC10 lean leakage toward a review lane" 2 dynasty:1.2 \
  "Review this when you can. David prefers the second option and I think this is right."
t "AC11 neutral relay to a review lane passes" 0 dynasty:1.2 \
  "Review the attached and return CLEAR or NOT CLEAR with each defect reproduced."
out=$("$G" dynasty:1.1 /nonexistent/nope.txt 2>&1); got=$?
if [ "$got" = 1 ]; then echo "  PASS  AC12 unreadable file refuses"; pass=$((pass+1)); else echo "  FAIL  AC12"; fail=$((fail+1)); fi
t "AC13 dates and ids are NOT measurement figures (real correction message)" 0 dynasty:1.2 \
  "On 2026-07-26 Tower put a target in a briefing. Whatever you concluded is corroboration, not independent reproduction. Amend the record."
t "AC14 a real measurement target still trips the guard" 2 dynasty:1.2 \
  "The common cohort is 336 players with 131 crossings. Reproduce that independently."
t "AC15 Tower's own LEADING message-id is envelope, not crew talk" 0 dynasty:2.1 \
  "[TW27S] David wants your view on what your end-of-session flush is missing. Four short answers."
t "AC16 a process id in the BODY still trips the Studio firewall" 1 dynasty:2.1 \
  "David wants your view. For context the tw27f review round covered this already."
echo
echo "presend-check: $pass passed, $fail failed"
[ "$fail" = 0 ]
