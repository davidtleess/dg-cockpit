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

**A COUSIN, NOT A MEMBER — THE ANTI-TEST (2026-09-05, DG-164).** Distinguish it, because the standing question
does not catch it. In this family a check CAN fail and does so invisibly. In the anti-test the check **cannot
fail at all**, and it ships a green tick that makes the error *harder* to find than no test would have.

Four shipped constants (`12.91 / 7.29 / 8.79 / 8.99`) had no source: inline comments cited an artifact holding
different numbers, and the guard test carried the only other copy — so test and code agreed while neither agreed
with anything measured. **The sharpened rule, after the obvious version proved wrong:** a test that DUPLICATES a
production constant is merely redundant; the dangerous shape is a test whose expected values appear **NOWHERE in
the code they guard**, because then there is nothing for them to disagree with.

> **Ask: if this constant were wrong, which test goes red — and where did THAT test get its number?**
> An expected value comes from the code, an artifact, or a computation. Never from the test file.

Swept 09-05 across 419 test files at `96dad300`: **a single instance, not a pattern.** ✅ The detector was
validated to FIRE on an older commit before its clean result was believed — otherwise the sweep itself would
have been this family's next member. ⛔ And the first run scanned a working tree **17 commits behind** and read a
stale hit as live: **"the working tree" is a claim about a commit.** Read `git show <ref>:<path>`.

**The tell, worth grepping:** a test comment along the lines of *"there is no such constant, so it is restated
here."* It returns exactly one hit in this repo — the offender — and it had been announcing the defect in plain
English the whole time.

**THE TAUTOLOGICAL CHECK — a third cousin, found by independent reproduction 2026-09-05, and the two instances
were built BY the lane that named this whole family.** Distinct again: here the check runs, reports success, and
its success condition is **definitionally satisfied** — it is not that failure is invisible, it is that failure
is impossible.

1. **`rows_in == rows_out`**, built as the structural fix for absent-by-construction. It counted a **post-filter**
   list against itself: 4,042 skill rows entered, 582 were kept, 3,460 dropped *before the counter ran*. **If the
   filter dropped everyone it would still pass** — and ten players rostered in David's own league were in fact
   dropped rather than blanked, which is the exact thing it was built to prevent.
2. **The d→0 limit test.** `V(d=0) = A × avail`, and the baseline compared against IS `A × avail`. It returned
   30/30 exact order and would do so whatever the pipeline computed. **Greg relayed it to David as the strongest
   evidence of the day.** He had asked for a check grounding the new number in a verified artifact and never
   asked what it would print if the assembly were broken — the family's own question, unasked about its answer.

**The diagnostic:** for any passing check, write down the algebra of the success condition. **If the two sides
share a definition, the check is decoration.** A check must be falsifiable by some reachable state of the system;
if you cannot name that state, you do not have a check. The permutation null in the same suite IS falsifiable —
shuffle the inputs and the output must degrade — and it is the only one of the three that carried information.

**⛔ AND THE PRODUCER'S WARNINGS WERE IN THE FILE, UNREAD.** `retention_R_FIXED.json` carried `WARNING_zero_floor`
stating that the margin<1.0 test the consumer used is wrong (margin is a RATE ratio, qualifying is on season
TOTALS, and 100% of qualifying player-seasons below that line have POSITIVE value). **72% of the priced board was
zeroed by a rule its own input refuted in writing**, and 49% of David's league read as worthless or missing. Every
cell file also carried `WARNING_double_count`; the assembly double-counted anyway. **A warning string inside a data
file is invisible to a consumer who loads it with `json.load` and reads only the keys they expected.** If a
producer must warn a consumer, the warning belongs in a shape that FAILS — a version bump, a renamed key, a
required acknowledgement field — not in prose the loader never touches.

**✅ THE FIX, IMPLEMENTED SAME DAY AND WORTH COPYING — the producer's prose warnings became the consumer's
assertions.** Each `WARNING_` string was turned into a test in the code that reads the file: *zero-floor
consistency* (no player above the bar may be zeroed, none at or below it may carry a positive value) and
*no double count* (perturb every survival value in a copy of the cells and require V to be unchanged — it fires
the instant anything multiplies R by S again). **A warning read only during a post-mortem is a warning that
failed.** The producer states the hazard; the consumer must assert it, because the consumer is where it bites.

**AND THE GATE WAS PROVEN TO FAIL BEFORE ITS PASS WAS BELIEVED.** The proportionality check reports a worst
discrepancy of 8.9e-16 across 172 same-cell pairs; deliberately corrupting 24 pairs' cell assignment produces
discrepancies up to 2.9. **It separates 1e-15 from 1e+0**, so the green means something. Never accept a new
check's first pass without watching it go red on purpose — the three checks that failed us today had never been
seen to fail.

