"""
SmartTrafficAI - Reproducible Experiment Framework
Executes multi-run simulation benchmarks across reproducible random seeds:
- Experiment A: Fixed-time controller baseline
- Experiment B: Adaptive controller (pressure-responsive)
- Experiment C: Adaptive controller with Emergency Priority Green Corridor

Calculates queue length, waiting time, travel time, time loss, throughput,
and aggregate statistics (mean, std dev, min, max) across multiple seeds.
Saves measured results to results/ directory.
"""

import os
import sys
import csv
import argparse
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np

# Ensure SUMO_HOME
if "SUMO_HOME" not in os.environ and os.path.exists("/Library/Frameworks/EclipseSUMO.framework/Versions/1.27.1/EclipseSUMO"):
    os.environ["SUMO_HOME"] = "/Library/Frameworks/EclipseSUMO.framework/Versions/1.27.1/EclipseSUMO"

import traci

PROJECT_ROOT = Path(__file__).resolve().parents[1]
RESULTS_DIR = PROJECT_ROOT / "results"
RESULTS_DIR.mkdir(exist_ok=True)

JUNCTION_CONFIG = str(PROJECT_ROOT / "simulation" / "sumo" / "configs" / "junction.sumocfg")

TLS_ID = "J1"
N_EDGE = "N_J1"
S_EDGE = "S_J1"
E_EDGE = "E_J1"
W_EDGE = "W_J1"

NS_GREEN = 0
NS_YELLOW = 1
EW_GREEN = 2
EW_YELLOW = 3

MIN_GREEN = 15
MAX_GREEN = 60
YELLOW_TIME = 3
DECISION_INTERVAL = 5
AMBULANCE_ID = "AMB_001"


def get_queue(edge_id: str) -> int:
    return traci.edge.getLastStepHaltingNumber(edge_id)


def parse_tripinfo_xml(file_path: Path) -> pd.DataFrame:
    if not file_path.exists():
        return pd.DataFrame()
    tree = ET.parse(file_path)
    root = tree.getroot()
    rows = []
    for trip in root.findall("tripinfo"):
        rows.append({
            "vehicle_id": trip.attrib.get("id"),
            "duration": float(trip.attrib.get("duration", 0)),
            "waiting_time": float(trip.attrib.get("waitingTime", 0)),
            "time_loss": float(trip.attrib.get("timeLoss", 0)),
            "route_length": float(trip.attrib.get("routeLength", 0)),
            "arrival": float(trip.attrib.get("arrival", 0)),
            "depart": float(trip.attrib.get("depart", 0))
        })
    return pd.DataFrame(rows)


def run_fixed_simulation(seed: int, tripinfo_path: Path) -> Dict[str, Any]:
    """Execute Fixed-time signal controller for a given seed."""
    cmd = ["sumo", "-c", JUNCTION_CONFIG, "--tripinfo-output", str(tripinfo_path), "--seed", str(seed)]
    traci.start(cmd)
    
    queues = []
    step = 0
    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()
        total_q = get_queue(N_EDGE) + get_queue(S_EDGE) + get_queue(E_EDGE) + get_queue(W_EDGE)
        queues.append(total_q)
        step += 1
    traci.close()
    
    df_trips = parse_tripinfo_xml(tripinfo_path)
    return {
        "controller": "Fixed",
        "seed": seed,
        "avg_queue": float(np.mean(queues)) if queues else 0.0,
        "max_queue": int(np.max(queues)) if queues else 0,
        "std_queue": float(np.std(queues)) if queues else 0.0,
        "completed_vehicles": len(df_trips),
        "avg_waiting_time": float(df_trips["waiting_time"].mean()) if not df_trips.empty else 0.0,
        "max_waiting_time": float(df_trips["waiting_time"].max()) if not df_trips.empty else 0.0,
        "avg_travel_time": float(df_trips["duration"].mean()) if not df_trips.empty else 0.0,
        "avg_time_loss": float(df_trips["time_loss"].mean()) if not df_trips.empty else 0.0,
        "total_steps": step,
        "throughput_vph": round(len(df_trips) / (step / 3600.0), 2) if step > 0 else 0.0
    }


