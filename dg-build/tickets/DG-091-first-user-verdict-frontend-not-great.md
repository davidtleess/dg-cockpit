# DG-091 — David's first-user verdict: "the front end was not great" — all four dimensions

**Layer:** 6  ·  **State:** ALL PHASES LANDED (15 tickets) — acceptance pending David's word  ·  **Lane:** —  ·  **DG 3.0**  ·  **frontend-only**
**⚠ THE "POST-FREEZE build" LINE BELOW IS SUPERSEDED:** David ordered *"create a sub agent workflow with tower, studio and whoever else is needed - and start building"* (2026-08-29) and the program has been building since. Original text kept for provenance.
**Source:** David, 2026-08-29 evening, closing his first real day using the product. Verbatim:
**"to be honest the front end was not great."** Asked what grated, he selected ALL FOUR:
**how it looks · too dense/cluttered · confusing words and numbers · hard to find things/clunky.**

**Problem:** the frontend has never had a design day. It was built increment-by-increment by the
same machinery that builds capture pipelines — correct, honest, dense — an instrument panel, not
a product shaped for its one user. Corroborating evidence from the same day: served bundle a week
stale (fixed, ritual added), visual harness had never run once (repaired, DG-090 debt exposed),
46-node contrast list, the click-a-player gesture missing until he asked (DG-089), vocabulary on
screen that requires the build history to read (xVAR, vintage, engine paths).

**What this is NOT:** a bug list. DG-089/090 cover mechanics. This is a DESIGN mandate: the
product David opens every season morning should be something he can read at a glance and likes
opening.

**Shape of the work (proposal before code — David reviews the proposal, not a surprise rebuild):**
1. A design brief built from his four picks: visual identity (typography/color/spacing over the
   existing token system), information hierarchy for the morning read (one glance = am I ok, what
   moved, what should I look at), a plain-language pass over every label (manager words, not
   pipeline words — honesty markup stays, jargon goes), navigation (players reachable from
   anywhere; fewer clicks to the card).
2. Constraints that stand: no-verdict law (no buy/sell smuggled in via design), decision_supported
   stays visible, the tape's honesty function survives any restyle, zod boundaries untouched.
3. ~~Venue open~~ **RULED 2026-08-29 evening: David chose the Studio fresh-eyes lane.** Tower
   carries Studio (standing wall TW29-WALL-35 — crew lanes stay out of ~/frontend-studio), so the
   finished brief hands to Studio THROUGH Tower, never directly. The brief itself is drafted
   venue-neutral in dg-build.
4. Timing: **brief drafting PULLED FORWARD to Sat 08-29 night on David's pick** (was D10 buffer /
   soak week; docs only, freeze-safe either way). BUILD stays post-freeze, candidate window =
   season weeks 1-2 alongside League Activity (≤09-17).

**✅ BRIEF DRAFTED 2026-08-29 night: `~/dg-build/DG091-DESIGN-BRIEF.md`** — four mandated
sections grounded in four read-only audits (token/visual identity, full vocabulary sweep of
~7,100 frontend lines, hierarchy+navigation map, ticket-evidence catalog) plus a coverage
critique. Carries a week-one quick-win list (10 items), the design pass proper for Studio, and
four decisions only David can make (incl. `?player=` URL addressability, which reverses the
recorded I3 deferral, and rewording the two byte-locked mitigation contracts). Awaiting
David's review; hands to Studio through Tower after his word.

**Done looks like:** David opens the product on a season morning and does not say "not great."
Measured by his word, nothing else.


---

## BUILD RECORD (this ticket is the program's controlling document — keep it current)

**Phase 1 — foundations, LANDED 2026-08-30:** DG-104 `67cf9f8b` (banned-language enforcement
re-scoped to David's ruling — 3 BLOCKING panel defects closed, incl. a prose bypass of the
surviving field gate) · DG-076 `6bf4a155` (build manifest; **frontend half only — the
health-endpoint sha-vs-HEAD comparison is DEFERRED and has no ticket**) · DG-043 `555fb7e4`
(player card labeled pairs; 390px overflow 776→390) · DG-105 `bc065e24` (raw-literal debt on 4
surfaces; axe flake dead — see its board row for the honest limits).

**Phase 2A — what David's own rulings settle, LANDED + LIVE 2026-08-30:** DG-109 `59bab53e`
(the copy dictionary + an ENFORCED render rule) · DG-111 `002a26bd` (caveat furniture retired
across seven surfaces; 16 replacement strings recorded verbatim) · DG-110 `921ec892` (global
player search; every dead end closed; search no longer mutates the persisted trade draft).
**Independently audited on the live product: 0 raw pipeline tokens on the front page and player
card at 1440 AND 390 — true even ignoring the two declared exempt subtrees.** 52 panel findings
fixed; the honesty lens caught THREE BLOCKING cases where the new prose stated falsehoods the
raw token never claimed.

**David's design panel, 2026-08-30 (verbatim option labels):** trade voice = *both pricings
plainly, NO blended take/pass* · parked surfaces *removed from nav entirely* · *green-up /
red-down* deltas (**reopens the enforced verdict-hue ban — re-point it at genuine buy/sell
styling, do not delete it**) · *build the phone shell now*.

**~~PHASE 2B — OPEN~~ PHASE 2B LANDED 2026-08-30** (DG-115 `d18c4610` · DG-117 `ceba40e1` ·
DG-116 `d9a89b87` · DG-114 `ba2e25a6` · DG-113 `58f5016f` · DG-118 `89110a22`), plus the
finishing pass DG-120 `b1c532d7` + DG-119 `6f766032`. **FIFTEEN tickets total.** The defects
listed below were the phase-2B input and are FIXED — kept for provenance, do not re-file: **Trade Lab is visually unbuilt at every width** (bare
white native inputs/buttons on the dark shell); **Roster Audit scrolls the page sideways 185px
and Model Trust 665px at 390**; the front page's "Current roster context" is still a debug dump
wearing prose ("Starting lineup value: 97.39" beside "Weekly lineup strength: 97.39" — same
number, two names); **"xVAR" survived the dictionary** and the same quantity now has three names
(the render rule cannot see it — it is not four consecutive capitals); Roster Audit shows
internal QA language ("RB checked out in testing") and 22 of 26 rows read "Not scored yet";
21 composited-contrast failures on `.dg-shell__parked-badge`; the visual gate visits only three
surfaces and none of the broken ones.


---

## ⛔ WHAT THE 2026-08-31 AUDIT FOUND STILL OPEN — read this before believing any closeout
The program's own closeout was audited by three read-only auditors before David read it. It
contained five wrong numbers and two false claims; all are corrected in
`closeouts/2026-08-30-DG091-PROGRAM-COMPLETE.md` (see its CORRECTIONS section). What that audit
found STILL BROKEN, now ticketed:
- **DG-122 — League is unbuilt.** 35,475px at 1440 / 44,020px at 390; 8 cards none naming a team;
  "Something here is worth a look." ×16; "Unknown team" ×6 while the payload carries the names.
  **The closeout called this surface clean. The visual gate passes it** — it has no assertion about
  page length or repetition.
- **DG-123 — `title=` is an unaudited channel** (`renderRule.ts:35,:140`) and raw keys are actively
  placed there on visible prose. **"Zero raw pipeline tokens" is therefore true only under the
  checker's own definition.**
- **DG-124 — a second saturated scoring term** (`divergence_density_score` = 1.0 for all eleven
  partners) one line above the one DG-119 caught.
**Acceptance remains David's word on a season morning. It has not been given.** Thirteen of the
fifteen landed tickets carry no acceptance record; only DG-111 and DG-118 do.
