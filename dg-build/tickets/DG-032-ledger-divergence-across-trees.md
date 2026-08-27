# DG-032 — Six ledger trees, three versions of the same day; reconcile the channel

**Layer:** process  ·  **State:** todo  ·  **Lane:** —  ·  **DG 3.0**
**Source:** David's ruling 2026-08-19 ("assign it to a lane as its own ticket"), after the condition
was surfaced three times in the shared ledger by the Claude Consultant and never picked up

**Problem:** David ruled on 2026-08-19 that *"we now use the ledger to communicate with tmux panes
and parallel sessions."* He also ruled that ledger entries live in the ticket worktree. Both rulings
are being followed, and together they produce a channel that disagrees with itself.

Measured 2026-08-19 15:0x ET across six trees — the trunk plus `~/dg-wt/{DG-021,DG-022,DG-023,
DG-031,outcome-loop-week1-review}` — every worktree ledger directory being a real directory, not a
symlink:

```text
2026-08-18.md   trunk                        800d1389b0b7
2026-08-18.md   DG-021 / DG-022 / DG-023 / DG-031   f4a3b671a8b8
2026-08-18.md   outcome-loop-week1-review    b7407ffdbed1     <- three distinct versions
2026-08-19.md   trunk                        cf39a72a60f9
2026-08-19.md   DG-022                       e86c3d7566b3
2026-08-19.md   DG-031                       53b2f90ab066     <- three distinct versions
```

The trunk copy of `2026-08-18.md` is also **178 lines ahead of HEAD, uncommitted**, and was observed
changing to `b7407ffd` and reverting to `800d1389` inside one minute — so more than one party is
writing it.

**Why it matters, concretely.** DG-031's PREFLIGHT was invisible to the trunk until its lane began
mirroring by hand; a `grep -c "DG-031"` against the trunk ledger returned 0 while the ticket was
already executing. A Codex Consultant ballot artifact still exists only in `wt:DG-021`. A lane that
reads its own worktree's ledger is reading a different record from the lane beside it, and neither
can tell.

**Done looks like:**

1. A written rule that reconciles the two standing rulings — which tree is authoritative for what,
   and what a lane must mirror to the trunk and when. The `[w#DG-031]` coordination-mirror
   convention Codex invented on 2026-08-19 is the working candidate and should be evaluated first
   rather than replaced.
2. The dated files reconciled across trees, or an explicit decision that historical divergence is
   accepted and only forward entries are kept in step. Either is fine; the silent third state is not.
3. The trunk's uncommitted 178 lines on `2026-08-18.md` resolved — committed or reverted, with the
   reason recorded.
4. `scripts/ledger_watch.py` already detects and reports all of this; whatever rule is chosen should
   leave its divergence check green or explain why a residual divergence is legitimate.

**Explicitly out of scope:** product code, contracts, migrations, model behaviour, Studio, and any
change to who may write a ledger entry.

**Depends on:** nothing.

---

**Evidence commands:**

```text
python3 scripts/ledger_watch.py status --window 2
for d in ~/dg-wt/*/; do shasum -a 256 "$d/docs/agent-ledger/2026-08-18.md"; done
shasum -a 256 ~/dynasty-genius-product/docs/agent-ledger/2026-08-18.md
git -C ~/dynasty-genius-product diff --stat HEAD -- docs/agent-ledger/2026-08-18.md
grep -c "DG-031" ~/dynasty-genius-product/docs/agent-ledger/2026-08-19.md
```
