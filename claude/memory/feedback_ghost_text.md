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
