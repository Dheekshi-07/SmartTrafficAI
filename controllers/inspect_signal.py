import traci

SUMO_CMD = [
    "sumo",
    "-c",
    "simulation/sumo/configs/junction.sumocfg"
]

traci.start(SUMO_CMD)

tls_id = "J1"

print("\nTRAFFIC LIGHT:", tls_id)

print("\nCurrent program:")
print(traci.trafficlight.getProgram(tls_id))

print("\nCurrent phase:")
print(traci.trafficlight.getPhase(tls_id))

print("\nControlled lanes:")
for lane in traci.trafficlight.getControlledLanes(tls_id):
    print("-", lane)

print("\nPHASES")
print("--------------------------------")

programs = traci.trafficlight.getAllProgramLogics(tls_id)

for program in programs:

    print("\nProgram ID:", program.programID)

    for index, phase in enumerate(program.phases):

        print(
            f"Phase {index}: "
            f"duration={phase.duration}s | "
            f"state={phase.state}"
        )

traci.close()