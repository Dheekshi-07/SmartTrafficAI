import {
  Cpu,
  Cable,
  TrafficCone,
  Activity,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getHardwareStatus } from "../services/api";

function Hardware() {
  const [hwStatus, setHwStatus] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const status = await getHardwareStatus();
        setHwStatus(status);
      } catch (err) {
        console.error("Hardware load error:", err);
      }
    }
    load();
  }, []);

  const isConnected = hwStatus?.connected || false;

  return (
    <div>
      <header>
        <div>
          <p className="eyebrow">PHYSICAL PROTOTYPE & ACTUATION</p>
          <h1>Arduino Hardware Integration</h1>
          <p className="header-description">
            Arduino Uno based physical traffic signal prototype connected to the
            SmartTrafficAI SUMO simulation and TraCI adaptive control pipeline via Python serial bridge.
          </p>
        </div>

        <div
          className="live-status"
          style={{
            background: isConnected ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
            border: isConnected ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          {isConnected ? (
            <>
              <CheckCircle2 size={16} color="#22c55e" />
              <span style={{ color: "#22c55e" }}>HARDWARE CONNECTED</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} color="#f59e0b" />
              <span style={{ color: "#f59e0b" }}>SIMULATION MODE (NO USB)</span>
            </>
          )}
        </div>
      </header>

      {/* HARDWARE TELEMETRY CARDS */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <Cpu size={22} />
          </div>
          <div>
            <p className="metric-title">Microcontroller</p>
            <h2>Arduino Uno</h2>
            <span>ATmega328P @ 16 MHz</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <TrafficCone size={22} />
          </div>
          <div>
            <p className="metric-title">Physical Signal</p>
            <h2>3-Color LED</h2>
            <span>Pins 8 (R), 9 (Y), 10 (G)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Cable size={22} />
          </div>
          <div>
            <p className="metric-title">Serial Interface</p>
            <h2>{hwStatus?.port || "None (Auto-Scan)"}</h2>
            <span>9600 bps • 8-N-1</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Activity size={22} />
          </div>
          <div>
            <p className="metric-title">Control Pipeline</p>
            <h2>TraCI ↔ Bridge</h2>
            <span>Non-blocking ACK protocol</span>
          </div>
        </div>
      </section>

      {/* LIVE SERIAL CONNECTION STATUS */}
      <section className="city-network-card" style={{ marginTop: "24px" }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">DIAGNOSTIC TELEMETRY</p>
            <h2>Serial Port & Bridge Monitor</h2>
          </div>
          <Terminal size={22} />
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "18px 22px",
            borderRadius: "12px",
            background: "#081722",
            border: "1px solid #1c3d50",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#8ca0ae" }}>Connection Status</div>
            <strong style={{ color: isConnected ? "#22c55e" : "#f59e0b", fontSize: "15px" }}>
              {isConnected ? "Connected (Live USB)" : "Disconnected (Simulation-Only Fallback)"}
            </strong>
          </div>

          <div>
            <div style={{ fontSize: "12px", color: "#8ca0ae" }}>Detected Port</div>
            <strong style={{ fontSize: "15px" }}>{hwStatus?.port || "None detected"}</strong>
          </div>

          <div>
            <div style={{ fontSize: "12px", color: "#8ca0ae" }}>Baud Rate</div>
            <strong style={{ fontSize: "15px" }}>{hwStatus?.baud_rate || 9600} baud</strong>
          </div>

          <div>
            <div style={{ fontSize: "12px", color: "#8ca0ae" }}>Last Command Sent</div>
            <strong style={{ fontSize: "15px", color: "#38bdf8" }}>{hwStatus?.last_command || "None"}</strong>
          </div>

          <div>
            <div style={{ fontSize: "12px", color: "#8ca0ae" }}>Last ACK Received</div>
            <strong style={{ fontSize: "15px", color: "#22c55e" }}>{hwStatus?.last_ack || "None"}</strong>
          </div>

          <div>
            <div style={{ fontSize: "12px", color: "#8ca0ae" }}>Bridge Mode</div>
            <strong style={{ fontSize: "15px" }}>{hwStatus?.mode || "SIMULATION_ONLY"}</strong>
          </div>
        </div>
      </section>

      {/* PROTOCOL SPECIFICATION */}
      <section className="city-network-card" style={{ marginTop: "24px" }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMMAND PROTOCOL</p>
            <h2>ASCII Serial Command & ACK Specification</h2>
          </div>
          <Zap size={22} />
        </div>

        <div className="experiment-table" style={{ marginTop: "16px" }}>
          <div className="experiment-row experiment-heading">
            <span>Command</span>
            <span>Target Action</span>
            <span>Arduino Acknowledgement</span>
            <span>Fail-Safe</span>
          </div>

          <div className="experiment-row">
            <strong>RED</strong>
            <span>Activate Red LED (Pin 8 HIGH, others LOW)</span>
            <span style={{ color: "#22c55e" }}>ACK:RED</span>
            <span>Default safe stop state</span>
          </div>

          <div className="experiment-row">
            <strong>YELLOW</strong>
            <span>Activate Yellow LED (Pin 9 HIGH, others LOW)</span>
            <span style={{ color: "#22c55e" }}>ACK:YELLOW</span>
            <span>3-second clearance phase</span>
          </div>

          <div className="experiment-row">
            <strong>GREEN</strong>
            <span>Activate Green LED (Pin 10 HIGH, others LOW)</span>
            <span style={{ color: "#22c55e" }}>ACK:GREEN</span>
            <span>Adaptive green duration</span>
          </div>

          <div className="experiment-row">
            <strong>EMERGENCY_GREEN</strong>
            <span>Emergency Priority Corridor Green</span>
            <span style={{ color: "#22c55e" }}>ACK:EMERGENCY_GREEN</span>
            <span>Instant signal preemption</span>
          </div>

          <div className="experiment-row">
            <strong>PING</strong>
            <span>Bridge Heartbeat & Liveness Check</span>
            <span style={{ color: "#38bdf8" }}>ACK:PONG</span>
            <span>Watchdog reset</span>
          </div>

          <div className="experiment-row">
            <strong>ALL_OFF</strong>
            <span>De-energize all signal LEDs</span>
            <span style={{ color: "#22c55e" }}>ACK:ALL_OFF</span>
            <span>Maintenance mode</span>
          </div>
        </div>
      </section>

      {/* HARDWARE VALIDATION NOTICE */}
      <section className="emergency-disclaimer" style={{ marginTop: "24px" }}>
        <CheckCircle2 size={20} />
        <div>
          <strong>Physical Validation Status</strong>
          <p>
            Arduino Uno firmware (smart_traffic_signal.ino) and Python serial bridge (serial_bridge.py)
            are fully implemented with non-blocking ACK validation, retry mechanisms, and watchdog fallback.
            Physical LED actuation requires connecting the Arduino board to a USB port.
            When disconnected, the bridge operates safely in simulation mode without crashing the backend.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Hardware;
