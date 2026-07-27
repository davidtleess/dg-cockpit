#!/bin/bash
# pane-approve.sh <pane> <digit> — press a numbered option on an approval dialog,
# safely. Re-checks the dialog IMMEDIATELY before the keystroke and inspects the
# composer immediately after.
#
# TOWER-1 failure 3: on 2026-07-25 an approval keystroke was sent after the dialog
# had already closed, so the digit landed in the composer as literal text. Twice.
# Left in place it would have been submitted to an agent as a meaningless message.
# The window between "I saw a dialog" and "I pressed a key" is the whole bug.
#
# Exit: 0 approved | 4 REFUSED (no dialog / gate-shaped) | 5 CONTAMINATED | 3 CANNOT_VERIFY
set -u

here="$(cd "$(dirname "$0")" && pwd)"
pane="${1:?usage: pane-approve.sh <pane> <digit>}"
digit="${2:?usage: pane-approve.sh <pane> <digit>}"

# tail_content <N> — the last N lines that CONTAIN something, ignoring the blank
# padding rows tmux returns for an unfilled pane. Plain `tail -N` counts those
# blanks and can slice the top off a dialog that is not flush to the bottom,
# silently inspecting the wrong text (found 2026-07-26).
tail_content() {
  awk -v n="$1" '{a[NR]=$0}
    END{ last=0; for(i=NR;i>=1;i--) if(a[i] ~ /[^[:space:]]/){last=i;break}
         if(last==0) exit; s=last-n+1; if(s<1)s=1; for(i=s;i<=last;i++) print a[i] }'
}

verdict() { echo "VERDICT=$1"; echo "REASON=$2"; exit "$3"; }
case "$digit" in [1-9]) ;; *) verdict CANNOT_VERIFY "option must be a single digit 1-9" 3 ;; esac
[ -x "$here/pane-state.sh" ] || verdict CANNOT_VERIFY "pane-state.sh missing" 3

before=$("$here/pane-state.sh" "$pane") || verdict CANNOT_VERIFY "cannot establish state for $pane" 3
gb() { printf '%s\n' "$before" | grep "^$1=" | head -1 | cut -d= -f2-; }
[ "$(gb STATUS)" = "OK" ] || verdict CANNOT_VERIFY "$(gb REASON)" 3
[ "$(gb DIALOG)" = "open" ] || verdict REFUSED "no dialog is open on $pane right now; a keystroke would land in the composer as literal text" 4
key_before="$(gb DIALOG_KEY)"

# ---- Gate-shaped prompts are David's, never Tower's --------------------------
# Tower's delegated authority covers only commands that are plainly a step of work
# David already ordered. These never qualify, regardless of context.
# Line wrapping defeats naive matching: on 2026-07-26 a Gemini dialog rendered
# "(Persist to\nsettings.json)" across two rows and the phrase went undetected.
# Match against a whitespace-collapsed single line as well as the raw rows.
prompt=$(tmux capture-pane -t "$pane" -p 2>/dev/null | tail_content 25)

# Judge the COMMAND plus ONLY THE OPTION BEING CHOSEN — never the whole menu.
# Reading the whole menu refused harmless choices because a *different* option on
# screen was dangerous (e.g. an unchosen "Persist to settings.json"), which
# blocked routine work on 2026-07-26. Falls back to the whole prompt if the menu
# cannot be parsed, so an unparseable dialog still fails safe.
ctx=$(printf '%s\n' "$prompt" | awk '
  { t=$0; sub(/^[[:space:]]+/,"",t); sub(/^[^0-9[:space:]]+[[:space:]]+/,"",t)
    if (t ~ /^[0-9]+\./) exit; print }')
optblk=$(printf '%s\n' "$prompt" | awk -v d="$digit" '
  BEGIN{ inopt=0; seen=0 }
  { t=$0; sub(/^[[:space:]]+/,"",t); sub(/^[^0-9[:space:]]+[[:space:]]+/,"",t)
    if (t ~ /^[0-9]+\./) { seen=1; n=t; sub(/\..*$/,"",n); inopt=((n+0)==(d+0))?1:0 }
    if (inopt) print }
  END{ if (!seen) exit 9 }')
if [ $? -eq 9 ] || [ -z "$optblk" ]; then
  scope=$(printf '%s' "$prompt" | tr '\n' ' ' | tr -s ' ')
  scope_note="whole prompt (option menu could not be parsed — failing safe)"
else
  scope=$(printf '%s\n%s' "$ctx" "$optblk" | tr '\n' ' ' | tr -s ' ')
  scope_note="the command plus option $digit only"
fi

if printf '%s' "$scope" | grep -qiE 'git (push|commit)|rm -rf|launchctl|crontab|delete|force|--hard|npm publish|gh (pr|release) create|persist to settings'; then
  echo "VERDICT=REFUSED"
  echo "REASON=GATE-SHAPED (push / commit / delete / schedule / persisted settings) within $scope_note. Not Tower's to approve under any standing authority. Take it to David."
  printf '%s' "$scope" | grep -oiE 'git (push|commit)|rm -rf|launchctl|crontab|delete|force|--hard|npm publish|gh (pr|release) create|persist to settings' | head -3
  exit 4
fi

# ---- Re-verify the dialog is STILL open, then press within the same breath ----
recheck=$("$here/pane-state.sh" "$pane") || verdict CANNOT_VERIFY "state lost during re-check" 3
gr() { printf '%s\n' "$recheck" | grep "^$1=" | head -1 | cut -d= -f2-; }
[ "$(gr DIALOG)" = "open" ] || verdict REFUSED "the dialog closed between check and keypress — this is exactly the race that put stray digits in composers on 2026-07-25. Nothing was sent." 4
[ "$(gr DIALOG_KEY)" = "$key_before" ] || verdict REFUSED "the prompt CHANGED between check and keypress (was $key_before, now $(gr DIALOG_KEY)). Refusing: you would be answering a different question than the one you read." 4

tmux send-keys -t "$pane" "$digit" 2>/dev/null || verdict CANNOT_VERIFY "send-keys failed" 3
sleep 2

# ---- Did the digit land as literal text? --------------------------------------
after=$("$here/pane-state.sh" "$pane") || verdict CANNOT_VERIFY "cannot establish post-keystroke state" 3
ga() { printf '%s\n' "$after" | grep "^$1=" | head -1 | cut -d= -f2-; }
ctext="$(ga COMPOSER_TEXT)"
if [ "$(ga COMPOSER)" = "real" ] && [ "$ctext" = "$digit" ]; then
  echo "VERDICT=CONTAMINATED"
  echo "REASON=the digit '$digit' is now sitting in $pane's composer as literal text — the dialog closed before the keystroke arrived."
  echo "REMEDY=Tower authored this keystroke, so Tower may remove it: tmux send-keys -t $pane C-u   (do NOT press Enter)"
  exit 5
fi

if [ "$(ga DIALOG)" = "open" ] && [ "$(ga DIALOG_KEY)" = "$key_before" ]; then
  verdict CANNOT_VERIFY "the same prompt is still open after the keystroke; approval may not have registered" 3
fi

echo "VERDICT=APPROVED"
echo "REASON=option $digit sent to $pane; the prompt is no longer present and no stray text entered the composer"
exit 0
