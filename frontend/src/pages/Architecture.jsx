import {
  BrainCircuit,
  Cpu,
  Database,
  Monitor,
  Server,
  TrafficCone,
} from "lucide-react";

function Architecture() {
  return (
    <div>
      <header>
        <div>
          <p className="eyebrow">
            SYSTEM DESIGN
          </p>

          <h1>System Architecture</h1>

          <p className="header-description">
            End-to-end architecture of SmartTrafficAI,
            connecting traffic data, AI control, SUMO
            simulation, FastAPI, React, and edge hardware.
          </p>
        </div>
      </header>

      <section className="city-network-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              DATA FLOW
            </p>

            <h2>SmartTrafficAI Pipeline</h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          <ArchitectureCard
            icon={TrafficCone}
            title="Traffic Network"
            text="Vehicle flow, junction queues and traffic demand"
          />

          <ArchitectureCard
            icon={Database}
            title="Traffic Data"
            text="Pune traffic dataset and processed traffic features"
          />

          <ArchitectureCard
            icon={BrainCircuit}
            title="AI Controller"
            text="Adaptive signal timing and traffic optimization logic"
          />

          <ArchitectureCard
            icon={Cpu}
            title="SUMO + TraCI"
            text="Microscopic traffic simulation and signal control"
          />

          <ArchitectureCard
            icon={Server}
            title="FastAPI"
            text="Backend APIs expose simulation and analytics results"
          />

          <ArchitectureCard
            icon={Monitor}
            title="React Dashboard"
            text="Command center, analytics and emergency monitoring"
          />
        </div>

        <div
          style={{
            marginTop: "28px",
            padding: "20px",
            border: "1px solid #1b3448",
            borderRadius: "12px",
            background: "#081722",
          }}
        >
          <p className="eyebrow">
            COMPLETE FLOW
          </p>

          <h3
            style={{
              color: "#dcebf2",
              marginTop: "10px",
              lineHeight: "1.8",
            }}
          >
            Traffic Data → AI Decision → SUMO Simulation →
            TraCI Controller → FastAPI → React Dashboard →
            ESP32 Traffic Signal
          </h3>
        </div>
      </section>
    </div>
  );
}

function ArchitectureCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#0a1b28",
        border: "1px solid #1c3b50",
        borderRadius: "12px",
      }}
    >
      <Icon
        size={25}
        style={{
          marginBottom: "14px",
          color: "#55ddca",
        }}
      />

      <h3
        style={{
          color: "#e3eff4",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#6f8797",
          fontSize: "11px",
          lineHeight: "1.7",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default Architecture;