# DG-076 — Frontend build manifest — source SHA, OpenAPI hash, build timestamp

**Layer:** 6  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-60286  ·  **DG 3.0**
**Edge distance:** enabler  ·  **Size:** 0.5d
**Source:** 2026-08-26 six-layer completion audit → mapping fleet; roadmap RATIFIED by David
same day ("3. yes"). Full sequence context: `~/dg-build/ROADMAP-LAYERS.md`.

**Problem:** Section 11.4's build-manifest requirement has no trace in vite.config.ts, frontend/scripts/, or the shell, so nothing can say which build the owner is looking at — and the failure mode is live right now: frontend/dist was built Aug 22 12:22 while main's frontend commits (2077dfc1, ab6cd360) landed Aug 25, so the served SPA is three days behind trunk with nothing to flag it. Emit the manifest at build time, surface it in the shell and a health endpoint, and have the health check compare manifest source SHA against serving HEAD so a stale dist becomes a visible caveat instead of silent drift.

**How we know:** proposal :645 (frontend build manifest requirement); frontend/dist/index.html mtime 2026-08-22 12:22 vs git log frontend/ showing 2077dfc1 and ab6cd360 on 08-25 (both verified 2026-08-26); no manifest generation anywhere in vite.config.ts or frontend/scripts/

**Done looks like:** the missing scope above exists, runs, and is test-gated; see the roadmap's
layer sequence note for ordering constraints before starting.
