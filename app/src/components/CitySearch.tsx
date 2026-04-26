'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { BoundingBox } from '@/services/overpassService';
import { useLanguage } from '@/contexts/LanguageContext';

export interface CityResult {
  place_id: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
}

interface CitySearchProps {
  onCitySelect: (
    city: string,
    center: { lat: number; lng: number },
    bbox: BoundingBox
  ) => void;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&country=Romania&format=json&featuretype=city&limit=5`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'CassiniInterface-Dashboard/1.0',
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
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (city: CityResult) => {
    const center = { lat: parseFloat(city.lat), lng: parseFloat(city.lon) };
    const bbox: BoundingBox = {
      south: parseFloat(city.boundingbox[0]),
      north: parseFloat(city.boundingbox[1]),
      west: parseFloat(city.boundingbox[2]),
      east: parseFloat(city.boundingbox[3]),
    };
    
    const shortName = city.display_name.split(',')[0];
    
    setQuery(shortName);
    setIsOpen(false);
    onCitySelect(shortName, center, bbox);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="glass-panel flex items-center rounded-lg px-3 py-2 w-full transition-all duration-200"
        style={{ border: '1.5px solid var(--shelf)' }}
      >
        <Search className="w-3.5 h-3.5 mr-2 flex-shrink-0" style={{ color: 'var(--gold-dim)' }} />
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full font-body"
          style={{ caretColor: 'var(--gold)' }}
        />
        {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin ml-2 flex-shrink-0" style={{ color: 'var(--gold)' }} />}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-1.5 glass-panel rounded-lg overflow-hidden z-50 animate-fade-in"
          style={{ border: '1.5px solid var(--glass-border)' }}
        >
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(212, 168, 67, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <div className="flex flex-col">
                <span className="font-display text-sm text-text-primary font-semibold">
                  {result.display_name.split(',')[0]}
                </span>
                <span className="font-body text-[10px] text-text-muted mt-0.5 line-clamp-1">
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
