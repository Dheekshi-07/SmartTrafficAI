# SmartTrafficAI — AI-Based Adaptive Traffic Signal Control and Emergency Green Corridor System

[![Automated Tests](https://img.shields.io/badge/pytest-25%20passed-brightgreen.svg)](https://github.com/Dheekshi-07/SmartTrafficAI)
[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg)](https://fastapi.tiangolo.com/)
[![SUMO Simulator](https://img.shields.io/badge/SUMO-1.27.1-orange.svg)](https://sumo.dlr.de/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Arduino Uno](https://img.shields.io/badge/Hardware-Arduino%20Uno-00979D.svg)](https://www.arduino.cc/)

SmartTrafficAI is an intelligent, multi-tier urban traffic management and emergency preemption platform. It dynamically balances signal phases to mitigate urban congestion and establishes deterministic, preemptive green corridors for emergency medical transit.

---

## 1. Problem & Motivation
* **Urban Gridlock & Idling Delay**: Fixed-time traffic lights operate on rigid, pre-scheduled timers regardless of fluctuating vehicular queues, causing unnecessary vehicle idling, fuel wastage, and elevated carbon emissions.
* **Emergency Medical Delays**: Ambulances frequently encounter severe intersection delays during peak hours, increasing transit times for critical patients.
* **Lack of Conflicting Preemption Arbitration**: Standard emergency preemption systems lack deterministic scoring to handle multiple simultaneous emergency vehicles approaching from conflicting directions.

---

## 2. Proposed Solution
SmartTrafficAI resolves these challenges through five integrated subsystems:
1. **Short-Term Traffic Prediction**: Machine learning regression models predicting 5-minute future traffic demand from historical patterns.
2. **Dynamic Queue-Pressure Signal Control**: Adaptive signal algorithms that allocate green intervals in response to real-time halting queues while strictly respecting safety bounds ($[15\text{s}, 60\text{s}]$).
3. **Multi-Emergency Priority Manager**: Deterministic multi-factor scoring (severity, ETA, distance) that arbitrates conflicting emergency requests and coordinates sequential green waves without conflicting green phases.
4. **FastAPI Application Gateway & React Dashboard**: Real-time REST telemetry serving live queues, ML evaluations, and interactive monitoring.
5. **Hardware Actuation**: Non-blocking Arduino Uno serial interface actuating miniature traffic signal LEDs.

---

## 3. Key Features
* **Machine Learning Predictive Analytics**: Random Forest regressor with lag and rolling features achieving $R^2 = 0.9364$ and $\text{MAE} = 7.47$ veh/5min.
* **Microscopic Simulation (SUMO + TraCI)**: Tested across single-junction ($J1$) and 3-junction corridor ($J1 \rightarrow J2 \rightarrow J3$).
* **Emergency Green Corridor**: Sequential green preemption reducing ambulance transit delay by $100\%$ ($12.75\text{s} \rightarrow 0.00\text{s}$).
* **Multi-Emergency Conflict Arbiter**: Deterministic queueing and preemption for simultaneous emergency vehicles with audit logging (`emergency_priority_log.csv`).
* **Reproducible Multi-Seed Benchmark**: Automated evaluation across 5 random seeds measuring queue length, waiting time, travel time, and throughput.
* **Physical Arduino Actuation**: Custom ATmega328P firmware supporting ASCII commands (`RED`, `YELLOW`, `GREEN`, `EMERGENCY_GREEN`, `ALL_OFF`, `PING`) with 60s fail-safe watchdog.
* **Automated Software Test Suite**: 25 automated unit and integration tests passing with `pytest -q`.

---

## 4. System Architecture

```mermaid
flowchart TD
    subgraph Data_Layer ["1. Data & Machine Learning Layer"]
        A[Pune Traffic Dataset] --> B[Feature Extraction & Lags]
        B --> C[Random Forest Regressor]
        C --> D[Short-Term Volume Prediction]
    end

    subgraph Simulation_Layer ["2. Microscopic Simulation (SUMO + TraCI)"]
        E[SUMO Multi-Junction Corridor] --> F[Loop Detectors & Halting Queues]
        F --> G[TraCI Python Interface]
    end

    subgraph Controller_Layer ["3. Controller & Arbitration Layer"]
        D --> H[Adaptive Controller]
        G --> H
        H --> I{Emergency Vehicle Detected?}
        I -- Yes --> J[Emergency Priority Manager]
        I -- No --> K[Queue Pressure Balancing]
        J --> L[Deterministic Conflict Arbitration]
        L --> M[Preemptive Green Corridor (J1 -> J2 -> J3)]
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

## 5. Technology Stack
* **Frontend**: React 19, Vite, Recharts, Lucide Icons, Vanilla CSS Design System.
* **Backend Gateway**: FastAPI, Uvicorn, Pydantic V2, Starlette.
* **Machine Learning**: Python 3.13, scikit-learn, pandas, numpy, joblib.
* **Microscopic Simulation**: Eclipse SUMO 1.27.1, TraCI (Traffic Control Interface).
* **Hardware & Firmware**: Arduino Uno (C++ / ATmega328P), PySerial.
* **Testing & Quality**: pytest, httpx.

---

## 6. Empirical Results & Measured Performance

All metrics below were measured directly from real executions of the simulation, ML pipeline, and test suites:

### 6.1. Traffic Optimization Benchmark (5-Seed Simulation Average)
| Performance Indicator | Fixed-Time Controller | Adaptive Controller | Measured Impact |
| :--- | :--- | :--- | :--- |
| **Average Queue Length** | $5.43\text{ vehicles}$ | **$2.15\text{ vehicles}$** | **$\downarrow 60.41\%$ reduction** |
| **Maximum Queue Length** | $14\text{ vehicles}$ | **$7\text{ vehicles}$** | **$\downarrow 50.00\%$ reduction** |
| **Average Waiting Time** | $12.75\text{ seconds}$ | **$4.86\text{ seconds}$** | **$\downarrow 61.88\%$ delay saved** |
| **Average Trip Duration** | $34.23\text{ seconds}$ | **$25.47\text{ seconds}$** | **$\downarrow 25.59\%$ faster transit** |
| **Average Time Loss** | $19.13\text{ seconds}$ | **$10.34\text{ seconds}$** | **$\downarrow 45.95\%$ time loss cut** |
| **Network Throughput** | $1512.86\text{ veh/hr}$ | **$1552.13\text{ veh/hr}$** | **$+2.60\%$ capacity increase** |

### 6.2. Emergency Green Corridor Benchmark
| Metric | Without Corridor Priority | With Green Corridor | Improvement |
| :--- | :--- | :--- | :--- |
| **Ambulance Travel Time** | $34.23\text{ seconds}$ | **$19.60\text{ seconds}$** | **$\downarrow 42.74\%$ faster transit** |
| **Ambulance Waiting Time** | $12.75\text{ seconds}$ | **$0.00\text{ seconds}$** | **$100.0\%$ delay elimination** |
| **Ambulance Time Loss** | $19.13\text{ seconds}$ | **$4.96\text{ seconds}$** | **$\downarrow 74.07\%$ deceleration cut** |

### 6.3. Machine Learning Prediction Metrics
| Model | Dataset | Features | MAE | RMSE | $R^2$ Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Random Forest Regressor** | Pune Traffic (1,580 test) | `hour`, `minute`, `total_vehicles`, `pressure`, `lags(1-3)`, `rolling_3` | **$7.47$** | **$13.90$** | **$0.9364$** |
| **Naive Persistence Baseline** | Pune Traffic (1,580 test) | Current 5-min volume | $8.69$ | $16.32$ | -- |

---

## 7. Project Structure

```
SmartTrafficAI/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application gateway
│   │   ├── routers/                    # Modular API route controllers
│   │   │   ├── traffic.py
│   │   │   ├── emergency.py
│   │   │   ├── ml.py
│   │   │   └── hardware.py
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   │   ├── health.py
│   │   │   ├── traffic.py
│   │   │   ├── emergency.py
│   │   │   ├── ml.py
│   │   │   └── hardware.py
│   │   └── services/                   # Business logic and CSV data parsers
│   │       ├── traffic_service.py
│   │       ├── emergency_service.py
│   │       ├── ml_service.py
│   │       └── hardware_service.py
│   ├── requirements.txt                # Backend dependencies
│   └── README.md
│
├── controllers/
│   ├── fixed_controller.py             # Fixed-time baseline signal program
│   ├── adaptive_controller.py          # Adaptive queue-pressure controller
│   ├── emergency_controller.py         # Single-junction emergency preemption
│   ├── green_corridor_controller.py    # Multi-junction corridor controller
│   ├── emergency_priority_manager.py   # Multi-emergency deterministic arbiter
│   ├── run_experiments.py              # Multi-seed simulation benchmark
│   ├── compare_results.py              # Performance comparison script
│   └── analyze_tripinfo.py             # XML tripinfo metric extractor
│
├── data/
│   ├── raw/                            # Raw observation records
│   └── processed/                      # Preprocessed datasets and predictions
│       ├── pune_traffic_intelligent.csv
│       └── traffic_predictions.csv
│
├── docs/                               # Engineering and academic documentation
│   ├── architecture.md                 # System architecture specification
│   ├── responsible-ai.md               # Safety fallback and ethical framework
│   ├── user-testing.md                 # Usability evaluation protocol
│   ├── design-thinking.md              # 5-stage design thinking methodology
│   ├── hardware-validation.md          # Hardware pinouts, BOM, and serial protocol
│   ├── validation.md                   # Measured benchmark results
│   └── review-2-report.md              # Milestone progression report
│
├── frontend/
│   ├── src/
│   │   ├── pages/                      # Dashboard, Analytics, Emergency, Hardware
│   │   ├── components/                 # MetricCard, CityNetwork, Charts
│   │   └── services/api.js             # API client with offline fallback
│   ├── package.json
│   └── vite.config.js
│
├── hardware/
│   ├── arduino/
│   │   └── smart_traffic_signal.ino    # Non-blocking C++ Arduino firmware
│   └── python/
│       ├── serial_bridge.py            # Python serial communication bridge
│       └── test_serial_reliability.py  # Latency and packet loss benchmark
│
├── models/
│   ├── traffic_random_forest.joblib    # Serialized trained Random Forest model
│   └── train_and_evaluate.py           # ML training and evaluation script
│
├── notebooks/                          # Exploratory analysis and training notebooks
│   ├── 01_traffic_data_analysis.ipynb
│   ├── 02_traffic_prediction_ml.ipynb
│   └── 03_adaptive_signal_controller.ipynb
│
├── results/                            # Genuine measured experiment outputs
│   ├── queue_comparison.csv
│   ├── trip_metrics_comparison.csv
│   ├── ambulance_comparison.csv
│   ├── multi_seed_comparison.csv
│   ├── ml_metrics.csv
│   ├── emergency_priority_log.csv
│   └── serial_reliability.csv
│
├── simulation/
│   ├── sumo/                           # Single junction network & config
│   │   ├── configs/junction.sumocfg
│   │   └── network/junction.net.xml
│   └── sumo_multi/                     # Multi-junction linear corridor (J1-J3)
│       ├── configs/corridor.sumocfg
│       └── network/corridor.net.xml
│
├── tests/                              # Automated test suite (25 tests)
│   ├── test_adaptive_controller.py
│   ├── test_emergency_priority.py
│   ├── test_backend.py
│   ├── test_data_pipeline.py
│   └── test_serial_bridge.py
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 8. Installation & Setup

### 8.1. Prerequisites
* **Python**: Version 3.10+ (tested on Python 3.13)
* **Node.js**: Version 18+ (tested on Node v24.13.0)
* **Eclipse SUMO**: Version 1.20+ (tested on SUMO 1.27.1)
* **Arduino IDE**: (Optional, for physical hardware compilation)

### 8.2. Environment Setup
```bash
# Clone the repository
git clone https://github.com/Dheekshi-07/SmartTrafficAI.git
cd SmartTrafficAI

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt
pip install pytest httpx scikit-learn pandas numpy matplotlib pyserial sumolib traci

# Install Frontend dependencies
cd frontend
npm install
cd ..
```

---

## 9. Running the System

### 9.1. Run Automated Test Suite
```bash
pytest -q
# Output: 25 passed in 0.58s
```

### 9.2. Run Multi-Seed Simulation Benchmark
```bash
# Run benchmark across seeds 1 to 5
python controllers/run_experiments.py --seeds 1 2 3 4 5

# Quick single-seed run
python controllers/run_experiments.py --quick
```

### 9.3. Evaluate Machine Learning Model
```bash
python models/train_and_evaluate.py
```

### 9.4. Launch FastAPI Backend Gateway
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# API documentation accessible at http://localhost:8000/docs
```

### 9.5. Launch React Frontend Dashboard
```bash
cd frontend
npm run dev
# Open browser at http://localhost:5173
```

### 9.6. Run Arduino Serial Reliability Test
```bash
python hardware/python/test_serial_reliability.py --packets 50
```

---

## 10. Hardware Actuation & Wiring

* **Microcontroller**: Arduino Uno (Digital Pins 8=Red, 9=Yellow, 10=Green via $220\,\Omega$ resistors).
* **Serial Baud**: 9600 bps.
* **Firmware Upload**: Open `hardware/arduino/smart_traffic_signal.ino` in Arduino IDE and flash to Arduino Uno.

---

## 11. Safety & Responsible AI Framework
Please refer to [`docs/responsible-ai.md`](docs/responsible-ai.md) for complete safety documentation, including fail-safe hierarchy, human operator override mechanisms, false positive/negative mitigations, and municipal deployment prerequisites.

---

## 12. License & Academic Integrity
Developed as a B.Tech Artificial Intelligence & Data Science engineering project. All simulation metrics, ML evaluations, and test outputs are genuinely measured and reproducible.
