# DG-169 — Every market number he sees is priced for a league that isn't his

**Layer:** 3 · **State:** open · **Lane:** — · **DG 3.0** · **market comparison lane**
**Source:** r/DynastyFF, *"How I'm using Points Above Replacement to generate league specific player values"*
(IAmNotOnRedditAtWork), read 2026-09-06 at David's direction. Filed by Greg 09-06.

---

## THE PROBLEM, measured on his own league

Market values are computed for a fixed format. The Reddit author's baseline — and the source of our old shipped
constants — is **12-team, SuperFlex, 0.5 PPR, 0 TEP, starting THREE receivers**:

    QB 25 · WR 53 · RB 33 · TE 13     ← these are our OLD constants, all four, exactly

**David's actual league, read from Sleeper on 09-06:** `rec: 1.0` (FULL PPR), no TE premium, and
`[QB, RB, RB, WR, WR, TE, FLEX, FLEX, SUPER_FLEX]` — **TWO starting receivers, not three.** Two differences from
the market's baseline, both pushing receivers shallower. The author's own full-PPR table moves WR 53 → 47 on the
scoring change alone.

**So every KTC / FantasyCalc number David reads is priced for a league he does not play in.** Putting our rank
beside theirs without correcting is comparing two different leagues.

## THE METHOD (his, quoted)

> Bijan KTC = 10,000 · PAR in the default league = +161.1 · PAR in your league = +167.7
> ratio = 167.7/161.1 = ~1.04 · adjusted value = 10,000 × 1.04 = 10,400

*"He's not getting a boost based on scoring lots of points. He's getting a boost specifically based on scoring
more points relative to other players when comparing your league's settings to a standard league."*

## ⛔ THIS DOES NOT BREACH RULING 8, AND THE DISTINCTION IS THE WHOLE TICKET

David's 08-31 ruling 8 (strictest option): market price is NEVER a model input. **This adjusts the MARKET's number
on the COMPARISON lane. Nothing computed here may enter a feature, a training table, or a score.** If any output
of this ticket reaches a model, the ticket is wrong.
⛔ Reinforced by his **09-06 ruling: a third-party points projection or ranking IS a market price** — see DG-173.
That widens what may not enter the model; it does not change that translation on the comparison lane is allowed.

## DONE WHEN

For any player, the card can show the market's value and positional rank **restated for his format**, beside ours,
with the adjustment factor available as a receipt. Prerequisite for DG-168.

## ⛔ TRAPS

- ⛔ Derive the baseline format from the SOURCE's published settings, not from a guess. FantasyCalc and KTC are
  hard-locked to a standard format; state which, per source, in the code.
- ⛔ Compute his side from his LIVE Sleeper settings (`league.scoring_settings`, `league.roster_positions`), never
  from a constant. The WR53 defect existed because a number was written down once and reasoned about a slot he
  does not have.
- ⚠ TE is the most baseline-sensitive position of the four. A r/fantasyfootball thread shows two analysts with
  near-identical Kelce projections (221 vs 225) reaching **VOR 106 / rank #5 versus barely worth a 2nd-rounder**,
  purely from where the line sits. Expect the largest translation effects at TE.
