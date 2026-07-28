#!/bin/bash
# pane-state.sh <pane> — establish, at run time, everything Tower must know about a
# pane BEFORE sending to it or reporting on it.
#
# Emits key=value lines on stdout. Never sends a key. Never writes to any repo.
#
# Exit codes:  0 = state established   3 = CANNOT_VERIFY (a check could not run)
#
# Design note (TOWER-1 §4, "instrument ignorance"): every number here is MEASURED
# at call time. Nothing about a pane's retention, busyness or dialog state is
# assumed or cached, because all three move during a session.
set -u

pane="${1:?usage: pane-state.sh <pane>   e.g. pane-state.sh dynasty:1.2}"

fail() { echo "STATUS=CANNOT_VERIFY"; echo "REASON=$1"; exit 3; }

command -v tmux >/dev/null 2>&1 || fail "tmux is not on PATH"
command -v shasum >/dev/null 2>&1 || fail "shasum is not on PATH"

sess="${pane%%:*}"
tmux has-session -t "$sess" 2>/dev/null || fail "session '$sess' does not exist"
tmux display -t "$pane" -p '#{pane_id}' >/dev/null 2>&1 || fail "pane '$pane' does not exist"

hist=$(tmux display -t "$pane" -p '#{history_size}' 2>/dev/null) || fail "cannot read history_size"
hlim=$(tmux display -t "$pane" -p '#{history_limit}' 2>/dev/null) || fail "cannot read history_limit"
alt=$(tmux display -t "$pane" -p '#{alternate_on}' 2>/dev/null) || alt=0

esc=$(tmux capture-pane -e -t "$pane" -p 2>/dev/null) || fail "capture-pane -e failed on $pane"
[ -n "$esc" ] || esc=""
plain=$(printf '%s\n' "$esc" | sed -E $'s/\x1b\\[[0-9;]*m//g')

# tail_content <N> — the last N lines that CONTAIN something, ignoring the blank
# padding rows tmux returns for an unfilled pane. Plain `tail -N` counts those
# blanks and can slice the top off a dialog that is not flush to the bottom,
# silently inspecting the wrong text (found 2026-07-26).
tail_content() {
  awk -v n="$1" '{a[NR]=$0}
    END{ last=0; for(i=NR;i>=1;i--) if(a[i] ~ /[^[:space:]]/){last=i;break}
         if(last==0) exit; s=last-n+1; if(s<1)s=1; for(i=s;i<=last;i++) print a[i] }'
}

hash_of() { printf '%s' "$1" | shasum -a 256 2>/dev/null | cut -c1-16; }

echo "PANE=$pane"
echo "HISTORY_SIZE=$hist"
echo "HISTORY_LIMIT=$hlim"
echo "ALTERNATE_SCREEN=$alt"

# ---- Retention verdict -------------------------------------------------------
# Whether a pane can PROVE anything is a property of the pane, measured now.
# Three ways it cannot:
#   history_limit=0   scrollback discarded outright
#   alternate_on=1    the app owns a full-screen buffer; tmux captures only the
#                     visible screen and scrollback never accumulates. THIS is
#                     why cockpit pane 2.1 measured ~3 lines against ~1900 in its
#                     siblings on 2026-07-25 — not a tmux setting, a screen mode.
#   history_size=0    nothing retained yet, so only the visible screen exists
# In all three, absence of a marker is NOT evidence of non-delivery.
# The decisive question is what the pane HAS RETAINED, measured now — not what it
# is configured to allow. Cockpit pane 2.1 carries history_limit=2000 and retains
# 0 lines; its sibling 1.1 is in the same alternate-screen mode and retains ~1900.
# So alternate-screen is CONTEXT that explains a zero, never the verdict itself.
if [ "$hlim" -eq 0 ] 2>/dev/null; then
  echo "RETENTION=none"
  echo "RETENTION_REASON=history_limit is 0; scrollback is discarded outright"
elif [ "$hist" -eq 0 ] 2>/dev/null; then
  echo "RETENTION=none"
  if [ "$alt" -eq 1 ] 2>/dev/null; then
    echo "RETENTION_REASON=nothing is retained beyond the visible screen (history_size=0 despite limit=$hlim); the pane is in alternate-screen mode, which is the usual cause"
  else
    echo "RETENTION_REASON=nothing is retained beyond the visible screen (history_size=0)"
  fi
else
  echo "RETENTION=yes"
  echo "RETENTION_REASON="
fi

# ---- Busy ---------------------------------------------------------------------
if printf '%s\n' "$plain" | grep -qE 'esc to interrupt|esc to cancel|Working \(|Generating\.\.\.|Loading\.\.\.'; then
  echo "BUSY=yes"
else
  echo "BUSY=no"
fi