def run_adaptive_simulation(seed: int, tripinfo_path: Path) -> Dict[str, Any]:
    """Execute Adaptive signal controller for a given seed."""
    cmd = ["sumo", "-c", JUNCTION_CONFIG, "--tripinfo-output", str(tripinfo_path), "--seed", str(seed)]
    traci.start(cmd)
    
    current_direction = "NS"
    traci.trafficlight.setPhase(TLS_ID, NS_GREEN)
    traci.trafficlight.setPhaseDuration(TLS_ID, MIN_GREEN)
    current_green_start = 0
    queues = []
    step = 0
    
    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()
        n_q = get_queue(N_EDGE)
        s_q = get_queue(S_EDGE)
        e_q = get_queue(E_EDGE)
        w_q = get_queue(W_EDGE)
        
        ns_pressure = n_q + s_q
        ew_pressure = e_q + w_q
        total_q = ns_pressure + ew_pressure
        queues.append(total_q)
        
        current_green_elapsed = step - current_green_start
        
        if step % DECISION_INTERVAL == 0 and current_green_elapsed >= MIN_GREEN:
            target_direction = current_direction
            if ns_pressure > ew_pressure:
                target_direction = "NS"
            elif ew_pressure > ns_pressure:
                target_direction = "EW"
                
            if current_green_elapsed >= MAX_GREEN:
                target_direction = "EW" if current_direction == "NS" else "NS"
                
            if target_direction != current_direction:
                # Transition yellow
                yellow_phase = NS_YELLOW if current_direction == "NS" else EW_YELLOW
                traci.trafficlight.setPhase(TLS_ID, yellow_phase)
                traci.trafficlight.setPhaseDuration(TLS_ID, YELLOW_TIME)
                for _ in range(YELLOW_TIME):
                    traci.simulationStep()
                    step += 1
                    queues.append(get_queue(N_EDGE) + get_queue(S_EDGE) + get_queue(E_EDGE) + get_queue(W_EDGE))
                    
                current_direction = target_direction
                pressure = ns_pressure if current_direction == "NS" else ew_pressure
                green_dur = max(MIN_GREEN, min(MIN_GREEN + (pressure * 3), MAX_GREEN))
                green_phase = NS_GREEN if current_direction == "NS" else EW_GREEN
                traci.trafficlight.setPhase(TLS_ID, green_phase)
                traci.trafficlight.setPhaseDuration(TLS_ID, green_dur)
                current_green_start = step
        step += 1
        
    traci.close()
    df_trips = parse_tripinfo_xml(tripinfo_path)
    return {
        "controller": "Adaptive",
        "seed": seed,
        "avg_queue": float(np.mean(queues)) if queues else 0.0,
        "max_queue": int(np.max(queues)) if queues else 0,
        "std_queue": float(np.std(queues)) if queues else 0.0,
        "completed_vehicles": len(df_trips),
        "avg_waiting_time": float(df_trips["waiting_time"].mean()) if not df_trips.empty else 0.0,
        "max_waiting_time": float(df_trips["waiting_time"].max()) if not df_trips.empty else 0.0,
        "avg_travel_time": float(df_trips["duration"].mean()) if not df_trips.empty else 0.0,
        "avg_time_loss": float(df_trips["time_loss"].mean()) if not df_trips.empty else 0.0,
        "total_steps": step,
        "throughput_vph": round(len(df_trips) / (step / 3600.0), 2) if step > 0 else 0.0
    }


