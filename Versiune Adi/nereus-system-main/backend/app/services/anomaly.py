"""
Anomaly detection: identify polluted water pixels and produce alert records.

Uses scipy.ndimage.label to find connected components (blobs) of anomalous pixels.
Each blob above the minimum area threshold becomes one Alert record with its own
centroid, area, and peak index values.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Sequence

import numpy as np
from numpy.typing import NDArray

from app.config import settings
from app.models import PollutionType, Severity

logger = logging.getLogger(__name__)

# Pixel resolution assumed when no metadata is available (Sentinel-2 20 m bands)
_DEFAULT_RESOLUTION_M = 20.0
_HA_PER_PIXEL = (_DEFAULT_RESOLUTION_M ** 2) / 10_000  # 0.04 ha


@dataclass
class AnomalyResult:
    lat: float
    lon: float
    ndci_max: float
    turbidity_max: float
    area_ha: float
    severity: Severity
    pollution_type: PollutionType
    pixel_count: int


def _severity(area_ha: float, ndci_max: float) -> Severity:
    """Area-based severity mirrors the spec: <2 ha low, 2-10 medium, >10 high."""
    if area_ha > 10 or ndci_max > 0.15:
        return Severity.HIGH
    if area_ha > 2 or ndci_max > 0.05:
        return Severity.MEDIUM
    return Severity.LOW


def _pollution_type(ndci_max: float, turb_max: float) -> PollutionType:
    if ndci_max > settings.ndci_threshold:
        return PollutionType.ALGAL_BLOOM
    if turb_max > settings.turbidity_threshold:
        return PollutionType.TURBIDITY
    return PollutionType.OTHER


def detect_anomalies(
    ndci: NDArray,
    turbidity: NDArray,
    mask: NDArray,
    lats: NDArray,
    lons: NDArray,
    resolution_m: float = _DEFAULT_RESOLUTION_M,
) -> list[AnomalyResult]:
    """
    Find connected anomalous water pixels using scipy connected-component labelling.

    A pixel is anomalous when it is within the water mask AND either:
      - NDCI > ndci_threshold  (algal bloom proxy)
      - turbidity > turbidity_threshold  (turbidity proxy)

    Each connected component > min_anomaly_area_ha becomes one AnomalyResult.
    Falls back to single-region summary if scipy is unavailable.
    """
    anomaly_mask: NDArray = mask & (
        (ndci > settings.ndci_threshold) | (turbidity > settings.turbidity_threshold)
    )

    if not anomaly_mask.any():
        return []

    ha_per_pixel = (resolution_m ** 2) / 10_000

    try:
        from scipy.ndimage import label as ndimage_label  # type: ignore
        labelled, num_features = ndimage_label(anomaly_mask)
        logger.debug("Found %d connected anomaly blobs.", num_features)
        return _process_blobs(labelled, num_features, ndci, turbidity, lats, lons, ha_per_pixel)
    except ImportError:
        logger.warning("scipy not available — falling back to single-region anomaly summary.")
        return _single_region(anomaly_mask, ndci, turbidity, lats, lons, ha_per_pixel)


def _process_blobs(
    labelled: NDArray,
    num_features: int,
    ndci: NDArray,
    turbidity: NDArray,
    lats: NDArray,
    lons: NDArray,
    ha_per_pixel: float,
) -> list[AnomalyResult]:
    results: list[AnomalyResult] = []
    for blob_id in range(1, num_features + 1):
        pixels = labelled == blob_id
        area_ha = float(pixels.sum()) * ha_per_pixel
        if area_ha < settings.min_anomaly_area_ha:
            continue

        ndci_vals = ndci[pixels]
        turb_vals = turbidity[pixels]
        ndci_max = float(ndci_vals.max())
        turb_max = float(turb_vals.max())

        results.append(AnomalyResult(
            lat=float(lats[pixels].mean()),
            lon=float(lons[pixels].mean()),
            ndci_max=ndci_max,
            turbidity_max=turb_max,
            area_ha=round(area_ha, 2),
            severity=_severity(area_ha, ndci_max),
            pollution_type=_pollution_type(ndci_max, turb_max),
            pixel_count=int(pixels.sum()),
        ))
    return results


def _single_region(
    anomaly_mask: NDArray,
    ndci: NDArray,
    turbidity: NDArray,
    lats: NDArray,
    lons: NDArray,
    ha_per_pixel: float,
) -> list[AnomalyResult]:
    """Fallback: treat all anomalous pixels as a single region."""
    area_ha = float(anomaly_mask.sum()) * ha_per_pixel
    if area_ha < settings.min_anomaly_area_ha:
        return []
    ndci_max = float(ndci[anomaly_mask].max())
    turb_max = float(turbidity[anomaly_mask].max())
    return [AnomalyResult(
        lat=float(lats[anomaly_mask].mean()),
        lon=float(lons[anomaly_mask].mean()),
        ndci_max=ndci_max,
        turbidity_max=turb_max,
        area_ha=round(area_ha, 2),
        severity=_severity(area_ha, ndci_max),
        pollution_type=_pollution_type(ndci_max, turb_max),
        pixel_count=int(anomaly_mask.sum()),
    )]
