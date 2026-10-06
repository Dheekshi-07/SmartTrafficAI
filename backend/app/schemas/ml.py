from pydantic import BaseModel
from typing import Optional

class MLMetricsResponse(BaseModel):
    model: str
    target: str
    test_samples: int
    mae: float
    rmse: float
    r2_score: float
    baseline_mae: float
    baseline_rmse: float
    mae_improvement_pct: float
    rmse_improvement_pct: float
