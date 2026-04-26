"""API route: GET /api/alerts"""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import Alert

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("/", response_model=list[Alert])
def list_alerts(
    session: Annotated[Session, Depends(get_session)],
    limit: int = Query(default=50, le=200),
    severity: str | None = Query(default=None),
) -> list[Alert]:
    """Return recent satellite alerts, newest first. Optionally filter by severity."""
    stmt = select(Alert).order_by(Alert.timestamp.desc()).limit(limit)  # type: ignore[arg-type]
    alerts = session.exec(stmt).all()

    if severity:
        alerts = [a for a in alerts if a.severity.value == severity.upper()]

    return list(alerts)
