# System Architecture — SmartTrafficAI

## 1. Overview
SmartTrafficAI is a modular, multi-tier intelligent transportation system designed to mitigate urban traffic congestion and establish preemptive green corridors for emergency medical services.

The system integrates five decoupled tiers:
1. **Machine Learning Predictive Layer**: Random Forest regression on historical traffic volume.
2. **Microscopic Simulation & TraCI Control Layer**: SUMO-based multi-junction network with real-time actuation.
3. **Adaptive Signal & Emergency Priority Engine**: Queue-pressure balancing and deterministic emergency conflict arbitration.
4. **FastAPI Application Gateway**: High-throughput REST API serving real-time telemetry and control states.
5. **Physical Hardware Layer**: Arduino Uno microcontroller driving miniature LED traffic signals via non-blocking serial communication.

---

## 2. End-to-End System Pipeline

```mermaid
flowchart TD
    subgraph Data_Layer ["1. Data & Machine Learning Layer"]
        A[Historical Traffic Observations] --> B[Feature Extraction & Lags]
        B --> C[Random Forest Regressor]
        C --> D[Short-Term Demand Predictions]
    end

    subgraph Simulation_Layer ["2. Microscopic Simulation (SUMO + TraCI)"]
        E[SUMO Network & Corridor] --> F[Real-Time Vehicle Induction / Loop Detectors]
        F --> G[TraCI Python Interface]
    end

    subgraph Controller_Layer ["3. Controller & Priority Arbitration"]
        D --> H[Adaptive Controller]
        G --> H
        H --> I{Emergency Vehicle Detected?}
        I -- Yes --> J[Emergency Priority Manager]
        I -- No --> K[Dynamic Phase & Green Duration]
        J --> L[Deterministic Conflict Arbitration & Queue]
        L --> M[Preemptive Green Wave (J1 -> J2 -> J3)]
    end

    subgraph Gateway_Layer ["4. Application Gateway (FastAPI)"]
        K --> N[FastAPI REST API]
        M --> N
        N --> O[React Monitoring Dashboard]
    end

    subgraph Hardware_Layer ["5. Physical Hardware (Arduino Uno)"]
        M --> P[Python Serial Bridge]
        P --> Q[USB Serial Interface (9600 bps)]
        Q --> R[Arduino Uno ATmega328P]
        R --> S[Miniature Signal LEDs (R/Y/G)]
    end
```

---

## 3. Subsystem Architecture

### 3.1. Machine Learning Prediction Layer
* **Model**: `RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)`
* **Input Features**: `hour`, `minute`, `total_vehicles`, `traffic_pressure`, `lag_1`, `lag_2`, `lag_3`, `rolling_mean_3`
* **Target**: `target_next_5min` (predicted vehicle flow in the upcoming 5-minute interval)
* **Dataset**: Pune municipal traffic observations (9,736 training samples, 1,580 testing samples)
* **Performance**: MAE = 7.47, RMSE = 13.90, R² = 0.9364 (14.03% improvement over naive persistence baseline)

### 3.2. Simulation and Control Layer (SUMO + TraCI)
* **Network Topology**:
  * Single junction benchmark: `simulation/sumo/network/junction.net.xml` (J1 with North, South, East, West approaches)
  * Multi-junction green corridor: `simulation/sumo_multi/network/corridor.net.xml` (J1, J2, J3 sequential corridor terminating at hospital approach)
* **Timing Constraints**:
  * Minimum Green Time: $T_{min} = 15\text{ s}$
  * Maximum Green Time: $T_{max} = 60\text{ s}$
  * Yellow Clearance: $T_{yellow} = 3\text{ s}$
  * Decision Interval: $\Delta t = 5\text{ s}$
* **Adaptive Control Law**:
  $$T_{green} = \max(T_{min}, \min(T_{min} + 3 \cdot P, T_{max}))$$
  where $P$ is the halting queue pressure on the competing approach.

### 3.3. Emergency Priority Manager
* **Priority Scoring Formulation**:
  $$S = 1.5 \cdot W_{severity} + \max(0, 100 - 0.2 \cdot D) + \max(0, 60 - \text{ETA}) + \frac{1000}{t + 10}$$
  * $W_{severity} \in \{120, 80, 40\}$ for Critical, Urgent, Moderate cases.
  * $D$: Distance to target intersection in meters.
  * $\text{ETA}$: Estimated arrival time in seconds.
* **Conflict Resolution**:
  * Conflicting simultaneous requests at identical intersections are sequenced deterministically.
  * Active emergency holds green; second request is placed in `QUEUED` state.
  * On clearance, queue automatically promotes the next emergency without human intervention.
* **Audit Logging**: Every transition is serialized to `results/emergency_priority_log.csv`.

### 3.4. Backend API Layer (FastAPI)
* **Endpoints**:
  * `GET /api/health`: System health diagnostic.
  * `GET /api/traffic/comparison`: Baseline vs Adaptive performance comparison.
  * `GET /api/traffic/latest`: Instantaneous simulation queue and phase state.
  * `GET /api/emergency/status`: Active corridor status.
  * `GET /api/emergency/comparison`: Emergency travel and waiting metrics.
  * `GET /api/emergency/priority`: Multi-emergency arbitration queue status.
  * `GET /api/ml/metrics`: Real measured ML performance metrics.
  * `GET /api/hardware/status`: Arduino serial connection diagnostic.

### 3.5. Hardware Interface Layer
* **Microcontroller**: Arduino Uno (ATmega328P @ 16 MHz)
* **Actuation**: 3-LED miniature traffic signal on Digital Pins 8 (Red), 9 (Yellow), 10 (Green)
* **Protocol**: ASCII newline-delimited command-response over USB serial (9600 bps).
* **Fail-Safe Watchdog**: Hardware automatically reverts to safe RED if no serial heartbeat is received for 60 seconds.
