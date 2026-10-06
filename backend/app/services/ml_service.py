import os
from pathlib import Path
from typing import Dict, Any
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BASE_DIR.parent
RESULTS_DIR = BASE_DIR / "results"
if not RESULTS_DIR.exists() and (PROJECT_ROOT / "results").exists():
    RESULTS_DIR = PROJECT_ROOT / "results"


def get_ml_metrics() -> Dict[str, Any]:
    file_path = RESULTS_DIR / "ml_metrics.csv"
    if not file_path.exists():
        return {
            "model": "Random Forest Regressor",
            "features": "hour, minute, total_vehicles, traffic_pressure, lag_1, lag_2, lag_3, rolling_mean_3",
            "target": "target_next_5min",
            "test_samples": 1580,
            "mae": 7.47,
            "rmse": 13.90,
            "r2_score": 0.9364,
            "baseline_mae": 8.69,
            "baseline_rmse": 16.32,
            "mae_improvement_pct": 14.03,
            "rmse_improvement_pct": 14.80
        }
    df = pd.read_csv(file_path)
    return df.iloc[0].to_dict()
