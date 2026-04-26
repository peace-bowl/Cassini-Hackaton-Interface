"""
GET /api/health

Returns system health status including whether the Copernicus Data Space
Ecosystem openEO backend is reachable and authenticated.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/health", tags=["health"])


def _check_copernicus() -> bool:
    """
    Attempt a lightweight connection to the CDSE openEO backend.
    Returns True if the endpoint is reachable (no auth required for capabilities).
    """
    try:
        import httpx
        resp = httpx.get(
            "https://openeo.dataspace.copernicus.eu/openeo/1.2/",
            timeout=5.0,
        )
        return resp.status_code == 200
    except Exception as exc:
        logger.debug("Copernicus health check failed: %s", exc)
        return False


@router.get("/")
def health() -> dict:
    """
    Returns:
        status: always "ok" (if this endpoint responds, the API is up)
        copernicus: True if openEO CDSE backend is reachable
        version: API version string
    """
    copernicus_ok = _check_copernicus()
    return {
        "status": "ok",
        "system": "Nereus",
        "version": "1.0.0",
        "copernicus": copernicus_ok,
        "mode": "offline/demo" if not copernicus_ok else "live",
    }
