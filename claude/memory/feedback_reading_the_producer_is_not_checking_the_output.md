---
name: feedback_reading_the_producer_is_not_checking_the_output
description: "2026-09-10: two independent reviewers both read the pack builder and neither diffed its output against the frozen reference file that was open to both of us; three required keys were missing."
metadata:
  type: feedback
---

**"I read that function" and "I checked its output against the contract" are different claims. I
recorded the first as though it covered the second.**

DG-223 built a market pack that a consumer validates key by key. I reviewed that builder for
provenance and immutability and reported it sound. The builder had reviewed it too. **Neither of us
diffed the produced entries against the frozen reference `market.json`, which was available to
both.** The pack carried 12 entry keys where `market_ranks:266-271` requires 15 — the consumer would
have refused every capture. Root found it.

The blind spot was not in the reasoning. Both reviews were careful, and the code was
**self-consistent and wrong**: reading it could not reveal the omission, because nothing inside it
was inconsistent. Only a comparison against the external contract could.

**How to apply:**
- ⭐ **When a contract has a reference artifact, diff against the artifact.** Reading the producer
  is a different claim and must be reported as such.
- Say which one you did. "I read `_pack` and it preserves the original hashes" is true and much
  weaker than "the produced keys match the frozen market.json"; writing the first while meaning the
  second is how coverage gets claimed that was never had.
- Self-consistency is not correctness. Code with no internal contradiction can still disagree with
  everything outside it, and a reviewer who only reads inwards cannot see that.

Related: [[feedback_every_test_injected_it_so_production_never_did]] — same family, where every test
supplied a dependency so nobody noticed production never did.
