---
name: feedback_the_failure_path_returns_the_success_signal
description: "The most expensive defect shape in this project: the failure path returns the SAME signal as the success path, so the system reports health and does nothing. Three instances in one week, all found by reading, none by running. The test: ask out loud what a completely broken version would print."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dd3c4b75-c1e4-44f2-a62c-1e402ed9822a
  modified: 2026-09-04T20:52:36.832Z
---

**The shape:** the failure path returns the same signal as the success path. The system reports health and
does nothing. Running it produces green every time, so no amount of executing finds it — only reading does.

**Three instances, 2026-08-31 → 2026-09-04, named by Fred (`davidleess-eb`) on 09-04 after the third:**
1. **DG-136** — a capture-stage `abort()` exited 0, so a returned refusal read GREEN at the chain level. The
   hole was named only by the next day's store-hole alert.
2. **DG-142** — the roster trust badge compared the string `engine_b_v2`, which is identical on both sides of
   every bundle ever built, so the mismatch branch was unreachable by construction. Three positions shipped
   "passed accuracy checks" that were never run on the served models.
3. **DG-018** — a forward-only sleeper→gsis bridge with a `hasattr` guard hedging the reverse lookup would have
   returned zero outcomes FOREVER while reporting a healthy weekly no-op. Caught by Fred reading his own code
   before committing. Aggravating factor he found: a no-op counts as SUCCESS on that artifact's auxiliary tier.

Related and the same family: `launchctl list` reads exit 0 for a job that never ran ([[reference_sleep_catchup_guard]]);
the old visual gate that passed a zero-row error screen clean (0 violations, 0 overflow, 0 rows) until DG-118
added a content-presence assertion.

**Why:** every one of these was measured green while doing nothing, so the usual evidence — "I ran it, it
passed" — is exactly the evidence that cannot distinguish them. This is the failure mode that survives a test
suite, a gate and a green scheduled run, and it is the one that costs a season rather than an evening.

**How to apply — one question, asked out loud, before believing any green:**
> **"If this were completely broken, what would it print?"**

