"""API route: Monitoring Zones CRUD."""
from __future__ import annotations

import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import MonitoringZone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/zones", tags=["zones"])


class CreateZoneRequest(BaseModel):
    name: str
    geometry_geojson: str  # GeoJSON polygon as string
    created_by_email: str | None = None


@router.post("/", response_model=MonitoringZone, status_code=201)
def create_zone(
    payload: CreateZoneRequest,
    session: Annotated[Session, Depends(get_session)],
) -> MonitoringZone:
    try:
        from shapely.geometry import shape
        geojson = json.loads(payload.geometry_geojson)
        polygon = shape(geojson)
        centroid = polygon.centroid
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid GeoJSON polygon: {exc}")

    zone = MonitoringZone(
        name=payload.name,
        geometry_geojson=payload.geometry_geojson,
        centroid_lat=centroid.y,
        centroid_lon=centroid.x,
        created_by_email=payload.created_by_email,
    )
    session.add(zone)
    session.commit()
    session.refresh(zone)
    logger.info("Created monitoring zone '%s' (id=%s)", zone.name, zone.id)
    return zone


@router.get("/", response_model=list[MonitoringZone])
def list_zones(
    session: Annotated[Session, Depends(get_session)],
) -> list[MonitoringZone]:
    stmt = select(MonitoringZone).where(MonitoringZone.active == True)  # noqa: E712
    return list(session.exec(stmt).all())


@router.delete("/{zone_id}")
def delete_zone(
    zone_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    zone = session.get(MonitoringZone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    zone.active = False
    session.add(zone)
    session.commit()
    logger.info("Deactivated monitoring zone '%s' (id=%s)", zone.name, zone.id)
    return {"message": "Zone deactivated"}
