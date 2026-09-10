import xml.etree.ElementTree as ET
import pandas as pd
from pathlib import Path

RESULTS_DIR = Path("results")

NO_PRIORITY_FILE = RESULTS_DIR / "ambulance_no_priority.xml"
PRIORITY_FILE = RESULTS_DIR / "emergency_tripinfo.xml"

AMBULANCE_ID = "AMB_001"


def get_ambulance_metrics(file_path, mode):

    tree = ET.parse(file_path)
    root = tree.getroot()

    for trip in root.findall("tripinfo"):

        if trip.attrib.get("id") == AMBULANCE_ID:

            return {
                "mode": mode,
                "vehicle_id": AMBULANCE_ID,
                "depart": float(
                    trip.attrib.get("depart", 0)
                ),
                "arrival": float(
                    trip.attrib.get("arrival", 0)
                ),
                "travel_time": float(
                    trip.attrib.get("duration", 0)
                ),
                "waiting_time": float(
                    trip.attrib.get("waitingTime", 0)
                ),
                "time_loss": float(
                    trip.attrib.get("timeLoss", 0)
                ),
                "route_length": float(
                    trip.attrib.get("routeLength", 0)
                )
            }

    return None


no_priority = get_ambulance_metrics(
    NO_PRIORITY_FILE,
    "Without Priority"
)

with_priority = get_ambulance_metrics(
    PRIORITY_FILE,
    "With Priority"
)

if no_priority is None:
    raise ValueError(
        "AMB_001 not found in ambulance_no_priority.xml"
    )

if with_priority is None:
    raise ValueError(
        "AMB_001 not found in emergency_tripinfo.xml"
    )

comparison = pd.DataFrame([
    no_priority,
    with_priority
])

print("\nAMBULANCE PERFORMANCE")
print("---------------------")

print(
    comparison[
        [
            "mode",
            "travel_time",
            "waiting_time",
            "time_loss",
            "route_length"
        ]
    ]
)

baseline_travel = no_priority["travel_time"]
priority_travel = with_priority["travel_time"]

baseline_wait = no_priority["waiting_time"]
priority_wait = with_priority["waiting_time"]


if baseline_travel > 0:

    travel_improvement = (
        (baseline_travel - priority_travel)
        / baseline_travel
        * 100
    )

    print(
        f"\nTravel-time reduction: "
        f"{travel_improvement:.2f}%"
    )


if baseline_wait > 0:

    waiting_improvement = (
        (baseline_wait - priority_wait)
        / baseline_wait
        * 100
    )

    print(
        f"Waiting-time reduction: "
        f"{waiting_improvement:.2f}%"
    )


comparison.to_csv(
    RESULTS_DIR / "ambulance_comparison.csv",
    index=False
)

print(
    "\nSaved: results/ambulance_comparison.csv"
)

import matplotlib.pyplot as plt

plot_df = comparison.set_index("mode")[
    [
        "travel_time",
        "waiting_time",
        "time_loss"
    ]
]

plot_df.plot(kind="bar")

plt.title(
    "Emergency Vehicle Performance"
)

plt.ylabel("Time (seconds)")
plt.xlabel("")

plt.xticks(rotation=0)

plt.tight_layout()

plt.savefig(
    RESULTS_DIR /
    "ambulance_priority_comparison.png"
)

plt.show()