If the answer is "the same thing", the check is not a check. Then do one of: assert the FAILURE path fires
(watch it red, DG-118's method), assert a value that could only exist if work happened (a row count, a content
presence, a hash that differs across sides), or make the failure exit non-zero (DG-136's fix).

Corollary: **a no-op is not a success.** A job that legitimately has nothing to do must say so in a way a
reader can tell apart from a job that silently failed to do something. Related:
[[feedback_check_when_not_just_what]], [[feedback_synthesis_is_the_weak_layer]].

---

**SIX MORE on 2026-09-04, all in one lane's day, which makes this the project's dominant defect shape rather than a
recurring one. Bob asked the question of every surface he touched and it paid six times:**

1. **The freshness dot** (DG-156, `cfffd0c1`) — `unknown` had NO CSS rule and the base was a FILLED neutral dot, so a
   check that could not answer rendered identically to one that answered fine. **On David's front page, every
   morning, since DG-113.**
2. **The served bundle** (DG-121, `6e65640e`) — nothing compared the built bundle to the running code. An eight-day
   stale bundle was silent for a week; the remedy adopted then was a README ritual, and *a ritual is not a detector*.
3. **`_git_succeeds` returning `False` when git could not be RUN** — reported "this repo never heard of that commit"
   when the truth was that nobody could look it up. Now `None`.
4. **The unseen-player figure** (DG-153) — a confident r² off 18 rows. Now REFUSES below a stated sample floor.
5. **A grouped CV split silently reverting to random** (DG-027) — would report a clean number and change nothing.
   Now RAISES.
6. **`what-changed` emitting zero model deltas** after a same-day re-capture — reads as a quiet night, is a refusal.
   See [[reference_manual_recapture_costs_the_comparison]].

**THE FIX HAS ONE SHAPE and it is not "add an error message": make the DEFAULT the honest failure.** Hollow not
filled, `None` not `False`, raise not fall back, refuse not estimate. Then the case nobody thought about lands on
"we do not know" rather than on "fine". Inverting a default costs one line and closes every future instance of that
surface; adding a message closes one.

**⚠ THE INVERSE TRAP, which cost real time the same day:** a STALE artefact read as current evidence. A July error log
from the **pre-migration Intel machine** (`/usr/local/Cellar` in every frame) was relayed as a live crash in the
grading harness. The fix had landed FOUR DAYS after that log (`9b5fd230`, "fd lifecycle" in its own subject), 500
store reads leak zero descriptors today, and the harness's real state is an honest off-season no-op. **Check the
mtime, the frame paths and the line numbers against the current file before believing any log.** See
[[feedback_check_when_not_just_what]].

**WHY IT RECURS HERE SPECIFICALLY, and this is the part that makes it hard to see.** This repo's honest-disclosure
style produces a lot of `noop` / `unavailable` / `None` terminal states, and in the ordinary case they are the RIGHT
answer — an off-season week really is a no-op. The bug is reaching that same benign state through a BROKEN route.
The code records the standing hazard itself: on the realized-outcome artifact's `auxiliary` tier a `noop` counts as
**success**, which is why `FrozenPredictionSetUndeclared`'s docstring exists — an undeclared freeze would otherwise
have reported the loop healthy for a whole season.

**TWO MORE RULES, from the merged duplicate:**
- **Never hedge an API you have not read.** `hasattr`, `getattr(x, 'f', None)`, a bare `except Exception: pass`, and
  `or {}` on a loader's result all convert "I was wrong about this interface" into "there is nothing here". Read the
  module and call the real method. DG-018's near-miss was exactly this.
- **Distinguish the empty cases BY NAME.** "No data because nothing happened yet" and "no data because the join
  collapsed" must be different statuses with different exit codes, each with its own test — in DG-018 that became
  `noop:no_finalized_weeks` versus `failed:no_outcomes_for_finalized_weeks`.

*(Merged 2026-09-04 from `feedback_failure_path_indistinguishable_from_success`, which Bob flagged as a near-duplicate
and which is now deleted. Nothing from it was dropped.)*

**A PROSE VARIANT, and the tenth instance was BUILT by the lane cataloguing the other nine (2026-09-04).** Wiring
DG-158's units-change refusal made an existing empty branch REACHABLE, and it renders *"Projections held steady — no
player movement on this tape"* on the one morning every score in the product changes. Caught by READING the branch
just made reachable; no test fired. **Adding a refusal makes some previously-dead branch live — go read it.**

**The same error in prose, twice in one review:** describing what you MEANT to write rather than what you WROTE ("it
states the observation and lets him draw the conclusion", of a sentence whose second clause stated the conclusion),
and keeping a claim you had already identified as unsupported because the alternatives read worse ("paused until
tomorrow" is a prediction; "paused for today" is unconditionally true). **Only the artefact ships — true of the
intention is not true of the text.** Same shape as a coupled constant that is right in the derivation and wrong in
the file.

**The guard that works: turn the objection into a TEST, not a comment.** DG-158's strings are pinned by assertions on
what they must NOT contain (no "nobody moved", no "held steady", no cause word, no "tomorrow"), so the claim cannot
be reintroduced without a red suite. A comment explaining why a sentence is careful is one edit from gone.

**INSTANCE ELEVEN, 2026-09-04 evening (Fred, DG-160), and it names a SUB-CASE worth its own question.** The
replacement-reasoning panel read its league facts from a payload that carries **no league block at all**, so in
production it would have rendered silently EMPTY while all nineteen unit tests passed green — because the tests fed
the assembler a payload the real producer never emits. Caught by asking: **"does the REAL payload actually carry
what the TEST feeds it?"** Fixed by reading the captured snapshot with the PATH ITSELF pinned by a test.

That question is now the second-highest-yield check we have, after *"if this were completely broken, what would it
print?"* — and it catches a case the first one misses, because the honest answer to "what would it print" is
"nothing", and **an empty panel does not look broken; it looks like a quiet day.** A fixture is a claim about the
producer, and nothing verifies that claim unless you make it. Pin the path, not just the shape.
