'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { WaterAlert } from '@/data/mockData';
import {
  SatelliteLayerId,
  getSatelliteLayer,
  getIndexDescription,
} from '@/data/satelliteTypes';
import defaultSatelliteData from '@/data/satelliteData.json';

/**
 * MapView Component
 * ──────────────────
 * Interactive MapLibre GL map displaying water alert markers
 * and Copernicus Sentinel-2 satellite index overlays.
 *
 * When a satellite index layer is active the map switches to a
 * real EOX Sentinel-2 cloudless base-map (©EOX / Copernicus) and
 * renders semi-transparent index-coloured GeoJSON polygons on top,
 * matching the Copernicus Browser look-and-feel.
 */
interface MapViewProps {
  alerts: WaterAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  activeLayer: SatelliteLayerId;
  satelliteData?: GeoJSON.FeatureCollection;
  center?: { lat: number; lng: number };
  bbox?: { south: number; north: number; west: number; east: number } | null;
  theme?: 'dark' | 'light';
}

/* ── Severity colours ────────────────────────────────────────────── */
const SEVERITY_COLORS = {
  high: '#ff3d3d',
  medium: '#ff9100',
  low: '#00e5ff',
} as const;

const SEVERITY_OUTER = {
  high: 'rgba(255, 61, 61, 0.25)',
  medium: 'rgba(255, 145, 0, 0.25)',
  low: 'rgba(0, 229, 255, 0.2)',
} as const;

/* ── MapLibre source / layer IDs ─────────────────────────────────── */
const SAT_IMAGERY_SOURCE = 'sentinel2-imagery';
const SAT_IMAGERY_LAYER  = 'sentinel2-imagery-layer';
const SAT_SOURCE         = 'satellite-polygons';
const SAT_FILL_LAYER     = 'satellite-fill';
const SAT_OUTLINE_LAYER  = 'satellite-outline';

/* ── EOX tile URL for Sentinel-2 cloudless 2021 ─────────────────── */
const EOX_S2_TILE_URL =
  'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg';

const EOX_ATTRIBUTION =
  'Sentinel-2 cloudless by <a href="https://s2maps.eu" target="_blank">EOX IT Services GmbH</a> ' +
  '(Contains modified Copernicus Sentinel data 2021)';

/* ─────────────────────────────────────────────────────────────────────
   Copernicus-style MapLibre colour expressions
   These are native GL expressions evaluated per-feature from its
   properties, avoiding the O(n) JS loop we had before.
   ───────────────────────────────────────────────────────────────── */

/**
 * Build a `step` expression that colours features by their NDWI value,
 * matching the Copernicus Browser NDWI palette exactly.
 */
function ndwiFillColor() {
  // Copernicus NDWI: brown → grey-green → cyan-blue → blue → deep navy
  return [
    'step', ['get', 'ndwi'],
    'rgba(138, 97,  46, 0.75)',   // < 0.0  dry land
    0.0,  'rgba(186,148, 80, 0.70)',   // 0.0–0.15
    0.15, 'rgba(112,168,137, 0.72)',   // 0.15–0.3  moist soil
    0.30, 'rgba( 38,139,210, 0.78)',   // 0.30–0.5  surface water
    0.50, 'rgba(  3, 93, 186, 0.85)',  // 0.50–0.7  open water
    0.70, 'rgba(  3, 53, 140, 0.90)',  // ≥ 0.7     deep water
  ];
}

function ndwiOutlineColor() {
  return [
    'step', ['get', 'ndwi'],
    'rgba(138, 97, 46,  0.0)',
    0.30, 'rgba( 38,139,210, 0.90)',
    0.50, 'rgba(  3, 93, 186, 0.95)',
    0.70, 'rgba(  3, 53, 140, 1.0)',
  ];
}

/**
 * NDVI fill — matches Copernicus red→yellow→green palette
 */
