# Tooling survey for the crew — helper session, 2026-08-15

David asked: "look at the tools and plugins and connectors on this machine - what does the crew
need?" Measured inventory, then ranked gaps. Verdict: tool-rich; the gap is the wire to David.

## Ranked recommendations (David has seen these; none yet authorized except as noted)
1. **"Needs David" notification wire — BUILD CANDIDATE.** Gates park, judges STOP, releases
   wait — silently. macOS banners fire only on Claude-pane permission dialogs
   (`PermissionRequest` hook → notification-hook.log). Add a push/banner on the stop-hook path
   when a run goes terminal or ADJUDICATION fires: "parked for David: <reason>". The single
   biggest overnight-autonomy multiplier. AWAITING DAVID'S WORD.
2. **Remove `magic` MCP from `dynasty-genius-product/.mcp.json`.** `@21st-dev/magic@latest` via
   npx on every crew launch — UI generator, but front-end is under David's HOLD (Phase 12).
   Unpinned internet fetch + startup cost for a forbidden tool. Restore pinned at front-end phase.
3. **Scope `facebook-marketplace` MCP out of crew sessions.** Registered globally in
   `~/.claude.json`; the engineering lanes carry a car-shopping toolset. Move to a BMW project dir.
4. **`brew install ripgrep`.** System `rg` missing; Claude Code and Codex vendor their own,
   masking it until a shell script/hook calls `rg` and fails confusingly.
5. **September needs NO new connectors.** Sleeper = plain REST in code; nflverse/CFBD loaders
   exist; `gh` authenticated; `gcloud`/`gsutil`/`sqlite3`/`jq`/`uv` present. The season needs
   data freshness (already the crew's active work), not tools. Studio note: Playwright MCP has
   run SEVEN sessions unused per its own STATUS.md — culture, not tooling.

## Inventory facts (measured 2026-08-15)
- MCP: product repo `.mcp.json` → magic only · `~/.claude.json` → facebook-marketplace (global)
  · Studio: no .mcp.json, session-scoped playwright-mcp · Gemini extensions: Stitch,
  code-review, conductor, dynasty-genius, google-workspace, maestro, superpowers.
- CLIs: gh (authed davidtleess) · databricks · gcloud · gsutil · sqlite3 · jq · uv — OK.
  rg, docker — MISSING (docker not needed by the stack).
- Hooks in ~/.claude/settings.json: PermissionRequest (banners), SessionStart (watchdog),
  UserPromptSubmit.

— the helper session, no seat claimed
