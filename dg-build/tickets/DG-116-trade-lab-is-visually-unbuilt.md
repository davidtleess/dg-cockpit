# DG-116 — Trade Lab is visually unbuilt, and the verdict David ruled is missing

**Layer:** 6 · **State:** done · **Lane:** Davids-MacBook-Pro-64976 · **DG 3.0** · **frontend-only · DG-091 phase 2B WAVE 1**
**Source:** the 2026-08-30 closeout audit, observed on the LIVE product at every width.

**Problem:** Trade Lab renders three bare white native `<input>`s and native `<button>`s ("David
sends", "David receives", "Run comparison") on the dark shell, one input with no visible label,
then ~700px of empty black. Its whole page yields 673 characters of text against Roster Audit's
4,415. `/api/trade/assets?q=dart` returns a correct payload — **this is pure styling, not a broken
backend.**

**Build:**
1. Style it like the product: the shell's own inputs, buttons, cards and spacing (DG-115's tokens).
   Label every control. Fill the empty state with what to do rather than blank space.
2. **⭐ THE TRADE VERDICT — David ruled, verbatim option label: "Both prices, plainly."**
   State the arithmetic on BOTH pricings and name the disagreement. His own approved shape:
   > **By market prices** → you're giving up 1,240 more than you get
   > **By our model** → closer to even (−180)
   > The market and our model disagree here: the market likes Williams more than we do.
   **NO blended take/pass imperative** — that would need him to bless how the two are weighed when
   they disagree, and he explicitly declined it. Plain language, no hedging furniture.
3. Fix the sent-side asymmetry if it is a defect: `MarketLanePanel.tsx:76-88` lists only
   `sent_assets`, so received-side assets never appear in the per-asset list. **Confirm intent from
   the code before changing it** — the closeout audit flagged this as unconfirmed.

**Honesty law:** the two pricings are on DIFFERENT scales (model xVAR vs FantasyCalc points) — the
copy must say so rather than inviting a subtraction across them.
**Done:** the surface looks like the product at 1440 and 390; both pricings read plainly with the
disagreement named; no take/pass verdict; real-browser proof.
