#!/usr/bin/env python3
"""Derive a prose tier ladder for the Redzone Champions League.

Two independent inputs, deliberately kept separate:

  (a) STRUCTURE - how many players at each position this league actually starts,
      via Harstad's generalized positional-baseline formulas (Footballguys),
      parameterised by the league's real roster_positions. This says where
      "startable" ends. It is derived from league settings, not from prices.

  (b) MARKET SHAPE - where the FantasyCalc superflex value curve actually breaks
      within each position. This says where the natural cut points are. It is
      measured from prices, not assumed.

The ladder is only honest if (a) and (b) roughly agree. Where they disagree, say so.

Market lane only. The model lane is quarantined pending the population-rebase fix
(the two lanes are ranked over different populations); no cross-lane number is
computed here.
"""

import json
from collections import Counter

MARKET = "/Users/davidleess/dynasty-genius-product/app/cache/fantasycalc/market_values.json"
LEAGUE = ("/Users/davidleess/dynasty-genius-product/app/data/research/league_behavior/"
          "raw/2026-07-19/season_2026_1314363401744416768/league.json")

POSITIONS = ["QB", "RB", "WR", "TE"]


# --------------------------------------------------------------------------
# (a) STRUCTURE
# --------------------------------------------------------------------------

def league_shape():
    payload = json.load(open(LEAGUE))["payload"]
    counts = Counter(payload["roster_positions"])
    return {
        "name": payload["name"],
        "N": payload["settings"]["num_teams"],
        "ppr": payload["scoring_settings"].get("rec"),
        "te_premium": bool(payload["scoring_settings"].get("bonus_rec_te")),
        "S": {p: counts.get(p, 0) for p in POSITIONS},
        "F": counts.get("FLEX", 0),
        "SF": counts.get("SUPER_FLEX", 0),
        "BN": counts.get("BN", 0),
        "counts": dict(counts),
    }


def harstad_baselines(shape):
    """Harstad, 'Calculating New Positional Baselines', Footballguys.

    PPR coefficients. Flex coefficients sum to 1.0 across eligible positions,
    which is what prevents the FLEX double-count. The 1.56/1.22/1.81 terms are
    (1 + measured games-started inefficiency) at each position, not fudge factors.
    """
    N, F, SF, S = shape["N"], shape["F"], shape["SF"], shape["S"]
    assert shape["ppr"] == 1.0 and not shape["te_premium"], "PPR coefficients assumed"
    return {
        "QB": N * (S["QB"] + 0.75 * SF) * 1.56,
        "RB": N * (S["RB"] + 0.30 * F + 0.08 * SF) * 1.22,
        "WR": N * (S["WR"] + 0.70 * F + 0.17 * SF) * 1.22,
        "TE": N * (S["TE"]) * 1.81,
    }


def dedicated_starts(shape):
    """Hard weekly demand ignoring flex: how many of this position must start."""
    N, SF, S = shape["N"], shape["SF"], shape["S"]
    d = {p: N * shape["S"][p] for p in POSITIONS}
    # SUPER_FLEX is QB-eligible; Harstad's 0.75 is the measured fill rate.
    d["QB_with_sf"] = N * (S["QB"] + 0.75 * SF)
    return d


# --------------------------------------------------------------------------
# (b) MARKET SHAPE
# --------------------------------------------------------------------------

def market_by_position():
    raw = json.load(open(MARKET))
    rows = [r for r in raw["data"] if r["player"]["position"] in POSITIONS]
    out = {}
    for p in POSITIONS:
        pos = sorted((r for r in rows if r["player"]["position"] == p),
                     key=lambda r: -r["value"])
        out[p] = [{
            "rank": i + 1,
            "name": r["player"]["name"],
            "value": r["value"],
            "age": r["player"].get("maybeAge"),
            "sleeper_id": r["player"].get("sleeperId"),
        } for i, r in enumerate(pos)]
    return raw["fetched_at"], out


