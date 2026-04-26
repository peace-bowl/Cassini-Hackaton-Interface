/**
 * Reusable Nominatim-powered location search component.
 * Used by both the LandingPage and the Dashboard header.
 * Searches all of Europe (not restricted to Romania).
 */
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { BoundingBox } from '../types/geo';

export interface LocationResult {
  place_id: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

interface LocationSearchProps {
  onSelect: (
    name: string,
    center: { lat: number; lng: number },
    bbox: BoundingBox
  ) => void;
  placeholder?: string;
  large?: boolean;         // larger variant for landing page
  autoFocus?: boolean;
}

export default function LocationSearch({ onSelect, placeholder, large, autoFocus }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Search all of Europe — no country restriction
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&viewbox=-25,72,45,34&bounded=0&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'NereusSystem-Dashboard/1.0',
          }
        });
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: LocationResult) => {
    const center = { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
    const bbox: BoundingBox = {
      south: parseFloat(loc.boundingbox[0]),
      north: parseFloat(loc.boundingbox[1]),
      west: parseFloat(loc.boundingbox[2]),
      east: parseFloat(loc.boundingbox[3]),
    };

    const shortName = loc.display_name.split(',')[0];
    setQuery(shortName);
    setIsOpen(false);
    onSelect(shortName, center, bbox);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  const pad = large ? 'px-5 py-4' : 'px-3 py-2';
  const textSize = large ? 'text-base' : 'text-sm';

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div
        style={{
          display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: large ? '2px solid rgba(0,229,255,0.25)' : '1px solid rgba(0,229,255,0.2)',
          borderRadius: large ? '16px' : '12px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: large ? '0 0 30px rgba(0,229,255,0.06)' : 'none',
        }}
        className={pad}
      >
        <Search style={{ width: large ? 20 : 16, height: large ? 20 : 16, color: '#00e5ff', opacity: 0.7, marginRight: large ? 12 : 8, flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || 'Search a city, river, or lake in Europe...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          className={textSize}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#e2f0ff', width: '100%',
            fontFamily: 'Inter, sans-serif',
            fontSize: large ? '16px' : '14px',
          }}
        />
        {isSearching && <Loader2 style={{ width: 16, height: 16, color: '#00e5ff', marginLeft: 8, flexShrink: 0, animation: 'spin 1s linear infinite' }} />}
      </div>

      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
            background: 'rgba(10,22,40,0.95)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,229,255,0.15)', borderRadius: '12px',
            overflow: 'hidden', zIndex: 999,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,229,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <MapPin style={{ width: 16, height: 16, color: '#00e5ff', flexShrink: 0, marginTop: 2 }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', color: '#e2f0ff', fontWeight: 600 }}>
                  {result.display_name.split(',')[0]}
                </span>
                <span style={{ fontSize: '11px', color: '#7aa8cc', marginTop: 2 }}>
                  {result.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
