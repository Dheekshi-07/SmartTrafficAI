# Design Thinking Framework — SmartTrafficAI

## 1. Executive Summary
SmartTrafficAI was engineered following the standard 5-stage **Design Thinking Methodology**:
**Empathize → Define → Ideate → Prototype → Test**.

---

## 2. Five Stages of Design Thinking

### Stage 1: Empathize
We analyzed the operational challenges faced by key urban mobility stakeholders in dense metropolitan corridors (e.g., Pune, India):
* **Emergency Medical Technicians & Ambulance Drivers**: Critical patients experience lethal delays in static intersection queues where civilian vehicles cannot clear space.
* **Daily Commuters & Public Bus Transit**: Fixed-timer traffic lights grant identical green intervals to empty lanes while congested arteries back up for hundreds of meters.
* **Municipal Traffic Police & Operators**: Manual manual intervention (hand-waving / override boxes) is labor-intensive, reactive, uncoordinated across multi-junction grids, and lacks predictive foresight.

---

### Stage 2: Define (Problem Statement)
> *"How might we design a decentralized yet coordinated traffic control system that dynamically adjusts signal timing to eliminate unnecessary vehicle idling, while autonomously orchestrating conflict-free preemptive green corridors for emergency medical services without creating catastrophic gridlock on cross-streets?"*

#### Key Identified Bottlenecks:
1. **Static Inflexibility**: Pre-timed signals cause high average waiting times ($> 12.75\text{ s/vehicle}$) during non-uniform arrival peaks.
2. **Emergency Preemption Deficit**: Ambulances face average waiting delays ($> 12.75\text{ s}$ per intersection) without automated green wave coordination.
3. **Simultaneous Emergency Conflicts**: Lack of deterministic arbitration when two emergency vehicles approach intersecting corridors simultaneously.

---

### Stage 3: Ideate (Solution Concepts)
We explored alternative technological approaches:
1. **Approach A (Deep Q-Learning / RL Control)**: Highly dynamic, but black-box nature raises safety concerns in urban transit and lacks determinism during emergency preemption.
2. **Approach B (Hybrid ML Demand Prediction + Rule-Based Queue Pressure + Deterministic Arbiter)**: **Selected Strategy**.
   * Machine learning (Random Forest) forecasts 5-minute traffic trends ($R^2 = 0.9364$).
   * Real-time pressure balancing optimizes green phase durations within strict safety bounds ($[15\text{s}, 60\text{s}]$).
   * Deterministic Priority Manager calculates severity-weighted scores to arbitrate conflicting emergency vehicles safely.

---

### Stage 4: Prototype (Iterative Engineering Architecture)
The ideated concepts were engineered into four concrete, testable artifacts:
1. **Simulation Prototype (SUMO + TraCI)**: Realized single-junction and 3-junction linear corridor (`corridor.net.xml`).
2. **Software Backend Prototype (FastAPI)**: Modular REST API exposing real-time simulation metrics, ML predictions, and priority states.
3. **User Dashboard Prototype (React + Vite + Recharts)**: Polished dark-mode engineering console visualizing real-time queue states, green wave progression, and conflict logs.
4. **Physical Actuation Prototype (Arduino Uno + 3-LED Miniature Signal)**: C++ firmware running on ATmega328P with non-blocking ASCII command/ACK serial communication.

---

### Stage 5: Test (Validation & Empirical Benchmarking)
* **Automated Regression Suite**: 25 automated pytest test cases covering bounds, priority scoring, serial validation, and API schemas.
* **Multi-Seed Simulation Benchmarks**: Evaluated across 5 random seeds:
  * 60.4% average queue length reduction ($5.43 \rightarrow 2.15$ vehicles).
  * 61.9% average waiting time reduction ($12.75\text{s} \rightarrow 4.86\text{s}$).
  * 100% emergency waiting time elimination for prioritized ambulance ($12.75\text{s} \rightarrow 0.00\text{s}$).
* **Hardware & User Protocol**: Built automated serial reliability testing script and structured user testing evaluation protocol.
