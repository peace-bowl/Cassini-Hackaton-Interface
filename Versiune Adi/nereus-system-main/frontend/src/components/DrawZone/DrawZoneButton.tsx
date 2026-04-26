import { useState, useEffect, useCallback } from 'react'
import { useCreateZone } from '../../hooks/useNereusQueries'

interface Props {
  mapRef: React.MutableRefObject<any>
  onZoneSaved: () => void
}

export default function DrawZoneButton({ mapRef, onZoneSaved }: Props) {
  const [drawMode, setDrawMode] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([])
  const [showSave, setShowSave] = useState(false)
  const [zoneName, setZoneName] = useState('')
  const [zoneEmail, setZoneEmail] = useState('')
  const createZone = useCreateZone()

  // Handle escape and enter keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!drawMode) return
      if (e.key === 'Escape') {
        cancelDraw()
      } else if (e.key === 'Enter') {
        if (drawnPoints.length >= 3) {
          setDrawMode(false)
          setShowSave(true)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawMode, drawnPoints.length])

  // Wire map click/dblclick when in draw mode
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const onClick = (e: any) => {
      if (!drawMode) return
      setDrawnPoints(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]])
    }

    const onDblClick = (e: any) => {
      if (!drawMode || drawnPoints.length < 3) return
      e.preventDefault()
      setDrawMode(false)
      setShowSave(true)
    }

    if (drawMode) {
      map.on('click', onClick)
      map.on('dblclick', onDblClick)
      map.getCanvas().style.cursor = 'crosshair'
    }

    return () => {
      map.off('click', onClick)
      map.off('dblclick', onDblClick)
      map.getCanvas().style.cursor = ''
    }
  }, [drawMode, drawnPoints.length, mapRef])

  // Draw vertices + lines on map
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const sourceId = 'draw-zone-src'
    const lineLayerId = 'draw-zone-line'
    const pointLayerId = 'draw-zone-points'

    const geojson: any = {
      type: 'FeatureCollection',
      features: []
    }

    if (drawnPoints.length > 0) {
      // Line
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [...drawnPoints, ...(drawnPoints.length >= 3 ? [drawnPoints[0]] : [])],
        },
        properties: {},
      })
      // Points
      drawnPoints.forEach(pt => {
        geojson.features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: pt },
          properties: {},
        })
      })
    }

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as any).setData(geojson)
    } else {
      map.addSource(sourceId, { type: 'geojson', data: geojson })
      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#22d3ee',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      })
      map.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: sourceId,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#22d3ee',
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2,
        },
      })
    }
  }, [drawnPoints, mapRef])

  const cancelDraw = useCallback(() => {
    setDrawMode(false)
    setDrawnPoints([])
    setShowSave(false)
    setZoneName('')
    setZoneEmail('')
    // Clean up map layers
    const map = mapRef.current
    if (map) {
      if (map.getLayer('draw-zone-line')) map.removeLayer('draw-zone-line')
      if (map.getLayer('draw-zone-points')) map.removeLayer('draw-zone-points')
      if (map.getSource('draw-zone-src')) map.removeSource('draw-zone-src')
    }
  }, [mapRef])

  const handleSave = async () => {
    if (!zoneName.trim() || drawnPoints.length < 3) return
    const polygon = {
      type: 'Polygon',
      coordinates: [[...drawnPoints, drawnPoints[0]]],
    }
    try {
      await createZone.mutateAsync({
        name: zoneName.trim(),
        geometry_geojson: JSON.stringify(polygon),
        created_by_email: zoneEmail || undefined,
      })
      cancelDraw()
      onZoneSaved()
    } catch (err) {
      console.error('Failed to save zone:', err)
    }
  }

  return (
    <>
      {/* Draw Zone button */}
      {!drawMode && !showSave && (
        <button
          onClick={() => { setDrawMode(true); setDrawnPoints([]) }}
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '80px',
            right: '16px',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
            border: '1px solid var(--color-border)',
            background: 'rgba(0,0,0,0.6)',
          }}
        >
          📍 Draw Zone
        </button>
      )}

      {/* Drawing indicator */}
      {drawMode && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '80px',
            right: '16px',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--color-text-1)',
            zIndex: 10,
            border: '1px solid var(--color-primary)',
            background: 'rgba(0,0,0,0.7)',
            maxWidth: '220px',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px', color: '#22d3ee' }}>
            ✏️ Drawing Mode
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-2)', marginBottom: '8px' }}>
            {drawnPoints.length} point{drawnPoints.length !== 1 ? 's' : ''} — {drawnPoints.length < 3 ? 'click to add vertices' : 'Enter or double-click to close'}
          </div>
          <button
            onClick={cancelDraw}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#ff6b6b',
              cursor: 'pointer',
              border: '1px solid rgba(255,107,107,0.3)',
              background: 'rgba(255,107,107,0.1)',
            }}
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Save dialog */}
      {showSave && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div
            className="glass"
            style={{
              width: '380px',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', color: 'var(--color-text-1)', fontSize: '16px' }}>
              Save Monitoring Zone
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-2)', display: 'block', marginBottom: '4px' }}>
                Zone Name *
              </label>
              <input
                value={zoneName}
                onChange={e => setZoneName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                placeholder="e.g. Bega River Sector A"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'var(--color-text-1)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-2)', display: 'block', marginBottom: '4px' }}>
                Your Email (optional, for zone alerts)
              </label>
              <input
                value={zoneEmail}
                onChange={e => setZoneEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                placeholder="you@example.com"
                type="email"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'var(--color-text-1)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={cancelDraw}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-2)',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!zoneName.trim() || createZone.isPending}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #22d3ee',
                  background: 'rgba(34,211,238,0.15)',
                  color: '#22d3ee',
                  cursor: zoneName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {createZone.isPending ? 'Saving...' : 'Save Zone'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
