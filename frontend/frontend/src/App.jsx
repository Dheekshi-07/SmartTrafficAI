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

// Existing components
import MetricCard from "./components/MetricCard";
import QueueComparisonChart from "./components/QueueComparisonChart";
import TrafficPerformanceChart from "./components/TrafficPerformanceChart";
import EmergencyComparisonChart from "./components/EmergencyComparisonChart";

// New dashboard components
import LiveIntersection from "./components/dashboard/LiveIntersection";
import SimulationControls from "./components/dashboard/SimulationControls";

// API
import {
  getTrafficComparison,
  getEmergencyComparison,
  getSystemHealth,
} from "./services/api";

function App() {
  // =====================================================
  // BACKEND DATA STATE
  // =====================================================

  const [traffic, setTraffic] = useState(null);
  const [emergency, setEmergency] = useState(null);

  const [loading, setLoading] = useState(true);
  const [systemOnline, setSystemOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [activeSection, setActiveSection] =
    useState("control-center");

  // =====================================================
  // LIVE SIMULATION STATE
  // =====================================================

  const [simulationRunning, setSimulationRunning] =
    useState(true);

  const [emergencyActive, setEmergencyActive] =
    useState(false);

  const [trafficLevel, setTrafficLevel] =
    useState("Medium");

  const [activeDirection, setActiveDirection] =
    useState("NS");

  const [liveQueues, setLiveQueues] = useState({
    N: 3,
    S: 2,
    E: 1,
    W: 1,
  });

  // =====================================================
  // LOAD BACKEND DATA
  // =====================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        trafficData,
        emergencyData,
        healthData,
      ] = await Promise.all([
        getTrafficComparison(),
        getEmergencyComparison(),
        getSystemHealth(),
      ]);

      setTraffic(trafficData);
      setEmergency(emergencyData);

      setSystemOnline(
        healthData?.status === "online"
      );

      setLastUpdated(
        new Date().toLocaleTimeString()
      );
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

  // =====================================================
  // INITIAL BACKEND LOAD
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // FRONTEND SIMULATION
  // =====================================================

  useEffect(() => {
    if (!simulationRunning || emergencyActive) {
      return;
    }

    const interval = setInterval(() => {
      // Alternate signal direction
      setActiveDirection((current) =>
        current === "NS" ? "EW" : "NS"
      );

      // Queue ranges based on selected demand
      const limits = {
        Low: 3,
        Medium: 6,
        High: 11,
      };

      const limit =
        limits[trafficLevel] || 6;

      setLiveQueues({
        N: Math.floor(
          Math.random() * limit
        ),

        S: Math.floor(
          Math.random() * limit
        ),

        E: Math.floor(
          Math.random() * limit
        ),

        W: Math.floor(
          Math.random() * limit
        ),
      });
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [
    simulationRunning,
    emergencyActive,
    trafficLevel,
  ]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const scrollToSection = (id) => {
    setActiveSection(id);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // =====================================================
  // EMERGENCY DEMO
  // =====================================================

  const handleEmergency = () => {
    if (emergencyActive) {
      return;
    }

    // Activate ambulance scenario
    setEmergencyActive(true);

    // Keep simulation running
    setSimulationRunning(true);

    // Ambulance approaches from East,
    // therefore E/W gets green priority.
    setActiveDirection("EW");

    // Simulate congestion around
    // emergency corridor
    setLiveQueues((current) => ({
      ...current,
      E: Math.max(current.E, 4),
      W: Math.max(current.W, 2),
    }));

    // Emergency clears after 5 seconds
    setTimeout(() => {
      setEmergencyActive(false);

      // Return to normal adaptive operation
      setActiveDirection("NS");
    }, 5000);
  };

  // =====================================================
  // RESET SIMULATION
  // =====================================================

  const resetSimulation = () => {
    setSimulationRunning(false);

    setEmergencyActive(false);

    setTrafficLevel("Medium");

    setActiveDirection("NS");

    setLiveQueues({
      N: 3,
      S: 2,
      E: 1,
      W: 1,
    });
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="loading-screen">

        <Activity size={40} />

        <h2>
          Loading SmartTrafficAI...
        </h2>

        <p>
          Connecting to traffic analytics API
        </p>

      </div>
    );
  }

  // =====================================================
  // BACKEND ERROR
  // =====================================================

  if (!traffic || !emergency) {
    return (
      <div className="loading-screen">

        <Activity size={42} />

        <h2>
          Unable to connect to
          SmartTrafficAI API
        </h2>

        <p>
          Make sure the FastAPI backend
          is running on port 8000.
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

  // =====================================================
  // TRAFFIC RESULTS
  // =====================================================

  const fixed =
    traffic.trip_metrics?.find(
      (item) =>
        item.controller === "Fixed"
    );

  const adaptive =
    traffic.trip_metrics?.find(
      (item) =>
        item.controller === "Adaptive"
    );

  // =====================================================
  // QUEUE RESULTS
  // =====================================================

  const fixedQueue =
    traffic.queue_comparison?.find(
      (item) =>
        item.Controller === "Fixed"
    );

  const adaptiveQueue =
    traffic.queue_comparison?.find(
      (item) =>
        item.Controller === "Adaptive"
    );

  let queueReduction = 0;

  if (
    fixedQueue &&
    adaptiveQueue &&
    fixedQueue["Average Queue"] > 0
  ) {
    queueReduction =
      ((
        fixedQueue["Average Queue"] -
        adaptiveQueue["Average Queue"]
      ) /
        fixedQueue["Average Queue"]) *
      100;
  }

  // =====================================================
  // EMERGENCY RESULTS
  // =====================================================

  const ambulanceWithoutPriority =
    emergency.ambulance_metrics?.find(
      (item) =>
        item.mode ===
        "Without Priority"
    );

  const ambulanceWithPriority =
    emergency.ambulance_metrics?.find(
      (item) =>
        item.mode ===
        "With Priority"
    );

  let ambulanceImprovement = 0;

  if (
    ambulanceWithoutPriority &&
    ambulanceWithPriority &&
    ambulanceWithoutPriority.travel_time > 0
  ) {
    ambulanceImprovement =
      ((
        ambulanceWithoutPriority.travel_time -
        ambulanceWithPriority.travel_time
      ) /
        ambulanceWithoutPriority.travel_time) *
      100;
  }

  // =====================================================
  // TOTAL CURRENT QUEUE
  // =====================================================

  const totalLiveQueue =
    liveQueues.N +
    liveQueues.S +
    liveQueues.E +
    liveQueues.W;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">
            <TrafficCone size={24} />
          </div>

          <div>
            <strong>
              SmartTraffic
            </strong>

            <span>AI</span>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          <button
            className={`nav-item ${
              activeSection ===
              "control-center"
                ? "active"
                : ""
            }`}
            onClick={() =>
              scrollToSection(
                "control-center"
              )
            }
          >
            <Gauge size={19} />

            Control Center
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "simulation"
                ? "active"
                : ""
            }`}
            onClick={() =>
              scrollToSection(
                "simulation"
              )
            }
          >
            <Route size={19} />

            Live Traffic
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "traffic-analytics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              scrollToSection(
                "traffic-analytics"
              )
            }
          >
            <Activity size={19} />

            Analytics
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "emergency"
                ? "active"
                : ""
            }`}
            onClick={() =>
              scrollToSection(
                "emergency"
              )
            }
          >
            <Ambulance size={19} />

            Emergency
          </button>

        </nav>

        {/* SYSTEM STATUS */}

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
            />

            {systemOnline
              ? "SYSTEM ONLINE"
              : "SYSTEM OFFLINE"}
          </div>

          <p>
            SUMO + TraCI Controller
          </p>

          {lastUpdated && (
            <p>
              Last sync: {lastUpdated}
            </p>
          )}

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header>

          <div>

            <p className="eyebrow">
              INTELLIGENT MOBILITY PLATFORM
            </p>

            <h1>
              Traffic Command Center
            </h1>

            <p className="header-description">
              AI-powered adaptive traffic signal
              optimization, traffic analytics
              and emergency vehicle
              prioritization.
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

        {/* =================================================
            KPI / CONTROL CENTER
        ================================================= */}

        <section
          id="control-center"
          className="metric-grid"
        >

          <MetricCard
            title="Queue Reduction"
            value={`${queueReduction.toFixed(
              2
            )}%`}
            subtitle="Fixed → Adaptive"
            icon={Activity}
          />

          <MetricCard
            title="Avg Waiting"
            value={
              adaptive
                ? `${adaptive.avg_waiting_time.toFixed(
                    2
                  )}s`
                : "--"
            }
            subtitle={
              fixed
                ? `Previously ${fixed.avg_waiting_time.toFixed(
                    2
                  )}s`
                : "Fixed controller"
            }
            icon={Clock3}
          />

          <MetricCard
            title="Ambulance Wait"
            value={
              ambulanceWithPriority
                ? `${ambulanceWithPriority.waiting_time.toFixed(
                    0
                  )} sec`
                : "--"
            }
            subtitle="With emergency priority"
            icon={Ambulance}
          />

          <MetricCard
            title="Vehicles Tested"
            value={
              adaptive
                ? adaptive.vehicles_completed
                : "--"
            }
            subtitle="Same traffic demand"
            icon={Zap}
          />

        </section>

        {/* =================================================
            SMALL LIVE STATUS BAR
        ================================================= */}

        <div className="live-summary-bar">

          <div>
            <span>CONTROLLER</span>
            <strong>
              Adaptive
            </strong>
          </div>

          <div>
            <span>SIGNAL</span>
            <strong>
              {activeDirection === "NS"
                ? "North / South"
                : "East / West"}
            </strong>
          </div>

          <div>
            <span>TRAFFIC DEMAND</span>
            <strong>
              {trafficLevel}
            </strong>
          </div>

          <div>
            <span>CURRENT QUEUE</span>
            <strong>
              {totalLiveQueue} vehicles
            </strong>
          </div>

          <div>
            <span>EMERGENCY</span>

            <strong
              className={
                emergencyActive
                  ? "emergency-live-text"
                  : "healthy-text"
              }
            >
              {emergencyActive
                ? "AMB_001 ACTIVE"
                : "None"}
            </strong>
          </div>

        </div>

        {/* =================================================
            LIVE INTERSECTION + SIMULATION LAB
        ================================================= */}

        <section
          id="simulation"
          className="simulation-section"
        >

          <div className="command-center-layout">

            <LiveIntersection
              queues={liveQueues}
              activeDirection={
                activeDirection
              }
              emergencyActive={
                emergencyActive
              }
            />

            <SimulationControls
              running={
                simulationRunning
              }

              emergencyActive={
                emergencyActive
              }

              trafficLevel={
                trafficLevel
              }

              onStart={() =>
                setSimulationRunning(true)
              }

              onPause={() =>
                setSimulationRunning(false)
              }

              onReset={
                resetSimulation
              }

              onEmergency={
                handleEmergency
              }

              onTrafficChange={
                setTrafficLevel
              }
            />

          </div>

        </section>

        {/* =================================================
            ANALYTICS TITLE
        ================================================= */}

        <section
          id="traffic-analytics"
          className="analytics-section"
        >

          <div className="section-heading">

            <div>
              <p className="eyebrow">
                TRAFFIC OPTIMIZATION
              </p>

              <h2>
                Controller Analytics
              </h2>

              <p>
                Performance comparison from
                SUMO + TraCI experiments.
              </p>
            </div>

            <div className="analytics-badge">
              <Activity size={15} />
              EXPERIMENT RESULTS
            </div>

          </div>

          {/* CHARTS */}

          <div className="dashboard-grid">

            <QueueComparisonChart
              data={
                traffic.queue_comparison
              }
            />

            <TrafficPerformanceChart
              data={
                traffic.trip_metrics
              }
            />

          </div>

        </section>

        {/* =================================================
            ANALYTICS NUMBERS
        ================================================= */}

        <div className="performance-summary">

          <div>
            <span>
              FIXED AVG QUEUE
            </span>

            <strong>
              {fixedQueue
                ? fixedQueue[
                    "Average Queue"
                  ].toFixed(2)
                : "--"}
            </strong>
          </div>

          <div>
            <span>
              ADAPTIVE AVG QUEUE
            </span>

            <strong>
              {adaptiveQueue
                ? adaptiveQueue[
                    "Average Queue"
                  ].toFixed(2)
                : "--"}
            </strong>
          </div>

          <div>
            <span>
              FIXED TRAVEL TIME
            </span>

            <strong>
              {fixed
                ? `${fixed.avg_travel_time.toFixed(
                    2
                  )}s`
                : "--"}
            </strong>
          </div>

          <div>
            <span>
              ADAPTIVE TRAVEL TIME
            </span>

            <strong>
              {adaptive
                ? `${adaptive.avg_travel_time.toFixed(
                    2
                  )}s`
                : "--"}
            </strong>
          </div>

        </div>

        {/* =================================================
            EMERGENCY SECTION
        ================================================= */}

        <section
          id="emergency"
          className="emergency-section"
        >

          <EmergencyComparisonChart
            data={
              emergency.ambulance_metrics
            }
          />

          <div className="emergency-summary">

            <p className="eyebrow emergency-text">
              EMERGENCY PREEMPTION
            </p>

            <h2>
              Faster passage for
              critical vehicles
            </h2>

            <p>
              SmartTrafficAI detects an
              emergency vehicle approaching
              Junction J1 and temporarily
              prioritizes its traffic
              direction.
            </p>

            {/* TRAVEL REDUCTION */}

            <div className="emergency-number">

              <strong>
                {ambulanceImprovement.toFixed(
                  2
                )}
                %
              </strong>

              <span>
                ambulance travel-time
                reduction
              </span>

            </div>

            {/* WAITING REDUCTION */}

            <div className="emergency-number">

              <strong>
                100%
              </strong>

              <span>
                simulated waiting-time
                reduction
              </span>

            </div>

            {/* ACTUAL TRAVEL TIME */}

            {ambulanceWithoutPriority &&
              ambulanceWithPriority && (
                <div className="emergency-number">

                  <strong>
                    {
                      ambulanceWithoutPriority.travel_time
                    }
                    s →{" "}
                    {
                      ambulanceWithPriority.travel_time
                    }
                    s
                  </strong>

                  <span>
                    emergency vehicle
                    travel time
                  </span>

                </div>
              )}

            {/* ACTUAL WAITING TIME */}

            {ambulanceWithoutPriority &&
              ambulanceWithPriority && (
                <div className="emergency-number">

                  <strong>
                    {
                      ambulanceWithoutPriority.waiting_time
                    }
                    s →{" "}
                    {
                      ambulanceWithPriority.waiting_time
                    }
                    s
                  </strong>

                  <span>
                    ambulance waiting time
                  </span>

                </div>
              )}

          </div>

        </section>

        {/* =================================================
            TECHNOLOGY STACK
        ================================================= */}

        <section className="technology-strip">

          <div>
            <span>SIMULATION</span>
            <strong>SUMO</strong>
          </div>

          <div>
            <span>CONTROL</span>
            <strong>TraCI</strong>
          </div>

          <div>
            <span>BACKEND</span>
            <strong>FastAPI</strong>
          </div>

          <div>
            <span>FRONTEND</span>
            <strong>React</strong>
          </div>

          <div>
            <span>DATA</span>
            <strong>Pune Traffic</strong>
          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer>

          SmartTrafficAI • Intelligent Adaptive
          Traffic Management & Emergency
          Priority System

        </footer>

      </main>

    </div>
  );
}

export default App;