# DG-169 — Every market number he sees is priced for a league he does not play in

**Layer:** 3 · **State:** MEASURED — **comparison lane, nothing built** · **Lane:** Bob · **DG 3.0** · **market honesty**
**Source:** David's 2026-09-06 reading + ruling, relayed by Greg. Measured 2026-09-06 by Bob. **No code changed, no
output of this reaches a feature, a training table or a score.**

---

## 0. HIS SETTINGS, VERIFIED AT SOURCE

Read from `league_runtime/runs/league-20260904T130046Z/snapshot.json`, not from the relay:

    rec 1.0 (FULL PPR) · no rec_te, no bonus_rec_te (NO TE premium)
    roster_positions: QB · RB · RB · WR · WR · TE · FLEX · FLEX · SUPER_FLEX  (+11 bench)
    pass_td 4.0 · rush_td 6.0 · rec_td 6.0 · pass_yd 0.04 · rush_yd 0.1 · rec_yd 0.1

Matches Greg's relay exactly. **Market values assume 12-team, 0.5 PPR, three starting receivers, no superflex.**

## 1. METHOD

Points above replacement under each format, then the ratio. **Flex is allocated GREEDILY to the best remaining
player rather than by an assumed positional split** — so no share constant is invented, and the identical rule runs
in both formats. Half-PPR is exactly `(ppr + standard) / 2`, so both scorings come from the same weekly rows.

| | QB | RB | WR | TE |
|---|---:|---:|---:|---:|
| **his** starters league-wide | 22 | 31 | **41** | 14 |
| **his** replacement, season points | 177.4 | 143.0 | 138.8 | 131.4 |
| **market** starters league-wide | 12 | 32 | **39** | 13 |
| **market** replacement, season points | 241.6 | 123.5 | 124.1 | 121.3 |

## 2. THE CORRECTION FACTOR — his value ÷ market value

| position | n | **median ratio** | p25 | p75 |
|---|---:|---:|---:|---:|
| **TE** | 13 | **1.96×** | 1.75 | 2.28 |
| **QB** | 12 | **1.95×** | 1.65 | 2.22 |
| **WR** | 39 | **1.45×** | 1.37 | 1.71 |
| RB | 31 | **0.98×** | 0.92 | 1.04 |

**Every market number he reads understates quarterbacks and tight ends by about half, and receivers by a third.
Running backs are the only position priced correctly for his league** — which is exactly backwards from where a
dynasty owner's attention usually goes.

## 3. ⛔ ONE CORRECTION TO THE FRAMING — the flex absorbs the receiver-slot difference

The brief said *"two differences, both pushing receivers shallower."* **Measured, the slot difference is almost
entirely neutralised by the flex: 41 WR starters in his league against 39 in the market format**, despite him
starting two receivers to the market's three. His two flex slots pull 17 receivers back in; the market's single
flex pulls 3.

**So the WR effect is not the slot count. It is full PPR alone**, and the same is true at tight end. What actually
drives the whole correction is **PPR scoring plus superflex**, not the receiver slot. That matters because it means
the correction would not shrink if he moved to three receivers.

## 4. WHO MOVES

**Understated by market pricing** — high-reception, low-touchdown players, which is what full PPR rewards:
Rashid Shaheed **5.93×** · Khalil Shakir **4.38×** · Baker Mayfield 3.12× · Dalton Schultz 3.01× ·
Jakobi Meyers 2.61× · George Kittle 2.57× · Patrick Mahomes 2.48×.

**Overstated** — every one a running back, all touchdown-dependent or low-reception:
Kareem Hunt **0.19×** · Woody Marks 0.22× · Kyle Monangai 0.26× · David Montgomery 0.76× · Zach Charbonnet 0.80×.

## 5. ⚠ A NOTE FOR DG-166, NOT A CLAIM ON IT

The old shipped constants were **QB25 / RB33 / WR53 / TE13**, and the contract's own comment derives QB25 as
*"12 × 2 slots = 24 starters + 1 (Superflex-native; NOT 1QB-derived)"* while deriving WR53 as *"12 × 3 = 36 + ~7
flex + buffer."* **That set is superflex at quarterback and three-receiver at receiver — his league at QB, not his
league at WR.** My measured market row (QB 12 / RB 32 / WR 39 / TE 13) does not match QB25 either, because I
modelled the market as 1QB.

So "somebody copied the half-PPR row" may be incomplete: the constants look **internally mixed** rather than
copied wholesale from one row. **Fred owns DG-166 and this is his to confirm or refute** — flagged because it
changes what the defect was.

## 6. WHAT THIS DOES NOT SUPPORT

- **Not a correction to apply.** Comparison lane. If any of these ratios reaches a feature, a training table or a
  score, the ticket has been misread.
- **Not a claim about 2026.** Measured on 2025 finishes. The ratio is a property of the two formats, but the
  per-player numbers are last season's.
- **Not dynasty value.** This corrects a *seasonal* price for format. Career length (DG-164) is a separate term
  and is unaffected.
