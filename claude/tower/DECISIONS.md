# TOWER DECISION LOG
# Every Tower ruling, one line, WITH THE AUTHORITY IT RESTS ON.
# Purpose: make drift into David's territory VISIBLE. A decision with no authority column
# is a decision Tower should not have made. Reviewed at closeout; carried in the handoff.
#
# AUTHORITY VOCABULARY (nothing else is valid):
#   DAVID-WORD      — he said it, quote it
#   DAVID-STANDING  — a prior ruling of his still in force (cite date)
#   DELEGATED-1     — in-scope permission approval (never push/delete/commit/schedule/cross-lane/network-write/new-work)
#   TRAFFIC         — sequencing, routing, who-reviews-what. Tower's job, no product judgment.
#   HELD            — Tower explicitly declined to decide and parked it for David
#
# 2026-07-27
| time  | decision                                                            | authority     |
|-------|---------------------------------------------------------------------|---------------|
| 07:55 | Woke the cockpit, ordered the morning brief                         | DAVID-STANDING (boot ritual) |
| 08:1x | Answered 4 of Claude's 5 asks myself; escalated only the commit word| TRAFFIC       |
| 08:1x | Sequenced DGX-02 first, S0-01 review in parallel                    | DAVID-STANDING (07-26 "first in line") |
| 08:1x | Routed S0-01 review to Codex holding the answer key                 | TRAFFIC       |
| 08:2x | ~20 in-scope permission approvals across four panes                 | DELEGATED-1   |
| 09:xx | Ordered NumPy ticket queued third; parked .agents/skills gap        | TRAFFIC       |
| 19:4x | Declined to override my own launchd guard; escalated to David       | DAVID-STANDING (charter: schedule/launchd is his) |
| 19:5x | Ruled the wire-chip defect on the Gemini profile stays UNFIXED      | DAVID-STANDING (07-26 all wire engineering cancelled) |
| 20:0x | Relayed conditional commit word; sequenced fold-in -> r2 -> commit  | DAVID-WORD ("fold it in now, commit once Codex clears") |
| 20:4x | Resumed S0-01 repair after DGX-02 closed                            | DAVID-WORD ("drive workflow") + standing a-g order |
| 21:0x | Authorised Claude to record verified state in the ledger            | TRAFFIC (recording is not new work) |
| 21:xx | Did NOT submit Codex's 68-line strand in Claude's composer          | DAVID-STANDING (07-21 sender owns delivery) |
| 21:xx | DID submit my own stranded TW27G                                    | DAVID-STANDING (Tower owns Tower's delivery) |
| all   | Held: crosswalk-into-backup · drill guard · identity priority · Studio Q | HELD     |
#
# ⚠ RECORDED ERROR, same day: at 19:5x Tower stated the measured bucket pointer to Codex and
# then asked it to re-derive independently. That is contamination. Codex's agreement on that
# point is CORROBORATION, not independent reproduction, and is recorded as such. The
# presend-check.sh gate now flags this shape before send.

# 2026-07-28
| time  | decision                                                            | authority     |
|-------|---------------------------------------------------------------------|---------------|
| 00:2x | Declined the MERGE half of David's offered authority                | TRAFFIC (verified: no open PRs, no merges in flow, 5 stale branches = real risk) |
| 00:2x | Approved `git push` main->origin/main via --closeout-push           | DAVID-STANDING (2026-07-28 closeout push, charter edit) |
| 00:2x | Verified all 5 commits present on origin/main by `branch -r --contains` | DAVID-STANDING (charter: verify, never trust exit code) |
| 08:0x | Approved the terminal postflight COMMIT under closeout authority       | DAVID-WORD ("commit and push it all" + "lets make Close out a REAL FULL Close out") |
| 08:0x | NOTE: the --closeout-push flag also relaxes `git commit`. Broader than the charter text, which grants PUSH only. FLAGGED FOR DAVID — either narrow the flag or widen the charter line. Not left silent. | HELD |
| 08:1x | 2nd use of --closeout-push on a READ-ONLY grep falsely refused by the guard (scope bleed from a prior git command in the captured context). Strengthens the case: the flag is doing work its name does not describe. NARROW IT OR RENAME IT. | HELD — flagged to David |
| 08:2x | Pushed 127f07f + 67bd75f (closeout postflight + corrections) main->origin/main | DAVID-STANDING (2026-07-28 closeout push, charter edit) — verified both ON REMOTE by branch -r --contains |
| 08:3x | Resolved 6 parked packets with consumption evidence in RESOLVED-PACKETS.md | TRAFFIC — evidence is recipient ACTION, never Tower pointing at a path |
| 08:3x | KNOWN VERIFIER DEFECT, not fixed during a closeout: open-asks.sh reads HISTORICAL pane text, so a resolved ask still flags. Manually cleared with evidence tonight. Fix tomorrow; do not defang. | HELD |
| 08:5x | Fixed backup.sh silent push: fails loudly + verifies presence on origin/main | DAVID-WORD ("fix the silent push") |
| 08:5x | Ran cockpit backup; verified 24/24 Tower files byte-identical + on remote     | DAVID-WORD ("back up the cockpit at every closeout") |
| 08:5x | Charter + skill amended: cockpit backup is now a STEP of every closeout        | DAVID-WORD (standing) |

## 2026-07-28 08:57 — hold the crew's morning-brief wake
RULING     Did NOT send the boot-ritual "run your bootstrap and deliver the morning brief" to pane 1.1.
WHY        The session closed at 08:45; David reopened at 08:52. The panes are the SAME processes with
           their closeout context intact — a bootstrap re-brief would re-emit what he read 10 minutes ago
           and spend crew context for nothing. Lanes verified at rest; open-asks CLEAN.
PLAN       Wake the lane David names the moment he sequences the first job.
AUTHORITY  TRAFFIC

## 2026-07-28 09:02 — identity ordered as the named priority; scope-only, no build
RULING     Relayed David's "start with identity" to pane 1.1 as a SCOPE-ONLY order: bring David a board,
           do not begin repair. Sequenced the failing Codex Compliance Audit workflow and DG2-S0-01 (d)
           as PARKED behind it. Closed the loop to Gemini, whose finding originated the priority.
WHY        David named the priority; he did not authorise building. Scoping is the step that gives him
           the gate. Sequencing two items behind an explicit "start with identity" is traffic.
NOTE       Tower's three verified facts about the crosswalk file were handed over labelled CLAIMS TO
           TEST with "your measurement wins" — so any agreement is corroboration, not independence,
           and the lane was told so up front.
AUTHORITY  DAVID-WORD (2026-07-28 "start with identity") + TRAFFIC for the sequencing

## 2026-07-28 09:35 — TOWER-3: the watch must be running, and "clear" is a measured verdict
TRIGGER    David: "can you not see gemini needs approval on something?" then "fix it so Tower
           doesn't miss things like this in this session or future sessions."
FINDING    The Part II watchers were NOT RUNNING. Nothing started them at boot and nothing
           detected their absence. Tower issued "nothing needs you" from a 2-minute-old snapshot.
BUILT      bin/watchdog.sh (starts + PROVES watcher liveness; idempotent; --hook self-gates to
           Tower's pane by title) · bin/say-clear.sh (the gate before the words clear/quiet/at
           rest/nothing needs you/safe to walk away) · SessionStart hook in ~/.claude/settings.json
           · persistent Monitor on the watcher logs · SKILL.md Part IV · backup.sh now covers
           ~/.claude/hooks/ (the hook SCRIPTS existed on one machine only).
PROOF      say-clear.sh's first live run immediately caught 2 open dialogs and an unanswered Codex
           ask that Tower — minutes after being corrected — was still about to miss.
LIMIT NAMED ~/.claude/notification-hook.log covers Claude Code panes ONLY. Gemini and Codex never
           appear in it. The lane David caught was Gemini. pane-watch.sh remains the only
           all-four-lane feed.
AUTHORITY  DAVID-WORD (2026-07-28 "fix it so Tower doesn't miss things like this") ·
           DAVID-STANDING (2026-07-28 backup coverage) for the backup.sh change
PROPOSED, NOT TAKEN — needs David's charter word:
           "Tower may not tell David the cockpit is clear, quiet, at rest, or that nothing needs
           him without a passing say-clear.sh. Unverified is never rounded up to clear."
           Written as METHOD in the skill; NOT written into the charter, because charter edits
           are David's word and Tower does not author its own law.

## 2026-07-28 09:33 — Studio woken into its standing licence (watcher-triggered)
TRIGGER    pane-watch STALL on dynasty:2.1 (316s idle). Verified from DISK, not the pane: Studio's
           last write was its 07:54 closeout; nothing since; not blocked, composer empty.
RULING     Woke Studio with its standing self-directed licence ONLY — no roadmap, no task list, no
           crew content. Told it its tier-ladder question is parked with Tower for David, not lost.
WHY        "Blocked-idle is the waste. Rest is fine." Studio was idle because nobody had spoken to
           it this session — the exact waiting-to-be-relayed pattern the mandate exists to prevent.
AUTHORITY  DAVID-STANDING (2026-07-21 Studio Mandate)
FINDING    The pre-send firewall REFUSED Tower's first draft over its own marker: "TW28" is crew
           ticket vocabulary. Tower's default marker convention was leaking process language into
           Studio's lane on every message. Markers toward 2.1 now carry no crew vocabulary.

## 2026-07-28 09:33 — Tower's own guard is now blocking TWO lanes; NOT self-narrowed
FACTS      Gemini frozen on read-only `launchctl list | grep davidleess` — REFUSED (gate-shaped).
           Claude frozen on writing its own 2026-07-28 ledger entry — REFUSED because the PROSE
           being written contains the word "launchctl". `ctx` in pane-approve.sh is "everything
           above the first numbered option", which in an edit dialog swallows the whole diff.
           A diff body is CONTENT, not a command.
RULING     Tower did NOT narrow its own guard. Both dialogs go to David.
WHY        Narrowing the guard that protects David's gates changes the boundary of Tower's own
           authority. That is his word, not Tower's — even when the guard is demonstrably wrong
           and even when it is blocking the priority he named an hour ago. The designed escape
           hatch for a refusal, false positive or not, is David.
PROPOSED   For an edit/create dialog, judge the TARGET PATH, not the diff body — and refuse
           outright on settings.json / LaunchAgents / .plist / crontab / .git/ / shell rc /
           credentials, which is STRICTER than today's command-shape scan for that dialog class.
           Plus a narrow standing exception for read-only inspection (`launchctl list`, `ls`).
AUTHORITY  HELD — awaiting David

## 2026-07-28 09:37 — full wire stall recorded; Tower carried nothing
STATE      Claude blocked (edit dialog, Tower's guard false-refused it) · Gemini blocked
           (`launchctl list`) · Codex free but its TWO bounded sends refused, both parked, neither
           claimed delivered. Every lane behaved correctly: attempt, park, say where.
RULING     Tower delivered NOTHING and pointed no recipient at a parked path — both recipients have
           OPEN DIALOGS, where a paste is DISCARDED, not queued. Pointing a blocked pane at a file
           is not delivery; it is a lost message with a receipt.
NOTE       Codex parked its message wrappers under /private/tmp (ephemeral). The SUBSTANCE is
           durable at docs/agent-ledger/evidence/2026-07-28/identity_board_codex_challenge_v1.md
           and in today's ledger, so nothing is at risk of being lost — only the wrappers.
CASCADE    3 of 4 lanes idle, 2 packets parked, 1 lane waiting on another lane — ALL of it behind
           two keystrokes that are David's. Cost reported to David once, not repeated.
AUTHORITY  DAVID-STANDING (2026-07-21 wire rule: sender owns delivery)

## 2026-07-28 10:35 — the two guard fixes, BUILT, TESTED, APPLIED
AUTHORITY  DAVID-WORD (2026-07-28 "go ahead with the guard fixes")
FIX A      Edit dialogs are judged by their TARGET, not the diff body. The diff is CONTENT —
           writing "launchctl" into a markdown file does not run it. Gate-shaped TARGETS
           (settings.json, LaunchAgents, .plist, crontab, .git/, shell rc, credentials) are now
           refused ON SIGHT, which is STRICTER than the old command scan for that dialog class.
FIX B      launchctl is an ALLOWLIST, not a blocklist: list/print/dumpstate/blame/examine and
           peers pass; EVERY occurrence must carry a known read-only subcommand or it refuses.
           Bare `launchctl`, unknown subcommands, and a read smuggled ahead of a mutation
           (`launchctl list && launchctl unload …`) all still refuse. load/unload/bootstrap/
           bootout/enable/disable/start/stop/remove/setenv remain David's.
TESTS      tests/guardfix-selftest.sh — 12 cases, every one PAIRED: the wrongly-refused thing must
           now pass AND the thing it protected must still refuse. Suite total now 55 green
           (21 observation · 16 pre-send · 6 open-asks · 12 guard-fix).
THREE BUGS IN THE TEST ITSELF, all found before trusting it, all the day's recurring class:
  1. hardcoded pane :0.0 — David's tmux.conf sets base-index 1, so it addressed NOTHING and
     printed two green lines for guards never exercised.
  2. CANNOT_VERIFY counted as "not refused" — an unreadable pane could produce a PASS.
  3. it judged panes whose content it had not confirmed rendered, producing two false FAILs on
     REAL refusals. Now every case confirms its dialog is on screen before judging.
APPLIED    Gemini 1.3 (launchctl list) and Claude 1.1 (ledger edit) both APPROVED and unblocked
           at 10:35, marker-verified: prompt gone, no stray digit in either composer.

## 2026-07-28 10:47 — TOWER ERROR: relayed an unreviewed claim to David as established fact
WHAT       At 11:05 Tower told David the crosswalk "cannot be re-pinned even in principle" and that
           a re-pull is "unreproducible BY CONSTRUCTION", and used it to sharpen his item-3 decision.
           That was Claude's addition (d), explicitly ROUTED FOR FALSIFICATION and not yet reviewed.
           Codex at 11:18 called that specific claim FALSE: the upstream source revision cannot be
           reconstructed, but the extant payload hashes to 8ed4b675…f593 and is preservable now.
WHY IT MATTERS  Tower had told David TWENTY MINUTES EARLIER to treat unreviewed lane claims as reads,
           then broke its own rule the moment a finding was decision-shaped and exciting. Same species
           as the "frozen model" claim retracted on 2026-07-27.
NET        The RECOMMENDATION (commit the frozen snapshot) is unchanged and still correct — but it
           now rests on a true reason instead of an overstated one.
CORRECTED  To David directly, and to Claude, which was told this is Tower's reporting error and not
           a criticism of its routing.
RULE       An unreviewed lane finding reaches David LABELLED as unreviewed, or it does not reach him.
AUTHORITY  n/a — failure record
STAMP FIX  This entry was first written stamped 11:20. That time was copied from the crew's ledger
           headers, which run ~25-30 min AHEAD of the machine clock (see the clock-drift entry
           below). Corrected to the real wall-clock time. Tower must stamp from `date`, never from
           another lane's header.


## 2026-07-28 10:53 — CLOCK DRIFT in the system of record
MEASURED   Machine clock 10:52:51 EDT. Today's ledger's newest header claims `## 11:18 ET`; the
           file's own mtime is 10:46. Claude and Codex are stamping entries ~25-30 minutes into
           the FUTURE. Gemini's 10:33 header is plausible.
WHY IT MATTERS  The ledger is the durable record AND the primary source Tower rebuilds the board
           from. Wrong stamps corrupt sequencing, and Tower already copied one into its own
           DECISIONS.md (corrected above). Any later reconstruction of "what happened when" —
           including an incident review — inherits the error.
NOT        user-facing, not urgent, no product impact.
ACTION     Told the spokesperson. One line to David; not belaboured.
AUTHORITY  TRAFFIC

## 2026-07-28 10:58 — DEFECT IN TOWER'S OWN DELIVERY VERIFIER (false DELIVERED)
FOUND      pane-send.sh returned `VERDICT=DELIVERED — marker found in transcript` for TW28-CLOCK-1,
           while that message was in fact sitting UNSUBMITTED in Claude's composer. Discovered only
           because the NEXT send was REFUSED for a composer strand — and the strand was Tower's own
           previous "delivered" message, quoted verbatim.
CAUSE      Verification searches the whole capture buffer with `-S -`, which INCLUDES the composer
           region. Text a lane has not yet received therefore satisfies the marker check. This is
           the exact inverse of the rule the skill already enforces ("an empty composer is not proof
           of delivery"): a marker ON SCREEN is not proof either, if it is on screen in the composer.
IMPACT     Any DELIVERED verdict where the marker was still in the composer is UNSAFE. Sends whose
           history grew (Codex 1940->1965, 1868->1890) are corroborated by the line growth. Pane 1.1
           runs ALTERNATE_SCREEN=1 so its history never grows — the one pane where the delta signal
           is unavailable is the pane where this bit.
ACTION     Tower submitted its OWN stranded message (a legal unblock form; the text was verified
           verbatim Tower's before pressing Enter), then re-sent and confirmed David's authorisation
           visually ABOVE the composer, not by marker alone.
FIX NOT YET WRITTEN — the verifier must exclude the composer region before matching. Not attempted
           mid-flight while carrying David's word; queued as the next Tower-tooling job.
REPORTED   To David.
AUTHORITY  n/a — defect record

## 2026-07-28 11:16 — TOWER ERROR: relayed inherited provenance as fact
WHAT       Tower told David this morning that the identity problem was Gemini's find, and used it
           to frame the whole priority. Gemini's own record, asked directly, says there is NO such
           general identity-layer finding — the origin was the DG2-S0-01 fixture-shape mismatch.
SOURCE     The claim came from the INHERITED cockpit_handoff.md, not from any lane's record.
           Tower never checked it before repeating it, and it shaped David's first decision of
           the day.
NET        The decision was RIGHT — everything it rests on was independently measured today. Only
           the attribution was wrong. Corrected to David and to Gemini, which was explicitly told
           its record wins over Tower's description.
RULE       The handoff file is INHERITED CLAIM, not verified fact — a lead to check, never a
           source. The board law's "Tower's own earlier statements are never a source" now
           explicitly extends to the PREVIOUS Tower's.
AUTHORITY  n/a — failure record

## 2026-07-28 11:30 — false-DELIVERED defect FIXED and tested
FIX        pane-send.sh now excludes the composer from delivery verification, cut with tmux's own
           row coordinates (-S - -E <row above cursor>) rather than by counting lines across two
           captures — `-p` pads with trailing blanks and `-p -S -` does not, and the counting
           version silently left the composer in place. Falls back to the whole buffer when the
           composer cannot be located, so the earlier depth fix is not regressed.
PLUS       A stuck paste is detected and Enter retried ONCE, bounded at 2 attempts. Legal: the
           marker is required in the body before sending, so the text is provably Tower's own.
TESTS      tests/send-composer-selftest.sh — 5 cases, paired. Suite total now 60 green
           (21 observation · 16 pre-send · 6 open-asks · 12 guard-fix · 5 send-composer).
TWO TEST BUGS FOUND FIRST, both the day's recurring class:
           1. simulated the composer by typing at a shell prompt — the shell prefixes its own
              prompt so the cursor is never at line start and the heuristic never fires;
           2. planted the marker inside the command it ran, so the shell's echo put the needle
              into the scrollback being searched, FAILING A FIX THAT ALREADY WORKED.
AUTHORITY  DAVID-WORD (2026-07-28 "fix it so Tower doesn't miss things like this") — same duty;
           reported to David as queued before it was started.
