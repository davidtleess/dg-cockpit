# DG-111 — Retire the caveat furniture: say it once, in prose, where it matters

**Layer:** 6  ·  **State:** done  ·  **Lane:** Davids-MacBook-Pro-80214  ·  **DG 3.0**  ·  **frontend-only · DG-091 phase 2A**
**Source:** David, 2026-08-29, verbatim: *"I really don't care for the caveats and the hard wording
governance."* Direct consequence; builds without the phase-2B design answers.

**Problem — counted on his live screen:** `DisclosureLine` ("Descriptive only — not
decision-grade.") renders SIX times on the front page and again on every other surface; "Status:"
renders six times; caveat blocks stack at region, subsection and row level simultaneously; the
right rail carries FEED DIAGNOSTICS + RECEIPTS + "Movement history / Series pending" panels; the
player card repeats "Experimental", "Decision support only", "No counter-argument available".

**Build:** delete the stamped furniture from the surfaces. Where a fact genuinely changes what
David would do, it survives as ONE natural sentence in the flow, placed where it applies
(e.g. stale: *"Two of our nine overnight feeds ran a day behind, so a few prices are from
Thursday."*). Diagnostics/receipt CONTENT moves behind the existing receipt triggers
(`ui/ReceiptTrigger.tsx`) and a health sheet — invisible until asked for, complete when asked.

**⚠ THE LOCKED COPY — David's ruling is the sign-off:** `DISCLOSURE_LINE` is marked exact-string
LOCKED (`lib/copy.ts:73`) and TWO byte-locked mitigation paragraphs exist
(`trade/TradeLab.tsx:119-133`, `league-pulse/LeaguePulse.tsx:73-98`). They protect the register he
repealed. Replace them with prose AND record the replacement copy verbatim in this ticket so his
review of the finished screen is the review those locks exist to force.

**Honesty law (binding):** furniture goes, FACTS STAY. Stale must still say it is stale; an
unscored player must still say it is unscored; nothing may imply a number is fresher, more
validated, or more decision-grade than it is. Deleting a truth-bearing behavior instead of
rewording it is a BLOCKING defect.

**Done looks like:** at most one honesty sentence per region on a healthy morning and zero
stamped disclosure lines; every retired string either reworded in place or reachable in a receipt;
a test proving the stale-morning and unscored-player paths still SAY so; verified in-browser.

---

## BUILT 2026-08-30 — the replacement copy, recorded verbatim

David's 2026-08-29 ruling is the sign-off that released the exact-string lock on `DISCLOSURE_LINE`
and the two byte-locked mitigation paragraphs. Every replacement string is recorded here so his
review of the finished screen is the review those locks existed to force.

### A. The stamps that are simply gone (furniture, no per-surface fact)

| Retired string | Rendered where | Why it carried no fact of its own |
|---|---|---|
| `Descriptive only — not decision-grade.` | `DisclosureLine` primitive → Daily What-Changed ×7, ChartFrame (every chart), player card, Trade Lab, League Pulse header, Roster Capacity, System Health, Accuracy Tracker | Stated the backend register `decision_supported=false`. Not a fact about any number on the screen; the honest reading of it now lives in ONE sentence (§B1). |
| `Experimental — not decision-grade.` | Roster Audit header + Roster Audit filter bar | Same register, twice on one surface. |
| `Decision support only` | Player inspector preview | Same register on a panel that renders no grade, score or delta at all. |
| `decision_supported = false` | Model Trust truth panel | A raw backend field name rendered at the user. Replaced by §B1. |
| `Experimental — not validated` | Model Trust truth panel | Replaced by §B7. |
| `Status: ok` ×5 + `Context caveats: captured_at_vs_report_generated_at — fresh (age 0h)` ×5 | Daily What-Changed structural sections | Five identical paragraphs of nothing on a clean morning. Replaced by §B4 — silence when clean, a sentence when not. |
| `Status: Synced` / `Status: Degraded` | Daily tape | A third restatement of the two tape lines above it. Replaced by §B8. |
| `No counter-argument available` · `No top drivers available` · `No risk flags available` · `No caveats available` · the `Experimental` badge | Player card evidence section | Absence of content is not content. Now render nothing — with one guard, §B3, so an all-empty block can never read as a clean bill of health. |
| `Movement history — Series pending. History accrues one verified capture per day; the line begins once enough days are on the books.` | Daily What-Changed right rail | Replaced by §B9, said once beside the blank trend slots it explains. |
| `FEED DIAGNOSTICS` + `RECEIPTS` rail panels | Daily What-Changed right rail | Content intact, moved behind §B10. |

### B. The replacement copy, verbatim

**B1 — `MODEL_STANDING_SENTENCE` (`lib/copy.ts`), replaces `DISCLOSURE_LINE`.** Rendered ONCE on
the player card (foot) and ONCE on the Model Trust panel — the two places the model's standing
changes how you read a number:
> Our model is a sharp second opinion, not a proven market-beater — weigh it accordingly.

**B2 — the unscored player** (`player/PlayerDetailCard.tsx`), replaces the `Experimental` badge over
`No active model score`. The producer's own `degradation.message` still renders verbatim beneath it:
> Not scored yet — we don't have a model score for {name}. Anything the market says below is real; the projection stays blank until our next model run.

**B3 — the all-empty evidence guard** (`player/EvidenceSection.tsx`). Only when the counter-argument,
drivers, risk flags and caveats are ALL absent:
> We don't have evidence notes on this player yet — that means nothing is written down, not that there is nothing to say.

**B4 — the stale morning** (`what-changed/DailyWhatChanged.tsx`), replaces
`Stale data caveat — the capture is 27.5 hours old. The tape below reflects the last verified capture, not this morning.`
Three branches, one sentence each:
> This morning's capture didn't land — everything below is {n.n} hours old, the last verified snapshot, not today's.

> We couldn't read when this data was captured, so treat everything below as the last verified snapshot, not today's.

> These numbers are as of {capture time}.

("as of", never "current": the report can be up to 26h old and still sit under the stale threshold.)

**B5 — the front-page subtitle**, replaces
`A daily delta surface (what changed since the prior snapshot); no verdict, no nominated move.`:
> What changed on your roster and around the league since the last snapshot.

and the market region's note, replacing `Price-discovery deltas — market overlay only, isolated from model output.`:
> Market prices — what the dynasty market is paying, kept separate from our own projections.

**B6 — a degraded region**, replaces the stacked `CaveatBlock`s. The producer's raw token is
humanized on screen and kept VERBATIM in the element's `title` and in the receipt sheet:
> Heads up: the market side came back degraded — {reason} — so treat the prices below as provisional.

> Heads up: the model side came back degraded — {reasons} — so treat the model numbers below as provisional.

> Heads up: {basis} is {n} hours old and flagged stale, so this is the last verified read rather than a fresh one.

> Heads up: part of it did not come through — {reason}.

**⚠ AMENDED 2026-08-30 by the review panel (§D.1).** The first two are now built by one shared
`laneNotice()` so the market and model lanes cannot drift apart, and they fire on ANY non-clean
state rather than only on an `aborted_reason`. A state where the comparison never ran is no longer
called a degradation:
> Heads up: we couldn't compare market prices against an earlier day — {reason} — so nothing below is a change, it's just where things stand.

The section notice keeps the age AND the basis, in that order:
> Heads up: this one is {n} hours old and flagged stale, so it is the last verified read rather than a fresh one. {what the basis measures}

and the divergence caveat block becomes:
> These are counts of divergence cards, not a proven edge — we have not validated that they predict anything.

**B7 — `trade_lab_fe_mitigation_v1`** (`trade/TradeLab.tsx`). Replaces the byte-locked paragraph AND
the disclosure line under it. Every protected fact survives — no win/lose verdict is computed, fit
is not judged, the two pricings stay separate rather than blended, a stale or missing price says so
in its own lane, the call is the manager's:
> We price both sides two ways — what the dynasty market is paying, and what our model says — and keep the two apart instead of blending them into one number. Where a price is stale or missing, that lane says so. We don't call the winner and we don't judge whether the deal fits your team: that part is yours.

**B8 — `league_pulse_fe_mitigation_v1`** (`league-pulse/LeaguePulse.tsx`). Same DOM position, ahead
of every panel; the four-signal weight table below it is untouched. Every protected fact survives —
the labels are COMPUTED from four named roster signals, the weights are disclosed, and a manager's
real intent, private valuations and willingness to trade are explicitly unobservable:
> We label each team contending, rebuilding and so on by reading four things off its roster — starter-weighted model value, roster age profile, early draft-pick balance, and taxi/development stash — weighted as shown below. That is our read of the roster, not a read of the manager: what they actually intend to do, how they really value their own players, and whether they want to trade at all are things nobody can see from here.

**B9 — the Model Trust truth panel** *(⚠ AMENDED 2026-08-30 — see §E for the string that shipped,
which restores the named benchmark)* (`trust/TrustTruthPanel.tsx`). Replaces
`Consensus-competitive, edge unproven. Engine B is statistically tied with DynastyProcess ECR expert consensus; per-fold NDCG-diff bootstrap CIs include zero.`
Not one of its three facts is softened; the bootstrap-CI evidence moves to the study on the same
surface (FoldTable / GateMatrix), where an NDCG diff belongs:
> Honest read: our model ranks players about as well as expert consensus, but it has not proven it beats the market — measured over our test seasons, the edge could genuinely be zero.

and, replacing `Experimental — not validated`:
> Nothing here has been validated against a live season yet — this is a lab result, not a track record.

**B10 — the League Pulse header**, replaces `EXPERIMENTAL — a read-only league snapshot.` + the
`Diagnostic Workspace: …` paragraph + the disclosure line (three stamps → one sentence):
> Your league at a glance — who's contending, who's rebuilding, and who to call. It's a read-only snapshot: we read each roster, we don't read minds.

**B11 — Roster Capacity**, replaces the stamp + `Capacity facts and value-at-risk ranges; no verdict, no nominated cut.` + `Artifact status: ok`:
> Where your roster is tight, and what each cut would cost you.

> Heads up: this capacity read came back {status}, so treat the ranges below as provisional. *(only when not ok)*

and, replacing `Candidates sorted by cut exposure rank as diagnostic order — not a cut sequence.`
— **⚠ AMENDED 2026-08-30 (§D.3): the first attempt inverted the fact and is NOT what shipped.**
What shipped:
> Ordered by what we know, not by who to drop: anyone with a roster-legality problem comes first, then the players we have a score for — lowest score at the top — and last the ones we can't score yet.

**B12 — Roster Audit header**, replaces `Status: active` + the stamp (silent when healthy):
> Heads up: this roster read came back degraded — treat the numbers below as provisional.

**B13 — the daily tape**, replaces `Status: Synced` / `Status: Degraded` (silent when healthy):
> Some of this data is behind — the lines above say which part.

**B14 — Accuracy Tracker**, replaces the stamp; the Model Input Fidelity paragraph is NOT a stamp
(it says what the scorecard measures) and is kept, reworded:
> Model Input Fidelity checks one thing: whether what players actually did on the field matches what the model assumed they would do. It grades our inputs, not the players.

**B15 — the receipt sheet** (`what-changed/DailyWhatChanged.tsx`), which now holds the whole
retired rail, shut by default, under the summary `Where this comes from`: report build time, market
capture window + source, model window, projection-basis line, feed statuses, and
`Producer reasons, verbatim: …` — every raw token the surface humanized upstairs.

**B16 — `describeStatusToken` fallback** *(⚠ SUPERSEDED 2026-08-30 by DG-109's dictionary — see
§E. `describeStatusToken` no longer exists; an unmapped token now routes to the receipt layer rather
than being dressed as prose, which is the stricter and correct answer.)* (`lib/copy.ts`): an unmapped token is now HUMANIZED
(`market_snapshot_stale` → `Market snapshot stale`) instead of rendering raw. Reformat only — no
word added, removed or reordered — the `console.warn` still fires, and every call site keeps the
verbatim token in a `title` attribute or the receipt sheet.

### C. Proof

- Real chromium, both builds, both widths. Stamped furniture across the seven nav surfaces:
  **BEFORE (live trunk :8000) 14 at 1440px and 14 at 390px → AFTER (this branch) 0 and 0.**
  Before, per surface: Daily What-Changed 7 · Roster Audit 2 · Trade Lab 1 · Roster Capacity 1 ·
  League Pulse 1 · Model Trust 1 · Accuracy Tracker 1.
  **⚠ CORRECTED 2026-08-30 — that measurement was narrower than the claim it certified.** It
  scanned for the five strings this commit deleted, so its zero could not fail. A refuter widened
  the scan by one register and found THREE more still rendering: `Context signal — not
  decision-grade.` on Roster Audit (`roster/QbContextSection.tsx`, and David's live API returns
  five QB context cards, so it was on his screen), plus `MET = point-estimate gate state, not
  decision support` and `internal model grade — not a market-edge or decision-support claim` on
  Model Trust. All three are now retired or reworded (§E), and the guard is as wide as the claim.
- Stale morning driven in a real browser at 1440 and 390 (preview aged the report by 27.5h):
  renders `This morning's capture didn't land — everything below is 27.5 hours old, the last
  verified snapshot, not today's.`, keeps `.dg-wc--stale`, zero stamps, the word "caveat" gone.
- Unscored player + all-empty evidence proven by render tests
  (`player/PlayerDetailPage.test.jsx`, `player/EvidenceSection.test.tsx`).
- Tree-wide source scan `ui/retiredFurniture.test.js` — now TWO scans: the five exact strings, and
  the PHRASES that make a string a member of the repealed register (`not decision-grade`,
  `decision support`/`decision-support`). Watched RED: planting `"Trade signal — not
  decision-grade."` in `trade/TradeLab.tsx` fails the phrase scan with
  `trade/TradeLab.tsx still says "not decision-grade"`.
- **After the DG-109 rebase (this branch is now 1 commit on top of `origin/main` 59bab53e):**
  `npm run test` **387/387 across 77 files** · `npm run typecheck` 0 · `npx biome check .` exit 0
  (7 warnings, all pre-existing at commit fd372fed) · `npm run banned-language` 0 · `npm run build`
  clean · `renderRule.test.tsx` (DG-109's enforcement) 17/17 over the merged result ·
  the 16 pytest files that read `frontend/src` — **144 passed**, including
  `tests/contract/test_league_opportunity_no_verdict_t4c.py`, which fails on the pre-fix branch.

---

## D. REVIEW PANEL — 2026-08-30. What the four refuters found, and what was done.

Four BLOCKING findings. All four were re-verified from source before being fixed.

**1 · HONESTY (two refuters, independently, one of them in a real browser): the market lane's
`insufficient_history` state was DELETED, not reworded.**
`src/dynasty_genius/what_changed/daily_diff.py:111-117` returns `status: "insufficient_history"`
with NO `aborted_reason`, no `roster_deltas` and no `top_movers` when fewer than two FantasyCalc
capture dates exist. `MarketRegion`'s new heads-up was gated on `market.aborted_reason` alone, so on
that morning the region fell silent and its empty-state copy — *"No player movement on this tape —
market values held steady overnight."* — stood as an affirmative claim about a comparison that was
never made. Before this ticket the rail printed `Market feed: insufficient_history` in
always-visible text; moving it into a receipt sheet shut by default turned a cluttered truth into a
clean falsehood. That is the ticket's own BLOCKING shape.
FIXED, and wider than the report:
  · both lanes now build their notice through one shared `laneNotice()`, so they cannot drift apart
    again — the model lane already read `comparison_window.status` and the market lane did not;
  · the market notice fires on `aborted_reason` OR any non-`ok` status (the closed set is
    `ok | unavailable | insufficient_history`);
  · **the false claim itself is gone.** Where the comparison did not run, the empty state now reads
    *"No day-over-day comparison for your roster on this tape."* instead of "held steady" — on the
    model side too, where `comparison_window.status` marks the same condition;
  · a comparison that never ran is no longer called a DEGRADATION (`insufficient_history`,
    `baseline_holding`): *"Heads up: we couldn't compare market prices against an earlier day —
    Not enough days captured yet to compare one to the next — so nothing below is a change, it's
    just where things stand."* Calling a young capture history "degraded" is the DG-047 cry-wolf
    pattern in new clothes;
  · `producerReasons()` reads the MARKET comparison window as well as the model's, so the receipt
    records the token verbatim;
  · `market_source` moved off the capture-window conditional onto its own line — the sheet has to be
    complete when asked, and it was losing the price feed's name whenever the window had no dates.
  Three regression tests, and the first one was **watched RED**: reverting the gate to
  `market.aborted_reason` alone fails
  `"speaks when the market lane has too little history, and drops the held-steady claim"`.

**2 · BLAST RADIUS: a Python contract test pinned the retired League Pulse paragraph by reading the
`.tsx` source, and it is in the land gate.**
`tests/contract/test_league_opportunity_no_verdict_t4c.py:11-14,257-260` asserted the
`Diagnostic Workspace: …` string is present in `LeaguePulseHeader.tsx`. Reproduced: 1 failed, 6
passed on the branch; 7 passed on main. FIXED — `HEADER_COPY` is now the replacement sentence, with
the reason recorded in the test, and the No-Verdict cordon it exists to enforce is *strengthened*,
not weakened: the file must still contain no "recommend", and now no "nominat" either. 7 passed.

**3 · BLAST RADIUS + HONESTY: the Roster Capacity sort-basis sentence inverted the fact it
replaced.** *"Sorted most expendable first — if you have to cut someone, start at the top"* is false
against `src/dynasty_genius/roster_cut_engine.py`, and it is the one line on that surface a manager
would act on. Verified at source: `forced_candidates` are PREPENDED with `cut_priority=0` (:288-300)
— IR/reserve compliance problems, ordered for roster legality, so an injured star in an illegal
reserve slot leads the list — and the remainder sorts by `_tier_sort_key` (:171-180) whose PRIMARY
key is the DATA-AVAILABILITY tier from `_scoring_tier` (:161-168): A = we have an xVAR percentile,
B = a dynasty value score, C = neither, D = pre-model. Value is only the secondary key, so every
scored player — your best included — sorts ahead of every unscored one. Neither the tier nor
`candidate_source` is rendered in the table, so nothing on screen corrects the sentence. The retired
string ("…as diagnostic order — not a cut sequence.") existed to forbid exactly that reading.
FIXED — the line now describes the real order:
> Ordered by what we know, not by who to drop: anyone with a roster-legality problem comes first,
> then the players we have a score for — lowest score at the top — and last the ones we can't score
> yet.

**4 · BLAST RADIUS + EVIDENCE: the repealed register still shipped on two of the seven surfaces the
ticket certified clean.** See the §C correction. FIXED, and the instrument widened so it cannot
recur (§E).

### Minors fixed in the same pass

- `retiredFurniture.test.js` scanned five whole strings, so a sixth VARIANT of the same register
  passed. It now also scans the register's phrases. (This is what makes §C's claim true rather than
  merely unfalsifiable.)
- Roster Capacity's non-`ok` heads-up fired on `blocked` too — telling the reader to treat "the
  ranges below" as provisional on the one path that renders no ranges at all, and softening
  "blocked" (nothing shown) into "provisional" (tentative). Now `degraded`-only; the blocked line
  says *"…so there are no numbers to show — not zero cuts required, no reading at all."*
- The Roster Capacity caveat `<li>` had no `title` and that surface has no receipt sheet, so the
  producer's exact token was nowhere in the product. Restored.
- The trend note (*"Trend lines fill in as daily prices accrue…"*) rendered unconditionally and
  would contradict the first real sparkline the page draws. Now gated on an actually-pending slot.
- League Pulse's withheld line asserted a cause the data does not carry: `dropped` sums six
  counters, and `partner_rankings` increments on a cross-artifact join miss of a perfectly READABLE
  record (`league_pulse_assembler.py:273-276`), while opportunity cards drop fail-closed on purity
  rules (:176-185). *"dropped as unreadable"* → *"could not be matched up"*.
- `RosterAuditHeader`'s justification comment was false (nothing reads `.dg-roster__status`), and a
  healthy roster shipped an empty `<div>`. The element is now conditional; the one real reader
  (`[data-status="degraded"]`) is on the branch it asks about.
- Risk flags, drivers and caveats on the player card are unlabelled bullet lists. `aria-label`s
  added. *(Telling them apart VISUALLY is phase-2B design work — recorded in §F, not done here.)*
- `MODEL_STANDING_SENTENCE` shipped under a class with no CSS rule. `.dg-player-detail__standing`
  added, inheriting the muted never-directional treatment the retired badge had; the three orphaned
  rules left behind by the retired elements are removed, and the one-line CSS debt reduction is
  recorded in `rawCssAuditBaseline.json` (`roster/RosterAudit.css` font sizes 3 → 2).
- `DESIGN.md:46` still told every future builder to compose from `CaveatBlock` and `DisclosureLine`.
  Corrected, with `TokenNotes` named as what replaces them.

---

## E. THE DG-109 REBASE — where two tickets met, and who won each argument

DG-109 landed first (`origin/main` 59bab53e). Both tickets rewrite `lib/copy.ts`,
`DailyWhatChanged.tsx`, `EvidenceSection.tsx`, `LeaguePulseHeader.tsx`, `RosterCapacitySandbox.tsx`,
`TrustTruthPanel.tsx`, `RosterAuditHeader.tsx` and eight test files. Thirteen files conflicted. Every
resolution kept BOTH sides' facts:

- **`lib/copy.ts` — DG-109 wins the architecture.** Its dictionary (`lookupToken`/`describeToken`,
  `mapped:false` → receipt layer) supersedes DG-111's `describeStatusToken`/`humanizeToken`, and
  that is the better answer to the same problem: DG-111's humanizing fallback dressed an unmapped
  token as prose in body copy, which the DG-091 spec §1 forbids and a refuter flagged. DG-111 keeps
  `MODEL_STANDING_SENTENCE`, deletes `DISCLOSURE_LINE` (which DG-109 preserved), and adds dictionary
  sentences for the two producer aborts the front page can actually hit
  (`missing_sleeper_snapshot`, `missing_structural_artifact`).
- **The receipt sheet now declares `data-receipt`** (`renderRule.ts:48`). Without it, DG-111's sheet
  would have been the only raw copy on the front page and would have broken the rule DG-109 enforces.
- **`TRUST_TRUTH_COPY` — a merge, not a pick.** DG-111's plain voice, DG-109's precision. The
  comparator is NAMED again, because which comparator was measured is part of the fact, and
  `eval/backtest_harness.py:66-68` is explicit that `dp_archive` is DynastyProcess expert-consensus
  ECR (2QB) and **not** a FantasyCalc trade-market value — so the sentence says "expert consensus"
  and never silently upgrades it to "the market":
  > Honest read: our model ranks players about as well as expert consensus — DynastyProcess's 2QB
  > rankings, which is what we measure it against — but it has not proven it beats them. Season by
  > season across our test years, the range around its ranking-quality edge still includes zero.
- **`EvidenceSection` — both rules hold, because they are about different things.** DG-109's
  "absence renders nothing" governs per-field rows ("No risk flags available"), and those stay gone.
  DG-111's §B3 governs the WHOLE block being empty, and it stays: a card showing a projection with
  no evidence at all looks vetted, and it is not. DG-109's `renders nothing when the evidence is
  genuinely absent` test is rewritten to assert the merged boundary — no absence rows, one sentence
  that locates the gap in OUR notes rather than in the player.

### The three retired strings from §C's correction

| Was | Now | Why |
|---|---|---|
| `Context signal — not decision-grade.` (`roster/QbContextSection.tsx`, class literally `dg-roster__disclaimer`) | *"How his passing has actually gone — context for reading the roster above, not a grade on him."* | Pure furniture on a surface this ticket certified 2 → 0. The fact it stood on (`context_role="context_signal"`, `decision_supported=False` on `QBContextCard`) is said in words. |
| `A gate reading "met" is a single point estimate, not decision support` (`trust/GateMatrix.tsx`) | `A gate reading "met" is a single point estimate — it does not mean the model is proven` | A legend, and load-bearing — so it is REWORDED, not deleted. Same fact, out of the repealed register. |
| `internal model grade — not a market-edge or decision-support claim` (`lib/trustCopy.ts`, rendered by the shell TrustStrip on EVERY surface and by the Model Trust footer) | `our own grade, not a claim that it beats the market` | Both facts survive word for word in meaning — the grade is OURS, and it is not a claim to beat the market — said the way David asked. |

---

## F. Residual, NOT in this ticket's scope

- The player card still renders raw evidence keys from the backend in a few places DG-109's
  dictionary has not reached; those are DG-091 §3.5 copy-dictionary work.
- **Telling a risk flag from a top driver VISUALLY on the player card.** They are two unlabelled
  bullet lists with one CSS rule between them (`.dg-evidence__risk--age-cliff-amber`). `aria-label`s
  are added here so assistive tech can tell them apart; a sighted reader still cannot. That is
  DG-091 phase-2B design work and needs the visual gate re-baselined — named here so the gap is not
  mistaken for a miss.
- `EvidenceSection` still does not render the backend's per-FIELD distinction between "no
  counter-argument was written" and "one was written and suppressed" beyond DG-109's
  `evidence_suppressed_banned_term` note. The receipt-sheet pattern this ticket built for
  DailyWhatChanged is the natural home for it.
