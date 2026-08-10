# dg-cockpit

Everything needed to raise David's Dynasty Genius cockpit on any Mac: the flight deck
script, tmux config, `dg-*` aliases, Tower's charter, Claude's persistent memory,
Studio's entire world (persona, DAVID.md, proposals), agent CLI configs, and the
launchd job definitions.

**The three-copy model:**
- Product code → `github.com/davidtleess/dynasty-genius`
- Irreplaceable data → `gs://dynasty-genius-backup-dtl` (daily 10:15 launchd job)
- The cockpit itself → this repo (nightly 22:00 auto-backup via launchd)

**Migrate to a new Mac:** see the prereqs at the top of `bootstrap.sh`, then run it.

**Secrets are never stored here.** `claude/settings.sanitized.json` has the `env`
block stripped. On a new machine, generate a NEW GitHub PAT and re-add it; never
reuse or commit the old one. Sleeper env vars are re-entered by hand.

Manual backup anytime: `./backup.sh`

## Autonomy Layer

The cockpit includes a safe goal-to-gate [Dynasty Autonomy Layer](autonomy/README.md). Claude and Codex route engineering work through their installed Superpowers capabilities; Gemini uses the pinned, repaired ASW backend. All three install native PreToolUse guardrails and stop at the human gate, with each host's sandbox and permission engine remaining the final enforcement boundary.

Tower remains health-only and does not orchestrate or edit product code. Studio remains independent and receives no autonomy, ASW, or crew plugin.
