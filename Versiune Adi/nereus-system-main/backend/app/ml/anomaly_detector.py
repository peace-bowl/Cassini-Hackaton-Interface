"""
ML-based anomaly detection using Isolation Forest.

Provides unsupervised anomaly scoring for water quality indices.
The model learns what "normal" water looks like from baseline European
river statistics and flags pixels that deviate significantly.
"""
from __future__ import annotations

import logging
import os

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.joblib")

# Baseline "clean water" statistics for European rivers
# Empirically derived reference values for Sentinel-2 indices
# Source: ESA Sentinel-2 water quality monitoring literature
BASELINE_CLEAN_WATER = np.array([
    # [NDWI, NDCI, turbidity_ratio]
    [0.6, -0.15, 0.8],    # clear deep water
    [0.55, -0.12, 0.85],  # clear shallow water
    [0.5, -0.10, 0.9],    # slightly turbid clean water
    [0.65, -0.18, 0.75],  # very clear water
    [0.45, -0.08, 0.95],  # moderately turbid but unpolluted
    [0.7, -0.20, 0.7],    # pristine water
    [0.52, -0.13, 0.88],  # typical European river baseline
    [0.58, -0.16, 0.82],  # typical canal baseline
])

_model_cache: tuple[IsolationForest, StandardScaler] | None = None


def get_or_train_model() -> tuple[IsolationForest, StandardScaler]:
    """Load existing model or train a new one from baseline data."""
    global _model_cache
    if _model_cache is not None:
        return _model_cache

    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
            logger.info("Loaded existing anomaly detection model")
            _model_cache = (model, scaler)
            return model, scaler
        except Exception:
            logger.warning("Failed to load model, retraining")

    result = train_model()
    _model_cache = result
    return result


def train_model() -> tuple[IsolationForest, StandardScaler]:
    """Train Isolation Forest on clean water baseline data."""
    # Augment baseline with small gaussian noise for robustness
    np.random.seed(42)
    augmented = []
    for sample in BASELINE_CLEAN_WATER:
        for _ in range(20):
            noise = np.random.normal(0, 0.02, size=sample.shape)
            augmented.append(sample + noise)

    X_train = np.array(augmented)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)

    # contamination=0.05 means ~5% of pixels expected to be anomalous
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=1,
    )
    model.fit(X_scaled)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    logger.info("Trained and saved anomaly detection model")
    return model, scaler


def score_pixel_anomaly(ndwi: float, ndci: float, turbidity: float) -> dict:
    """
    Score a single pixel for pollution anomaly.

    Isolation Forest anomaly score:
    - Negative scores = anomalous (the more negative, the worse)
    - Positive scores = normal
    """
    model, scaler = get_or_train_model()

    features = np.array([[ndwi, ndci, turbidity]])
    features_scaled = scaler.transform(features)

    raw_score = model.decision_function(features_scaled)[0]
    prediction = model.predict(features_scaled)[0]  # -1=anomaly, 1=normal

    # Normalize score to 0-100 confidence range
    confidence = min(100, max(0, int((0.5 - raw_score) * 100)))

    is_anomaly = bool(prediction == -1)

    # Classify pollution type based on which index is most deviant
    pollution_type = "normal"
    if is_anomaly:
        if ndci > 0.05:
            pollution_type = "algal_bloom"
        elif turbidity > 1.8:
            pollution_type = "turbidity"
        elif ndci > 0.0 and turbidity > 1.5:
            pollution_type = "organic_contamination"
        else:
            pollution_type = "unknown_anomaly"

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(float(raw_score), 4),
        "confidence": confidence,
        "pollution_type": pollution_type,
        "ml_model": "IsolationForest",
        "features": {
            "ndwi": round(ndwi, 4),
            "ndci": round(ndci, 4),
            "turbidity": round(turbidity, 4),
        },
    }


def score_area_anomaly(
    ndwi_values: list[float],
    ndci_values: list[float],
    turbidity_values: list[float],
) -> dict:
    """
    Score an entire area (list of pixel values) for anomaly.
    Returns aggregate statistics for the area.
    """
    model, scaler = get_or_train_model()

    features = np.array(list(zip(ndwi_values, ndci_values, turbidity_values)))
    if len(features) == 0:
        return {"is_anomaly": False, "anomaly_fraction": 0.0, "confidence": 0}

    features_scaled = scaler.transform(features)
    predictions = model.predict(features_scaled)
    scores = model.decision_function(features_scaled)

    anomaly_fraction = float(np.mean(predictions == -1))
    mean_score = float(np.mean(scores))
    confidence = min(100, max(0, int((0.5 - mean_score) * 100)))

    return {
        "is_anomaly": bool(anomaly_fraction > 0.1),  # >10% anomalous pixels = alert
        "anomaly_fraction": round(anomaly_fraction, 3),
        "anomaly_score": round(mean_score, 4),
        "confidence": confidence,
        "pixel_count": len(features),
        "anomalous_pixel_count": int(np.sum(predictions == -1)),
    }
