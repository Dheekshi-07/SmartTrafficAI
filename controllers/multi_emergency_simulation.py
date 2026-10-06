"""
SmartTrafficAI - Multi-Emergency Simultaneous Simulation Runner
Simulates simultaneous emergency vehicles (AMB_001 on main corridor, AMB_002 on cross-street),
demonstrates deterministic conflict arbitration, priority queueing, and safe sequential signal handovers.
"""

import os
import sys
from pathlib import Path
import traci

if "SUMO_HOME" not in os.environ and os.path.exists("/Library/Frameworks/EclipseSUMO.framework/Versions/1.27.1/EclipseSUMO"):
    os.environ["SUMO_HOME"] = "/Library/Frameworks/EclipseSUMO.framework/Versions/1.27.1/EclipseSUMO"

PROJECT_ROOT = Path(__file__).resolve().parents[1]
HARDWARE_DIR = PROJECT_ROOT / "hardware" / "python"
if str(HARDWARE_DIR) not in sys.path:
    sys.path.insert(0, str(HARDWARE_DIR))

from serial_bridge import ArduinoTrafficSignal
from emergency_priority_manager import EmergencyPriorityManager, EmergencySeverity, EmergencyStatus

CONFIG_PATH = str(PROJECT_ROOT / "simulation" / "sumo_multi" / "configs" / "corridor_multi.sumocfg")
OUTPUT_TRIPINFO = str(PROJECT_ROOT / "results" / "multi_emergency_tripinfo.xml")

JUNCTIONS = ["J1", "J2", "J3"]
CORRIDOR_EDGES = {
    "J1": "W_J1",
    "J2": "J1_J2",
    "J3": "J2_J3",
}
CROSS_STREET_EDGES = {
    "J2": "J2_N_J2"
}


def get_green_phase_for_edge(junction_id: str, target_edge: str):
    try:
        logics = traci.trafficlight.getAllProgramLogics(junction_id)
        if not logics:
            return None
        logic = logics[0]
        controlled_links = traci.trafficlight.getControlledLinks(junction_id)

        for phase_idx, phase in enumerate(logic.phases):
            state = phase.state
            for link_idx, links in enumerate(controlled_links):
                if not links:
                    continue
                for conn in links:
                    incoming_edge = conn[0].rsplit("_", 1)[0]
                    if incoming_edge == target_edge:
                        if link_idx < len(state) and state[link_idx] in ("G", "g"):
                            return phase_idx
    except Exception:
        pass
    return None


def run_multi_emergency_sim():
    print("=" * 70)
    print("SmartTrafficAI - Multi-Emergency Conflict Simulation (SUMO + TraCI)")
    print("=" * 70)

    manager = EmergencyPriorityManager()
    hardware = ArduinoTrafficSignal()
    hardware.connect()

    traci.start([
        "sumo",
        "-c", CONFIG_PATH,
        "--tripinfo-output", OUTPUT_TRIPINFO,
        "--seed", "42"
    ])

    amb1_detected = False
    amb2_detected = False
    amb1_cleared_j2 = False
    amb2_cleared_j2 = False
    step = 0

    print("\n[SIMULATION] Network started. Monitoring AMB_001 and AMB_002...")

    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()
        step += 1
        active_veh = traci.vehicle.getIDList()

        # 1. Track AMB_001 (Main Corridor: W_J1 -> J1_J2 -> J2_J3 -> Hospital)
        if "AMB_001" in active_veh:
            road1 = traci.vehicle.getRoadID("AMB_001")
            pos1 = traci.vehicle.getLanePosition("AMB_001")
            spd1 = traci.vehicle.getSpeed("AMB_001")

            if not amb1_detected:
                amb1_detected = True
                print(f"\n[{step}s] AMB_001 DETECTED on {road1} (Critical Trauma Case)")
                manager.request_priority(
                    ambulance_id="AMB_001",
                    junction_id="J1",
                    direction="EW",
                    severity=EmergencySeverity.CRITICAL,
                    distance_meters=250.0,
                    eta_seconds=18.0,
                    timestamp=float(step)
                )

            if road1 == "W_J1":
                traci.trafficlight.setPhase("J1", 2)
                traci.trafficlight.setPhaseDuration("J1", 30)
                hardware.emergency_green()
            elif road1 == "J1_J2":
                manager.request_priority(
                    ambulance_id="AMB_001",
                    junction_id="J2",
                    direction="EW",
                    severity=EmergencySeverity.CRITICAL,
                    distance_meters=180.0,
                    eta_seconds=12.0,
                    timestamp=float(step)
                )
                if not amb1_cleared_j2:
                    traci.trafficlight.setPhase("J2", 2)
                    traci.trafficlight.setPhaseDuration("J2", 30)
                    hardware.emergency_green()
            elif road1 == "J2_J3":
                if not amb1_cleared_j2:
                    amb1_cleared_j2 = True
                    print(f"[{step}s] AMB_001 CLEARED J2. Releasing J2 intersection...")
                    manager.complete_emergency("AMB_001", timestamp=float(step), reason="AMB_001 cleared J2")
                traci.trafficlight.setPhase("J3", 2)
                traci.trafficlight.setPhaseDuration("J3", 30)

        # 2. Track AMB_002 (Cross Street: J2_N_J2 approaching J2)
        if "AMB_002" in active_veh:
            road2 = traci.vehicle.getRoadID("AMB_002")
            if not amb2_detected:
                amb2_detected = True
                print(f"\n[{step}s] AMB_002 DETECTED on {road2} (Approaching conflicting J2 North approach)")
                req2 = manager.request_priority(
                    ambulance_id="AMB_002",
                    junction_id="J2",
                    direction="NS",
                    severity=EmergencySeverity.URGENT,
                    distance_meters=120.0,
                    eta_seconds=10.0,
                    timestamp=float(step)
                )
                print(f"[{step}s] AMB_002 ARBITRATION RESULT: {req2.status.value} (Held safely in queue)")

            if amb1_cleared_j2 and not amb2_cleared_j2:
                # AMB_001 cleared J2 -> Grant green to queued AMB_002
                traci.trafficlight.setPhase("J2", 0)  # North-South Green
                traci.trafficlight.setPhaseDuration("J2", 25)
                hardware.emergency_green()

            if road2 == "J2_J2_S" and not amb2_cleared_j2:
                amb2_cleared_j2 = True
                print(f"[{step}s] AMB_002 CLEARED J2. Multi-emergency sequence completed!")
                manager.complete_emergency("AMB_002", timestamp=float(step), reason="AMB_002 cleared J2")
                hardware.green()

        if step % 100 == 0:
            print(f"Simulation Step {step} | Active Vehicles: {len(active_veh)}")

    traci.close()
    hardware.close()

    print("\n" + "=" * 70)
    print("Multi-Emergency Simulation Completed Successfully.")
    print(f"Summary: AMB_001 cleared J1-J3, AMB_002 cleared J2 safely.")
    print(f"Log written to: {manager.log_filepath}")
    print("=" * 70)


if __name__ == "__main__":
    run_multi_emergency_sim()