# ---- Approval dialog ----------------------------------------------------------
# Content-keyed, NOT state-keyed. TOWER-1 failure 7: a watcher that de-duplicated
# by pane state reported one alert for two consecutive distinct prompts, and two
# lanes sat blocked while Tower reported them working. The key below is a hash of
# the prompt TEXT, so a different prompt is always a different event.
#
# Two hard-won constraints on this detector:
#   (a) Only the BOTTOM of the pane counts. Dialogs always render there, whereas
#       ordinary transcript text scrolls through the middle.
#   (b) A bare numbered line is NOT a dialog. A prose message containing
#       "1. Search the whole buffer" false-positived this check on first run and
#       would have made Tower refuse to send to a healthy pane forever. A real
#       option list carries a SELECTION CURSOR (❯ › >) immediately before the
#       number, or unambiguous dialog boilerplate.
dtail=$(printf '%s\n' "$plain" | tail_content 15)
dialog_block=$(printf '%s\n' "$dtail" | grep -E 'Do you want (to|me)|Requesting permission for|Press enter to confirm|^[[:space:]]*[❯›>][[:space:]]*[0-9]+\.[[:space:]]' | head -8)
if [ -n "$dialog_block" ]; then
  echo "DIALOG=open"
  # ---- DIALOG_KEY: hash the WHOLE dialog region, including the COMMAND ----------
  # Found 2026-07-28 by David, who saw two lanes idle on a "yes" that no alert had
  # been raised for. `dialog_block` above is the DETECTION material: boilerplate plus
  # the cursor'd option. It excludes the one part that actually varies — the command
  # being requested. So every Studio bash prompt ("Do you want to proceed? / 1. Yes")
  # hashed IDENTICALLY, and pane-watch.sh, which de-duplicates by this key, alerted
  # once and then stayed silent for every subsequent dialog on that pane forever.
  #
  # This is TOWER-1 failure 7 alive again in a subtler form. It was "fixed" by keying
  # on prompt TEXT rather than pane state, and AC6 passes — because the test's two
  # prompts happened to differ in the grep-matched lines. Real dialogs differ in the
  # lines the grep throws away. A key must be built from what VARIES, and it has to be
  # tested against the shapes the cockpit actually produces.
  #
  # Hashing the wider region is safe: a pane with an open dialog is BLOCKED, so its
  # contents are static until the dialog is answered.
  echo "DIALOG_KEY=$(hash_of "$(printf '%s\n' "$plain" | tail_content 25)")"
  echo "SENDABLE=no"
  echo "SEND_REFUSAL=input pasted into a pane with an open dialog is DISCARDED, not queued"
  dialog_open=1
else
  echo "DIALOG=none"
  echo "DIALOG_KEY="
  dialog_open=0
fi

# ---- Composer classification --------------------------------------------------
# Dim (SGR-2) text is an AI suggestion. It renders identically to typed input in a
# plain capture. It is furniture and is NEVER a message, however much it reads
# like an authorisation.
# When a dialog is open the "prompt line" is a selection cursor on an option, not
# a composer. Classifying it as typed text produced a spurious COMPOSER=real.
if [ "$dialog_open" -eq 1 ]; then
  echo "COMPOSER=dialog"
  echo "COMPOSER_TEXT="
  composer_real=0
  ln="skip"
else
ln=$(printf '%s\n' "$plain" | grep -nE '❯|›|^[[:space:]]*>([[:space:]]|$)' | tail -1 | cut -d: -f1)
if [ -z "$ln" ]; then
  echo "COMPOSER=unknown"
  echo "COMPOSER_TEXT="
  composer_real=0
else
  prompt_esc=$(printf '%s\n' "$esc" | sed -n "${ln}p")
  visible=$(printf '%s\n' "$plain" | sed -n "${ln}p" | sed -E 's/^[[:space:]]*[❯›>][[:space:]]*//')
  if [ -z "$visible" ]; then
    echo "COMPOSER=empty"; echo "COMPOSER_TEXT="; composer_real=0
  elif printf '%s' "$prompt_esc" | grep -q $'\x1b\[2m'; then
    echo "COMPOSER=ghost"; echo "COMPOSER_TEXT=$visible"; composer_real=0
  else
    echo "COMPOSER=real"; echo "COMPOSER_TEXT=$visible"; composer_real=1
  fi
fi
fi

# ---- Sendability --------------------------------------------------------------
# Two refusal conditions, both learned the hard way:
#   dialog open  -> the paste is silently discarded (TOWER-1 failure 2)
#   composer real-> a human is mid-sentence; a paste lands inside their words
if [ "$dialog_open" -eq 0 ]; then
  if [ "$composer_real" -eq 1 ]; then
    echo "SENDABLE=no"
    echo "SEND_REFUSAL=composer holds non-dim text Tower did not author; do not disturb it"
  else
    echo "SENDABLE=yes"
    echo "SEND_REFUSAL="
  fi
fi

echo "CONTENT_KEY=$(hash_of "$plain")"
echo "STATUS=OK"
exit 0
