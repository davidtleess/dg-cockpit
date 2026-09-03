---
name: reference-trunk-frontend-bundle-is-a-manual-build
description: "Landing a frontend change on main does NOT put it on David's screen — the served bundle is a gitignored frontend/dist that only a hand-run `npm run build` in trunk refreshes; kickstart restarts Python only, dg-land builds in the throwaway worktree."
metadata:
  type: reference
---

Found 2026-09-02 by the DG-128 closeout's screen-path audit. The API plist
(`ops/launchd/com.davidleess.dynasty-api.plist`) runs only `uvicorn app.main:app`; `app/main.py`
serves `frontend/dist/index.html` via FileResponse and `/assets` as a StaticFiles mount — both
read per request, so no restart is needed after a build. But `frontend/dist/` is gitignored
(`frontend/.gitignore:2`), `~/dg-build/bin/dg-land.sh` runs `npm run gate` (which builds) inside
the ticket worktree and throws that tree away, and nothing in the repo — no script, plist or
Makefile — builds trunk's dist. On 09-02 the served bundle was dated Aug 31 10:04 and did not
contain the DG-128 strings the landed API was about to send.

Same shape for data: a PVO field lives in `app/data/valuation_runtime/universe_pvo_runtime.json`,
written only by `run_pvo_refresh.py` (09:00 daily chain; 11:30/14:00 `dynasty-model-pvo-refresh`
slots, which rebuild unconditionally) running FROM TRUNK — so a landed field appears only after
pull + the next refresh, and the receipt/`grep -c <field>` on that file is the proof, not the
chain's exit.

**How to apply:** a "reaches his screen after pull + restart" sentence is incomplete for any
frontend or PVO-field change. The full sequence is pull → `npm --prefix
~/dynasty-genius-product/frontend run build` → one `launchctl kickstart -k` → wait for (or
hand-run) the PVO refresh → hard reload. Check `stat frontend/dist/index.html` against the pull
time before claiming anything is live. Deserves a ticket (build gap). See
[[reference_openapi_regen_trap]], [[project_dg3_build_system]].