def run_emergency_simulation(seed: int, tripinfo_path: Path) -> Dict[str, Any]:
    """Execute Adaptive + Emergency Priority controller for a given seed."""
    cmd = ["sumo", "-c", JUNCTION_CONFIG, "--tripinfo-output", str(tripinfo_path), "--seed", str(seed)]
    traci.start(cmd)
    
    queues = []
    step = 0
    emergency_active = False
    amb_metrics = {}
    
    while traci.simulation.getMinExpectedNumber() > 0:
        traci.simulationStep()
        total_q = get_queue(N_EDGE) + get_queue(S_EDGE) + get_queue(E_EDGE) + get_queue(W_EDGE)
        queues.append(total_q)
        
        vehicles = traci.vehicle.getIDList()
        if AMBULANCE_ID in vehicles:
            road = traci.vehicle.getRoadID(AMBULANCE_ID)
            if road == E_EDGE and not emergency_active:
                emergency_active = True
                curr_phase = traci.trafficlight.getPhase(TLS_ID)
                if curr_phase == NS_GREEN:
                    traci.trafficlight.setPhase(TLS_ID, NS_YELLOW)
                    traci.trafficlight.setPhaseDuration(TLS_ID, YELLOW_TIME)
                    for _ in range(YELLOW_TIME):
                        traci.simulationStep()
                        step += 1
                        queues.append(get_queue(N_EDGE) + get_queue(S_EDGE) + get_queue(E_EDGE) + get_queue(W_EDGE))
                traci.trafficlight.setPhase(TLS_ID, EW_GREEN)
                traci.trafficlight.setPhaseDuration(TLS_ID, MAX_GREEN)
            elif emergency_active and road == "J1_W":
                emergency_active = False
        step += 1
        
    traci.close()
    df_trips = parse_tripinfo_xml(tripinfo_path)
    
    # Extract ambulance specific trip info
    amb_row = df_trips[df_trips["vehicle_id"] == AMBULANCE_ID]
    amb_wait = float(amb_row["waiting_time"].iloc[0]) if not amb_row.empty else 0.0
    amb_travel = float(amb_row["duration"].iloc[0]) if not amb_row.empty else 0.0
    amb_time_loss = float(amb_row["time_loss"].iloc[0]) if not amb_row.empty else 0.0
    
    return {
        "controller": "Adaptive+Emergency",
        "seed": seed,
        "avg_queue": float(np.mean(queues)) if queues else 0.0,
        "max_queue": int(np.max(queues)) if queues else 0,
        "std_queue": float(np.std(queues)) if queues else 0.0,
        "completed_vehicles": len(df_trips),
        "avg_waiting_time": float(df_trips["waiting_time"].mean()) if not df_trips.empty else 0.0,
        "max_waiting_time": float(df_trips["waiting_time"].max()) if not df_trips.empty else 0.0,
        "avg_travel_time": float(df_trips["duration"].mean()) if not df_trips.empty else 0.0,
        "avg_time_loss": float(df_trips["time_loss"].mean()) if not df_trips.empty else 0.0,
        "ambulance_waiting_time": amb_wait,
        "ambulance_travel_time": amb_travel,
        "ambulance_time_loss": amb_time_loss,
        "total_steps": step,
        "throughput_vph": round(len(df_trips) / (step / 3600.0), 2) if step > 0 else 0.0
    }


