from pydantic import BaseModel
from typing import Optional

class HardwareStatusResponse(BaseModel):
    connected: bool
    port: str
    baud_rate: int
    last_command: str
    last_ack: str
    current_state: str
    mode: str
    last_error: Optional[str] = None
