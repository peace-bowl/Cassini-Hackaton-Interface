'use client';

import React from 'react';
import { SatelliteLayerId, getSatelliteLayer } from '@/data/satelliteTypes';

/**
 * DynamicLegend
 * ─────────────
 * Floating color legend displayed in the bottom-right of the map.
 * Dynamically renders gradient or categorical legends based on
 * the currently active satellite index layer.
 * Matches the Copernicus Browser legend style.
 */
interface DynamicLegendProps {
  activeLayer: SatelliteLayerId;
}

export default function DynamicLegend({ activeLayer }: DynamicLegendProps) {
  if (activeLayer === 'standard') return null;

  const config = getSatelliteLayer(activeLayer);
  const isCategorical = !!(config.legendCategories && config.legendCategories.length > 0);

  return (
    <div
      id="satellite-legend"
      className="absolute bottom-24 right-4 z-30 glass-panel rounded-xl"
      style={{
        width: isCategorical ? 178 : 210,
        padding: '14px 16px',
        animation: 'fadeSlideUp 0.3s ease-out forwards',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'var(--cyan)', boxShadow: '0 0 4px rgba(0, 229, 255, 0.5)' }}
        />
        <span
          className="font-display text-[10px] font-semibold tracking-wider uppercase"
          style={{ color: 'var(--cyan)', letterSpacing: '0.1em' }}
        >
          {config.name} Index
        </span>
      </div>

      {/* Gradient legend */}
      {!isCategorical && config.legendStops.length > 0 && (
        <div>
          {/* Gradient bar */}
          <div
            className="w-full rounded-sm overflow-hidden mb-1.5"
            style={{
              height: '14px',
              background: `linear-gradient(to right, ${config.legendStops.map((s) => s.color).join(', ')})`,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          {/* Min / Max labels */}
          <div className="flex justify-between mb-0.5">
            <span className="font-body text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {config.legendStops[0].label}
            </span>
            <span className="font-body text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {config.legendStops[config.legendStops.length - 1].label}
            </span>
          </div>
          {/* Mid-point ticks */}
          <div className="flex justify-between px-0">
            {config.legendStops.slice(1, -1).map((stop, i) => (
              <span
                key={i}
                className="font-body text-[8px]"
                style={{ color: 'var(--text-muted)', opacity: 0.6 }}
              >
                {stop.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categorical legend (SWIR) */}
      {isCategorical && config.legendCategories && (
        <div className="flex flex-col gap-2">
          {config.legendCategories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className="w-4 h-3 rounded-sm flex-shrink-0"
                style={{
                  background: cat.color,
                  boxShadow: `0 0 6px ${cat.color}50`,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <span className="font-body text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Data source footer */}
      <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#00e676', boxShadow: '0 0 4px #00e67680' }}
          />
          <p className="font-body text-[8px]" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
            Sentinel-2 MSI · EOX Cloudless 2021
          </p>
        </div>
        <p className="font-body text-[8px]" style={{ color: 'var(--text-muted)', opacity: 0.55 }}>
          © Contains Copernicus data
        </p>
      </div>
    </div>
  );
}
