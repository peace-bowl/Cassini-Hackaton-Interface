"""API route: Email subscriptions for pollution alerts."""
from __future__ import annotations

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models import Subscriber

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["subscriptions"])


class SubscribeRequest(BaseModel):
    email: str
    name: str | None = None
    home_city: str
    home_lat: float
    home_lon: float
    notification_type: str = "immediate"


@router.post("/subscribe", response_model=Subscriber, status_code=201)
def subscribe(
    payload: SubscribeRequest,
    session: Annotated[Session, Depends(get_session)],
) -> Subscriber:
    stmt = select(Subscriber).where(Subscriber.email == payload.email)
    existing = session.exec(stmt).first()
    if existing:
        existing.active = True
        existing.home_city = payload.home_city
        existing.home_lat = payload.home_lat
        existing.home_lon = payload.home_lon
        existing.notification_type = payload.notification_type
        if payload.name:
            existing.name = payload.name
        session.add(existing)
        session.commit()
        session.refresh(existing)
        logger.info("Reactivated subscriber %s", existing.email)
        return existing

    sub = Subscriber(
        email=payload.email,
        name=payload.name,
        home_city=payload.home_city,
        home_lat=payload.home_lat,
        home_lon=payload.home_lon,
        notification_type=payload.notification_type,
        unsubscribe_token=str(uuid.uuid4()),
    )
    session.add(sub)
    session.commit()
    session.refresh(sub)
    logger.info("New subscriber %s for city %s", sub.email, sub.home_city)
    return sub


@router.delete("/subscribe/{token}")
def unsubscribe(
    token: str,
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, str]:
    stmt = select(Subscriber).where(Subscriber.unsubscribe_token == token)
    sub = session.exec(stmt).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Token not found")
    sub.active = False
    session.add(sub)
    session.commit()
    logger.info("Unsubscribed %s", sub.email)
    return {"message": "Unsubscribed successfully"}


@router.get("/subscribers/count")
def subscriber_count(
    session: Annotated[Session, Depends(get_session)],
) -> dict[str, int]:
    stmt = select(Subscriber).where(Subscriber.active == True)  # noqa: E712
    count = len(session.exec(stmt).all())
    return {"count": count}
