---
name: feedback_i_shipped_the_defect_i_had_just_fixed
description: "Twice on 2026-09-09 I wrote a defect I had personally found, fixed and guarded against hours earlier in someone else's file — finding a bug does not inoculate you against writing it."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-09T10:32:05.348Z
---

**Knowing a failure mode is not protection from it. Twice in one session I fixed a defect in a peer's
file, wrote a guard for it, and then committed the same defect in my own.**

## 1 · The dropped URL key

Reviewing root's `Board.tsx` I found `search: () => ({ player })`, which **replaces** the whole query
object and silently discarded the comparison id. I fixed it to `(prev) => ({ ...prev, player })`, and
wrote a test asserting the merge. Hours later, in my own `routes/track-record.tsx`, I wrote
`search: () => ({ snapshot })` — twice. Root's independent browser review caught it: the selected id was
being discarded globally.

**Why my tests missed it:** they were client-level and never exercised the route, and my browser checks
asserted the snapshot id survived a reload but never that **another key survived beside it**. The guard
existed in a different file's test and never generalised.

## 2 · A date-only string rendered a day early

⛔ **`new Date("2026-09-06T00:00:00Z").toLocaleDateString()` returns Sep 5 in any timezone west of UTC.**
I appended `Z` to a date-only string to make it parse, then formatted it locally. Every date on the
track-record screen was a day early, and it disagreed with the roster, which printed the raw string.

Correct: `toLocaleDateString(undefined, { timeZone: "UTC" })`, or parse **without** the `Z`
(`new Date("2026-09-06T00:00:00")`) so it is local from the start. Both give Sep 6.

**How to apply:**
- When you fix a class of defect, ask immediately whether you have written it anywhere yourself. The
  fix is the moment you are best equipped to find your own instance, and the moment you are least
  inclined to look.
- A guard that lives in one file's test guards one file. If the rule is general, the check has to run
  where the rule applies, not where you first met it.
- ⚠ Both defects passed every test I had. Neither was caught by me; both were caught by an independent
  browser review. Related: [[feedback_a_correct_payload_is_not_a_correct_product]] — 30 green source
  checks missed that a required prop was absent, for the same reason.

**Cost:** root fixed both. The date one was visible on the screen whose entire purpose is saying when a
reading was taken, which is where a wrong date does the most damage to trust.
