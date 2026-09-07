"""Build the 1999-2025 player-season panel for the survival curve. Cache once."""
import nflreadpy as nfl, polars as pl, pandas as pd
from pathlib import Path
SP = Path("/private/tmp/claude-501/-Users-davidleess/a4d5049a-c405-4f8e-962a-cb0817a24bfd/scratchpad")
SEASONS = list(range(1999, 2026))

st = nfl.load_player_stats(SEASONS).to_pandas()
print("weekly rows:", len(st), "| season_type values:", sorted(st.season_type.dropna().unique()))

# FANTASY SEASONS ARE REGULAR SEASON. This is a DIFFERENT quantity from Engine B's
# ppg_t (DG-024, "all games incl. postseason"): that governs a model FEATURE; this is
# "did he finish as a startable fantasy asset", and leagues play the regular season.
# Flagged for David rather than assumed silently.
reg = st[st.season_type == "REG"]
POS = ["QB", "RB", "WR", "TE"]
reg = reg[reg.position.isin(POS)]

season = (reg.groupby(["player_id", "player_display_name", "position", "season"], as_index=False)
             .agg(points=("fantasy_points_ppr", "sum"),
                  games=("fantasy_points_ppr", "size")))
season["ppg"] = season.points / season.games
print("player-seasons:", len(season), "| seasons:", season.season.min(), "-", season.season.max())

# age from rosters
ros = nfl.load_rosters(SEASONS).to_pandas()
agecol = "age" if "age" in ros.columns else None
idcol = "gsis_id" if "gsis_id" in ros.columns else "player_id"
print("roster cols for age:", [c for c in ros.columns if "age" in c or "birth" in c][:6], "| id:", idcol)
keep = [idcol, "season"] + ([agecol] if agecol else []) + \
       ([c for c in ros.columns if "birth" in c][:1])
r = ros[keep].drop_duplicates(subset=[idcol, "season"])
r = r.rename(columns={idcol: "player_id"})
season = season.merge(r, on=["player_id", "season"], how="left")
season.to_parquet(SP / "panel.parquet")
print("age coverage:", season[agecol].notna().mean().round(3) if agecol else "n/a")
print(season.head(3).to_string())
