import pytest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from controllers.emergency_priority_manager import (
    EmergencyPriorityManager,
    EmergencySeverity,
    EmergencyStatus,
    EmergencyRequest
)

def test_single_emergency_request(tmp_path):
    log_file = tmp_path / "test_log.csv"
    manager = EmergencyPriorityManager(log_filepath=log_file)
    
    req = manager.request_priority(
        ambulance_id="AMB_001",
        junction_id="J1",
        direction="EW",
        severity=EmergencySeverity.CRITICAL,
        distance_meters=100.0,
        eta_seconds=10.0,
        timestamp=0.0
    )
    
    assert req.status == EmergencyStatus.ACTIVE
    assert req.priority_score > 200.0
    assert "AMB_001" in manager.active_requests

def test_conflicting_emergency_arbitration(tmp_path):
    log_file = tmp_path / "test_log.csv"
    manager = EmergencyPriorityManager(log_filepath=log_file)
    
    # 1. First ambulance: Urgent (lower score)
    req1 = manager.request_priority(
        ambulance_id="AMB_001",
        junction_id="J1",
        direction="EW",
        severity=EmergencySeverity.MODERATE,
        distance_meters=200.0,
        eta_seconds=25.0,
        timestamp=10.0
    )
    assert req1.status == EmergencyStatus.ACTIVE
    
    # 2. Second ambulance: Critical (higher score) at same junction conflicting direction
    req2 = manager.request_priority(
        ambulance_id="AMB_002",
        junction_id="J1",
        direction="NS",
        severity=EmergencySeverity.CRITICAL,
        distance_meters=50.0,
        eta_seconds=5.0,
        timestamp=12.0
    )
    
    # req2 should preempt req1 to QUEUED
    assert req2.status == EmergencyStatus.ACTIVE
    assert manager.queued_requests["AMB_001"].status == EmergencyStatus.QUEUED
    
    # 3. Complete AMB_002 -> AMB_001 should be promoted to ACTIVE
    manager.complete_emergency("AMB_002", timestamp=20.0)
    assert "AMB_001" in manager.active_requests
    assert manager.active_requests["AMB_001"].status == EmergencyStatus.ACTIVE

def test_non_conflicting_different_junctions(tmp_path):
    log_file = tmp_path / "test_log.csv"
    manager = EmergencyPriorityManager(log_filepath=log_file)
    
    # AMB_001 at J1 and AMB_002 at J2 can both be ACTIVE simultaneously
    req1 = manager.request_priority("AMB_001", "J1", "EW", EmergencySeverity.CRITICAL, 100, 10, 0.0)
    req2 = manager.request_priority("AMB_002", "J2", "NS", EmergencySeverity.URGENT, 120, 12, 1.0)
    
    assert req1.status == EmergencyStatus.ACTIVE
    assert req2.status == EmergencyStatus.ACTIVE
    assert len(manager.active_requests) == 2
    assert len(manager.queued_requests) == 0

def test_emergency_cancellation(tmp_path):
    log_file = tmp_path / "test_log.csv"
    manager = EmergencyPriorityManager(log_filepath=log_file)
    
    manager.request_priority("AMB_001", "J1", "EW", EmergencySeverity.URGENT, 100, 10, 0.0)
    manager.cancel_emergency("AMB_001", timestamp=5.0, reason="False alarm")
    
    assert "AMB_001" not in manager.active_requests
    assert len(manager.completed_requests) == 1
    assert manager.completed_requests[0].status == EmergencyStatus.CANCELLED

def test_emergency_timeout(tmp_path):
    log_file = tmp_path / "test_log.csv"
    manager = EmergencyPriorityManager(log_filepath=log_file)
    
    manager.request_priority("AMB_001", "J1", "EW", EmergencySeverity.URGENT, 100, 10, 0.0)
    manager.check_timeouts(current_timestamp=200.0, timeout_seconds=120.0)
    
    assert "AMB_001" not in manager.active_requests
    assert manager.completed_requests[0].status == EmergencyStatus.TIMEOUT

def test_invalid_request_inputs(tmp_path):
    log_file = tmp_path / "test_log.csv"
    manager = EmergencyPriorityManager(log_filepath=log_file)
    
    with pytest.raises(ValueError):
        manager.request_priority("", "J1", "EW")
    
    with pytest.raises(ValueError):
        manager.request_priority("AMB_001", "", "EW")
        
    with pytest.raises(ValueError):
        manager.request_priority("AMB_001", "J1", "EW", distance_meters=-10)
