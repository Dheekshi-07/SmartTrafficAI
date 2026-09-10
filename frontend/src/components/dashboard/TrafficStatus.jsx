// src/components/dashboard/TrafficStatus.jsx

import {
  Activity,
  CarFront,
  Gauge,
  TrafficCone,
} from "lucide-react";

function TrafficStatus({
  junctions = 4,
  vehicles = 401,
  controller = "Adaptive",
  networkStatus = "Online",
}) {
  return (
    <section className="metric-grid">
      <div className="metric-card">
        <div className="metric-icon">
          <TrafficCone size={21} />
        </div>

        <div>
          <p className="metric-title">
            Junctions
          </p>

          <h2>{junctions}</h2>

          <span>Smart network nodes</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">
          <CarFront size={21} />
        </div>

        <div>
          <p className="metric-title">
            Vehicles Tested
          </p>

          <h2>{vehicles}</h2>

          <span>SUMO experiment</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">
          <Gauge size={21} />
        </div>

        <div>
          <p className="metric-title">
            Controller
          </p>

          <h2>{controller}</h2>

          <span>Signal strategy</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon">
          <Activity size={21} />
        </div>

        <div>
          <p className="metric-title">
            Network
          </p>

          <h2>{networkStatus}</h2>

          <span>System status</span>
        </div>
      </div>
    </section>
  );
}

export default TrafficStatus;