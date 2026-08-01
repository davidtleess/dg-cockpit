# DATA SOURCE INTAKE — David's named sources, captured at the moment he says them

**Why this file exists.** On 2026-07-30 David asked whether we were organised on our layer 1
inventory and discovered that sources he had named over months lived scattered across research
docs, evidence files and pane transcripts, with no single place that answered "what do we have
and what are we paying for." A 07-29 census existed and never reached him as a decision.

**THE RULE: the moment David names a data source, it lands HERE, verbatim, with the date and
where he said it — before anything is decided about it.** The table is not only for NEW sources:
every source the product claims to use gets a row, especially the PAID ones, because "is it
working and am I paying for it" is the question this file exists to answer at a glance. Capture is not gated on evaluation.
This file is Tower's intake ledger; the product-side register is the crew's artifact and must
reconcile against this one.

| # | Source | Named | Where | Paid/Free | State |
|---|--------|-------|-------|-----------|-------|
| 1 | **footballguys.com** | 2026-07-30 22:20 | to Tower, directly | UNVERIFIED — Tower did not ask and will not assume | **NOT a data source in the product today. Zero code references (grep 22:21).** It appears ONLY as cited research in five `docs/strategies/` briefs — Harstad's mortality-table / expected-years-remaining framing, Superflex replacement-level canon, and Bell/Dan seasonal value multipliers. So its IDEAS were absorbed; its DATA was never ingested. Routed to the crew register the same minute. No evaluation, adoption or ingestion authorised. |
| 2 | **PlayerProfiler** | pre-2026-05-03 (in the source contracts doc); re-raised by David 2026-07-30 22:23 | contracts doc + David tonight | **PAID (subscriber) — per docs/data-source-contracts.md, which specifies an authenticated session** | **NOT WORKING.** Adapter `app/data/playerprofile.py` exists and NOTHING imports it. 07-29 census: current probe returns **874/874 parse errors**; real values exist only in an older cache and a v2 curated table. The credential location the contracts doc names (`~/.config/dynasty-genius/`) **does not exist on this machine** (verified 22:23, directory absence only — no credential file was opened). Authority it was meant to supply: College Dominator, Breakout Age, athletic testing. **DECISION OWED TO DAVID: wire it up or stop paying.** |
| 3 | **PFF (Pro Football Focus)** | pre-2026-05-03 (contracts doc) | contracts doc | **PAID (subscriber)** | **PARTIALLY WORKING, manual only.** Real data on disk (`app/data/pff_exports/`, TE identity artifacts from 05-16) but it arrives by **manual CSV export**, not the automated authenticated path the doc describes — consistent with the missing credential directory above. Consumed by one script, `scripts/build_college_features.py`. Authority: snaps, route participation, grades, YPRR. |
| 4 | **FantasyPros** | David 2026-07-30 22:25 | to Tower | FREE (via the DynastyProcess archive; no vendor account involved) | **HISTORICAL ONLY, NO LIVE FEED.** Present two ways: as an identity ID space (`fantasypros_id` in the identity registry / coverage matrix / draft-capital manifest) and as ECR values inside the DynastyProcess archive — 2,185 player-date rows across **four historical snapshot dates**. 07-29 census: *"No current-feed path exists"*, no declared cadence. |
| 5 | **NFL Next Gen Stats** | David 2026-07-25 (his GitHub-sweep order) and again 2026-07-30 22:25 | to the crew, then to Tower | **FREE** | **NOT INGESTED — and the pipe is already installed.** The 07-25 sweep (`docs/agent-ledger/evidence/2026-07-25/codex_github_data_source_sweep.md`) VERIFIED that nflverse publishes weekly passing/rushing/receiving NGS aggregates from 2016, updated nightly in season, and that `nflreadpy` — which we already depend on — exposes them. Full player-tracking data is NOT public; aggregates are. **This is the cheapest unexploited source on the board.** |
| 6 | **Dynasty Nerds** | David 2026-07-30 22:26 | to Tower | n/a | **NOT A DATA SOURCE HERE — it is a COMPETITOR.** Appears only in PRODUCT.md / system-design.md positioning: the product *"lives in the Sleeper / DynastyNerds / KeepTradeCut category and is built to be more honest than any of them."* No adapter, no data, no ID space. If David means it as a source, that is a new decision, not a recovery. |

## ⚠ CORRECTION, David 2026-07-30 22:41
"Dynasty Genius" in his 07-25 list is THE NAME OF THIS PRODUCT. Tower, Claude and Codex each
filed it as an unidentified third-party vendor and two asked David to explain his own product.
CORRECTED TARGET LIST = SIX: PFF, CFBD, PlayerProfiler, FantasyPros, Footballguys (paid) plus
NFL Next Gen Stats (free). **We are getting ONE of the six, and it reads a two-month-old cache.**

## ⭐ THE 07-25 GITHUB DATA-SOURCE SWEEP EXISTS — and nobody acted on it
`docs/agent-ledger/evidence/2026-07-25/codex_github_data_source_sweep.md`, produced on David's
07-25 order. It carries VERIFIED capability, maintenance and cadence findings on the nflverse
release store and `nflreadpy` — play-by-play, player/team stats, rosters, snap counts,
participation, **NGS**, injuries, depth charts, draft picks, PFR advanced stats, FTN charting,
contracts. **Second parked decision found tonight. Surface it with the ingestion contract.**

## Earlier named sources, recovered 2026-07-30 from transcripts and evidence files
Recovered rather than captured — they were never intaken at the time, which is the defect above.
- **2026-07-25, to the crew** (verbatim): *"i would force you to continue using sources that are
  free and work, as well as new ones like dynastyprocess (their GITHUB TOO) and nfl next gen
  stats. even if i have to set up a claude code manual export in off cases."* Plus: *"I also want
  a full blown sweep of github for valuable repos."*
- **2026-05-10, to the crew**: pasted a full research document, *"The Dynasty Genius Data
  Architecture: Exhaustive Evaluation of NFL and NCAA Data Acquisition Strategies."*
- **NOT FOUND:** any record of a data-source list given to the Studio pane. Studio's disk and its
  full session transcripts were searched 2026-07-30 22:1x. If it was said there, it is not
  recoverable — Studio's pane keeps no scrollback.

## What the 07-29 census established (committed: 6c5c1ae, 38ef301)
ACTUALLY INGESTED: Sleeper · FantasyCalc · nflverse via nflreadpy · CFBD · PlayerProfiler caches ·
PFF manual exports · DynastyProcess/FantasyPros archive · Sleeper CDN.
DECLARED BUT NOT IN PRODUCTION: MFL · RAS · RotoViz · Campus2Canton.
BROKEN: PlayerProfiler current probe = 874/874 parse errors.
PARKED ON DAVID SINCE 07-29, NEVER SURFACED: `minimum_ingestion_contract_proposal_claude_v4.md`,
headed "For David to accept, alter, or reject."
