# DG-091 PHASE 2A — landed and live, 2026-08-30

David's order: *"create a sub agent workflow with tower, studio and whoever else is needed - and
start building."* Phase 2A built only what his OWN RULINGS settle — no new design opinions.

## Landed (all three, serialized, over the peer lane's DG-100/101/112)
- **DG-109 `59bab53e`** — the copy dictionary + an enforced render rule.
- **DG-111 `002a26bd`** — the caveat furniture retired across all seven nav surfaces.
- **DG-110 `921ec892`** — global player search, every dead end closed.

## Deployed and independently verified (not taking the agents' word)
Trunk `921ec892` · vitest **402 passed** (was 343) · dist rebuilt · live :8000 serving
`index-DtE3xmIx.js`. My own browser scan of the LIVE product, at 1440 AND 390, counting raw
tokens in visible text outside the declared exempt subtrees: **front page 0, player card 0**;
no horizontal overflow at either width.

## What the panels caught — the program's central risk, confirmed real
**52 findings fixed across the three lands.** The honesty lens earned the whole structure: the
first draft of the dictionary replaced opaque tokens with confident prose that was FALSE.
- `no_market_overlay` → *"Nobody is quoting a market price for him right now."* **BLOCKING** — the
  token is a scope statement (market overlay deliberately excluded), and the SAME card printed
  "Market value 5204 · 29th overall" three lines above it. Now ships as *"Market prices are
  deliberately left out of this read — it rests on our own numbers."*
- `no_internal_value_signal` → *"We have no value score of our own for him yet."* **BLOCKING** —
  contradicted by "Dynasty value 77.5" on the same card. The token actually means the
  age-weighted-risk calculation lacked an input. Now ships as *"We could not work out his
  age-weighted value risk — one of the two inputs it needs was missing from this record."*
- rollup `ok` → *"Nothing needs attention."* **BLOCKING** — the backend explicitly declines that
  claim (auxiliary degradation never degrades the root), so the card could have said "Nothing
  needs attention" directly above "9 reports: 8 fresh · 1 failed".
**The lesson: replacing a token with prose is an act of authorship, and confident prose can lie in
ways an opaque token cannot. Every mapping needs its producer read, not just a plausible reading.**

## ⚠ FOR DAVID'S EYES (judgement calls the lanes flagged rather than buried)
1. **TWO lands touched `TRUST_TRUTH_COPY`** (corrected 08-30 by the closeout audit — this item
   originally named DG-111 alone; `git show 59bab53e:frontend/src/trust/TrustTruthPanel.tsx`
   proves **DG-109 removed the NDCG acronym first**, then DG-111 reworded further). The constant is marked "never free-typed" in its own header, and the wording moved away from what its ticket
   recorded as sign-off copy. Every factual
   claim is preserved; the shouted acronym NDCG is gone. Worth his read.
2. **`rawCssAuditBaseline.json` was edited BY HAND** in DG-111 (RosterAudit raw_font_size 3→2,
   total 45→44) because the generator can only insert, never decrement.
3. **The visual gate does not cover the surfaces where the worst regressions lived** — it visits
   only three surfaces, and DG-110's regression was outside them.
4. **a11y measurement trap, still live:** scanning a surface with no backend renders an error
   state with zero rows and reports a small clean violation count — a FALSE receipt. It produced
   one during this run and was caught. Also: axe reports COMPOSITED colors (it blends ancestor
   opacity) while getComputedStyle reports the CSS value — they disagree, and axe is right.

