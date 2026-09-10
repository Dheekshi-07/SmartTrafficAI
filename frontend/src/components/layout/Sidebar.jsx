import {
  Activity,
  Ambulance,
  Boxes,
  Cpu,
  Gauge,
  Map,
  Route,
  TrafficCone,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    {
      path: "/dashboard",
      label: "Command Center",
      icon: Gauge,
    },
    {
      path: "/traffic",
      label: "Live Traffic",
      icon: Map,
    },
    {
      path: "/analytics",
      label: "AI Analytics",
      icon: Activity,
    },
    {
      path: "/emergency",
      label: "Emergency Mobility",
      icon: Ambulance,
    },
    {
      path: "/simulation",
      label: "Simulation Lab",
      icon: Route,
    },
    {
      path: "/hardware",
      label: "Hardware",
      icon: Cpu,
    },
    {
      path: "/architecture",
      label: "Architecture",
      icon: Boxes,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <TrafficCone size={24} />
        </div>

        <div>
          <strong>SmartTraffic</strong>
          <span>AI</span>
        </div>
      </div>

      <nav>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="system-card">
        <div className="status-line">
          <span className="status-dot" />
          SYSTEM ONLINE
        </div>

        <p>
          SUMO + TraCI
          <br />
          FastAPI Connected
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;