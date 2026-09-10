import traci

SUMO_CMD = [
    "sumo",
    "-c",
    "simulation/sumo/configs/junction.sumocfg"
]

traci.start(SUMO_CMD)

found = False

while traci.simulation.getMinExpectedNumber() > 0:

    traci.simulationStep()

    vehicles = traci.vehicle.getIDList()

    if "AMB_001" in vehicles:

        found = True

        road = traci.vehicle.getRoadID("AMB_001")
        speed = traci.vehicle.getSpeed("AMB_001")
        position = traci.vehicle.getLanePosition("AMB_001")

        print(
            f"Ambulance detected | "
            f"road={road} | "
            f"position={position:.2f} | "
            f"speed={speed:.2f}"
        )

traci.close()

if found:
    print("\nAMB_001 successfully detected in SUMO.")
else:
    print("\nAMB_001 was not detected.")