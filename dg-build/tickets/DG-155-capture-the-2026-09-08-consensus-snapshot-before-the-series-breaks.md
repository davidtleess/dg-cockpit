# DG-155 — Capture the 2026-09-08 consensus snapshot, or the only evidence that can settle the market question stops growing

**Layer:** 1 · **State:** done · **Lane:** Davids-MacBook-Pro-69536 · **DG 3.0** · **evidence preservation · HARD DEADLINE 2026-09-08 · half a day**
**Source:** the ranking-quality workflow, 2026-09-04 (21 agents, 13 of 14 candidate limiters killed); the archive state
below re-verified by Greg (`davidleess-eb [a78c76]`) on disk before filing. Filed 2026-09-04 14:2x ET.

**Problem:** the finding that a free consensus ranking orders players BETTER than Engine B rests on exactly FOUR
snapshots — `app/data/backtest/qb_validation/raw/dp_values/values_{2021,2022,2023,2024}-09-08.csv`, one per September 8,
all downloaded 2026-08-14. **There is no 2025 or 2026 snapshot and nothing captures one.** The daily market capture is
FantasyCalc, which is a different object with no historical validation. So the series that produced the only
market-versus-model evidence this project has is frozen at four points, and **2026-09-08 is four days away.**

**How we know:** `find app/data -name 'values_*.csv'` → exactly four files, 2021-2024, all `-09-08`, mtime 2026-08-14
(2026-09-04 14:2x ET). No producer references them: nothing under `scripts/` or `src/` writes that directory.

**~~Why the deadline is real~~ — RETRACTED 2026-09-04 by Fred, and by Greg who filed it.** The *comparability* half
stands: the series is annual and dated, and a snapshot taken on 09-20 is not comparable to four taken on 09-08. **But
the urgency does not, because the four files were never day-of downloads — they are git-history extractions.**
`github.com/dynastyprocess/data` retains history to 2019 across **361 commits** touching `files/values.csv`, and git
history is immutable, so a 2026-09-08 snapshot captured in October is **the same bytes** as one captured on the day.
Proven rather than argued: running the new producer for 2021, 2022, 2023 and 2024 against the existing archive returns
`already_captured_identical` on **all four** — the selection rule reproduces, byte for byte, whatever process created
them on 2026-08-14. Nothing is lost by Monday passing.

**⛔ FIRST REQUIREMENT — LAWFULNESS, before any fetch.** Confirm the source's terms permit this capture and record the
finding in the ticket with the URL and the licence. This project's registry already prohibits KTC, FootballGuys and
Dynasty Nerds ([[project_review_verdicts_2026-09-03]]); do not assume DynastyProcess is different because we happen to
hold four of its files. **If it is not clearly permitted, STOP and report — do not fetch.** A new paid source is
David's word.

**Done looks like:** if lawful, `values_2026-09-08.csv` lands in the same directory, same shape, same date convention,
with its provenance recorded (URL, fetch time, sha256) and a note saying who checked the terms; the fetch is a
run-scoped, idempotent producer that can be re-run without clobbering; and 2025's absence is **RECOVERED, not documented** (see below). A test pins the file's shape against one of the four existing files.

**Anti-scope:** no scraping of any prohibited source; no change to the FantasyCalc daily capture; no model change; ~~no backfill of 2025 (it cannot be recovered)~~ — **WRONG, it was recovered; see below**. Nothing under `.oa3`.

**Depends on:** nothing. **Blocks:** any future extension of the market-versus-model comparison.

---

**Notes**

---

**LANDED main `974f49ae` 2026-09-04 15:0x ET (Fred, davidleess-eb d4e70e) — code NOT live until the next trunk pull; the 2025 SNAPSHOT IS ALREADY ON DISK.** Gate 6944 passed / 33 skipped, frontend 93 / 649. 15 tests, 8 red first.

✅ **LAWFULNESS — PASSES, on primary evidence.** Source `https://github.com/dynastyprocess/data`, licence **GPL-3.0**, read out of the repository itself rather than taken from the docstring in `scripts/verify_dynastyprocess_source.py` that asserts it. Access is a **read-only git clone, never scraping**, and GPL-3.0 grants copying. The source is **absent from the prohibited registry** (which names KTC, FootballGuys, Dynasty Nerds) and the existing verification script records **David's own §8.4-extension sign-off** for it. **Checked by Fred, 2026-09-04.** Values are FantasyPros-ECR-derived (`dynastyprocess_ecr_2qb`), so a verdict from them reads "beats expert consensus", NEVER "beats the trade market".

⛔ **THE TWO PREMISES OF THE FILING BOTH DIED. Both are rewritten in place above so nobody inherits them.**
1. **No hard deadline.** Git-history extraction, immutable, reproduces byte-for-byte. Retracted to David by Greg.
2. **2025 was NOT a permanent gap.** A commit sits at **2025-09-05** — exactly what the on-or-before-within-7-days rule selects for a 2025-09-08 target. **CAPTURED:** `values_2025-09-08.csv`, sha256 `e999a745a0a10e4d…`, commit `06e357e2`, 3 days before target, `scrape_date` 2025-09-05, provenance sidecar beside it. **The series went from four points to five.** 2026 makes six, and per Greg's ruling it is **HELD until after 09-08** so the rule selects the closest commit rather than an early one.

**What shipped:** `src/dynasty_genius/sources/dynastyprocess_snapshot.py` (pure: the selection rule, the required-column check, the provenance record) + `scripts/capture_dynastyprocess_snapshot.py --year YYYY` (run-scoped blobless clone, idempotent) + 15 tests.

**The rule, and why the preference is the load-bearing half:** nearest commit within ±7 days, **PREFERRING on-or-before**. A commit AFTER the target carries roster news, injuries and camp movement that the fixed annual date exists to hold constant, so using one leaks information backwards into a point-in-time measurement. Nothing widens the window silently — no commit in range is a **named failure**, never a reach further out.

**It cannot damage the archive.** These files are the evidence other results were computed on. A re-run on an identical file is a `noop`; **an upstream revision to a historical commit is a LOUD failure**, never a silent overwrite; a snapshot missing a load-bearing column (`value_2qb`/`ecr_2qb`/`fp_id`/`player`/`pos`) is refused **before anything is written**; additive upstream drift is accepted, since readers select columns by name.

⚠ **THE TWO REAL RISKS, and the defence that actually works.** Neither has a clock: the upstream repository **disappearing**, and someone **rewriting its history**. Measured, so nobody reaches for the wrong defence — a blobless history clone is **1.4 MB and seconds** but does **NOT** survive the repo disappearing (blobs are fetched on demand), and a **full mirror did not finish a ten-minute clone**. The defence that removes the dependency is the one this producer performs: **keep the extracted CSV in our own archive.** A standing mirror is therefore NOT recommended as the answer; capturing each year we care about is.

**Still open:** capture 2026 on or after 2026-09-08 (one command: `--year 2026`). Nothing else.
