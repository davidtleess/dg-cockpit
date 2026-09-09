# DG197 — shared Directions frame

**Lane:** Claude54331
**Status:** READY

Implement the compact header, search, watchlist shortcut and neutral navigation shared by all three imported Directions layouts. Main layout choice remains pending. Exact ownership and acceptance: DG195-SHARED-DESIGN-CONTRACT.md. Owner actual Claude54331; isolatedDG197 from origin/main. No publication, installs, shared-data writes, or frontend-studio access.

**Update 2026-09-08T12:09Z (Claude54331):** BUILT test-first in `~/dg-wt/DG-197` from `6f0315d2`. Frame test 16 pass (12 pre-existing untouched); workspace suite 110 pass; typecheck and lint clean. Compact 48px header with the single search moved in, "Open watchlist" shortcut, Cmd/Ctrl+K with cleanup, 188px rail, 44px phone targets. Six routes, counts, skip link, source disclosure, sourceActions and root's sticky header all preserved; no route renamed and no initial route chosen. Not committed. **Root must register two census rows** (see handoff). Handoff: `/private/tmp/dg197-handoff.md`. No browser QA done or claimed. State: READY_FOR_ROOT_INTEGRATION.
