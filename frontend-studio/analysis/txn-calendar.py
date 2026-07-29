#!/usr/bin/env python3
"""When does THIS league actually trade? Four seasons, 39 trades, timestamped.

David's own standing domain note (2026-07-24): "the seasonal trade calendar is
real and is the rebuilder's engine." The app has no notion of a calendar and has
never read a transaction. This measures the league's own rhythm from its log.

Studio's own computation, unreviewed.
"""

import json
import pathlib
from collections import Counter, defaultdict
from datetime import datetime, timezone

HERE = pathlib.Path(__file__).parent
RAW = HERE / "txn-raw"
OUT = HERE / "txn-calendar.json"
SEASONS = [2023, 2024, 2025, 2026]


def load(n):
    p = RAW / n
    return json.loads(p.read_text()) if p.exists() else None


def dt(ms):
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc) if ms else None


def main():
    events = []
    for season in SEASONS:
        for rnd in range(1, 19):
            for t in load(f"{season}-txn-{rnd}.json") or []:
                if t.get("status") != "complete":
                    continue
                when = dt(t.get("status_updated") or t.get("created"))
                if not when:
                    continue
                events.append(
                    {
                        "season": season,
                        "type": t.get("type"),
                        "month": when.month,
                        "date": when.strftime("%Y-%m-%d"),
                        "picks": len(t.get("draft_picks") or []),
                        "players": len(t.get("adds") or {}),
                    }
                )

    trades = [e for e in events if e["type"] == "trade"]
    by_month_trades = Counter(e["month"] for e in trades)
    by_month_all = Counter(e["month"] for e in events)
    picks_by_month = Counter()
    for e in trades:
        picks_by_month[e["month"]] += e["picks"]

    MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
    print(f"{'month':6} {'trades':>7} {'share':>7} {'picks moved':>12} {'all moves':>10}")
    total_tr = len(trades)
    for m in range(1, 13):
        tr = by_month_trades.get(m, 0)
        bar = "█" * tr
        print(
            f"{MONTHS[m-1]:6} {tr:>7} {tr/total_tr*100:>6.1f}% {picks_by_month.get(m,0):>12} "
            f"{by_month_all.get(m,0):>10}  {bar}"
        )
    print(f"{'TOTAL':6} {total_tr:>7}")

    # in-season (Sep-Dec) vs offseason
    inseason = sum(by_month_trades.get(m, 0) for m in (9, 10, 11, 12))
    offseason = total_tr - inseason
    print(f"\nin-season (Sep-Dec): {inseason} trades   offseason (Jan-Aug): {offseason} trades")

    # trades that included at least one pick
    with_picks = sum(1 for e in trades if e["picks"] > 0)
    print(f"trades including >=1 draft pick: {with_picks}/{total_tr} ({with_picks/total_tr*100:.0f}%)")

    # per-season trade counts and the last trade of each season
    print("\nper season:")
    for s in SEASONS:
        st = [e for e in trades if e["season"] == s]
        if st:
            print(
                f"  {s}: {len(st):2} trades  first {min(e['date'] for e in st)}  "
                f"last {max(e['date'] for e in st)}"
            )

    OUT.write_text(
        json.dumps(
            {
                "trades_total": total_tr,
                "by_month_trades": {MONTHS[m - 1]: by_month_trades.get(m, 0) for m in range(1, 13)},
                "by_month_all_moves": {MONTHS[m - 1]: by_month_all.get(m, 0) for m in range(1, 13)},
                "picks_moved_by_month": {MONTHS[m - 1]: picks_by_month.get(m, 0) for m in range(1, 13)},
                "inseason_trades_sep_dec": inseason,
                "offseason_trades_jan_aug": offseason,
                "trades_with_picks": with_picks,
                "events": events,
            },
            indent=1,
        )
    )
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
