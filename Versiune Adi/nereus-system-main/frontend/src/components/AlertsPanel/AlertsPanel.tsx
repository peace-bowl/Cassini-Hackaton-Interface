import { useState } from 'react'
import type { Alert, CitizenReport } from '../../types'
import AlertCard from './AlertCard'
import { useUpvoteReport, useDownvoteReport } from '../../hooks/useNereusQueries'

import { useNereusStore } from '../../store/useNereusStore'

interface Props {
  alerts: Alert[]
  reports: CitizenReport[]
  loading: boolean
  collapsed: boolean
  onToggle: () => void
}

export default function AlertsPanel({ alerts, reports, loading, collapsed, onToggle }: Props) {
  const [tab, setTab] = useState<'alerts' | 'reports'>('alerts')
  const upvoteMutation = useUpvoteReport()
  const downvoteMutation = useDownvoteReport()

  const flyToLocation = useNereusStore(s => s.flyToLocation)
  const selectedItemId = useNereusStore(s => s.selectedItemId)
  const setSelectedItemId = useNereusStore(s => s.setSelectedItemId)
  const setActiveAlert = useNereusStore(s => s.setActiveAlert)
  const setActiveReport = useNereusStore(s => s.setActiveReport)

  return (
    <div
      className="glass animate-slide-in-left"
      style={{
        position: 'absolute',
        top: '72px',
        left: collapsed ? '-340px' : '16px',
        width: '340px',
        height: 'calc(100vh - 100px)',
        transition: 'left 0.35s cubic-bezier(.22,.68,0,1.2)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
      }}
    >
      {/* Panel header */}
      <div style={{ padding: '14px 16px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', letterSpacing: '0.05em' }}>
            MONITORING FEED
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading && (
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--color-primary)',
                animation: 'pulse-ring 1.2s ease-out infinite',
              }} />
            )}
            <button className="btn btn-ghost" onClick={onToggle}
              style={{ padding: '4px 8px', fontSize: '12px' }} id="panel-toggle-btn">
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['alerts', 'reports'] as const).map(t => (
            <button
              key={t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
                background: tab === t ? 'var(--color-primary-dim)' : 'transparent',
                color: tab === t ? 'var(--color-primary)' : 'var(--color-text-3)',
                borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {t === 'alerts' ? `🛰 Satellite (${alerts.length})` : `👁 Reports (${reports.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 16px' }}>
        {tab === 'alerts' && (
          alerts.length === 0
            ? <EmptyState text="No alerts detected" />
            : alerts.map(a => (
                <AlertCard 
                  key={a.id} 
                  alert={a} 
                  isSelected={selectedItemId === a.id}
                  onClick={() => {
                    flyToLocation(a.lat, a.lon)
                    setSelectedItemId(a.id)
                    setActiveAlert(a)
                  }}
                />
              ))
        )}
        {tab === 'reports' && (
          reports.length === 0
            ? <EmptyState text="No citizen reports yet" />
            : reports.map(r => {
                const isSelected = selectedItemId === r.id
                return (
                  <div key={r.id}
                    onClick={() => {
                      flyToLocation(r.lat, r.lon)
                      setSelectedItemId(r.id)
                      setActiveReport(r)
                    }}
                    style={{
                      background: isSelected ? 'rgba(0,180,255,0.08)' : 'rgba(0,0,0,0.4)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)',
                      borderLeft: isSelected ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.background = 'rgba(0,180,255,0.1)'
                      el.style.borderColor = 'var(--color-primary)'
                      if (!isSelected) el.style.borderLeft = '1px solid var(--color-primary)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.background = isSelected ? 'rgba(0,180,255,0.08)' : 'rgba(0,0,0,0.4)'
                      el.style.borderColor = isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'
                      el.style.borderLeft = isSelected ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.15)'
                    }}
                  >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '15px' }}>🛰</span>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-1)', flex: 1 }}>
                    {r.pollution_type.replace(/_/g, ' ')}
                  </span>
                  <span className="badge badge-citizen"
                    style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                    Galileo GNSS
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-2)', marginBottom: '4px' }}>{r.description}</p>
                
                {(r.image_data || r.photo_url) && (
                  <div style={{ marginTop: '8px', marginBottom: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img 
                      src={r.image_data || r.photo_url!} 
                      alt="Citizen report photo" 
                      style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-3)', marginTop: '6px' }}>
                  <span>{r.lat.toFixed(4)}°N {r.lon.toFixed(4)}°E</span>
                  <span>{r.reporter_name ? `By ${r.reporter_name}` : new Date(r.timestamp).toLocaleDateString()}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); upvoteMutation.mutate(r.id) }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-2)', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}
                  >
                    👍 <span style={{ color: r.upvotes > 0 ? '#00e676' : 'inherit' }}>{r.upvotes || 0}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); downvoteMutation.mutate(r.id) }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-2)', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}
                  >
                    👎 <span style={{ color: r.downvotes > 0 ? '#ff3b3b' : 'inherit' }}>{r.downvotes || 0}</span>
                  </button>
                </div>
              </div>
            )})
        )}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-text-3)' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌊</div>
      <div style={{ fontSize: '13px' }}>{text}</div>
    </div>
  )
}