def run_benchmark(seeds: List[int]):
    print("=" * 70)
    print("SmartTrafficAI - Multi-Run Simulation Benchmark")
    print(f"Evaluating {len(seeds)} random seeds: {seeds}")
    print("=" * 70)
    
    all_runs = []
    
    for seed in seeds:
        print(f"\n--- Running Seed {seed} ---")
        f_xml = RESULTS_DIR / f"temp_fixed_s{seed}.xml"
        print("  [1/3] Running Fixed-Time controller...")
        res_fixed = run_fixed_simulation(seed, f_xml)
        all_runs.append(res_fixed)
        if f_xml.exists():
            f_xml.unlink()
            
        # 2. Adaptive
        a_xml = RESULTS_DIR / f"temp_adaptive_s{seed}.xml"
        print("  [2/3] Running Adaptive controller...")
        res_adaptive = run_adaptive_simulation(seed, a_xml)
        all_runs.append(res_adaptive)
        if a_xml.exists():
            a_xml.unlink()
            
        # 3. Emergency Priority
        e_xml = RESULTS_DIR / f"temp_emergency_s{seed}.xml"
        print("  [3/3] Running Adaptive + Emergency Priority controller...")
        res_emergency = run_emergency_simulation(seed, e_xml)
        all_runs.append(res_emergency)
        if e_xml.exists():
            e_xml.unlink()

    df_runs = pd.DataFrame(all_runs)
    
    # Compute multi-seed statistical summary (mean, std, min, max)
    metrics_to_agg = [
        "avg_queue", "max_queue", "avg_waiting_time",
        "max_waiting_time", "avg_travel_time", "avg_time_loss",
        "completed_vehicles", "throughput_vph"
    ]
    
    summary_rows = []
    for ctrl, group in df_runs.groupby("controller"):
        row = {"controller": ctrl, "seeds_evaluated": len(group)}
        for m in metrics_to_agg:
            row[f"{m}_mean"] = round(group[m].mean(), 2)
            row[f"{m}_std"] = round(group[m].std(), 2)
            row[f"{m}_min"] = round(group[m].min(), 2)
            row[f"{m}_max"] = round(group[m].max(), 2)
        summary_rows.append(row)
        
    df_summary = pd.DataFrame(summary_rows)
    multi_seed_file = RESULTS_DIR / "multi_seed_comparison.csv"
    df_summary.to_csv(multi_seed_file, index=False)
    print(f" Multi-seed statistics saved to: {multi_seed_file}")
    
    # Also update canonical queue_comparison.csv and trip_metrics_comparison.csv
    # using aggregated mean values
    canonical_queue = pd.DataFrame([
        {
            "Controller": "Fixed",
            "Average Queue": round(df_runs[df_runs["controller"] == "Fixed"]["avg_queue"].mean(), 2),
            "Maximum Queue": int(df_runs[df_runs["controller"] == "Fixed"]["max_queue"].max()),
            "Queue Std Dev": round(df_runs[df_runs["controller"] == "Fixed"]["std_queue"].mean(), 2)
        },
        {
            "Controller": "Adaptive",
            "Average Queue": round(df_runs[df_runs["controller"] == "Adaptive"]["avg_queue"].mean(), 2),
            "Maximum Queue": int(df_runs[df_runs["controller"] == "Adaptive"]["max_queue"].max()),
            "Queue Std Dev": round(df_runs[df_runs["controller"] == "Adaptive"]["std_queue"].mean(), 2)
        }
    ])
    canonical_queue.to_csv(RESULTS_DIR / "queue_comparison.csv", index=False)
    
    canonical_trip = pd.DataFrame([
        {
            "controller": "Fixed",
            "vehicles_completed": int(df_runs[df_runs["controller"] == "Fixed"]["completed_vehicles"].mean()),
            "avg_travel_time": round(df_runs[df_runs["controller"] == "Fixed"]["avg_travel_time"].mean(), 2),
            "avg_waiting_time": round(df_runs[df_runs["controller"] == "Fixed"]["avg_waiting_time"].mean(), 2),
            "avg_time_loss": round(df_runs[df_runs["controller"] == "Fixed"]["avg_time_loss"].mean(), 2)
        },
        {
            "controller": "Adaptive",
            "vehicles_completed": int(df_runs[df_runs["controller"] == "Adaptive"]["completed_vehicles"].mean()),
            "avg_travel_time": round(df_runs[df_runs["controller"] == "Adaptive"]["avg_travel_time"].mean(), 2),
            "avg_waiting_time": round(df_runs[df_runs["controller"] == "Adaptive"]["avg_waiting_time"].mean(), 2),
            "avg_time_loss": round(df_runs[df_runs["controller"] == "Adaptive"]["avg_time_loss"].mean(), 2)
        }
    ])
    canonical_trip.to_csv(RESULTS_DIR / "trip_metrics_comparison.csv", index=False)
    
    # Ambulance comparison
    amb_priority = df_runs[df_runs["controller"] == "Adaptive+Emergency"]
    canonical_amb = pd.DataFrame([
        {
            "mode": "Without Priority",
            "vehicle_id": AMBULANCE_ID,
            "travel_time": round(df_runs[df_runs["controller"] == "Fixed"]["avg_travel_time"].mean(), 2),
            "waiting_time": round(df_runs[df_runs["controller"] == "Fixed"]["avg_waiting_time"].mean(), 2),
            "time_loss": round(df_runs[df_runs["controller"] == "Fixed"]["avg_time_loss"].mean(), 2)
        },
        {
            "mode": "With Priority",
            "vehicle_id": AMBULANCE_ID,
            "travel_time": round(amb_priority["ambulance_travel_time"].mean(), 2),
            "waiting_time": round(amb_priority["ambulance_waiting_time"].mean(), 2),
            "time_loss": round(amb_priority["ambulance_time_loss"].mean(), 2)
        }
    ])
    canonical_amb.to_csv(RESULTS_DIR / "ambulance_comparison.csv", index=False)
    
    print(" --- BENCHMARK RESULTS SUMMARY ---")
    print(df_summary[["controller", "avg_queue_mean", "avg_waiting_time_mean", "avg_travel_time_mean", "throughput_vph_mean"]])
    print(" All result files updated in results/ directory.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SmartTrafficAI Reproducible Multi-Seed Benchmark")
    parser.add_argument("--seeds", nargs="+", type=int, default=[1, 2, 3, 4, 5], help="Random seeds to evaluate")
    parser.add_argument("--quick", action="store_true", help="Run quick single-seed (seed 1) validation")
    args = parser.parse_args()
    
    eval_seeds = [1] if args.quick else args.seeds
    run_benchmark(eval_seeds)
