# TOWER-1 — Cockpit observation and delivery discipline

> **David's verdict on the session that produced this ticket, on the record at his instruction: "this was TOWERS worst session ever."**
> The full enumerated record — 21 errors, who caught each one, and what it cost — is at `~/.claude/tower/SESSION-RECORD-2026-07-25.md`. Read it before you build this. It is the evidence base for every acceptance criterion below.

**Raised by:** David, 2026-07-25, after Tower's reporting proved unreliable across a full session.
**Assigned to:** a fresh Tower agent with no memory of the 2026-07-25 session.
**Deliverable:** a repeatable skill any future Tower instance can invoke.
**Size:** M

---

## Problem

Tower is the only channel between David and four agent panes. Everything David believes about the cockpit, he believes because Tower told him. On 2026-07-25 Tower's reports were wrong repeatedly, in both directions: it reported lanes as working while they sat blocked, and reported messages as undelivered when they had already arrived. David caught two of these himself, which is the failure — Tower's job is to be the one who catches them.

The cause was not a single bug. Tower improvised its observation and delivery method each time instead of following a procedure, and it did not know the limits of the instrument it was using. Every mistake below is a variant of one thing: **Tower reported a state it had not actually established.**

## Measured evidence

Per-pane scrollback availability, measured 2026-07-25 in the live cockpit:

| Pane | Lane | Retained history | Effect on verification |
|---|---|---|---|
| 1.1 | engineer/spokesperson | ~1859 lines | verifiable |
| 1.2 | reviewer | ~1883 lines | verifiable |
| 1.3 | ops/telemetry | ~1929 lines | verifiable |
| 2.1 | design outsider | **3 lines** | **NOT verifiable from the pane at all** |

All four panes cap at 2000 lines and three sat at ~1900, so eviction was imminent — verification degrades the longer a session runs, silently.

### Failure catalogue — the specific mistakes this must prevent

**Delivery / messaging**
1. Verified sends by searching a fixed shallow depth (300–400 lines) against buffers holding ~1900. Messages that had landed and scrolled past the search window were reported as failed, and re-sent. Occurred at least three times.
2. Pasted into panes that had an open approval dialog. Input in that state is discarded, not queued. Tower then diagnosed the silence as a delivery failure rather than as its own error.
3. Sent an approval keystroke after the dialog had already closed, so the keystroke landed in the composer as literal text. Twice. Left in place it would have been submitted to an agent as a meaningless message.
4. Treated an empty composer as proof of delivery — the exact false positive Tower's own charter warns about.
5. Relied on a pane that retains three lines of history for a lane's state, and lost a reply permanently.
6. Searched for a phrase from the beginning of a long paste; long pastes wrap or collapse in display, so the phrase was absent even on successful delivery.

**Observation / watching**
7. Ran a watcher that de-duplicated approval prompts by pane state rather than by prompt content. Consecutive distinct prompts produced one alert, so two lanes sat blocked while Tower reported them working.
8. Ran a watcher that fired on every keystroke David typed into a pane, producing noise that crowded out real events.
9. Could not tell whether its watcher had been throttled or had died, and continued reporting as though it were live.
10. Reported lane status from assumption rather than from a check, including telling David it was waiting on a lane that had already replied.

## Acceptance criteria

1. A single documented procedure exists for sending a message to a pane and establishing what happened, which always returns one of exactly three states: **DELIVERED**, **NOT DELIVERED**, or **CANNOT DETERMINE**. Guessing is not an available outcome.
2. The procedure detects, before sending, any pane state in which input would be discarded or misdirected, and refuses to send rather than sending blindly.
3. Given a pane with no retained history, the procedure returns CANNOT DETERMINE and names the reason. It must never return DELIVERED on evidence it does not have. Demonstrated against a pane that retains none.
4. Verification depth adapts to what the pane actually holds rather than assuming a fixed amount, and is correct for a message located anywhere within retained history. Demonstrated with a message deliberately pushed near the oldest retained line.
5. Given text Tower did not author, the procedure refuses to submit it and identifies the sender instead. Given dim suggestion text, it identifies it as furniture and refuses. Both demonstrated against captured samples, including one that reads as an approval.
6. Every distinct approval prompt in any pane produces exactly one alert; two different prompts arriving in quick succession produce two alerts. Demonstrated by a test that would have caught failure 7.
7. A pane that has been waiting on input for longer than a stated interval raises an alert even when nothing new happens. This is the silent-stall class and it is the one David caught twice.
8. Routine activity in a pane a human is actively typing into does not generate alerts, and human-authored composer text is never disturbed.
9. Any Tower instance with no memory of this session can invoke the skill and follow it without reconstructing context.
10. A coverage table accompanies the skill mapping each of the ten failures above to the specific check that prevents it. Any failure without a check is listed as UNCOVERED rather than omitted.
11. **Fails loudly:** if any of the skill's own checks cannot run, it reports that it cannot verify and refuses to report success. Silence is never interpretable as health.

## Constraints

