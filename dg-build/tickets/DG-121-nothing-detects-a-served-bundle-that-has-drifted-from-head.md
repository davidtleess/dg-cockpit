# DG-121 — Nothing detects a served bundle that has drifted from HEAD

**Layer:** 6 · **State:** todo · **Lane:** — · **DG 3.0** · **DG-076's deferred half, finally ticketed**
**Source:** DG-076 shipped the frontend half (a build manifest carrying `source_sha`,
`openapi_sha256`, `built_at` and `source_dirty`) and explicitly deferred the backend half. The
closeout named it an honest limit with **no ticket**; this is that ticket, filed 2026-08-30.

**Problem:** the manifest can say what the bundle was built from, but **nothing compares it to what
the server is running.** That is the exact failure that cost David a week: on 2026-08-29 he opened
the product and the served bundle was **eight days stale** — five landed UI tickets he had paid for
were not on his screen, and nothing told him. The remedy adopted then was a human ritual
("rebuild after pull", added to the README). A ritual is not a detector.

**How we know it is still open:** `curl http://127.0.0.1:8000/assets/build-manifest.json` returns
`{"source_sha":"921ec892…","source_dirty":true,…}` and `git rev-parse HEAD` returns the trunk's
HEAD — but no code anywhere reads both and compares them. Verified by the 2026-08-30 closeout audit.

**Build:** have `/api/health` (or the capture-health surface beside it) read the served manifest and
compare `source_sha` against the serving checkout's HEAD, reporting one of: **current** ·
**drifted** (sha ≠ HEAD — name both, and how many commits behind) · **dirty** (`source_dirty` true —
the build came from an uncommitted tree, so its sha does not identify its code) · **unknown**
(no manifest — the dist predates DG-076). Surface it where the freshness sentence already lives, in
prose, per David's ruling: *"The page you are looking at was built from code that is 5 commits
behind"* — not a raw sha comparison.

**Honesty law:** this must never claim "current" when it cannot prove it. A missing manifest is
`unknown`, not `current` — the whole point is that silence was the original defect. And `dirty` must
not be reported as `drifted`: they are different facts, and DG-076's panel fought for that
distinction (a dirty-tree build stamping a clean sha was its one BLOCKING finding).

**Done:** a stale or dirty served bundle is visible to David without anyone remembering a ritual;
the four states render correctly; the check itself cannot report a false "current".
