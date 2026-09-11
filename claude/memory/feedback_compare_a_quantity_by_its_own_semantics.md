---
name: feedback-compare-a-quantity-by-its-own-semantics
description: "A magnitude needs a tolerance, an ordering must be identical — and a count with no baseline is not evidence"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 376f54b0-2909-46df-837c-ace5852eb144
  modified: 2026-09-10T20:47:19.925Z
---

**Sums tolerant, ranks exact.** DG-218 (2026-09-10) published a derived rank beside a saved one.
Two saved values `1.0000000001` and `1.0` pass every closeness check (`abs_tol=1e-8`) and rank **1
and 2** on the served board, while their re-added advantages are identical and tie **1–2**. The
tolerance that lets the sums match is exactly what would hide the reordering.

**The rule:** compare a quantity the way its own semantics require, not the way the surrounding code
happens to compare things. A magnitude is continuous and needs a tolerance. An ordering is discrete
and must be *identical* — including its ties: a tie that widens is a change in what the board
claims, not a rounding difference. Never adjust the existing published value to fit a
reconstruction; refuse the reconstruction.

**Why:** the fix is one exact-equality assertion, and without it the failure is invisible — both
numbers look right, they just disagree about who is ahead.

**How to apply:** wherever a value and an order derived from it are published together, assert the
derived order *equals* the published order. Sums get `math.isclose`; ranks get `==`.

---

**And the count that had no baseline.** Twice in that same lane I stated a number I had not
established:

* Reported "11 failed, 21 errors" from a contract suite as if pre-existing. Re-running with my own
  changes reverted showed the baseline was **clean** — they were all mine. *A test count means
  nothing without the comparison that makes it a number.*
* Reported "39 mutations, 39 caught". Recounting on a peer's question: **35** guards, caught across
  two rounds in which **1 of 24** and then **5 of 36** survived. Both halves were wrong — I had
  added re-runs to an already-counted list and included a guard I had deleted.

**The NaN trap, found independently in two lanes the same day.** A NaN breaks *every* identity it
touches — it fails every comparison — so any test asserting an identity throws on a NaN whether or
not finiteness is ever checked. That makes "a non-finite value is refused" one of the easiest
properties in a codebase to *believe* you have tested. Both DG-218 and DG-219 had a green test for
it that survived deleting the guard. **The only way to test it is an input where every identity
still holds:** five entries agreeing on the same `Infinity`, or a point inside a series nothing
cross-checks. Then ask where finiteness is actually load-bearing — usually one site that feeds the
rendered output, not the ones a cross-check already covers.

**Keep or delete a redundant guard by its shape.** A single inline check whose neighbour subsumes it
should go (verify exhaustively — of 120 permutations of a valid five-year block, the consecutive
check accepts exactly 1, so it rejects all 119 misorderings the "ascending" check would have). A
*shared helper* with one redundant call site and other load-bearing ones should be kept, with the
test name saying it is redundancy rather than implying coverage.

**⚠ And measure "redundant" too, in the language you are actually in.** I described a type guard as
"redundant for NaN, load-bearing for type — it turns a bare TypeError into a named refusal", and a
peer adopted the description before I checked it. Wrong: `float("50")` **succeeds** in Python, so
removing the guard silently accepts a numeric string as a number and the identity check then passes
against the coerced float — no exception anywhere. The guard is load-bearing against *silent
coercion*, not against a TypeError. `int("2026")` is the same trap.

I then told the peer it "does not transfer to TypeScript" because `Number.isFinite("50")` is
`false`. **Also too strong — they measured it instead of accepting it.** The hazard transfers, the
route differs: Python coerces at the *conversion call*, JS at the *arithmetic operator* (`"150" -
150` is `0`), so their identity check passed silently and published `points: "150"` as a string.
Both languages need a by-type refusal; neither lane can infer its own from the other's semantics.

**A correction you accept from a peer is still an unverified claim.** Their words, and the sharpest
rule of the exchange: my warning was what finally made them measure a guard they had already
mis-described on their own, before they ever borrowed my description.

**⚠ A GREEN TEST CAN ASSERT THE DEFECT.** Three instances in one day, two lanes (2026-09-10):

* A test that set a tampered content hash and asserted the tampering appeared in the
  *unavailable* list — positively encoding "corruption belongs among ordinary absences" as the
  contract. It passed. A reviewer found it, not the suite.
* A privacy guard whose test read an optional file and returned early: it passed by having nothing
  to check.
* A bootstrap fixture with a constant loss: zero-width interval whether you resampled clusters or
  rows, so it could not have failed if the clustering were wrong.

Same shape: **the test passes for a reason unrelated to the property it names, and being green
makes it harder to find than no test at all.** Ask of any guard's test: *what would have to be true
for this to fail?* If the answer isn't the property in the test's name, the test is decoration or
worse. This is the failure mutation testing exists to catch — see the survivors above.

**⚠ "I read that function" ≠ "I checked its output against the contract."** Two people
independently reviewed a capture pack for provenance and immutability, both had the frozen verified
`market.json` open, and neither compared entry keys against it — the pack was missing three fields
the real consumer cross-checks (15 keys vs 12). Both had recorded reading the builder as if it
covered checking the output. When a contract has a reference artifact, diff against the artifact;
reading the producer is a different claim.

**A perfect first-pass mutation score is a warning, not a result.** Every survivor in both rounds
was a real gap: a check passing only *incidentally* (a `nan` in one entry also trips the neighbouring
*disagreement* guard, so the test fired either way), three guards with no test at all, two tests
matching a downstream symptom's message instead of the defect's own, and one guard strictly redundant
with its neighbour — deleted rather than given a test to justify decoration. If nothing survives on
the first sweep, the mutations did not reach far enough.

**When duplication across a contract seam is load-bearing.** The test is not taste: *can a value
refused on one side ever reach the other?* If not, neither guard could have been derived from the
other's failure and both must stay. DG-218's `value: "50"` never reaches the client; DG-219's
`points: "150"` never reaches the backend — different coercion routes, same landing, and each side
is the only thing standing between its own input and a published string. **Where two components can
each receive bad input independently, "the other side already checks this" is a coverage gap wearing
an efficiency justification.** Say so beside the guard, or someone removes one as accidental
duplication.

**⚠ Two lanes agreeing is the most convincing possible packaging for a shared mistake.** A careful
exchange produces claims that *feel* measured because someone measured something nearby. My warning
to a peer was itself wrong — I checked `Number.isFinite`, which is where the coercion is not, instead
of the operator, where it is — and it only helped because they treated it as a prompt to measure
rather than a fact to adopt. Had they adopted it they would have inherited my error on top of their
own and both would have looked settled.

**⚠ A CHANNEL THAT ANSWERS IS NOT THE LANE THAT OWNS THE CODE.** 2026-09-10: a peer sent every
handoff for their ticket to my session for hours because my socket replied. Nobody checked which
files each worktree actually held — one `ls` settles it, and `git status --short` names the owner
outright. The consequence is the dangerous half: the real owner had none of their final hashes or
status corrections **while integration was pending**, and both sides believed the handoff had
landed.

Same shape as [[feedback_the_failure_path_returns_the_success_signal]] — a responsive channel and
the correct channel are indistinguishable from the sending side. In a multi-session build, *verify
the addressee the way you would verify a claim*: check the tree, not the reply. "The peer who
answers" is not evidence of ownership, and a claim about who owns code is still a claim.

Related: [[feedback_a_correct_payload_is_not_a_correct_product]] ·
[[feedback_check_what_the_quantity_measures]] · [[feedback_the_failure_path_returns_the_success_signal]]