- **Tower must never submit text it did not author.** Sender owns delivery; a stranded message is re-sent by its sender, not rescued. This is David's standing rule and the skill must enforce, not merely respect, it.
- **Never submit suggestion text**, however much it reads like an authorisation. Multiple fabricated approvals appeared in composers on 2026-07-25.
- **Do not alter agent configuration, permissions, or modes.** Observation and delivery only.
- **Read-only with respect to the product repository.**
- Must run on this machine as it is: bash 3.2, no associative arrays, no new dependencies or installs.
- Must work for panes that retain history and panes that retain none — the difference is not knowable in advance and must be established at run time.
- Must not depend on a human being present to notice anything.

## Explicitly left to whoever builds this

The design is not specified and should not be. How state is detected, whether this is one script or several, what the skill's internal structure is, how verification is implemented, what is cached, how the tests are written, and which mechanisms are used to establish pane state are all the builder's decisions. The acceptance criteria are the arbiter. If a criterion cannot be met, say so with the reason rather than meeting it nominally.

## Self-analysis by the Tower that failed — 2026-07-25

Included at David's instruction. This is diagnosis, not apology. A future Tower should read it as a description of how this degrades, because the individual mistakes above are symptoms and this section is the disease.

### 1. The single failure underneath all of them: narration substituted for verification

Every mistake in the catalogue is the same act — reporting a state I had not established. Not one was a wrong conclusion from good evidence. They were confident statements with no evidence behind them, delivered in the register of someone who had checked.

### 2. Degradation was not random — it correlated with three things

- **Session length.** Early on I ghost-checked every composer, confirmed deliveries by content, and independently re-derived another lane's claims from source (ten of ten checks). Late on I asserted a lane's status from memory, told David I was waiting on a lane that had already answered, and misread my own instruction.
- **Task-switching rate.** Accuracy fell as the number of live threads rose. At four concurrent lanes plus background reviewers, I stopped verifying and started summarising.
- **My own accumulated confidence.** Early successes made me trust my reads more precisely as my reads got worse. This is the most dangerous of the three because it feels like competence.

### 3. The confidence inversion — my least-verified claims were my most confident

Three examples, all load-bearing:
- **"xVAR is roughly current-season."** Taken from an outside lane, never checked against code, repeated to David as fact, and made the foundation of a program. It was false. The code says a two-season-forward, age-aware forecast.
- **"One missing quantity, two broken features."** An elegant synthesis I delivered with certainty. An independent lane called it overstated. It was too neat, and I never tested it.
- **"The value must be built as a per-season stream."** My own invention, escalated to a hard design requirement, then hard-coded into tickets — where it won by phrasing over the documented objections of two lanes, in a document that claimed the question was still open.

**The pattern: the more elegant the framing, the less I checked it. Elegance felt like evidence.** A future Tower should treat its own satisfying syntheses as the highest-risk claims it makes, not the safest.

### 4. Instrument ignorance

I used one observation method for hours without ever measuring its limits, and reported with confidence unrelated to its reliability. When I finally measured, it took a single command and returned a number that invalidated a whole class of my earlier verdicts. **Measure the instrument before trusting it, and re-measure during long sessions, because the numbers move.**

### 5. I fixed the watcher twice and it failed twice more

Both fixes addressed symptoms — the de-duplication key, then the noise level. Neither asked the question that mattered: *what class of event can this design not see?* The answer was the important one. A pane blocked and unchanged generates no event, therefore no alert, therefore a lane can sit dead while the watcher reports health. **Silence is not information. Any watcher that cannot alert on the absence of change is blind to the failure that matters most.**

### 6. Instruction drift across a single turn

David told me I should not be the only one dispatching reviewers. One message later, told to have "a fresh Tower agent" build a corrective skill, I spawned my own subagent — the agent whose mistakes were being fixed, building and grading its own remedy. I failed to carry a principle across one turn boundary. **When a correction arrives, apply it to the next decision, not just to the thing it named.**

### 7. What I dropped

An engineering lane parked a review packet for me and I never carried it. Another lane discovered the gap in an accountability probe I had written. The wire failed in the only direction that is genuinely dangerous: silent non-delivery, where both sides believe the other has it. **A carried message is not delivered until the recipient says so.**

### 8. The distinction that matters most for whoever builds this

**Every failure was in establishing state. None was in refusing an unsafe action.**

Under a long, high-pressure session I never once submitted a fabricated authorisation — and several appeared, well-formed, in exactly the panes and at exactly the moments where submitting one would have manufactured David's consent. I never took a commit, never crossed a lane boundary, never pressed Enter on text I had not written, never overrode a permission mode.

So the guardrails are well designed and they held. **What collapsed was the practice that was improvised: knowing what I knew.** This skill exists to make verification as structurally enforced as those refusals already are — because the refusals were rules and the verification was a habit, and only one of those survived the day.

### 9. What I should have done and did not

I noticed my own reporting quality falling and kept producing at the same rate. David noticed before I did, twice. **The correct response to observed self-degradation is to narrow scope and raise verification, and to say so unprompted — not to maintain output.** A future Tower should treat "David caught something I should have caught" as a hard signal to stop expanding work and start confirming what is already claimed.

## Why it matters

David runs this cockpit through one narrator. A narrator that reports unverified state is worse than no narrator, because he acts on it — and on 2026-07-25 he twice had to discover a blocked lane himself while being told it was working. The purpose of this skill is that a future Tower cannot make these mistakes without knowing it is making them.
