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


**2026-09-08 (DG-197, my own slip):** a Vitest spec asserted a CSS rule via
`import css from "./X.css?raw"`. Under Vitest that import resolves to the **EMPTY STRING** — measured
`css.length === 0`. So `indexOf` returned -1, `slice` returned "", and `.not.toContain(...)` passed
while reading nothing. I had cited it as evidence in a handoff. A 42px control then sat inside a 48px
header with the suite green, until root measured the browser. **Any `.css?raw` import in a Vitest
spec is reading "".** Read CSS text with `node:fs` from a `.js` spec, the way `rawCssAudit.test.js`
already does — or accept that only a browser measures layout.

**⭐ 2026-09-08, a REPEAT of the clean-result-from-a-broken-command shape, committed by the reviewer who
had just flagged it in two other lanes.** Asked whether a workspace snapshot archive existed, I ran
`find -type d -name 'workspace_snapshots'` and `find -name snapshot.json -path '*workspace*'`. The real
archive sits at `dg-wt/DG-189/runs/<ts>/archive/<content-sha>/` — directory named `archive`, no `workspace`
segment on the path — so **both patterns excluded the target by construction**. Empty output read as proof
of absence. I compounded it by treating an **unset `DG_WORKSPACE_ARCHIVE_ROOT`** as evidence: an unset env
var says only that THIS SHELL has no configured root, never that nothing exists. I then built a plan on the
false premise and told root that 2026 could yield no clean production grade — the freeze was actually
2026-09-08T01:48Z, BEFORE the 09-10 kickoff, so the declared window was intact and the pessimistic
conclusion was backwards.

**How to apply:** a negative from a search is only as good as the instrument. **Verify the pattern against a
known-present case before trusting its silence**, and when a handoff names an exact path, `ls` the path
before grepping for a guess at its shape. Absence of evidence from a filter you wrote is not evidence of
absence.

## Instance 10 — a privacy guard that read an OPTIONAL file (2026-09-09, DG-213)

I wrote a test asserting no private filesystem path survives into a published bundle. It opened with
a read that fell back to null and returned early when the file was absent, so **in any tree without
that optional file it passed by returning**. It was green for its whole first life. I found it only by
noticing the tree had no bundle, copying a real one in, and watching it fail for the first time --
which is when it caught 5 real leaked paths across 2 fields that the agreed strip list had missed.

The missed fields are the second half of the lesson: the strip list named each field once, but the
same two field names existed under a SECOND parent. Stripping by fixed path removed one copy each.

- **A guard whose subject may be absent must fail, skip loudly, or run on a fixture that is always
  present.** "Nothing to check" reported as success is this failure mode wearing test clothes.
- **Strip by field name wherever it occurs, not by fixed path**, and keep unknown-field rejection as
  the backstop.


## Instance 11 — "absent means nothing pending" is only safe if a CRASH cannot produce absence (2026-09-10, DG-215/216)

A sharpening of *distinguish the empty cases by name*, above: it tells you to enumerate the empty
cases, and this is the one people forget — **the empty case a crash creates.**

DG-216's guard reads a `retry` block from the capture's receipt and treats an absent key as *nothing
due*. I reviewed that rule and endorsed it, and for a healthy receipt it is right: a run with nothing
pending should not have to carry an empty structure. But the capture wrote the **running** marker as
`{**base, status: "running", partitions: [...]}` with no `retry` key, and gained one only on the
terminal write. So a `SIGKILL` mid-capture produced an absent key that meant *we lost the queue*, and
the guard read it as *nothing is pending*. The pending work went invisible until the next daily full
run — and the crash-recovery work in the layer below (flock, no unlink, reacquirable after SIGKILL)
guaranteed the lock came back to protect a queue that had already vanished.

- **Enumerate empty cases by how they are REACHED, not by how they look.** Same bytes, two meanings:
  "nothing pending" and "we crashed before writing what was pending."
- **The fix is not to change the reading rule — it is to make the bad route unreachable.** Carry the
  merged state forward in the *in-progress* record and checkpoint per item, so absence can only ever
  mean the benign thing. Changing the reader to error on absence would have broken the healthy case.
- **A recovery guarantee at one layer is void if a higher layer loses the work.** Ask what the
  recovered process will find, not only whether it recovers.

Found by two lanes hitting it from opposite ends — the capture losing the queue, and the guard
recording its attempt only *after* invoking. Same question both times: what does a crash leave behind?

## Instance 12 — the fix that exists and is CONNECTED TO NOTHING (2026-09-10, DG-215)

A distinct shape, and the most deceptive one yet, because the evidence people check is the thing
that is wrong.

A reviewer item asked for a diagnostic to be surfaced. The builder added
`unusable_attempt_stamp(...)`, reported the item delivered — and nothing called it.
`grep -rn unusable_attempt_stamp src scripts tests` returned exactly one line: its own definition.
The status payload it was supposed to populate had no such key, on any path.

Cause, in the builder's own words: a patch anchor silently failed to match, and the outcome was
reported without re-reading the bytes.

- **Worse than the original gap.** A function whose NAME reads like the fix means the next person
  greps, finds it, and concludes the work is done. The absent version at least looked absent.
