import {
  Activity,
  Ambulance,
  Clock3,
  Radio,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";

import MetricCard from "../components/MetricCard";
import CityNetwork from "../components/city/CityNetwork";

import {
  getTrafficComparison,
  getEmergencyComparison,
} from "../services/api";

function Dashboard() {
  const [traffic, setTraffic] = useState(null);
  const [emergency, setEmergency] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const trafficData = await getTrafficComparison();
        const emergencyData = await getEmergencyComparison();

        setTraffic(trafficData);
        setEmergency(emergencyData);
      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    }

    load();
  }, []);

  const adaptive = traffic?.trip_metrics?.find(
    (item) => item.controller === "Adaptive"
  );

  return (
    <>
      <header>
        <div>
          <p className="eyebrow">
            SMART CITY MOBILITY PLATFORM
          </p>

          <h1>Traffic Command Center</h1>

          <p className="header-description">
            Central monitoring and control for adaptive
            intersections.
          </p>
        </div>

        <div className="live-status">
          <Radio size={16} />
          NETWORK ONLINE
        </div>
      </header>

      <section className="metric-grid">
        <MetricCard
          title="Queue Reduction"
          value="69.73%"
          subtitle="Adaptive vs fixed"
          icon={Activity}
        />

        <MetricCard
          title="Avg Waiting"
          value={
            adaptive
              ? `${adaptive.avg_waiting_time.toFixed(2)}s`
              : "--"
          }
          subtitle="Adaptive controller"
          icon={Clock3}
        />

        <MetricCard
          title="Emergency Wait"
          value="0 sec"
          subtitle="AMB_001 priority"
          icon={Ambulance}
        />

        <MetricCard
          title="Vehicles Tested"
          value={adaptive?.vehicles_completed || "--"}
          subtitle="SUMO experiment"
          icon={Zap}
        />
      </section>

      <CityNetwork />
    </>
  );
}

export default Dashboard;