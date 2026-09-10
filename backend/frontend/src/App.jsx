import { useEffect, useState } from "react";

import {
  Activity,
  Ambulance,
  Clock3,
  Gauge,
  Radio,
  RefreshCw,
  Route,
  TrafficCone,
  Zap,
} from "lucide-react";

import "./App.css";

import MetricCard from "./components/MetricCard";
import QueueComparisonChart from "./components/QueueComparisonChart";
import TrafficPerformanceChart from "./components/TrafficPerformanceChart";
import EmergencyComparisonChart from "./components/EmergencyComparisonChart";
import IntersectionMonitor from "./components/IntersectionMonitor";

import {
  getTrafficComparison,
  getEmergencyComparison,
  getSystemHealth,
} from "./services/api";

function App() {
  const [traffic, setTraffic] = useState(null);
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  const [systemOnline, setSystemOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [trafficData, emergencyData, healthData] =
        await Promise.all([
          getTrafficComparison(),
          getEmergencyComparison(),
          getSystemHealth(),
        ]);

      setTraffic(trafficData);
      setEmergency(emergencyData);

      setSystemOnline(healthData.status === "online");

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(
        "Unable to load SmartTrafficAI data:",
        error
      );

      setSystemOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Activity size={35} />
        <h2>Loading SmartTrafficAI...</h2>
      </div>
    );
  }

  if (!traffic || !emergency) {
    return (
      <div className="loading-screen">
        <h2>Unable to connect to SmartTrafficAI API</h2>

        <p>
          Make sure FastAPI is running on port 8000.
        </p>

        <button
          className="refresh-button"
          onClick={loadData}
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>
      </div>
    );
  }

  const fixed = traffic.trip_metrics.find(
    (item) => item.controller === "Fixed"
  );

  const adaptive = traffic.trip_metrics.find(
    (item) => item.controller === "Adaptive"
  );

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

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

          <button
            className="nav-item active"
            onClick={() =>
              scrollToSection("control-center")
            }
          >
            <Gauge size={19} />
            Control Center
          </button>

          <button
            className="nav-item"
            onClick={() =>
              scrollToSection("traffic-analytics")
            }
          >
            <Activity size={19} />
            Traffic Analytics
          </button>

          <button
            className="nav-item"
            onClick={() =>
              scrollToSection("emergency")
            }
          >
            <Ambulance size={19} />
            Emergency
          </button>

          <button
            className="nav-item"
            onClick={() =>
              scrollToSection("simulation")
            }
          >
            <Route size={19} />
            Simulation
          </button>

        </nav>

        {/* REAL BACKEND STATUS */}

        <div className="system-card">

          <div
            className={
              systemOnline
                ? "status-line"
                : "status-line offline-text"
            }
          >
            <span
              className={
                systemOnline
                  ? "status-dot"
                  : "status-dot offline-dot"
              }
            ></span>

            {systemOnline
              ? "SYSTEM ONLINE"
              : "SYSTEM OFFLINE"}
          </div>

          <p>
            SUMO + TraCI Controller

            {lastUpdated && (
              <>
                <br />
                Updated {lastUpdated}
              </>
            )}
          </p>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">

        <header>

          <div>
            <p className="eyebrow">
              INTELLIGENT MOBILITY PLATFORM
            </p>

            <h1>Traffic Control Center</h1>

            <p className="header-description">
              AI-powered adaptive traffic signal optimization
              and emergency vehicle prioritization.
            </p>
          </div>

          <div className="header-actions">

            <div
              className={
                systemOnline
                  ? "live-status"
                  : "live-status offline-status"
              }
            >
              <Radio size={17} />

              {systemOnline
                ? "LIVE SYSTEM"
                : "SYSTEM OFFLINE"}
            </div>

            <button
              className="refresh-button"
              onClick={loadData}
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>

          </div>

        </header>

        {/* ================= METRICS ================= */}

        <section
          id="control-center"
          className="metric-grid"
        >

          <MetricCard
            title="Queue Reduction"
            value="69.73%"
            subtitle="Fixed → Adaptive"
            icon={Activity}
          />

          <MetricCard
            title="Avg Waiting"
            value={
              `${adaptive?.avg_waiting_time?.toFixed(2)}s`
            }
            subtitle={
              `Previously ${fixed?.avg_waiting_time?.toFixed(2)}s`
            }
            icon={Clock3}
          />

          <MetricCard
            title="Ambulance Wait"
            value="0 sec"
            subtitle="With emergency priority"
            icon={Ambulance}
          />

          <MetricCard
            title="Vehicles Tested"
            value={adaptive?.vehicles_completed}
            subtitle="Same traffic demand"
            icon={Zap}
          />

        </section>

        {/* ================= SIMULATION ================= */}

        <section
          id="simulation"
          className="simulation-section"
        >
          <IntersectionMonitor />
        </section>

        {/* ================= ANALYTICS ================= */}

        <section
          id="traffic-analytics"
          className="dashboard-grid"
        >

          <QueueComparisonChart
            data={traffic.queue_comparison}
          />

          <TrafficPerformanceChart
            data={traffic.trip_metrics}
          />

        </section>

        {/* ================= EMERGENCY ================= */}

        <section
          id="emergency"
          className="emergency-section"
        >

          <EmergencyComparisonChart
            data={emergency.ambulance_metrics}
          />

          <div className="emergency-summary">

            <p className="eyebrow emergency-text">
              EMERGENCY PREEMPTION
            </p>

            <h2>
              Faster passage for critical vehicles
            </h2>

            <p>
              SmartTrafficAI detects an emergency vehicle
              approaching the intersection and temporarily
              prioritizes its traffic direction.
            </p>

            <div className="emergency-number">

              <strong>37.93%</strong>

              <span>
                ambulance travel-time reduction
              </span>

            </div>

            <div className="emergency-number">

              <strong>100%</strong>

              <span>
                simulated waiting-time reduction
              </span>

            </div>

          </div>

        </section>

        <footer>
          SmartTrafficAI • SUMO • TraCI • FastAPI • React
        </footer>

      </main>

    </div>
  );
}

export default App;