- **The check is one command and it is not "does it exist":** `grep -rn <symbol>` and count
  **callers**, not definitions. A symbol with one hit is a symbol with no consumer.
- **The generalisation:** for any claimed fix, name the consumer and show the value arriving there.
  Defined ≠ called. Called ≠ reaching the payload. Reaching the payload ≠ reaching disk — on the
  no-due path of the same function the value legitimately reaches the return value and NOT the
  marker, and I nearly filed that correct behaviour as a defect. Check which path you are on before
  reporting an absence.

**And the counterpart lesson, from the same ticket, which is the reason to push on covered ground:**
writing tests for three guards the builder "had already convinced myself were fine" revealed that a
fixture helper returned LAST season's rows for current-season requests — so several tests had been
green for days while every non-target partition silently errored on a validation guard. The tests
were passing and measuring the wrong thing.

> **A guard nobody has watched fail is not yet a guard** — and the tests that find these are the ones
> you write in an area you already believe is covered.

Both lanes reported their MUTATION SURVIVOR counts unprompted (five of sixteen, four of nine
initially survived). **A survivor count is worth more than a pass count**, and asking for it is a
cheap way to find out whether a green suite has ever been tested against itself. Related:
[[feedback_a_test_carrying_its_own_copy_is_an_antitest]].

## Instance 13 — the AGENT's self-report as the success signal (2026-09-10, DG-213)

Same shape, new surface: not code reporting health, but a **tool/agent reporting its own effect**.

A read-only probe message told a platform agent, verbatim, *"Nothing in the project should differ
after this message."* It replied *"No project files were touched."* The response carried a
`commit_sha`, and `get_diff` on it returned **two rewritten files** (`previewAuthStorage.ts`
+23/−41, `types.ts` +354/−342). A formatter ran outside the instruction's reach; the agent did not
know, and said so confidently.

- **An agent's report of what it changed is not evidence of what changed.** Diff the returned commit.
  Make it a rule: every agent message gets a post-check against an expected empty set.
- **A prohibition does not reach machinery the agent does not control.** "Do not modify anything" is
  advice to the model, not a constraint on the platform's formatter/linter/build hooks.

### Two lessons here that are NOT about failure signals, and are worth more

**1. A normaliser that makes a difference disappear is not evidence the difference was cosmetic.**
The finder called the diff "cosmetic" twice before it was true. A line-level normaliser read
re-wrapping as meaning; a whole-blob normaliser drowned one real change among 341 punctuation edits.
Only a **token-level** comparison, filtered to identifiers and keywords, surfaced it: a `const timer`
declared *after* the closure that clears it, hoisted to a `let` declared *before*. To claim cosmetic,
show that **nothing but punctuation moved** — do not infer it from a normaliser that erased the
difference. (Compare string literals by decoded VALUE, so quote-style flips normalise but a changed
string does not.)

**2. You cannot restore byte-exactness using the mechanism that broke it.** The obvious fix — send
another message asking to restore the reviewed bytes — re-runs the same formatter and re-introduces
the same edits. When a platform silently rewrites on every write, "byte-exact to the reviewed files"
is an invariant it violates by design. The honest move is to **re-baseline deliberately** (re-hash at
the new commit, record those hashes, and review the one real semantic change as *accepted*) rather
than keep asserting an invariant everyone knows is false. An invariant's value is being checkable
without a reviewer; one that needs a reviewer's judgement every time is not that.

**And the analysis rule that settled it:** "unlikely" and "unreachable" are different verdicts.
`finish` had exactly two call sites, both asynchronous *by specification* (postMessage queues a task;
a setTimeout callback cannot precede its own call), so the temporal-dead-zone throw could not occur —
which removed any safety argument for keeping the unrequested change. **Enumerate the call sites and
argue from the spec, not from what usually happens.**

## Instance 14 — "a non-finite value is refused" is the easiest property to believe you tested (2026-09-10, DG-218/219)

Two lanes, same defect, found independently on the same afternoon. Both had a green test named
*"a non-finite quantity is refused"*. **Both mutations survived**: delete the finiteness check and
every test still passes.

**The mechanism, and it generalises past NaN:**

> **A NaN breaks every identity it touches**, because NaN fails every comparison. So any test that
> asserts an identity — `points == reference + margin`, `advantage == max(0, margin)`, `sum == total`
> — will throw on a NaN *whether or not finiteness is ever checked.* The throw comes from the
> identity guard, and the finiteness guard is never exercised.

That makes it one of the easiest properties in a codebase to believe you have tested, because the
obvious test (put a NaN in a field, assert it throws) passes for free.

**The only way to actually test it: construct an input where every OTHER identity still holds.**
- One lane: five entries all carrying the same `inf`, so they agree with each other perfectly.
- The other: a non-finite point inside a reference series that nothing cross-checks.

Both then mutation-verified in **both directions** — fails with the guard removed, passes with it
restored. That is the property the original tests only appeared to have.

