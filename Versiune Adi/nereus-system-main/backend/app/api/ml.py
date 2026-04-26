"""
API route: POST /api/ml/analyze

Exposes the Isolation Forest anomaly detection model for direct testing.
Judges can submit spectral index values and see the ML classification.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ml", tags=["ml"])


class MLAnalyzeRequest(BaseModel):
    ndwi: float = 0.6
    ndci: float = -0.15
    turbidity: float = 0.8


class MLAnalyzeResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    confidence: int
    pollution_type: str
    ml_model: str
    features: dict[str, float]


@router.post("/analyze", response_model=MLAnalyzeResponse)
def analyze_pixel(req: MLAnalyzeRequest) -> MLAnalyzeResponse:
    """
    Score a single pixel for pollution anomaly using Isolation Forest.

    Example clean water:  {"ndwi": 0.6, "ndci": -0.15, "turbidity": 0.8}
    Example polluted:     {"ndwi": 0.3, "ndci": 0.12, "turbidity": 2.5}
    """
    from app.ml.anomaly_detector import score_pixel_anomaly

    result = score_pixel_anomaly(
        ndwi=req.ndwi,
        ndci=req.ndci,
        turbidity=req.turbidity,
    )
    logger.info("ML analysis: anomaly=%s confidence=%d", result["is_anomaly"], result["confidence"])
    return MLAnalyzeResponse(**result)
