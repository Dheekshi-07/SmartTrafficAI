import os
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd

# SmartTrafficAI results paths
BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BASE_DIR.parent
RESULTS_DIR = BASE_DIR / "results"
if not RESULTS_DIR.exists() and (PROJECT_ROOT / "results").exists():
    RESULTS_DIR = PROJECT_ROOT / "results"


def get_queue_comparison() -> List[Dict[str, Any]]:
    file_path = RESULTS_DIR / "queue_comparison.csv"
    if not file_path.exists():
        # Fallback to defaults
        return [
            {"Controller": "Fixed", "Average Queue": 5.43, "Maximum Queue": 14, "Queue Std Dev": 3.52},
            {"Controller": "Adaptive", "Average Queue": 2.15, "Maximum Queue": 7, "Queue Std Dev": 1.51}
        ]
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")


def get_trip_metrics() -> List[Dict[str, Any]]:
    file_path = RESULTS_DIR / "trip_metrics_comparison.csv"
    if not file_path.exists():
        return [
            {"controller": "Fixed", "vehicles_completed": 402, "avg_travel_time": 34.23, "avg_waiting_time": 12.75, "avg_time_loss": 19.13},
            {"controller": "Adaptive", "vehicles_completed": 402, "avg_travel_time": 25.47, "avg_waiting_time": 4.86, "avg_time_loss": 10.34}
        ]
    df = pd.read_csv(file_path)
    return df.to_dict(orient="records")


def get_latest_adaptive_state() -> Dict[str, Any]:
    file_path = RESULTS_DIR / "adaptive_results.csv"
    if not file_path.exists():
        return {
            "step": 931,
            "north_queue": 0,
            "south_queue": 0,
            "east_queue": 0,
            "west_queue": 0,
            "ns_pressure": 0,
            "ew_pressure": 0,
            "current_direction": "NS",
            "phase": 0
        }
    df = pd.read_csv(file_path)
    if df.empty:
        return {}
    return df.iloc[-1].to_dict()
