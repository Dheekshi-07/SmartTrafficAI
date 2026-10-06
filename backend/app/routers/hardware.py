from fastapi import APIRouter
from app.schemas.hardware import HardwareStatusResponse
from app.services.hardware_service import get_hardware_status

router = APIRouter(
    prefix="/api/hardware",
    tags=["Hardware"]
)


@router.get("/status", response_model=HardwareStatusResponse)
def hardware_status():
    """Current connection telemetry of Arduino serial interface."""
    return get_hardware_status()
