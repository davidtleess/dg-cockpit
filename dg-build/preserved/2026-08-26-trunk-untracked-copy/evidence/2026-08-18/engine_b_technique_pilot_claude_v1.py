"""Read-only pilot: does the model CLASS or the excluded FEATURE SET move the needle?

Same rows, same temporal holdout (2022-23), same target as the deployed recipe.
Four arms per position. Nothing is written; no artifact or manifest is touched.
Scratch probe for the 2026-08-18 methodology question.
"""
import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats as scipy_stats
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.pipeline import make_pipeline

ALPHAS = [0.1, 1.0, 10.0, 50.0, 100.0, 200.0, 500.0, 1000.0]
HOLDOUT = [2022, 2023]
OUTCOME = "avg_ppg_t1_t2"
SEED = 20260818

# Excluded from the Ridge contract for collinearity reasons that do not bind trees.
READMITTED = ["route_participation", "target_share_nfl", "air_yards_share", "total_points_t"]

df = pd.read_csv("app/data/training/engine_b_features_v2.csv")
df = df[df["training_eligible"] == True]  # noqa: E712  pandas boolean mask
manifest = json.loads(Path("app/data/models/engine_b/v2_manifest.json").read_text())


def score(y, p):
    return (
        float(np.sqrt(mean_squared_error(y, p))),
        float(r2_score(y, p)),
        float(scipy_stats.spearmanr(y, p).statistic),
    )


def run(pos, feats, label, make_model, out):
    p = df[df.position == pos]
    tr, te = p[~p.feature_season.isin(HOLDOUT)], p[p.feature_season.isin(HOLDOUT)]
    m = make_model()
    m.fit(tr[feats], tr[OUTCOME].values)
    r, r2, sp = score(te[OUTCOME].values, m.predict(te[feats]))
    out.append((pos, label, len(feats), r, r2, sp))


rows = []
for pos, path in manifest.items():
    base = pickle.loads(Path(path).read_bytes())["features"]
    wide = base + [c for c in READMITTED if c in df.columns and c not in base]

    run(pos, base, "ridge / contract", lambda: make_pipeline(
        SimpleImputer(strategy="median"), RidgeCV(alphas=ALPHAS, cv=5)), rows)
    run(pos, wide, "ridge / wide", lambda: make_pipeline(
        SimpleImputer(strategy="median"), RidgeCV(alphas=ALPHAS, cv=5)), rows)
    run(pos, base, "gbm / contract", lambda: HistGradientBoostingRegressor(
        random_state=SEED, max_iter=300, learning_rate=0.05, max_leaf_nodes=15,
        min_samples_leaf=15, l2_regularization=1.0), rows)
    run(pos, wide, "gbm / wide", lambda: HistGradientBoostingRegressor(
        random_state=SEED, max_iter=300, learning_rate=0.05, max_leaf_nodes=15,
        min_samples_leaf=15, l2_regularization=1.0), rows)

    p = df[df.position == pos]
    te = p[p.feature_season.isin(HOLDOUT)]
    r, r2, sp = score(te[OUTCOME].values, te["ppg_t"].values)
    rows.append((pos, "baseline ppg_t", 1, r, r2, sp))

print(f"{'pos':<5}{'arm':<20}{'nfeat':>6}{'RMSE':>9}{'R2':>9}{'Spearman':>10}")
for r in rows:
    print(f"{r[0]:<5}{r[1]:<20}{r[2]:>6}{r[3]:>9.3f}{r[4]:>9.3f}{r[5]:>10.3f}")
    if r[1] == "baseline ppg_t":
        print()
