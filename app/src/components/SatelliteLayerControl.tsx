'use client';

import React, { useState } from 'react';
import { Satellite, Layers } from 'lucide-react';
import { SATELLITE_LAYERS, SatelliteLayerId } from '@/data/satelliteTypes';

/**
 * SatelliteLayerControl
 * ─────────────────────
 * Left tool rail: vertical strip of icon buttons for toggling
 * satellite index layers. Expands to show labels on hover.
 */
interface SatelliteLayerControlProps {
  activeLayer: SatelliteLayerId;
  onLayerChange: (layer: SatelliteLayerId) => void;
}

/** Icon/emoji for each layer */
const LAYER_ICONS: Record<SatelliteLayerId, string> = {
  standard: '🗺️',
  satellite: '🌍',
  ndwi: '💧',
  ndvi: '🌿',
  swir: '🔥',
};

export default function SatelliteLayerControl({
  activeLayer,
  onLayerChange,
}: SatelliteLayerControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      id="satellite-layer-control"
      className="absolute top-3 left-3 z-30"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className="glass-panel rounded-xl overflow-hidden flex flex-col transition-all duration-300 ease-out"
        style={{
          width: isExpanded ? 210 : 44,
        }}
      >
        {/* Header — only visible when expanded */}
        {isExpanded && (
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              borderBottom: '1px solid var(--glass-border)',
              background: 'rgba(212, 168, 67, 0.03)',
            }}
          >
            <Satellite className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--gold)' }} />
            <div className="overflow-hidden">
              <h3
                className="font-display text-[10px] font-bold tracking-wider uppercase whitespace-nowrap"
                style={{ color: 'var(--text-primary)' }}
              >
                Satellite Data
              </h3>
              <p
                className="font-body text-[8px] whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}
              >
                Copernicus Sentinel-2
              </p>
            </div>
          </div>
        )}

        {/* Layer buttons */}
        <div className={`flex flex-col ${isExpanded ? 'p-1.5' : 'p-1'}`}>
          {SATELLITE_LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                id={`satellite-layer-${layer.id}`}
                onClick={() => onLayerChange(layer.id)}
                className="flex items-center gap-2.5 rounded-lg cursor-pointer transition-all duration-200 relative"
                style={{
                  padding: isExpanded ? '8px 10px' : '8px',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                  background: isActive
                    ? 'rgba(212, 168, 67, 0.1)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '2px solid var(--gold)'
                    : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                title={!isExpanded ? layer.name : undefined}
              >
                {/* Icon */}
                <span className="text-sm flex-shrink-0 w-5 text-center">{LAYER_ICONS[layer.id]}</span>

                {/* Label — only when expanded */}
                {isExpanded && (
                  <div className="flex flex-col items-start overflow-hidden">
                    <span
                      className="font-display text-[11px] font-semibold whitespace-nowrap"
                      style={{
                        color: isActive ? 'var(--gold)' : 'var(--text-primary)',
                      }}
                    >
                      {layer.name}
                    </span>
                    <span
                      className="font-body text-[8px] leading-tight whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {layer.description.length > 35
                        ? layer.description.slice(0, 35) + '…'
                        : layer.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active layer footer — only when expanded and non-standard */}
        {isExpanded && activeLayer !== 'standard' && (
          <div
            className="px-3 py-2"
            style={{
              borderTop: '1px solid var(--glass-border)',
              background: 'rgba(212, 168, 67, 0.02)',
            }}
          >
            <p
              className="font-body text-[9px] leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                {SATELLITE_LAYERS.find((l) => l.id === activeLayer)?.fullName}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
