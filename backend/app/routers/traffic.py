from fastapi import APIRouter

from app.services.traffic_service import (
    get_queue_comparison,
    get_trip_metrics,
    get_latest_adaptive_state,
)

router = APIRouter(
    prefix="/api/traffic",
    tags=["Traffic"]
)


@router.get("/comparison")
def traffic_comparison():
    return {
        "queue_comparison": get_queue_comparison(),
        "trip_metrics": get_trip_metrics()
    }


@router.get("/latest")
def latest_traffic_state():
    return get_latest_adaptive_state()