import {
  Ambulance,
  Clock3,
  Route,
  ShieldCheck,
  Activity,
  TimerReset,
  Navigation,
  Siren,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const emergencyComparison = [
  {
    scenario: "Normal Signals",
    travelTime: 99,
    waitingTime: 33,
    timeLoss: 45.02,
  },
  {
    scenario: "Green Corridor",
    travelTime: 69,
    waitingTime: 0,
    timeLoss: 14.49,
  },
];

const corridorSteps = [
  {
    title: "Ambulance Detected",
    description: "AMB_001 detected on the west corridor",
    status: "complete",
  },
  {
    title: "J1 Priority Activated",
    description: "Traffic signal preempted for ambulance movement",
    status: "complete",
  },
  {
    title: "J2 Priority Activated",
    description: "Green priority transferred to the next junction",
    status: "complete",
  },
  {
    title: "J3 Priority Activated",
    description: "Final junction cleared before hospital approach",
    status: "complete",
  },
  {
    title: "Hospital Corridor Completed",
    description: "Normal SUMO traffic-light operation restored",
    status: "complete",
  },
];

function EmergencyMobility() {
  return (
    <div className="page emergency-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Emergency Mobility</p>
          <h1>AI Emergency Green Corridor</h1>
          <p className="page-description">
            Multi-junction ambulance priority implemented and evaluated using
            SUMO and TraCI.
          </p>
        </div>

        <div className="status-pill emergency-active">
          <Siren size={16} />
          GREEN CORRIDOR IMPLEMENTED
        </div>
      </div>

      <div className="page-meta">
        <span>SUMO Emergency Scenario</span>
        <span>AMB_001</span>
        <span>J1 → J2 → J3 → Hospital</span>
        <span>793.90 m</span>
      </div>

      <section className="emergency-metric-grid">
        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <Ambulance size={22} />
          </div>

          <div>
            <p>Emergency Vehicle</p>
            <h2>AMB_001</h2>
            <span>Priority vehicle detected</span>
          </div>
        </div>

        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <p>Travel Time</p>
            <h2>69 sec</h2>
            <span>Reduced from 99 sec</span>
          </div>
        </div>

        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <TimerReset size={22} />
          </div>

          <div>
            <p>Waiting Time</p>
            <h2>0 sec</h2>
            <span>Reduced from 33 sec</span>
          </div>
        </div>

        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <Route size={22} />
          </div>

          <div>
            <p>Corridor Distance</p>
            <h2>793.90 m</h2>
            <span>3 controlled junctions</span>
          </div>
        </div>
      </section>

      <section className="emergency-result-banner">
        <div>
          <span className="insight-label">MULTI-JUNCTION RESULT</span>
          <h2>30.30% Faster Emergency Travel</h2>
          <p>
            The TraCI green-corridor controller reduced ambulance travel time
            from 99 seconds to 69 seconds.
          </p>
        </div>

        <div className="emergency-result-values">
          <div>
            <strong>100%</strong>
            <span>Waiting Reduction</span>
          </div>

          <div>
            <strong>67.81%</strong>
            <span>Time Loss Reduction</span>
          </div>

          <div>
            <strong>3</strong>
            <span>Signals Prioritized</span>
          </div>
        </div>
      </section>

      <section className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <span className="insight-label">LIVE CORRIDOR LOGIC</span>
            <h2>J1 → J2 → J3 Emergency Priority</h2>
          </div>

          <Navigation size={22} />
        </div>

        <div className="green-corridor">
          <div className="corridor-node ambulance-node">
            <Ambulance size={24} />
            <strong>AMB_001</strong>
            <span>Detected</span>
          </div>

          <div className="corridor-line active-line" />

          <div className="corridor-node active-junction">
            <strong>J1</strong>
            <span>Priority Green</span>
          </div>

          <div className="corridor-line active-line" />

          <div className="corridor-node active-junction">
            <strong>J2</strong>
            <span>Priority Green</span>
          </div>

          <div className="corridor-line active-line" />

          <div className="corridor-node active-junction">
            <strong>J3</strong>
            <span>Priority Green</span>
          </div>

          <div className="corridor-line active-line" />

          <div className="corridor-node hospital-node">
            <ShieldCheck size={22} />
            <strong>Hospital</strong>
            <span>Corridor Complete</span>
          </div>
        </div>

        <div className="emergency-implementation-note">
          <ShieldCheck size={18} />

          <p>
            This is no longer a planned corridor. The current prototype
            implements sequential traffic-light priority at J1, J2 and J3
            using SUMO TraCI while AMB_001 travels toward the hospital.
          </p>
        </div>
      </section>

      <section className="emergency-two-column">
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <span className="insight-label">EXPERIMENT COMPARISON</span>
              <h2>Normal Signals vs Green Corridor</h2>
            </div>

            <Activity size={22} />
          </div>

          <div className="chart-area emergency-chart">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={emergencyComparison}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

                <XAxis
                  dataKey="scenario"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />

                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />

                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                  }}
                />

                <Legend />

                <Bar
                  dataKey="travelTime"
                  name="Travel Time (sec)"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="waitingTime"
                  name="Waiting Time (sec)"
                  fill="#22c55e"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="timeLoss"
                  name="Time Loss (sec)"
                  fill="#f59e0b"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <span className="insight-label">CONTROLLER STATUS</span>
              <h2>Emergency Priority Engine</h2>
            </div>

            <Siren size={22} />
          </div>

          <div className="emergency-status-list">
            <div>
              <span>Emergency Detection</span>
              <strong>ACTIVE</strong>
            </div>

            <div>
              <span>Signal Preemption</span>
              <strong>ENABLED</strong>
            </div>

            <div>
              <span>Controlled Junctions</span>
              <strong>3</strong>
            </div>

            <div>
              <span>Ambulance Waiting</span>
              <strong>0 sec</strong>
            </div>

            <div>
              <span>Route Length</span>
              <strong>793.90 m</strong>
            </div>

            <div>
              <span>Simulation Engine</span>
              <strong>SUMO + TraCI</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <span className="insight-label">EVENT TIMELINE</span>
            <h2>Emergency Corridor Sequence</h2>
          </div>

          <Clock3 size={22} />
        </div>

        <div className="emergency-timeline">
          {corridorSteps.map((step, index) => (
            <div className="emergency-timeline-item" key={step.title}>
              <div className="timeline-number">{index + 1}</div>

              <div className="timeline-content">
                <div className="timeline-title-row">
                  <h3>{step.title}</h3>

                  <span className="timeline-status implemented">
                    IMPLEMENTED
                  </span>
                </div>

                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="emergency-disclaimer">
        <ShieldCheck size={20} />

        <div>
          <strong>Prototype & Responsible AI Note</strong>
          <p>
            Results shown here were obtained from a controlled SUMO simulation,
            not from a live municipal traffic network. Real-world deployment
            would require traffic-authority approval, fail-safe controllers,
            secure emergency-vehicle authentication, sensor validation and
            extensive field testing.
          </p>
        </div>
      </section>
    </div>
  );
}

export default EmergencyMobility;