#!/usr/bin/env python3
"""Build data.js for proposal 021 — the trade retrospective.

Reads (READ-ONLY) from the product's data stores:
  - league_transactions.db      the trade ledger + every later movement (fates)
  - research/league_behavior    completed drafts 2023-2026 (pick -> player resolution)
  - fc_forward_capture.db       latest FantasyCalc values (players AND picks)
  - model_forward_capture.db    latest model capture (DVS percentile, grade)

Deterministic: no wall-clock anywhere; the build is stamped with the FC
snapshot date it was priced against. Run twice, diff — must be identical.
"""

import json
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

DATA = Path("/Users/davidleess/dynasty-genius-product/app/data")
RAW = DATA / "research/league_behavior/raw/2026-07-19"
OUT = Path.home() / "frontend-studio/proposals/021-trade-retrospective/data.js"

DAVID_ROSTER = "1"


def rows(db, sql, args=()):
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    try:
        return [dict(r) for r in con.execute(sql, args).fetchall()]
    finally:
        con.close()


# ---------------------------------------------------------------- drafts
def load_drafts():
    """(season, round, original_roster_id) -> drafted player, via slot_to_roster_id."""
    resolution = {}
    draft_dates = {}
    for season_dir in sorted(RAW.glob("season_*")):
        season = season_dir.name.split("_")[1]
        draft_files = [p for p in season_dir.glob("draft_*.json") if "_picks" not in p.name]
        picks_files = list(season_dir.glob("draft_*_picks.json"))
        if not draft_files or not picks_files:
            continue
        draft = json.loads(draft_files[0].read_text())["payload"]
        picks = json.loads(picks_files[0].read_text())["payload"]
        if draft.get("status") != "complete":
            continue
        slot_to_roster = {int(k): int(v) for k, v in (draft.get("slot_to_roster_id") or {}).items()}
        roster_to_slot = {v: k for k, v in slot_to_roster.items()}
        # start_time is sleeper epoch ms
        draft_dates[season] = draft.get("start_time")
        for p in picks:
            rnd, slot = p["round"], p["draft_slot"]
            roster = slot_to_roster.get(slot)
            if roster is None:
                continue
            md = p.get("metadata") or {}
            resolution[(season, str(rnd), str(roster))] = {
                "player_id": str(p.get("player_id")),
                "name": f"{md.get('first_name','')} {md.get('last_name','')}".strip(),
                "position": md.get("position"),
                "team": md.get("team"),
                "pick_no": p.get("pick_no"),
                "slot": slot,
                "rounds_in_draft": draft.get("settings", {}).get("rounds"),
            }
    return resolution, draft_dates


# ---------------------------------------------------------------- prices
def load_market():
    db = DATA / "fc_forward_capture.db"
    snap = rows(db, "SELECT MAX(snapshot_date) d FROM fc_forward_capture_joinable")[0]["d"]
    first = rows(db, "SELECT MIN(snapshot_date) d FROM fc_forward_capture_joinable")[0]["d"]
    r = rows(
        db,
        "SELECT sleeper_id, player_name, position, value, overall_rank, position_rank, trend_30day "
        "FROM fc_forward_capture_joinable WHERE snapshot_date=?",
        (snap,),
    )
    players = {x["sleeper_id"]: x for x in r if x["position"] != "PICK" and x["sleeper_id"]}
    # future pick pricing: generic per (season, round) — we don't know the slot yet,
    # so early/mid/late variants are deliberately NOT used.
    ordinal = {"1": "1st", "2": "2nd", "3": "3rd", "4": "4th", "5": "5th"}
    picks = {}
    for x in r:
        if x["position"] == "PICK":
            picks[x["player_name"]] = x["value"]
    generic = {}
    for (season, rnd) in [(s, r2) for s in ("2027", "2028", "2029") for r2 in ("1", "2", "3", "4")]:
        name = f"{season} {ordinal.get(rnd, rnd + 'th')}"
        if name in picks:
            generic[(season, rnd)] = picks[name]
    return players, generic, snap, first