function ndviFillColor() {
  return [
    'step', ['get', 'ndvi'],
    'rgba(215, 48,  39, 0.75)',   // < 0.1  bare soil / urban
    0.1, 'rgba(244,109, 67, 0.72)',
    0.2, 'rgba(253,174, 97, 0.72)',
    0.3, 'rgba(166,217,106, 0.75)',
    0.5, 'rgba( 82,188,144, 0.78)',
    0.7, 'rgba( 26,152, 80, 0.85)',
  ];
}

function ndviOutlineColor() {
  return 'rgba(26, 152, 80, 0.7)';
}

/**
 * NDSI fill — dark → light-blue → white (snow)
 */
function ndsiFillColor() {
  return [
    'step', ['get', 'ndsi'],
    'rgba( 30, 30, 50, 0.20)',
    0.1, 'rgba( 74,113,168, 0.55)',
    0.3, 'rgba(116,169,207, 0.65)',
    0.5, 'rgba(166,217,247, 0.75)',
    0.7, 'rgba(215,240,255, 0.85)',
  ];
}

function ndsiOutlineColor() {
  return 'rgba(166, 217, 247, 0.9)';
}

/**
 * SWIR false-colour — categorical by surface type
 */
function swirFillColor() {
  return [
    'match', ['get', 'swir'],
    'water',      'rgba(  3, 30,100, 0.85)',
    'vegetation', 'rgba( 44,188, 66, 0.75)',
    'soil',       'rgba(180,100,120, 0.72)',
    /* default */ 'rgba(100,100,100, 0.4)',
  ];
}

function swirOutlineColor() {
  return [
    'match', ['get', 'swir'],
    'water',      'rgba(  3, 53,186, 0.9)',
    'vegetation', 'rgba( 26,152, 80, 0.9)',
    'soil',       'rgba(160, 80,100, 0.8)',
    'rgba(80,80,80, 0.5)',
  ];
}

/* ── Popup helpers ───────────────────────────────────────────────── */

function createPopupHTML(alert: WaterAlert): string {
  const severityColor = SEVERITY_COLORS[alert.severity];
  const severityLabel =
    alert.severity === 'high' ? 'Critical' : alert.severity === 'medium' ? 'Warning' : 'Info';
  const time = new Date(alert.timestamp).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return `
    <div style="font-family: 'DM Sans', sans-serif;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="
          display:inline-block;width:8px;height:8px;border-radius:50%;
          background:${severityColor};box-shadow:0 0 6px ${severityColor}80;
        "></span>
        <span style="
          font-family:'Outfit',sans-serif;font-size:10px;font-weight:600;
          text-transform:uppercase;letter-spacing:.1em;color:${severityColor};
        ">${severityLabel} · ${alert.type}</span>
      </div>
      <h3 style="font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;
          color:#e8edf5;margin:0 0 4px;">${alert.location}</h3>
      <p style="font-size:11px;color:#8a9bb5;margin:0 0 8px;">${time}</p>
      <p style="font-size:12px;color:#b0bdd0;margin:0;line-height:1.5;">${alert.description}</p>
    </div>
  `;
}

function createPixelInspectorHTML(
  feature: GeoJSON.Feature,
  activeLayer: SatelliteLayerId
): string {
  const props = feature.properties ?? {};
  const layerConfig = getSatelliteLayer(activeLayer);
  const value = props[layerConfig.propertyKey] ?? 0;
  const description = getIndexDescription(activeLayer, value);
  const passDate = props.passDate
    ? new Date(props.passDate).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  const layerColor = layerConfig.getColor(value, props.swir);

  let valueDisplay = '';
  if (activeLayer === 'swir') {
    const surfaceType = (props.swir as string) ?? 'unknown';
    valueDisplay = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-block;width:14px;height:10px;border-radius:2px;
          background:${layerColor};border:1px solid rgba(255,255,255,.15);"></span>
        <span style="font-size:12px;color:#e8edf5;font-weight:600;">
          Surface: ${surfaceType.charAt(0).toUpperCase() + surfaceType.slice(1)}
        </span>
      </div>`;
  } else {
    valueDisplay = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="display:inline-block;width:14px;height:10px;border-radius:2px;
          background:${layerColor};border:1px solid rgba(255,255,255,.15);"></span>
        <span style="font-size:12px;color:#e8edf5;font-weight:600;">
          ${layerConfig.name} Value: ${Number(value).toFixed(3)}
        </span>
      </div>
      <p style="font-size:11px;color:#00e5ff;margin:0 0 6px;font-style:italic;">${description}</p>
    `;
  }

  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:230px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
        <span style="
          font-family:'Outfit',sans-serif;font-size:9px;font-weight:600;
          text-transform:uppercase;letter-spacing:.12em;color:#00e5ff;
          background:rgba(0,229,255,.1);padding:2px 8px;border-radius:4px;
          border:1px solid rgba(0,229,255,.15);">🛰 Pixel Inspector</span>
      </div>
      <h3 style="font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;
          color:#e8edf5;margin:0 0 8px;">${props.name ?? 'Water Body'}</h3>
      ${valueDisplay}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06);">
        <p style="font-size:10px;color:#56687d;margin:0 0 2px;">
          Copernicus Sentinel-2, Pass Date:
        </p>
        <p style="font-size:11px;color:#8a9bb5;margin:0;">${passDate}</p>
        ${props.area_km2
          ? `<p style="font-size:10px;color:#56687d;margin:4px 0 0;">Area: ${props.area_km2} km²</p>`
          : ''}
      </div>
    </div>
  `;
}

/* ── MapView component ───────────────────────────────────────────── */

export default function MapView({
  alerts,
  selectedAlertId,
  onSelectAlert,
  activeLayer,
  satelliteData = defaultSatelliteData as GeoJSON.FeatureCollection,
  center = { lat: 45.7489, lng: 21.2087 },
  bbox = null,
  theme = 'dark',
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const markersRef   = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef     = useRef<maplibregl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  /* ── Map initialisation ─────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;

    // Base vector style depends on theme; when satellite we still start with
    // the vector style and ADD the raster imagery on top programmatically.
    const baseStyle =
      theme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://tiles.openfreemap.org/styles/liberty';

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      center: [center.lng, center.lat],
      zoom: 12,
      maxZoom: 18,
      minZoom: 6,
      attributionControl: {},
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

    map.on('load', () => {
      /* ── Add EOX Sentinel-2 imagery source (hidden by default) ── */
      map.addSource(SAT_IMAGERY_SOURCE, {
        type: 'raster',
        tiles: [EOX_S2_TILE_URL],
        tileSize: 256,
        attribution: EOX_ATTRIBUTION,
        minzoom: 0,
        maxzoom: 18,
      });

      // Insert the satellite imagery BELOW labels / roads
      // (find the first symbol layer to insert before it, otherwise append)
      const firstSymbolId = map.getStyle().layers?.find(
        (l) => l.type === 'symbol'
      )?.id;

      map.addLayer(
        {
          id: SAT_IMAGERY_LAYER,
          type: 'raster',
          source: SAT_IMAGERY_SOURCE,
          paint: { 'raster-opacity': 0 }, // hidden until satellite mode
        },
        firstSymbolId
      );

      /* ── GeoJSON source for index polygons ────────────────────── */
      map.addSource(SAT_SOURCE, {
        type: 'geojson',
        data: satelliteData,
      });

      // Fill – colours applied per-feature via GL expressions
      map.addLayer({
        id: SAT_FILL_LAYER,
        type: 'fill',
        source: SAT_SOURCE,
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0,
        },
      });

      // Outline
      map.addLayer({
        id: SAT_OUTLINE_LAYER,
        type: 'line',
        source: SAT_SOURCE,
        paint: {
          'line-color': 'transparent',
          'line-width': 1.5,
          'line-opacity': 0,
        },
      });

      /* ── Pixel Inspector ──────────────────────────────────────── */
      map.on('click', SAT_FILL_LAYER, (e) => {
        if (!e.features?.length) return;
        if (popupRef.current) popupRef.current.remove();
        const popup = new maplibregl.Popup({ offset: 10, closeOnClick: true, maxWidth: '320px' })
          .setLngLat(e.lngLat)
          .setHTML(createPixelInspectorHTML(e.features[0] as unknown as GeoJSON.Feature, activeLayer))
          .addTo(map);
        popupRef.current = popup;
      });

      map.on('mouseenter', SAT_FILL_LAYER, () => { map.getCanvas().style.cursor = 'crosshair'; });
      map.on('mouseleave', SAT_FILL_LAYER, () => { map.getCanvas().style.cursor = ''; });

      setMapLoaded(true);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── City bbox / pan ─────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    if (bbox) {
      map.fitBounds(
        [[bbox.west, bbox.south], [bbox.east, bbox.north]],
        { padding: 40, duration: 1500 }
      );
      const latDiff = bbox.north - bbox.south;
      const lngDiff = bbox.east  - bbox.west;
      map.setMaxBounds([
        [bbox.west - lngDiff * 0.5, bbox.south - latDiff * 0.5],
        [bbox.east + lngDiff * 0.5, bbox.north + latDiff * 0.5],
      ]);
    } else {
      map.flyTo({ center: [center.lng, center.lat], zoom: 12 });
      map.setMaxBounds(null);
    }
  }, [bbox, center, mapLoaded]);

  /* ── Update GeoJSON when city changes ───────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const src = mapRef.current.getSource(SAT_SOURCE) as maplibregl.GeoJSONSource;
    if (src) src.setData(satelliteData);
  }, [satelliteData, mapLoaded]);

  /* ── Active layer changes → update imagery + polygon colours ── */
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const isSatellite = activeLayer !== 'standard';

    /* Show/hide EOX Sentinel-2 imagery layer */
    if (map.getLayer(SAT_IMAGERY_LAYER)) {
      map.setPaintProperty(
        SAT_IMAGERY_LAYER,
        'raster-opacity',
        isSatellite ? 1 : 0
      );
    }

    if (!isSatellite) {
      /* Standard mode: hide overlays */
      map.setPaintProperty(SAT_FILL_LAYER,    'fill-opacity',  0);
      map.setPaintProperty(SAT_OUTLINE_LAYER, 'line-opacity',  0);
      return;
    }

    /* Per-layer native GL colour expressions */
    let fillColor:    unknown;
    let outlineColor: unknown;
    let fillOpacity:  number;
    let outlineOpacity: number;

    switch (activeLayer) {
      case 'ndwi':
        fillColor      = ndwiFillColor();
        outlineColor   = ndwiOutlineColor();
        fillOpacity    = 1;
        outlineOpacity = 0.9;
        break;
      case 'ndvi':
        fillColor      = ndviFillColor();
        outlineColor   = ndviOutlineColor();
        fillOpacity    = 1;
        outlineOpacity = 0.8;
        break;
      case 'ndsi':
        fillColor      = ndsiFillColor();
        outlineColor   = ndsiOutlineColor();
        fillOpacity    = 1;
        outlineOpacity = 0.85;
        break;
      case 'swir':
        fillColor      = swirFillColor();
        outlineColor   = swirOutlineColor();
        fillOpacity    = 1;
        outlineOpacity = 0.9;
        break;
      default:
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setPaintProperty(SAT_FILL_LAYER,    'fill-color',   fillColor   as any);
    map.setPaintProperty(SAT_FILL_LAYER,    'fill-opacity', fillOpacity);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setPaintProperty(SAT_OUTLINE_LAYER, 'line-color',   outlineColor as any);
    map.setPaintProperty(SAT_OUTLINE_LAYER, 'line-opacity', outlineOpacity);
    map.setPaintProperty(SAT_OUTLINE_LAYER, 'line-width',   1.5);
  }, [activeLayer, mapLoaded]);

  /* ── Re-bind pixel inspector click when layer changes ───────── */
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const handler = (
      e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }
    ) => {
      if (!e.features?.length || activeLayer === 'standard') return;
      if (popupRef.current) popupRef.current.remove();
      const popup = new maplibregl.Popup({ offset: 10, closeOnClick: true, maxWidth: '320px' })
        .setLngLat(e.lngLat)
        .setHTML(createPixelInspectorHTML(e.features[0] as unknown as GeoJSON.Feature, activeLayer))
        .addTo(map);
      popupRef.current = popup;
    };

    map.on('click', SAT_FILL_LAYER, handler);
    return () => { map.off('click', SAT_FILL_LAYER, handler); };
  }, [activeLayer, mapLoaded]);

  /* ── Marker helpers ─────────────────────────────────────────── */
  const createMarkerElement = useCallback(
    (alert: WaterAlert, isSelected: boolean): HTMLDivElement => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      const color      = SEVERITY_COLORS[alert.severity];
      const outerColor = SEVERITY_OUTER[alert.severity];
      const size       = isSelected ? 20 : 14;
      const outerSize  = isSelected ? 36 : 26;

      el.style.cssText = `position:relative;width:${outerSize}px;height:${outerSize}px;cursor:pointer;`;

      const outer = document.createElement('div');
      outer.style.cssText = `
        position:absolute;inset:0;border-radius:50%;background:${outerColor};
        ${alert.severity === 'high' || isSelected ? 'animation:marker-pulse 2s ease-out infinite;' : ''}
      `;
      outer.className = alert.severity === 'high' || isSelected ? 'marker-pulse-ring' : '';

      const inner = document.createElement('div');
      inner.style.cssText = `
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};box-shadow:0 0 ${isSelected ? 12 : 8}px ${color}80;
        border:2px solid ${isSelected ? '#fff' : 'rgba(6,10,20,.6)'};
        transition:all .2s ease;
      `;

      el.appendChild(outer);
      el.appendChild(inner);
      el.addEventListener('mouseenter', () => { inner.style.transform = 'translate(-50%,-50%) scale(1.2)'; });
      el.addEventListener('mouseleave', () => { inner.style.transform = 'translate(-50%,-50%) scale(1)'; });
      return el;
    },
    []
  );

  /* ── Markers ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const alertIds = new Set(alerts.map((a) => a.id));

    currentMarkers.forEach((marker, id) => {
      if (!alertIds.has(id)) { marker.remove(); currentMarkers.delete(id); }
    });

    alerts.forEach((alert) => {
      const existing   = currentMarkers.get(alert.id);
      const isSelected = selectedAlertId === alert.id;

      const addPopup = (m: maplibregl.Marker, el: HTMLDivElement) => {
        el.addEventListener('click', () => {
          onSelectAlert(alert.id);
          if (popupRef.current) popupRef.current.remove();
          const popup = new maplibregl.Popup({ offset: 20, closeOnClick: true, maxWidth: '300px' })
            .setLngLat([alert.lng, alert.lat])
            .setHTML(createPopupHTML(alert))
            .addTo(map);
          popupRef.current = popup;
        });
        currentMarkers.set(alert.id, m);
      };

      if (existing) {
        existing.remove();
        const newEl = createMarkerElement(alert, isSelected);
        const marker = new maplibregl.Marker({ element: newEl })
          .setLngLat([alert.lng, alert.lat])
          .addTo(map);
        addPopup(marker, newEl);
      } else {
        const el = createMarkerElement(alert, isSelected);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([alert.lng, alert.lat])
          .addTo(map);
        addPopup(marker, el);
      }
    });
  }, [alerts, selectedAlertId, mapLoaded, createMarkerElement, onSelectAlert]);

  /* ── Fly to selected alert ───────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !selectedAlertId || !mapLoaded) return;
    const alert = alerts.find((a) => a.id === selectedAlertId);
    if (!alert) return;

    mapRef.current.flyTo({ center: [alert.lng, alert.lat], zoom: 14, duration: 1200, essential: true });

    if (popupRef.current) popupRef.current.remove();
    const popup = new maplibregl.Popup({ offset: 20, closeOnClick: true, maxWidth: '300px' })
      .setLngLat([alert.lng, alert.lat])
      .setHTML(createPopupHTML(alert))
      .addTo(mapRef.current);
    popupRef.current = popup;
  }, [selectedAlertId, alerts, mapLoaded]);

  return (
    <div
      id="map-container"
      ref={containerRef}
      className="map-container w-full h-full"
      style={{ borderRadius: '0' }}
    />
  );
}