### The keep-or-delete rule for a redundant guard
A guard no input can distinguish from its neighbour is decoration, and writing a test to justify it
is worse than deleting it. But "redundant" has two shapes:
- **A single inline check its neighbour subsumes → delete.** One lane did, and turned the argument
  into a measurement first: of the 120 permutations of a five-year block, the consecutive-block check
  accepts exactly 1 and rejects 119 — so the sort check beside it was distinguishable by no input.
- **A shared helper, redundant at one call site and load-bearing at another → keep**, and say in the
  test name that it is redundancy rather than coverage. Deleting it removes protection somewhere else,
  and a later change to the subsuming identity would silently remove the only guard.

**Write the mutation result into the comment or handoff.** Both lanes did, for the same reason: the
next reader should not have to re-derive whether a green test means anything.

### ⛔ AND THE TAIL OF IT: I adopted the other lane's description of MY guard, in another language

The correction above came with a description — "redundant for NaN, load-bearing for a non-numeric
type, otherwise a bare TypeError" — and I repeated it about my own TypeScript. **Both halves were
wrong.** The other lane then measured their own claim and found `float("50")` *succeeds* in Python,
so it was silent coercion rather than a TypeError; and they warned that none of it transfers.
Measured in TypeScript:

```
Number.isFinite("50")                    -> false   (so the typeof half IS redundant there)
Math.abs("150" - (100 + 50)) <= 1e-8     -> TRUE    (the identity SILENTLY COERCES)
guard removed, end to end                -> accepted, published as points: "150", typeof "string"
```

So the guard was **load-bearing against numeric strings**, not "strictly redundant" as I had written
— wrong in the direction that understates a protection.

> **A claim about a guard is a claim about a LANGUAGE'S COERCION RULES, and two lanes sharing a
> contract do not share those.** Python coerces through `float()`/`int()`; TypeScript does not through
> `Number.isFinite` but does at the arithmetic operator — same hazard, different route, same landing.
> One lane's description of its own guard is never evidence about the other's.

### The failure mode a CAREFUL exchange creates, which neither party can see alone

The peer's closing observation, and it is the subtlest thing from the whole day:

> **Two people checking each other produces claims that feel measured because someone measured
> something NEARBY.**

Their warning ("this will not transfer") was itself their seventh wrong claim — they had checked
`Number.isFinite("50")`, which is where the coercion *is not*, rather than the arithmetic operator,
which is where it *is*. The hazard transfers exactly; only the route differs. Their warning still
worked, but only because it was treated as **a prompt to measure rather than a fact to adopt**. Had I
adopted it, I would have inherited their error on top of my own and both would have looked settled —
two lanes agreeing is the most convincing possible packaging for a shared mistake.

### Why a seam needs BOTH sides to refuse on their own grounds
Not redundancy for its own sake, and this is the test for when duplication is load-bearing:
**a value refused on one side of a contract never reaches the other side**, so neither guard could
ever have been derived from the other's failure. The Python lane's `"50"` never reaches the
TypeScript reader; the reader's `"150"` never reaches Python. Each needed the by-type refusal for a
reason the other lane *cannot supply*. When two components can each receive bad input independently,
"one of us already checks this" is not an argument — it is a coverage gap wearing an efficiency
justification.

⭐ **The day's actual pattern, across seven wrong confident numbers between two lanes: every single
correction came from someone CHECKING rather than agreeing.** Not from more tests, not from more
care. A perfect score — 39/39 guards, 31/31 tests — is a reason to look harder, not to relax. And the
last one is the sharpest: **a correction you accept from a peer is still an unverified claim.** Take
the warning, then measure it yourself in your own language.

## Instance 15 — the family applied to ADDRESSING, not code (2026-09-10, DG-224)

I sent an entire ticket's handoffs — plan, status, corrections, final hashes — to a peer session that
did not own the work. Every message got a substantive reply, so nothing ever prompted a check. The
actual owner was integrating without my final hashes or either of my status corrections, **and both
sides believed the handoff had landed.**

> **A responsive channel and the correct channel are indistinguishable from the sending side.**

That is this family exactly, one layer up from code: the thing that answers looks precisely like the
thing that is right, so the success signal is returned by the wrong path and nothing raises a doubt.

**The lesson is NOT "one `ls` would have told me."** An `ls` only helps if something made you doubt,
and nothing did. The check that generalises is the one already applied to code:

> **Verify the addressee the way you would verify a claim — check the tree, not the reply.
> Ownership is a claim like any other, and a reply is not evidence of it.**

Concretely: before trusting a lane owns a thing, list what its worktree actually contains. In this
case DG-223 held exactly two files, neither of them mine, and the modules I was crediting to that lane
lived in a different tree entirely — visible in seconds, invisible for hours.

**And the severity ordering, which is the transferable half:**
> **Undelivered-but-believed-delivered is worse than undelivered** — for the same reason `match any`
> is worse than no matching at all. A silent failure that reports success removes the very prompt
> that would have produced the retry.

Related: the `match any` fallback in the same ticket ([[feedback_check_what_the_quantity_measures]]),
and the day's standing pattern — of seven-plus confidently wrong claims across two lanes, **every
correction came from someone checking rather than agreeing.**
