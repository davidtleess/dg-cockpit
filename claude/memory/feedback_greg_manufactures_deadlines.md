---
name: feedback_greg_manufactures_deadlines
description: "Greg's repeated error 2026-09-04: attaching urgency that does not exist. Four claims to David in one day, each retracted by a lane that checked. Before telling David a deadline, find the mechanism that destroys the evidence and name it — or say there is no deadline."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dd3c4b75-c1e4-44f2-a62c-1e402ed9822a
  modified: 2026-09-04T18:48:39.017Z
---

**2026-09-04, four in one day, every one stated to David as fact and every one retracted after a lane checked:**

| I told him | The truth | Who caught it |
|---|---|---|
| "866,990 predictions on file" | 35,645 carry a prediction (4.1%); the rest are `capture_incomplete`. I quoted the table's ROW COUNT. | Fred |
| "If week 1 isn't collected right we lose it forever" | `run_realized_outcome_scoring._build_outcomes` loops `range(1, week+1)` into a throwaway store and rebuilds every finalised week from nflverse. A first run in week 6 grades weeks 1-6. **Nothing perishes at kickoff.** | Fred |
| "The board never returns to 505 players after a rollover" | Compared two different populations. Like-for-like, completed seasons hold 457-501 rows, mean 480. | Fred (his own number, withdrawn) |
| "2026-09-08 is a hard deadline for the consensus snapshot" | The four `values_*.csv` come from GIT HISTORY, not day-of downloads — `scripts/load_dynastyprocess_archive.py` "selects the nearest ON-OR-BEFORE commit within ±7 days". History is immutable; extracting 2024-09-08 today reproduces the stored file BYTE FOR BYTE. **2025 is also recoverable** (commit 2025-09-05), so the series goes 4 → 5 → 6. | Fred, who proved it by reproduction |

**Why this is a distinct failure from getting a number wrong.** A wrong number is corrected and forgotten. A
manufactured deadline *reorders the whole program*: it pulled a lane off model work onto a Monday scramble, and it
pressed David for a decision he did not have to make that day. Urgency is itself a claim, and it was the one I never
checked. Note the direction — every error invented pressure. None of them relaxed it.

**How to apply — before telling David anything is urgent, answer these in writing:**
1. **What exactly is destroyed if we miss this, and what destroys it?** Name the mechanism in code or in the world.
   "The feed only serves recent weeks" is a mechanism. "It feels late" is not.
2. **Is the evidence immutable?** Git history, an append-only store, a re-derivable artifact and a vendor archive all
   survive a missed date. Most things here are re-derivable — the default assumption should be that nothing perishes.
3. **Did I read the producer, or infer from a name?** All four above came from inferring: a table name, a job name, a
   filename convention, a row count.
4. If you cannot name the mechanism, **say "no deadline that I can find"** and let the work be ranked on value alone.

Corollary: when a lane sends a number, ask whether it is provisional BEFORE relaying it. Fred now flags provisional
figures on request; the round trip costs nothing and a retraction to David costs trust.
Related: [[feedback_synthesis_is_the_weak_layer]], [[feedback_check_when_not_just_what]],
[[feedback_the_failure_path_returns_the_success_signal]].
