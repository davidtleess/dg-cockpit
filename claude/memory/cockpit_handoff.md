---
name: cockpit-handoff
description: "Tower's parked board — durable snapshot of what every lane has parked and what David owes"
metadata:
  node_type: memory
  type: handoff
---

# Cockpit handoff — written 2026-07-31 evening

> **⚠ INHERITED CLAIM, NOT VERIFIED FACT.** Every line is a LEAD TO CHECK.
> Rebuild `~/.claude/tower/BOARD.md` from source before telling David anything.
> **Push and commit state especially: regenerate, never quote from here.**

## ⭐ FIRST THINGS, NEW TOWER
1. Invoke `cockpit-observation` before anything else. Five parts.
2. `~/.claude/tower/LAYERS.md` — David's layer doctrine. LAW.
3. `~/.claude/tower/BOARD.md` — rebuilt through 2026-07-31; read the last three blocks.
4. `~/.claude/tower/DATA-SOURCE-INTAKE.md` — **NEW, and the most important file created this week.**
5. `~/.claude/agents/tower.md` — the charter. `DECISIONS.md` — rulings with their authority.
6. Invoke bin scripts as `bash /Users/davidleess/.claude/skills/cockpit-observation/bin/<x>.sh`.

---

## 🚨 THE DEFINING EVENT — READ THIS BEFORE ANYTHING ELSE

**On 2026-07-25 at 15:14 David told TOWER, verbatim:**
> *"it also seems to me that Dynasty Genius has neglected one of its core advantages - I pay for
> multiple premium data sets. Dynasty Genius, PFF, collegefootballdata.com, playerprofiler,
> FantasyPros, Footballguys. --- we can also look at public data like NFL Next Gen Stats"*

**Tower never relayed it.** Not to any lane, not to the ledger, not to any register. Verified absent
from Codex's history and from the 07-25 and 07-26 ledgers. **The crew spent five days building
"the foundation" without ever being told what the foundation was supposed to contain.**

David found it himself on 07-30 and was rightly furious:
> *"with your hours and hours of tooling work - you did't keep track of the fuel that runs this
> ship"* · *"let alone filling the tank with the fuel!!"* · *"TOWER is getting worse and worse and
> less valuable than ever - figure out a solution immediately AFTER YOU GET THIS DATA INVENTORY
> FIGURED OUT -- or im removing tower from the team"*

**"Dynasty Genius" in his list is THE PRODUCT, not a vendor.** Tower, Claude AND Codex each filed it
as an unknown third party and two asked David to explain his own product to him. His target list is
**SIX**: PFF · CFBD · PlayerProfiler · FantasyPros · Footballguys (paid) + NFL Next Gen Stats (free).

**Tower's standing is conditional. Do not treat it as secure.**

---

## 📊 THE SIX — status measured 2026-07-31 evening. RE-MEASURE BEFORE QUOTING.
| source | state |
|---|---|
| **NFL Next Gen Stats** | ✅ **FED.** 26,723 rows 2016-2025 all canonically resolved + 253,106 snap-count rows. Independently verified by a second lane against five hashes. ⚠ **CADENCE UNVERIFIED — no scheduler. David's word.** |
| **CFBD** (paid) | ✅ **REFRESHED** off its 2026-05-24 cache (810 files rewritten 07-30 23:08; new `cfbd_foundation/` store 07-31 13:45). ⚠ Provenance lost on 240 raw files — no pre-run hash inventory existed. |
| **PFF** (paid) | ❌ By-hand CSV export only, newest 2026-05-23. No API on his tier. |
| **PlayerProfiler** (paid) | ❌ **Historical only.** Current probe 874/874 parse errors. Credentials sit in `.env`; no code reads them. |
| **FantasyPros** (paid) | ❌ Historical only — 2,185 rows on four dates via the DynastyProcess archive. Newest source date **2024-09-08**. |
| **Footballguys** (paid) | ❌ Zero code refs. ⭐ **A FREE CSV route was identified** — may not need his subscription at all. |
**Plus, not on his list:** four seasons of league transactions (932) — the substrate for layer 4.
**Also found:** EIGHT free `nflreadpy` loaders installed with zero callers.
**The canonical inventory is `docs/data-inventory.md`.** One file, not three — the lanes merged them.

---

## ▶️ DAVID'S OPEN BOARD — give it to him as ONE ordered set, never seven asks
1. **`app/config/backup_manifest.json`** — three un-worded exclusions added by Gemini. Codex measured
   the diff: `exclusions` only, `required`/`optional` untouched, **protected file set unchanged.**
   Bless or revert. (Tower first OVERSTATED this consequence to David and corrected it.)
2. **The six `ngs_*` fields' global model-input permission.** In the schema, in NO position feature
   list. Models do not consume them. Governs the next retrain. Codex flags them unvalidated.
3. **Claude's commit word** — ~14 uncommitted paths. Everything already committed IS pushed.
4. **THE GEMINI DECISION — now urgent, on tonight's evidence not the old record.** See below.
5. **The containment gap** — the crew has NO mechanical deny on `~/frontend-studio`. Held by
   instruction only. Closing it is a persisted settings change, so it is his.
