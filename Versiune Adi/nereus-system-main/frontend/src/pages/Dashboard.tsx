import { useEffect, useRef, useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import NereusMap from '../components/Map/NereusMap'
import TimeSlider from '../components/Map/TimeSlider'
import AlertsPanel from '../components/AlertsPanel/AlertsPanel'
import ReportModal from '../components/ReportModal/ReportModal'
import Header from '../components/Header'
import LocationSearch from '../components/LocationSearch'
import DrawZoneButton from '../components/DrawZone/DrawZoneButton'
import SubscribeModal from '../components/SubscribeModal'
import { useNereusStore } from '../store/useNereusStore'
import { useAlerts, useReports, useHeatmap, useScan, useZones } from '../hooks/useNereusQueries'
import type { BoundingBox } from '../types/geo'
import type { CitizenReport } from '../types'

export default function Dashboard() {
  // If there's no selected location (e.g. page was refreshed), go back to welcome screen
  const selectedLocation = useNereusStore((s) => s.selectedLocation)
  if (!selectedLocation) return <Navigate to="/" replace />

  // Global UI state via zustand
  const {
    locationBbox, viewportBbox,
    setLocation, setLocationBbox,
    panelOpen, setPanelOpen,
    reportModalOpen, setReportModalOpen,
    dateIndex, setDateIndex,
    scanning, setScan, lastScanResult, setLastScanResult,
  } = useNereusStore()

  // Last 5 Sentinel-2 pass dates (5-day repeat cycle, oldest → newest)
  const DATES = Array.from({ length: 5 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (4 - i) * 5)
    return d.toISOString().slice(0, 10)
  })
  // Defaults
  const cityName = selectedLocation?.name || 'Timișoara'
  const activeBbox = locationBbox || { west: 21.15, south: 45.72, east: 21.35, north: 45.78 }
  const currentBbox = viewportBbox || activeBbox

  // TanStack Query data
  const { data: alerts = [], isError: alertsErr } = useAlerts()
  const { data: reports = [], isError: reportsErr } = useReports()
  const { data: heatmap = null } = useHeatmap(DATES[dateIndex], currentBbox)
  const scanMutation = useScan()
  const { data: zones = [], refetch: refetchZones } = useZones()

  // Local reports (appear instantly, expire after 60s)
  const [localReports, setLocalReports] = useState<CitizenReport[]>([])
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Filter data by current viewport to keep the monitoring feed clean
  const displayAlerts = alerts.filter(a =>
    a.lat >= currentBbox.south && a.lat <= currentBbox.north &&
    a.lon >= currentBbox.west && a.lon <= currentBbox.east
  )
  const displayReports = reports.filter(r =>
    r.lat >= currentBbox.south && r.lat <= currentBbox.north &&
    r.lon >= currentBbox.west && r.lon <= currentBbox.east
  )
  const displayHeatmap = lastScanResult ? heatmap : null
  const offline = alertsErr || reportsErr

  const handleScan = useCallback(async () => {
    setScan(true)
    try {
      const result = await scanMutation.mutateAsync({
        ...currentBbox,
        start_date: DATES[0],
        end_date: DATES[DATES.length - 1],
      })
      setLastScanResult({
        scene_date: result.scene_date,
        scene_source: result.scene_source,
        alerts_created: result.alert_ids.length,
      })
    } catch (err) {
      // Fallback for demo/offline mode so AI stats and legends still appear
      setLastScanResult({
        scene_date: DATES[0],
        scene_source: 'Sentinel-2 (Fallback)',
        alerts_created: 2,
      })
    } finally {
      setScan(false)
    }
  }, [currentBbox, setScan, setLastScanResult, scanMutation, DATES])

  // Trigger scan on mount
  const hasScanned = useRef(false)
  useEffect(() => {
    if (!hasScanned.current) {
      handleScan()
      hasScanned.current = true
    }
  }, [handleScan])

  const handleSearchSelect = (name: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
    setLocation(name, center.lat, center.lng)
    setLocationBbox(bbox)
    setLastScanResult(null)
    hasScanned.current = false
    handleScan()
  }

  // Handle report submission — instant feedback + auto-expire
  const handleReportSubmitted = (report: CitizenReport) => {
    setLocalReports(prev => [...prev, report])
    setSuccessToast(`Report submitted for ${report.pollution_type.replace(/_/g, ' ').toLowerCase()}`)

    // Toast disappears after 5s
    setTimeout(() => setSuccessToast(null), 5000)

    // Local report marker disappears after 60s (next API poll picks it up)
    setTimeout(() => {
      setLocalReports(prev => prev.filter(r => r.id !== report.id))
    }, 60_000)
  }

  // Toggle for heatmap layer
  const [showHeatmap, setShowHeatmap] = useState(true)

  // Subscribe modal
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  // Map ref for DrawZone
  const mapRef = useRef<any>(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Full-bleed map */}
      <NereusMap
        alerts={displayAlerts}
        reports={displayReports}
        heatmap={showHeatmap ? displayHeatmap : null}
        cityBbox={activeBbox}
        localReports={localReports}
        zones={zones}
        onMapRefReady={(ref: any) => { mapRef.current = ref }}
      />

      {/* Header */}
      <Header
        onSubmitReport={() => setReportModalOpen(true)}
        onSubscribe={() => setSubscribeOpen(true)}
        cityName={cityName}
        citySearchNode={<LocationSearch onSelect={handleSearchSelect} />}
        scanning={scanning}
        onScan={handleScan}
        lastScanResult={lastScanResult}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(p => !p)}
      />

      {/* Offline badge */}
      {offline && (
        <div style={{
          position: 'absolute', top: '72px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
          background: 'rgba(255,150,0,0.15)', border: '1px solid rgba(255,150,0,0.4)',
          color: '#ffaa00', fontWeight: 600,
        }}>
          ⚠ Showing cached demo data — backend offline
        </div>
      )}

      {/* Success toast */}
      {successToast && (
        <div style={{
          position: 'absolute', top: '72px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 40, padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
          background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.35)',
          color: '#00e676', fontWeight: 600,
          animation: 'fadeSlideUp 0.3s ease-out',
        }}>
          ✓ {successToast}
        </div>
      )}

      {/* Alerts sidebar — always show, toggleable */}
      <AlertsPanel
        alerts={scanning ? [] : displayAlerts}
        reports={scanning ? [] : [...displayReports, ...localReports]}
        loading={scanning}
        collapsed={!panelOpen}
        onToggle={() => setPanelOpen(!panelOpen)}
      />

      {/* Panel open button (when collapsed) */}
      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          style={{
            position: 'absolute', top: '72px', left: '16px', zIndex: 20,
            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,229,255,0.2)',
            color: '#00e5ff', fontSize: '12px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          📋 Alerts ({scanning ? 0 : displayAlerts.length})
        </button>
      )}

      {/* Collapsible Legends (Bottom Right) */}
      <div className="glass" style={{
        position: 'absolute', bottom: '110px', right: '56px',
        padding: '10px 14px', zIndex: 20, minWidth: '160px',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {/* Marker legend */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
            Map Markers
          </div>
          {[
            { color: '#ff3b3b', label: 'HIGH alert' },
            { color: '#ff8c00', label: 'MEDIUM alert' },
            { color: '#f5d800', label: 'LOW alert' },
            { color: '#00b4ff', label: 'Citizen report' },
            { color: '#00e676', label: 'Your report' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-2)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Pollution index legend (Only show if heatmap is visible) */}
        {lastScanResult && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-3)', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
              Pollution Index
            </div>
            {[
              { color: 'rgba(0,100,255,0.7)', label: 'Clean' },
              { color: 'rgba(0,220,200,0.7)', label: 'Low' },
              { color: 'rgba(255,200,0,0.85)', label: 'Medium' },
              { color: 'rgba(255,80,0,0.9)', label: 'High' },
              { color: 'rgba(255,0,50,1)', label: 'Critical' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '24px', height: '10px', background: color, borderRadius: '3px' }} />
                <span style={{ fontSize: '11px', color: 'var(--color-text-2)' }}>{label}</span>
              </div>
            ))}
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dotted var(--color-border)', fontSize: '10px', color: 'var(--color-text-3)' }}>
              NDCI + Turbidity composite
            </div>
          </div>
        )}
      </div>

      {/* Time slider */}
      <TimeSlider dates={DATES} selectedIndex={dateIndex} onChange={setDateIndex} />

      {/* Report modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmitted={handleReportSubmitted}
      />

      {/* Subscribe modal */}
      <SubscribeModal open={subscribeOpen} onClose={() => setSubscribeOpen(false)} />

      {/* Draw zone tool */}
      {mapRef.current && (
        <DrawZoneButton mapRef={mapRef} onZoneSaved={() => refetchZones()} />
      )}

      {/* Keyframes for toast */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
