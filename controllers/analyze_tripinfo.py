import xml.etree.ElementTree as ET
import pandas as pd
from pathlib import Path

RESULTS_DIR = Path("results")


def parse_tripinfo(file_path, controller_name):
    tree = ET.parse(file_path)
    root = tree.getroot()

    rows = []

    for trip in root.findall("tripinfo"):
        rows.append({
            "controller": controller_name,
            "vehicle_id": trip.attrib.get("id"),
            "duration": float(trip.attrib.get("duration", 0)),
            "waiting_time": float(trip.attrib.get("waitingTime", 0)),
            "time_loss": float(trip.attrib.get("timeLoss", 0)),
            "route_length": float(trip.attrib.get("routeLength", 0)),
            "arrival": float(trip.attrib.get("arrival", 0))
        })

    return pd.DataFrame(rows)


fixed = parse_tripinfo(
    RESULTS_DIR / "fixed_tripinfo.xml",
    "Fixed"
)

adaptive = parse_tripinfo(
    RESULTS_DIR / "adaptive_tripinfo.xml",
    "Adaptive"
)

all_trips = pd.concat(
    [fixed, adaptive],
    ignore_index=True
)

print("\nVEHICLE-LEVEL RESULTS")
print("---------------------")

summary = (
    all_trips
    .groupby("controller")
    .agg(
        vehicles_completed=("vehicle_id", "count"),
        avg_travel_time=("duration", "mean"),
        avg_waiting_time=("waiting_time", "mean"),
        avg_time_loss=("time_loss", "mean")
    )
    .reset_index()
)

print(summary)

summary.to_csv(
    RESULTS_DIR / "trip_metrics_comparison.csv",
    index=False
)

all_trips.to_csv(
    RESULTS_DIR / "all_trip_results.csv",
    index=False
)

print("\nSaved:")
print("results/trip_metrics_comparison.csv")
print("results/all_trip_results.csv")