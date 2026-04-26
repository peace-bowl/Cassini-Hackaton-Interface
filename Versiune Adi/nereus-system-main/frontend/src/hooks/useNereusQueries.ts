/**
 * TanStack Query hooks for all Nereus API endpoints.
 * Falls back to static seed data when the backend is unreachable.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAlerts, getReports, getHeatmap, triggerScan, getHealth, submitReport, upvoteReport, downvoteReport, getZones, createZone, deleteZone, subscribe, getSubscriberCount, analyzeML } from '../api/client'
import { FALLBACK_ALERTS, FALLBACK_REPORTS, FALLBACK_HEATMAP } from '../data/fallback'
import type { ScanRequest, ReportPayload, CreateZonePayload, SubscribePayload } from '../api/client'
import type { MLAnalyzeRequest } from '../types'
import type { BoundingBox } from '../types/geo'

// ── Alerts ───────────────────────────────────────────────────────────────────

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => getAlerts(50),
    refetchInterval: 30_000,
    placeholderData: FALLBACK_ALERTS,
    retry: 2,
  })
}

// ── Reports ──────────────────────────────────────────────────────────────────
// ── Reports ────────────────────────────────────────────────────────────────

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => getReports(100),
    refetchInterval: 30_000,
    placeholderData: FALLBACK_REPORTS,
    retry: 2,
  })
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

export function useHeatmap(date: string, bbox?: BoundingBox | null) {
  return useQuery({
    queryKey: ['heatmap', date, bbox],
    queryFn: () => getHeatmap(date, bbox ?? undefined),
    staleTime: 5 * 60_000,
    retry: 1,
    enabled: !!bbox,
    placeholderData: FALLBACK_HEATMAP as any,
  })
}

// ── Voting ───────────────────────────────────────────────────────────────────

export function useUpvoteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => upvoteReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDownvoteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => downvoteReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// ── Health ────────────────────────────────────────────────────────────────────

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 60_000,
    retry: 1,
  })
}

// ── Scan ─────────────────────────────────────────────────────────────────────

export function useScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: ScanRequest) => triggerScan(req),
    onSuccess: (data) => {
      // Inject the REAL heatmap from the scan response into the query cache
      // instead of invalidating (which would refetch the synthetic /api/heatmap)
      if (data.heatmap) {
        qc.setQueriesData({ queryKey: ['heatmap'] }, data.heatmap)
      }
      // Refresh alerts to show newly created satellite alerts
      void qc.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

// ── Submit Report ─────────────────────────────────────────────────────────────

export function useSubmitReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReportPayload) => submitReport(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

// ── Zones ────────────────────────────────────────────────────────────────────

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: getZones,
    refetchInterval: 60_000,
    placeholderData: [],
  })
}

export function useCreateZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateZonePayload) => createZone(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['zones'] })
    },
  })
}

export function useDeleteZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteZone(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['zones'] })
    },
  })
}

// ── Subscribe ────────────────────────────────────────────────────────────────

export function useSubscribe() {
  return useMutation({
    mutationFn: (payload: SubscribePayload) => subscribe(payload),
  })
}

export function useSubscriberCount() {
  return useQuery({
    queryKey: ['subscriberCount'],
    queryFn: getSubscriberCount,
    refetchInterval: 30_000,
    placeholderData: { count: 0 },
  })
}

// ── ML Analysis ──────────────────────────────────────────────────────────────

export function useAnalyzeML() {
  return useMutation({
    mutationFn: (payload: MLAnalyzeRequest) => analyzeML(payload),
  })
}
