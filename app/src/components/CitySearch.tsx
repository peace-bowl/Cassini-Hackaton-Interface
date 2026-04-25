'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { BoundingBox } from '@/services/overpassService';

export interface CityResult {
  place_id: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

interface CitySearchProps {
  onCitySelect: (
    city: string,
    center: { lat: number; lng: number },
    bbox: BoundingBox
  ) => void;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
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
    
    // Extract short name
    const shortName = city.display_name.split(',')[0];
    
    setQuery(shortName);
    setIsOpen(false);
    onCitySelect(shortName, center, bbox);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="flex items-center glass-panel rounded-xl px-3 py-2 w-64"
        style={{ border: '1px solid rgba(0, 229, 255, 0.2)' }}
      >
        <Search className="w-4 h-4 text-cyan opacity-70 mr-2" />
        <input
          type="text"
          placeholder="Search Romanian cities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full font-body"
        />
        {isSearching && <Loader2 className="w-4 h-4 text-cyan animate-spin ml-2" />}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl overflow-hidden z-50 animate-fade-in"
          style={{ border: '1px solid var(--glass-border)' }}
        >
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[rgba(0,229,255,0.05)] transition-colors border-b border-[rgba(255,255,255,0.05)] last:border-0 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-display text-sm text-text-primary font-medium">
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
