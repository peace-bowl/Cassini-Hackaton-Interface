# 🌊 The Nereus System

**Water Pollution Early-Warning System** — [CASSINI Hackathon "Space for Water"](https://www.cassini.eu/hackathons), Challenge #2: Tracking and Preventing Water Pollution.

> Automated near-real-time detection of water pollution events on the **Bega river / Lacul Surduc** near Timișoara, Romania, using **Copernicus Sentinel-2** satellite imagery and **Galileo GNSS** citizen reporting.

---

## Screenshots

| Welcome Screen | Dashboard — Live Alerts | Report Modal (Galileo GNSS) |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CASSINI Space Assets                  │
│  Sentinel-2 L2A (Copernicus)    Galileo GNSS (browser)  │
└──────────────┬──────────────────────────┬───────────────┘
               │ openEO                   │ navigator.geolocation
               ▼                          ▼
┌─────────────────────────┐   ┌───────────────────────────┐
│   FastAPI Backend       │   │   Vite + React Frontend    │
│                         │   │                            │
│  satellite.py           │   │  MapLibre GL JS map        │
│  ├─ NDWI water mask     │◄──│  ├─ Alert markers          │
│  ├─ NDCI (algal bloom)  │   │  ├─ Heatmap overlay        │
│  └─ Turbidity index     │   │  ├─ Time slider            │
│                         │   │  └─ Report modal           │
│  anomaly.py             │   │                            │
│  └─ scipy connected     │──►│  TanStack Query polling    │
│     components          │   │  Zustand UI state          │
│                         │   │                            │
│  SQLite (alerts/reports)│   │  Static JSON fallback      │
└─────────────────────────┘   └───────────────────────────┘
         :8000                          :5173
```

---

## Data Sources

### Sentinel-2 L2A — Copernicus Data Space Ecosystem

| Band | Wavelength | Use |
|------|-----------|-----|
| B03 | 560 nm (Green) | NDWI denominator, turbidity baseline |
| B04 | 665 nm (Red) | NDCI denominator, turbidity numerator |
| B05 | 705 nm (Red-Edge) | NDCI numerator — chlorophyll-a proxy |
| B08 | 842 nm (NIR) | NDWI numerator — water vs land separation |

**Spectral indices:**

```
# NDWI (McFeeters 1996) — water mask
NDWI = (B03 − B08) / (B03 + B08)    threshold: > 0.2 → water pixel

# NDCI (Mishra & Mishra 2012) — algal bloom / chlorophyll-a proxy
NDCI = (B05 − B04) / (B05 + B04)    threshold: > 0.0 → potential bloom

# Turbidity proxy — red/green ratio (simple but effective for hackathon scope)
TURB = B04 / B03                     threshold: > 1.15 → elevated turbidity
```

Anomalous connected components are identified with `scipy.ndimage.label`. Each cluster > 0.5 ha becomes one `Alert` record. Severity: < 2 ha → LOW, 2–10 ha → MEDIUM, > 10 ha → HIGH.

### Galileo / GNSS — Citizen Reports

Citizens submit geotagged pollution observations via the browser. The `navigator.geolocation` API uses all available GNSS systems (Galileo, GPS, GLONASS) on modern devices. The reported GNSS accuracy in metres is stored with each report and shown in the UI.

---

## Local Setup

```bash
# 1. Clone
git clone <your-repo-url>
cd Cassini

# 2. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
cp .env.example .env            # edit CDSE_USERNAME / CDSE_PASSWORD if needed
uvicorn app.main:app --reload --port 8000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The app starts with `NEREUS_OFFLINE_MODE=true` (set in `.env.example`), so **no Copernicus credentials are required for the demo**.

---

## Copernicus Data Space Ecosystem Credentials

To use live Sentinel-2 data instead of the synthetic demo scene:

1. Register free at **https://dataspace.copernicus.eu/** (EU/EEA residents — use your institutional email for faster approval)
2. In `backend/.env`:
   ```
   CDSE_USERNAME=your_email@example.com
   CDSE_PASSWORD=your_password
   NEREUS_OFFLINE_MODE=false
   ```
3. Pre-cache a demo scene (optional, for offline use):
   ```bash
   cd backend
   python ../demo-data/cache_demo_scene.py
   ```
4. Restart the backend — `POST /api/scan` will now download a real Sentinel-2 scene.

The first connection triggers an OIDC device-flow login; subsequent requests use the cached refresh token.

---

## Deploy

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
# Set env var: VITE_API_BASE_URL=https://nereus-system.fly.dev
```

`frontend/vercel.json` handles SPA routing rewrites automatically.

### Backend → Fly.io

```bash
cd backend
fly auth login
fly apps create nereus-system
fly secrets set CDSE_USERNAME=your@email.com CDSE_PASSWORD=yourpassword
fly volumes create nereus_data --size 1 --region fra
fly deploy
```

`backend/fly.toml` targets `fra` (Frankfurt) for lowest latency to Romania. A persistent 1 GB volume keeps SQLite and the scene cache across restarts.

---

## Roadmap / Future Work

- **Physical sensors** — integrate ANAR / Apele Române in-water sensor network (conductivity, pH, dissolved oxygen) via their open API
- **Galileo OSNMA** — authenticated positioning to prevent spoofed citizen reports; verify GNSS authenticity at report submission time
- **ML classification** — train a lightweight CNN on labelled Sentinel-2 patches to classify pollution types beyond NDCI/turbidity thresholds
- **ANAR / Apele Române integration** — cross-reference satellite detections with official discharge permits and industrial facility locations
- **SMS/push alerts** — notify local authorities and registered citizens when HIGH severity events are detected
- **Sentinel-3 OLCI** — coarser resolution but daily revisit for turbidity tracking on larger water bodies (Dunăre, Mureș)
- **Multi-temporal change detection** — compare successive scenes to track pollution spread velocity

---

## Team

| Name | Role |
|------|------|
| *(your name)* | Full-stack / ML |
| *(teammate)* | Remote sensing / GIS |
| *(teammate)* | UX / Presentation |

---

## License

MIT © 2025 The Nereus Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
