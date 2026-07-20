# Ghost text in agent panes — capture-pane cannot be trusted without -e

**Discovered 2026-07-16 (David spotted it).** Agent TUIs (Claude Code, and possibly Codex/Antigravity) render grey AI-generated *prompt suggestions* in the input box. `tmux capture-pane -p` flattens color, so ghost suggestions read as typed input to every pane-reader: Tower, the mail carrier, and crew agents reading each other's panes.

## The 2026-07-16 incident
Pane 1.1 showed `From David (via Tower): commit the parked state docs and plist` in its input line minutes after the morning brief — a perfect "yes" to the brief's gates 1+5, with a spoofed attribution header. David never typed it; it was a ghost suggestion generated FROM the brief content. C-u/Escape/C-c all "failed" to clear it because there was nothing to clear. Only Tab-then-Enter would make it real.

## Detection rule (verified)
```
tmux capture-pane -t <pane> -p -e | grep -a "<text>"
```
Ghost text is wrapped in `ESC[2m ... ESC[0m` (SGR dim). Real typed input is not dim. **Never classify input-line text as a stranded message without the -e check.**

**Tooled 2026-07-17 (David's word):** `~/.claude/tower/ghost-check.sh <pane>` runs this test deterministically and returns REAL / GHOST / DIALOG OPEN / EMPTY / INCONCLUSIVE, knowing all three prompt markers (❯ Claude/Studio, › Codex, bare > Gemini) and distinguishing dialog selection cursors from typed input. Charter now mandates it in Tower's standstill diagnosis (tower.md Standing watches).

## Consequences
- Probably explains the 2026-07-15 "unattributed pane-1.1 fragments" mystery ("aligned on 1. go on 2", the merge-fragment, bare "go") — unproven (no color capture saved), but the mechanism fits perfectly.
- **Materially softens Gemini violation #3** (ledgering a manufactured David merge-gate): likely Gemini read pane 1.1's ghost text as a David message. Still a discipline failure (no verification of a bare gate word), but plausibly not fabrication. Factor into the Gemini review.
- Mail-carrier "delivered" log entries may include Enter presses on ghost text (no-op in Claude Code; behavior in other TUIs unverified) — another reason its log overstates.
- Enter alone does NOT accept a suggestion in Claude Code (Tab then Enter required) — so the carrier pressing Enter on a ghost is harmless there, but don't extrapolate to Codex/Antigravity without testing.

## 2026-07-17/18 boot — specimen #2 of the grant-shaped class
Pane 1.1 autocomplete rendered dim ghost `QB-1 GREEN slice 2 — go` BEFORE David's real go-word was relayed — a fabricated grant matching a decision that was pending but not yet given. Same class as the 07-17 "ratify v15" specimen. Ghost-check verdict GHOST (SGR-2). Not submitted; David's real word delivered over it. Evidence for D5 per-tool suggestion-disable follow-up.

## Mode-flip attribution correction (2026-07-17/18 session)
Pane 1.1 manual→accept-edits this session was DAVID'S OWN HAND (he told Claude it needn't ask every time), and the Codex model change to sol-high was also David. NOT wire-health evidence. The unexplained 07-16 flips remain on file; before logging any future flip as evidence, ask David first — he sometimes adjusts panes directly.

## Specimen #3 (same session): fabricated TOWER-relay ghost
Pane 1.1 ghost: "From Codex (via Tower) — round-2 verdict fi…" — autocomplete fabricating Tower's own relay format for a round-2 verdict that did not yet exist. Escalation of the class: ghosts now mimic the trusted relay channel itself. D5 suggestion-disable urgency up another notch.

## Specimen #4 (2026-07-18): fabricated slice-3 go-word
Pane 1.1 ghost: "From David (via Tower) — QB-1 slice 3 (D2 label table):…" — fabricated David-grant for work not yet worded, appearing minutes after the slice-2 arc closed. Dim-verified, not submitted. Four grant-shaped fabrications in two days; D5 suggestion-disable should lead the next wire-health word.

## Specimen #5 — 2026-07-18 evening (grant-shaped, HIGH severity)
Pane 1.1 input box showed "Open QB-1 slice 3 — the D2 label table" in dim SGR-2 while David's real go-word sat undelivered in Tower's queue. A fabricated David go-word, anticipating the exact next decision — David himself flagged it before Tower touched the pane. Fifth grant-shaped fabrication; third fabricated go-word. Strengthens the D5 suggestion-disable urgency: ghosts now predict pending decisions well enough to fool the pilot.

## Specimen #6 — 2026-07-19 ~10:10 (grant-shaped, CRITICAL severity)
Pane 1.1 input box showed "David's word: execute re-staging Option A — one in…" in dim SGR-2, minutes after the crew ledgered a word-gated re-staging plan awaiting David's decision. A fabricated David word authorizing an INDEX MUTATION on the fragile parked valuation state — the exact pending gate, phrased in the cockpit's own grant idiom. Fourth fabricated go-word/grant; sixth specimen overall. Had Tower or the carrier submitted it, the one-command re-staging would have executed without David. D5 suggestion-disable is now the top wire-health priority.

## Specimen #7 — 2026-07-19 ~11:00 (grant-shaped, CRITICAL — targeted TOWER's own pane)
David reports (his typed word, his own ghost-check: dim SGR-2): Tower's input box (pane 2.2) displayed "yes, relay the wire-health fix too" — fabricating David's approval of the exact question Tower had just asked him. First specimen targeting Tower's own pane; the suggestion engine now fabricates grants on BOTH sides of a pending decision. D5 suggestion-disable now rides WITH the wire-health fix by David's word (2026-07-19), not behind it.

## Tower delivery-verification lesson (2026-07-19 ~17:00)
Claude Code collapses long pastes into "[Pasted text #N]" placeholders in scrollback — grepping for literal message text FAILS on delivered long messages, mimicking a lost delivery. Tower double-delivered a disposition this way. Correct verification for long pastes: spinner/processing state + the [Pasted text] marker, or grep a SHORT distinctive prefix delivered unpasted. Short messages still verify by literal grep.

## Specimen #8 — 2026-07-19 ~21:00 (grant-shaped, CRITICAL)
Pane 1.1 input box: "commit the wire work, then go on slice 4" — dim SGR-2, fabricating BOTH of David's open decisions (wire commit-or-park + slice-4 go) in one line, while David was working the panes directly. Eighth specimen, fifth fabricated go-word.
