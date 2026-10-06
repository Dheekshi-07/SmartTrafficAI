from fastapi import APIRouter
from app.schemas.traffic import TrafficComparisonResponse, LatestAdaptiveStateResponse
from app.services.traffic_service import (
    get_queue_comparison,
    get_trip_metrics,
    get_latest_adaptive_state,
)

router = APIRouter(
    prefix="/api/traffic",
    tags=["Traffic"]
)


@router.get("/comparison", response_model=TrafficComparisonResponse)
def traffic_comparison():
    """Retrieve comparative benchmark metrics between Fixed-time and Adaptive controllers."""
    return {
        "queue_comparison": get_queue_comparison(),
        "trip_metrics": get_trip_metrics()
    }


@router.get("/latest", response_model=LatestAdaptiveStateResponse)
def latest_traffic_state():
    """Fetch the most recent real-time simulation step queue pressures and signal phase."""
    return get_latest_adaptive_state()
