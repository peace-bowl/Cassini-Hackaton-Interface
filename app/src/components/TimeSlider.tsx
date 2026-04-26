'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * TimeSlider Component
 * ─────────────────────
 * Measurement-tape style time slider overlaid on the map.
 * Features ruler tick marks, instrument-panel controls,
 * and monospaced readout display.
 */
interface TimeSliderProps {
  startDate: Date;
  endDate: Date;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TimeSlider({
  startDate,
  endDate,
  currentDate,
  onDateChange,
}: TimeSliderProps) {
  const { t, language } = useLanguage();
  const locale = language === 'ro' ? 'ro-RO' : 'en-GB';
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalRange = endDate.getTime() - startDate.getTime();
  const currentProgress = currentDate.getTime() - startDate.getTime();
  const progressPercent = totalRange > 0 ? (currentProgress / totalRange) * 100 : 0;

  const stepMs = 2 * 60 * 60 * 1000;

  const advanceTime = useCallback(() => {
    onDateChange(new Date(Math.min(currentDate.getTime() + stepMs, endDate.getTime())));
  }, [currentDate, endDate, stepMs, onDateChange]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        advanceTime();
      }, 600);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, advanceTime]);

  useEffect(() => {
    if (currentDate.getTime() >= endDate.getTime()) {
      setIsPlaying(false);
    }
  }, [currentDate, endDate]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newTime = startDate.getTime() + (value / 100) * totalRange;
    onDateChange(new Date(newTime));
  };

  const handleSkipBack = () => {
    onDateChange(new Date(startDate));
    setIsPlaying(false);
  };

  const handleSkipForward = () => {
    onDateChange(new Date(endDate));
    setIsPlaying(false);
  };

  // Day markers
  const dayMarkers: { label: string; percent: number }[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    const pct = ((d.getTime() - startDate.getTime()) / totalRange) * 100;
    dayMarkers.push({
      label: d.toLocaleDateString(locale, { weekday: 'short' }),
      percent: pct,
    });
    d.setDate(d.getDate() + 1);
  }

  return (
    <div
      id="time-slider"
      className="glass-panel absolute bottom-5 left-1/2 -translate-x-1/2 z-20 rounded-xl"
      style={{
        width: 'min(600px, calc(100% - 80px))',
        padding: '14px 20px 12px',
      }}
    >
      {/* Top row: label + readout + controls */}
      <div className="flex items-center justify-between mb-3">
        {/* Left: label */}
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" style={{ color: 'var(--gold-dim)' }} />
          <span className="font-display text-[9px] font-bold text-text-muted tracking-[0.15em] uppercase">
            {t('timeline.title')}
          </span>
        </div>

        {/* Center: playback controls */}
        <div className="flex items-center gap-1.5">
          <button
            id="time-skip-back"
            onClick={handleSkipBack}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-200 cursor-pointer"
            style={{
              background: 'var(--trench)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Skip to start"
          >
            <SkipBack className="w-3 h-3" />
          </button>

          <button
            id="time-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              background: isPlaying
                ? 'rgba(212, 168, 67, 0.15)'
                : 'var(--gold)',
              border: isPlaying
                ? '1px solid rgba(212, 168, 67, 0.3)'
                : '1px solid var(--gold)',
              color: isPlaying ? 'var(--gold)' : 'var(--abyss)',
              boxShadow: isPlaying ? 'none' : '0 1px 6px rgba(212, 168, 67, 0.3)',
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          <button
            id="time-skip-forward"
            onClick={handleSkipForward}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-200 cursor-pointer"
            style={{
              background: 'var(--trench)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Skip to end"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>

        {/* Right: date/time readout */}
        <div className="flex items-center gap-1.5">
          <span className="font-body text-[13px] text-text-primary font-semibold">
            {new Date(currentDate).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          <span className="text-text-muted text-xs">·</span>
          <span
            className="font-body text-[13px] font-bold tabular-nums"
            style={{ color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}
          >
            {formatTime(currentDate)}
          </span>
        </div>
      </div>

      {/* Slider Track — measurement tape */}
      <div className="relative mb-1.5">
        {/* Track background */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[6px] rounded-sm"
          style={{ background: 'var(--trench)', border: '1px solid var(--glass-border)' }}
        >
          {/* Filled portion */}
          <div
            className="absolute top-0 left-0 h-full rounded-sm transition-all duration-100"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, var(--gold-dim), var(--gold))`,
              boxShadow: '0 0 8px rgba(212, 168, 67, 0.25)',
            }}
          />
        </div>

        {/* Day tick marks */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[6px] pointer-events-none">
          {dayMarkers.map((marker, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-px h-3"
              style={{
                left: `${marker.percent}%`,
                background: 'var(--surface)',
              }}
            />
          ))}
        </div>

        {/* Native range input */}
        <input
          id="time-slider-input"
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={progressPercent}
          onChange={handleSliderChange}
          className="relative z-10 w-full h-6 appearance-none bg-transparent cursor-pointer"
          style={{ WebkitAppearance: 'none' }}
          aria-label="Time range slider"
        />

        <style>{`
          #time-slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 3px;
            background: var(--gold);
            border: 2px solid var(--deep);
            box-shadow: 0 0 8px rgba(212, 168, 67, 0.4);
            cursor: pointer;
            transition: transform 0.15s ease;
          }
          #time-slider-input::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          #time-slider-input::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 3px;
            background: var(--gold);
            border: 2px solid var(--deep);
            box-shadow: 0 0 8px rgba(212, 168, 67, 0.4);
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* Day labels */}
      <div className="relative h-3">
        {dayMarkers.map((marker, i) => (
          <span
            key={i}
            className="absolute text-[8px] font-display font-semibold text-text-muted -translate-x-1/2 tracking-wider uppercase"
            style={{ left: `${marker.percent}%` }}
          >
            {marker.label}
          </span>
        ))}
      </div>
    </div>
  );
}
