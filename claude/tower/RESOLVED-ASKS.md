# RESOLVED-ASKS — asks Tower has VERIFIED answered, with the evidence.
#
# open-asks.sh cannot always see a reply: its REPLY pattern recognises only a Tower marker,
# so an ask answered BY ANOTHER LANE never clears, and a lane that quotes the ask while
# answering it puts the ask text after its own reply.
#
# RETIRING AN ASK IS A DELIBERATE, AUDITABLE ACT. Each entry must name the pane, quote enough
# of the ask to match it, and state the EVIDENCE Tower checked — not "I think it was handled".
# Nothing here clears itself, and a looser heuristic was deliberately NOT used: trading a noisy
# alarm for a silent one is the worse failure.

## dynasty:1.3 — PLEASE REPLY with: (a) the path/line + timestamp + which fin
RETIRED    2026-07-28 12:10 ET
ASK        Claude asked Gemini for the path/line + timestamp + classification of the identity
           finding that was said to be the origin of David's priority.
ANSWERED   Gemini replied in its own pane and recorded the answer durably in today's ledger
           (11:16 ET entry): docs/agent-ledger/2026-07-26.md lines 622-623 (original), 855
           (closeout), 811-816 (relay); 2026-07-26 22:19 / 22:37 ET.
EVIDENCE   Tower did not take the citation on trust. Tower opened 2026-07-26.md and read lines
           620-624 directly: they carry the sleeper_id nested-vs-root defect exactly as claimed.
           Claude independently read the same lines and quoted them in its 11:53 ledger entry,
           and closed the item on its own side.
WHY IT     Gemini quoted the ask as a header immediately before answering it, so the ask text
STUCK      appears AFTER its reply. No heuristic could have separated that from silence.

## 2026-07-30 22:12 — two closeout-check FAILs retired WITH EVIDENCE, not talked past

**FAIL: `dynasty:1.3` holds a REAL STRAND (`[Pasted text #1 +35 lines]`).**
- SENDER: dynasty:1.1, coordinating the crew flush as spokesperson. Not Tower's, not submitted.
- WHY IT IS RETIRED RATHER THAN RE-SENT: the need it carries is ALREADY MET. Tower sent Gemini its
  own closeout order directly (TW30E-CLOSE-15, DELIVERED and marker-verified) precisely because 1.3
  was sitting idle unasked, and **Gemini's postflight is IN today's ledger at 21:46** — read and
  verified by Tower at source, answering both questions plus the league-capture gap.
- Re-sending would produce a SECOND postflight for one lane. The loop was closed to the sender.
- Tower did NOT press Enter on it. It dies with the session, which David is rotating within minutes.

**FAIL: `dynasty:1.2` open ask — "PLEASE REPLY with (a) your postflight appended to today's ledger".**
- FALSE POSITIVE, and the evidence is durable: **Codex's postflight is in today's ledger at 21:47**
  (`TW30E-FLUSH-14 postflight, closed — parked`), read in full by Tower. It answers both questions,
  names every parked item with its gate, and declares zero background processes.
- The sweep flags the REQUEST text still visible in the pane; it cannot see that the ANSWER went to
  the ledger rather than back up the wire. That is the correct conservative behaviour for the tool.

**Both FAILs are therefore STALE, not open.** Recorded here rather than dismissed, because the
alternative to a noisy gate must never be a quiet one.

**NOT retired, and it is real:** the crew→Tower wire is broken (`pane_claim_lost`,
`wire_body_mismatch` all evening). Both of tonight's stranded/failed deliveries are symptoms of it.
