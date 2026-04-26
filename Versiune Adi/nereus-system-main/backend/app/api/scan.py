"""
API route: POST /api/scan

Orchestrates the full pipeline:
  1. Fetch Sentinel-2 L2A bands (openEO or synthetic fallback)
  2. Compute spectral indices (NDWI, NDCI, turbidity)
  3. Detect anomalies within the water mask
  4. Persist Alert rows for significant anomalies
  5. Return heatmap GeoJSON + alert IDs
"""
from __future__ import annotations

import concurrent.futures
import logging
from datetime import date, timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.models import Alert, AlertSource
from app.services.anomaly import detect_anomalies
from app.services.copernicus import fetch_scene, _synthetic_bands
from app.services.indices import compute_ndci, compute_ndwi, compute_turbidity, water_mask

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scan", tags=["scan"])

# Maximum seconds to wait for the openEO fetch before falling back
_OPENEO_TIMEOUT_S = 120


class ScanRequest(BaseModel):
    west: float = 21.20
    south: float = 45.74
    east: float = 21.30
    north: float = 45.77
    start_date: str = str(date.today() - timedelta(days=10))
    end_date: str = str(date.today())


class ScanResponse(BaseModel):
    scene_date: str
    scene_source: str
    heatmap: dict[str, Any]   # GeoJSON FeatureCollection
    alert_ids: list[int]
    statistics: dict[str, float]


