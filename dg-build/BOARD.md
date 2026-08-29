# BOARD — DG 3.0

**Current sprint:** none open

| ID | Title | Layer | State | Lane |
|---|---|---|---|---|
| DG-001 | What actually drives the Engine B projection | 3 | answered — **qualified by DG-017** | crew forensics |
| DG-002 | Walk-forward validation for RB, WR, TE | 3 | todo | — |
| DG-003 | Give the projection a distribution, not a number | 3 | todo | — |
| DG-004 | Stale leakage FAILURE report in repo root | 3 | **done — stale one-off artifact deleted; systemic guards live** | ClaudeFable5-DG004-20260825 |
| DG-005 | Separate player talent from team environment | 3 | todo | — |
| DG-006 | Model the career arc as a sequence | 3 | todo | — |
| DG-007 | Learn when to act, not just what things are worth | 3 | todo | — |
| DG-008 | Opportunity Delta · Market Disconnect · Efficiency Sustainability | 3 | todo | — |
| DG-009 | Regime shifts — new coach, scheme, quarterback | 3 | todo | — |
| DG-010 | Position-specific age curves | 3 | todo | — |
| DG-011 | Stress-test outside the training distribution | 3 | todo | — |
| DG-012 | News, injury reports and pressers as features | **1** | todo | — |
| DG-013 | A feature store you can query as-of a date | **2** | todo | — |
| DG-014 | Deployed models were fit on 2018–2021 only | 3 | todo | — |
| DG-015 | Model card contradicts the training code | 3 | todo | — |
| DG-016 | TE "validation report" doesn't say what it validated against | 3 | todo | — |
| DG-017 | We validate a scaled model and deploy an unscaled one | 3 | finding CONFIRMED, fix unbuilt; **FALSIFIER RUN 08-28 night (report-only, `69b6c194` on ticket/DG-017): fired — usage weight 9→30% (QB), 0.3→12% (RB), 3→32% (WR), 1→35% (TE) under scaled+tuned fit, accuracy within noise; DG-001 attribution falls as football-fact, stands as artifact-description; stakes re-priced = honesty, not RMSE** | — (lane retired, branch pushed) |
| DG-018 | Standing measurement: does the model beat the market? | 3 | todo | — |
| DG-019 | Market appears to over-disperse by ~2× | 3 | todo | — |
| DG-020 | Get more than four market snapshots | **1** | landed — merge `ac8ac4a4` 08-28: 4 → 480 dates (dp_archive monthly 2021-02→2025-06 commit-anchored + fc_history_api daily 2025-07→08-27); DB install pending ~10:15; adversarially reviewed pre-land (provenance labels fixed) | — |
| DG-021 | 114 players told an Engine A prior was used when none exists | 3→6 | **done — merge `b291107f` on `main`, DEPLOYED 10:21: live artifact 114→0 false rows, same 114 now honest** | ClaudeFable5-DG021-20260825 |
| DG-022 | Players with no canonical id can never be graded | **2** | **done — merge `20807368` on `main`: frozen-prediction membership lane, real-surface-QA proven** | ClaudeFable5-DG022-20260825 |
| DG-023 | Health gate labels good participation data "empty" | **1** | **done — merge `b4662707` on `main`** | Parallel-DG023-20260825 |
| DG-024 | PPG counts **ALL GAMES**, postseason included — David 2026-08-19 | 3 | **decided** | — |
| DG-025 | Ablate usage features under a scaled, tuned fit — the deciding test | 3 | todo | — |
| DG-026 | Train and test labels share the 2023 season | 3 | todo | — |
| DG-027 | Penalty chosen by random CV on repeated-player data | 3 | todo | — |
| DG-028 | "We changed nothing" check cannot see the artifacts it guards | 3 | landed 08-28 night — seeing guard hashes all 10 registry artifacts + serving-binding checks (manifest hijack, v1-fallback scan — both review-found BLOCKERS closed RED-first); v1 fallback custodially registered + backup-covered | — |
| DG-029 | Is feature season 2024 absent by design or by gap? | **2** | **done — BY DESIGN, same mechanism; merge `849f3eaf` on `main`** | ClaudeFable5-DG029-20260825 |
| DG-030 | Compare model families to each other, not just to naive | 3 | todo | — |
| DG-031 | Salvage the outcome resolver and Coverage contract | 1 → 3 | **done — merged in PR #159** | CodexCrew20260819 |
| DG-032 | Six ledger trees, three versions of the same day; reconcile the channel | process | todo | — |
| DG-033 | A producer can abort and still be graded fresh | **1** | **done — merge `30a91c33` on `origin/feature/outcome-loop-week1`** | ClaudeOpus5-DG033-20260824 |
| DG-034 | Backup health reports `ok` while the backup is failing | **1** | **done — 52e7dfc9, hand-landed on `feature/outcome-loop-week1`** | ClaudeOpus5-DG034-20260823 |
| DG-035 | Capture chain silently does not run unless David is logged in | **1** | option (b) CLOSED by DG-044; option (a) DEFERRED post-season (David 08-26) | — |
| DG-036 | A failed backup can leave the previous run's `completed` marker standing | **1** | **done — merge `de551d22` on `origin/feature/outcome-loop-week1`** | ClaudeOpus5-DG036-20260824 |
| DG-037 | No ticket can land through `dg-land.sh` — five mechanisms | process | **done — 5 mechanisms fixed, dry-run green** | ClaudeOpus5-DG037-20260823 |
| DG-038 | `dg-land.sh` cannot merge into any base that is checked out somewhere | process | **done — detached merge + `HEAD:$BASE` push; dry-run now proves the merge; gated by `tests/test-dg-land.sh`** | ClaudeFable5-DG038-20260824 |
| DG-039 | A blocked roster-capacity audit writes nothing; last week's audit stands as current | **1** | **done — landed 08-26: always-written status marker, artifact keeps preserve-last-good** | ClaudeFable5-DG039-20260826 |
| DG-040 | The daily nflverse capture has never once succeeded — upstream renamed contracts `cols` | **1** | **done — merge `6b5dceb9`, deployed to the trunk, capture run green same day** | ClaudeFable5-DG040-20260824 |
| DG-041 | The inputs gate is permanently red — participation can never serve the season it is asked for | **1** | done | ClaudeFable5-DG041-20260825 |
| DG-042 | David's "all games" PPG ruling is honoured by accident, not enforced (SR-21) | 3 | **done — merge `c2b11f0a` on `main`** | ClaudeOpus5-DG042-20260825 |
| DG-043 | Player card two-lane furniture fails contrast, markup, and mobile width (pre-existing; found by DG-022 QA) | **6** | todo | — |
| DG-044 | SR-11: the daily capture gap alert — the only detection channel that will exist (absorbs DG-035 option b) | **1** | **done — merge `b1b888be`; INSTALLED + LIVE-FIRE ACCEPTED 08-26 12:00 (banner seen)** | ClaudeFable5-DG044-20260826 |
| DG-045 | SR-09: the dependency-ordered fail-soft daily chain (steps 1-7 BUILT + REVIEWED D4; LANDED + swap EXECUTED D5; step 8 = D8) | **1** | landed — merge `4048f25a` on main 08-27; D5 sitting DONE (12 labels — 11 + catchup-guard; slots 1/1/2/2); SR-09 closes after D8's SR-19 exercise | ClaudeFable5-DG045-20260826 |
| DG-046 | The common-cohort divergence fix is built, tested, and NOT WIRED IN (archive stores raws — recomputable) | **5** | **done — merge `e976b1e2`; PRODUCTION-ACCEPTED 08-26 14:00 (rebased artifact live)** | ClaudeFable5-DG046-20260826 |
| DG-047 | Morning report staleness caveat cries wolf — was SR-20 substance; weekly section now cadence-aware | **6** | **done — landed 08-26, SR-20 D10 slot FREED** | ClaudeFable5-DG047-20260826 |
| DG-048 | Layer 1 Daily Control — RETIRED on David's ruling 08-26; runner refuses every mode, module lives on as library | **1** | **done — landed 08-26 (incident during build: see ticket)** | ClaudeFable5-DG048-20260826 |
| DG-049 | Extend the capture-gap alert to the two unmonitored event streams (SR-10b) | **1** | **done — landed 08-26; every capture store now has a detection channel** | ClaudeFable5-DG049-20260826 |
| DG-050 | Replay-reproducibility harness: prove snapshot + parser version reproduces normalized content | **1** | landed 08-28 night — 16 streams replay live (19 reproduced / 1 named legacy vintage / 0 mismatch); found+fixed a real §6.2 violation (fc int-volatility hash shape); sanctioned verifier in the five ingestion walls; NOT yet scheduled (ops decision) | — |
| DG-051 | Catalog as single source of truth: generate or mechanically reconcile scheduler, freshness, and backup co | **1** | todo (foundation, 3d) | — |
| DG-052 | End-to-end restore rehearsal with dated evidence; backup class joins per-store health | **1** | todo (foundation, 2d) | — |
| DG-053 | Crosswalk vintages: capture ff_playerids on cadence before the season burns identity truth | **2** | **done — merge `34a9a970` on `main` (pre-freeze per David); plist install rides Thu's launchctl sitting** | ClaudeFable5-DG053-20260826 |
| DG-054 | One versioned name normalizer producing staging keys | **2** | landed 08-28 night — dg_name_normalizer.v1 frozen (39 tests incl. hypothesis properties; sentinel-string + bytes hardening from review, fold-side so idempotence holds); additive only, consumers migrate later, re-keying stays post-season | — |
| DG-055 | Typed facts and the storage pilot: retire the 501-TEXT-column store through the seven proofs | **2** | todo (enabler, 6d) | — |
| DG-056 | Owned bitemporal identity: mint canonical IDs and run the six-step migration | **2** | todo (enabler, 10d) | — |
| DG-057 | Hashed TrainingSpec with load-time verification — serving that can refuse the wrong artifact | **3** | landed 08-28 night — spec-hash sidecars + verify_artifact (refusal / pre_spec_artifact); 10 deployed artifacts grandfathered by measured sha, list pinned byte-for-byte; engine_b/rookie loaders deliberately deferred to DG-058 | — |
| DG-058 | The §8.3 promotion chain: safe JSON artifacts, equivalence tests, and a PromotionReceipt | **3** | todo (enabler, 5d) | — |
| DG-059 | ScoringEnvelope — separate raw inference from PVO assembly | **3** | todo (enabler, 2d) | — |
| DG-060 | Versioned universe snapshot contract for coverage claims (§8.6) | **3** | todo (enabler, 2d) | — |
| DG-061 | Version the scoring constants and declare their calibration-evidence state | **3** | todo (enabler, 1.5d) | — |
| DG-062 | Manager identity reconciliation across the four-season transaction chain | **4** | todo (enabler, 1.5d) | — |
| DG-063 | Manager behavior profiles (§9.1) — the layer's flagship deliverable | **4** | todo (direct, 3d) | — |
| DG-064 | Pick appreciation as a versioned analytical policy, not a static slot curve | **4** | todo (direct, 2d) | — |
| DG-065 | Posture label contradiction on the morning surface (REBUILDING vs UNCLASSIFIED) | **4** | todo (enabler, 0.5d) | — |
| DG-066 | Declared competitive horizon and risk preferences (§9 lane 8) | **4** | todo (enabler, 1d) | — |
| DG-067 | League format and analytic coefficients out of code constants, into versioned policy | **4** | todo (enabler, 2d) | — |
| DG-068 | Per-lane version streams for the league graph (derive from the archived snapshots) | **4** | todo (foundation, 1d) | — |
| DG-069 | The divergence band is an unversioned constant — make every band versioned, evidence-backed, disclosed | **5** | todo (enabler, 1d) | — |
| DG-070 | Build the §10.1 change-event stream over the rebased divergence — and backfill the season from the PIT st | **5** | todo (direct, 2.5d) | — |
| DG-071 | The Evidence Registry: a typed claim store, generalized from the QB-1 program | **5** | todo (enabler, 5d) | — |
| DG-072 | DecisionOpportunity Object and an executable ordered ClaimLevel with fail-closed composition | **5** | todo (enabler, 5d) | — |
| DG-073 | Scenario 2: hold-versus-move for a David-selected player — the first DOO client | **5** | todo (direct, 3d) | — |
| DG-074 | Scenario 4: trade-partner EVIDENCE panels — receipts, not context cards | **5** | todo (direct, 2.5d) | — |
| DG-075 | Read-model store: precompute, publish atomically, serve with receipts | **6** | todo (enabler, 3d) | — |
| DG-076 | Frontend build manifest — source SHA, OpenAPI hash, build timestamp | **6** | todo (enabler, 0.5d) | — |
| DG-077 | Complete the resource layer: dedup, stale state, contract_mismatch, receipt invalidation | **6** | todo (enabler, 1.5d) | — |
| DG-078 | Belief archive read model — what we believed about a player, dated | **6** | todo (enabler, 2d) | — |
| DG-079 | Turn release evidence into a gate — goldens, state matrix, CI wiring | **6** | todo (enabler, 1.5d) | — |
| DG-080 | SR-15: Trade Lab search renders results for the WRONG query (stale-response race) | **6** | done | — |
| DG-081 | SR-16: Morning Room hero counts a number David does not act on (his roster's movers instead) | **6** | done | — |
| DG-082 | The catch-up guard's timer dozes off: launchd pends StartInterval during idle | **1** | landed — merge `27ab6af2` 08-28, hybrid schedule (96-slot lattice + interval) + per-label class-(h) lines; guard label swapped same morning; first lattice tick PROVEN 09:02:00 | Davids-MacBook-Pro-20944 |
| DG-083 | SR-10a (pulled to D6): register market_divergence_history — the schedule-drift block | **1** | landed 08-28 — the only unbuilt SR-10a piece (steps 1/2/4/5 had landed via DG-044); capture-health gains StoreScheduleDrift, config v3 chain_step wirings, OpenAPI additive; adversarially reviewed | ClaudeFable5-DG083-20260828 |
| DG-084 | SR-14 (pulled to D6): forward-capture NULL xVAR — record honestly, fabricate nothing | **1** | landed 08-28 — driver reads valuation xvar; daily_diff guards ALL THREE delta sites (third found by pre-land review); 468 historical rows stay honest NULLs; proof = tomorrow's 09:00 capture (same-day re-run would hit immutability, correctly); FABRICATION CHECK Wed 09-02 morning | ClaudeFable5-DG084-20260828 |
| DG-085 | Drift block presents a stale chain report as a current reading (DG-083 review minor) | **1** | landed 08-28 night — chain_report_stale:<date> basis, null drift fields on any not-today report; report-wide staleness by newest stamp | ClaudeFable5-DG085-20260828 |
| DG-086 | universe_pvo_batch.py never populates xvar_percentile_position — dvs_pct stays NULL downstream | 3 | todo (filed 08-28 night from DG-084's find; blocks real dvs_pct recording) | — |

DG-001 through DG-011 came from the independent consultant brief of 2026-08-18, except DG-004,
which Tower found while checking evidence for DG-002.

DG-014 and DG-016 came from crew forensics on 2026-08-18 and were verified independently by Tower
the same night. DG-015 fell out of that verification.

DG-012 and DG-013 also came from that brief but are **not** layer-3 work and are stamped where they
belong.

---

**Dropped**

| ID | Title | Why |
|---|---|---|
| — | | |

---

**Board hygiene, 2026-08-23.** The seven Lane cells above were rebuilt from the ticket files, which
are the side the tooling reads (`dg-work.sh:39`) and therefore the correct side. They had read `—`
here while the ticket files named live lanes — a reader picking work off this board could have
collided with a claimed worktree.

**~~One conflict NOT resolved~~ RESOLVED by David's word 2026-08-28:** DG-017's marker now reads
"finding CONFIRMED, fix unbuilt" in both places — the problem is real (verified 08-18), the fix
(one pipeline object for eval+deploy) is unbuilt and stays in the post-freeze L3 chain.

All nine `ticket/DG-*` branches are on `origin` as of today. Six worktrees (DG-014/020/021/022/023/029)
still predate the DG-037 tooling fix and cannot pass `dg-land.sh`'s dirty-tree gate; everything in
them is now pushed, so remove-and-recreate is safe.

---

**2026-08-24.** DG-033 landed as merge `30a91c33`. **Its ticket had its two artifacts backwards**,
and the correction is worth carrying: `pvo_refresh` was correctly diagnosed but has never once fired
(0 aborts against 126 `ok`), while `feature_refresh` — bundled in almost as an afterthought — is the
one that has actually failed twice, and the ticket's fix would not have seen it. A green ticket is not
the same as a closed hole; check which half of a ticket the evidence actually supports.

`roster_capacity` was investigated on David's word and deliberately NOT changed — filed as DG-039.
`run_roster_capacity_audit.py:101` guards the only write, so its `status` key can only ever say `ok`;
declaring it would have been a gate that can never fire. `what_changed` and `league_opportunity` write
no status at all, so their silence is correct. **Three of the five undeclared artifacts should stay
undeclared** — the ticket's premise that an unread `status` is always a defect does not hold.

---

**2026-08-24.** DG-036 landed. Two things a reader of this board should know:

**`dg-land.sh` still cannot land a ticket unaided — DG-038.** DG-037 fixed the five mechanisms that
stopped a worktree reaching the gate; the merge block behind the gate has a sixth, and `--dry-run`
returns before it (`dg-land.sh:100`), so a green dry run does not mean a landable ticket. DG-036's
merge was completed by hand in a detached worktree, verified byte-identical to the tested tree, and
pushed. **A failed land also leaves the temp worktree, the claim, the branch and `State: todo` behind,
and the next run silently cleans the evidence** — so an interrupted land looks like an unstarted
ticket whose lane is taken.

**The trunk's LOCAL `feature/outcome-loop-week1` is behind `origin`** (DG-036 and DG-033 both landed
by hand). A detached push
cannot move a branch that is checked out. `~/dynasty-genius-product` needs `git pull --ff-only`; it
was not run here because that trunk carries 47 dirty files from other lanes and AGENT-HOOK rule 1
says leave it alone. None of those 47 touch DG-036's four files.

**DG-034 and DG-036 both live only on `feature/outcome-loop-week1`**, which is now 38 ahead / 6 behind
`origin/main` and unmerged, 11 days from the 09-04 freeze. Nobody has said whether that branch is
meant to reach `main` before the season. It is worth someone's word.

**Naming collision worth knowing:** `origin/main`'s PR #160 merged a branch called `ticket/DG-035`,
but its content is the 2026-08-19 governance removal — nothing to do with the DG-035 capture-chain
ticket, which is still genuinely open above.

---

**2026-08-24, later.** Three state changes a reader of the 09:00 notes above should know:

**The landing pipeline works.** DG-038 is done and DG-040 landed through `dg-land.sh` unaided —
the first ticket ever to do so — against a base checked out in the trunk. A green `--dry-run` now
means "this ticket can actually land": it builds the real merge and runs `git push --dry-run`. The
nine pre-DG-037 worktrees still need remove-and-recreate before they can pass the dirty-tree gate
(safe; all nine branches are on origin).

**The trunk moved.** `~/dynasty-genius-product` was fast-forwarded to `6b5dceb9` (dirty-overlap
checked first — none of the 47 files touched the merge). Local `feature/outcome-loop-week1` is
level with origin again.

**2026-08-25.** The open question above — whether `feature/outcome-loop-week1` reaches `main`
before the season — is answered: **David ruled merge, and it merged as `d33c9896` on
`origin/main`.** Ten conflicts resolved (scorecard trio → PR #159's later refinement; the four
frontend seams REGENERATED via `npm run openapi-gen`, never hand-merged; AGENTS.md → charter +
parallel-work protocol union; AGENT_SYNC.md and the 08-18 ledger → main's landed deletion wins).
Gate on the merged tree before push: pytest **6029 passed / 0 failed / zero collection errors**
(the −294 vs the branch is main's landed deletion of 29 governance-test files, verified by
`git diff --name-status`) and frontend vitest **298/298**. Local `main` fast-forwarded to match.
The trunk still runs `feature/outcome-loop-week1` (content-identical to `main` at merge time);
whether the trunk switches to `main` and where future tickets land is an open operational choice.

**2026-08-25, morning. David ruled: all future tickets land on `main`.** `feature/outcome-loop-week1`
is retired as a landing base; the trunk switches to `main` after today's producer window. Under that
ruling: **DG-029 landed on `main`** as merge `849f3eaf` (gate 6037 passed / 0 failed) — the answer is
**BY DESIGN, same mechanism** (`apply_inference_partition`; 2024 is the in-between season of a 2-year
outcome horizon; making it eligible is a model-definition decision, not a backfill). The close also
resolved a contradiction sitting in the 2026-08-19 trunk ledger: the Consultant lane's "gap, not a
design choice" claim (based on 2024 existing upstream) is wrong — upstream presence is consistent
with a downstream partition. **DG-004 closed**: the repo-root leakage report was an untracked one-off
probe artifact (its writer has zero production callers; `adp_sleeper` not in the current matrix);
deleted, with the pre-commit training-CSV guard and feature-gate temporal check named as the live
protection. **Recreate procedure for pre-DG-037 worktrees is proven**: remove worktree → delete local
branch (origin keeps the copy) → clear Lane → fresh `dg-work.sh` (base `main`) → cherry-pick the one
pushed commit. DG-029's cherry-pick hit one add/add conflict on the 08-19 ledger — resolved by
keeping the trunk's canonical version, NOT re-planting the worktree-local duplicate (DG-032).
**In flight:** DG-023 (handed to David's parallel session, worktree prepped on `main` at
`~/dg-wt/DG-023` with its pushed half-fix cherry-picked, 7/7 contract tests green).

**2026-08-25, later morning. DG-021 landed** as merge `b291107f` on `main` (gate green after
rebase; local full suite 6042 passed / 0 failed). The dead-window no-A-no-B arm no longer claims
an Engine A prior: `dvs_engine` stays None, the caveat says outright that no score is available,
and the player API serves a degradation notice on any modeled row with a null score. Two spec pins
of the false behavior (phase15 5.10, phase14 5.5) amended with disclosure comments.

**2026-08-25 10:21 — THE TRUNK IS ON `main` AND THE LIVE CARDS ARE HONEST.** Post-window, on
David's "go ahead": three dirty files on main-deleted paths archived
(`preserved/2026-08-25-trunk-switch/`) and stashed, `git switch main` → `b291107f` (dirty 47→25),
pvo-refresh hand-run with launchd's exact invocation → `status ok`, exit 0. Acceptance on
`universe_pvo_runtime.json` (12,225 rows): false rows **114 → 0**, old caveat **114 → 0**, honest
no-score caveat on **exactly 114** rows, all `dvs_engine=None` — the cohort is conserved. The
11:30 scheduled run is the remaining launchd-triggered confirmation. **All future producer runs
now execute from `main`.**

**The 06:15 capture is fixed and proven.** DG-040: upstream had renamed contracts `cols` →
`season_history` and added `contract_history`; the scheduled job had been 4-for-4 exit 1 since
install, and the last normalized contracts vintage was 2026-08-08 — a 16-day gap, not the 2-day
gap the err.log suggested (the log is younger than the machine). Store migrated additively, a
hand-run of launchd's exact invocation finished `status ok / exit 0`, and a 48,690-row contracts
vintage dated today sits beside the 08-08 ones. Tomorrow's scheduled run is the last confirmation.

---

**2026-08-25, mid-morning. DG-023 landed** as merge `b4662707` on `main` (gate 6067 passed / 0 failed,
ruff clean). The finding worth carrying: **the producer half already cherry-picked onto that branch
(`f2e09ab`) was inert.** It set `status: "loaded"` for participation, but the READER bucketed a stream
as empty on `status != "loaded"` **OR a null season** — and participation's frame has no `season`
column at all, so it stayed in `EMPTY:` regardless. Before/after output was byte-identical. A green
producer-side fix is not the same as a fixed surface; run the reader.

Both of this ticket's false words are gone and both were re-measured, not inherited:
`load_participation(seasons=[2025])` returns **45,184 rows across 26 columns, none named `season`**,
and `fallback_used` means a REFUSED SEASON, not a cache — `nflreadpy`'s `cache_mode` is `MEMORY`, so a
scheduled run starts cold and never serves anything from cache. The gate itself is untouched: empty,
unavailable and step-back all still degrade.

**DG-041 filed, not fixed.** Participation's upstream ceiling is `current_season - 1` *by
construction*, so it steps back on every run forever and holds `feature_refresh` degraded
permanently — even after Week 1 when the other four streams go live. A gate that is always red
carries as little information as one that is always green. Fixing it means a per-stream ceiling in
the producer's season window, which moves `source_hash`; David scoped it out of DG-023 deliberately.

**Landed alongside a live second session** (deploy/verify lane, waiting on the 11:30 pvo-refresh).
Checked first: no `dg-land.lockdir`, nothing in `doing`, zero file overlap with the trunk's 25 dirty
paths, and **`pvo_refresh` does not declare `input_provenance_field`** — only `feature_refresh` does,
of eight artifacts — so this change cannot move what that session was about to verify. `dg-land.sh`
again refused to touch the trunk and printed the note instead: **the trunk's local `main` is now 1
behind `origin/main`** and wants `git pull --ff-only` when its tree is quiet.

---

**2026-08-25 11:38 — DG-021 production-CONFIRMED, and the trunk is current.** The 11:30 scheduled
pvo-refresh fired from launchd's own trigger: exit 0, report `status ok`, artifact vintage
`15:30:02Z`, and the acceptance held — **0** rows with `dvs_engine="A"` beside a null score, **0**
old caveats, **114** honest no-score rows. Nothing about DG-021 remains open. The trunk was then
fast-forwarded `b291107f → b4662707` (overlap 0 of 25 dirty paths), so DG-023's reader fix is live
for tomorrow's 06:15+ producers and every job now runs from current `main`. Board state: DG-021,
DG-023, DG-029, DG-004 all closed today; next unclaimed picks are DG-022 (WIP on origin), DG-041
(new, layer 1), DG-020, and SR-11's slot tomorrow 08-26 — sequencing is David's call.

---

**2026-08-25 17:1x — DG-041 CLOSED (code), landed `b797ee1f`, trunk pull deliberately held.**
David's word: "go" on the DG-041-first sequencing. The fix is the ticket's cheapest shape taken
exactly: a per-stream source CEILING beside the floor in `_STREAM_LOADERS`, participation's being
the client's own formula (`get_current_season(roster=True) - 1` — verified as literally the first
line of the installed `load_participation`). TDD, RED watched (3 expected failures); one DISCLOSED
test change in the CH1 isolation fixture; gate 6,070/0, zero collection errors. Known and
disclosed: `source_hash` moves once on first run (provenance echo — frames byte-identical), then
settles. **Sequencing in force: the trunk stays on `main@a61f0fbe` through tomorrow's ~09:00 cycle
so DG-023's first scheduled production run is single-variable; trunk pulls post-window 08-26;
DG-041 live from 08-27 with seven runs before the 09-04 freeze. Production acceptance still open:
08-27 report shows participation `fallback_used=false` and `/api/health` reads `inputs_live`.**
Next unclaimed picks unchanged: DG-022 (WIP on origin, rebase care — its WIP touched a test file
DG-021 also changed), DG-020, SR-11's slot tomorrow 08-26.

---

**2026-08-25 19:3x — DG-022 CLOSED, landed `20807368`; DG-043 filed; an ID collision resolved.**
The 08-19 WIP was resumed by its own handoff, rebased (generated seams REGENERATED — the regen
caught `index.ts` about to drop main's newer types), hardened with four measured fixes (duplicate
region landmark on the real surface; TWO test files silently reading the production capture DB —
hermetic seams added, disclosed; unclosed sqlite handle; unpinned classifier arm), and **the
real-surface QA gate the WIP was blocked on now PASSED** — Tank Dell's card tells the truth on
desktop and mobile, evidence in `dg-build/preserved/2026-08-25-dg022-qa/`. Gate after rebase onto
the parallel session's DG-042: green; local suite 6,087/0, frontend 73 files/302, zero collection
errors. Whole-page QA found three PRE-EXISTING base-card defects, proven independent of DG-022 →
**DG-043** (layer 6; Tier-3-shaped, so post-freeze unless David says otherwise). **ID note:** the
a11y filing briefly carried the number DG-042 (the 08-25 product ledger says "Filed as DG-042")
before discovering the parallel session's same-evening DG-042 (PPG guard, `c2b11f0a`) — theirs
was committed first and keeps the number; the a11y ticket is DG-043 and was never committed under
042. **Trunk is now 3 merges behind origin/main** (DG-041 `b797ee1f`, DG-042 `c2b11f0a`, DG-022
`20807368`) — all still land tomorrow's post-window pull; none of the three touches a producer
except DG-041 (the planned one). Remaining unclaimed: DG-020, DG-043, SR-11's slot tomorrow.

---

**2026-08-26 05:5x — DG-044 filed and claimed for SR-11's D4 slot, on David's word.** SR-11 had no
ticket file and `dg-work.sh` requires one; DG-044 carries the claim and the build-morning brief —
the spec section (`SEASON-BUILD-SPEC.md:595-749`, MIG-1) stays the authoritative build text.
Worktree `~/dg-wt/DG-044` cut from `origin/main` `2bf91d8d` (NOT the pinned trunk), landable-clean,
lane `ClaudeFable5-DG044-20260826`; a fresh number was used deliberately — `ticket/DG-035` is
poisoned by the PR #160 collision. The trunk stays pinned at `a61f0fbe` until the post-window pull
(~10:15+); 09:00–10:15 remains hands-off for DG-023's first scheduled single-variable run. Setup
re-verified before filing: both origin tips unmoved overnight, dg-build clean at `748becf`.

---

**2026-08-26 06:57 — DG-044 LANDED, merge `b1b888be` on `main` (SR-11 + SR-10a step 1 shipped D4,
on schedule).** TDD build (76 ticket tests, every unit watched RED), then a 23-agent adversarial
review: 17 confirmed findings all fixed in `f47d3a6f` — headline: the crash guard (an uncaught
exception now DELIVERS a crash alert instead of silently killing the only detection channel), and
per-bootstrap reboot semantics (a mid-morning reboot no longer floods false "never attempted"
lines; unverifiable slots become one consolidated line that still names every job). Live-verified:
production dry-run names exactly the model_forward_capture 08-12 hole and nothing else. Suite
6,177/0. **DG-035 option (b) is CLOSED by this land** (in-suite proof; option (a) stays open as
David's call). DG-040's final confirmation also landed this morning: second consecutive scheduled
06:15 success, status ok. **Also proven this morning: the DG-040 marker briefly reads
`status: running` mid-capture — a transient state readers must tolerate.**

**2026-08-26 midday — the day's sequence EXECUTED, SR-11 fully accepted.** DG-023's
single-variable confirmation cycle ran green on the pinned trunk (fc 09:00 · features 09:15 ·
league 09:20 · model/pvo 09:30:08 · market 09:40:04 · what-changed 09:45; participation upstream
timeout again = expected pre-pull, DG-041's fix now in). Trunk pulled `--ff-only`
`a61f0fbe → b1b888be` ~10:16, zero dirty-path overlap. Capture-health verified in-process
(TestClient; no server was on :8000, so no restart — next API start serves DG-022's surface):
config_version 2, `market_divergence_history` registered with its 4 missing dates — spec:1011
substance confirmed, SR-10a step 1 accepted. David missed the 10:30 bootstrap window; recovery
was bootstrap + `launchctl kickstart` at 12:00 — a real launchd-path run: runs=1, exit 0, alert
file carries the model 08-12 GAP line + the market 4-date GAP line + heartbeat, state schema 2
persisted, stderr empty. **David saw the banner** — visible-notification acceptance met and the
08-25 probe question closed. Remaining proof is passive: **tomorrow's scheduled 10:30 run must be
silent + heartbeat** (calendar scheduling). 08-27: DG-041 production acceptance unchanged.

**2026-08-26 afternoon — the post-noon game plan EXECUTED (adversarially reviewed first, per
David's ask; his "go" ~12:40 covered the three-ask batch).** Rulings recorded: (h) amendment
RATIFIED; DG-035 option (a) DEFERRED post-season (ticket updated); SR-09 steps 1-5 pulled to D4.
Executed: Tuesday-1 baseline preserved (`preserved/2026-08-26-tuesday1-baseline/`, commit
`75a8f67`) BEFORE the chain rewire makes it unrecapturable; **DG-045 filed and built — SR-09
steps 1-5 complete, TDD, 26 tests, worktree suite 6203/0, commit `bf5ba8a1` pushed on
`ticket/DG-045`, NOT landed (install + retirement are D5/D6, David's launchctl)** *[superseded
same day: steps 6-7 prepped `ab522db7`, 29-agent review fixes `6038d2d6`, 44 DG-045 tests green —
the DG-045 row above and the ticket file are current]*; hygiene sweep:
`agent/modeling-backend` pushed (last unbacked branch), 63 untracked trunk files protectively
copied (`preserved/2026-08-26-trunk-untracked-copy/`), stale Air lane claims cleared on
DG-014/015/020, clean worktrees DG-015/031/035 removed (tips verified on origin; DG-014/020
worktrees left in place — dirty, another day's classification). DG-045 ticket carries the full
resume brief + the D5 stale-report observation.
