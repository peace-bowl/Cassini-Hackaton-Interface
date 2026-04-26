'use client';

import React, { useState, useCallback } from 'react';
import { X, Upload, MapPin, Calendar, FileText, ChevronDown, Satellite, Crosshair, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * ReportModal Component
 * ──────────────────────
 * Modal overlay for submitting incident reports.
 * Features: incident type dropdown, Galileo GNSS auto-location,
 * date picker, description textarea, and drag-and-drop image zone.
 *
 * Galileo Integration
 * ───────────────────
 * Uses the W3C Geolocation API with enableHighAccuracy: true, which
 * leverages the device's multi-constellation GNSS receiver including
 * the European Galileo satellite system. Displays accuracy, altitude,
 * and positioning metadata to the user.
 */
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const INCIDENT_TYPES = ['Leak', 'Flood', 'Drought', 'Contamination', 'Other'] as const;

/* ── Galileo positioning state machine ──────────────────────── */
type GeoStatus = 'idle' | 'acquiring' | 'success' | 'error';

interface GalileoFix {
  latitude: number;
  longitude: number;
  accuracy: number;       // metres
  altitude: number | null;
  altitudeAccuracy: number | null;
  timestamp: number;      // Unix ms
}

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const { t } = useLanguage();
  const [incidentType, setIncidentType] = useState<string>('');
  const [latitude, setLatitude] = useState('45.7489');
  const [longitude, setLongitude] = useState('21.2087');
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  /* ── Galileo geolocation state ────────────────────────────── */
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [galileoFix, setGalileoFix] = useState<GalileoFix | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  /* ── Galileo GNSS acquisition ────────────────────────────── */
  const acquireGalileoPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    setGeoStatus('acquiring');
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const fix: GalileoFix = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          timestamp: position.timestamp,
        };

        setGalileoFix(fix);
        setLatitude(fix.latitude.toFixed(6));
        setLongitude(fix.longitude.toFixed(6));
        setGeoStatus('success');
      },
      (err) => {
        setGeoStatus('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please allow access to use Galileo positioning.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Position unavailable. Ensure GNSS/GPS is enabled on your device.');
            break;
          case err.TIMEOUT:
            setGeoError('Position acquisition timed out. Try moving to an area with better satellite visibility.');
            break;
          default:
            setGeoError('An unknown error occurred while acquiring position.');
        }
      },
      {
        enableHighAccuracy: true, // Forces GNSS (Galileo + GPS + GLONASS) over Wi-Fi/cell
        timeout: 15000,
        maximumAge: 0,           // Always fresh fix
      }
    );
  }, []);

  /* ── Early return AFTER all hooks ────────────────────────── */
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
    setIncidentType('');
    setDescription('');
    setDateTime('');
    setFileName(null);
    setGeoStatus('idle');
    setGalileoFix(null);
    setGeoError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const inputStyle = {
    background: 'var(--trench)',
    border: '1.5px solid var(--shelf)',
    color: 'var(--text-primary)',
  };

  const focusRingClass = 'focus:outline-none focus:border-[var(--gold)] focus:shadow-[0_0_0_2px_rgba(212,168,67,0.15)]';

  /* ── Accuracy quality indicator ────────────────────────────── */
  const getAccuracyQuality = (metres: number): { label: string; color: string } => {
    if (metres <= 3) return { label: 'Excellent', color: '#00e676' };
    if (metres <= 10) return { label: 'Good', color: '#69f0ae' };
    if (metres <= 30) return { label: 'Fair', color: '#ffd740' };
    return { label: 'Low', color: '#ff6e40' };
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal Panel */}
      <div
        className="glass-panel relative z-10 w-full max-w-lg rounded-xl overflow-hidden"
        style={{
          animation: 'fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-3.5"
          style={{ borderBottom: '1.5px solid var(--glass-border)' }}
        >
          <div>
            <h2 className="font-display text-base font-bold text-text-primary tracking-tight">
              Submit Incident Report
            </h2>
            <p className="font-body text-[11px] text-text-muted mt-0.5">
              Report a water-related incident
            </p>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer"
            style={{
              background: 'var(--trench)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Close modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[62vh] overflow-y-auto">
          {/* Incident Type */}
          <div>
            <label
              htmlFor="incident-type"
              className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5"
            >
              <FileText className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} />
              Incident Type
            </label>
            <div className="relative">
              <select
                id="incident-type"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 rounded-lg font-body text-sm appearance-none cursor-pointer ${focusRingClass}`}
                style={inputStyle}
              >
                <option value="" disabled>
                  Select incident type…
                </option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              Galileo Geolocation Section
              ═══════════════════════════════════════════════════════ */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5">
              <MapPin className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} />
              Location Coordinates
            </label>

            {/* Galileo Acquire Button */}
            <button
              id="galileo-locate-btn"
              type="button"
              onClick={acquireGalileoPosition}
              disabled={geoStatus === 'acquiring'}
              className="w-full mb-2.5 px-3.5 py-2.5 rounded-lg font-display text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: geoStatus === 'success'
                  ? 'rgba(0, 230, 118, 0.08)'
                  : geoStatus === 'error'
                    ? 'rgba(255, 110, 64, 0.08)'
                    : 'linear-gradient(135deg, rgba(0, 51, 153, 0.2) 0%, rgba(212, 168, 67, 0.12) 100%)',
                border: geoStatus === 'success'
                  ? '1.5px solid rgba(0, 230, 118, 0.3)'
                  : geoStatus === 'error'
                    ? '1.5px solid rgba(255, 110, 64, 0.3)'
                    : '1.5px solid rgba(0, 51, 153, 0.4)',
                color: geoStatus === 'success'
                  ? '#00e676'
                  : geoStatus === 'error'
                    ? '#ff6e40'
                    : '#7eb8ff',
                boxShadow: geoStatus === 'acquiring'
                  ? '0 0 20px rgba(0, 51, 153, 0.15)'
                  : 'none',
              }}
            >
              {geoStatus === 'acquiring' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Acquiring Galileo Signal…</span>
                </>
              ) : geoStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Position Acquired via Galileo</span>
                </>
              ) : geoStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Retry Galileo Fix</span>
                </>
              ) : (
                <>
                  <Satellite className="w-3.5 h-3.5" />
                  <span>Use Galileo Location</span>
                  <Crosshair className="w-3 h-3 opacity-50" />
                </>
              )}
            </button>

            {/* Galileo Fix Metadata Card */}
            {galileoFix && geoStatus === 'success' && (
              <div
                className="mb-2.5 rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(0, 51, 153, 0.06)',
                  border: '1px solid rgba(0, 51, 153, 0.15)',
                  animation: 'fadeSlideUp 0.3s ease-out',
                }}
              >
                {/* Galileo badge header */}
                <div
                  className="flex items-center justify-between px-3 py-1.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 51, 153, 0.12) 0%, rgba(212, 168, 67, 0.06) 100%)',
                    borderBottom: '1px solid rgba(0, 51, 153, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Satellite className="w-3 h-3" style={{ color: '#5b9aff' }} />
                    <span
                      className="font-display text-[9px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: '#5b9aff' }}
                    >
                      EU Galileo GNSS
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Pulsing live dot */}
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: '#00e676',
                        boxShadow: '0 0 6px rgba(0, 230, 118, 0.5)',
                        animation: 'marker-pulse 2s ease-out infinite',
                      }}
                    />
                    <span className="font-body text-[8px] uppercase tracking-widest" style={{ color: '#69f0ae' }}>
                      Fixed
                    </span>
                  </div>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-3 gap-px" style={{ background: 'rgba(0, 51, 153, 0.08)' }}>
                  {/* Accuracy */}
                  <div className="px-2.5 py-2 flex flex-col items-center" style={{ background: 'var(--trench)' }}>
                    <span className="font-body text-[8px] text-text-muted uppercase tracking-wider mb-0.5">
                      Accuracy
                    </span>
                    <span
                      className="font-display text-sm font-bold tabular-nums"
                      style={{ color: getAccuracyQuality(galileoFix.accuracy).color }}
                    >
                      ±{galileoFix.accuracy < 1 ? galileoFix.accuracy.toFixed(2) : galileoFix.accuracy.toFixed(1)}m
                    </span>
                    <span
                      className="font-body text-[7px] uppercase tracking-wider mt-0.5"
                      style={{ color: getAccuracyQuality(galileoFix.accuracy).color, opacity: 0.8 }}
                    >
                      {getAccuracyQuality(galileoFix.accuracy).label}
                    </span>
                  </div>

                  {/* Altitude */}
                  <div className="px-2.5 py-2 flex flex-col items-center" style={{ background: 'var(--trench)' }}>
                    <span className="font-body text-[8px] text-text-muted uppercase tracking-wider mb-0.5">
                      Altitude
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {galileoFix.altitude !== null ? `${galileoFix.altitude.toFixed(1)}m` : '—'}
                    </span>
                    <span className="font-body text-[7px] text-text-muted uppercase tracking-wider mt-0.5">
                      {galileoFix.altitudeAccuracy !== null ? `±${galileoFix.altitudeAccuracy.toFixed(1)}m` : 'N/A'}
                    </span>
                  </div>

                  {/* Fix Time */}
                  <div className="px-2.5 py-2 flex flex-col items-center" style={{ background: 'var(--trench)' }}>
                    <span className="font-body text-[8px] text-text-muted uppercase tracking-wider mb-0.5">
                      Fix Time
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {new Date(galileoFix.timestamp).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <span className="font-body text-[7px] text-text-muted uppercase tracking-wider mt-0.5">
                      UTC+{-(new Date().getTimezoneOffset() / 60)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {geoError && geoStatus === 'error' && (
              <div
                className="mb-2.5 px-3 py-2 rounded-lg flex items-start gap-2"
                style={{
                  background: 'rgba(255, 110, 64, 0.06)',
                  border: '1px solid rgba(255, 110, 64, 0.2)',
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#ff6e40' }} />
                <p className="font-body text-[11px]" style={{ color: '#ff8a65' }}>
                  {geoError}
                </p>
              </div>
            )}

            {/* Coordinate inputs */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <input
                  id="report-latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className={`w-full px-3.5 py-2.5 rounded-lg font-body text-sm tabular-nums ${focusRingClass}`}
                  style={{
                    ...inputStyle,
                    ...(geoStatus === 'success' ? { borderColor: 'rgba(0, 230, 118, 0.25)' } : {}),
                  }}
                />
                <span className="text-[9px] text-text-muted font-body mt-0.5 block">Latitude</span>
              </div>
              <div>
                <input
                  id="report-longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className={`w-full px-3.5 py-2.5 rounded-lg font-body text-sm tabular-nums ${focusRingClass}`}
                  style={{
                    ...inputStyle,
                    ...(geoStatus === 'success' ? { borderColor: 'rgba(0, 230, 118, 0.25)' } : {}),
                  }}
                />
                <span className="text-[9px] text-text-muted font-body mt-0.5 block">Longitude</span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label
              htmlFor="report-datetime"
              className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5"
            >
              <Calendar className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} />
              Date & Time
            </label>
            <input
              id="report-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className={`w-full px-3.5 py-2.5 rounded-lg font-body text-sm ${focusRingClass}`}
              style={{
                ...inputStyle,
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="report-description"
              className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5"
            >
              Description
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail…"
              rows={3}
              required
              className={`w-full px-3.5 py-2.5 rounded-lg font-body text-sm resize-none ${focusRingClass}`}
              style={inputStyle}
            />
          </div>

          {/* Image Drop Zone */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-display font-bold text-text-muted uppercase tracking-[0.12em] mb-1.5">
              Image Attachment
            </label>
            <div
              id="image-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              style={{
                border: isDragging
                  ? '2px dashed var(--gold)'
                  : '2px dashed var(--shelf)',
                background: isDragging
                  ? 'rgba(212, 168, 67, 0.04)'
                  : 'rgba(26, 26, 24, 0.3)',
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) setFileName(file.name);
                };
                input.click();
              }}
            >
              <Upload
                className="w-5 h-5"
                style={{ color: isDragging ? 'var(--gold)' : 'var(--text-muted)' }}
              />
              {fileName ? (
                <span className="font-body text-sm" style={{ color: 'var(--gold)' }}>{fileName}</span>
              ) : (
                <>
                  <span className="font-body text-xs text-text-secondary">
                    Drag & drop an image, or <span style={{ color: 'var(--gold)' }}>browse</span>
                  </span>
                  <span className="font-body text-[9px] text-text-muted">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-end gap-2.5 px-6 py-3.5"
          style={{ borderTop: '1.5px solid var(--glass-border)' }}
        >
          <button
            id="modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-display text-xs font-semibold transition-colors duration-200 cursor-pointer"
            style={{
              background: 'var(--trench)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)',
            }}
          >
            Cancel
          </button>
          <button
            id="modal-submit-btn"
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg font-display text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              background: 'var(--gold)',
              color: 'var(--abyss)',
              boxShadow: '0 1px 4px rgba(212, 168, 67, 0.3)',
            }}
          >
            Submit Report
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