def load_model():
    db = DATA / "model_forward_capture.db"
    snap = rows(db, "SELECT MAX(capture_date) d FROM model_forward_capture_joinable")[0]["d"]
    r = rows(
        db,
        "SELECT sleeper_id, model_grade, engine_path, dynasty_value_score "
        "FROM model_forward_capture_joinable WHERE capture_date=? AND dynasty_value_score IS NOT NULL",
        (snap,),
    )
    return {x["sleeper_id"]: x for x in r if x["sleeper_id"]}, snap


# ---------------------------------------------------------------- ledger
def load_ledger():
    db = DATA / "league_transactions.db"
    trades = rows(db, "SELECT transaction_id, season, created_at FROM league_transaction WHERE type='trade' ORDER BY created_at")
    moves = rows(
        db,
        "SELECT transaction_id, created_at, asset_type, action, roster_id, manager_display_name, "
        "sleeper_player_id, player_name, position, team, pick_season, pick_round, "
        "pick_original_roster_id, pick_previous_owner_roster_id "
        "FROM league_transaction_movement WHERE transaction_type='trade'",
    )
    all_moves = rows(
        db,
        "SELECT transaction_id, transaction_type, created_at, action, roster_id, "
        "manager_display_name, sleeper_player_id "
        "FROM league_transaction_movement WHERE asset_type='player' AND sleeper_player_id != '' "
        "ORDER BY created_at",
    )
    managers = {}
    for m in rows(
        db,
        "SELECT roster_id, manager_display_name, MAX(created_at) FROM league_transaction_movement "
        "WHERE manager_display_name IS NOT NULL AND manager_display_name != '' GROUP BY roster_id",
    ):
        managers[m["roster_id"]] = m["manager_display_name"]
    return trades, moves, all_moves, managers


def player_fate(pid, after_iso, holder_roster, all_moves, managers):
    """First thing that happened to this player on this roster AFTER the date."""
    for m in all_moves:
        if m["sleeper_player_id"] != pid or m["created_at"] <= after_iso:
            continue
        if m["action"] == "drop" and m["roster_id"] == holder_roster:
            date = m["created_at"][:10]
            if m["transaction_type"] == "trade":
                return {"status": "flipped", "date": date}
            return {"status": "cut", "date": date}
    return {"status": "held"}


def current_location(pid, all_moves, managers):
    """A trade writes its add and drop with ONE timestamp; the drop must not win
    the tie or a rostered player reads as a free agent. Drops sort first."""
    mine = [m for m in all_moves if m["sleeper_player_id"] == pid]
    mine.sort(key=lambda m: (m["created_at"], 0 if m["action"] == "drop" else 1))
    if not mine:
        return None
    last = mine[-1]
    if last["action"] == "drop":
        return {"where": "free_agent"}
    return {"where": "roster", "manager": managers.get(last["roster_id"], f"roster {last['roster_id']}")}


