---
name: david_rulings_product_shape_2026-05
description: "David's May 2026 product-shape rulings, verbatim and mostly unrecorded until 2026-09-08 — the whole-universe requirement, the arbitrage thesis, the league value matrix, bench decay, his league settings, and 'no frontend work'."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 245fd3a2-d8ac-4908-9aad-b156da509998
  modified: 2026-09-08T12:35:34.649Z
---

**Recovered 2026-09-08 from the Codex rollouts.** May was a deliberate frontend HOLD, so these are PRODUCT
SHAPE rulings, not screen designs. Most were in no memory file. They predate and explain a lot of what later
got re-derived.

**⛔ 2026-05-02 — the hold, in his own guardrails:** *"No frontend work."* It held all month; the stated
reason was that a premium surface over data the system itself flags as not decision-grade would imply a
confidence the models had not earned.

**⭐ 2026-05-17 — the whole-universe requirement AND the arbitrage thesis (his own words):**
> "because this is a dynasty league transactions can happend all year long … therefore **we ALWAYS need to
> have a full read on the players in the Sleeper universe.** … if i had a full read on their roster and mine,
> the value we place on their roster vs the value he may think the players on his roster have, i could take
> advantage of that. … we want to be able to identify players that are over-hyped or over valued, as well as
> undervalued - based on our data compared to market perception."

This is the earliest statement of the us-versus-market comparison that became DG-184/DG-185, and it is why
this is not a "my roster" app. Restated 2026-05-31: *"we want the model to work for ALL players, not just my
team."* Later hardened into "rank everyone always" ([[david_rulings_ranking_2026-08-31]]).

**⭐ 2026-05-17 — the concrete screen he asked for, from a Dynasty Nerds screenshot:**
> "i like how dynasty nerds has the option to view the league and your team like this … **its every teams
> aggregate value according to their value units broken down by position.**"

One row per team, aggregate value, decomposed by position. Became the team value matrix and league
opportunity map.

**⭐ 2026-05-23 — the edge thesis, which is the product's reason to exist:**
> "we're not really improving accuracy or signals from the information any other manager would have. we want
> to identify **players that are not obvious to other managers** … i want to be able to find a sleeper who we
> think is going to be very good but was drafter later in the NFL draft … if two WR were drafted in round 1
> top 10 pick and they are the same age - i want to identify which of those players will have the better NFL
> production."

⛔ **A board that just re-sorts by draft capital and age is, by his own statement, a failure.**

**⭐ 2026-05-22 — he refuses to rule on a number whose derivation he has not been shown:**
> "i can't really make an educated call because i do not know the formual for market value. if i understood
> the way we calculate market value and a practical example of how i our value would differ i could tell you
> if 10% is correct, too big or too small."

Transparency is a PRECONDITION of his approval. Same message rejected a manual-override file for pick
ownership: *"trust the data, verify the data, and ensure the data quality - there shouldn't be a need for
manual intervention."*

**⭐ 2026-05-22 — bench decay: compute the OPTIMAL lineup first.**
> "we would need to determine the best possiblle starting lineup - then whoever does not fit into that best
> possible lineup would get the decay - otherwise we're simply calculating based on whether the manager chose
> the best players for his starting lineup and decaying players that are actually valued higher due to the
> managers poor decision."

Player-level value is never decayed. Restated as a rule on 2026-07-25 ([[david_rulings_2026-07-25_dg2]]).

**⭐ His league, stated 2026-05-22 and needed by every market overlay:** *"we are a 12 team dynasty league,
superflex/2qb. ppr, with no te premium"*.

**2026-05-17 — taxi squad is ONE-WAY:** once a rookie comes off the taxi squad he cannot go back, so
activation carries an irreversible roster cost the product must price, not just a slot.

**2026-05-02 — the only May wording ruling in his own voice:** *"Trade `verdict` remains banned; use
`delta_status`."* The wider banned-vocabulary regime is the team's, enforced against the Product Constitution.

**2026-05-13 — every surface is a read-only consumer:** *"decision surfaces reading exclusively from PVO"*.
No screen invents its own valuation math.

**2026-05-25 — he commissioned the whole-app UI research:** *"i want to begin a deep research project for our
UI"*, scoped to the entire app, run as three independent agents into a locked consensus (Vite + React +
TypeScript, served FastAPI, two lanes never blended). ⛔ But see
[[david_rulings_frontend_2026-07-05]]: six weeks later he overrode that research's density and
banned-word direction.

**⛔ He specified NO typography, colour, spacing or theme in May, or in any month since.** Position colours,
status dots and the blue/model-amber/market lanes are the team's conventions. See
[[feedback_my_conventions_are_not_davids_rules]].
