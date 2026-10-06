from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class EmergencyStatusResponse(BaseModel):
    ambulance_id: str
    system: str
    status: str
    active_corridor: Optional[str] = None
    target_hospital: Optional[str] = "Pune General Hospital"

class EmergencyComparisonResponse(BaseModel):
    ambulance_metrics: List[Dict[str, Any]]

class EmergencyPriorityResponse(BaseModel):
    total_active: int
    total_queued: int
    total_completed: int
    active_emergencies: List[Dict[str, Any]]
    queued_emergencies: List[Dict[str, Any]]
    completed_emergencies: List[Dict[str, Any]]
