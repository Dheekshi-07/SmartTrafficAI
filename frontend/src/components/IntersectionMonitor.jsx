import { useEffect, useState } from "react";
import {
  Ambulance,
  Car,
  Play,
  RotateCcw,
} from "lucide-react";

function IntersectionMonitor() {
  const [mode, setMode] = useState("ADAPTIVE");
  const [activeDirection, setActiveDirection] = useState("NS");

  const [queues, setQueues] = useState({
    N: 3,
    S: 2,
    E: 1,
    W: 1,
  });

  const [ambulanceActive, setAmbulanceActive] = useState(false);
  const [ambulanceStage, setAmbulanceStage] = useState("idle");

  // Normal adaptive simulation
  useEffect(() => {
    if (ambulanceActive) return;

    const interval = setInterval(() => {
      setActiveDirection((current) =>
        current === "NS" ? "EW" : "NS"
      );

      setQueues((current) => ({
        N: Math.max(
          0,
          current.N +
            (Math.random() > 0.5 ? 1 : -1)
        ),
        S: Math.max(
          0,
          current.S +
            (Math.random() > 0.5 ? 1 : -1)
        ),
        E: Math.max(
          0,
          current.E +
            (Math.random() > 0.5 ? 1 : -1)
        ),
        W: Math.max(
          0,
          current.W +
            (Math.random() > 0.5 ? 1 : -1)
        ),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [ambulanceActive]);

  const simulateAmbulance = () => {
    if (ambulanceActive) return;

    setAmbulanceActive(true);
    setMode("EMERGENCY");
    setAmbulanceStage("approaching");

    // Safe transition to East/West priority
    setTimeout(() => {
      setActiveDirection("EW");
      setAmbulanceStage("priority");
    }, 1200);

    // Ambulance crossing junction
    setTimeout(() => {
      setAmbulanceStage("crossing");
    }, 2500);

    // Ambulance clears junction
    setTimeout(() => {
      setAmbulanceStage("cleared");
    }, 4200);

    // Restore adaptive mode
    setTimeout(() => {
      setAmbulanceActive(false);
      setAmbulanceStage("idle");
      setMode("ADAPTIVE");
    }, 5200);
  };

  const resetDemo = () => {
    setMode("ADAPTIVE");
    setActiveDirection("NS");
    setAmbulanceActive(false);
    setAmbulanceStage("idle");

    setQueues({
      N: 3,
      S: 2,
      E: 1,
      W: 1,
    });
  };

  const nsGreen =
    activeDirection === "NS" && !ambulanceActive;

  const ewGreen =
    activeDirection === "EW" || ambulanceActive;

  return (
    <div className="intersection-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">
            LIVE INTERSECTION
          </p>

          <h3>Junction J1</h3>

          <p className="intersection-description">
            Adaptive signal controller demonstration
          </p>
        </div>

        <div className="intersection-actions">
          <span
            className={
              mode === "EMERGENCY"
                ? "mode-badge emergency-mode"
                : "mode-badge"
            }
          >
            {mode === "EMERGENCY"
              ? "EMERGENCY PRIORITY"
              : "ADAPTIVE MODE"}
          </span>

          <button
            className="simulate-button"
            onClick={simulateAmbulance}
            disabled={ambulanceActive}
          >
            <Play size={15} />

            {ambulanceActive
              ? "Emergency Active"
              : "Simulate Ambulance"}
          </button>

          <button
            className="reset-button"
            onClick={resetDemo}
            title="Reset demo"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <div className="intersection-map">
        {/* Roads */}
        <div className="road road-vertical"></div>
        <div className="road road-horizontal"></div>

        {/* Lane markings */}
        <div className="lane-line vertical-line"></div>
        <div className="lane-line horizontal-line"></div>

        {/* Junction */}
        <div className="junction-center">
          <span>J1</span>
          <small>AI CONTROL</small>
        </div>

        {/* Queue indicators */}
        <div className="queue-card queue-north">
          <span>North Queue</span>
          <strong>{queues.N}</strong>
        </div>

        <div className="queue-card queue-south">
          <span>South Queue</span>
          <strong>{queues.S}</strong>
        </div>

        <div className="queue-card queue-east">
          <span>East Queue</span>
          <strong>{queues.E}</strong>
        </div>

        <div className="queue-card queue-west">
          <span>West Queue</span>
          <strong>{queues.W}</strong>
        </div>

        {/* Direction labels */}
        <div className="direction-label direction-north">
          NORTH
        </div>

        <div className="direction-label direction-south">
          SOUTH
        </div>

        <div className="direction-label direction-east">
          EAST
        </div>

        <div className="direction-label direction-west">
          WEST
        </div>

        {/* Traffic lights */}
        <div className="traffic-signal signal-north">
          <span
            className={
              nsGreen
                ? "light light-green active-light"
                : "light light-red active-light"
            }
          />
        </div>

        <div className="traffic-signal signal-south">
          <span
            className={
              nsGreen
                ? "light light-green active-light"
                : "light light-red active-light"
            }
          />
        </div>

        <div className="traffic-signal signal-east">
          <span
            className={
              ewGreen
                ? "light light-green active-light"
                : "light light-red active-light"
            }
          />
        </div>

        <div className="traffic-signal signal-west">
          <span
            className={
              ewGreen
                ? "light light-green active-light"
                : "light light-red active-light"
            }
          />
        </div>

        {/* Normal vehicle visualization */}
        <Car className="demo-car car-n1" size={22} />
        <Car className="demo-car car-n2" size={22} />

        <Car className="demo-car car-s1" size={22} />

        <Car className="demo-car car-e1" size={22} />

        <Car className="demo-car car-w1" size={22} />

        {/* Ambulance */}
        {ambulanceStage !== "idle" && (
          <div
            className={`ambulance-animation ambulance-${ambulanceStage}`}
          >
            <Ambulance size={27} />
            <span>AMB_001</span>
          </div>
        )}

        {ambulanceActive && (
          <div className="priority-message">
            <Ambulance size={17} />
            Emergency vehicle detected
            <span>East / West priority activated</span>
          </div>
        )}
      </div>

      <div className="intersection-footer">
        <div>
          <span>Controller</span>
          <strong>
            {mode === "EMERGENCY"
              ? "Emergency Preemption"
              : "Adaptive Controller"}
          </strong>
        </div>

        <div>
          <span>Active Signal</span>
          <strong>
            {activeDirection === "NS"
              ? "North / South"
              : "East / West"}
          </strong>
        </div>

        <div>
          <span>Emergency Vehicle</span>
          <strong>
            {ambulanceActive
              ? "AMB_001 Detected"
              : "None"}
          </strong>
        </div>

        <div>
          <span>Simulation Result</span>
          <strong>37.93% Faster Emergency Travel</strong>
        </div>
      </div>

      <p className="demo-disclaimer">
        Interface animation demonstrates controller behavior.
        Performance metrics shown elsewhere on the dashboard are
        measured from the SUMO + TraCI experiment.
      </p>
    </div>
  );
}

export default IntersectionMonitor;