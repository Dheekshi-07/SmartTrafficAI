from pydantic import BaseModel
from typing import Optional

class HealthResponse(BaseModel):
    status: str = "online"
    system: str = "SmartTrafficAI"
    backend: str = "online"
    simulation: str = "available"
    ml_model: str = "loaded"
    arduino: str = "disconnected"
    timestamp: str
