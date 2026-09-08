---
name: reference_a_worktree_serves_committed_data_not_live_data
description: "A ticket worktree materialises TRACKED data paths from git, so app/data/valuation holds the COMMITTED market file while trunk holds the live one — same relative path, weeks apart, nothing distinguishing them. Cost a false 'six weeks stale' blocker 2026-09-06."
metadata:
  node_type: reference
  type: reference
---

**⛔ `bin/dg-work.sh` materialises TRACKED paths from git into the worktree.** `app/data/valuation` **is tracked**.
So a lane working in `~/dg-wt/DG-NNN` reads the **committed** artifact while the daily chain writes the **live**
one into the trunk tree at the **same relative path**.

**Measured 2026-09-06:** the worktree's `universe_market_divergence_latest.json` was dated **2026-07-22** (28.2 MB);
trunk's was **2026-09-05** (29.7 MB). **Six weeks apart. Nothing on the path distinguishes them.** A lane read the
file under its feet, concluded the market feed was six and a half weeks stale, and raised it as a blocker on
shipping a finding. It was not a capture defect; it was the tree.

**The distinction that matters:**
- `app/data/valuation/…` — **TRACKED**, therefore STALE in a worktree (frozen at the last commit).
- `app/data/valuation_runtime/…` — not tracked the same way; the live runtime artifact is current.

**How to apply — before any measurement on a data file inside a worktree:**
1. `git ls-files --error-unmatch <path>` — if it is tracked, **you are reading a commit, not the world.**
2. Compare `stat`/`captured_at` against the trunk copy, or read trunk's path explicitly.
3. State which tree a measurement came from when reporting it.

⚠ **THIS IS THE SECOND TIME IN TWO DAYS A STALE TREE PRODUCED A CONFIDENT WRONG ANSWER.** On 09-05 a detector swept
the trunk working tree **17 commits behind** and read a stale hit as live; the fix there was `git show origin/main:`.
Same family: **"the tree I am standing in" is a claim about a commit, and it needs checking like any other claim.**
See [[feedback_check_when_not_just_what]], [[reference_measuring_the_live_pvo_artifact]].

⚠ **The real market caveat, which survives and is smaller:** every overlay carries
`source_timestamp_is_fetch_time_not_publish_time`. We know when WE fetched, not when FantasyCalc computed, and
FantasyCalc derives from a rolling trade window. The honest sentence is *"we do not know the market's own publish
date"* — never *"the data is old."*

**Third instance, 2026-09-07 (roster page on a worktree preview):** two more worktree-vs-trunk gaps, both silent.
(1) `.env` is gitignored and lives only in trunk; `app/main.py` calls `load_dotenv()` at import, so any worktree server
answers 422 "roster configuration missing" until the three league vars (`DYNASTY_SLEEPER_USERNAME`, `DYNASTY_SEASON`,
`DYNASTY_SLEEPER_LEAGUE_ID`) are passed in — and a `.env` created after startup does nothing. (2) Worse: with the env fixed,
`app/data/valuation_runtime` is a PRIVATE, EMPTY dir in every worktree, and `resolve_pvo_source` falls back to the tracked
seed `app/data/valuation/universe_pvo_latest.json` (captured 2026-06-26) with no on-screen or payload indicator — Kraft
read 100.0 on the preview vs 46.9 on David's real app. Same for Engine B's feature CSV (`features_runtime` empty → tracked
08-31 seed). Fix: byte-copy trunk's published triple (`universe_pvo_runtime.json`, `…coverage_runtime.json`,
`…runtime.ready.json`) into the worktree's private dir and restart; the marker's hashes verify a copy. Receipt:
`/private/tmp/dg-next-roster-diagnosis.md`. Also: `app/cache` is a SHARED symlink — a worktree's roster request writes
trunk's FantasyCalc cache unless re-pointed first.
