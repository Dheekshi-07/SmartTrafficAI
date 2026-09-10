from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[3]
RESULTS_DIR = BASE_DIR / "results"


def get_queue_comparison():
    file_path = RESULTS_DIR / "queue_comparison.csv"

    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)

    return df.to_dict(orient="records")


def get_trip_metrics():
    file_path = RESULTS_DIR / "trip_metrics_comparison.csv"

    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)

    return df.to_dict(orient="records")


def get_ambulance_metrics():
    file_path = RESULTS_DIR / "ambulance_comparison.csv"

    if not file_path.exists():
        return []

    df = pd.read_csv(file_path)

    return df.to_dict(orient="records")


def get_latest_adaptive_state():
    file_path = RESULTS_DIR / "adaptive_results.csv"

    if not file_path.exists():
        return {}

    df = pd.read_csv(file_path)

    if df.empty:
        return {}

    return df.iloc[-1].to_dict()