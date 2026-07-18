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
