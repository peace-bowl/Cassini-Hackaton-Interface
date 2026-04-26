"""FastAPI application entry-point."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import alerts, health, heatmap, reports, scan, ml, zones, subscriptions
from app.config import settings
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise DB and run seed on startup."""
    create_db_and_tables()
    _auto_seed()
    # Pre-train the ML model on startup so first request is fast
    try:
        from app.ml.anomaly_detector import get_or_train_model
        get_or_train_model()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("ML model init failed: %s", exc)
    yield


def _auto_seed() -> None:
    """Run the seed script only if the DB is empty (idempotent)."""
    from sqlmodel import Session, select

    from app.database import engine
    from app.models import Alert

    with Session(engine) as session:
        if session.exec(select(Alert)).first() is None:
            try:
                from scripts.seed import seed  # type: ignore[import]
                seed(session)
            except Exception as exc:  # pragma: no cover
                import logging
                logging.getLogger(__name__).warning("Seed failed: %s", exc)


app = FastAPI(
    title="Nereus System API",
    description="Early-warning water pollution detection — CASSINI Hackathon 2024",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for the demo (production: restrict to Vercel domain)
origins = ["*"] if settings.cors_origins == "*" else settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(scan.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(heatmap.router)
app.include_router(ml.router)
app.include_router(zones.router)
app.include_router(subscriptions.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"status": "ok", "system": "Nereus System", "docs": "/docs"}
