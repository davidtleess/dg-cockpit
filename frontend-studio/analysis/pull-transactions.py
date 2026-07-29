#!/usr/bin/env python3
"""Pull the full transaction history for David's league from Sleeper.

The product never calls this endpoint (verified: zero matches for "transactions"
across src/, app/, scripts/). This script establishes what is actually there.

Output: analysis/transactions-raw.json  (every season, every round)
"""

import json
import pathlib
import sys
import time
import urllib.request

BASE = "https://api.sleeper.app/v1"

# Read off app/data/research/league_behavior/raw/2026-07-19/season_*/league.json
LEAGUES = {
    2023: "912589367620100096",
    2024: "1049152209134424064",
    2025: "1183088915091423232",
    2026: "1314363401744416768",
}

OUT = pathlib.Path(__file__).parent / "transactions-raw.json"


def get(url: str):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                return json.loads(r.read())
        except Exception as exc:  # noqa: BLE001
            if attempt == 2:
                print(f"  FAILED {url}: {exc}", file=sys.stderr)
                return None
            time.sleep(1.5)
    return None


def main() -> None:
    out: dict = {"pulled_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "seasons": {}}

    for season, lid in sorted(LEAGUES.items()):
        print(f"=== {season} ({lid}) ===")
        season_block = {
            "league_id": lid,
            "league": get(f"{BASE}/league/{lid}"),
            "users": get(f"{BASE}/league/{lid}/users"),
            "rosters": get(f"{BASE}/league/{lid}/rosters"),
            "transactions": {},
        }
        total = 0
        # Sleeper indexes transactions by "round" == week/leg. 1..18 covers a
        # season; offseason activity lands on the leg that was current.
        for rnd in range(1, 19):
            txns = get(f"{BASE}/league/{lid}/transactions/{rnd}")
            if txns:
                season_block["transactions"][str(rnd)] = txns
                total += len(txns)
            time.sleep(0.15)
        print(f"  {total} transactions across {len(season_block['transactions'])} rounds")
        out["seasons"][str(season)] = season_block

    OUT.write_text(json.dumps(out, indent=1))
    print(f"\nwrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
