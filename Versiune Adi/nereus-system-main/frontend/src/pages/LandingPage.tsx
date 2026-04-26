import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationSearch from '../components/LocationSearch';
import { useNereusStore } from '../store/useNereusStore';
import { useSubscriberCount } from '../hooks/useNereusQueries';
import type { BoundingBox } from '../types/geo';

const QUICK_PICKS = [
  { flag: '🇷🇴', label: 'Bega, Timișoara', lat: 45.752, lon: 21.23, bbox: { south: 45.72, north: 45.78, west: 21.15, east: 21.35 } },
  { flag: '🇩🇪', label: 'Rhine, Germany', lat: 50.9413, lon: 6.9583, bbox: { south: 50.8, north: 51.1, west: 6.8, east: 7.2 } },
  { flag: '🇫🇷', label: 'Seine, Paris', lat: 48.8566, lon: 2.3522, bbox: { south: 48.8, north: 48.92, west: 2.25, east: 2.45 } },
];

export default function LandingPage() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();
  const setLocation = useNereusStore((s) => s.setLocation);
  const setLocationBbox = useNereusStore((s) => s.setLocationBbox);
  const { data: subCount } = useSubscriberCount();

  const goToDashboard = (name: string, lat: number, lon: number, bbox?: BoundingBox) => {
    setLocation(name, lat, lon);
    if (bbox) setLocationBbox(bbox);
    setFadeOut(true);
    setTimeout(() => navigate('/dashboard'), 300);
  };

  const handleSearch = (name: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
    goToDashboard(name, center.lat, center.lng, bbox);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#0a1628',
      backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(0,229,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 50% 70%, rgba(0,60,120,0.08) 0%, transparent 60%)',
      padding: '24px',
      transition: 'opacity 0.3s ease-out',
      opacity: fadeOut ? 0 : 1,
    }}>
      {/* Tagline */}
      <div style={{
        fontSize: '11px', fontWeight: 700, color: '#00e5ff',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        marginBottom: '24px', fontFamily: 'Inter, sans-serif',
        opacity: 0, animation: 'fadeSlideUp 0.6s ease-out 0.1s forwards',
      }}>
        CASSINI Hackathons — Space for Water
      </div>

      {/* Logo image */}
      <div style={{
        marginBottom: '24px',
        opacity: 0, animation: 'fadeSlideUp 0.6s ease-out 0.2s forwards',
      }}>
        <img
          src="/logo-solid.png"
          alt="The Nereus System"
          style={{
            height: 'clamp(120px, 20vw, 200px)',
            width: 'auto', objectFit: 'contain',
            filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.15))',
          }}
        />
      </div>

      {/* Description */}
      <p style={{
        fontSize: 'clamp(14px, 2vw, 18px)', color: '#7aa8cc',
        textAlign: 'center', maxWidth: '520px', margin: '0 0 40px',
        lineHeight: 1.6, fontFamily: 'Inter, sans-serif',
        opacity: 0, animation: 'fadeSlideUp 0.6s ease-out 0.35s forwards',
      }}>
        Satellite-powered early warning for water pollution across Europe
      </p>

      {/* Search bar */}
      <div style={{
        width: '100%', maxWidth: '600px',
        opacity: 0, animation: 'fadeSlideUp 0.6s ease-out 0.45s forwards',
      }}>
        <LocationSearch
          onSelect={handleSearch}
          placeholder="Search a city, river, or lake in Europe..."
          large
          autoFocus
        />
      </div>

      {/* Quick picks */}
      <div style={{
        display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap',
        justifyContent: 'center',
        opacity: 0, animation: 'fadeSlideUp 0.6s ease-out 0.55s forwards',
      }}>
        {QUICK_PICKS.map(pick => (
          <button
            key={pick.label}
            onClick={() => goToDashboard(pick.label.split(',')[0].trim(), pick.lat, pick.lon, pick.bbox)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(0,229,255,0.15)',
              color: '#e2f0ff', fontSize: '13px', fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,229,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.15)';
            }}
          >
            <span style={{ fontSize: '16px' }}>{pick.flag}</span>
            <span>{pick.label}</span>
          </button>
        ))}
      </div>

      {/* Subscriber count */}
      {subCount && subCount.count > 0 && (
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#5a8ab5',
          fontFamily: 'Inter, sans-serif',
          opacity: 0,
          animation: 'fadeSlideUp 0.6s ease-out 0.65s forwards',
        }}>
          🌍 {subCount.count} {subCount.count === 1 ? 'person' : 'people'} monitoring European waterways
        </div>
      )}

      {/* Demo Link */}
      <div style={{
        marginTop: '32px',
        opacity: 0,
        animation: 'fadeSlideUp 0.6s ease-out 0.8s forwards',
      }}>
        <button
          onClick={() => navigate('/demo')}
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(0,119,255,0.2))',
            border: '1px solid rgba(34,211,238,0.4)',
            color: '#22d3ee',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(0,119,255,0.3))'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(0,119,255,0.2))'
          }}
        >
          View Live Demo →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '24px', left: 0, right: 0,
        textAlign: 'center', fontSize: '11px', color: '#4a6a8a',
        fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em',
      }}>
        Powered by Copernicus • Galileo • EU Space Programme
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes waveShift {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
