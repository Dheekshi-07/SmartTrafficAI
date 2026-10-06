import pytest
import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[1]

def test_intelligent_traffic_dataset():
    data_path = PROJECT_ROOT / "data" / "processed" / "pune_traffic_intelligent.csv"
    assert data_path.exists(), "pune_traffic_intelligent.csv must exist"
    
    df = pd.read_csv(data_path)
    required_cols = ["time", "direction", "total_vehicles", "traffic_pressure", "recommended_green"]
    for col in required_cols:
        assert col in df.columns
    assert len(df) > 1000

def test_predictions_dataset():
    pred_path = PROJECT_ROOT / "data" / "processed" / "traffic_predictions.csv"
    assert pred_path.exists(), "traffic_predictions.csv must exist"
    
    df = pd.read_csv(pred_path)
    assert "target_next_5min" in df.columns
    assert "predicted_traffic" in df.columns
    assert not df["predicted_traffic"].isnull().any()
    
    # Correlation between actual and predicted should be positive and strong
    corr = df["target_next_5min"].corr(df["predicted_traffic"])
    assert corr > 0.90

def test_ml_metrics_file():
    metrics_path = PROJECT_ROOT / "results" / "ml_metrics.csv"
    assert metrics_path.exists(), "ml_metrics.csv must exist"
    
    df = pd.read_csv(metrics_path)
    row = df.iloc[0]
    assert row["mae"] > 0
    assert row["rmse"] > 0
    assert 0.8 < row["r2_score"] <= 1.0
    assert row["mae"] < row["baseline_mae"]
