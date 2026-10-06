"""
SmartTrafficAI - Emergency Priority Manager
Handles multiple simultaneous emergency vehicle priority requests, deterministic
conflict resolution, priority scoring, queueing, state transitions, and audit logging.
"""

import os
import csv
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

# Ensure SUMO_HOME is set if available
if "SUMO_HOME" not in os.environ and os.path.exists("/Library/Frameworks/EclipseSUMO.framework/Versions/1.27.1/EclipseSUMO"):
    os.environ["SUMO_HOME"] = "/Library/Frameworks/EclipseSUMO.framework/Versions/1.27.1/EclipseSUMO"

RESULTS_DIR = Path(__file__).resolve().parents[1] / "results"
RESULTS_DIR.mkdir(exist_ok=True)
DEFAULT_LOG_FILE = RESULTS_DIR / "emergency_priority_log.csv"


class EmergencySeverity(str, Enum):
    CRITICAL = "CRITICAL"      # e.g., Cardiac arrest, stroke, severe trauma (Score: 120)
    URGENT = "URGENT"          # e.g., Serious injury, respiratory distress (Score: 80)
    MODERATE = "MODERATE"      # e.g., Stable transfer, minor trauma (Score: 40)


class EmergencyStatus(str, Enum):
    NORMAL = "NORMAL"
    REQUESTED = "REQUESTED"
    QUEUED = "QUEUED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    TIMEOUT = "TIMEOUT"


SEVERITY_WEIGHTS = {
    EmergencySeverity.CRITICAL: 120.0,
    EmergencySeverity.URGENT: 80.0,
    EmergencySeverity.MODERATE: 40.0,
}


class EmergencyRequest:
    def __init__(
        self,
        ambulance_id: str,
        junction_id: str,
        direction: str,
        severity: EmergencySeverity = EmergencySeverity.URGENT,
        distance_meters: float = 200.0,
        eta_seconds: float = 20.0,
        timestamp: float = 0.0,
        route: Optional[List[str]] = None,
    ):
        self.ambulance_id = ambulance_id
        self.junction_id = junction_id
        self.direction = direction  # e.g., "EW", "NS", "W_J1", etc.
        self.severity = EmergencySeverity(severity) if isinstance(severity, str) else severity
        self.distance_meters = float(distance_meters)
        self.eta_seconds = float(eta_seconds)
        self.timestamp = float(timestamp)
        self.route = route or [junction_id]
        self.status = EmergencyStatus.REQUESTED
        self.priority_score = self.compute_priority_score()
        self.created_at = self.timestamp
        self.activated_at: Optional[float] = None
        self.completed_at: Optional[float] = None

    def compute_priority_score(self) -> float:
        """
        Deterministic multi-factor score:
        - Severity Weight (40 - 120)
        - Distance Factor: max(0, 100 - (distance / 5)) (0 - 100)
        - ETA Factor: max(0, 60 - eta) (0 - 60)
        - Timestamp Tie-breaker: earlier requests have slight priority
        """
        sev_wt = SEVERITY_WEIGHTS.get(self.severity, 60.0)
        dist_factor = max(0.0, 100.0 - (self.distance_meters / 5.0))
        eta_factor = max(0.0, 60.0 - self.eta_seconds)
        tie_breaker = 1000.0 / (self.timestamp + 10.0)

        score = (sev_wt * 1.5) + dist_factor + eta_factor + tie_breaker
        return round(score, 2)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ambulance_id": self.ambulance_id,
            "junction": self.junction_id,
            "direction": self.direction,
            "severity": self.severity.value,
            "distance_meters": self.distance_meters,
            "eta_seconds": self.eta_seconds,
            "priority_score": self.priority_score,
            "status": self.status.value,
            "timestamp": self.timestamp,
        }


