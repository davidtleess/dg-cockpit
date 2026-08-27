"""Read-only falsification probe: is the missing StandardScaler what deletes the rate features?

Refits the EXACT deployed recipe (median impute -> RidgeCV) against one variant that
inserts StandardScaler, on the same rows, same features, same holdout. No artifact is
written and no manifest is touched. Scratch probe for the 2026-08-18 methodology question.
"""
import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats as scipy_stats
from sklearn.impute import SimpleImputer
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ALPHAS = [0.1, 1.0, 10.0, 50.0, 100.0, 200.0, 500.0, 1000.0]
HOLDOUT = [2022, 2023]
OUTCOME = "avg_ppg_t1_t2"

df = pd.read_csv("app/data/training/engine_b_features_v2.csv")
# Same filter the real trainer applies: inference-season rows have a null outcome.
df = df[df["training_eligible"] == True]  # noqa: E712  pandas boolean mask
manifest = json.loads(Path("app/data/models/engine_b/v2_manifest.json").read_text())


def score(y, p):
    return (
        float(np.sqrt(mean_squared_error(y, p))),
        float(r2_score(y, p)),
        float(scipy_stats.spearmanr(y, p).statistic),
    )


print(f"{'pos':<5}{'variant':<14}{'RMSE':>9}{'R2':>9}{'Spearman':>10}{'alpha':>9}")
for pos, path in manifest.items():
    feats = pickle.loads(Path(path).read_bytes())["features"]
    p = df[df.position == pos]
    tr, te = p[~p.feature_season.isin(HOLDOUT)], p[p.feature_season.isin(HOLDOUT)]
    Xtr, ytr = tr[feats], tr[OUTCOME].values
    Xte, yte = te[feats], te[OUTCOME].values

    for label, pipe in (
        ("as-deployed", make_pipeline(SimpleImputer(strategy="median"), RidgeCV(alphas=ALPHAS, cv=5))),
        ("+scaler", make_pipeline(SimpleImputer(strategy="median"), StandardScaler(), RidgeCV(alphas=ALPHAS, cv=5))),
    ):
        pipe.fit(Xtr, ytr)
        r, r2, sp = score(yte, pipe.predict(Xte))
        a = pipe[-1].alpha_
        print(f"{pos:<5}{label:<14}{r:>9.3f}{r2:>9.3f}{sp:>10.3f}{a:>9.1f}")

    # naive baseline: next two years = this year
    r, r2, sp = score(yte, te["ppg_t"].values)
    print(f"{pos:<5}{'baseline ppg_t':<14}{r:>9.3f}{r2:>9.3f}{sp:>10.3f}{'-':>9}")
    print()
