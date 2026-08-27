"""Read-only forensics on the deployed Engine B artifacts.

Answers: what are these models actually weighting, and does the missing
standardization step distort the Ridge penalty across features?
No writes, no refits. Scratch probe for the 2026-08-18 methodology question.
"""
import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(".")
manifest = json.loads((ROOT / "app/data/models/engine_b/v2_manifest.json").read_text())
df = pd.read_csv("app/data/training/engine_b_features_v2.csv")
HOLDOUT = [2022, 2023]

for pos, path in manifest.items():
    art = pickle.loads(Path(path).read_bytes())
    model = art["model"]
    feats = art["features"]
    coefs = np.asarray(model.coef_, dtype=float)

    train = df[(df.position == pos) & (~df.feature_season.isin(HOLDOUT))][feats]
    sd = train.std(ddof=0).values.astype(float)

    alpha = float(getattr(model, "alpha_", art.get("alpha", float("nan"))))
    print(f"\n{'='*74}\n{pos}  version={art['version']}  alpha={alpha}  n_features={len(feats)}")
    print(f"{'feature':<38}{'raw coef':>12}{'sd':>10}{'std coef':>12}")
    rows = sorted(
        zip(feats, coefs, sd, coefs * sd), key=lambda r: -abs(r[3])
    )
    for name, c, s, sc in rows:
        print(f"{name:<38}{c:>12.4f}{s:>10.3f}{sc:>12.4f}")

    total = np.abs(coefs * sd).sum()
    top = rows[0]
    print(f"intercept={float(model.intercept_):.4f}")
    print(f"top feature {top[0]!r} carries {abs(top[3])/total*100:.1f}% of total standardized weight")
    ppg_family = sum(abs(r[3]) for r in rows if r[0].startswith("ppg_"))
    print(f"ppg_* family carries {ppg_family/total*100:.1f}% of total standardized weight")
