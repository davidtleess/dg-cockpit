---
name: feedback_a_correct_payload_is_not_a_correct_product
description: "DG-183 — an independent oracle matching all 836 rows and 38/38 tamper probes still missed the real blocker, which lived in how the correct payload was wired into the UI and in whether the test signal survives leaving this machine."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 376f54b0-2909-46df-837c-ace5852eb144
  modified: 2026-09-07T11:54:49.582Z
---

**2026-09-07, DG-183 market-ranks.** I built an independent oracle before reading root's adapter, matched **every field of all 836 rows**, watched **38 of 38** tamper guards refuse, and ran the full suites green. I concluded "no blocker." A five-lens adversarial fan-out then found three real defects I had missed, two of them in code I had already read:

1. **A routine failure removes the whole surface.** `PlayerDetailPage` gated on `status !== "not_configured"`, so the *error* state also routed to the new component, whose fallback is one sentence. A 503 (routine: the adapter demands forecast date == market date == ownership date) collapsed **every player card in the product**, David's 27 included, to that sentence. I had verified "loading/error never fall back to old scores" and ticked the box — the requirement was satisfied and the result was still catastrophic.
2. **The only test that could catch a wrong rank skipped itself.** Its inputs lived in an **untracked** `runs/` dir; `dg-work.sh` materialises tracked paths only, so elsewhere the suite is green having checked no rank. Mutation proved it was the sole test catching swapped ranks, a wrong denominator, and a hardwired flag. My probes ran where the files existed, so I never saw the skip. (See [[reference_a_worktree_serves_committed_data_not_live_data]].)
3. **A correct new field broke a standing ruling.** `league_ownership` served English minted in Python, duplicating `copy.ts:1882` and dropping the manager handle for 247 rows and David's "FA" label for 562. I had called it "documentation drift" because its *values* were right.

**Why:** correctness of the number and correctness of the product are different questions. An oracle answers "is the payload right"; it cannot answer "what does the screen do when this is unavailable", "who can reach a page this does not cover", or "does the green signal mean anything on another machine". All three defects sat outside the oracle's frame, and being deep in a numeric verification made the frame feel complete.

**How to apply:** after the numbers check out, deliberately ask the three the oracle cannot: (a) walk every non-success state to what actually renders, not to whether a rule was obeyed; (b) enumerate who can reach the surface from *other* surfaces and whether it covers them; (c) check the acceptance test's inputs are tracked, and ask what still passes if the code were wrong. And fan out adversarial lenses even when a solo pass feels conclusive — 6 of the 9 raised were refuted, but the 3 that survived were the ones that mattered. Related: [[feedback_the_failure_path_returns_the_success_signal]], [[feedback_a_test_carrying_its_own_copy_is_an_antitest]], [[feedback_a_rebuild_invalidates_every_claim_from_the_old_build]].