def step_drops(series, top_n):
    """Percentage drop from each rank to the next, over the top_n."""
    out = []
    for i in range(min(top_n, len(series)) - 1):
        a, b = series[i]["value"], series[i + 1]["value"]
        if a <= 0:
            continue
        out.append({
            "from": i + 1, "to": i + 2,
            "drop_pct": 100.0 * (a - b) / a,
            "from_name": series[i]["name"], "to_name": series[i + 1]["name"],
        })
    return out


def pct_of_pos1(series, ranks):
    top = series[0]["value"]
    return {r: (100.0 * series[r - 1]["value"] / top if r <= len(series) else None)
            for r in ranks}


# --------------------------------------------------------------------------
# report
# --------------------------------------------------------------------------

def main():
    shape = league_shape()
    base = harstad_baselines(shape)
    ded = dedicated_starts(shape)
    fetched, mkt = market_by_position()

    print("=" * 78)
    print(f"LEAGUE: {shape['name']}  |  {shape['N']} teams  |  PPR {shape['ppr']}"
          f"  |  TE premium: {shape['te_premium']}")
    print(f"  lineup: {shape['counts']}")
    print(f"  market snapshot fetched {fetched}")
    print("=" * 78)

    print("\n(a) STRUCTURE - how deep does this league actually start?\n")
    print(f"{'pos':<5}{'dedicated':>11}{'+superflex':>12}{'Harstad repl.':>15}"
          f"{'naive tier-1':>14}")
    for p in POSITIONS:
        sf = ded["QB_with_sf"] if p == "QB" else ded[p]
        print(f"{p:<5}{ded[p]:>11.0f}{sf:>12.1f}{base[p]:>15.1f}{shape['N']:>14}")

    print("\n  Read: 'dedicated' = N x starting slots. 'Harstad repl.' = the last")
    print("  genuinely startable player once flex allocation and real-world")
    print("  games-started inefficiency are folded in. The gap between the naive")
    print("  12-block vernacular and this league's real depth is the finding.")

    print("\n(b) MARKET SHAPE - value as % of the positional #1\n")
    ranks = [3, 6, 12, 18, 24, 36, 48]
    print(f"{'pos':<5}" + "".join(f"{'#'+str(r):>8}" for r in ranks) + f"{'  n':>6}")
    for p in POSITIONS:
        pcts = pct_of_pos1(mkt[p], ranks)
        cells = "".join(f"{pcts[r]:>7.0f}%" if pcts[r] is not None else f"{'-':>8}"
                        for r in ranks)
        print(f"{p:<5}{cells}{len(mkt[p]):>6}")

    print("\n(c) WHERE THE CURVE ACTUALLY BREAKS - largest single-step drops\n")
    breaks = {}
    for p in POSITIONS:
        horizon = int(base[p] * 1.4)
        drops = step_drops(mkt[p], horizon)
        drops.sort(key=lambda d: -d["drop_pct"])
        breaks[p] = drops[:8]
        print(f"  {p}  (scanned ranks 1-{horizon}, Harstad replacement {base[p]:.0f})")
        for d in sorted(drops[:8], key=lambda d: d["from"]):
            marker = ""
            if abs(d["from"] - base[p]) <= 2:
                marker = "  <-- at the replacement line"
            elif d["from"] % shape["N"] == 0:
                marker = f"  <-- on the naive {p}{d['from']//shape['N']}/{p}{d['from']//shape['N']+1} boundary"
            print(f"     {p}{d['from']:<3}-> {p}{d['to']:<4}{d['drop_pct']:>6.1f}%"
                  f"   {d['from_name']} -> {d['to_name']}{marker}")
        print()

    out = {
        "generated_note": "market lane only; model lane quarantined pending population rebase",
        "market_fetched_at": fetched,
        "league": shape,
        "harstad_replacement": base,
        "dedicated_starts": ded,
        "breaks": breaks,
        "pos_counts": {p: len(mkt[p]) for p in POSITIONS},
    }
    path = "/Users/davidleess/frontend-studio/analysis/tier-ladder-measurements.json"
    json.dump(out, open(path, "w"), indent=1)
    print(f"written: {path}")


if __name__ == "__main__":
    main()