@router.post("/", response_model=ScanResponse)
def run_scan(
    req: ScanRequest,
    session: Annotated[Session, Depends(get_session)],
) -> ScanResponse:
    bbox = (req.west, req.south, req.east, req.north)
    used_demo = False

    if settings.is_demo:
        # Fast path — skip openEO entirely
        logger.info("Demo mode active — using synthetic data (no openEO call).")
        bands = _synthetic_bands(bbox, req.start_date)
        used_demo = True
    else:
        # Attempt openEO with a hard timeout; any failure → synthetic fallback
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                future = pool.submit(
                    fetch_scene,
                    bbox=bbox,
                    start_date=req.start_date,
                    end_date=req.end_date,
                    offline=False,
                )
                bands = future.result(timeout=_OPENEO_TIMEOUT_S)
        except Exception as exc:
            logger.warning(
                "openEO fetch failed or timed out (%s) — falling back to synthetic data.",
                exc,
            )
            bands = _synthetic_bands(bbox, req.start_date)
            used_demo = True

    ndwi = compute_ndwi(bands["b03"], bands["b08"])
    wmask = water_mask(ndwi)
    ndci = compute_ndci(bands["b05"], bands["b04"])
    turb = compute_turbidity(bands["b04"], bands["b03"])

    anomalies = detect_anomalies(
        ndci=ndci,
        turbidity=turb,
        mask=wmask,
        lats=bands["lats"],
        lons=bands["lons"],
    )

    # ── ML anomaly scoring (additive layer) ──────────────────────────────
    # Score each detected anomaly with Isolation Forest for confidence metrics
    ml_results: list[dict] = []
    try:
        from app.ml.anomaly_detector import score_pixel_anomaly
        for a in anomalies:
            ml_result = score_pixel_anomaly(
                ndwi=float(ndwi[wmask].mean()) if wmask.any() else 0.5,
                ndci=float(a.ndci_max),
                turbidity=float(a.turbidity_max),
            )
            ml_results.append(ml_result)
    except Exception as exc:
        logger.warning("ML scoring failed (non-fatal): %s", exc)
        ml_results = [{}] * len(anomalies)

    # Clear existing alerts in this bounding box to prevent duplicates
    stmt = select(Alert).where(
        Alert.lat >= bbox[1],
        Alert.lat <= bbox[3],
        Alert.lon >= bbox[0],
        Alert.lon <= bbox[2],
        Alert.source == AlertSource.SATELLITE,
    )
    old_alerts = session.exec(stmt).all()
    for old in old_alerts:
        session.delete(old)
    session.commit()

    # Persist alerts
    alert_ids: list[int] = []
    for i, a in enumerate(anomalies):
        ml = ml_results[i] if i < len(ml_results) else {}
        alert = Alert(
            lat=a.lat,
            lon=a.lon,
            ndci_max=round(a.ndci_max, 4),
            turbidity_max=round(a.turbidity_max, 4),
            severity=a.severity,
            pollution_type=a.pollution_type,
            area_ha=a.area_ha,
            source=AlertSource.SATELLITE,
            scene_date=bands["scene_date"],
            description=f"Detected via Sentinel-2 scene {bands['scene_date']}. "
                        f"Anomaly area: {a.area_ha} ha.",
            # ML fields (None if ML scoring failed)
            ml_anomaly_score=ml.get("anomaly_score"),
            ml_confidence=ml.get("confidence"),
            ml_pollution_type=ml.get("pollution_type"),
            ml_model=ml.get("ml_model"),
        )
        session.add(alert)
        session.commit()
        session.refresh(alert)
        alert_ids.append(alert.id)  # type: ignore[arg-type]

    heatmap = _build_heatmap_geojson(ndci, turb, wmask, bands["lats"], bands["lons"])

    # ── Email notifications (non-blocking) ────────────────────────────────
    try:
        from app.services.email_service import notify_subscribers_near_alert
        from app.models import MonitoringZone
        from shapely.geometry import shape as shp_shape, Point
        import json as _json

        total_sent = 0
        for aid in alert_ids:
            a_obj = session.get(Alert, aid)
            if not a_obj:
                continue
            alert_dict = {
                "lat": a_obj.lat,
                "lon": a_obj.lon,
                "pollution_type": a_obj.pollution_type.value if hasattr(a_obj.pollution_type, 'value') else str(a_obj.pollution_type),
                "severity": a_obj.severity.value if hasattr(a_obj.severity, 'value') else str(a_obj.severity),
                "area_ha": a_obj.area_ha,
                "ml_confidence": a_obj.ml_confidence,
            }
            total_sent += notify_subscribers_near_alert(alert_dict, session)

            # Check monitoring zones
            alert_point = Point(a_obj.lon, a_obj.lat)
            zone_stmt = select(MonitoringZone).where(MonitoringZone.active == True)  # noqa: E712
            zones = session.exec(zone_stmt).all()
            for zone in zones:
                try:
                    polygon = shp_shape(_json.loads(zone.geometry_geojson))
                    if polygon.contains(alert_point):
                        notify_subscribers_near_alert(alert_dict, session)
                except Exception as ze:
                    logger.warning("Zone check failed for zone %s: %s", zone.id, ze)

        if total_sent > 0:
            logger.info("Sent %d alert email(s) to subscribers.", total_sent)
    except Exception as email_exc:
        logger.warning("Email notification failed (non-fatal): %s", email_exc)

    return ScanResponse(
        scene_date=bands["scene_date"],
        scene_source="synthetic" if used_demo else "copernicus",
        heatmap=heatmap,
        alert_ids=alert_ids,
        statistics={
            "ndci_mean": round(float(ndci[wmask].mean()) if wmask.any() else 0, 4),
            "ndci_max": round(float(ndci[wmask].max()) if wmask.any() else 0, 4),
            "turbidity_mean": round(float(turb[wmask].mean()) if wmask.any() else 0, 4),
            "water_pixels": int(wmask.sum()),
            "anomaly_area_ha": sum(a.area_ha for a in anomalies),
        },
    )


def _build_heatmap_geojson(ndci, turb, wmask, lats, lons) -> dict[str, Any]:
    """Convert 2-D index arrays into a GeoJSON FeatureCollection of points."""
    import numpy as np

    features = []
    it = np.nditer([ndci, turb, wmask, lats, lons])
    for nd, tb, wm, la, lo in it:
        if not wm:
            continue
        # Combined pollution score [0-1] for heatmap weight
        pollution = float(np.clip(float(nd) * 5 + max(0, float(tb) - 1.0) * 2, 0, 1))
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [round(float(lo), 6), round(float(la), 6)]},
            "properties": {
                "ndci": round(float(nd), 4),
                "turbidity": round(float(tb), 4),
                "pollution": round(pollution, 4),
                "water": bool(wm),
            },
        })

    return {"type": "FeatureCollection", "features": features}
