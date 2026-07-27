# nflverse: a working reference for measuring real NFL distributions

Purpose: get you from zero to a dataframe you can compute real distributions on — coverage years, exact function names, exact column names, and the joins that actually work. Everything below was verified against live sources on **2026-07-26**. Claims I could not verify are marked `UNVERIFIED`.

---

## 0. Correction first: `nfl_data_py` is dead

If you were told to use `nfl_data_py`, that guidance is out of date.

> "nfl_data_py has been deprecated in favour of nflreadpy. All future development will occur in nflreadpy and users are encouraged to switch immediately. No further nfl_data_py maintenance or updates are planned."
> — [github.com/nflverse/nfl_data_py](https://github.com/nflverse/nfl_data_py)

The GitHub repository is **archived and read-only as of 2025-09-25** (confirmed via the GitHub API: `archived: true`). It will not be patched, and it will silently break as upstream data schemas change.

**Use these instead:**

| Language | Package | Repo | Status |
|---|---|---|---|
| Python | **`nflreadpy`** | [nflverse/nflreadpy](https://github.com/nflverse/nflreadpy) | Active. Latest release **v0.1.5** (2025-11-19). MIT. |
| R | **`nflreadr`** | [nflverse/nflreadr](https://github.com/nflverse/nflreadr) | Active. CRAN **1.5.1**. MIT. |
| Julia | `NFLData.jl` | [nflverse/NFLData.jl](https://github.com/nflverse/NFLData.jl) | Active. |

One honesty note about `nflreadpy`: it is badged **lifecycle: experimental**, its last commit is 2025-11-23, and its own README says "Most of the first version was written by Claude based on nflreadr, use at your own risk." It is nonetheless the maintainers' official and only recommended Python path. The *data* underneath it is refreshed daily and independent of the package's release cadence (see §8).

---

## 1. What nflverse actually is

nflverse is a GitHub organization that runs an automated scraping and modelling pipeline and publishes the output as **versioned files attached to GitHub Releases**. The packages are thin download-and-cache clients over those files. Nothing is behind an API key, a login, or a paywall.

**The data lives here** — you can `curl` any of it directly:

```
https://github.com/nflverse/nflverse-data/releases/download/<tag>/<file>.{csv,csv.gz,parquet,rds,qs}
```

Base URLs used by `nflreadpy` ([`downloader.py`](https://github.com/nflverse/nflreadpy/blob/main/src/nflreadpy/downloader.py)):

| Repository key | Base URL |
|---|---|
| `nflverse-data` | `https://github.com/nflverse/nflverse-data/releases/download/` |
| `dynastyprocess` | `https://github.com/dynastyprocess/data/raw/master/files/` |
| `ffopportunity` | `https://github.com/ffverse/ffopportunity/releases/download/` |
| `espnscraper` | `https://github.com/nflverse/espnscrapeR-data/raw/master/data/` |

**R analysis packages** (not needed for pure data pulls): `nflfastR` (play-by-play + EPA/WP models), `nfl4th` (4th-down decisions), `nflseedR` (season simulation), `nflplotR` (team logos/colors for ggplot2), `nflverse` (meta-package that loads the rest). Source: [github.com/orgs/nflverse/repositories](https://github.com/orgs/nflverse/repositories).

**Pipeline repos** (useful only if you want to know how a number was produced): `nflverse-pbp`, `nflverse-rosters`, `nflverse-pfr`, `nflverse-players`, `nflverse-ftn`, `ngs-data`, `rotc`.

---

## 2. `nflreadpy`: install and configure

```bash
pip install nflreadpy
# or
uv add nflreadpy
```

Requires **Python ≥ 3.10**. Dependencies: `requests`, `polars>=0.20`, `platformdirs`, `tqdm`, `pydantic`, `pydantic-settings`. Optional extra: `pandas` ([PyPI metadata](https://pypi.org/pypi/nflreadpy/json)).

Configuration is by environment variable or in code. Caching is **on by default in memory**, which means a long session re-downloads nothing but a fresh process re-downloads everything. For repeated measurement work, switch to filesystem caching:

```python
from nflreadpy.config import update_config

update_config(
    cache_mode="filesystem",   # "memory" (default) | "filesystem" | "off"
    cache_dir="~/.cache/nflverse",
    cache_duration=86400,      # seconds
    verbose=False,
    timeout=30,
)
```

Equivalent env vars: `NFLREADPY_CACHE`, `NFLREADPY_CACHE_DIR`, `NFLREADPY_CACHE_DURATION`, `NFLREADPY_VERBOSE`, `NFLREADPY_TIMEOUT`, `NFLREADPY_USER_AGENT`.

Utilities: `nfl.clear_cache()`, `nfl.get_current_season()`, `nfl.get_current_week()`.

---

## 3. The load functions, with real coverage years

This is the part that matters. Coverage years below are read directly from the function source in [`nflreadpy/src/nflreadpy/`](https://github.com/nflverse/nflreadpy/tree/main/src/nflreadpy) — these are the values the package *enforces* (it raises `ValueError` if you ask outside the range), not folklore.

Every function returns a **Polars DataFrame**.

### Seasons argument convention

Almost every seasonal function takes `seasons: int | list[int] | bool | None`. The semantics are consistent but the **defaults are not**:

- `True` → all available seasons
- `int` / `list[int]` → those seasons
- `None` → current season only

Defaults split into two camps:

- **`None` by default** (returns current season only): `load_pbp`, `load_player_stats`, `load_team_stats`, `load_rosters`, `load_rosters_weekly`, `load_snap_counts`, `load_nextgen_stats`, `load_ftn_charting`, `load_participation`, `load_injuries`, `load_depth_charts`, `load_pfr_advstats`
- **`True` by default** (returns everything): `load_schedules`, `load_draft_picks`, `load_officials`, `load_combine`

Calling `nfl.load_player_stats()` bare gives you one season, not the history. This is the single most common way to accidentally measure the wrong thing.

### Coverage table

| Function | Coverage | Grain | Returns |
|---|---|---|---|
| `load_pbp(seasons=None)` | **1999**– | one row per play | Play-by-play with `nflfastR` EPA/WP/CPOE model outputs. Largest dataset here — ~50k rows and 370+ columns per season. |
| `load_player_stats(seasons=None, summary_level="week")` | **1999**– | player × week, or player × season | Box-score + advanced stats. `summary_level` ∈ `"week"`, `"reg"`, `"post"`, `"reg+post"`. |
| `load_team_stats(seasons=None, summary_level="week")` | **1999**– | team × week/season | Same shape, team-aggregated. |
| `load_schedules(seasons=True)` | all available | one row per game | Games, results, spreads, totals, rest days, stadium, roof/surface. |
| `load_players()` | all-time (no arg) | **one row per player** | The master player table. 25,035 rows as of 2026-07-26. This is your ID crosswalk and birthdate source. |
| `load_rosters(seasons=None)` | **1920**– | player × season | Season-end roster snapshot. |
| `load_rosters_weekly(seasons=None)` | **2002**– | player × season × week | Who was actually on the roster that week. |
| `load_teams()` | n/a | one row per franchise | Abbreviations, names, colors, logo URLs. |
| `load_draft_picks(seasons=True)` | **1980**–2026 | one row per pick | From Pro Football Reference. Includes career-outcome columns. |
| `load_combine(seasons=True)` | **2000**–2026 | one row per invitee | Measurables + drills. |
| `load_snap_counts(seasons=None)` | **2012**– | player × game | From PFR. Offense/defense/ST snaps and percentages. |
| `load_nextgen_stats(seasons=None, stat_type="passing")` | **2016**– | player × week (**+ week 0 = season total**) | NFL Next Gen Stats. `stat_type` ∈ `"passing"`, `"receiving"`, `"rushing"`. |
| `load_participation(seasons=None)` | **2016**– | one row per play | Personnel, formation, box count, coverage, and the list of 22 players on the field. |
| `load_ftn_charting(seasons=None)` | **2022**– | one row per play | Manual charting: play action, screen, RPO, motion, blitzers, drops, catchable balls. |
| `load_injuries(seasons=None)` | **2009**–2025 | player × week | Practice participation + game status. See §8 for a docs/data discrepancy. |
| `load_depth_charts(seasons=None)` | **2001**– | varies by era | **Schema changed after 2024** — see §7. |
| `load_pfr_advstats(seasons=None, stat_type="pass", summary_level="week")` | **2018**– | player × week or × season | PFR advanced. `stat_type` ∈ `"pass"`, `"rush"`, `"rec"`, `"def"`. |
| `load_officials(seasons=True)` | **2015**– | official × game | |
| `load_contracts()` | historical (no arg) | one row per contract | From OverTheCap. |
| `load_trades()` | historical (no arg) | one row per trade asset | |
| `load_ff_playerids()` | n/a | one row per player | **DynastyProcess ID crosswalk** — the only place `sleeper_id` and `mfl_id` live together with 18 other ID systems. |
| `load_ff_rankings(type="draft")` | n/a | ranking rows | FantasyPros ECR. `type` ∈ `"draft"`, `"week"`, `"all"`. |
| `load_ff_opportunity(seasons=None, stat_type="weekly", model_version="latest")` | **2006**– | player × week / play | Modelled expected fantasy points. `stat_type` ∈ `"weekly"`, `"pbp_pass"`, `"pbp_rush"`. **Different licence — see §9.** |

Sources: function source files under [`nflreadpy/src/nflreadpy/`](https://github.com/nflverse/nflreadpy/tree/main/src/nflreadpy); [nflreadpy load-functions reference](https://nflreadpy.nflverse.com/api/load_functions/). The 2000 combine floor and 1980/2026 draft bounds were measured directly from `combine.csv` and `draft_picks.csv`.

### `get_current_season()` has two different answers

```python
nfl.get_current_season()              # season logic: rolls over the Thursday after Labor Day
nfl.get_current_season(roster=True)   # roster logic: rolls over March 15
```

In July 2026 these return **2025** and **2026** respectively ([`utils_date.py`](https://github.com/nflverse/nflreadpy/blob/main/src/nflreadpy/utils_date.py)). `load_rosters()` uses the roster year; everything else uses the season year. So during the offseason, a bare `load_rosters()` and a bare `load_player_stats()` are describing **different years**. Always pass seasons explicitly.

---

## 4. Runnable snippets

### Player-season stats

```python
import nflreadpy as nfl
import polars as pl

# Regular-season totals, one row per player-season, 2015 through 2025
stats = nfl.load_player_stats(seasons=list(range(2015, 2026)), summary_level="reg")

wr = (
    stats
    .filter((pl.col("position") == "WR") & (pl.col("games") >= 8))
    .select("player_id", "player_display_name", "season", "recent_team",
            "games", "targets", "receptions", "receiving_yards",
            "target_share", "receiving_epa", "fantasy_points_ppr")
)

# Real distribution, not someone's cited summary
print(wr.select(
    pl.col("target_share").quantile(q).alias(f"p{int(q*100)}")
    for q in (0.1, 0.25, 0.5, 0.75, 0.9)
))
```

Verified columns in `stats_player_reg_*`: `player_id`, `player_name`, `player_display_name`, `position`, `position_group`, `season`, `season_type`, `recent_team`, `games`, plus ~150 stat columns including `targets`, `receptions`, `receiving_yards`, `receiving_epa`, `target_share`, `air_yards_share`, `wopr`, `racr`, `passing_cpoe`, `fantasy_points`, `fantasy_points_ppr`.

Note `player_id` here **is** a gsis_id (`00-0036322`), just under a different column name.

### Rosters with ages and birthdates

`load_players()` gives one row per player and is the cleanest birthdate source. There is no `age` column anywhere in it — you compute age against a reference date yourself, which is the correct behaviour since "age" is meaningless without one.

```python
import nflreadpy as nfl
import polars as pl
import datetime as dt

players = nfl.load_players()

AS_OF = dt.date(2025, 9, 4)  # opening Thursday of the 2025 season

aged = (
    players
    .filter(pl.col("birth_date").is_not_null())
    .with_columns(
        pl.col("birth_date").cast(pl.Date),
        ((pl.lit(AS_OF) - pl.col("birth_date").cast(pl.Date)).dt.total_days() / 365.25)
            .alias("age_at_kickoff")
    )
    .select("gsis_id", "display_name", "position", "birth_date",
            "age_at_kickoff", "height", "weight", "rookie_season",
            "draft_year", "draft_round", "draft_pick")
)
```

Verified `players.csv` columns: `gsis_id`, `display_name`, `common_first_name`, `first_name`, `last_name`, `short_name`, `football_name`, `suffix`, `esb_id`, `nfl_id`, `pfr_id`, `pff_id`, `otc_id`, `espn_id`, `smart_id`, `birth_date`, `position_group`, `position`, `ngs_position_group`, `ngs_position`, `height`, `weight`, `headshot`, `college_name`, `college_conference`, `jersey_number`, `rookie_season`, `last_season`, `latest_team`, `status`, `ngs_status`, `ngs_status_short_description`, `years_of_experience`, `pff_position`, `pff_status`, `draft_year`, `draft_round`, `draft_pick`, `draft_team`.

`height` is **inches as an integer** (`73`). `weight` is pounds. `birth_date` is ISO `YYYY-MM-DD`.

If you need per-season team context instead of a career-level row, use `load_rosters(seasons=...)`, which carries `sleeper_id`, `espn_id`, `yahoo_id`, `sportradar_id`, `rotowire_id`, `fantasy_data_id` alongside `gsis_id` — see §5 for how patchy those are.

### Draft data, and joining all three

```python
import nflreadpy as nfl
import polars as pl

players = nfl.load_players()
draft   = nfl.load_draft_picks(seasons=True)
combine = nfl.load_combine(seasons=True)
stats   = nfl.load_player_stats(seasons=list(range(2015, 2026)), summary_level="reg")

# draft -> stats joins cleanly on gsis_id
draft_stats = (
    draft
    .filter(pl.col("gsis_id").is_not_null())
    .select("gsis_id", "season", "round", "pick", "team", "position", "college",
            pl.col("age").alias("age_at_draft"))
    .join(stats, left_on="gsis_id", right_on="player_id", how="left",
          suffix="_stat")
)

# combine has NO gsis_id -- bridge through players.pfr_id
bridge = players.select("gsis_id", "pfr_id").filter(pl.col("pfr_id").is_not_null())

combine_linked = (
    combine
    .filter(pl.col("pfr_id").is_not_null())
    .join(bridge, on="pfr_id", how="inner")
    .select("gsis_id", "pfr_id", "player_name", "pos", "school",
            pl.col("season").alias("combine_year"),
            "ht", "wt", "forty", "vertical", "broad_jump", "cone", "shuttle")
)

full = draft_stats.join(combine_linked, on="gsis_id", how="left")
```

Verified `draft_picks.csv` columns: `season`, `round`, `pick`, `team`, `gsis_id`, `pfr_player_id`, `cfb_player_id`, `pfr_player_name`, `hof`, `position`, `category`, `side`, `college`, `age`, `to`, `allpro`, `probowls`, `seasons_started`, `w_av`, `car_av`, `dr_av`, `games`, and career totals (`pass_*`, `rush_*`, `rec_*`, `def_*`). `age` is **age at draft**.

Verified `combine.csv` columns: `season`, `draft_year`, `draft_team`, `draft_round`, `draft_ovr`, `pfr_id`, `cfb_id`, `player_name`, `pos`, `school`, `ht`, `wt`, `forty`, `bench`, `vertical`, `broad_jump`, `cone`, `shuttle`.

---

## 5. ID systems — the actual join map

There is no single universal key. There are seven-ish ID systems and each dataset carries a different subset, sometimes under a different column name.

| ID | Example | What it is |
|---|---|---|
| `gsis_id` | `00-0036322` | NFL's own Game Statistics & Information System ID. **The de facto primary key.** |
| `esb_id` | `JEF269287` | NFL Elias Sports Bureau ID. 100% populated in `players`. |
| `smart_id` | `32004a45-...` | NFL's newer 36-char UUID. |
| `nfl_id` | `52430` | NFL.com numeric ID. |
| `pfr_id` | `JeffJu00` | Pro Football Reference. **Required for combine and snap counts.** |
| `pff_id` | `61398` | Pro Football Focus. |
| `otc_id` | `8762` | OverTheCap (contracts). |
| `espn_id` | `4262921` | ESPN. |
| `sleeper_id`, `mfl_id`, `yahoo_id`, `sportradar_id`, `fantasypros_id`, `ktc_id`, `cbs_id`, `rotowire_id`, `fleaflicker_id`, … | | Fantasy-platform IDs. Only in `load_ff_playerids()` and (partially) `load_rosters()`. |

### Same ID, different column name

This trips up nearly everyone:

| Dataset | gsis_id column | pfr_id column |
|---|---|---|
| `load_players` | `gsis_id` | `pfr_id` |
| `load_player_stats` | **`player_id`** | — |
| `load_rosters` | `gsis_id` | `pfr_id` |
| `load_draft_picks` | `gsis_id` | **`pfr_player_id`** |
| `load_combine` | **absent** | `pfr_id` |
| `load_snap_counts` | **absent** | **`pfr_player_id`** |
| `load_nextgen_stats` | **`player_gsis_id`** | — |
| `load_depth_charts` (2025+) | `gsis_id` | — |
| `load_injuries` | `gsis_id` | — |
| `load_ff_playerids` | `gsis_id` | `pfr_id` |

**Rule of thumb:** normalise everything to `gsis_id` immediately after load, using `load_players()` as the bridge table for anything that only has `pfr_id`.

### Measured ID coverage (2026-07-26, from the live release files)

Do not assume a join is complete. These are real fill rates:

`players.csv` — 25,035 rows:

| Column | Populated |
|---|---|
| `gsis_id` | 25,035 (100.0%) |
| `esb_id` | 25,035 (100.0%) |
| `birth_date` | 25,000 (99.9%) |
| `pfr_id` | 22,554 (90.1%) |
| `espn_id` | 16,768 (67.0%) |
| `pff_id` | 11,245 (44.9%) |
| `otc_id` | 9,338 (37.3%) |
| `draft_year` | 12,228 (48.8%) — the rest went undrafted |

Restricting to players with `last_season >= 2015` (8,937 rows) lifts `pfr_id` to 93.9% and `birth_date` to 99.8%. Historical players are where the holes are.

`roster_2025.csv` — 3,137 rows:

| Column | Populated |
|---|---|
| `years_exp` | 100.0% |
| `gsis_id` | 99.9% |
| `birth_date` | 94.8% |
| `espn_id` | 70.3% |
| `pfr_id` | 70.0% |
| `sleeper_id` | 68.2% |
| `sportradar_id` | 68.2% |
| `draft_number` | 59.2% |
| `yahoo_id` | 49.7% |

`sleeper_id` is missing for roughly a third of a current-season roster. If you need Sleeper linkage, cross-check `load_ff_playerids()` and expect to fall back on name+DOB matching for the remainder.

`draft_picks.csv` — 12,927 rows: `pfr_player_id` 86.4%, `gsis_id` 85.5%, `cfb_player_id` 70.1%. But for 2015+ (3,078 rows) `gsis_id` is **98.9%**.

`combine.csv` — 8,968 rows: `pfr_id` 82.9% overall, 88.4% for 2015+. Drill completion is well below invitee count — `forty` 89.6%, `bench` 60.0%, `cone` 56.6%. **Missing drill values are not zeros; they are non-participations.** Treat them as missing-not-at-random: players skip the bench press and agility drills selectively.

### Name matching, if you must

`load_ff_playerids()` ships a `merge_name` column — a normalised, punctuation-stripped, suffix-stripped name intended exactly for fallback joins. Its full column list: `mfl_id`, `sportradar_id`, `fantasypros_id`, `gsis_id`, `pff_id`, `sleeper_id`, `nfl_id`, `espn_id`, `yahoo_id`, `fleaflicker_id`, `cbs_id`, `pfr_id`, `cfbref_id`, `rotowire_id`, `rotoworld_id`, `ktc_id`, `stats_id`, `stats_global_id`, `fantasy_data_id`, `swish_id`, `name`, `merge_name`, `position`, `team`, `birthdate`, `age`, `draft_year`, `draft_round`, `draft_pick`, `draft_ovr`, `twitter_username`, `height`, `weight`, `college`, `db_season`.

Name+birthdate is a much safer fallback than name alone.

---

## 6. Polars vs pandas

`nflreadpy` returns **Polars** DataFrames, unlike `nfl_data_py`, which returned pandas. This is the largest porting cost if you're moving old code.

```python
pbp = nfl.load_pbp(2025)
df  = pbp.to_pandas()          # requires pyarrow
```

Install the extra to be safe: `pip install "nflreadpy[pandas]"`.

Translation cheatsheet for the operations you'll actually use:

| pandas | Polars |
|---|---|
| `df[df.position == "WR"]` | `df.filter(pl.col("position") == "WR")` |
| `df[["a","b"]]` | `df.select("a", "b")` |
| `df.assign(x=...)` | `df.with_columns((...).alias("x"))` |
| `df.groupby("k").agg({"v":"mean"})` | `df.group_by("k").agg(pl.col("v").mean())` |
| `pd.merge(a, b, on="k", how="left")` | `a.join(b, on="k", how="left")` |
| `df.v.quantile([.25,.5,.75])` | `df.select(pl.col("v").quantile(q) for q in (.25,.5,.75))` |
| `df.shape[0]` | `df.height` |

Two behavioural differences that will bite a measurement workflow:

- **Polars has no index.** Nothing silently aligns on row labels. This is a feature — pandas index alignment is a common source of quiet join errors.
- **Null handling differs.** Polars keeps `null` distinct from `NaN`; pandas conflates them. `pl.col("x").is_null()` and `.is_nan()` are separate predicates. When you're counting how many players actually recorded a 40-yard dash, this distinction is the whole measurement.

If you'd rather not port, `.to_pandas()` at the boundary and stay in pandas downstream. The cost is one materialisation.

---

## 7. Gotchas

**1. NGS week 0 is a season total.** `load_nextgen_stats()` returns week `0` rows that are full-season aggregates mixed into the same table as weekly rows. Measured: 1,251 such rows in `ngs_receiving`. Summing without `filter(pl.col("week") > 0)` double-counts every season. Also note the ID column is `player_gsis_id`, not `player_id`.

**2. `summary_level="week"` is the default for player stats.** Bare `load_player_stats()` gives you weekly rows for the current season. For season totals you need `summary_level="reg"` (or `"reg+post"`). Do not hand-sum weekly rows to get season rate stats — `target_share`, `wopr`, `racr`, and EPA-derived columns are ratios and don't sum.

**3. Participation is post-season only from 2023 onward.** "Participation data from 2023 onwards is courtesy of FTN and is provided after all post-season games are completed. It does not update during the season!" ([schedule article](https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html)). `nflreadpy`'s `load_participation` encodes this: if the current week isn't 22 it caps `max_season` at `current_season - 1` and **raises `ValueError`** if you ask for the in-progress season. The pre-2023 source (NFL NGS) died mid-2023 season, so 2023 is a source-transition year — check for schema and coverage discontinuity before pooling 2022 and 2023.

**4. Depth charts changed schema after 2024.** Pre-2025 columns: `season, club_code, week, game_type, depth_team, last_name, first_name, football_name, formation, gsis_id, jersey_number, position, elias_id, depth_position, full_name`. 2025+ columns: `dt, team, player_name, espn_id, gsis_id, pos_grp_id, pos_grp, pos_id, pos_name, pos_abb, pos_slot, pos_rank`. There is **no `week` and no `season`** in the new format — just an ISO8601 `dt` timestamp per append-only snapshot. Concatenating eras requires explicit reconciliation; `nflreadpy` uses `pl.concat(..., how="diagonal_relaxed")`, which will happily produce a table half-full of nulls without complaining.

**5. Injuries: the docs and the data disagree.** The [schedule article](https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html) states "Our data source died after the 2024 season. At the moment, there is no 2025 data." But as of 2026-07-26, `injuries_2025.csv` exists and contains **6,068 rows covering weeks 1–22 of 2025**, with the release last updated 2026-03-18. The 2025 file also has a **different schema** — it adds `season_type` and drops `date_modified` relative to 2024. Read: the docs are stale, the data was restored, and the schema shifted. Verify before pooling. `UNVERIFIED`: whether the 2025 file is complete or a partial backfill.

**6. `load_pbp` is heavy.** ~50k rows × 370+ columns per season. Pulling 1999–2025 in one call is several GB in memory. Prefer the parquet files and column projection, or loop season by season. Note also the pbp release timestamp was 2026-02-12 — it does not refresh in the offseason.

**7. Combine height is a string.** `combine.ht` is `"6-1"`; `players.height` is `73` (inches). Parse before comparing.

**8. `car_av` is often empty for active players.** In the draft table, `dr_av` (approximate value with the drafting team) is populated where `car_av` is not. Don't treat blank as zero.

**9. Team abbreviations move.** Relocations and rebrands mean `OAK`/`LV`, `SD`/`LAC`, `STL`/`LA`, `WAS`/`WSH` appear across eras. `load_teams()` is the reconciliation table. `nflfastR`/`nflreadr` apply cleaning to pbp but not uniformly across every release.

**10. Stat corrections land Monday–Wednesday.** The maintainers' own advice: "Thursday's `load_pbp()` is the cleanest data we have." If you measure in-season on a Monday, you're measuring pre-correction numbers.

---

## 8. Freshness

Update cadence, per the [nflverse schedule article](https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html):

| Release | Cadence |
|---|---|
| `pbp_raw` | within ~15 min of game end |
| `pbp`, `stats_player`, `stats_team` | nightly after game days, plus in-game checkpoints |
| game/schedule | every 5 minutes during season |
| `rosters`, `players`, `depth_charts`, `pfr_advstats` | daily, 07:00 UTC |
| `snap_counts`, `ftn_charting` | 00/06/12/18 UTC during season |
| `nextgen_stats` | nightly 03:00–05:00 ET during season |
| `participation` | post-season only (2023+) |
| `draft_picks`, `combine`, `contracts` | as needed |

You can check any release's actual last-write yourself — every release tag carries a `timestamp.txt`:

```bash
curl -sL https://github.com/nflverse/nflverse-data/releases/download/players/timestamp.txt
```

Measured 2026-07-26: `players` 2026-07-26 05:54 EDT, `rosters` 2026-07-26 05:09, `depth_charts` 2026-07-26 05:09, `contracts` 2026-07-26 05:19, `stats_player` 2026-07-10, `draft_picks` 2026-05-05, `combine` 2026-03-12, `nextgen_stats` 2026-02-28, `pfr_advstats` 2026-02-15, `pbp` 2026-02-12, `pbp_participation` 2026-02-10, `ftn_charting` 2026-02-10, `snap_counts` 2026-02-09. Year-round datasets keep updating; season datasets go quiet in the offseason.

Live status table: <https://nflreadr.nflverse.com/articles/nflverse_data_schedule.html#automation-status>.

---

## 9. Licensing — read this before you publish a chart

The licences are **not uniform**, and the difference between CC-BY and CC-BY-SA is a real obligation difference, not a formality.

The maintainers' own summary:

> "The majority of all nflverse data available (ie all but the FTN data as of July 2025) is broadly licensed as CC-BY 4.0, and the FTN data is CC-BY-SA 4.0."
> — [nflreadpy README](https://github.com/nflverse/nflreadpy/blob/main/README.md)

### Per-source breakdown

| Source | Datasets | Licence | Required attribution |
|---|---|---|---|
| **nflverse base data** | `load_pbp`, `load_player_stats`, `load_team_stats`, `load_schedules`, `load_players`, `load_rosters`, `load_rosters_weekly`, `load_teams`, `load_draft_picks`, `load_combine`, `load_snap_counts`, `load_nextgen_stats`, `load_injuries`, `load_depth_charts`, `load_pfr_advstats`, `load_officials`, `load_contracts`, `load_trades` | **CC-BY-4.0** ([nflverse-data LICENSE.md](https://github.com/nflverse/nflverse-data/blob/master/LICENSE.md) — "Attribution 4.0 International") | Credit nflverse. |
| **FTN charting** | `load_ftn_charting` (**2022–**) | **CC-BY-SA-4.0** | "attribution must be made to **FTN Data via nflverse**" ([load_ftn_charting](https://nflreadr.nflverse.com/reference/load_ftn_charting.html)) |
| **Participation, 2023 onward** | `load_participation` for seasons **≥ 2023** | **CC-BY-SA-4.0** | "attribution must be made to **FTN Data via nflverse** (from 2023 onwards)" ([load_participation](https://nflreadr.nflverse.com/reference/load_participation.html)) |
| **Participation, 2022 and earlier** | `load_participation` for seasons **≤ 2022** | **CC-BY-SA-4.0** per the same notice | "**NFL NextGenStats via nflverse** (for 2022 and earlier)" |
| **ffopportunity** | `load_ff_opportunity` | **Data + models: CC-BY-SA-4.0.** Package code: GPL-3 ([LICENSE.md](https://github.com/ffverse/ffopportunity/blob/main/LICENSE.md), verified GPLv3) | Credit ffopportunity / ffverse. |
| **Package code** | `nflreadpy`, `nflreadr` | **MIT** | — |

### Why CC-BY-SA matters more than CC-BY

- **CC-BY-4.0** — use it however you like, including commercially and in closed products. You just have to credit the source and note changes.
- **CC-BY-SA-4.0** — same, **plus ShareAlike**: if you distribute an *adapted* version of that material, the adaptation must carry CC-BY-SA-4.0 too. This is a copyleft term and it propagates.

Practical consequence for measurement work: a table of quantiles you computed **from FTN or 2023+ participation data**, published as a derived dataset, is plausibly an adaptation and would carry the ShareAlike obligation. The same table computed from `load_player_stats` would not.

`UNVERIFIED` — where exactly the line falls between an "adaptation" (SA propagates) and a "collection" or purely factual summary (it may not) under CC-BY-SA-4.0. That's a legal judgment, not a documentation fact. Read the [licence deed](https://creativecommons.org/licenses/by-sa/4.0/) and, if you're publishing derived data commercially, take advice.

**Practical safe pattern:** keep the CC-BY-SA sources (`load_ftn_charting`, `load_participation`, `load_ff_opportunity`) in a separate pipeline from the CC-BY-4.0 base data. Mixing them into one published derived table means the strictest licence in the mix governs the whole thing. If your work only needs base data, don't pull FTN — you save yourself the obligation entirely.

Also, separately from copyright: the underlying facts belong to their originators. `nflreadr`'s own terms note that "NFL data accessed by this package belong to their respective owners, and are governed by their terms of use." Pro Football Reference, NFL Next Gen Stats, FTN, PFF, and OverTheCap each have their own terms.

**Minimum attribution line for a published chart using base data:**
`Data: nflverse (nflverse-data), CC BY 4.0.`

**With FTN-derived data:**
`Data: FTN Data via nflverse, CC BY-SA 4.0.`

---

## 10. Verification notes

- Coverage years, function signatures, and default arguments: read from [`nflreadpy` source on `main`](https://github.com/nflverse/nflreadpy/tree/main/src/nflreadpy), cross-checked against the [published API reference](https://nflreadpy.nflverse.com/api/load_functions/).
- All column lists and every fill-rate percentage: measured directly from the live CSVs at `github.com/nflverse/nflverse-data/releases/download/` on 2026-07-26.
- Archival status of `nfl_data_py` and release versions: GitHub REST API and [PyPI JSON](https://pypi.org/pypi/nflreadpy/json).
- Licence text: [nflverse-data LICENSE.md](https://github.com/nflverse/nflverse-data/blob/master/LICENSE.md), [nflreadpy README](https://github.com/nflverse/nflreadpy/blob/main/README.md), [load_ftn_charting](https://nflreadr.nflverse.com/reference/load_ftn_charting.html), [load_participation](https://nflreadr.nflverse.com/reference/load_participation.html), [ffopportunity LICENSE.md](https://github.com/ffverse/ffopportunity/blob/main/LICENSE.md).
- **The Python snippets in §4 were written against verified function signatures and verified column names, but were not executed** — `nflreadpy` was not installed in the environment where this was compiled. Treat them as API-correct, not smoke-tested.

Community support: the [nflverse Discord](https://discord.com/invite/5Er2FBnnQa) is where the maintainers actually answer questions.
