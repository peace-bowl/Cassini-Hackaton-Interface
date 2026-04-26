"""
Generates a synthetic 4-band Sentinel-2 stub scene (scene_stub.tif) over the Bega
demo region, saved to demo-data/. Run once:  python demo-data/generate_stub.py

Requires: numpy, rasterio
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.transform import from_bounds

BBOX = (21.20, 45.74, 21.30, 45.77)   # west, south, east, north
NX, NY = 80, 60                         # pixels
OUT_PATH = Path(__file__).parent / "scene_stub.tif"


def main() -> None:
    west, south, east, north = BBOX
    transform = from_bounds(west, south, east, north, NX, NY)
    rng = np.random.default_rng(42)

    # Reflectance arrays (scale factor 10 000 → int16 storage)
    b03 = (rng.uniform(0.04, 0.08, (NY, NX)) * 10_000).astype(np.int16)
    b04 = (rng.uniform(0.02, 0.05, (NY, NX)) * 10_000).astype(np.int16)
    b05 = (rng.uniform(0.03, 0.06, (NY, NX)) * 10_000).astype(np.int16)
    b08 = (rng.uniform(0.01, 0.03, (NY, NX)) * 10_000).astype(np.int16)

    # Inject an algal bloom hotspot
    hx, hy = int(NX * 0.7), int(NY * 0.4)
    for dy in range(-5, 6):
        for dx in range(-5, 6):
            iy, ix = hy + dy, hx + dx
            if 0 <= iy < NY and 0 <= ix < NX:
                w = int(800 * np.exp(-(dx ** 2 + dy ** 2) / 10.0))
                b05[iy, ix] = min(b05[iy, ix] + w, 32767)
                b04[iy, ix] = min(b04[iy, ix] + w // 2, 32767)

    with rasterio.open(
        OUT_PATH,
        "w",
        driver="GTiff",
        height=NY,
        width=NX,
        count=4,
        dtype=np.int16,
        crs=CRS.from_epsg(4326),
        transform=transform,
        compress="lzw",
    ) as dst:
        dst.write(b03, 1)   # Band 1 → B03 (Green)
        dst.write(b04, 2)   # Band 2 → B04 (Red)
        dst.write(b05, 3)   # Band 3 → B05 (Red-Edge)
        dst.write(b08, 4)   # Band 4 → B08 (NIR)
        dst.update_tags(
            scene_date="2025-04-20",
            source="synthetic_stub",
            region="Bega_Timisoara",
        )

    print(f"✅ Stub scene written to {OUT_PATH}")


if __name__ == "__main__":
    main()
