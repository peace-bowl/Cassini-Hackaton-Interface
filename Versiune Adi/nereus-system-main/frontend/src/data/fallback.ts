/**
 * Static fallback seed data — displayed when the backend API is unreachable.
 * Mirrors the data seeded by backend/scripts/seed.py so the frontend
 * always has something meaningful to show even without a running backend.
 */

import type { Alert, CitizenReport } from '../types'

const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString()

export const FALLBACK_ALERTS: Alert[] = [
  {
    id: 1,
    timestamp: daysAgo(5),
    lat: 45.7552,
    lon: 21.2847,
    ndci_max: 0.18,
    turbidity_max: 1.42,
    severity: 'HIGH',
    pollution_type: 'ALGAL_BLOOM',
    area_ha: 12.4,
    source: 'satellite',
    scene_date: '2025-04-20',
    description:
      'High NDCI (0.18) detected east of Timișoara — possible cyanobacterial bloom. Anomaly spans ~12 ha. Sentinel-2 acquisition 2025-04-20.',
  },
  {
    id: 2,
    timestamp: daysAgo(10),
    lat: 45.5512,
    lon: 21.6471,
    ndci_max: 0.09,
    turbidity_max: 1.28,
    severity: 'MEDIUM',
    pollution_type: 'TURBIDITY',
    area_ha: 6.7,
    source: 'satellite',
    scene_date: '2025-04-15',
    description:
      'Elevated turbidity proxy (1.28) near Lacul Surduc inlet. Possible upstream runoff. Sentinel-2 acquisition 2025-04-15.',
  },
  {
    id: 3,
    timestamp: daysAgo(15),
    lat: 45.7481,
    lon: 21.1923,
    ndci_max: 0.04,
    turbidity_max: 1.19,
    severity: 'LOW',
    pollution_type: 'TURBIDITY',
    area_ha: 3.2,
    source: 'satellite',
    scene_date: '2025-04-10',
    description:
      'Low-level turbidity increase on the western Bega stretch. Possibly post-rain sediment load. Monitoring continues.',
  },
]

export const FALLBACK_REPORTS: CitizenReport[] = [
  {
    id: 1,
    timestamp: daysAgo(3),
    lat: 45.7527,
    lon: 21.2651,
    pollution_type: 'CHEMICAL',
    description:
      'Dark oily discharge observed near the industrial outfall. Strong chemical odour. Reported via Galileo GNSS positioning.',
    photo_url: null,
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: 2,
    timestamp: daysAgo(7),
    lat: 45.7583,
    lon: 21.1972,
    pollution_type: 'FOAM',
    description:
      'Thick white foam accumulation on the canal surface, extending ~200 m downstream. Likely detergent origin.',
    photo_url: null,
    upvotes: 0,
    downvotes: 0,
  },
]

export const FALLBACK_HEATMAP = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [21.2847, 45.7552] },
      properties: { pollution: 0.85 },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [21.6471, 45.5512] },
      properties: { pollution: 0.65 },
    },
  ],
}