# ---------------------------------------------------------------- build
def main():
    resolution, _draft_dates = load_drafts()
    market, pick_market, fc_date, fc_first = load_market()
    model, model_date = load_model()
    trades, moves, all_moves, managers = load_ledger()

    by_tx = defaultdict(list)
    for m in moves:
        by_tx[m["transaction_id"]].append(m)

    unresolved_picks = []
    unpriced_players = []
    out_trades = []

    for t in trades:
        tid, when = t["transaction_id"], t["created_at"]
        mv = by_tx[tid]
        rosters = sorted({m["roster_id"] for m in mv}, key=int)
        sides = []
        for rid in rosters:
            assets = []
            got_players = [m for m in mv if m["roster_id"] == rid and m["action"] == "add"]
            got_picks = [m for m in mv if m["roster_id"] == rid and m["action"] == "pick_acquire"]
            for m in got_players:
                pid = m["sleeper_player_id"]
                fc = market.get(pid)
                md = model.get(pid)
                if not fc:
                    unpriced_players.append(m["player_name"])
                assets.append({
                    "kind": "player",
                    "name": m["player_name"],
                    "position": m["position"],
                    "team": m["team"],
                    "sleeper_id": pid,
                    "now": {
                        "value": fc["value"] if fc else None,
                        "overall_rank": fc["overall_rank"] if fc else None,
                        "position_rank": fc["position_rank"] if fc else None,
                        "trend30": fc["trend_30day"] if fc else None,
                    },
                    "model": {"dvs": round(md["dynasty_value_score"], 1), "grade": md["model_grade"]} if md else None,
                    "fate": player_fate(pid, when, rid, all_moves, managers),
                    "loc": current_location(pid, all_moves, managers),
                })
            for m in got_picks:
                season, rnd = m["pick_season"], m["pick_round"]
                orig = m["pick_original_roster_id"]
                res = resolution.get((season, rnd, orig))
                if res:
                    pid = res["player_id"]
                    fc = market.get(pid)
                    md = model.get(pid)
                    assets.append({
                        "kind": "pick_resolved",
                        "pick": {"season": season, "round": int(rnd),
                                 "origin": managers.get(orig, f"roster {orig}"),
                                 "pick_no": res["pick_no"],
                                 "rounds_in_draft": res["rounds_in_draft"]},
                        "became": {"name": res["name"], "position": res["position"],
                                   "team": res["team"], "sleeper_id": pid},
                        "now": {
                            "value": fc["value"] if fc else None,
                            "overall_rank": fc["overall_rank"] if fc else None,
                            "position_rank": fc["position_rank"] if fc else None,
                            "trend30": fc["trend_30day"] if fc else None,
                        },
                        "model": {"dvs": round(md["dynasty_value_score"], 1), "grade": md["model_grade"]} if md else None,
                        "fate": player_fate(pid, when, rid, all_moves, managers) if fc else None,
                        "loc": current_location(pid, all_moves, managers),
                    })
                else:
                    val = pick_market.get((season, rnd))
                    if val is None and season <= "2026":
                        unresolved_picks.append(f"{season} r{rnd} orig {orig}")
                    assets.append({
                        "kind": "pick_future",
                        "pick": {"season": season, "round": int(rnd),
                                 "origin": managers.get(orig, f"roster {orig}")},
                        "now": {"value": val},
                    })
            priced = [a["now"]["value"] for a in assets if a.get("now", {}).get("value") is not None]
            sides.append({
                "roster_id": rid,
                "manager": managers.get(rid, f"roster {rid}"),
                "assets": assets,
                # None, never 0, when nothing on the side is priced — absence is not zero
                "market_total": sum(priced) if priced else None,
                "unpriced": sum(1 for a in assets if a.get("now", {}).get("value") is None),
            })
        n_assets = sum(len(s["assets"]) for s in sides)
        out_trades.append({
            "id": tid,
            "date": when[:10],
            "season": t["season"],
            "sides": sides,
            "involves_david": DAVID_ROSTER in rosters,
            "n_assets": n_assets,
            "startup_swap": n_assets >= 30,
        })

    out_trades.sort(key=lambda x: x["date"], reverse=True)

    payload = {
        "meta": {
            "priced_on": fc_date,
            "model_capture": model_date,
            "market_history_start": fc_first,
            "trades": len(out_trades),
            "seasons": sorted({t["season"] for t in out_trades}),
            "david_roster": DAVID_ROSTER,
            "david_trades": sum(1 for t in out_trades if t["involves_david"]),
            "unresolved_past_picks": unresolved_picks,
            "unpriced_players": sorted(set(unpriced_players)),
        },
        "trades": out_trades,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("window.DATA = " + json.dumps(payload, indent=1, sort_keys=True) + ";\n")

    # ------- honest build report to stderr (not part of the artifact)
    print(f"trades: {len(out_trades)}  (david: {payload['meta']['david_trades']})", file=sys.stderr)
    print(f"priced on: {fc_date}   model: {model_date}", file=sys.stderr)
    print(f"unresolved past picks: {len(unresolved_picks)} {unresolved_picks[:6]}", file=sys.stderr)
    print(f"unpriced players: {len(payload['meta']['unpriced_players'])} {payload['meta']['unpriced_players'][:8]}", file=sys.stderr)
    kinds = defaultdict(int)
    contradictions = 0
    for t in out_trades:
        for s in t["sides"]:
            for a in s["assets"]:
                kinds[a["kind"]] += 1
                fate, loc = a.get("fate"), a.get("loc")
                if fate and fate.get("status") == "held" and loc and loc.get("where") == "free_agent":
                    contradictions += 1
                    print(f"CONTRADICTION held+FA: {a.get('name')}", file=sys.stderr)
    print(f"assets: {dict(kinds)}", file=sys.stderr)
    print(f"held-vs-location contradictions: {contradictions}", file=sys.stderr)


if __name__ == "__main__":
    main()
