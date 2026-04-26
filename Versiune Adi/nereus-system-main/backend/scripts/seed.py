"""
Seed script — pre-loads 3 satellite alerts + 2 citizen reports for the demo region.
Run manually:  python -m scripts.seed
Also called automatically by app/main.py on first startup (when DB is empty).
"""
from __future__ import annotations

from datetime import datetime, timedelta

from sqlmodel import Session

from app.database import engine
from app.models import Alert, AlertSource, CitizenReport, PollutionType, Severity


_ALERTS = [
    {
        "lat": 45.7552,
        "lon": 21.2847,
        "ndci_max": 0.18,
        "turbidity_max": 1.42,
        "severity": Severity.HIGH,
        "pollution_type": PollutionType.ALGAL_BLOOM,
        "area_ha": 12.4,
        "source": AlertSource.SATELLITE,
        "scene_date": "2025-04-20",
        "description": (
            "High NDCI (0.18) detected east of Timișoara — possible cyanobacterial bloom. "
            "Anomaly spans ~12 ha. Sentinel-2 acquisition 2025-04-20."
        ),
        "days_ago": 5,
    },
    {
        "lat": 45.5512,
        "lon": 21.6471,
        "ndci_max": 0.09,
        "turbidity_max": 1.28,
        "severity": Severity.MEDIUM,
        "pollution_type": PollutionType.TURBIDITY,
        "area_ha": 6.7,
        "source": AlertSource.SATELLITE,
        "scene_date": "2025-04-15",
        "description": (
            "Elevated turbidity proxy (1.28) near Lacul Surduc inlet. "
            "Possible upstream runoff. Sentinel-2 acquisition 2025-04-15."
        ),
        "days_ago": 10,
    },
    {
        "lat": 45.7481,
        "lon": 21.1923,
        "ndci_max": 0.04,
        "turbidity_max": 1.19,
        "severity": Severity.LOW,
        "pollution_type": PollutionType.TURBIDITY,
        "area_ha": 3.2,
        "source": AlertSource.SATELLITE,
        "scene_date": "2025-04-10",
        "description": (
            "Low-level turbidity increase on the western Bega stretch. "
            "Possibly post-rain sediment load. Monitoring continues."
        ),
        "days_ago": 15,
    },
]




def seed(session: Session) -> None:
    now = datetime.utcnow()

    for a in _ALERTS:
        alert = Alert(
            timestamp=now - timedelta(days=a["days_ago"]),  # type: ignore[arg-type]
            lat=a["lat"],  # type: ignore[arg-type]
            lon=a["lon"],  # type: ignore[arg-type]
            ndci_max=a["ndci_max"],  # type: ignore[arg-type]
            turbidity_max=a["turbidity_max"],  # type: ignore[arg-type]
            severity=a["severity"],  # type: ignore[arg-type]
            pollution_type=a["pollution_type"],  # type: ignore[arg-type]
            area_ha=a["area_ha"],  # type: ignore[arg-type]
            source=a["source"],  # type: ignore[arg-type]
            scene_date=a["scene_date"],  # type: ignore[arg-type]
            description=a["description"],  # type: ignore[arg-type]
        )
        session.add(alert)

    session.commit()
    print("[Nereus] Demo data seeded: 3 alerts.")


if __name__ == "__main__":
    with Session(engine) as s:
        seed(s)
