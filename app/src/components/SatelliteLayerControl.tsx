'use client';

import React, { useState } from 'react';
import { Satellite, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { SATELLITE_LAYERS, SatelliteLayerId } from '@/data/satelliteTypes';

/**
 * SatelliteLayerControl
 * ─────────────────────
 * Floating panel for toggling Copernicus Sentinel-2 derived
 * index overlays on the map. Only one layer active at a time.
 */
interface SatelliteLayerControlProps {
  activeLayer: SatelliteLayerId;
  onLayerChange: (layer: SatelliteLayerId) => void;
}

/** Icon indicators for each layer type */
const LAYER_ICONS: Record<SatelliteLayerId, string> = {
  standard: '🗺️',
  ndwi: '💧',
  ndvi: '🌿',
  ndsi: '❄️',
  swir: '🔥',
};

export default function SatelliteLayerControl({
  activeLayer,
  onLayerChange,
}: SatelliteLayerControlProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id="satellite-layer-control"
      className="absolute top-4 left-14 z-30"
      style={{
        transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Collapsed toggle button */}
      {isCollapsed && (
        <button
          id="satellite-panel-expand"
          onClick={() => setIsCollapsed(false)}
          className="glass-panel flex items-center justify-center rounded-xl cursor-pointer"
          style={{
            width: 44,
            height: 44,
            border: '1px solid var(--glass-border)',
            color: 'var(--cyan)',
            transition: 'all 0.2s ease',
          }}
          title="Show Satellite Data Panel"
        >
          <Layers className="w-5 h-5" />
        </button>
      )}

      {/* Expanded panel */}
      {!isCollapsed && (
        <div
          className="glass-panel rounded-2xl overflow-hidden"
          style={{
            width: 260,
            animation: 'fadeSlideUp 0.35s ease-out forwards',
          }}
        >
          {/* Panel Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: '1px solid var(--glass-border)',
              background: 'rgba(0, 229, 255, 0.03)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.05))',
                  border: '1px solid rgba(0, 229, 255, 0.15)',
                }}
              >
                <Satellite className="w-3.5 h-3.5 text-cyan" />
              </div>
              <div>
                <h3
                  className="font-display text-xs font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}
                >
                  Satellite Data
                </h3>
                <p
                  className="font-body text-[9px]"
                  style={{ color: 'var(--text-muted)', marginTop: -1 }}
                >
                  Copernicus Sentinel-2
                </p>
              </div>
            </div>
            <button
              id="satellite-panel-collapse"
              onClick={() => setIsCollapsed(true)}
              className="flex items-center justify-center w-6 h-6 rounded-md cursor-pointer"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cyan)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              title="Collapse panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Layer Radio Buttons */}
          <div className="p-2">
            {SATELLITE_LAYERS.map((layer, index) => {
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  id={`satellite-layer-${layer.id}`}
                  onClick={() => onLayerChange(layer.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(0, 229, 255, 0.03))'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(0, 229, 255, 0.2)'
                      : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    animationDelay: `${index * 40}ms`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  {/* Radio indicator */}
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      border: `2px solid ${isActive ? 'var(--cyan)' : 'var(--shelf)'}`,
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    {isActive && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: 'var(--cyan)',
                          boxShadow: '0 0 6px rgba(0, 229, 255, 0.5)',
                        }}
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <span className="text-sm flex-shrink-0">{LAYER_ICONS[layer.id]}</span>

                  {/* Label */}
                  <div className="flex flex-col items-start">
                    <span
                      className="font-display text-xs font-medium"
                      style={{
                        color: isActive ? 'var(--cyan)' : 'var(--text-primary)',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {layer.name}
                    </span>
                    <span
                      className="font-body text-[9px] leading-tight"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {layer.description.length > 40
                        ? layer.description.slice(0, 40) + '…'
                        : layer.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active layer description footer */}
          {activeLayer !== 'standard' && (
            <div
              className="px-4 py-2.5"
              style={{
                borderTop: '1px solid var(--glass-border)',
                background: 'rgba(0, 229, 255, 0.02)',
              }}
            >
              <p
                className="font-body text-[10px] leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                  {SATELLITE_LAYERS.find((l) => l.id === activeLayer)?.fullName}
                </span>
                {' — '}
                {SATELLITE_LAYERS.find((l) => l.id === activeLayer)?.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
