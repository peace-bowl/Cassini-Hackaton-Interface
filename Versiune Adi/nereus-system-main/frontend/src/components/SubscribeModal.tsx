import { useState } from 'react'
import { Bell } from 'lucide-react'
import LocationSearch from './LocationSearch'
import { useSubscribe } from '../hooks/useNereusQueries'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SubscribeModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [lat, setLat] = useState(0)
  const [lon, setLon] = useState(0)
  const [notifType, setNotifType] = useState<'immediate' | 'daily_digest'>('immediate')
  const [success, setSuccess] = useState(false)
  const subscribeMutation = useSubscribe()

  if (!open) return null

  const handleCitySelect = (name: string, center: { lat: number; lng: number }) => {
    setCity(name)
    setLat(center.lat)
    setLon(center.lng)
  }

  const handleSubmit = async () => {
    if (!email || !city) return
    try {
      await subscribeMutation.mutateAsync({
        email,
        name: name || undefined,
        home_city: city,
        home_lat: lat,
        home_lon: lon,
        notification_type: notifType,
      })
      setSuccess(true)
    } catch (err) {
      console.error('Subscribe failed:', err)
    }
  }

  const handleClose = () => {
    setEmail('')
    setName('')
    setCity('')
    setLat(0)
    setLon(0)
    setSuccess(false)
    onClose()
  }

  return (
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
          width: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ color: 'var(--color-text-1)', margin: '0 0 8px' }}>Subscribed!</h3>
            <p style={{ color: 'var(--color-text-2)', fontSize: '13px', marginBottom: '20px' }}>
              You'll receive alerts within 50 km of <strong style={{ color: '#22d3ee' }}>{city}</strong>.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: '1px solid #22d3ee',
                background: 'rgba(34,211,238,0.15)',
                color: '#22d3ee',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Bell size={20} color="#22d3ee" />
              <h3 style={{ margin: 0, color: 'var(--color-text-1)', fontSize: '16px' }}>
                Get notified about pollution near you
              </h3>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-2)', display: 'block', marginBottom: '4px' }}>
                Name (optional)
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
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

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-2)', display: 'block', marginBottom: '4px' }}>
                Email *
              </label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
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

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-2)', display: 'block', marginBottom: '4px' }}>
                Your City *
              </label>
              <LocationSearch
                onSelect={(name, center) => handleCitySelect(name, center)}
                placeholder="Search your city..."
              />
              {city && (
                <div style={{ fontSize: '11px', color: '#22d3ee', marginTop: '4px' }}>
                  📍 {city}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-text-2)', display: 'block', marginBottom: '8px' }}>
                Notification Type
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {([
                  { value: 'immediate' as const, label: '🔴 Immediate', desc: 'Email as soon as detected' },
                  { value: 'daily_digest' as const, label: '📅 Daily Digest', desc: 'One summary per day' },
                ] as const).map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${notifType === opt.value ? '#22d3ee' : 'var(--color-border)'}`,
                      background: notifType === opt.value ? 'rgba(34,211,238,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="notifType"
                      value={opt.value}
                      checked={notifType === opt.value}
                      onChange={() => setNotifType(opt.value)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-1)', marginBottom: '2px' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-3)' }}>
                      {opt.desc}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleClose}
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
                onClick={handleSubmit}
                disabled={!email || !city || subscribeMutation.isPending}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #22d3ee',
                  background: 'rgba(34,211,238,0.15)',
                  color: '#22d3ee',
                  cursor: email && city ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {subscribeMutation.isPending ? 'Subscribing...' : '🔔 Subscribe'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
