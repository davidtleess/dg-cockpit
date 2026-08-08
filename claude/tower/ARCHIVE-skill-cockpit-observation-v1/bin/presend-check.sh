#!/bin/bash
# Tower pre-send gate. Run BEFORE bin/pane-send.sh on every message Tower writes.
#   presend-check.sh <pane> <message-file>
# Exit 0 PASS · 1 REFUSE · 2 WARN (Tower must justify in the message itself)
# Built 2026-07-27 after David: "i need all these holes filled."
pane="$1"; f="$2"
[ -r "$f" ] || { echo "REFUSE: message file unreadable"; exit 1; }
# Tower's own leading message-ID header (e.g. "[TW27S] ") is Tower's envelope, not content.
# Stripped ONLY at the very start of the message; an id mentioned in the body still trips.
body=$(tr 'A-Z' 'a-z' < "$f" | sed -E '1s/^\[(tw|tower)[0-9a-z-]*\] *//')
verdict=0; notes=()

# ---- 1. STUDIO FIREWALL (pane 2.1). Hard refuse on anything about the TEAM. ----
if [ "$pane" = "dynasty:2.1" ]; then
  banned='codex|gemini|claude code|the crew|engineer(s|ing lane)|spokesperson|ledger|governance|constitution|north.star|operating loop|agent_sync|spec|sprint|ticket|backlog|roadmap|dgx-|dg2-|s0-0|tw2[0-9]|commit|push|pull request|review round|verdict|enumerated clear|not clear|blocker id|pane 1\.|dynasty:1\.'
  hit=$(grep -oiE "$banned" <<<"$body" | sort -u | tr '\n' ' ')
  if [ -n "$hit" ]; then
    echo "REFUSE: Studio firewall — message names the team or its machinery: $hit"
    echo "Studio receives PRODUCT facts and DAVID's decisions only. Never who is doing what, never process."
    exit 1
  fi
  # roadmap-shaped verbs toward Studio (the inversion rule)
  if grep -qiE 'we need you to (build|design|make)|your (next )?(task|assignment)|priorit(y|ies) (is|are)|work on (the )?[a-z]+ (surface|screen|page)' <<<"$body"; then
    echo "REFUSE: Studio inversion rule — this reads as handing Studio a task list."
    echo "Specific design briefs come from David, through Tower, and are rare. Ideas originate FROM Studio."
    exit 1
  fi
fi

# ---- 2. CONTAMINATION: never hand an answer while asking for independence ----
asks_independent=$(grep -ciE 'independent|re-?derive|reproduce|verify (it|this) yourself|do not (take|trust) [a-z]+ (word|narrative)|blind|walled.off' <<<"$body")
# Strip things that are NOT measurement targets before counting figures: ISO dates,
# run-id timestamps, git hashes, ticket/message ids. A date is not an answer.
scrubbed=$(sed -E -e 's/20[0-9]{2}-[0-9]{2}-[0-9]{2}//g' \
                  -e 's/20[0-9]{6}t[0-9]{6}z//g' \
                  -e 's/\b[0-9a-f]{7,40}\b//g' \
                  -e 's/\b(tw|dgx|dg|s)[0-9-]+[a-z]?\b//g' \
                  -e 's/\b(part|item|round|step|option|unit) ?[0-9]\b//g' <<<"$body")
carries_figures=$(grep -coE '[0-9]+(\.[0-9]+)?(pp|%)|[0-9]{1,3},[0-9]{3}|\b[0-9]{2,}\b' <<<"$scrubbed")
if [ "$asks_independent" -gt 0 ] && [ "$carries_figures" -gt 0 ]; then
  echo "WARN: CONTAMINATION SHAPE — this message asks for independent work AND carries figures/targets."
  echo "  Tower did exactly this on 2026-07-26 (target in the briefing) and again on 2026-07-27"
  echo "  (bucket pointer stated, then re-derivation requested). The result is CORROBORATION, not"
  echo "  independence, and must be recorded as such."
  echo "  FIX: strip every figure, or drop the independence ask and label the result corroboration."
  verdict=2
fi

# ---- 3. DELIVERY DISCIPLINE: never instruct a third party to complete someone's delivery ----
if grep -qiE 'press enter|submit (it|the|that) (paste|message|strand)|hit enter|send it for (them|him|it)' <<<"$body"; then
  echo "REFUSE: delivery discipline — sender owns delivery (David, 2026-07-21)."
  echo "Tower never asks a lane to submit text it did not author. Tell the SENDER to re-send."
  exit 1
fi

# ---- 4. DAVID'S GATES: Tower must not author authorisation it was never given ----
if grep -qiE '(you (may|can|are cleared to)|go ahead and|authoris(ed|e)d? to) (commit|push|delete|merge|schedule|deploy)' <<<"$body"; then
  if ! grep -qiE "david'?s word|david said|david ruled|verbatim|conditional on|he (said|worded)" <<<"$body"; then
    echo "REFUSE: gate-shaped authorisation with no attribution to David's word."
    echo "Commits, pushes, deletes, schedules and merges are David's. Quote his word or do not send it."
    exit 1
  fi
fi

# ---- 5. LEAN LEAKAGE toward the crew: never signal David's preference before review ----
if [[ "$pane" =~ ^dynasty:1\. ]]; then
  if grep -qiE "david (likes|prefers|leans|wants|will probably|is inclined)|i think (this|it) (is right|will pass)|this looks (right|correct|good) to me" <<<"$body"; then
    echo "WARN: LEAN LEAKAGE — Tower may be signalling a preference before the lane has reviewed."
    echo "  Relays stay neutral. State the ask and the facts; withhold the lean."
    verdict=2
  fi
fi

[ "$verdict" = 0 ] && echo "PASS: no firewall, contamination, delivery, gate or lean violation detected"
exit "$verdict"
