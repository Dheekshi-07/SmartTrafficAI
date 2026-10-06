from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class QueueComparisonItem(BaseModel):
    Controller: str
    Average_Queue: float
    Maximum_Queue: int
    Queue_Std_Dev: float

class TripMetricsItem(BaseModel):
    controller: str
    vehicles_completed: int
    avg_travel_time: float
    avg_waiting_time: float
    avg_time_loss: float

class TrafficComparisonResponse(BaseModel):
    queue_comparison: List[Dict[str, Any]]
    trip_metrics: List[Dict[str, Any]]

class LatestAdaptiveStateResponse(BaseModel):
    step: Optional[int] = 0
    north_queue: Optional[int] = 0
    south_queue: Optional[int] = 0
    east_queue: Optional[int] = 0
    west_queue: Optional[int] = 0
    ns_pressure: Optional[int] = 0
    ew_pressure: Optional[int] = 0
    current_direction: Optional[str] = "NS"
    phase: Optional[int] = 0
