# How the hobby actually speaks about volume

**Why this exists.** David, 2026-08-08: *"wtf is a JOB?? are you using any of your football context
research?? tear this whole surface down."* Studio had coined a noun — "the job he was given" — for
expected fantasy points, and built two surfaces on it. **No dynasty manager says that.** This file is
the vocabulary, taken from the hobby's own sources, with the published thresholds and with a note on
whether the product's data can actually speak each one. It is a reference to be searched, not read.

**The rule it encodes: before a quantity appears on a surface, find how practitioners SAY it — in
their sources, not from intuition — and use that phrasing and that unit. A coined term is a defect
even when the maths behind it is correct.**

---

## The nouns

There is no single word for "how much work a player got." The hobby uses, roughly interchangeably:
**volume · usage · workload · opportunity · role · touches**. "Role" is the closest to what Studio
meant and is safe. **"Job" is not used and reads as invented.**

**Decisively: volume is spoken as a POSITIONAL RANK, not as a rate.** *"He's getting WR2 volume."*
*"That's RB1 touches."* *"He's the alpha in that offense."* Nobody says *"his workload was worth
11.31 points a game."* When a surface needs to say how much work someone got, the natural unit is
**WR1 / WR2 / WR3-style tiering**, or a **share percentage**, not points.

Other live vernacular: **alpha** (the clear #1 target), **bell cow** / **workhorse** (a back who
does everything), **committee** / **RBBC**, **handcuff**, **target hog**, **route runner**,
**gadget**, **thump** / **early-down back**, **satellite** / **passing-down back**, **breakout age**,
**dominator rating**, **league winner**, **smash spot**.

## The metrics, with the bars practitioners quote

| metric | what it is | published bar | in our data? |
|---|---|---|---|
| **Target share** | share of a team's targets | **>20%** → WR1/WR2 outcomes · **<10%** rarely bankable · **~26%** sustained = high-end WR2 / low-end WR1 | ✅ weekly, percent-scaled |
| **Snap share** | share of offensive snaps | **70%+** the baseline for consistent production | ✅ weekly, percent-scaled |
| **Route participation** | share of team dropbacks he ran a route on | full-time ≈ 80%+ | ✅ season table |
| **TPRR** — targets per route run | targets ÷ routes run | **≥20%** — 92% of WR2-or-better finishers since 2006 cleared it; rookie-year average **18.8%** | ✅ computable weekly |
| **YPRR** — yards per route run | receiving yards ÷ routes run | stabilises at **180+ routes / 11+ games**; 1st–3rd-round rookie yr-1 avg **1.37**, yr-2 **1.59**; **under 1.00** after two years is dire | ✅ computable weekly |
| **WOPR** | 1.5 × target share + 0.7 × air-yards share | **>.700** elite | ⚠️ season only — air-yards share is empty in the weekly table |
| **Air yards / share** | distance the ball travels to the target; intent of the offense | — | ⚠️ season only (461 players) |
| **Opportunity share** (RB) | share of team carries + targets | — | ⚠️ season only, thin (138 players) |
| **Touches per game** (RB) | carries + receptions | **20+** = workhorse, weekly top-15 conversation | ✅ weekly |
| **Season touches** (RB) | | **280+** appeared in 8 of 12 RB1 seasons | ✅ weekly |
| **Bell-cow snap share** (RB) | | **70–75%+**; only ~4 backs a season clear 75% | ✅ weekly |
| **Dominator rating**, **breakout age** | college production share; age of first breakout | — | ✅ season table |

Sources: Fantasy Footballers *Dynasty WR Thresholds That Matter*; FantasyPros deep-stat glossary;
Fantasy Life *What is Route Participation*; Fantasy Points *Bell-Cow or Bust*; RotoBaller bell-cow
work; DLF air-yards app; nflanalytic YPRR explainer.

## Instrument validation — done before any number was quoted

`tools/usage-in-the-hobbys-units.py`, 2025, regular season, 174 receivers clearing the 180-route
stabilisation floor.

