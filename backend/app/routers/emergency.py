from fastapi import APIRouter

from app.services.traffic_service import get_ambulance_metrics

router = APIRouter(
    prefix="/api/emergency",
    tags=["Emergency"]
)


@router.get("/comparison")
def emergency_comparison():
    return {
        "ambulance_metrics": get_ambulance_metrics()
    }


@router.get("/status")
def emergency_status():
    return {
        "ambulance_id": "AMB_001",
        "system": "Emergency Priority Controller",
        "status": "ready"
    }