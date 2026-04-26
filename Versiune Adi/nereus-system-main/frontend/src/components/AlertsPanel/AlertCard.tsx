import type { Alert } from '../../types'

interface Props {
  alert: Alert
  isSelected?: boolean
  onClick?: () => void
}

const TYPE_ICON: Record<string, string> = {
  ALGAL_BLOOM: '🦠',
  TURBIDITY:   '🌊',
  CHEMICAL:    '⚗️',
  FOAM:        '🫧',
  OIL_SLICK:   '🛢️',
  OTHER:       '⚠️',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AlertCard({ alert, isSelected, onClick }: Props) {
  const icon = TYPE_ICON[alert.pollution_type] ?? '⚠️'
  const label = alert.pollution_type.replace(/_/g, ' ')

  const baseBg = isSelected ? 'rgba(0,180,255,0.08)' : 'rgba(0,0,0,0.4)'
  const baseBorder = isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'
  const borderLeft = isSelected ? '4px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.15)'

  return (
    <button
      id={`alert-card-${alert.id}`}
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: baseBg,
        border: '1px solid',
        borderColor: baseBorder,
        borderLeft: borderLeft,
        borderRadius: 'var(--radius-sm)',
        padding: '14px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: '10px',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(0,180,255,0.1)'
        el.style.borderColor = 'var(--color-primary)'
        if (!isSelected) el.style.borderLeft = '1px solid var(--color-primary)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = baseBg
        el.style.borderColor = baseBorder
        el.style.borderLeft = borderLeft
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span style={{ color: 'var(--color-text-1)', fontWeight: 600, fontSize: '13px', flex: 1 }}>
          {label}
        </span>
        <span className={`badge badge-${alert.severity.toLowerCase()}`}
          style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
          {alert.severity}
        </span>
      </div>

      {/* Source chip */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span className={alert.source === 'satellite' ? 'badge badge-sat' : 'badge badge-citizen'}
          style={{ padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600 }}>
          {alert.source === 'satellite' ? '📡 Sentinel-2' : '🛰 Citizen'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-3)' }}>
          {timeAgo(alert.timestamp)}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
        {[
          { label: 'NDCI', value: alert.ndci_max.toFixed(3), color: alert.ndci_max > 0.1 ? 'var(--color-alert-high)' : 'var(--color-clean)' },
          { label: 'Turb.', value: alert.turbidity_max.toFixed(2), color: alert.turbidity_max > 1.2 ? 'var(--color-alert-med)' : 'var(--color-text-1)' },
          { label: 'Area', value: `${alert.area_ha}ha`, color: 'var(--color-text-1)' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
            padding: '4px 6px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '9px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* ML Analysis section */}
      {alert.ml_confidence != null && (
        <div style={{
          marginTop: '8px', padding: '8px',
          background: 'rgba(0,0,0,0.25)', borderRadius: '6px',
          border: '1px solid rgba(0,229,255,0.1)',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            🤖 ML Analysis
          </div>
          {/* Confidence bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-3)', minWidth: '62px' }}>Confidence</span>
            <div style={{
              flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)',
              borderRadius: '3px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${alert.ml_confidence}%`, height: '100%',
                borderRadius: '3px',
                background: alert.ml_confidence > 70
                  ? 'linear-gradient(90deg, #ff8c00, #ff3b3b)'
                  : alert.ml_confidence > 40
                    ? 'linear-gradient(90deg, #f5d800, #ff8c00)'
                    : 'linear-gradient(90deg, #00e87a, #00b4ff)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
              color: alert.ml_confidence > 70
                ? '#ff3b3b'
                : alert.ml_confidence > 40 ? '#ff8c00' : '#00e87a',
              minWidth: '30px', textAlign: 'right',
            }}>
              {alert.ml_confidence}%
            </span>
          </div>
          {/* Type + Model */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-2)' }}>
              {alert.ml_pollution_type
                ? alert.ml_pollution_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                : 'Unknown'}
            </span>
            {alert.ml_model && (
              <span style={{
                fontSize: '9px', color: 'var(--color-text-3)',
                fontFamily: 'var(--font-mono)',
              }}>
                {alert.ml_model}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Scene date */}
      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-text-3)' }}>
        Scene: {alert.scene_date} · {alert.lat.toFixed(4)}°N {alert.lon.toFixed(4)}°E
      </div>
    </button>
  )
}
