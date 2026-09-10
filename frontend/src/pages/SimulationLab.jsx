import { useState } from "react";

import LiveIntersection from "../components/dashboard/LiveIntersection";
import SimulationControls from "../components/dashboard/SimulationControls";

function SimulationLab() {
  const [running, setRunning] =
    useState(true);

  const [emergencyActive, setEmergencyActive] =
    useState(false);

  const [trafficLevel, setTrafficLevel] =
    useState("Medium");

  const [activeDirection, setActiveDirection] =
    useState("NS");

  const [queues, setQueues] = useState({
    N: 3,
    S: 2,
    E: 1,
    W: 1,
  });

  const handleEmergency = () => {
    setEmergencyActive(true);
    setActiveDirection("EW");

    setTimeout(() => {
      setEmergencyActive(false);
      setActiveDirection("NS");
    }, 5000);
  };

  const resetSimulation = () => {
    setRunning(false);
    setEmergencyActive(false);
    setTrafficLevel("Medium");
    setActiveDirection("NS");

    setQueues({
      N: 3,
      S: 2,
      E: 1,
      W: 1,
    });
  };

  return (
    <div>
      <header>
        <div>
          <p className="eyebrow">
            SIMULATION LAB
          </p>

          <h1>SUMO Traffic Simulation</h1>

          <p className="header-description">
            Test traffic demand, adaptive
            control and emergency priority
            scenarios.
          </p>
        </div>
      </header>

      <div className="command-center-layout">
        <LiveIntersection
          queues={queues}
          activeDirection={activeDirection}
          emergencyActive={emergencyActive}
        />

        <SimulationControls
          running={running}
          emergencyActive={emergencyActive}
          trafficLevel={trafficLevel}
          onStart={() => setRunning(true)}
          onPause={() => setRunning(false)}
          onReset={resetSimulation}
          onEmergency={handleEmergency}
          onTrafficChange={setTrafficLevel}
        />
      </div>
    </div>
  );
}

export default SimulationLab;