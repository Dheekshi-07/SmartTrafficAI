import {
  Ambulance,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Zap,
} from "lucide-react";

function SimulationControls({
  running,
  emergencyActive,
  trafficLevel,
  onStart,
  onPause,
  onReset,
  onEmergency,
  onTrafficChange,
}) {
  return (
    <section className="command-card simulation-control-card">
      <div className="command-card-header">
        <div>
          <div className="section-kicker">
            <Settings2 size={13} />
            SIMULATION LAB
          </div>

          <h2>Traffic Controller</h2>

          <p>
            Interactive demonstration controls
          </p>
        </div>

        <div className={`simulation-state ${running ? "running" : ""}`}>
          <span />
          {running ? "RUNNING" : "STANDBY"}
        </div>
      </div>

      <div className="simulation-control-body">

        <div className="control-block">
          <div className="control-label">
            <Gauge size={15} />

            <div>
              <strong>Traffic Demand</strong>
              <span>Simulated vehicle density</span>
            </div>
          </div>

          <div className="segmented-control">
            {["Low", "Medium", "High"].map((level) => (
              <button
                key={level}
                className={
                  trafficLevel === level
                    ? "segment active"
                    : "segment"
                }
                onClick={() => onTrafficChange(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="control-block">
          <div className="control-label">
            <Zap size={15} />

            <div>
              <strong>Controller</strong>
              <span>Current signal strategy</span>
            </div>
          </div>

          <div className="controller-display">
            <span className="controller-indicator" />

            <div>
              <strong>Adaptive Controller</strong>
              <small>Queue-responsive timing</small>
            </div>
          </div>
        </div>

        <div className="control-block emergency-control-block">
          <div className="control-label">
            <Ambulance size={16} />

            <div>
              <strong>Emergency Preemption</strong>
              <span>AMB_001 test scenario</span>
            </div>
          </div>

          <button
            className={
              emergencyActive
                ? "emergency-trigger active"
                : "emergency-trigger"
            }
            onClick={onEmergency}
            disabled={emergencyActive}
          >
            <Ambulance size={17} />

            {emergencyActive
              ? "PRIORITY ACTIVE"
              : "INJECT AMBULANCE"}
          </button>
        </div>

        <div className="simulation-buttons">
          {!running ? (
            <button
              className="sim-button start"
              onClick={onStart}
            >
              <Play size={16} />
              Start
            </button>
          ) : (
            <button
              className="sim-button pause"
              onClick={onPause}
            >
              <Pause size={16} />
              Pause
            </button>
          )}

          <button
            className="sim-button reset"
            onClick={onReset}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        <div className="simulation-note">
          <span>DEMO MODE</span>

          <p>
            Controls animate the dashboard demonstration.
            Experimental metrics are loaded from actual
            SUMO + TraCI simulation results.
          </p>
        </div>
      </div>
    </section>
  );
}

export default SimulationControls;