**⭐ AND THE RULE THAT UNIFIES THE REPETITION FAILURES: PRINT THE THING THE SENTENCE ASSERTS, NOT THE VERDICT
ABOUT IT.** All three carried-forward false claims on 2026-09-05 share one property — the claim was never on
screen. A script emitted a match COUNT and never the ranks ("McCaffrey is 2nd" — he was 1st); another emitted a
fragility VERDICT from a check that had been deleted. A verdict is a claim about a computation; only the
computation's output can contradict you. See [[feedback_a_rebuild_invalidates_every_claim_from_the_old_build]].

**THE EXPIRING TEST — a fourth cousin, found 2026-09-06 when it turned `main` RED and blocked every lane.**
`test_dg159_one_scale.py::test_an_ordinary_morning_is_still_not_mistaken_for_a_change_of_units` walks every
consecutive pair of capture dates **in the live database** and asserts the units-change detector never fires.
DG-159's rescale landed on 09-04, so **09-04 → 09-05 genuinely IS a change of units.** The detector was right and
the test had expired.

> **A test written against unbounded live data will eventually assert that a real event never happens.**

Distinct from the other shapes here: it does not fail to catch a defect, it **manufactures** one, and it does so
at exactly the moment the system did something correct and important. Bound such a test to a fixed window, a
fixture, or an explicit allowlist of known real events — never to "all history, forever."

**AND THE SAME DAY, THE FALSE-ALARM TWIN OF THE STALE-TREE FAMILY.** A lane built a worktree with raw
`git worktree add` instead of `bin/dg-work.sh` (whose own header warns of this in its second sentence): no
`.venv`, no per-worktree output directories. **The gate returned 21 failures. Every one was provisioning** — the
same tests pass 115/115 once rebuilt with the tool. His framing is the one to keep: *the failure mode is not only
false comfort, it is **false alarm**, which costs the same hour and looks like diligence while it does it.*

⛔ **Aggravating it: `dg-land.sh` runs the gate with `.venv/bin/python3.14` if present and falls back to bare
`python3`.** In an unprovisioned tree that fallback ran a python with no pytest, and *"No module named pytest"*
was reported as a TEST FAILURE. **A gate that cannot run its tests must not report the same thing as a gate whose
tests failed.** Filed as DG-174.

**THE ONE A DAY OF READING AND RUNNING NEVER FOUND, AND ONE TEST CAUGHT IN A SECOND (2026-09-06, DG-168).**
This family's standing note is that these defects are *found by reading, never by running.* **This one was found
by neither.** `format_explains` — the refuter that discards pairs whose price gap the league-format difference
already explains — tested whether the translation preserved the **SIGN of the price difference.** But the pairs
the screen exists to find are priced **within 10% of each other**, so that difference is near zero and its sign is
meaningless. **For two players at the same price it returned "explained" every time and threw them away** — it
discarded exactly the contradictions it was built to surface. Reported 111 pairs; the true count was **146.**

⛔ **Second time the same function was wrong, in OPPOSITE directions.** v1 used translated prices to decide who the
market prices alike, which MANUFACTURED four tight ends in the top six. v2 silently DELETED the clearest findings.
**Both survived a full day of the author running it by hand and reporting its output.** Manual exercise confirms a
program runs; it cannot confirm the program answers the question it was written for.

**What found it: writing the test the author's own handoff had named as the gap** — two players, same position,
same price, one clearly ahead on both axes. It failed on the first assertion. And writing the fixture corrected
the author's reasoning: his first version of the fixture asserted the wrong answer.

> **A test is not a check on the code. It is the first time anyone has been forced to state what the right answer
> is.** That is why it finds things reading and running both miss.

The corrected form is football rather than arithmetic: **the format explains a gap when the DOMINANT player's
position carries the larger correction.** A quarterback beating a back at the same price is half explained before
you start; **a back beating a tight end is a LARGER contradiction in his league, not a smaller one.**

**2026-09-06 (DG-165 transition audit, found by root's read-only probe, not by me):** `thin_history = games_t <= 4`
turned a MISSING `games_t` (NaN) into "not thin" because `NaN <= 4` is False — the missing measurement wore the
healthy label; and a NaN forecast passed the join to die as a cryptic SVD error inside the metrics. Same family:
a comparison against NaN silently returns the reassuring branch. Fix was the usual inversion — assert finite at
the boundary and refuse; pin negative-but-valid values so the guard cannot over-reach.

**2026-09-06 (DG-165, my own slip):** `pytest … | tail -1 && git commit … && git push` — the PIPE swallowed pytest's
exit code, so the `&&` chain committed and pushed with one test red. Run the test command bare (or `set -o pipefail`)
when a commit is gated on it; a summary line is not a gate.

