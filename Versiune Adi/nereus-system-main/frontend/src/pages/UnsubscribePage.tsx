import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { unsubscribe } from '../api/client'

export default function UnsubscribePage() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    unsubscribe(token)
      .then(() => setStatus('done'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#0a1628',
      backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(0,229,255,0.06) 0%, transparent 60%)',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        maxWidth: '440px',
        textAlign: 'center',
        padding: '40px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(0,229,255,0.15)',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#7aa8cc', fontSize: '14px' }}>Unsubscribing...</p>
          </>
        )}
        {status === 'done' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#e2f0ff', margin: '0 0 8px' }}>Unsubscribed</h2>
            <p style={{ color: '#7aa8cc', fontSize: '14px', marginBottom: '24px' }}>
              You have been unsubscribed from Nereus System alerts.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'rgba(34,211,238,0.15)',
                border: '1px solid #22d3ee',
                color: '#22d3ee',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              ← Back to Home
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ color: '#e2f0ff', margin: '0 0 8px' }}>Error</h2>
            <p style={{ color: '#7aa8cc', fontSize: '14px', marginBottom: '24px' }}>
              Invalid or expired unsubscribe link.
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'rgba(34,211,238,0.15)',
                border: '1px solid #22d3ee',
                color: '#22d3ee',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              ← Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
