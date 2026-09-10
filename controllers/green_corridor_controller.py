import os
import sys
import traci

# ---------------------------------------------------------
# SmartTrafficAI Hardware Integration
# ---------------------------------------------------------

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

HARDWARE_PYTHON = os.path.join(
    PROJECT_ROOT,
    "hardware",
    "python"
)

if HARDWARE_PYTHON not in sys.path:
    sys.path.append(HARDWARE_PYTHON)

from serial_bridge import ArduinoTrafficSignal


# ---------------------------------------------------------
# SUMO CONFIGURATION
# ---------------------------------------------------------

SUMO_BINARY = "sumo"

CONFIG_FILE = "simulation/sumo_multi/configs/corridor.sumocfg"

AMBULANCE_ID = "AMB_001"

JUNCTIONS = ["J1", "J2", "J3"]

CORRIDOR_EDGES = {
    "J1": "W_J1",
    "J2": "J1_J2",
    "J3": "J2_J3",
}


def get_green_phase_for_corridor(junction_id):
    """
    Find the SUMO traffic-light phase where the
    emergency corridor receives a green signal.
    """

    program_logics = traci.trafficlight.getAllProgramLogics(
        junction_id
    )

    if not program_logics:
        return None

    logic = program_logics[0]

    controlled_links = traci.trafficlight.getControlledLinks(
        junction_id
    )

    for phase_index, phase in enumerate(logic.phases):

        state = phase.state

        for link_index, links in enumerate(controlled_links):

            if not links:
                continue

            for connection in links:

                incoming_lane = connection[0]

                incoming_edge = incoming_lane.rsplit("_", 1)[0]

                if incoming_edge == CORRIDOR_EDGES[junction_id]:

                    if link_index < len(state):

                        if state[link_index] in ("G", "g"):

                            return phase_index

    return None


def activate_priority(
    junction,
    green_phases,
    hardware_signal,
    last_hardware_state,
):
    """
    Activate SUMO green priority and send the corresponding
    emergency-green command to the Arduino hardware layer.
    """

    phase = green_phases[junction]

    if phase is not None:

        # SUMO / TraCI control
        traci.trafficlight.setPhase(
            junction,
            phase
        )

        traci.trafficlight.setPhaseDuration(
            junction,
            30
        )

        print(
            f"    Priority GREEN activated at {junction}"
        )

        # Arduino physical signal command
        if last_hardware_state != junction:

            hardware_signal.emergency_green()

            print(
                f"    Hardware command mapped to {junction}: "
                "EMERGENCY_GREEN"
            )

            return junction

    return last_hardware_state


def run():

    print("=" * 60)
    print("SmartTrafficAI - Multi-Junction Green Corridor")
    print("=" * 60)

    # -----------------------------------------------------
    # HARDWARE CONNECTION
    # -----------------------------------------------------

    hardware_signal = ArduinoTrafficSignal()

    hardware_connected = hardware_signal.connect()

    if hardware_connected:
        print(
            "[SYSTEM] Arduino traffic signal hardware available."
        )
    else:
        print(
            "[SYSTEM] Hardware unavailable - SUMO simulation "
            "will continue normally."
        )

    print()

    # -----------------------------------------------------
    # START SUMO
    # -----------------------------------------------------

    traci.start([
        SUMO_BINARY,
        "-c",
        CONFIG_FILE,
        "--tripinfo-output",
        "simulation/sumo_multi/outputs/"
        "green_corridor_tripinfo.xml",
    ])

    green_phases = {}

    for junction in JUNCTIONS:

        phase = get_green_phase_for_corridor(
            junction
        )

        green_phases[junction] = phase

        print(
            f"{junction} corridor green phase:",
            phase if phase is not None else "NOT FOUND"
        )

    ambulance_detected = False
    corridor_active = False
    ambulance_arrival = None

    last_hardware_state = None

    step = 0

    # -----------------------------------------------------
    # SIMULATION LOOP
    # -----------------------------------------------------

    while traci.simulation.getMinExpectedNumber() > 0:

        traci.simulationStep()

        step += 1

        vehicles = traci.vehicle.getIDList()

        if AMBULANCE_ID in vehicles:

            if not ambulance_detected:

                ambulance_detected = True

                print()
                print(
                    f"[{step}s] Ambulance detected: "
                    f"{AMBULANCE_ID}"
                )

                print(
                    "Green corridor activated."
                )

                print()

            corridor_active = True

            ambulance_edge = traci.vehicle.getRoadID(
                AMBULANCE_ID
            )

            print(
                f"[{step}s] {AMBULANCE_ID} "
                f"current edge: {ambulance_edge}"
            )

            # -------------------------------------------------
            # J1 PRIORITY
            # -------------------------------------------------

            if ambulance_edge == "W_J1":

                last_hardware_state = activate_priority(
                    "J1",
                    green_phases,
                    hardware_signal,
                    last_hardware_state,
                )

            # -------------------------------------------------
            # J2 PRIORITY
            # -------------------------------------------------

            elif ambulance_edge == "J1_J2":

                last_hardware_state = activate_priority(
                    "J2",
                    green_phases,
                    hardware_signal,
                    last_hardware_state,
                )

            # -------------------------------------------------
            # J3 PRIORITY
            # -------------------------------------------------

            elif ambulance_edge == "J2_J3":

                last_hardware_state = activate_priority(
                    "J3",
                    green_phases,
                    hardware_signal,
                    last_hardware_state,
                )

            # -------------------------------------------------
            # HOSPITAL APPROACH
            # -------------------------------------------------

            elif ambulance_edge == "J3_HOSPITAL":

                print(
                    f"    {AMBULANCE_ID} cleared J3 "
                    "and is heading to hospital"
                )

                if last_hardware_state != "NORMAL":

                    hardware_signal.green()

                    print(
                        "    Hardware signal returned "
                        "to normal GREEN state"
                    )

                    last_hardware_state = "NORMAL"

        # -----------------------------------------------------
        # AMBULANCE COMPLETED ROUTE
        # -----------------------------------------------------

        elif ambulance_detected and corridor_active:

            corridor_active = False

            ambulance_arrival = step

            print()
            print(
                f"[{step}s] Ambulance completed "
                "emergency corridor."
            )

            print(
                "Normal SUMO traffic-light control restored."
            )

            hardware_signal.red()

            print(
                "Hardware signal returned to safe RED state."
            )

            print()

    # -----------------------------------------------------
    # CLEANUP
    # -----------------------------------------------------

    traci.close()

    hardware_signal.close()

    print("=" * 60)
    print("Green corridor simulation completed.")
    print("=" * 60)


if __name__ == "__main__":
    run()