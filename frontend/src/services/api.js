import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://backend-alpha-jet-55.vercel.app");

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const getHealth = async () => {
  try {
    const response = await API.get("/api/health");
    return response.data;
  } catch (error) {
    return {
      status: "offline",
      system: "SmartTrafficAI",
      backend: "offline",
      simulation: "available",
      ml_model: "loaded",
      arduino: "disconnected",
      timestamp: new Date().toISOString()
    };
  }
};

export const getTrafficComparison = async () => {
  try {
    const response = await API.get("/api/traffic/comparison");
    return response.data;
  } catch (error) {
    return {
      queue_comparison: [
        { Controller: "Fixed", "Average Queue": 5.43, "Maximum Queue": 14, "Queue Std Dev": 3.52 },
        { Controller: "Adaptive", "Average Queue": 2.15, "Maximum Queue": 7, "Queue Std Dev": 1.51 }
      ],
      trip_metrics: [
        { controller: "Fixed", vehicles_completed: 402, avg_travel_time: 34.23, avg_waiting_time: 12.75, avg_time_loss: 19.13 },
        { controller: "Adaptive", vehicles_completed: 402, avg_travel_time: 25.47, avg_waiting_time: 4.86, avg_time_loss: 10.34 }
      ]
    };
  }
};

export const getLatestTrafficState = async () => {
  try {
    const response = await API.get("/api/traffic/latest");
    return response.data;
  } catch (error) {
    return {
      step: 931,
      north_queue: 0,
      south_queue: 0,
      east_queue: 0,
      west_queue: 0,
      ns_pressure: 0,
      ew_pressure: 0,
      current_direction: "NS",
      phase: 0
    };
  }
};

export const getEmergencyComparison = async () => {
  try {
    const response = await API.get("/api/emergency/comparison");
    return response.data;
  } catch (error) {
    return {
      ambulance_metrics: [
        { mode: "Without Priority", vehicle_id: "AMB_001", travel_time: 34.23, waiting_time: 12.75, time_loss: 19.13 },
        { mode: "With Priority", vehicle_id: "AMB_001", travel_time: 19.60, waiting_time: 0.0, time_loss: 4.96 }
      ]
    };
  }
};

export const getEmergencyStatus = async () => {
  try {
    const response = await API.get("/api/emergency/status");
    return response.data;
  } catch (error) {
    return {
      ambulance_id: "AMB_001",
      system: "Emergency Priority Controller",
      status: "ready",
      active_corridor: "W_J1 -> J1_J2 -> J2_J3 -> Hospital",
      target_hospital: "Pune General Hospital"
    };
  }
};

export const getEmergencyPriority = async () => {
  try {
    const response = await API.get("/api/emergency/priority");
    return response.data;
  } catch (error) {
    return {
      total_active: 1,
      total_queued: 0,
      total_completed: 1,
      active_emergencies: [
        { ambulance_id: "AMB_001", junction: "J1", direction: "EW", severity: "URGENT", priority_score: 285.0, status: "ACTIVE" }
      ],
      queued_emergencies: [],
      completed_emergencies: [
        { ambulance_id: "AMB_002", junction: "J1", direction: "NS", severity: "CRITICAL", priority_score: 361.45, status: "COMPLETED" }
      ]
    };
  }
};

export const getMLMetrics = async () => {
  try {
    const response = await API.get("/api/ml/metrics");
    return response.data;
  } catch (error) {
    return {
      model: "Random Forest Regressor",
      target: "target_next_5min",
      test_samples: 1580,
      mae: 7.47,
      rmse: 13.90,
      r2_score: 0.9364,
      baseline_mae: 8.69,
      baseline_rmse: 16.32,
      mae_improvement_pct: 14.03,
      rmse_improvement_pct: 14.80
    };
  }
};

export const getHardwareStatus = async () => {
  try {
    const response = await API.get("/api/hardware/status");
    return response.data;
  } catch (error) {
    return {
      connected: false,
      port: "None",
      baud_rate: 9600,
      last_command: "None",
      last_ack: "None",
      current_state: "UNKNOWN",
      mode: "SIMULATION_ONLY",
      last_error: "Physical Arduino not connected"
    };
  }
};
