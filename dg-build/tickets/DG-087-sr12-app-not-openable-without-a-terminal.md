# DG-087 — SR-12: the product is not openable without a terminal (no launchd agent serves the API)

**Layer:** 6  ·  **State:** done  ·  **Lane:** ClaudeFable5-DG087-20260829  ·  **DG 3.0**  ·  **Tier 2**
**Source:** SEASON-BUILD-SPEC SR-12 (SPEC:926-952), pulled forward from D7 (Mon 08-31) to Sat
08-29 on David's panel selection "Today — I'm at the machine"; filed 2026-08-29.

**Problem:** the only way David can see the product is a terminal: activate the venv, start
uvicorn by hand. Nothing was listening on :8000 as recently as 08-26 (SR-11's acceptance ran
in-process via TestClient precisely because no server was up). The README documents `venv/`,
which does not exist (it is `.venv/`).

**How we know:** no com.davidleess.dynasty-api.plist exists in ops/launchd/;
`launchctl list | grep dynasty` shows 12 labels, none serving the API; spec SR-12 verification block.

**Build (spec constraints, verbatim):**
- NEW `ops/launchd/com.davidleess.dynasty-api.plist` templated from the opportunity-map plist.
  ProgramArguments `.venv/bin/python3.14 -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
  **No --reload** — reload watches 15 GB of app/data and will thrash. **WorkingDirectory = repo
  root REQUIRED** — app/main.py:63 and :76 are CWD-relative; wrong WD serves the API but 404s
  on /. RunAtLoad=true, KeepAlive=true. Installed as symlink. **Commit it unloaded; David runs
  the load himself** (spec decision table row 3).
- README Setup/Run rewritten: `venv/` → `.venv/`, the bookmark flow documented.

**Done looks like:** David opens a bookmark to http://127.0.0.1:8000 on a cold morning after the
6:13 wake and the Daily What-Changed surface renders, with no terminal step. Verification:
`launchctl list` shows a numeric PID for the label; `curl /` returns 200 with non-zero bytes
(a 404 means WorkingDirectory is wrong); `/api/league/what-changed` returns 200.

**Rides-along (authorized under this lane — David's 08-29 panel, ruling 3+4):** DG-050's weekly
replay-verify plist (`com.davidleess.dynasty-replay-verify.plist`; cadence decision recorded in
the DG-050 ticket). Both plists bootstrap at TODAY's sitting.

**Rollback:** bootout + remove two symlinks; the plists commit unloaded, so the land alone
changes nothing live.

---
**LANDED 2026-08-29 (merge `39c61ece`; trunk pull deliberately HELD until the sitting).** Built
RED-first (13→14 lane tests), 3-lens adversarial panel, 5 findings applied (`9f2fe1a7` pre-rebase):
ThrottleInterval 60; penalty-box remedy corrected in guard config + plist header (kickstart -k for
a hang; spawn failure needs bootout+bootstrap); replay-verify first-run brief in plist header (the
guard back-fills the phantom prior-Monday slot — first receipt lands minutes after bootstrap, and
between trunk-pull and bootstrap the guard reports degraded each tick, expected); README: 404 =
wrong WD OR unbuilt frontend/dist, frontend rebuild step after every pull (trunk dist was a WEEK
stale — built Aug 22, five frontend lands unserved), retrain⇒kickstart line. jobs_checked goes
11→12. SITTING SEQUENCE: pull → npm ci && npm run build → symlink+bootstrap both plists → verify
(count 14, curl / 200, /api/league/what-changed 200, first replay receipt within ~15 min).

**VISIBLE ACCEPTANCE 2026-08-29 ~11:05 — David's word: "ok now i see it."** Session opened
http://127.0.0.1:8000 in his browser (root 200, fresh bundle index-DdZC4aw9.js); Daily
What-Changed rendered on his screen. Bookmark save (Cmd+D) handed to him. The spec's cold-morning
proof (bookmark after the 6:13 wake, no terminal) completes itself tomorrow morning passively —
the agent is KeepAlive+RunAtLoad, so it survives the night by construction.
