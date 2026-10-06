from fastapi import APIRouter
from app.schemas.ml import MLMetricsResponse
from app.services.ml_service import get_ml_metrics

router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)


@router.get("/metrics", response_model=MLMetricsResponse)
def ml_metrics():
    """Trained Random Forest evaluation metrics on test dataset."""
    return get_ml_metrics()
