# DG-150 — After DG-141 (B), the morning flag's sentence still blames a model rebuild for a change that is a player's details moving

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-48631 · **DG 3.0** · **frontend copy · small**
**Source:** Fred (`davidleess-eb [d4e70e]`), 2026-09-04 ~08:2x ET, while landing DG-141 under David's ruling "B";
verified by Greg at `frontend/src/lib/copy.ts:491` before filing. Filed 09-04 08:2x ET by Greg. Assigned to Bob (idle;
frontend lane).

**Problem:** `vintage_changed_no_score_delta` reads *"Our projections were rebuilt on a newer model run, and none of
the players we could compare moved."* Under the OLD formula that was true: the flag could only trip when the
provenance hash moved, and a microsecond timestamp made that every morning. **After DG-141's B change the flag trips
only when a real row moved** — and a row moves when a player's TEAM, ROSTER STATUS or AGE changes, with the model
files provably unchanged. So the sentence will confidently name a model rebuild that did not happen. The one word
that has to survive is that something about a PLAYER changed, not about our models.

**How we know:** `frontend/src/lib/copy.ts:490-491` (read 2026-09-04 08:2x ET); pinned by `copy.test.ts:42`. Fred's
measurement on live rows: with the B change, swapping yesterday's Sleeper player-list hash in leaves the number
identical, and bumping the governance version still trips it.

**Done looks like:** the sentence names a player-details change rather than a model rebuild, in David's language,
without claiming which player or which field unless the producer carries it (READ THE PRODUCER — `daily_diff.py`
around the `vintage_changed_no_score_delta` emit — and say only what it entails). `copy.test.ts:42`'s regex moves with
it, red first. `npm run gate` green. **The wording is David's call**; put a candidate to him through Greg before
landing, and do not ship a sentence that asserts a cause the payload cannot support.

**Anti-scope:** no producer change; no change to the ambiguous-vintage sentence beside it; nothing under `.oa3`.

**Depends on:** DG-141 (David ruled B 09-04 ~08:10; landing 09-04 morning, NOT live until the next pull).
**Do not land before DG-141 is live** — until then the old sentence is still the true one.

---

**Notes**

**Acceptance — LANDED `248cddc7` 2026-09-04 ~17:0x ET by Bob (`~/dg-build/bin/dg-land.sh DG-150`).** Gate 649.
DG-141 went live with the 16:31 pull (trunk `43c15699`, API pid 63385), which is what unblocked this.

  before: *"Our projections were rebuilt on a newer model run, and none of the players we could compare moved."*
  after:  **"no compared player moved"**

A fragment, not a sentence, on David's ruling that the morning status is *"glyphs and symbols, not full sentences"*.
It names NO cause, because the payload carries none: `daily_diff.py:305` emits `status`, `vintage_changed`, the two
vintage hashes and an empty delta list, and after DG-141 (B) the flag fires for at least four causes it cannot
distinguish — a player's captured details moving, the compared population changing, a `governance_version` bump
(deliberately still hashed), and a genuine model rebuild.

**The vintage half is deliberately NOT repeated.** Traced the render path exhaustively: this token reaches the screen
in exactly ONE place, the receipt line at `DailyWhatChanged.tsx:827` (*"Feed status: … · model &lt;token&gt;"*), and
the line DIRECTLY ABOVE it already says *"Projection basis changed within this window."* from
`model.vintage_changed` — the same fact, already cause-free. Saying it twice is how the old sentence got long enough
to smuggle a cause in. `"compared"` stays load-bearing (the producer only compares players in BOTH captures); the
fragment being a fragment — no leading capital, no full stop — is pinned.

**⛔ THE MARK HALF IS NOT DONE, and was not guessed.** The glyph spec asks for three marks plus the neutral dash. That
receipt line renders THREE DIFFERENT status enums side by side (overall, market, model) whose `"ok"` does not mean the
same thing in each, so one mark vocabulary across them is a decision the design output should make, not this ticket.
It may also not apply at all: the rule is for a state David **acts on**, and this is a receipt one press behind
"Details". Raised with Greg rather than invented.
