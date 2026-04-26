"""
cache_demo_scene.py — one-time script to pre-fetch a Sentinel-2 L2A scene
from the Copernicus Data Space Ecosystem and save it as a GeoTIFF for offline demo use.

Usage:
    cd backend
    python ../demo-data/cache_demo_scene.py

Requirements:
    - CDSE_USERNAME and CDSE_PASSWORD set in backend/.env
    - pip install openeo rasterio (already in requirements.txt)

The saved file (demo-data/sentinel2_demo_scene.tif) is used automatically
by the backend when NEREUS_OFFLINE_MODE=false fails or when running offline.
"""
from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

# Add backend to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Demo region: Bega Canal, Timișoara
BBOX = (21.15, 45.72, 21.35, 45.78)   # west, south, east, north
DATE_FROM = "2024-04-01"
DATE_TO   = "2024-04-30"
OUTPUT    = Path(__file__).parent / "sentinel2_demo_scene.tif"
BACKEND_URL = "https://openeo.dataspace.copernicus.eu"


def fetch_and_save() -> None:
    try:
        import openeo
        import rasterio
    except ImportError:
        logger.error("openeo or rasterio not installed. Run: pip install openeo rasterio")
        sys.exit(1)

    username = os.getenv("CDSE_USERNAME", "")
    password = os.getenv("CDSE_PASSWORD", "")
    if not username or not password:
        # Try loading from backend .env
        env_file = Path(__file__).parent.parent / "backend" / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("CDSE_USERNAME="):
                    username = line.split("=", 1)[1].strip()
                if line.startswith("CDSE_PASSWORD="):
                    password = line.split("=", 1)[1].strip()

    if not username or not password:
        logger.error(
            "CDSE credentials not found. Set CDSE_USERNAME and CDSE_PASSWORD "
            "in backend/.env or as environment variables."
        )
        sys.exit(1)

    west, south, east, north = BBOX
    logger.info("Connecting to %s ...", BACKEND_URL)
    conn = openeo.connect(BACKEND_URL)
    conn.authenticate_oidc_client_credentials(
        client_id=username,
        client_secret=password,
    )

    logger.info("Querying SENTINEL2_L2A %s → %s over bbox %s ...", DATE_FROM, DATE_TO, BBOX)
    cube = conn.load_collection(
        "SENTINEL2_L2A",
        spatial_extent={"west": west, "east": east, "south": south, "north": north},
        temporal_extent=[DATE_FROM, DATE_TO],
        bands=["B03", "B04", "B05", "B08"],
        max_cloud_cover=20,
    )
    # Pick least-cloudy composite
    cube = cube.reduce_dimension(dimension="t", reducer="min")

    logger.info("Downloading to %s ...", OUTPUT)
    cube.download(str(OUTPUT), format="GTiff")
    logger.info("Done. File size: %.1f MB", OUTPUT.stat().st_size / 1e6)


if __name__ == "__main__":
    fetch_and_save()
