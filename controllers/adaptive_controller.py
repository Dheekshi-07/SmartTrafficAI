import traci
import csv
from pathlib import Path

SUMO_CMD = [
    "sumo",
    "-c",
    "simulation/sumo/configs/junction.sumocfg",
    "--tripinfo-output",
    "results/adaptive_tripinfo.xml"
]

TLS_ID = "J1"

# Incoming edges
N_EDGE = "N_J1"
S_EDGE = "S_J1"
E_EDGE = "E_J1"
W_EDGE = "W_J1"

# SUMO traffic-light phases
NS_GREEN = 0
NS_YELLOW = 1
EW_GREEN = 2
EW_YELLOW = 3

# Prototype timing constraints
MIN_GREEN = 15
MAX_GREEN = 60
YELLOW_TIME = 3

# How often we reconsider the traffic situation
DECISION_INTERVAL = 5

RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

RESULT_FILE = RESULTS_DIR / "adaptive_results.csv"


def get_queue(edge_id):
    return traci.edge.getLastStepHaltingNumber(edge_id)


def get_vehicle_count(edge_id):
    return traci.edge.getLastStepVehicleNumber(edge_id)


def calculate_green_time(pressure):
    """
    Convert queue pressure into a green duration.
    Prototype rule-based adaptive logic.
    """

    # Each waiting vehicle adds extra green time
    green = MIN_GREEN + (pressure * 3)

    return max(
        MIN_GREEN,
        min(green, MAX_GREEN)
    )


def set_green_phase(phase, duration):
    traci.trafficlight.setPhase(TLS_ID, phase)
    traci.trafficlight.setPhaseDuration(TLS_ID, duration)


def safe_switch(current_direction, target_direction):
    """
    Transition safely through yellow before switching.
    """

    if current_direction == target_direction:
        return

    if current_direction == "NS":
        traci.trafficlight.setPhase(TLS_ID, NS_YELLOW)
    else:
        traci.trafficlight.setPhase(TLS_ID, EW_YELLOW)

    traci.trafficlight.setPhaseDuration(
        TLS_ID,
        YELLOW_TIME
    )

    for _ in range(YELLOW_TIME):
        traci.simulationStep()


def run():
    traci.start(SUMO_CMD)

    print("\nAdaptive controller started.\n")

    current_direction = "NS"

    # Start North/South green
    set_green_phase(
        NS_GREEN,
        MIN_GREEN
    )

    current_green_start = 0

    rows = []

    step = 0

    while traci.simulation.getMinExpectedNumber() > 0:

        traci.simulationStep()

        # Queue measurements
        n_queue = get_queue(N_EDGE)
        s_queue = get_queue(S_EDGE)
        e_queue = get_queue(E_EDGE)
        w_queue = get_queue(W_EDGE)

        ns_pressure = n_queue + s_queue
        ew_pressure = e_queue + w_queue

        current_green_elapsed = (
            step - current_green_start
        )

        # Store metrics every second
        rows.append({
            "step": step,
            "north_queue": n_queue,
            "south_queue": s_queue,
            "east_queue": e_queue,
            "west_queue": w_queue,
            "ns_pressure": ns_pressure,
            "ew_pressure": ew_pressure,
            "current_direction": current_direction,
            "phase": traci.trafficlight.getPhase(TLS_ID)
        })

        # Reconsider every few seconds
        if (
            step % DECISION_INTERVAL == 0
            and current_green_elapsed >= MIN_GREEN
        ):

            target_direction = current_direction

            # Decide which road group has higher pressure
            if ns_pressure > ew_pressure:
                target_direction = "NS"

            elif ew_pressure > ns_pressure:
                target_direction = "EW"

            # If maximum green reached,
            # allow the other direction to receive service
            if current_green_elapsed >= MAX_GREEN:
                target_direction = (
                    "EW"
                    if current_direction == "NS"
                    else "NS"
                )

            if target_direction != current_direction:

                print(
                    f"Step {step}: SWITCH "
                    f"{current_direction} → {target_direction} | "
                    f"NS={ns_pressure}, EW={ew_pressure}"
                )

                safe_switch(
                    current_direction,
                    target_direction
                )

                current_direction = target_direction

                if current_direction == "NS":
                    green_time = calculate_green_time(
                        ns_pressure
                    )

                    set_green_phase(
                        NS_GREEN,
                        green_time
                    )

                else:
                    green_time = calculate_green_time(
                        ew_pressure
                    )

                    set_green_phase(
                        EW_GREEN,
                        green_time
                    )

                current_green_start = step

                print(
                    f"  Green duration: {green_time}s"
                )

        if step % 50 == 0:
            print(
                f"Step {step} | "
                f"N={n_queue} "
                f"S={s_queue} "
                f"E={e_queue} "
                f"W={w_queue} | "
                f"Active={current_direction}"
            )

        step += 1

    traci.close()

    # Save results
    with open(
        RESULT_FILE,
        "w",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=rows[0].keys()
        )

        writer.writeheader()
        writer.writerows(rows)

    print("\nAdaptive simulation completed.")
    print("Results saved to:")
    print(RESULT_FILE)


if __name__ == "__main__":
    run()