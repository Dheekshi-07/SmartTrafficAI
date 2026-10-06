from fastapi import APIRouter
from app.schemas.emergency import (
    EmergencyComparisonResponse,
    EmergencyStatusResponse,
    EmergencyPriorityResponse
)
from app.services.emergency_service import (
    get_ambulance_metrics,
    get_emergency_priority_state
)

router = APIRouter(
    prefix="/api/emergency",
    tags=["Emergency"]
)


@router.get("/comparison", response_model=EmergencyComparisonResponse)
def emergency_comparison():
    """Fetch travel time and waiting time comparison for emergency vehicles."""
    return {
        "ambulance_metrics": get_ambulance_metrics()
    }


@router.get("/status", response_model=EmergencyStatusResponse)
def emergency_status():
    """Current real-time operational status of the emergency corridor system."""
    return {
        "ambulance_id": "AMB_001",
        "system": "Emergency Priority Controller",
        "status": "ready",
        "active_corridor": "W_J1 -> J1_J2 -> J2_J3 -> Hospital",
        "target_hospital": "Pune General Hospital"
    }


@router.get("/priority", response_model=EmergencyPriorityResponse)
def emergency_priority():
    """Multi-emergency arbitration state with active, queued, and completed queues."""
    return get_emergency_priority_state()
