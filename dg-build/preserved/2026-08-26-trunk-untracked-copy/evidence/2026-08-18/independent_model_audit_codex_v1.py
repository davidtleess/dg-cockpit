#!/usr/bin/env python3
"""CODEX independent, read-only audit of Dynasty Genius model artifacts.

This is diagnostic evidence, not a promotion harness. It reproduces active
artifact scores where possible, converts linear weights to one-standard-
deviation effects, profiles the model table, and runs an expanding-time
technique screen. The screen deliberately does not write product artifacts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import pickle
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import ElasticNet, Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[4]
DATA = ROOT / "app/data/training/engine_b_features_v2.csv"
REGISTRY = ROOT / "app/config/model_registry.json"
ENGINE_A_LATEST = ROOT / "app/data/models/latest.json"
OUTCOME = "avg_ppg_t1_t2"
POSITIONS = ("QB", "RB", "WR", "TE")
OUTER_YEARS = (2021, 2022, 2023)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def clean(value: Any) -> Any:
    if isinstance(value, dict):
        return {str(k): clean(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [clean(v) for v in value]
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        value = float(value)
        return round(value, 6) if math.isfinite(value) else None
    if isinstance(value, np.bool_):
        return bool(value)
    return value


def metrics(y: np.ndarray, pred: np.ndarray) -> dict[str, float | None]:
    rho = spearmanr(y, pred).statistic if len(y) > 1 else np.nan
    return {
        "n": int(len(y)),
        "rmse": float(mean_squared_error(y, pred) ** 0.5),
        "mae": float(mean_absolute_error(y, pred)),
        "r2": float(r2_score(y, pred)) if len(y) > 1 else None,
        "spearman": float(rho) if np.isfinite(rho) else None,
    }


def load_bundle(path: Path) -> dict[str, Any]:
    with path.open("rb") as handle:
        return pickle.load(handle)


def engine_a_audit() -> dict[str, Any]:
    latest = json.loads(ENGINE_A_LATEST.read_text())
    run_id = (
        latest.get("run_id") or latest.get("active_run") or latest.get("version")
        or latest.get("model_version")
    )
    report_raw = latest.get("validation_report")
    source = ROOT / report_raw if report_raw else ENGINE_A_LATEST
    payload = json.loads(source.read_text())
    positions = payload.get("per_position", payload.get("positions", payload.get("models", {})))
    run_dir = ROOT / latest.get("run_dir", f"app/data/models/runs/{run_id}")
    for pos in POSITIONS:
        metadata_path = run_dir / f"{pos}_metadata.json"
        if metadata_path.exists():
            positions.setdefault(pos, {})["artifact_metadata"] = json.loads(metadata_path.read_text())
    return {
        "source": str(source.relative_to(ROOT)),
        "source_sha256": sha256(source),
        "run_id": run_id,
        "target": payload.get("target", "y24_ppg"),
        "features": payload.get("features", ["pick", "round", "age"]),
        "positions": positions,
    }


def resolve_active_engine_b() -> dict[str, Path]:
    registry = json.loads(REGISTRY.read_text())
    section = registry.get("engine_b", registry)
    resolved: dict[str, Path] = {}
    for pos in POSITIONS:
        raw = section.get(pos) or section.get(pos.lower())
        if isinstance(raw, dict):
            raw = raw.get("artifact_path") or raw.get("path") or raw.get("active")
        if raw:
            resolved[pos] = ROOT / str(raw)
    if len(resolved) < 4:
        manifest = json.loads((ROOT / "app/data/models/engine_b/v2_manifest.json").read_text())
        for pos in ("QB", "RB", "WR"):
            resolved.setdefault(pos, ROOT / manifest[pos])
        resolved.setdefault(
            "TE", ROOT / "app/data/models/engine_b/runs/20260626T165649Z/te_v3.pkl"
        )
    return resolved


def report_for(path: Path, pos: str) -> Path:
    return path.parent / f"validation_report_{pos.lower()}.json"


def engine_b_audit(df: pd.DataFrame) -> dict[str, Any]:
    paths = resolve_active_engine_b()
    out: dict[str, Any] = {}
    eligible = df[df.training_eligible == True].copy()  # noqa: E712
    for pos, path in paths.items():
        bundle = load_bundle(path)
        model = bundle["model"]
        imputer = bundle["imputer"]
        features = list(bundle["features"])
        pos_df = eligible[eligible.position == pos].copy()
        is_te = pos == "TE"
        eval_df = pos_df if is_te else pos_df[pos_df.feature_season.isin([2022, 2023])]
        training_proxy = pos_df if is_te else pos_df[~pos_df.feature_season.isin([2022, 2023])]
        pred = model.predict(imputer.transform(eval_df[features]))
        y = eval_df[OUTCOME].to_numpy()
        baseline = eval_df.ppg_t.to_numpy()
        raw_coef = getattr(model, "coef_", np.full(len(features), np.nan))
        sds = training_proxy[features].std(numeric_only=True, ddof=0).reindex(features)
        effects = []
        for feature, coef in zip(features, raw_coef):
            sd = float(sds[feature]) if np.isfinite(sds[feature]) else None
            effects.append({
                "feature": feature,
                "raw_coefficient": float(coef),
                "training_sd": sd,
                "one_sd_effect_ppg": float(coef * sd) if sd is not None else None,
            })
        effects.sort(key=lambda row: abs(row["one_sd_effect_ppg"] or 0), reverse=True)
        report = report_for(path, pos)
        saved = json.loads(report.read_text()) if report.exists() else None
        out[pos] = {
            "artifact": str(path.relative_to(ROOT)),
            "artifact_sha256": sha256(path),
            "report": str(report.relative_to(ROOT)) if report.exists() else None,
            "version": bundle.get("version"),
            "alpha": float(getattr(model, "alpha_", bundle.get("alpha", np.nan))),
            "features": features,
            "n_features": len(features),
            "evaluation_regime": (
                "in_sample_all_eligible; not comparable to temporal holdout"
                if is_te else "fixed temporal holdout: feature seasons 2022-2023"
            ),
            "reproduced_model_metrics": metrics(y, pred),
            "reproduced_naive_metrics": metrics(y, baseline),
            "saved_report": saved,
            "standardized_effects": effects,
        }
    return out


def data_quality(df: pd.DataFrame) -> dict[str, Any]:
    eligible = df[df.training_eligible == True].copy()  # noqa: E712
    key_dupes = int(df.duplicated(["player_id", "feature_season"]).sum())
    season_counts = (
        eligible.groupby(["position", "feature_season"]).size().rename("rows").reset_index()
    )
    feature_cols = [
        c for c in df.columns
        if c not in {"player_id", "position", "team", "depth_chart_position", OUTCOME, "training_eligible"}
    ]
    completeness = []
    for pos in POSITIONS:
        p = eligible[eligible.position == pos]
        for col in feature_cols:
            completeness.append({
                "position": pos,
                "feature": col,
                "non_null_pct": 100.0 * float(p[col].notna().mean()),
                "unique_non_null": int(p[col].nunique(dropna=True)),
            })
    return {
        "rows_total": len(df),
        "rows_eligible": len(eligible),
        "players_total": int(df.player_id.nunique()),
        "duplicate_player_season_keys": key_dupes,
        "eligible_rows_by_position": eligible.position.value_counts().sort_index().to_dict(),
        "eligible_rows_by_position_season": season_counts.to_dict("records"),
        "feature_completeness": completeness,
        "target_definition": "mean PPG across T+1 and T+2; partial horizons remain eligible",
        "target_missing_pct_all_rows": 100.0 * float(df[OUTCOME].isna().mean()),
    }


def univariate_signal(df: pd.DataFrame, audited: dict[str, Any]) -> list[dict[str, Any]]:
    eligible = df[df.training_eligible == True].copy()  # noqa: E712
    rows: list[dict[str, Any]] = []
    for pos in POSITIONS:
        p = eligible[eligible.position == pos]
        for feature in audited[pos]["features"]:
            pair = p[[feature, OUTCOME]].dropna()
            rho = spearmanr(pair[feature], pair[OUTCOME]).statistic if len(pair) > 2 else np.nan
            rows.append({
                "position": pos,
                "feature": feature,
                "n": len(pair),
                "spearman_with_target": float(rho) if np.isfinite(rho) else None,
            })
    return rows


def candidate_models(seed: int = 42) -> dict[str, Any]:
    # Deliberately small, fixed diagnostic screen. Formal research must nest tune.
    return {
        "scaled_ridge": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            ("model", Ridge(alpha=10.0)),
        ]),
        "elastic_net": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            ("model", ElasticNet(alpha=0.05, l1_ratio=0.2, max_iter=20000, random_state=seed)),
        ]),
        "hist_gradient_boosting": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("model", HistGradientBoostingRegressor(
                learning_rate=0.05, max_iter=150, max_leaf_nodes=9,
                min_samples_leaf=15, l2_regularization=2.0, random_state=seed,
            )),
        ]),
        "random_forest": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("model", RandomForestRegressor(
                n_estimators=300, max_depth=5, min_samples_leaf=8,
                max_features=0.7, random_state=seed, n_jobs=1,
            )),
        ]),
    }


def cluster_bootstrap_delta(
    pred_frame: pd.DataFrame, candidate: str, draws: int = 500, seed: int = 42
) -> dict[str, float | None]:
    rng = np.random.default_rng(seed)
    work = pred_frame[["player_id", "y", "naive", candidate]].copy()
    work["naive_sqerr"] = (work.y - work.naive) ** 2
    work["candidate_sqerr"] = (work.y - work[candidate]) ** 2
    clusters = work.groupby("player_id").agg(
        n=("y", "size"),
        naive_sqerr=("naive_sqerr", "sum"),
        candidate_sqerr=("candidate_sqerr", "sum"),
    )
    values = clusters[["n", "naive_sqerr", "candidate_sqerr"]].to_numpy()
    n_players = len(values)
    deltas = []
    for _ in range(draws):
        sampled = values[rng.integers(0, n_players, size=n_players)]
        n = sampled[:, 0].sum()
        naive = float((sampled[:, 1].sum() / n) ** 0.5)
        cand = float((sampled[:, 2].sum() / n) ** 0.5)
        deltas.append(100.0 * (naive - cand) / naive if naive else np.nan)
    finite = np.asarray([v for v in deltas if np.isfinite(v)])
    return {
        "rmse_improvement_pct_p05": float(np.quantile(finite, 0.05)),
        "rmse_improvement_pct_p50": float(np.quantile(finite, 0.50)),
        "rmse_improvement_pct_p95": float(np.quantile(finite, 0.95)),
        "bootstrap_draws": len(finite),
    }


def technique_screen(df: pd.DataFrame, audited: dict[str, Any]) -> dict[str, Any]:
    eligible = df[df.training_eligible == True].copy()  # noqa: E712
    position_results: dict[str, Any] = {}
    prediction_rows: list[dict[str, Any]] = []
    for pos in POSITIONS:
        p = eligible[eligible.position == pos].copy()
        features = audited[pos]["features"]
        fold_rows = []
        for test_year in OUTER_YEARS:
            train = p[p.feature_season < test_year]
            test = p[p.feature_season == test_year]
            if len(train) < 30 or len(test) < 5:
                continue
            preds: dict[str, np.ndarray] = {"naive": test.ppg_t.to_numpy()}
            for name, model in candidate_models(seed=42 + test_year).items():
                model.fit(train[features], train[OUTCOME])
                preds[name] = model.predict(test[features])
            for row_idx, (_, row) in enumerate(test.iterrows()):
                record = {
                    "position": pos,
                    "feature_season": test_year,
                    "player_id": row.player_id,
                    "y": row[OUTCOME],
                }
                record.update({name: values[row_idx] for name, values in preds.items()})
                prediction_rows.append(record)
            fold_rows.append({
                "test_year": test_year,
                "n_train": len(train),
                "n_test": len(test),
                "metrics": {name: metrics(test[OUTCOME].to_numpy(), pred) for name, pred in preds.items()},
            })
        pf = pd.DataFrame([r for r in prediction_rows if r["position"] == pos])
        pooled = {}
        if not pf.empty:
            for name in ("naive", *candidate_models().keys()):
                pooled[name] = metrics(pf.y.to_numpy(), pf[name].to_numpy())
                if name != "naive":
                    pooled[name]["cluster_bootstrap_vs_naive"] = cluster_bootstrap_delta(pf, name)
        position_results[pos] = {"features": features, "folds": fold_rows, "pooled": pooled}
    return {
        "status": "diagnostic_only_not_promotion_evidence",
        "outer_design": "expanding time; train seasons strictly before test feature season",
        "outer_test_seasons": list(OUTER_YEARS),
        "hyperparameters": "fixed screen values; formal bakeoff must use nested expanding-time tuning",
        "uncertainty": "player-cluster bootstrap 90% interval on pooled RMSE improvement versus naive",
        "positions": position_results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).with_suffix(".results.json"),
    )
    args = parser.parse_args()
    df = pd.read_csv(DATA)
    b = engine_b_audit(df)
    result = {
        "consultant_identity": "CODEX — Independent Third-Party Consultant",
        "recommendation_author": "CODEX",
        "audit_status": "independent_diagnostic_not_promotion_evidence",
        "decision_supported": False,
        "sources": {
            "engine_b_dataset": str(DATA.relative_to(ROOT)),
            "engine_b_dataset_sha256": sha256(DATA),
            "model_registry": str(REGISTRY.relative_to(ROOT)),
            "model_registry_sha256": sha256(REGISTRY),
        },
        "engine_a": engine_a_audit(),
        "engine_b": b,
        "data_quality": data_quality(df),
        "univariate_signal": univariate_signal(df, b),
        "technique_screen": technique_screen(df, b),
        "interpretation_rules": [
            "Raw Ridge coefficients are not comparable because active Engine B did not scale inputs.",
            "One-standard-deviation effects are descriptive, conditional, and not causal importance.",
            "TE active report is in-sample and cannot be compared to QB/RB/WR temporal holdouts.",
            "The technique screen is directional only; promotion requires preregistered nested walk-forward evidence.",
            "Market data is excluded from predictive inputs and may be used only as a downstream overlay.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(clean(result), indent=2) + "\n")
    print(args.output)


if __name__ == "__main__":
    main()