## Still on screen, for phase 2B (observed by me in the browser, not claimed by an agent)
The right rail still renders the daily tape as a MONOSPACE terminal pane; the degraded-model
sentence assembles awkwardly (*"the model side came back degraded — Two different model runs
landed on the same day… — so treat…"*, capital mid-sentence); "Model status" duplicates "Scored
by"; the model's second-opinion caveat prints TWICE on the card; the inspector still shows
"4 caveats · counter-argument unavailable" and "1 driver · 0 risk flags" (absence-as-content that
DG-111 removed elsewhere); "Value above replacement (xVAR)" still carries the acronym.

## David's design panel answers (2026-08-30) — phase 2B's brief
Trade voice = both pricings plainly, NO blended take/pass · parked surfaces leave the nav ·
green-up/red-down deltas (**reopens the enforced verdict-hue ban — re-point it at genuine buy/sell
styling, do not delete it**) · build the phone shell now.


---

## ⚠ THIS CLOSEOUT WAS AUDITED BEFORE DAVID READ IT — corrections applied
A three-auditor adversarial sweep (read-only; product truth, record honesty, unfinished business)
was run against this session's own claims, because **this session made two wrong claims to David
tonight** and a self-certified closeout had not earned trust. Both errors, recorded here because
this is the newest file and the audit found they appeared only in older ones:
- **36 orphaned CPU busy-loops** from this session's own DG-105 flake-under-load test ran 90+
  minutes (load 63-84) and contaminated every performance reading in that window. Cause: in a
  non-interactive `zsh -c`, `jobs -p` returns no background-subshell PIDs, so the teardown killed
  nothing. The peer session killed them.
- **A 4.6s players-API "problem" that does not exist** — reported to David as fact, then fully
  retracted (clean re-measure: card renders 199ms after click; API 0.135-0.273s). **Refined by the
  audit: do not generalise to "never slow" — one auditor's first cold request took 10.26s, then
  0.209s. Cold-start latency after idle is real and unmeasured.**

**What the audit CORRECTED in this session's claims:**
1. **"The sprint tail is only Tuesday 09-01" — FALSE.** See the tail plan below.
2. **DG-105 had NO board row at all** despite landing — added.
3. **DG-091's own controlling ticket still said "todo · POST-FREEZE · nothing built"** — corrected.
4. **DG-045's resume brief still instructed applying an amendment that landed Saturday** — Tuesday
   would have redone finished work; corrected.
5. **"Raw-literal contrast debt retired" (DG-105) is overstated** — the census is not emptied
   (raw_oklch 40 / spacing 70 / radius 33 / font-size 45 across 18 of 21 files) and **21 composited
   AA failures remain**, all `.dg-shell__parked-badge` at 2.89:1.
6. **The deployed bundle declares `source_dirty: true`** — DG-076 raising exactly the flag it was
   built for. "Deployed at 921ec892" was a +dirty build; the dirty files are outside frontend/ so
   the bundle is faithful, but the claim hid the flag.
7. **`fad9d12`'s message was overstated** — only DG-111 carries an acceptance record; DG-109/110
   got one-word state flips, so 36 of the 52 panel findings exist only as a number.
8. **vitest 402 is unverified by the audit** (running it was barred as machine load) — state it as
   "green when I ran it", not as an independently checked fact.

## THE HONEST TAIL — Monday first, NOT "only Tuesday"
**MON 08-31 — two launchd jobs have NEVER fired (`launchctl print` → `runs = 0`):**
- **07:00 `dynasty-nflverse-vintage-sync`** — the peer lane's D8 closeout calls this *"the last
  proof needed before the freeze"*. Check its log appears and
  `app/data/ops/nflverse_vintage_backup_status.json` `finished_at` moves off `2026-08-30T13:08:18Z`.
  (Today's alert file carries a benign GAP line for it — the plist bootstrapped 07:34, after the
  slot. It should self-clear Monday; nothing recorded that expectation until now.)
- **12:00 `dynasty-replay-verify`** (DG-050) — first scheduled fire, unmentioned in any tail plan.
**⛔ FIX THE TUESDAY CHECK BEFORE TUESDAY — it is structurally blind.** The spec (:1035-1037)
prescribes `launchctl list | grep -E 'league-opportunity-map|roster-capacity-audit|realized-outcome-scoring'`
expecting exit-status 0 — **but that column reads 0 for a job that has NEVER RUN** (proven on five
labels). All three Tuesday-only jobs currently show `runs = 0`. Replace with
`launchctl print gui/501/<label> | grep -E 'runs|last exit code'` and require **runs ≥ 1 AND exit 0**.
This is the same failure class as tonight's two retractions: a reading taken without checking the
conditions it was taken under.
**TUE 09-01:** the corrected check, then the SR-09/SR-19 done-mark ONLY (amendment already landed).
**WED–FRI:** buffer, minus **DG-102** (dg-land gate is pytest-only, blind to frontend breakage) —
labelled PRE-FREEZE on its ticket, the board and the queue, now unblocked by DG-104, and seven
frontend tickets landed through that blind gate this weekend. **Do it or explicitly retire the
pre-freeze claim.** Note its scope honestly: a Playwright slice covers the reduced-motion path only.
**ALSO OPEN:** DG-108 (repealed-vocabulary suppression still armed in the live API at
`players.py:227` — fires zero times today across all 27 rostered ids, but can silently replace real
evidence), DG-076's deferred backend half (no ticket), DG-106 (contracts 1.6GB/day).
**AND: PLUG THE LAPTOP IN.** `pmset` → battery `sleep 45` vs AC `sleep 0`; macOS does not replay
StartCalendarInterval jobs it slept through, so Monday's 07:00 proof, the 09:00 chain, the 10:15
backup and the 10:30 alert are all exposed. One action removes the class.
