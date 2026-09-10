// src/components/dashboard/TopBar.jsx

import { Bell, Radio, RefreshCw } from "lucide-react";

function TopBar({
  title = "Traffic Command Center",
  subtitle = "SmartTrafficAI Intelligent Mobility Platform",
  online = true,
  onRefresh,
}) {
  return (
    <header>
      <div>
        <p className="eyebrow">
          SMART CITY MOBILITY PLATFORM
        </p>

        <h1>{title}</h1>

        <p className="header-description">
          {subtitle}
        </p>
      </div>

      <div className="header-actions">
        <div
          className={
            online
              ? "live-status"
              : "live-status offline-status"
          }
        >
          <Radio size={16} />
          {online ? "NETWORK ONLINE" : "OFFLINE"}
        </div>

        <button className="refresh-button">
          <Bell size={16} />
        </button>

        {onRefresh && (
          <button
            className="refresh-button"
            onClick={onRefresh}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        )}
      </div>
    </header>
  );
}

export default TopBar;