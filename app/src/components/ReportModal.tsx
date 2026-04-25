'use client';

import React, { useState } from 'react';
import { X, Upload, MapPin, Calendar, FileText, ChevronDown } from 'lucide-react';

/**
 * ReportModal Component
 * ──────────────────────
 * Modal overlay for submitting incident reports.
 * Features: incident type dropdown, auto-filled coordinates,
 * date picker, description textarea, and drag-and-drop image zone.
 */
interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const INCIDENT_TYPES = ['Leak', 'Flood', 'Drought', 'Contamination', 'Other'] as const;

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [incidentType, setIncidentType] = useState<string>('');
  const [latitude, setLatitude] = useState('45.7489');
  const [longitude, setLongitude] = useState('21.2087');
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
    // Reset form
    setIncidentType('');
    setDescription('');
    setDateTime('');
    setFileName(null);
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

  const inputBaseStyle = {
    background: 'var(--trench)',
    border: '1px solid var(--shelf)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal Panel */}
      <div
        className="glass-panel relative z-10 w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          animation: 'fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Submit Incident Report
            </h2>
            <p className="font-body text-xs text-text-muted mt-0.5">
              Report a water-related incident in the Timișoara region
            </p>
          </div>
          <button
            id="modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{
              background: 'rgba(26, 41, 64, 0.5)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Incident Type Dropdown */}
          <div>
            <label
              htmlFor="incident-type"
              className="flex items-center gap-1.5 text-xs font-display font-medium text-text-secondary uppercase tracking-wider mb-2"
            >
              <FileText className="w-3 h-3" />
              Incident Type
            </label>
            <div className="relative">
              <select
                id="incident-type"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl font-body text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan/30"
                style={inputBaseStyle}
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
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              />
            </div>
          </div>

          {/* Coordinates (auto-filled) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-display font-medium text-text-secondary uppercase tracking-wider mb-2">
              <MapPin className="w-3 h-3" />
              Location Coordinates
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  id="report-latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="w-full px-4 py-3 rounded-xl font-body text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-cyan/30"
                  style={inputBaseStyle}
                />
                <span className="text-[10px] text-text-muted font-body mt-1 block">Latitude</span>
              </div>
              <div>
                <input
                  id="report-longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="w-full px-4 py-3 rounded-xl font-body text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-cyan/30"
                  style={inputBaseStyle}
                />
                <span className="text-[10px] text-text-muted font-body mt-1 block">Longitude</span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label
              htmlFor="report-datetime"
              className="flex items-center gap-1.5 text-xs font-display font-medium text-text-secondary uppercase tracking-wider mb-2"
            >
              <Calendar className="w-3 h-3" />
              Date & Time
            </label>
            <input
              id="report-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:ring-1 focus:ring-cyan/30"
              style={{
                ...inputBaseStyle,
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="report-description"
              className="flex items-center gap-1.5 text-xs font-display font-medium text-text-secondary uppercase tracking-wider mb-2"
            >
              Description
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail…"
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl font-body text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan/30"
              style={inputBaseStyle}
            />
          </div>

          {/* Image Drag & Drop Zone */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-display font-medium text-text-secondary uppercase tracking-wider mb-2">
              Image Attachment
            </label>
            <div
              id="image-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer"
              style={{
                border: isDragging
                  ? '2px dashed var(--cyan)'
                  : '2px dashed var(--shelf)',
                background: isDragging
                  ? 'rgba(0, 229, 255, 0.04)'
                  : 'rgba(13, 21, 37, 0.3)',
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
                className="w-6 h-6"
                style={{ color: isDragging ? 'var(--cyan)' : 'var(--text-muted)' }}
              />
              {fileName ? (
                <span className="font-body text-sm text-cyan">{fileName}</span>
              ) : (
                <>
                  <span className="font-body text-sm text-text-secondary">
                    Drag & drop an image, or <span className="text-cyan">browse</span>
                  </span>
                  <span className="font-body text-[10px] text-text-muted">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <button
            id="modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-display text-sm font-medium transition-colors duration-200 cursor-pointer"
            style={{
              background: 'rgba(26, 41, 64, 0.5)',
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
            className="btn-glow px-6 py-2.5 rounded-xl font-display text-sm font-medium transition-all duration-300 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(0, 229, 255, 0.08))',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: 'var(--cyan)',
            }}
          >
            Submit Report
          </button>
        </div>
      </div>

      {/* Inline keyframes for fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
