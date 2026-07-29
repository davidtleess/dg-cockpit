#!/usr/bin/env python3
"""Does the app's partner ranking have any relationship to whether the
counterparty actually trades?

Joins on Sleeper user_id (owner) so managers are tracked across seasons even
when roster_id or team name changes.

Studio's own computation, unreviewed.
"""

import json
import pathlib
import urllib.request
from collections import Counter

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "txn-reachability.json"
SEASONS = [2023, 2024, 2025, 2026]


def load(n):
    p = RAW / n
    return json.loads(p.read_text()) if p.exists() else None


def spearman(a, b):
    """Rank correlation without scipy. a, b are equal-length numeric lists."""

    def ranks(xs):
        order = sorted(range(len(xs)), key=lambda i: xs[i])
        r = [0.0] * len(xs)
        i = 0
        while i < len(order):
            j = i
            while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
                j += 1
            avg = (i + j) / 2 + 1
            for k in range(i, j + 1):
                r[order[k]] = avg
            i = j + 1
        return r

    ra, rb = ranks(a), ranks(b)
    n = len(a)
    ma, mb = sum(ra) / n, sum(rb) / n
    num = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    den = (sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb)) ** 0.5
    return round(num / den, 3) if den else None


def main():
    # career activity per owner across all four seasons
    career_moves, career_trades, seasons_present = Counter(), Counter(), Counter()
    for season in SEASONS:
        rosters = load(f"{season}-rosters.json") or []
        owner_of = {r["roster_id"]: r.get("owner_id") for r in rosters}
        for rid, oid in owner_of.items():
            if oid:
                seasons_present[oid] += 1
        for rnd in range(1, 19):
            for t in load(f"{season}-txn-{rnd}.json") or []:
                if t.get("status") != "complete":
                    continue
                for rid in t.get("roster_ids") or []:
                    oid = owner_of.get(rid)
                    if not oid:
                        continue
                    career_moves[oid] += 1
                    if t.get("type") == "trade":
                        career_trades[oid] += 1

    # current season identities + the app's ranking
    users = load("2026-users.json")
    rosters = load("2026-rosters.json")
    name_by_owner = {
        u["user_id"]: ((u.get("metadata") or {}).get("team_name") or u.get("display_name"))
        for u in users
    }
    owner_by_roster = {r["roster_id"]: r.get("owner_id") for r in rosters}

    with urllib.request.urlopen("http://127.0.0.1:8000/api/league/pulse", timeout=30) as r:
        pulse = json.loads(r.read())
    pscore = {int(p["counterparty_roster_id"]): p["partner_score"] for p in pulse["partner_rankings"]}
    prank = {rid: i + 1 for i, rid in enumerate(sorted(pscore, key=lambda x: -pscore[x]))}

    # 2026-only activity
    moves26, trades26 = Counter(), Counter()
    for rnd in range(1, 19):
        for t in load(f"2026-txn-{rnd}.json") or []:
            if t.get("status") != "complete":
                continue
            for rid in t.get("roster_ids") or []:
                moves26[rid] += 1
                if t.get("type") == "trade":
                    trades26[rid] += 1

    rows = []
    for rid, rank in sorted(prank.items(), key=lambda kv: kv[1]):
        oid = owner_by_roster.get(rid)
        rows.append(
            {
                "app_partner_rank": rank,
                "app_partner_score": pscore[rid],
                "roster_id": rid,
                "team": name_by_owner.get(oid, f"roster{rid}"),
                "moves_2026": moves26.get(rid, 0),
                "trades_2026": trades26.get(rid, 0),
                "career_moves": career_moves.get(oid, 0),
                "career_trades": career_trades.get(oid, 0),
                "seasons_in_league": seasons_present.get(oid, 0),
            }
        )

    ranks = [r["app_partner_rank"] for r in rows]
    res = {
        "rows": rows,
        "spearman_apprank_vs_moves2026": spearman(ranks, [r["moves_2026"] for r in rows]),
        "spearman_apprank_vs_trades2026": spearman(ranks, [r["trades_2026"] for r in rows]),
        "spearman_apprank_vs_careertrades": spearman(ranks, [r["career_trades"] for r in rows]),
        "note": "app rank 1 = best partner. A POSITIVE spearman here means the app ranks "
        "ACTIVE managers WORSE (rank number rises with activity).",
    }
    OUT.write_text(json.dumps(res, indent=1))

    print(
        f"{'rank':>4} {'team':26} {'score':>6} {'mv26':>5} {'tr26':>5} "
        f"{'career mv':>10} {'career tr':>10} {'seasons':>8}"
    )
    for r in rows:
        print(
            f"{r['app_partner_rank']:>4} {str(r['team'])[:26]:26} {r['app_partner_score']:>6} "
            f"{r['moves_2026']:>5} {r['trades_2026']:>5} {r['career_moves']:>10} "
            f"{r['career_trades']:>10} {r['seasons_in_league']:>8}"
        )
    print()
    for k, v in res.items():
        if k.startswith("spearman"):
            print(f"{k}: {v}")
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
