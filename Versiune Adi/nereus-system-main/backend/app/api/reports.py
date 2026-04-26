"""API routes: POST /api/reports  and  GET /api/reports"""
from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import CitizenReport, PollutionType

router = APIRouter(prefix="/api/reports", tags=["reports"])


class ReportCreate(BaseModel):
    """JSON body for creating a citizen report."""
    lat: float
    lon: float
    pollution_type: PollutionType
    description: str
    gnss_accuracy_m: Optional[float] = None
    reporter_name: Optional[str] = None
    image_data: Optional[str] = None


@router.post("/", response_model=CitizenReport, status_code=201)
def create_report(
    body: ReportCreate,
    session: Annotated[Session, Depends(get_session)],
) -> CitizenReport:
    """
    Submit a citizen ground-truth report with Galileo/GNSS coordinates.
    Accepts a JSON body (Content-Type: application/json).
    """
    report = CitizenReport(
        lat=body.lat,
        lon=body.lon,
        pollution_type=body.pollution_type,
        description=body.description,
        reporter_name=body.reporter_name,
        image_data=body.image_data,
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return report


@router.get("/", response_model=list[CitizenReport])
def list_reports(
    session: Annotated[Session, Depends(get_session)],
    limit: int = Query(default=50, le=200),
) -> list[CitizenReport]:
    """Return citizen reports, newest first."""
    stmt = select(CitizenReport).order_by(CitizenReport.timestamp.desc()).limit(limit)  # type: ignore[arg-type]
    return list(session.exec(stmt).all())

from fastapi import HTTPException

@router.post("/{report_id}/upvote", response_model=CitizenReport)
def upvote_report(
    report_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> CitizenReport:
    """Upvote a citizen report."""
    report = session.get(CitizenReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.upvotes += 1
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

@router.post("/{report_id}/downvote", response_model=CitizenReport)
def downvote_report(
    report_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> CitizenReport:
    """Downvote a citizen report."""
    report = session.get(CitizenReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.downvotes += 1
    session.add(report)
    session.commit()
    session.refresh(report)
    return report
