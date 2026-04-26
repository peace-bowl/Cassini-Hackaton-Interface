# demo-data/

This directory holds offline demo assets for The Nereus System.

## Contents

| File | Description |
|------|-------------|
| `bega_aoi.geojson` | AOI bounding polygons for Bega Canal and Lacul Surduc |
| `cache_demo_scene.py` | One-time script to fetch a real Sentinel-2 scene from CDSE |
| `sentinel2_demo_scene.tif` | *(not in git — fetch with the script below)* |

## Fetching the real demo GeoTIFF

```bash
# 1. Set your CDSE credentials in backend/.env
cp backend/.env.example backend/.env
# Edit CDSE_USERNAME and CDSE_PASSWORD

# 2. Run from the repo root
cd backend
python ../demo-data/cache_demo_scene.py
```

The script downloads one cloud-free composite over the Bega Canal (April 2024) and saves
`sentinel2_demo_scene.tif` (~30 MB). The backend picks it up automatically when
`NEREUS_OFFLINE_MODE=false` and the openEO call fails, or you can point `DEMO_DATA_PATH`
to it directly.

## Why not commit the GeoTIFF?

Sentinel-2 GeoTIFFs are large (30–200 MB). They are excluded by `.gitignore`.
The synthetic fallback in `backend/app/services/copernicus.py` generates plausible
demo data at runtime with no downloads needed.