**YPRR leaders:** Puka Nacua 3.64, Jaxon Smith-Njigba 3.50, Dalton Kincaid 2.93, Zay Flowers 2.62,
Amon-Ra St. Brown 2.57. **TPRR leaders:** Nacua 37.0%, Smith-Njigba 33.2%, St. Brown 31.6%, Rashee
Rice 30.2%, Ja'Marr Chase 29.9%. **Both read as the names a football person would name.**

**Population:** YPRR median **1.45** (p25 1.10, p75 1.77). TPRR median **19.3%**, with **42%**
clearing the published 20% bar — consistent with that bar being meaningful rather than arbitrary.
League check: **6** backs at a 75%+ snap share over 8+ games against a published expectation of ~4.

## Three defects caught in the building of it, all of the same family

1. **Joined on NAME and silently lost a player.** The data spells him `Tre' Harris`; the roster
   spells him `Tre Harris`. Fixed to join on `dg_player_id` via the model capture's Sleeper bridge.
2. **The gamelog includes the POSTSEASON** (weeks 19–22: 149 / 99 / 48 / 24 rows, shrinking exactly
   as teams are eliminated). Every per-game rate mixed playoff football into regular-season rates,
   and the earlier `ff_opportunity` work had filtered weeks 1–18 — so the two were not comparable.
   Filtering moved Luther Burden's YPRR from 2.44 to **2.79**.
3. **A hard threshold produced a false football statement.** A 20.0-touch cutoff labelled **Ashton
   Jeanty a "committee" back** at 19.9 touches a game, on a 79% snap share with 339 touches.
   **Categorical nouns on continuous quantities lie at the boundary.** Replaced with the number
   stated against the published marker.

## His roster, in these units — 2025 regular season

**Receivers and tight ends**

| player | routes | TPRR | YPRR | target share | snap |
|---|---|---|---|---|---|
| Rome Odunze | 385 | 23.4% | 1.72 | **23.6%** | 88% |
| Garrett Wilson | 225 | 26.2% | 1.76 | **36.0%** | 88% |
| Luther Burden III | 234 | 25.6% | **2.79** | 13.1% | 39% |
| Tucker Kraft | 191 | 23.0% | **2.56** | 19.0% | 87% |
| Parker Washington | 385 | 24.7% | **2.20** | 17.9% | 66% |
| Adonai Mitchell | 306 | 24.2% | 1.48 | 15.6% | 51% |
| Elic Ayomanor | 459 | 19.4% | 1.12 | 18.5% | 81% |
| Theo Johnson | 418 | 17.7% | 1.26 | 17.2% | 87% |
| AJ Barner | 398 | 17.1% | 1.30 | 13.8% | 78% |
| Chimere Dike | 380 | 19.5% | 1.11 | 13.9% | 59% |
| Pat Bryant | 286 | 17.1% | 1.32 | 9.7% | 48% |
| Tre' Harris | 266 | 16.2% | 1.22 | 8.7% | 48% |
| Xavier Legette | 385 | 16.6% | **0.94** | 14.2% | 69% |
| Kyle Williams | 166 | 12.7% | 1.26 | 4.2% | 30% |

**Backs** — Ashton Jeanty 339 touches, 19.9/g, **79% snaps**, 366 routes (above the bell-cow line,
past the 280-touch RB1 marker). TreVeyon Henderson 222 touches, 13.1/g, 46% snaps. Braelon Allen and
Rasheen Ali rotational.

**What this says that "his job was worth 6.7 points a game" could not:** Burden ran 234 routes on a
**39% snap share** and posted **2.79 yards per route** — elite per-route production in a part-time
role, which is a completely different player from "a small workload." Legette is **under the 1.00
YPRR mark** that the Footballers call dire. Odunze and Wilson both carry alpha target shares.
**These are sentences a dynasty analyst would actually say.**

## Not done

No surface has been redesigned against this. That is deliberate — the vocabulary had to be right
first, and 017 and 018 both still carry the invented framing.
