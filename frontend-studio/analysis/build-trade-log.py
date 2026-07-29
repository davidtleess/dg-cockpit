#!/usr/bin/env python3
"""Every trade this league has ever made, resolved to names, four seasons.

David, 2026-07-28: "i would like to know what the trades were not just see a square."

Manager identity is resolved PER SEASON — roster_id 4 is not the same person in
2023 and 2026 — by joining that season's rosters to that season's users, then
keying the manager on Sleeper user_id so the same person carries one label
across seasons even when the team name changed.

Output: analysis/trade-log.json  (merged into league-activity.json by
        analysis/build-activity-data.py)

Studio's own computation, unreviewed.
"""

import json
import pathlib
from collections import Counter
from datetime import datetime, timezone

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "trade-log.json"
SEASONS = [2023, 2024, 2025, 2026]
YOUR_OWNER_ID = None  # resolved below from 2026 roster_id 1


def load(n):
    p = RAW / n
    return json.loads(p.read_text()) if p.exists() else None


def ordinal(n):
    return {1: "1st", 2: "2nd", 3: "3rd"}.get(n, f"{n}th")


def main():
    names = json.loads((HERE / "sleeper-name-map.json").read_text())

    # canonical manager label per owner: the most recent season's team name
    label_by_owner, owner_seen = {}, {}
    for season in SEASONS:
        for u in load(f"{season}-users.json") or []:
            nm = (u.get("metadata") or {}).get("team_name") or u.get("display_name")
            if nm:
                label_by_owner[u["user_id"]] = nm  # later seasons overwrite earlier
            owner_seen.setdefault(u["user_id"], []).append(season)

    you = None
    for r in load("2026-rosters.json") or []:
        if r["roster_id"] == 1:
            you = label_by_owner.get(r.get("owner_id"))

    trades, missing_names = [], Counter()
    for season in SEASONS:
        owner_of = {r["roster_id"]: r.get("owner_id") for r in load(f"{season}-rosters.json") or []}

        def team(rid):
            return label_by_owner.get(owner_of.get(rid)) or f"roster {rid}"

        for rnd in range(1, 19):
            for t in load(f"{season}-txn-{rnd}.json") or []:
                if t.get("status") != "complete" or t.get("type") != "trade":
                    continue
                ms = t.get("status_updated") or t.get("created")
                when = datetime.fromtimestamp(ms / 1000, tz=timezone.utc) if ms else None
                parties = [team(r) for r in t.get("roster_ids") or []]

                # what each side ended up with — the only framing a manager uses
                side = {p: {"players": [], "picks": []} for p in parties}
                for pid, rid in (t.get("adds") or {}).items():
                    meta = names.get(str(pid))
                    if not meta:
                        missing_names[str(pid)] += 1
                    label = (meta or {}).get("n") or f"player {pid}"
                    pos = (meta or {}).get("p")
                    tgt = team(rid)
                    if tgt in side:
                        side[tgt]["players"].append(
                            {"name": label, "pos": pos, "id": str(pid)}
                        )
                for dp in t.get("draft_picks") or []:
                    base = f"{dp.get('season')} {ordinal(dp.get('round'))}"
                    origin, to_, from_ = team(dp.get("roster_id")), team(dp.get("owner_id")), team(
                        dp.get("previous_owner_id")
                    )
                    if origin == to_:
                        label = "his own " + base
                    elif origin != from_:
                        label = f"{base} ({origin})"
                    else:
                        label = base
                    if to_ in side:
                        side[to_]["picks"].append(
                            {
                                "label": label,
                                "season": dp.get("season"),
                                "round": dp.get("round"),
                                "origin": origin,
                            }
                        )

                trades.append(
                    {
                        "id": str(t.get("transaction_id")),
                        "season": season,
                        "date": when.strftime("%Y-%m-%d") if when else None,
                        "month": when.month if when else None,
                        "parties": parties,
                        "involves_you": you in parties,
                        "sides": [
                            {
                                "team": p,
                                "players": side[p]["players"],
                                "picks": side[p]["picks"],
                            }
                            for p in parties
                        ],
                        "n_players": sum(len(s["players"]) for s in side.values()),
                        "n_picks": sum(len(s["picks"]) for s in side.values()),
                    }
                )

    # 2023 was this league's first season, so its pre-season pick swap is a
    # STARTUP draft — a different animal from every rookie draft since, and it
    # never recurs. David, 2026-07-28: "you don't need to include startup draft
    # data." DROPPED AT SOURCE so no consumer can accidentally count it.
    dropped = [t for t in trades
               if max((p["round"] for s in t["sides"] for p in s["picks"]), default=0) > 3]
    trades = [t for t in trades if t not in dropped]
    for t in trades:
        t["startup_era"] = False

    trades.sort(key=lambda t: (t["date"] or ""), reverse=True)

    # a one-line headline per trade — what a manager would say out loud
    for t in trades:
        bits = []
        for s in t["sides"]:
            got = [p["name"] for p in s["players"]] + [p["label"] for p in s["picks"]]
            bits.append(f"{s['team']} got {', '.join(got) if got else 'nothing recorded'}")
        t["headline"] = "; ".join(bits)

    # ---- who is actually behind each team, and for how long ----
    # A roster can change hands and a team can be renamed. History follows the
    # HUMAN (Sleeper user_id), never the roster slot and never the team name.
    seasons_by_owner, names_by_owner, rosters_by_owner = {}, {}, {}
    for season in SEASONS:
        for r in load(f"{season}-rosters.json") or []:
            oid = r.get("owner_id")
            if not oid:
                continue
            seasons_by_owner.setdefault(oid, []).append(season)
            rosters_by_owner.setdefault(oid, set()).add(r["roster_id"])
        for u in load(f"{season}-users.json") or []:
            nm = (u.get("metadata") or {}).get("team_name") or u.get("display_name")
            if nm:
                names_by_owner.setdefault(u["user_id"], []).append((season, nm))

    tenure = {}
    for oid, seasons in seasons_by_owner.items():
        names = names_by_owner.get(oid, [])
        seen = []
        for _, nm in sorted(names):
            if nm not in seen:
                seen.append(nm)
        tenure[label_by_owner.get(oid, oid)] = {
            "owner_id": oid,
            "first_season": min(seasons),
            "last_season": max(seasons),
            "seasons": sorted(seasons),
            "still_in_league": 2026 in seasons,
            "current_name": seen[-1] if seen else None,
            "former_names": seen[:-1],
            "roster_slots_held": sorted(rosters_by_owner.get(oid, [])),
        }

    OUT.write_text(json.dumps(
        {"you": you, "trades": trades, "tenure": tenure,
         "dropped_startup_trades": len(dropped)}, indent=1))
    print(f"wrote {OUT}: {len(trades)} trades ({len(dropped)} startup dropped), you = {you}")
    still = [t for t, v in tenure.items() if v["still_in_league"]]
    gone = [t for t, v in tenure.items() if not v["still_in_league"]]
    print(f"  managers still in the league: {len(still)}")
    print(f"  managers who have LEFT (their history must not attach to a successor): {gone}")
    for t, v in sorted(tenure.items(), key=lambda kv: kv[1]["first_season"]):
        if v["still_in_league"]:
            print(f"    {t[:30]:32} joined {v['first_season']} "
                  f"({len(v['seasons'])} seasons)"
                  + (f"  formerly: {', '.join(v['former_names'])}" if v["former_names"] else ""))
    print("unresolved player ids:", len(missing_names), dict(list(missing_names.items())[:8]))
    for t in trades[:3] + trades[-2:]:
        print(f"  {t['date']} [{t['season']}] {t['headline'][:150]}")


if __name__ == "__main__":
    main()
