// src/components/dashboard/EmergencyPanel.jsx

import { Ambulance, Clock3, ShieldCheck } from "lucide-react";

function EmergencyPanel() {
  return (
    <section className="command-card">
      <div className="command-card-header">
        <div>
          <div className="section-kicker">
            <Ambulance size={13} />
            EMERGENCY RESPONSE
          </div>

          <h2>Emergency Mobility</h2>

          <p>
            Ambulance priority and green corridor status
          </p>
        </div>
      </div>

      <div className="simulation-control-body">
        <div className="controller-display">
          <Ambulance size={20} />

          <div>
            <strong>AMB_001</strong>
            <small>Emergency vehicle</small>
          </div>
        </div>

        <div className="control-block">
          <div className="control-label">
            <Clock3 size={15} />

            <div>
              <strong>Travel Time</strong>
              <span>29s → 18s with priority</span>
            </div>
          </div>
        </div>

        <div className="control-block">
          <div className="control-label">
            <ShieldCheck size={15} />

            <div>
              <strong>Waiting Time</strong>
              <span>7s → 0s with priority</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmergencyPanel;