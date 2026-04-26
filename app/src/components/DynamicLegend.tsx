'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SatelliteLayerId, getSatelliteLayer } from '@/data/satelliteTypes';

/**
 * DynamicLegend
 * ─────────────
 * Compact instrument-panel legend for the active satellite layer.
 * Positioned bottom-right, above the time slider.
 *
 * Includes a deep link to the Copernicus Browser that opens the
 * exact zone (lat/lng/zoom) with the matching Sentinel-2 index layer
 * pre-selected (NDWI, NDVI, SWIR, or True Color).
 */
interface DynamicLegendProps {
  activeLayer: SatelliteLayerId;
  /** Current map center — used to build the Copernicus Browser link */
  mapCenter?: { lat: number; lng: number };
  /** Current map zoom level */
  mapZoom?: number;
}

/* ── Copernicus Browser layer-ID mapping ──────────────────────────
   Maps our internal SatelliteLayerId to the Copernicus Browser
   layerId query parameter for Sentinel-2 L2A visualisations.
   ─────────────────────────────────────────────────────────────── */
const COPERNICUS_LAYER_MAP: Record<string, string> = {
  satellite: '1_TRUE_COLOR',
  ndwi:      '3_NDWI',
  ndvi:      '2_NDVI',
  swir:      '6_SWIR',
};

/**
 * Build a Copernicus Browser deep link for the current zone + layer.
 * Opens browser.dataspace.copernicus.eu at the exact position with
 * the Sentinel-2 L2A dataset and matching visualisation preset.
 */
function buildCopernicusBrowserUrl(
  layer: SatelliteLayerId,
  center: { lat: number; lng: number },
  zoom: number
): string {
  const base = 'https://browser.dataspace.copernicus.eu/';
  const params = new URLSearchParams();

  // Map position
  params.set('zoom', String(Math.round(zoom)));
  params.set('lat', center.lat.toFixed(5));
  params.set('lng', center.lng.toFixed(5));

  // Time range — last 30 days up to today
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  params.set('fromTime', thirtyDaysAgo.toISOString().replace(/\.\d{3}Z$/, '.000Z'));
  params.set('toTime', now.toISOString().replace(/\.\d{3}Z$/, '.999Z'));

  // Sentinel-2 L2A dataset
  params.set('datasetId', 'S2_L2A_CDAS');

  // Layer visualisation preset
  const layerId = COPERNICUS_LAYER_MAP[layer] ?? '1_TRUE_COLOR';
  params.set('layerId', layerId);

  // Reasonable cloud coverage filter
  params.set('cloudCoverage', '30');

  return `${base}?${params.toString()}`;
}

export default function DynamicLegend({
  activeLayer,
  mapCenter = { lat: 45.7489, lng: 21.2087 },
  mapZoom = 12,
}: DynamicLegendProps) {
  if (activeLayer === 'standard') return null;

  const config = getSatelliteLayer(activeLayer);
  const isCategorical = !!(config.legendCategories && config.legendCategories.length > 0);
  const copernicusUrl = buildCopernicusBrowserUrl(activeLayer, mapCenter, mapZoom);

  return (
    <div
      id="satellite-legend"
      className="absolute bottom-24 right-4 z-30 glass-panel rounded-lg"
      style={{
        width: isCategorical ? 160 : 190,
        padding: '10px 12px',
        animation: 'fadeSlideUp 0.3s ease-out forwards',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'var(--gold)', boxShadow: '0 0 4px rgba(212, 168, 67, 0.5)' }}
        />
        <span
          className="font-display text-[9px] font-bold tracking-[0.12em] uppercase"
          style={{ color: 'var(--gold)' }}
        >
          {config.name} Index
        </span>
      </div>

      {/* Gradient legend */}
      {!isCategorical && config.legendStops.length > 0 && (
        <div>
          {/* Gradient bar with measurement ticks */}
          <div className="relative">
            <div
              className="w-full rounded-sm overflow-hidden"
              style={{
                height: '10px',
                background: `linear-gradient(to right, ${config.legendStops.map((s) => s.color).join(', ')})`,
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
            {/* Tick marks on top of gradient */}
            <div className="absolute inset-0 flex justify-between px-0 pointer-events-none">
              {config.legendStops.map((_, i) => (
                <div key={i} className="w-px h-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
          </div>
          {/* Labels */}
          <div className="flex justify-between mt-1">
            <span className="font-body text-[8px]" style={{ color: 'var(--text-muted)' }}>
              {config.legendStops[0].label}
            </span>
            <span className="font-body text-[8px]" style={{ color: 'var(--text-muted)' }}>
              {config.legendStops[config.legendStops.length - 1].label}
            </span>
          </div>
        </div>
      )}

      {/* Categorical legend (SWIR) */}
      {isCategorical && config.legendCategories && (
        <div className="flex flex-col gap-1.5">
          {config.legendCategories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3.5 h-2.5 rounded-sm flex-shrink-0"
                style={{
                  background: cat.color,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <span className="font-body text-[9px]" style={{ color: 'var(--text-secondary)' }}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Source footer + Copernicus Browser link */}
      <div className="mt-2.5 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-[5px] h-[5px] rounded-full flex-shrink-0"
            style={{ background: 'var(--green)', boxShadow: '0 0 3px rgba(78, 203, 113, 0.6)' }}
          />
          <p className="font-body text-[7px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            Sentinel-2 MSI · EOX 2021
          </p>
        </div>

        {/* Copernicus Browser deep link */}
        <a
          id="copernicus-browser-link"
          href={copernicusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-md transition-all duration-200 group"
          style={{
            background: 'rgba(0, 51, 153, 0.08)',
            border: '1px solid rgba(0, 51, 153, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 51, 153, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(0, 51, 153, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 51, 153, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(0, 51, 153, 0.2)';
          }}
        >
          <span
            className="font-display text-[8px] font-bold tracking-wide uppercase"
            style={{ color: '#5b9aff' }}
          >
            View in Copernicus Browser
          </span>
          <ExternalLink
            className="w-2.5 h-2.5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: '#5b9aff' }}
          />
        </a>
      </div>
    </div>
  );
}
