# DG-166 — Four shipped constants had NO SOURCE, and their guard test carried a copy of the same wrong numbers

**Layer:** 3 · **State:** open — instance FIXED in DG-159, class **SWEPT CLEAN 09-05 and found to be a single instance**; what remains is (a) the standing CI detector and (b) the wider constant-provenance inventory · **Lane:** — · **DG 3.0** · **model honesty · provenance**
**Source:** Found by Fred 2026-09-04 evening while reconciling a rank error Greg queried, during the DG-159 build.
Filed by Greg 2026-09-05 because the finding was absorbed into DG-159's commit and has no record of its own.

---

## WHAT WAS FOUND

The four replacement points-per-game figures that every cross-positional number in the product hangs off —
**QB 12.91 · RB 7.29 · WR 8.79 · TE 8.99** — **had no source at all.**

- They existed only as **inline comments** citing a calibration artifact.
- **That artifact does not contain them.** It holds `13.47 / 8.59 / 8.65 / 9.76`.
- **No season of the training data reproduces them** at the shipped ranks. **Neither does any population of the
  served artifact** — four were checked.

**THE FOUR CHECKS THAT DISPROVE THE CITED PROVENANCE — cheap to re-run, written up in the DG-159 acceptance:**
1. Open the cited calibration artifact: it holds `13.47 / 8.59 / 8.65 / 9.76`, not the shipped four.
2. No feature season of `engine_b_features_v2.csv` reproduces the shipped values at the shipped ranks.
3. None of four populations of the served artifact reproduces them either.
4. Grep the guard test for the literals — `test_phase15_xvar.py` restates them, **with a comment saying in so
   many words that no such constant exists so it is restated here.** That sentence is the tell, and it was
   sitting in the file the whole time announcing exactly what was wrong.

## ⛔ THE PART THAT MAKES THIS ITS OWN DEFECT CLASS

**The coupled-identity test carried its own restated copy of the same four numbers.** So the test and the code
agreed with each other while **neither agreed with anything measured.**

That is not a weak test. It is an **ANTI-TEST**: it actively certifies the error, and it makes the wrongness
*harder* to find than if nothing had been checked at all — because the constant now carries a green tick.
This is a distinct failure from
[[feedback_the_failure_path_returns_the_success_signal]]'s family: nothing here returns a success signal on a
failure path. The failure is that **the oracle and the subject share an ancestor.**

**The diagnostic question, and it is not the same question as "what would this print if it were broken":**
> **"If this constant were WRONG, which test would go red — and where did THAT test get its number?"**

**The tell to grep for:** any test comment along the lines of *"there is no such constant, so it is restated
here"*. That is a check announcing that it cannot fail. It is not the same as a check that fails invisibly.

If the answer is "from the same place the code got it", the test is decoration.

## ⭐ THE RULE, SHARPENED — and the first version of it was wrong (Fred, 2026-09-05, swept at `96dad300`)

The obvious detector looks for **a test table that DUPLICATES a production constant**. That is the WRONG shape.
A duplicated constant is merely redundant — if the two copies disagree, something goes red.

**The dangerous shape is the opposite:** a test table whose values appear **NOWHERE in the code it guards**.
`12.91 / 7.29 / 8.79 / 8.99` were not duplicated from anywhere — they were **the only copy in the repository.**
That is what made the test unfalsifiable: there was nothing for it to disagree WITH.

> **A test supplying the expected value of a production constant, where that value exists nowhere in
> production, is not a check. The test has become the source of truth for the thing it is auditing.**

An expected value must come from the code, from an artifact, or from a computation. Never from the test file.

**SWEEP RESULT — the class is NOT widespread.** 419 test files against 219 production files at `origin/main`
`96dad300`: **clean.** No per-position table in any test carries values absent from `src` or `app`. The grep
tell ("no such constant exists, so it is restated here") returns **exactly one hit — `test_phase15_xvar.py`
itself**, so the confession does not recur; but the confession is optional and the shape is not, which is why
the detector matters more than the phrase. ✅ **The detector was validated to FIRE before it was trusted:**
run against `f80e0309` it correctly flags `_REPLACEMENT_PPG`. A clean sweep from an unvalidated detector would
have been [[feedback_the_failure_path_returns_the_success_signal]] all over again.

⛔ **READ THE REF, NOT THE WORKING TREE.** The first clean-looking run scanned the trunk working tree, **17
commits behind**, so it was auditing pre-DG-159 code and reading a stale hit as live. Read every file through
`git show origin/main:<path>`. **"The working tree" is a claim about a commit, and it needs checking like any
other claim.** See [[feedback_check_when_not_just_what]].

## WHAT IT COST, measured

Decomposed on Ashton Jeanty, David's roster:

    29.67  today
    21.37  change of unit alone (the anchor David ruled)
    14.06  once replacement is re-derived at the SHIPPED rank
    12.40  at the corrected rank

**The stale figures were worth 7.31 points; the rank correction 1.64.** The rank error everyone was arguing about
was the SMALL half. Three of the four things David had been told about his own roster were wrong as a result, and
he was re-asked before it shipped (see [[david_rulings_thresholds_and_anchor_2026-09-04]]).

Also corrected here: the RB threshold was **four** ranks too deep (33 vs a structural 29), not ten. The "ten" was
POINTS. Receiver was the large rank move at eight (53 → 45).

## WHY THIS TICKET EXISTS WHEN THE INSTANCE IS FIXED

DG-159 re-derived these four as an order statistic from the real lineup structure, which is what **David's 08-31
ruling 5 required all along** — so the fix was mandatory, not scope creep. But DG-159's subject is the scale, and
a reader looking for "how do we know our constants are real" will never find this.

**The class is unswept.** Nobody has asked how many OTHER shipped constants are inline comments citing artifacts
that do not contain them, or are guarded by tests holding a restated copy.

## DONE WHEN

1. Every numeric constant on the scoring path is inventoried with its **provenance state**: derived-in-code,
   derived-from-a-named-artifact-that-verifiably-contains-it, or **asserted with no source**.
2. Any constant in the third bucket is either re-derived or **explicitly labelled unsourced in the file**, so the
   next reader is not misled by a comment that sounds like a citation.
3. **A standing detector, in CI**, for the sharpened shape: any test table supplying expected values for a
   production constant where those values appear nowhere in `src`/`app`. Fred's one-off exists and is
   validated; it is not wired in, so nothing stops the shape returning. **Whatever is wired must be shown to
   FIRE on `f80e0309` before it is believed on `main`.**
4. ⚠ Scope check before starting: **DG-061** ("Version the scoring constants and declare their
   calibration-evidence state") is adjacent and open. Decide whether this is DG-061's first increment or a
   separate sweep — do not build both.

## TRAPS

- ⛔ `ENGINE_B_P90_PPG` / `ENGINE_B_REPLACEMENT_DVS` / `XVAR_LAMBDA_ENGINE_B` are algebraically COUPLED and
  **DG-092 guards the lambda**. Under one denominator the old identity is trivially 1.000 — do not let the guard
  pass vacuously.
- ⛔ Do not "fix" a constant to make a test pass. The whole finding here is that the test was the thing that was wrong.
