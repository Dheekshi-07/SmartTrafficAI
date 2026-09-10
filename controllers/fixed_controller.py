import traci
import csv
from pathlib import Path

SUMO_CMD = [
    "sumo",
    "-c",
    "simulation/sumo/configs/junction.sumocfg",
    "--tripinfo-output",
    "results/fixed_tripinfo.xml"
]

TLS_ID = "J1"

N_EDGE = "N_J1"
S_EDGE = "S_J1"
E_EDGE = "E_J1"
W_EDGE = "W_J1"

RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

STEP_RESULT_FILE = RESULTS_DIR / "fixed_results.csv"
SUMMARY_FILE = RESULTS_DIR / "fixed_summary.csv"


def get_queue(edge_id):
    return traci.edge.getLastStepHaltingNumber(edge_id)


def run():
    traci.start(SUMO_CMD)

    print("\nFixed controller simulation started.\n")

    rows = []
    arrived_vehicle_data = []

    step = 0

    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()

        n_queue = get_queue(N_EDGE)
        s_queue = get_queue(S_EDGE)
        e_queue = get_queue(E_EDGE)
        w_queue = get_queue(W_EDGE)

        total_queue = (
            n_queue + s_queue + e_queue + w_queue
        )

        rows.append({
            "step": step,
            "north_queue": n_queue,
            "south_queue": s_queue,
            "east_queue": e_queue,
            "west_queue": w_queue,
            "total_queue": total_queue,
            "phase": traci.trafficlight.getPhase(TLS_ID)
        })

        arrived_ids = traci.simulation.getArrivedIDList()

        for vehicle_id in arrived_ids:
            try:
                travel_time = traci.vehicle.getAccumulatedWaitingTime(vehicle_id)
            except:
                travel_time = None

            arrived_vehicle_data.append({
                "vehicle_id": vehicle_id,
                "arrival_step": step,
                "waiting_time": travel_time
            })

        if step % 50 == 0:
            print(
                f"Step {step} | "
                f"N={n_queue} "
                f"S={s_queue} "
                f"E={e_queue} "
                f"W={w_queue}"
            )

        step += 1

    # SUMO global statistics
    arrived_total = traci.simulation.getArrivedNumber()

    traci.close()

    with open(STEP_RESULT_FILE, "w", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=rows[0].keys()
        )
        writer.writeheader()
        writer.writerows(rows)

    avg_queue = sum(r["total_queue"] for r in rows) / len(rows)
    max_queue = max(r["total_queue"] for r in rows)

    summary = {
        "controller": "Fixed",
        "average_queue": avg_queue,
        "maximum_queue": max_queue,
        "steps": len(rows),
        "vehicles_arrived_last_step": arrived_total
    }

    with open(SUMMARY_FILE, "w", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=summary.keys()
        )
        writer.writeheader()
        writer.writerow(summary)

    print("\nFixed simulation completed.")
    print("Saved:")
    print(STEP_RESULT_FILE)
    print(SUMMARY_FILE)


if __name__ == "__main__":
    run()