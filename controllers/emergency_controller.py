import traci
import csv
from pathlib import Path

SUMO_CMD = [
    "sumo",
    "-c",
    "simulation/sumo/configs/junction.sumocfg",
    "--tripinfo-output",
    "results/emergency_tripinfo.xml"
]

TLS_ID = "J1"
AMBULANCE_ID = "AMB_001"

# Incoming edges
N_EDGE = "N_J1"
S_EDGE = "S_J1"
E_EDGE = "E_J1"
W_EDGE = "W_J1"

# SUMO signal phases
NS_GREEN = 0
NS_YELLOW = 1
EW_GREEN = 2
EW_YELLOW = 3

MIN_GREEN = 15
MAX_GREEN = 60
YELLOW_TIME = 3

RESULTS_DIR = Path("results")
RESULTS_DIR.mkdir(exist_ok=True)

RESULT_FILE = RESULTS_DIR / "emergency_results.csv"


def get_queue(edge_id):
    return traci.edge.getLastStepHaltingNumber(edge_id)


def safe_switch_to_ew():
    current_phase = traci.trafficlight.getPhase(TLS_ID)

    # If already EW green, do nothing
    if current_phase == EW_GREEN:
        return

    # If NS is green, go through NS yellow first
    if current_phase == NS_GREEN:
        traci.trafficlight.setPhase(TLS_ID, NS_YELLOW)
        traci.trafficlight.setPhaseDuration(
            TLS_ID,
            YELLOW_TIME
        )

        for _ in range(YELLOW_TIME):
            traci.simulationStep()

    # Give EW green
    traci.trafficlight.setPhase(TLS_ID, EW_GREEN)
    traci.trafficlight.setPhaseDuration(
        TLS_ID,
        MAX_GREEN
    )


def run():

    traci.start(SUMO_CMD)

    print("\nEmergency controller started.\n")

    emergency_active = False
    ambulance_detected = False
    ambulance_cleared = False

    detection_step = None
    clearance_step = None

    rows = []

    step = 0

    while traci.simulation.getMinExpectedNumber() > 0:

        traci.simulationStep()

        n_queue = get_queue(N_EDGE)
        s_queue = get_queue(S_EDGE)
        e_queue = get_queue(E_EDGE)
        w_queue = get_queue(W_EDGE)

        vehicles = traci.vehicle.getIDList()

        # Detect ambulance
        if AMBULANCE_ID in vehicles:

            road = traci.vehicle.getRoadID(
                AMBULANCE_ID
            )

            position = traci.vehicle.getLanePosition(
                AMBULANCE_ID
            )

            speed = traci.vehicle.getSpeed(
                AMBULANCE_ID
            )

            # Activate priority while ambulance approaches from East
            if road == E_EDGE and not emergency_active:

                emergency_active = True
                ambulance_detected = True
                detection_step = step

                print(
                    f"\n🚑 EMERGENCY DETECTED at step {step}"
                )

                print(
                    f"Road={road} | "
                    f"Position={position:.2f}"
                )

                print(
                    "Giving East/West priority..."
                )

                safe_switch_to_ew()

            # Keep EW green while ambulance approaches / crosses
            if emergency_active and road in [
                E_EDGE,
                ":J1_5"
            ]:

                traci.trafficlight.setPhase(
                    TLS_ID,
                    EW_GREEN
                )

                traci.trafficlight.setPhaseDuration(
                    TLS_ID,
                    MAX_GREEN
                )

            # Ambulance has cleared the intersection
            if emergency_active and road == "J1_W":

                emergency_active = False
                ambulance_cleared = True
                clearance_step = step

                print(
                    f"\n✅ Ambulance cleared J1 "
                    f"at step {step}"
                )

                print(
                    "Returning to normal signal program..."
                )

        rows.append({
            "step": step,
            "north_queue": n_queue,
            "south_queue": s_queue,
            "east_queue": e_queue,
            "west_queue": w_queue,
            "emergency_active": emergency_active,
            "phase": traci.trafficlight.getPhase(
                TLS_ID
            )
        })

        if step % 50 == 0:
            print(
                f"Step {step} | "
                f"N={n_queue} "
                f"S={s_queue} "
                f"E={e_queue} "
                f"W={w_queue} | "
                f"Emergency={emergency_active}"
            )

        step += 1

    traci.close()

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

    print("\nEmergency simulation completed.")

    print("Ambulance detected:", ambulance_detected)
    print("Ambulance cleared:", ambulance_cleared)

    if (
        detection_step is not None
        and clearance_step is not None
    ):
        print(
            "Emergency handling duration:",
            clearance_step - detection_step,
            "seconds"
        )

    print("Results saved to:")
    print(RESULT_FILE)


if __name__ == "__main__":
    run()