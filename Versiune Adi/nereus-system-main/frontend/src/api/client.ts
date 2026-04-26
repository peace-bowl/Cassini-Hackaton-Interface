/**
 * Typed fetch wrappers for the Nereus backend API.
 *
 * Exported async functions are used by TanStack Query hooks in hooks/.
 * Base URL from VITE_API_BASE_URL env var (defaults to same origin in prod).
 */

import type { Alert, CitizenReport, HeatmapCollection, ScanResponse, MonitoringZone, Subscriber, MLAnalyzeRequest, MLAnalyzeResponse } from '../types'
import type { BoundingBox } from '../types/geo'

export const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ── Alerts ──────────────────────────────────────────────────────────────────

export async function getAlerts(limit = 50): Promise<Alert[]> {
  const res = await fetch(`${BASE}/api/alerts/?limit=${limit}`)
  return json<Alert[]>(res)
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function getReports(limit = 100): Promise<CitizenReport[]> {
  const res = await fetch(`${BASE}/api/reports/?limit=${limit}`)
  return json<CitizenReport[]>(res)
}

export interface ReportPayload {
  lat: number
  lon: number
  pollution_type: string
  description: string
  photo?: File
  gnss_accuracy_m?: number
  reporter_name?: string
  image_data?: string
}

export async function submitReport(payload: ReportPayload): Promise<CitizenReport> {
  const res = await fetch(`${BASE}/api/reports/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: payload.lat,
      lon: payload.lon,
      pollution_type: payload.pollution_type,
      description: payload.description,
      gnss_accuracy_m: payload.gnss_accuracy_m,
      reporter_name: payload.reporter_name,
      image_data: payload.image_data,
    }),
  })
  return json<CitizenReport>(res)
}

export async function upvoteReport(id: number): Promise<CitizenReport> {
  const res = await fetch(`${BASE}/api/reports/${id}/upvote`, { method: 'POST' })
  return json<CitizenReport>(res)
}

export async function downvoteReport(id: number): Promise<CitizenReport> {
  const res = await fetch(`${BASE}/api/reports/${id}/downvote`, { method: 'POST' })
  return json<CitizenReport>(res)
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

export async function getHeatmap(date: string, bbox?: BoundingBox): Promise<HeatmapCollection> {
  let url = `${BASE}/api/heatmap/?date=${date}`
  if (bbox) {
    url += `&west=${bbox.west}&south=${bbox.south}&east=${bbox.east}&north=${bbox.north}`
  }
  const res = await fetch(url)
  return json<HeatmapCollection>(res)
}

// ── Scan ─────────────────────────────────────────────────────────────────────

export interface ScanRequest {
  west?: number
  south?: number
  east?: number
  north?: number
  start_date?: string
  end_date?: string
}

export async function triggerScan(req: ScanRequest = {}): Promise<ScanResponse> {
  const res = await fetch(`${BASE}/api/scan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  return json<ScanResponse>(res)
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  system: string
  version: string
  copernicus: boolean
  mode: string
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/api/health/`)
  return json<HealthResponse>(res)
}

// ── Zones ────────────────────────────────────────────────────────────────────

export async function getZones(): Promise<MonitoringZone[]> {
  const res = await fetch(`${BASE}/api/zones/`)
  return json<MonitoringZone[]>(res)
}

export interface CreateZonePayload {
  name: string
  geometry_geojson: string
  created_by_email?: string
}

export async function createZone(payload: CreateZonePayload): Promise<MonitoringZone> {
  const res = await fetch(`${BASE}/api/zones/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json<MonitoringZone>(res)
}

export async function deleteZone(id: number): Promise<void> {
  await fetch(`${BASE}/api/zones/${id}`, { method: 'DELETE' })
}

// ── Subscriptions ────────────────────────────────────────────────────────────

export interface SubscribePayload {
  email: string
  name?: string
  home_city: string
  home_lat: number
  home_lon: number
  notification_type?: string
}

export async function subscribe(payload: SubscribePayload): Promise<Subscriber> {
  const res = await fetch(`${BASE}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json<Subscriber>(res)
}

export async function unsubscribe(token: string): Promise<void> {
  await fetch(`${BASE}/api/subscribe/${token}`, { method: 'DELETE' })
}

export async function getSubscriberCount(): Promise<{ count: number }> {
  const res = await fetch(`${BASE}/api/subscribers/count`)
  return json<{ count: number }>(res)
}

// ── ML Analysis ──────────────────────────────────────────────────────────────

export async function analyzeML(payload: MLAnalyzeRequest): Promise<MLAnalyzeResponse> {
  const res = await fetch(`${BASE}/api/ml/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json<MLAnalyzeResponse>(res)
}
