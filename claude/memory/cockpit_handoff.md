# TOWER HANDOFF — written 2026-08-09 at David's closeout

**TREAT THIS AS INHERITED CLAIM, NEVER AS A SOURCE.** Every line is a lead to check against the
artifact. Re-verify before repeating any of it to David — that is Rule 2 and it is the rule that
matters most.

## YOUR ROLE — read the charter before anything else

`~/.claude/agents/tower.md`. **Tower is not an orchestrator.** No relay, no crew approvals, no
gating, no closeout ushering, no lane-status reporting. If an older document tells you otherwise, it
is historical. You own: **data fresh · models honest · truth when David sits down**, plus **Studio's
bridge** and **his dated commitments**.

**Rule 1 (David's word):** never invent product features. Label everything **VERIFIED** /
**PROPOSED PRODUCT CHANGE** / **RELAYED PROPOSAL**.

**Trial ends ~2026-08-22.** Kill criterion is in the charter.

## WHAT DAVID SHOULD HEAR FIRST NEXT SESSION

**`/api/health` is slow and getting worse — and it is user-facing.** Verified 2026-08-09 09:32:
two calls at **43.7s and 39.0s**. Same endpoint answered in **14.4s** the day before. Rest of the app
is fine (`/` 0.11s, `/docs` 0.02s). This is the endpoint behind the System Diagnostics card. **Check
this first — if it has kept climbing, it is the most urgent thing on the board.**

## THE CONFIRMED DEFECT — do not soften it, it is proven twice

The health light **turns green daily on 25-day-old data**. `roster_capacity` and
`league_opportunity` are declared weekly (10:00 and 09:35, 3h grace) with **no launchd producer at
all**. Inside the grace window they grade `within_grace` and the root reads `ok`; outside it they
grade `stale` and the root reads `degraded`. Same data, opposite verdicts, verified 08-08 11:58 and
08-09 09:32. That green window covers the hour David would open the app on a Tuesday in season.

## FULL BOARD

`~/.claude/tower/PRODUCT-HEALTH-BOARD.md` — every line stamped with the command that produced it.
Carries eight **PROPOSED PRODUCT CHANGES**, none started, none authorized. Tower's standing
recommendation for first: wire the outcome scorer to the 500,303 prediction snapshots that already
exist — the statistics are built and it is the only route to any drift signal.

## DATED COMMITMENTS — Tower's alone, nobody else holds these

| Item | Due | State |
|---|---|---|
| Grounding-layer full-build GO/NO-GO | "~August 2026" (his charter edit 2026-07-22) | **DUE, still unraised.** NO-GO is legitimate. |
| Gemini seat — contribution record | ~2026-07-24 | **Overdue.** |
| Studio fresh-eyes review | ~2026-09-01 | Approaching. Studio is highly active — see below. |

## STUDIO

**Active and producing.** 017 and 018 on 08-08; **019-on-the-field.md written 09:24 on 08-09**;
`DAVID.md` and `STATUS.md` both written 08-09. **David has been working with Studio directly** —
019 quotes his reaction verbatim and supersedes 017/018 on it. 019 is marked *"Not approved, nothing
relayed."* No background jobs in its lane. Fresh-eyes covenant recorded INTACT, with the cost of a
deliberately unread file named rather than hidden.

**RELAYED PROPOSAL awaiting David:** install Playwright MCP and Chrome DevTools MCP. Changes his
machine, so it is his gate.

## STILL OPEN WITH DAVID

1. The eight proposed product changes — none authorized.
2. Grounding-layer GO/NO-GO — due.
3. **Crew-facing docs still describe the old Tower** — `AGENT_SYNC.md` (TW29-WALL-35 escalation
   path), `docs/governance/02-agent-operating-loop.md`, the repo's `cockpit-closeout` skill. These
   are product-repo commits; **Tower must not edit them.** Prepare wording, route through David.
4. **The SessionStart / UserPromptSubmit hooks** still run orchestration-era instrumentation
   (`watchdog.sh`, `turn-brief.sh`). Harmless, but they belong to the retired role. Settings change
   = his word.

## NOT TOWER'S LANE — observed only

Crew on 2026-08-09: 41KB ledger by 09:25, 2 commits, **57 uncommitted paths** (22 the day before).
Tower does not act on this and does not report lane status to David unless it bears on the product.

## TOWER'S OWN ERRORS — recorded so the next one does not repeat them

**2026-08-09:** probed `/api/health` with an 8-second timeout, got `http_code=000`, and **nearly told
David the server was down.** It was slow, not down. **A timeout is an instrument setting, not a fact
about the world.** Caught before it reached him — but only just.

**2026-08-08:** blurred the product-change line inside the pitch for this role — four unbuilt changes
stated as duties. David caught it and made the labelling rule binding. That is why Rule 1 exists.

**2026-08-07:** read eight quiet days in Studio as neglect without checking. The rest was David's
deliberate choice. **Rest is fine; blocked-idle is the waste.**
