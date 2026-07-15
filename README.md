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
