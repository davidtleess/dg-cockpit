---
name: feedback-an-inference-about-unread-code-is-not-a-finding
description: I read three numbers off a screen, did the arithmetic, and reported how the code worked. The arithmetic matched and the claim was still wrong.
metadata:
  type: feedback
---

**2026-09-08, DG-201.** Reviewing the Lovable app I reported, as a finding, that it *"subtracts a
FantasyCalc price from a points total"*. My evidence was a rendered card showing 3554, 1118 and
"+2436", and 3554 − 1118 = 2436. Root then read the imported source and found a **market-curve
transform of an alternate score** — no subtraction of our points anywhere. I withdrew it.

**Why:** the arithmetic matching is consistent with the explanation, not evidence for it. Many
computations produce 2436 from those inputs. I had observed the *display* and reported the
*implementation*.

**How to apply:** when you have not read the code, say what you measured and stop. "The two lanes are
different units, so ours cannot be consumed as an equivalent price" is measurable from our own payload
ranges (model_value 0–991.75, market_value 5–10,525) and survives whatever their code does. "It
subtracts X from Y" is a claim about a file, and needs the file. State the constraint, not the
mechanism. Also: keep dated counts out of source comments — they drift and become false assertions.

Related: [[feedback_check_what_the_quantity_measures]], [[feedback_indistinguishable_is_not_equal_bound_the_difference]].
