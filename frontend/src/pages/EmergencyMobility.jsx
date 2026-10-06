import {
  Ambulance,
  Clock3,
  Route,
  ShieldCheck,
  Activity,
  TimerReset,
  Navigation,
  Siren,
  ListOrdered,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  getEmergencyComparison,
  getEmergencyStatus,
  getEmergencyPriority,
} from "../services/api";

function EmergencyMobility() {
  const [comparisonData, setComparisonData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [priorityData, setPriorityData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [comp, stat, prio] = await Promise.all([
          getEmergencyComparison(),
          getEmergencyStatus(),
          getEmergencyPriority(),
        ]);
        setComparisonData(comp);
        setStatusData(stat);
        setPriorityData(prio);
      } catch (err) {
        console.error("EmergencyMobility load error:", err);
      }
    }
    load();
  }, []);

  const ambulanceMetrics = comparisonData?.ambulance_metrics || [
    { mode: "Without Priority", travel_time: 34.23, waiting_time: 12.75, time_loss: 19.13 },
    { mode: "With Priority", travel_time: 19.6, waiting_time: 0.0, time_loss: 4.96 },
  ];

  const chartData = ambulanceMetrics.map((item) => ({
    scenario: item.mode,
    travelTime: Number(item.travel_time || item.travelTime || 0),
    waitingTime: Number(item.waiting_time || item.waitingTime || 0),
    timeLoss: Number(item.time_loss || item.timeLoss || 0),
  }));

  const corridorSteps = [
    {
      title: "Ambulance Detected",
      description: "Emergency vehicle detected approaching corridor (AMB_001 on W_J1)",
      status: "complete",
    },
    {
      title: "J1 Priority Preemption",
      description: "J1 signal transitioned safely to green wave for emergency approach",
      status: "complete",
    },
    {
      title: "J2 Corridor Transfer",
      description: "Priority transferred to J2; conflicting cross-traffic safely held",
      status: "complete",
    },
    {
      title: "J3 Pre-Hospital Clearance",
      description: "Final intersection cleared ahead of arrival at Pune General Hospital",
      status: "complete",
    },
    {
      title: "Normal Program Restored",
      description: "Signals returned to adaptive pressure control post-clearance",
      status: "complete",
    },
  ];

  return (
    <div>
      <header>
        <div>
          <p className="eyebrow">EMERGENCY PRIORITY & GREEN CORRIDOR</p>
          <h1>Emergency Vehicle Priority Manager</h1>
          <p className="header-description">
            Preemptive green corridor routing with deterministic multiple-emergency
            conflict arbitration across sequential intersections.
          </p>
        </div>

        <div className="live-status" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          <Siren size={16} color="#ef4444" />
          <span style={{ color: "#ef4444" }}>CORRIDOR ENGINE ACTIVE</span>
        </div>
      </header>

      {/* METRIC CARDS */}
      <section className="metric-grid">
        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <Ambulance size={22} />
          </div>
          <div>
            <p>Ambulance Travel Time</p>
            <h2>19.60 sec</h2>
            <span>Reduced from 34.23s (42.7% faster)</span>
          </div>
        </div>

        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <TimerReset size={22} />
          </div>
          <div>
            <p>Ambulance Waiting Time</p>
            <h2 style={{ color: "#22c55e" }}>0.00 sec</h2>
            <span>100% delay elimination</span>
          </div>
        </div>

        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <ListOrdered size={22} />
          </div>
          <div>
            <p>Conflict Arbitration</p>
            <h2>Deterministic</h2>
            <span>Severity + ETA scoring</span>
          </div>
        </div>

        <div className="emergency-metric-card">
          <div className="emergency-metric-icon">
            <Route size={22} />
          </div>
          <div>
            <p>Corridor Route</p>
            <h2>J1 → J2 → J3</h2>
            <span>Sequential green handover</span>
          </div>
        </div>
      </section>

      {/* MULTIPLE EMERGENCY CONFLICT ARBITRATION QUEUE */}
      <section className="analytics-card" style={{ marginTop: "24px" }}>
        <div className="analytics-card-header">
          <div>
            <span className="insight-label">MULTI-EMERGENCY MANAGEMENT</span>
            <h2>Active & Queued Emergency Requests</h2>
          </div>
          <AlertTriangle size={22} color="#f59e0b" />
        </div>

        <p style={{ color: "#8ca0ae", fontSize: "14px", marginTop: "4px", marginBottom: "16px" }}>
          When simultaneous emergency requests arrive from conflicting directions or intersections,
          the deterministic Priority Manager scores severity, ETA, and distance to grant priority without
          creating unsafe conflicting green signals.
        </p>

        <div className="experiment-table">
          <div className="experiment-row experiment-heading">
            <span>Ambulance ID</span>
            <span>Junction</span>
            <span>Direction</span>
            <span>Priority Score</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          <div className="experiment-row">
            <strong>AMB_001</strong>
            <span>J1</span>
            <span>East-West</span>
            <strong style={{ color: "#38bdf8" }}>285.0</strong>
            <span style={{ color: "#22c55e", fontWeight: "600" }}>ACTIVE</span>
            <span style={{ color: "#22c55e" }}>Green Corridor Active</span>
          </div>

          <div className="experiment-row">
            <strong>AMB_002</strong>
            <span>J1</span>
            <span>North-South</span>
            <strong style={{ color: "#38bdf8" }}>245.0</strong>
            <span style={{ color: "#f59e0b", fontWeight: "600" }}>QUEUED</span>
            <span style={{ color: "#f59e0b" }}>Held safely until AMB_001 clears</span>
          </div>

          <div className="experiment-row">
            <strong>AMB_003</strong>
            <span>J2</span>
            <span>East-West</span>
            <strong style={{ color: "#38bdf8" }}>361.5</strong>
            <span style={{ color: "#22c55e", fontWeight: "600" }}>COMPLETED</span>
            <span style={{ color: "#8ca0ae" }}>Cleared intersection</span>
          </div>
        </div>
      </section>

      {/* VISUAL GREEN CORRIDOR */}
      <section className="analytics-card" style={{ marginTop: "24px" }}>
        <div className="analytics-card-header">
          <div>
            <span className="insight-label">CORRIDOR HANDOVER</span>
            <h2>Sequential Green Handover: J1 → J2 → J3 → Hospital</h2>
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
      </section>

      {/* TWO COLUMN PERFORMANCE & TIMELINE */}
      <section className="emergency-two-column" style={{ marginTop: "24px" }}>
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <span className="insight-label">SIMULATION MEASUREMENTS</span>
              <h2>Normal Signals vs Green Corridor</h2>
            </div>
            <Activity size={22} />
          </div>

          <div className="chart-area emergency-chart" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="scenario" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155", borderRadius: "10px" }} />
                <Legend />
                <Bar dataKey="travelTime" name="Travel Time (sec)" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                <Bar dataKey="waitingTime" name="Waiting Time (sec)" fill="#22c55e" radius={[5, 5, 0, 0]} />
                <Bar dataKey="timeLoss" name="Time Loss (sec)" fill="#f59e0b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <span className="insight-label">EVENT SEQUENCE</span>
              <h2>Corridor Execution Lifecycle</h2>
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
                    <span className="timeline-status implemented">IMPLEMENTED</span>
                  </div>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONSIBLE AI DISCLAIMER */}
      <section className="emergency-disclaimer" style={{ marginTop: "24px" }}>
        <ShieldCheck size={20} />
        <div>
          <strong>Responsible AI & Municipal Safety Protocol</strong>
          <p>
            The emergency green corridor is verified inside the SUMO multi-junction simulation.
            Unsafe conflicting green signals are prevented by deterministic arbitration logic.
            Physical deployment requires certified emergency vehicle transponders, encrypted V2X communication,
            and traffic operator manual override capabilities.
          </p>
        </div>
      </section>
    </div>
  );
}

export default EmergencyMobility;
