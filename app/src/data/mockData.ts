/**
 * Mock Data Layer for EU Space for Water Dashboard
 * --------------------------------------------------
 * This file contains the typed interface and mock data points
 * for water-related alerts/incidents. Replace the `mockAlerts`
 * array with your real API payload when the backend is ready.
 *
 * Data is centered around Timișoara, Romania (45.7489, 21.2087)
 * and spans a 7-day historical window.
 */

/** Severity levels for water alerts */
export type Severity = 'low' | 'medium' | 'high';

/** Incident types tracked by the system */
export type IncidentType =
  | 'Leak'
  | 'Flood'
  | 'Drought'
  | 'Contamination'
  | 'Soil Moisture Anomaly'
  | 'Infrastructure'
  | 'Other';

/**
 * Core alert data structure.
 * When swapping in real data, ensure your API response
 * matches this shape exactly.
 */
export interface WaterAlert {
  id: string;
  type: IncidentType;
  severity: Severity;
  lat: number;
  lng: number;
  timestamp: string; // ISO 8601 format
  description: string;
  location: string; // Human-readable location name
}

/**
 * Helper: generate a date N days ago from a fixed reference point.
 * Using a fixed reference so data is deterministic.
 */
const REF_DATE = new Date('2026-04-25T12:00:00Z');
function daysAgo(days: number, hours: number = 0): string {
  const d = new Date(REF_DATE);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

/**
 * Mock alert data — 18 points across Timișoara and surroundings.
 * Spread over severity levels and a 7-day window for time slider testing.
 */
export const mockAlerts: WaterAlert[] = [
  {
    id: 'WA-001',
    type: 'Flood',
    severity: 'high',
    lat: 45.7489,
    lng: 21.2087,
    timestamp: daysAgo(0, 2),
    description: 'Flood risk threshold exceeded along Bega Canal. Water level 1.2m above seasonal average.',
    location: 'Bega Canal — City Center',
  },
  {
    id: 'WA-002',
    type: 'Contamination',
    severity: 'high',
    lat: 45.7612,
    lng: 21.2345,
    timestamp: daysAgo(0, 5),
    description: 'Elevated nitrate concentration detected in groundwater sampling well. Exceeds EU Directive 91/676/EEC limits.',
    location: 'Industrial Zone North',
  },
  {
    id: 'WA-003',
    type: 'Soil Moisture Anomaly',
    severity: 'medium',
    lat: 45.7321,
    lng: 21.1893,
    timestamp: daysAgo(1, 3),
    description: 'Anomalous soil moisture detected via Sentinel-2 NDWI analysis. Possible subsurface pipe leak.',
    location: 'Parcul Botanic',
  },
  {
    id: 'WA-004',
    type: 'Leak',
    severity: 'medium',
    lat: 45.7556,
    lng: 21.2298,
    timestamp: daysAgo(1, 8),
    description: 'Suspected water main leak identified via pressure drop sensor. Estimated loss: 400L/hr.',
    location: 'Strada Vasile Alecsandri',
  },
];

/** Get the full time range of the mock data */
export function getTimeRange(alerts: WaterAlert[] = mockAlerts): { start: Date; end: Date } {
  if (alerts.length === 0) {
    return { start: new Date(), end: new Date() };
  }
  const timestamps = alerts.map((a) => new Date(a.timestamp).getTime());
  return {
    start: new Date(Math.min(...timestamps)),
    end: new Date(Math.max(...timestamps)),
  };
}

/** Filter alerts by a target date (show alerts from that day) */
export function filterAlertsByDate(alerts: WaterAlert[], targetDate: Date): WaterAlert[] {
  return alerts.filter((alert) => {
    const alertDate = new Date(alert.timestamp);
    return alertDate <= targetDate;
  });
}

/** Generate realistic mock alerts for a new city's bounding box */
export function generateMockAlertsForCity(
  bbox: { south: number; north: number; west: number; east: number },
  cityName: string
): WaterAlert[] {
  const alerts: WaterAlert[] = [];
  const types: IncidentType[] = ['Leak', 'Flood', 'Contamination', 'Soil Moisture Anomaly', 'Infrastructure'];
  const severities: Severity[] = ['low', 'medium', 'high'];
  // Generate 2-4 random alerts
  const count = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < count; i++) {
    // Random point within bounding box
    const lat = bbox.south + Math.random() * (bbox.north - bbox.south);
    const lng = bbox.west + Math.random() * (bbox.east - bbox.west);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const daysOffset = Math.floor(Math.random() * 7);
    const hoursOffset = Math.floor(Math.random() * 24);
    
    let description = '';
    let location = '';
    
    switch(type) {
      case 'Flood':
        description = 'Water level exceeds seasonal threshold by 0.8m. High risk of embankment breach.';
        location = `${cityName} — River Bank Sector ${Math.floor(Math.random() * 5) + 1}`;
        break;
      case 'Contamination':
        description = 'Elevated heavy metal or nitrate concentration detected in local sampling.';
        location = `${cityName} — Industrial Zone`;
        break;
      case 'Leak':
        description = 'Major subsurface pressure drop detected via acoustic sensors.';
        location = `${cityName} — Urban Sector ${Math.floor(Math.random() * 10) + 1}`;
        break;
      case 'Soil Moisture Anomaly':
        description = 'Anomalous soil moisture levels mapped via Sentinel-2 NDWI over agricultural tract.';
        location = `${cityName} — Outskirts`;
        break;
      default:
        description = 'Infrastructure stress warning due to continuous precipitation and runoff.';
        location = `${cityName} — Regional Drainage Node`;
    }
    
    alerts.push({
      id: `WA-${cityName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      type,
      severity,
      lat,
      lng,
      timestamp: daysAgo(daysOffset, hoursOffset),
      description,
      location,
    });
  }
  
  // Sort by timestamp descending
  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
