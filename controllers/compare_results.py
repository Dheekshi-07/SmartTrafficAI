import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

RESULTS_DIR = Path("results")

fixed = pd.read_csv(
    RESULTS_DIR / "fixed_results.csv"
)

adaptive = pd.read_csv(
    RESULTS_DIR / "adaptive_results.csv"
)

if "total_queue" not in fixed.columns:
    fixed["total_queue"] = (
        fixed["north_queue"]
        + fixed["south_queue"]
        + fixed["east_queue"]
        + fixed["west_queue"]
    )

if "total_queue" not in adaptive.columns:
    adaptive["total_queue"] = (
        adaptive["north_queue"]
        + adaptive["south_queue"]
        + adaptive["east_queue"]
        + adaptive["west_queue"]
    )

queue_summary = pd.DataFrame({
    "Controller": ["Fixed", "Adaptive"],
    "Average Queue": [
        fixed["total_queue"].mean(),
        adaptive["total_queue"].mean()
    ],
    "Maximum Queue": [
        fixed["total_queue"].max(),
        adaptive["total_queue"].max()
    ],
    "Queue Std Dev": [
        fixed["total_queue"].std(),
        adaptive["total_queue"].std()
    ]
})

trip_summary = pd.read_csv(
    RESULTS_DIR / "trip_metrics_comparison.csv"
)

print("\nQUEUE COMPARISON")
print("----------------")
print(queue_summary)

print("\nTRIP PERFORMANCE")
print("----------------")
print(trip_summary)

fixed_avg = queue_summary.loc[
    queue_summary["Controller"] == "Fixed",
    "Average Queue"
].iloc[0]

adaptive_avg = queue_summary.loc[
    queue_summary["Controller"] == "Adaptive",
    "Average Queue"
].iloc[0]

queue_reduction = (
    (fixed_avg - adaptive_avg)
    / fixed_avg
    * 100
)

print(
    f"\nAverage queue reduction: "
    f"{queue_reduction:.2f}%"
)

queue_summary.to_csv(
    RESULTS_DIR / "queue_comparison.csv",
    index=False
)

queue_summary.set_index("Controller")[
    "Average Queue"
].plot(kind="bar")

plt.title(
    "Fixed vs Adaptive - Average Queue"
)

plt.ylabel("Vehicles Waiting")
plt.xticks(rotation=0)
plt.tight_layout()

plt.savefig(
    RESULTS_DIR / "average_queue_comparison.png"
)

plt.show()