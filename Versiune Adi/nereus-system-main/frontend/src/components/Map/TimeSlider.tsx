/** Time slider: lets users scrub through recent Sentinel-2 acquisition dates. */
interface Props {
  dates: string[]          // ISO date strings, oldest first
  selectedIndex: number
  onChange: (index: number) => void
}

export default function TimeSlider({ dates, selectedIndex, onChange }: Props) {
  if (dates.length === 0) return null

  return (
    <div
      className="glass"
      style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(580px, calc(100vw - 80px))',
        padding: '14px 20px',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          📡 Sentinel-2 acquisition
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
          {dates[selectedIndex]}
        </span>
      </div>

      {/* Slider */}
      <input
        id="time-slider"
        type="range"
        min={0}
        max={dates.length - 1}
        value={selectedIndex}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--color-primary)',
          cursor: 'pointer',
          height: '4px',
        }}
      />

      {/* Date tick marks */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {dates.map((d, i) => (
          <button
            key={d}
            id={`date-tick-${i}`}
            onClick={() => onChange(i)}
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: i === selectedIndex ? 'var(--color-primary)' : 'var(--color-text-3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 2px',
              fontWeight: i === selectedIndex ? 700 : 400,
              transition: 'color 0.15s',
            }}
          >
            {d.slice(5)}  {/* Show MM-DD */}
          </button>
        ))}
      </div>
    </div>
  )
}
