# DG-121 — Nothing detects a served bundle that has drifted from HEAD

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **DG-076's deferred half, finally ticketed**
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

**Acceptance — LANDED `6e65640e` 2026-09-04 ~09:3x ET by Bob (`~/dg-build/bin/dg-land.sh DG-121`).** **NOT live**
until the next pull. Backend 6,894; frontend gate 649.

**Built as FACTS, not four states — and the split was ruled, not assumed.** `/api/health` now carries a REQUIRED
`served_bundle` with two independent axes: `bundle_vs_checkout` (is the running app built from THIS checkout's code)
and `checkout_vs_origin` (is this checkout the work that has been landed). Both, because **the first alone reads as
healthy on the exact morning this ticket is about** — measured live while building: the served bundle WAS the
checkout's own commit (`sha_matches_head` true, 0 ahead) while the build was DIRTY and the checkout sat **8 commits
behind origin**, so DG-149, DG-141 and DG-143 were landed and invisible. A one-axis detector reports "current" that
morning. Greg ruled both axes into this ticket rather than splitting (a second ticket lets one axis ship alone, which
is the failure mode).

**No status enum, no cause word, by his ruling and David's.** The bundle can be dirty-and-matching, clean-and-behind,
or both, so one verdict must pick; and the presentation is David's open design question (09-04 09:24: *"we need glyphs
and symbols, not full sentences"*), so a word in the payload would constrain it. **Presentation deliberately deferred
— see the open item below.** A test derives all four of this ticket's named states (current / drifted / dirty /
unknown) from the shipped fields, proving the split took nothing away.

**It fails EMPTY, never reassuring.** Unestablished is `None`, never `False`, never a default that reads as health.

**⚠ THE ADVERSARIAL REVIEW NEVER RAN — three attempts, all killed by the account spend limit** (3 lenses lost, then
21 verifiers, then 3 lenses again; limit resets 12:20 ET). The lenses that never ran: honesty, contract, design-fit.
Their decisive questions were verified inline and **pinned as tests, not argued** — and doing so found two real
defects in my own work:
1. **The fetch record is per-worktree; the ref it dates is shared.** `--git-dir` alone left a lane's worktree with a
   behind-count and no age; `--git-common-dir` alone made the SERVING checkout (itself a linked worktree) report
   yesterday, 23:02Z, while it had fetched at 13:31Z — a stale age beside a live count, the worse of the two. Now the
   newest of both, pinned in both directions.
2. **An unaskable question answered "no".** With no git on PATH, `manifest_sha_known_to_repo` came back `False` —
   "this repo never heard of that commit" — when nobody could look it up. Now `None`.
Also pinned: detached HEAD, a repository with no commits, a manifest that is not text, and the guard-of-guards (a
crashing detector cannot 500 the health light or leak a path).

```
→ merging into main
 12 files changed, 1136 insertions(+), 1 deletion(-)
To https://github.com/davidtleess/dynasty-genius.git
   5a2bfc12..6e65640e  HEAD -> main
✔ DG-121 landed on main and pushed. Worktree and branch removed.
```

**⛔ OPEN — this ticket's "Done" is NOT fully met, stated rather than quietly closed.** "A stale or dirty served
bundle is visible to David" requires a presentation, and nothing renders `served_bundle` yet. The machine now
NOTICES; it does not yet TELL him. That half is deliberately parked on his glyph decision and Greg's design workflow.
Until it ships, the detector is a field an operator can curl, not a thing David sees — which is better than the
README ritual it replaces, and short of the ticket.
