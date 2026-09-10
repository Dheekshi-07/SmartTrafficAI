import {
  Activity,
  Clock3,
  Gauge,
  Car,
  TrendingDown,
  BrainCircuit,
  Database,
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

function Analytics() {
  const controllerComparison = [
    {
      metric: "Average Queue",
      Fixed: 5.36,
      Adaptive: 1.62,
    },
    {
      metric: "Waiting Time",
      Fixed: 12.63,
      Adaptive: 4.27,
    },
    {
      metric: "Travel Time",
      Fixed: 34.04,
      Adaptive: 24.57,
    },
  ];

  const queueComparison = [
    {
      controller: "Fixed",
      queue: 5.36,
    },
    {
      controller: "Adaptive",
      queue: 1.62,
    },
  ];

  const waitingComparison = [
    {
      controller: "Fixed",
      waiting: 12.63,
    },
    {
      controller: "Adaptive",
      waiting: 4.27,
    },
  ];

  const travelComparison = [
    {
      controller: "Fixed",
      travel: 34.04,
    },
    {
      controller: "Adaptive",
      travel: 24.57,
    },
  ];

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">
        <div>
          <p className="eyebrow">AI ANALYTICS</p>

          <h1>Traffic Intelligence</h1>

          <p className="header-description">
            Fixed vs adaptive controller performance, queue analysis,
            travel-time analysis and AI-assisted traffic prediction.
          </p>

          <div className="page-meta">
            <span>SUMO Experimental Dataset</span>
            <span>•</span>
            <span>401 Completed Vehicles</span>
            <span>•</span>
            <span>Fixed vs Adaptive Evaluation</span>
          </div>
        </div>

        <div className="status-pill">
          <Activity size={16} />
          ANALYTICS ACTIVE
        </div>
      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="analytics-metric-grid">
        <div className="analytics-metric-card">
          <div className="analytics-icon">
            <TrendingDown size={22} />
          </div>

          <div>
            <span>Queue Reduction</span>
            <h2>69.73%</h2>
            <p>Adaptive vs fixed controller</p>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <span>Adaptive Waiting</span>
            <h2>4.27 sec</h2>
            <p>Previously 12.63 sec</p>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-icon">
            <Gauge size={22} />
          </div>

          <div>
            <span>Adaptive Travel Time</span>
            <h2>24.57 sec</h2>
            <p>Previously 34.04 sec</p>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-icon">
            <Car size={22} />
          </div>

          <div>
            <span>Vehicles Evaluated</span>
            <h2>401</h2>
            <p>SUMO simulation experiment</p>
          </div>
        </div>
      </div>

      {/* ======================================================
          KEY RESULT
      ====================================================== */}

      <div className="analytics-insight-banner">
        <div>
          <span className="insight-label">KEY RESULT</span>

          <h3>
            Adaptive control reduced average queue length by 69.73%
          </h3>

          <p>
            Under the same SUMO traffic scenario, the adaptive controller
            reduced average waiting time from 12.63 seconds to 4.27 seconds.
          </p>
        </div>

        <div className="insight-badge">
          SUMO • 401 vehicles
        </div>
      </div>

      {/* ======================================================
          MAIN PERFORMANCE COMPARISON
      ====================================================== */}

      <section className="analytics-card analytics-large-card">
        <div className="analytics-card-header">
          <div>
            <p className="eyebrow">CONTROLLER EVALUATION</p>

            <h2>Fixed vs Adaptive Performance</h2>

            <p>
              Performance comparison generated from SmartTrafficAI SUMO
              simulation experiments.
            </p>
          </div>

          <div className="insight-badge">
            Simulation Results
          </div>
        </div>

        <div className="chart-area">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={controllerComparison}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.12)"
              />

              <XAxis
                dataKey="metric"
                stroke="#7f91a8"
                tick={{ fill: "#92a3b8" }}
              />

              <YAxis
                stroke="#7f91a8"
                tick={{ fill: "#92a3b8" }}
              />

              <Tooltip
                contentStyle={{
                  background: "#071725",
                  border: "1px solid #17394d",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Legend />

              <Bar
                dataKey="Fixed"
                fill="#ef646f"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="Adaptive"
                fill="#36d7c7"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ======================================================
          INDIVIDUAL PERFORMANCE CHARTS
      ====================================================== */}

      <div className="analytics-chart-grid">
        {/* QUEUE ANALYSIS */}

        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <p className="eyebrow">QUEUE ANALYSIS</p>
              <h3>Average Queue Length</h3>
            </div>

            <span className="improvement-badge">
              ↓ 69.73%
            </span>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={queueComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.12)"
                />

                <XAxis
                  dataKey="controller"
                  tick={{ fill: "#92a3b8" }}
                />

                <YAxis tick={{ fill: "#92a3b8" }} />

                <Tooltip
                  contentStyle={{
                    background: "#071725",
                    border: "1px solid #17394d",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="queue"
                  fill="#36d7c7"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-data-row">
            <span>
              Fixed
              <strong>5.36 vehicles</strong>
            </span>

            <span>
              Adaptive
              <strong>1.62 vehicles</strong>
            </span>
          </div>
        </section>

        {/* WAITING TIME ANALYSIS */}

        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <p className="eyebrow">WAITING-TIME ANALYSIS</p>
              <h3>Average Waiting Time</h3>
            </div>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={waitingComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.12)"
                />

                <XAxis
                  dataKey="controller"
                  tick={{ fill: "#92a3b8" }}
                />

                <YAxis tick={{ fill: "#92a3b8" }} />

                <Tooltip
                  contentStyle={{
                    background: "#071725",
                    border: "1px solid #17394d",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="waiting"
                  fill="#36d7c7"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-data-row">
            <span>
              Fixed
              <strong>12.63 sec</strong>
            </span>

            <span>
              Adaptive
              <strong>4.27 sec</strong>
            </span>
          </div>
        </section>

        {/* TRAVEL TIME ANALYSIS */}

        <section className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <p className="eyebrow">TRAVEL ANALYSIS</p>
              <h3>Average Travel Time</h3>
            </div>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={travelComparison}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.12)"
                />

                <XAxis
                  dataKey="controller"
                  tick={{ fill: "#92a3b8" }}
                />

                <YAxis tick={{ fill: "#92a3b8" }} />

                <Tooltip
                  contentStyle={{
                    background: "#071725",
                    border: "1px solid #17394d",
                    borderRadius: "12px",
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="travel"
                  fill="#36d7c7"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="analytics-data-row">
            <span>
              Fixed
              <strong>34.04 sec</strong>
            </span>

            <span>
              Adaptive
              <strong>24.57 sec</strong>
            </span>
          </div>
        </section>
      </div>

      {/* ======================================================
          AI / ML SECTION
      ====================================================== */}

      <section className="analytics-card ai-insight-card">
        <div className="ai-insight-icon">
          <BrainCircuit size={28} />
        </div>

        <div>
          <p className="eyebrow">AI / ML LAYER</p>

          <h2>Traffic Demand Prediction</h2>

          <p>
            SmartTrafficAI uses processed traffic-flow data to analyse
            vehicle demand and support adaptive traffic-signal decisions.
            Historical traffic observations are transformed into
            interval-based features before model evaluation.
          </p>

          <div className="ai-model-flow">
            <span>Traffic Dataset</span>
            <b>→</b>
            <span>Preprocessing</span>
            <b>→</b>
            <span>Feature Extraction</span>
            <b>→</b>
            <span>Random Forest</span>
            <b>→</b>
            <span>Traffic Prediction</span>
            <b>→</b>
            <span>Adaptive Control</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          DATA SOURCE
      ====================================================== */}

      <section className="analytics-card ai-insight-card">
        <div className="ai-insight-icon">
          <Database size={28} />
        </div>

        <div>
          <p className="eyebrow">DATA PIPELINE</p>

          <h2>Traffic Data Processing</h2>

          <p>
            The traffic dataset contains cumulative vehicle counts. During
            preprocessing, SmartTrafficAI converts these cumulative values
            into traffic counts for individual time intervals. The resulting
            data is used for traffic analysis, prediction and controller
            evaluation.
          </p>

          <div className="ai-model-flow">
            <span>Raw CCTV Traffic Counts</span>
            <b>→</b>
            <span>Cumulative Counts</span>
            <b>→</b>
            <span>Interval Difference</span>
            <b>→</b>
            <span>Vehicle Demand</span>
            <b>→</b>
            <span>ML / Simulation Input</span>
          </div>
        </div>
      </section>

      {/* ======================================================
          EXPERIMENT SUMMARY
      ====================================================== */}

      <section className="analytics-card experiment-card">
        <p className="eyebrow">
          EXPERIMENT SUMMARY
        </p>

        <h2>SUMO Controller Evaluation</h2>

        <div className="experiment-table">
          <div className="experiment-row experiment-heading">
            <span>Metric</span>
            <span>Fixed</span>
            <span>Adaptive</span>
          </div>

          <div className="experiment-row">
            <span>Average Queue</span>
            <strong>5.36</strong>
            <strong>1.62</strong>
          </div>

          <div className="experiment-row">
            <span>Average Waiting Time</span>
            <strong>12.63 sec</strong>
            <strong>4.27 sec</strong>
          </div>

          <div className="experiment-row">
            <span>Average Travel Time</span>
            <strong>34.04 sec</strong>
            <strong>24.57 sec</strong>
          </div>

          <div className="experiment-row">
            <span>Vehicles Completed</span>
            <strong>401</strong>
            <strong>401</strong>
          </div>
        </div>

        <p className="experiment-note">
          Results shown above were obtained from the SmartTrafficAI SUMO
          simulation environment. They represent experimental simulation
          results and not real-world deployment performance.
        </p>
      </section>
    </div>
  );
}

export default Analytics;