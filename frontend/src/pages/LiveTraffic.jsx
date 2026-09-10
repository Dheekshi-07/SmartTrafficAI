import {
  Activity,
  MapPin,
  Radio,
} from "lucide-react";

import CityNetwork from "../components/city/CityNetwork";

function LiveTraffic() {
  return (
    <div>
      <header>
        <div>
          <p className="eyebrow">
            LIVE TRAFFIC
          </p>

          <h1>City Traffic Network</h1>

          <p className="header-description">
            Monitor connected traffic
            junctions, queue conditions and
            adaptive traffic states.
          </p>
        </div>

        <div className="live-status">
          <Radio size={16} />
          NETWORK MONITORING
        </div>
      </header>

      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <MapPin size={22} />
          </div>

          <div>
            <p className="metric-title">
              Junctions
            </p>
            <h2>4</h2>
            <span>J1 - J4 network</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Activity size={22} />
          </div>

          <div>
            <p className="metric-title">
              Active Controller
            </p>
            <h2>Adaptive</h2>
            <span>Queue-responsive control</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Radio size={22} />
          </div>

          <div>
            <p className="metric-title">
              Network Status
            </p>
            <h2>Online</h2>
            <span>Connected monitoring</span>
          </div>
        </div>
      </section>

      <CityNetwork />
    </div>
  );
}

export default LiveTraffic;