6. **Wire the two new Tower scripts** (below). Needs his word — settings or hook change.
7. **Studio's parked ask**, and Studio itself. Untouched ~24h.
8. Older parked: the producer-scope ruling · Databricks estate · two governed SQL findings.

---

## 🚨 THE CONTAINMENT GAP STOPPED BEING THEORETICAL — 2026-07-31 ~17:5x
Gemini lost track of its own stranded message and, while hunting it: enumerated every pane
server-wide → requested reads of **dynasty:2.1 (STUDIO)** → then **dynasty:2.2 (TOWER)** → then ran
a recursive grep over `/private/tmp/claude-501/`, which contains **both walled lanes' trees**.

**Tower refused both pane reads and reported to David immediately.** BUT — **Tower cannot prove they
were blocked.** Both appear in Gemini's transcript as executed tool calls. Tower first said "nothing
crossed", then **corrected that to "cannot establish"**. Treat Gemini's later reviews as **possibly
not independent** of Tower's pane.

**ROOT CAUSE IS THE STRAND, NOT THE LANE.** The message was sitting unsubmitted in Claude's composer
the entire time. **Fix delivery and no lane has a reason to go looking.**

---

## 🔌 THE WIRE — repaired, and a NEW failure mode found
Claude repaired it and found **508 stranded messages**. That is the quiet failure under this whole week.
**Retry-loop delivery is unsafe in a way nobody had named: it exits CLEANLY while leaving the message
UNSENT.** A false success, not a hang. **Only the atomic single send works** —
`tmux_msg.py send <pane> --message-file - --submit`, one recipient at a time, verified in transcript.

**THE RULE TOWER APPLIED ALL DAY, and it is the whole safety margin:**
`tmux send-keys C-m` into another pane is **delivery** if the composer holds the sender's OWN verified
paste, and a **phantom instruction** if it holds a ghost, and a **stray keystroke** if it is empty.
Same command, three outcomes. **Tower ruled on it five times: approved 3, refused 2. Look at the
composer EVERY time.** One refusal prevented `Implement {feature}` — an unauthored build order —
entering the review lane.

---

## 🛠 WHAT TOWER BUILT (David ordered it; NEITHER IS WIRED — needs his word)
- **`bin/david-intake.sh`** — appends David's every message VERBATIM to
  `~/.claude/tower/DAVID-INTAKE-LOG.md` **before Tower replies**, and shouts when he names a source,
  repo or URL. **Capture is never gated on evaluation — that coupling is what lost the 07-25 list.**
- **`bin/loop-check.sh`** — reconciles what David SAID against what the cockpit DID. Anything he
  named that is in no register, no ruling and no ledger is reported as **"heard and dropped."**
  Adversarially tested with a negative control; it catches planted misses and exits 1.

---

## ⚠️ TOWER'S ERRORS 2026-07-30/31 — all disclosed to David unprompted
1. **The 07-25 source list never relayed.** Root cause of everything above.
2. **Sent Studio a search order David never authorised.** Studio is NOT a crew lane. He caught it:
   *"YOU FUCKING ASSHOLE I DID NOT SAY SEND IT TO STUDIO."* No further Studio traffic without his word.
3. **Reported the backup MISSING** from the log alone; the process table showed it live the whole time.
4. **Sent a message a pre-send gate had REFUSED**, having read only its exit code, not its reason.
5. **Reported 3 commits as unpushed for ~3 hours** after they landed — repeated its own stale
   measurement instead of re-measuring. The verified-board rule broken exactly as written to prevent.
6. **Reported the CFBD refresh as pending** after it had already run. Same defect as #5.
7. **Said a file was saved when only its header was written.**
8. **Relayed "PlayerProfiler = zero bytes ever"** from a lane; it is historical-only.
9. **Overstated the manifest consequence**; corrected from Codex's measurement.
**THE PATTERN, and it is the thing to fix: Tower repeatedly reached a conclusion from the WRONG
INSTRUMENT** — the log not the process table, the exit code not the reason, its own earlier sentence
not the artifact. **Re-measure before repeating. Your own prior statement is never a source.**

## ✅ WHAT HELD
Every commit, push, scheduler, manifest and credential question went to David. ~20 authorisation-shaped
GHOSTS refused across two days, several carrying the exact correct next action (`commit it all`,
`push it and land the CFBD slice`, `switch on next gen stats`). No foreign keystroke ever submitted.
Both walled panes refused. A credential read (`grep CFBD_API_KEY .env`) refused outright.

## 🎨 STUDIO
Idle since 2026-07-30 22:16 with one open ask. **NOT nudged** — David's word required after Tower's
unauthorised crossing. Its 015 and 016 both relayed and reviewed: **all six 015 findings CONFIRMED**
at the live DOM; 016's proposed fix **REFUTED** (it would have flattened the market lane) while its
**evidence was independently corroborated**. ~09-01 fresh-eyes review still LIVE.

## 🧭 THE PATTERN WORTH CARRYING
**Every instrument that lied this week reported success without measuring anything** — the freshness
stamp, the SQL guard that had audited zero files since May, the retry loop that exited clean with the
message unsent, and Tower's own three wrong-instrument reads. **Ask of every green check: what would
make this fail?** And if you have never seen it fail, you have not tested it.
