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
# --closeout-push : David's charter edit 2026-07-28. Tower may approve a `git push` ONLY
# during a closeout David ordered, only for commits already made under his word, only
# main->origin/main fast-forward, and must verify presence on the remote afterwards.
# Requires Tower to assert the authority deliberately; the plain form still refuses pushes.
CLOSEOUT_PUSH=0
if [ "${1:-}" = "--closeout-push" ]; then CLOSEOUT_PUSH=1; shift; fi
pane="${1:?usage: pane-approve.sh [--closeout-push] <pane> <digit>}"
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
# ---- FIX A (David's word, 2026-07-28) — edit dialogs: judge WHERE it writes ----
# A file-edit dialog renders the whole DIFF above the option menu, and `ctx` below is
# "everything above the first numbered option" — so the diff was being scanned as if
# it were a command. On 2026-07-28 this refused Claude's own ledger entry because the
# PROSE contained the word "launchctl", freezing David's named priority for an hour.
# A diff body is CONTENT: writing "launchctl" into a markdown file does not run it.
# The real risk in an edit dialog is its TARGET, and that is judged STRICTLY here —
# stricter than the command scan, because these paths are refused on sight.
edit_q=$(printf '%s\n' "$prompt" \
  | grep -iE 'Do you want to (make this edit to|create|write to|overwrite|update) ' | tail -1)
if [ -n "$edit_q" ]; then
  if printf '%s' "$edit_q" | grep -qiE 'settings\.json|settings\.local\.json|LaunchAgents|\.plist|crontab|/\.git/|\.gitconfig|\.zshrc|\.bash_profile|\.bashrc|\.profile|authorized_keys|\.env|id_rsa|\.netrc|credentials'; then
    echo "VERDICT=REFUSED"
    echo "REASON=GATE-SHAPED EDIT TARGET — this dialog writes to persisted settings, a scheduled job, shell config or credentials. Not Tower's under any standing authority. Take it to David."
    printf '%s\n' "$edit_q"
    exit 4
  fi
fi

ctx=$(printf '%s\n' "$prompt" | awk '
  { t=$0; sub(/^[[:space:]]+/,"",t); sub(/^[^0-9[:space:]]+[[:space:]]+/,"",t)
    if (t ~ /^[0-9]+\./) exit; print }')
# For an edit dialog the question line ALONE is the command context. The diff above it
# is content and must never be scanned for command shapes.
[ -n "$edit_q" ] && ctx="$edit_q"
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

# Under --closeout-push, a plain `git push` is permitted; force/non-ff/other-branch never is.
# ---- FIX B (David's word, 2026-07-28) — launchctl: reads are not schedule changes ----
# A bare `launchctl` token used to refuse everything, which froze Gemini three times on
# `launchctl list` — a command that changes nothing and is its telemetry job. This is an
# ALLOWLIST, never a blocklist: EVERY launchctl occurrence in scope must carry a known
# read-only subcommand. `launchctl` with no subcommand, or with one not on this list,
# is still refused — so load / unload / bootstrap / bootout / enable / disable / start /
# stop / remove / setenv all remain David's, and so does anything new that appears later.
# ---- CREDENTIAL PATHS: reading one is not Tower's to approve either ----------
# Added 2026-07-28. Tower approved `cat ~/.databrickscfg` without thinking about what the
# file was. That file turned out to hold no secret, so nothing was exposed — but the guard
# had a real hole: it refused EDITS to credential files and said nothing about READS, and
# Tower filled the gap with inattention. A read puts the contents into a transcript, which
# is a wider audience than the file had a moment earlier.
# Deliberately broad and deliberately not clever: ANY command naming one of these paths is
# David's, whatever it intends to do with it.
cred_re='\.databrickscfg|\.netrc|\.npmrc|\.pypirc|id_rsa|id_ed25519|\.aws/credentials|\.ssh/|authorized_keys|\.env($|[^a-zA-Z])|credentials\.json|service.account|\.pem($|[^a-zA-Z])|keychain|secrets?\.(json|ya?ml|toml|txt)'
if printf '%s' "$scope" | grep -qiE "$cred_re"; then
  echo "VERDICT=REFUSED"
  echo "REASON=CREDENTIAL PATH — this command names a credentials or key file. Reading one copies it into a transcript; Tower does not approve that under any standing authority. Take it to David."
  printf '%s' "$scope" | grep -oiE "$cred_re" | head -3
  exit 4
fi

lc_ro='list|print|print-cache|print-disabled|dumpstate|dumpjpcategory|blame|examine|managername|manageruid|managerpid|getenv|version|help'
if printf '%s' "$scope" | grep -oiE 'launchctl[[:space:]]*[a-z-]*' \
   | grep -qivE "^launchctl[[:space:]]+($lc_ro)$"; then
  echo "VERDICT=REFUSED"
  echo "REASON=GATE-SHAPED: a launchctl invocation here is not a known read-only subcommand. Loading, unloading, enabling, disabling, starting or stopping a scheduled job is David's. Take it to David."
  printf '%s' "$scope" | grep -oiE 'launchctl[[:space:]]*[a-z-]*' | head -3
  exit 4
fi

# `force` is WORD-BOUNDED and `delete` likewise. Substring matching refused a read-only
# closeout verifier at 16:48 on 2026-07-28 because its output contains the word "ENFORCE".
# This narrows nothing that was ever meant to be caught: `--force`, a standalone `force`,
# and `delete` as a word all still refuse. A guard that fires on a substring inside an
# unrelated word teaches Tower to route around it, which is how guards die.
gate_re='git (push|commit)|git branch +(-[dDm]|--delete)|git tag +(-d|--delete)|git remote +(remove|rm)|rm -rf|crontab|\bdelete\b|\bforce\b|--force|--hard|npm publish|gh (pr|release) create|persist to settings'
if [ "$CLOSEOUT_PUSH" = 1 ]; then
  if printf '%s' "$scope" | grep -qiE '\-\-force|\+refs/|--hard|rm -rf|delete|persist to settings|gh (pr|release) create'; then
    echo "VERDICT=REFUSED"
    echo "REASON=closeout-push authority does NOT cover force pushes, deletions, refspec overrides or settings changes. David's."
    exit 4
  fi
  gate_re='rm -rf|crontab|npm publish|persist to settings'
  echo "NOTE=closeout-push authority asserted (charter 2026-07-28). Verify commits on the remote afterwards and log it in DECISIONS.md."
fi
if printf '%s' "$scope" | grep -qiE "$gate_re"; then
  echo "VERDICT=REFUSED"
  echo "REASON=GATE-SHAPED (push / commit / delete / schedule / persisted settings) within $scope_note. Not Tower's to approve under any standing authority. Take it to David."
  printf '%s' "$scope" | grep -oiE "$gate_re" | head -3
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
