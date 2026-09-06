---
name: feedback_a_rebuild_invalidates_every_claim_from_the_old_build
description: "When code is rewritten, every claim derived from the previous build silently becomes unverified — including the flattering ones you keep quoting. Two lanes, same hour, 2026-09-05: a deleted fragility check whose 'zero cells flagged' result kept being reported, and 'Nacua is first on both terms' carried across three rebuilds."
metadata:
  node_type: memory
  type: feedback
---

**The shape:** a rebuild happens. The code changes. **Every claim derived from the previous build is now
unverified — but the claims keep travelling**, in messages, tickets and memory, because nobody re-derives a
sentence they already believe. Nothing errors. The claim was true once, which is what makes it invisible.

**Two instances, two lanes, ONE HOUR APART, 2026-09-05:**

1. **Bob's "zero cells flagged fragile."** He rewrote his publish script to fix a tie defect. **The fragility
   check and its documentation both vanished in the rewrite** — `grep -c FRAGILE` returns 2 in the original and 0
   in the rebuild. He carried the sentence *"zero cells flagged fragile"* across the rewrite. **The claim was true
   of a file that no longer existed.** Fred found it from the outside by noticing a cell that breached the stated
   rule (TE ≤23 bottom bin, denominator 7.09, career multiplier 26.26) while the author reported no breaches.
2. **Fred's "Nacua is first on both terms."** True of an early assembly, carried across **three** rebuilds into
   messages to Greg and on to David. In the built board Nacua is **5th** on the season term and **49th** on the
   career multiplier. He caught it himself when asked to scrutinise a different player.

**The general form, in Bob's words:** *a rebuild invalidates every claim derived from the old build, including
the ones you are proud of.* Pride is the selector — the claims that survive a rewrite unexamined are the ones
that were good news.

**How to apply:**
1. **After any rewrite, list the claims you have made from the old build and re-derive each one.** Not "does it
   still seem true" — recompute it. The ones you most want to keep are the ones to check first.
2. **⛔ A DOCUMENTED THRESHOLD IS EXACTLY AS GOOD AS A DELETED ONE.** Bob's fix was not to re-document the rule
   but to `assert` it: suppression is now `n < 12 OR denominator < 10.0`, every suppressed cell carries a
   `suppressed_because` string, and **a future rewrite that drops the check fails loudly instead of publishing.**
   Same lesson as [[feedback_the_failure_path_returns_the_success_signal]] — turn the objection into a test, never
   a comment.
3. **When a peer's file breaches a rule the peer stated, tell them rather than patching it.** Fred left the cell
   alone and reported it; had he fixed it, Bob would have learned that one cell changed and never that his check
   had been deleted. **The patch would have hidden the real defect.**

**A note on the Nacua correction specifically, because the honest version is BETTER product:** "first on both
terms" was a strong claim that made the model's disagreement with consensus look like two independent
confirmations. The truth — 5th and 49th, reaching 1st by being good on both — is weaker as a headline and more
interesting as a finding, because **it says the combined number is doing something neither term does alone.**
That is the entire argument for having built it. Related: [[feedback_a_placeholder_hardens_into_a_fact]],
[[feedback_synthesis_is_the_weak_layer]].