class EmergencyPriorityManager:
    """
    Deterministic arbiter for emergency green corridor requests.
    Enforces that conflicting movements never both receive green signals.
    Queues competing emergencies and activates the highest priority corridor first.
    """

    def __init__(self, log_filepath: Optional[Path] = None):
        self.log_filepath = log_filepath or DEFAULT_LOG_FILE
        self.active_requests: Dict[str, EmergencyRequest] = {}   # ambulance_id -> EmergencyRequest
        self.queued_requests: Dict[str, EmergencyRequest] = {}   # ambulance_id -> EmergencyRequest
        self.completed_requests: List[EmergencyRequest] = []
        self.audit_log: List[Dict[str, Any]] = []

        self._ensure_log_file()

    def _ensure_log_file(self):
        if not self.log_filepath.exists():
            with open(self.log_filepath, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([
                    "timestamp",
                    "ambulance_id",
                    "junction",
                    "priority",
                    "status",
                    "action",
                    "reason"
                ])

    def log_event(
        self,
        ambulance_id: str,
        junction: str,
        priority: float,
        status: EmergencyStatus,
        action: str,
        reason: str,
        timestamp: float,
    ):
        event = {
            "timestamp": round(timestamp, 2),
            "ambulance_id": ambulance_id,
            "junction": junction,
            "priority": round(priority, 2),
            "status": status.value if hasattr(status, "value") else str(status),
            "action": action,
            "reason": reason
        }
        self.audit_log.append(event)

        with open(self.log_filepath, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                event["timestamp"],
                event["ambulance_id"],
                event["junction"],
                event["priority"],
                event["status"],
                event["action"],
                event["reason"],
            ])

    def request_priority(
        self,
        ambulance_id: str,
        junction_id: str,
        direction: str,
        severity: EmergencySeverity = EmergencySeverity.URGENT,
        distance_meters: float = 200.0,
        eta_seconds: float = 20.0,
        timestamp: float = 0.0,
        route: Optional[List[str]] = None,
    ) -> EmergencyRequest:
        """
        Submit an emergency green priority request.
        Validates request parameters, scores priority, and arbitrates conflicts.
        """
        # Input validation
        if not ambulance_id or not junction_id:
            raise ValueError("Ambulance ID and Junction ID must not be empty")
        if distance_meters < 0 or eta_seconds < 0:
            raise ValueError("Distance and ETA must be non-negative")

        # Check if already active or queued
        if ambulance_id in self.active_requests:
            req = self.active_requests[ambulance_id]
            req.junction_id = junction_id
            req.direction = direction
            req.distance_meters = distance_meters
            req.eta_seconds = eta_seconds
            req.timestamp = timestamp
            req.priority_score = req.compute_priority_score()
            self.log_event(
                ambulance_id, junction_id, req.priority_score,
                req.status, "UPDATE", "Updated location and metrics for active emergency", timestamp
            )
            return req

        request = EmergencyRequest(
            ambulance_id=ambulance_id,
            junction_id=junction_id,
            direction=direction,
            severity=severity,
            distance_meters=distance_meters,
            eta_seconds=eta_seconds,
            timestamp=timestamp,
            route=route,
        )

        # Check for conflict with existing active requests
        conflict, conflicting_req = self._detect_conflict(request)

        if not conflict:
            # No conflict: activate immediately
            request.status = EmergencyStatus.ACTIVE
            request.activated_at = timestamp
            self.active_requests[ambulance_id] = request
            self.log_event(
                ambulance_id, junction_id, request.priority_score,
                EmergencyStatus.ACTIVE, "ACTIVATE",
                "No active conflict found; green corridor corridor granted", timestamp
            )
        else:
            # Conflict found: compare priority scores
            if request.priority_score > conflicting_req.priority_score:
                # Preempt existing active request to queue
                conflicting_req.status = EmergencyStatus.QUEUED
                del self.active_requests[conflicting_req.ambulance_id]
                self.queued_requests[conflicting_req.ambulance_id] = conflicting_req
                self.log_event(
                    conflicting_req.ambulance_id, conflicting_req.junction_id,
                    conflicting_req.priority_score, EmergencyStatus.QUEUED,
                    "PREEMPT_TO_QUEUE",
                    f"Preempted by higher priority request {ambulance_id} ({request.priority_score} vs {conflicting_req.priority_score})",
                    timestamp
                )

                request.status = EmergencyStatus.ACTIVE
                request.activated_at = timestamp
                self.active_requests[ambulance_id] = request
                self.log_event(
                    ambulance_id, junction_id, request.priority_score,
                    EmergencyStatus.ACTIVE, "ACTIVATE_PREEMPTIVE",
                    f"Granted priority over {conflicting_req.ambulance_id} due to higher score",
                    timestamp
                )
            else:
                # Place new request in queue
                request.status = EmergencyStatus.QUEUED
                self.queued_requests[ambulance_id] = request
                self.log_event(
                    ambulance_id, junction_id, request.priority_score,
                    EmergencyStatus.QUEUED, "QUEUE",
                    f"Conflict with active request {conflicting_req.ambulance_id}; queued until cleared",
                    timestamp
                )

        return request

    def _detect_conflict(self, request: EmergencyRequest) -> Tuple[bool, Optional[EmergencyRequest]]:
        """
        Detect if request conflicts with any currently active emergency.
        Conflicts occur if:
        1. Both vehicles are at the same junction with different directions.
        """
        for active in self.active_requests.values():
            if active.junction_id == request.junction_id:
                if active.direction != request.direction:
                    return True, active
        return False, None

    def complete_emergency(
        self,
        ambulance_id: str,
        timestamp: float,
        reason: str = "Vehicle cleared intersection"
    ):
        """
        Mark an emergency request as completed and activate the next queued emergency.
        """
        req = self.active_requests.pop(ambulance_id, None)
        if not req:
            req = self.queued_requests.pop(ambulance_id, None)

        if req:
            req.status = EmergencyStatus.COMPLETED
            req.completed_at = timestamp
            self.completed_requests.append(req)
            self.log_event(
                ambulance_id, req.junction_id, req.priority_score,
                EmergencyStatus.COMPLETED, "COMPLETE", reason, timestamp
            )

        # Check queue to promote next highest priority
        self._promote_next_queued(timestamp)

    def cancel_emergency(
        self,
        ambulance_id: str,
        timestamp: float,
        reason: str = "Operator or system cancellation"
    ):
        """Cancel an active or queued emergency request."""
        req = self.active_requests.pop(ambulance_id, None)
        if not req:
            req = self.queued_requests.pop(ambulance_id, None)

        if req:
            req.status = EmergencyStatus.CANCELLED
            req.completed_at = timestamp
            self.completed_requests.append(req)
            self.log_event(
                ambulance_id, req.junction_id, req.priority_score,
                EmergencyStatus.CANCELLED, "CANCEL", reason, timestamp
            )

        self._promote_next_queued(timestamp)

    def check_timeouts(self, current_timestamp: float, timeout_seconds: float = 120.0):
        """Handle timeout edge cases where a vehicle stalled or disappeared."""
        timed_out = []
        for amb_id, req in list(self.active_requests.items()):
            elapsed = current_timestamp - (req.activated_at or req.timestamp)
            if elapsed > timeout_seconds:
                timed_out.append(amb_id)

        for amb_id in timed_out:
            req = self.active_requests.pop(amb_id)
            req.status = EmergencyStatus.TIMEOUT
            req.completed_at = current_timestamp
            self.completed_requests.append(req)
            self.log_event(
                amb_id, req.junction_id, req.priority_score,
                EmergencyStatus.TIMEOUT, "TIMEOUT",
                f"Exceeded active allowance of {timeout_seconds}s without clearance",
                current_timestamp
            )

        if timed_out:
            self._promote_next_queued(current_timestamp)

    def _promote_next_queued(self, timestamp: float):
        """Select the highest priority queued request and activate it if no conflict exists."""
        if not self.queued_requests:
            return

        sorted_queue = sorted(
            self.queued_requests.values(),
            key=lambda r: r.priority_score,
            reverse=True
        )

        for candidate in sorted_queue:
            conflict, _ = self._detect_conflict(candidate)
            if not conflict:
                del self.queued_requests[candidate.ambulance_id]
                candidate.status = EmergencyStatus.ACTIVE
                candidate.activated_at = timestamp
                self.active_requests[candidate.ambulance_id] = candidate
                self.log_event(
                    candidate.ambulance_id, candidate.junction_id,
                    candidate.priority_score, EmergencyStatus.ACTIVE,
                    "PROMOTE_FROM_QUEUE",
                    "Active conflict resolved; queued emergency activated",
                    timestamp
                )
                break

    def get_status_summary(self) -> Dict[str, Any]:
        return {
            "total_active": len(self.active_requests),
            "total_queued": len(self.queued_requests),
            "total_completed": len(self.completed_requests),
            "active_emergencies": [r.to_dict() for r in self.active_requests.values()],
            "queued_emergencies": [r.to_dict() for r in self.queued_requests.values()],
            "completed_emergencies": [r.to_dict() for r in self.completed_requests[-5:]],
        }
