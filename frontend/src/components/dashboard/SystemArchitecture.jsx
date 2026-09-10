// src/components/dashboard/SystemArchitecture.jsx

import {
  BrainCircuit,
  Cpu,
  Database,
  Monitor,
  Server,
} from "lucide-react";

function SystemArchitecture() {
  const items = [
    {
      icon: Database,
      title: "Traffic Data",
      text: "Pune traffic dataset",
    },
    {
      icon: BrainCircuit,
      title: "Adaptive Logic",
      text: "Queue-responsive signal control",
    },
    {
      icon: Cpu,
      title: "SUMO + TraCI",
      text: "Traffic simulation and control",
    },
    {
      icon: Server,
      title: "FastAPI",
      text: "Backend data services",
    },
    {
      icon: Monitor,
      title: "React",
      text: "Traffic command dashboard",
    },
  ];

  return (
    <section className="command-card">
      <div className="command-card-header">
        <div>
          <div className="section-kicker">
            SYSTEM ARCHITECTURE
          </div>

          <h2>SmartTrafficAI Pipeline</h2>

          <p>
            End-to-end traffic intelligence architecture
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          padding: "20px",
        }}
      >
        {items.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="controller-display"
          >
            <Icon size={20} />

            <div>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SystemArchitecture;