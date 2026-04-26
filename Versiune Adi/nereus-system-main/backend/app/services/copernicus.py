"""
Copernicus Data Space Ecosystem (CDSE) data fetcher.

Primary path : openEO Python client → downloads Sentinel-2 L2A GeoTIFF.
Fallback path: synthetic numpy arrays (demo / offline mode).

Production note: OIDC refresh-token flow is used so the server can authenticate
headlessly. Store CDSE_USERNAME + CDSE_PASSWORD in .env; the first run performs
device-flow auth and caches the refresh token automatically via openeo's keyring.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import TypedDict

import numpy as np
from numpy.typing import NDArray

logger = logging.getLogger(__name__)

OPENEO_BACKEND = "https://openeo.dataspace.copernicus.eu"
DEMO_DATA_DIR = Path(__file__).parent.parent.parent / "demo-data"


class BandArrays(TypedDict):
    b03: NDArray  # Green
    b04: NDArray  # Red
    b05: NDArray  # Red-Edge
    b08: NDArray  # NIR
    lats: NDArray  # 2-D latitude grid
    lons: NDArray  # 2-D longitude grid
    scene_date: str


def _synthetic_bands(bbox: tuple[float, float, float, float], date_str: str) -> BandArrays:
    """
    Generate plausible synthetic band arrays for offline demo.
    Values are seeded by the date so the same date always yields the same scene.
    """
    west, south, east, north = bbox
    ny, nx = 40, 40
    rng = np.random.default_rng(abs(hash(date_str)) % (2 ** 32))

    lons_1d = np.linspace(west, east, nx)
    lats_1d = np.linspace(south, north, ny)
    lons, lats = np.meshgrid(lons_1d, lats_1d)

    # Reflectance values in [0, 1] — clean water has low Red, moderate Green
    b03 = rng.uniform(0.04, 0.08, (ny, nx)).astype(np.float32)
    b04 = rng.uniform(0.02, 0.05, (ny, nx)).astype(np.float32)
    b05 = rng.uniform(0.03, 0.06, (ny, nx)).astype(np.float32)
    b08 = rng.uniform(0.01, 0.03, (ny, nx)).astype(np.float32)

    # Inject a pollution hotspot in the east quadrant of the scene
    hx, hy = int(nx * 0.7), int(ny * 0.4)
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            iy, ix = hy + dy, hx + dx
            if 0 <= iy < ny and 0 <= ix < nx:
                weight = np.exp(-(dx ** 2 + dy ** 2) / 8.0)
                b05[iy, ix] += 0.20 * weight   # huge Red-Edge → NDCI ↑
                b04[iy, ix] += 0.15 * weight   # huge Red    → turbidity ↑

    return BandArrays(
        b03=b03, b04=b04, b05=b05, b08=b08,
        lats=lats.astype(np.float32),
        lons=lons.astype(np.float32),
        scene_date=date_str,
    )


def fetch_scene(
    bbox: tuple[float, float, float, float],
    start_date: str,
    end_date: str,
    offline: bool = False,
) -> BandArrays:
    """
    Fetch Sentinel-2 L2A bands for the given bbox and date range.

    Tries openEO CDSE first; falls back to synthetic data on any failure.
    """
    if offline:
        logger.info("Offline mode — using synthetic demo data.")
        return _synthetic_bands(bbox, start_date)

    try:
        return _fetch_openeo(bbox, start_date, end_date)
    except Exception as exc:
        logger.warning("openEO fetch failed (%s) — falling back to synthetic data.", exc)
        return _synthetic_bands(bbox, start_date)


def _fetch_openeo(
    bbox: tuple[float, float, float, float],
    start_date: str,
    end_date: str,
) -> BandArrays:
    """Download a cloud-free Sentinel-2 L2A scene via the openEO CDSE backend."""
    import tempfile
    from pathlib import Path

    import openeo
    import rasterio

    west, south, east, north = bbox
    conn = openeo.connect(OPENEO_BACKEND)
    
    from app.config import settings
    if settings.cdse_username and settings.cdse_password:
        logger.info("Authenticating openEO with CDSE credentials from config.")
        conn.authenticate_oidc_resource_owner_password_credentials(
            username=settings.cdse_username,
            password=settings.cdse_password,
            client_id="cdse-public"
        )
    else:
        logger.warning("No CDSE credentials found. Attempting device flow authentication (may hang in headless environments).")
        conn.authenticate_oidc()   # Uses cached refresh token after first device-flow login

    cube = conn.load_collection(
        "SENTINEL2_L2A",
        spatial_extent={"west": west, "east": east, "south": south, "north": north},
        temporal_extent=[start_date, end_date],
        bands=["B03", "B04", "B05", "B08"],
        max_cloud_cover=20,
    )

    # Reduce time dimension by picking the least-cloudy scene
    cube = cube.reduce_dimension(dimension="t", reducer="min")

    with tempfile.NamedTemporaryFile(suffix=".tif", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    cube.download(str(tmp_path), format="GTiff")

    with rasterio.open(tmp_path) as src:
        # Bands order: B03=1, B04=2, B05=3, B08=4
        b03 = src.read(1).astype(np.float32) / 10_000  # DN → reflectance
        b04 = src.read(2).astype(np.float32) / 10_000
        b05 = src.read(3).astype(np.float32) / 10_000
        b08 = src.read(4).astype(np.float32) / 10_000

        rows, cols = np.mgrid[0 : src.height, 0 : src.width]
        xs, ys = rasterio.transform.xy(src.transform, rows, cols)
        lons = np.array(xs, dtype=np.float32).reshape((src.height, src.width))
        lats = np.array(ys, dtype=np.float32).reshape((src.height, src.width))

    tmp_path.unlink(missing_ok=True)

    return BandArrays(
        b03=b03, b04=b04, b05=b05, b08=b08,
        lats=lats, lons=lons,
        scene_date=start_date,
    )
