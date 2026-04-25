'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

/**
 * TimeSlider Component
 * ─────────────────────
 * Floating overlay time slider for filtering map data
 * across a 7-day historical window. Includes play/pause
 * auto-advance functionality.
 */
interface TimeSliderProps {
  startDate: Date;
  endDate: Date;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

/** Format date for display */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
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
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalRange = endDate.getTime() - startDate.getTime();
  const currentProgress = currentDate.getTime() - startDate.getTime();
  const progressPercent = totalRange > 0 ? (currentProgress / totalRange) * 100 : 0;

  // Step size: ~2 hours per tick
  const stepMs = 2 * 60 * 60 * 1000;

  const advanceTime = useCallback(() => {
    onDateChange(new Date(Math.min(currentDate.getTime() + stepMs, endDate.getTime())));
  }, [currentDate, endDate, stepMs, onDateChange]);

  // Auto-advance effect
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

  // Stop playing at end
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

  // Generate day markers for the track
  const dayMarkers: { label: string; percent: number }[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    const pct = ((d.getTime() - startDate.getTime()) / totalRange) * 100;
    dayMarkers.push({
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      percent: pct,
    });
    d.setDate(d.getDate() + 1);
  }

  return (
    <div
      id="time-slider"
      className="glass-panel absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-6 py-4 rounded-2xl"
      style={{ width: 'min(640px, calc(100% - 48px))' }}
    >
      {/* Top row: date display + controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-dim" />
          <span className="font-display text-xs font-medium text-text-secondary tracking-wide uppercase">
            Timeline
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-body text-sm text-text-primary font-medium">
            {formatDate(currentDate)}
          </span>
          <span className="text-text-muted mx-1">·</span>
          <span className="font-body text-sm text-cyan tabular-nums">
            {formatTime(currentDate)}
          </span>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative mb-2">
        {/* Custom track background */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full"
          style={{ background: 'var(--trench)' }}
        >
          {/* Filled portion */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--cyan-dim), var(--cyan))',
              boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
            }}
          />
        </div>

        {/* Day tick marks */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 pointer-events-none">
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

        {/* Native range input (invisible, for interaction) */}
        <input
          id="time-slider-input"
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={progressPercent}
          onChange={handleSliderChange}
          className="relative z-10 w-full h-6 appearance-none bg-transparent cursor-pointer"
          style={{
            WebkitAppearance: 'none',
          }}
          aria-label="Time range slider"
        />

        {/* Custom styles for range thumb via inline style tag */}
        <style>{`
          #time-slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--cyan);
            border: 2px solid var(--deep);
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
            cursor: pointer;
            transition: transform 0.15s ease;
          }
          #time-slider-input::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
          #time-slider-input::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--cyan);
            border: 2px solid var(--deep);
            box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* Day labels */}
      <div className="relative h-4 mb-3">
        {dayMarkers.map((marker, i) => (
          <span
            key={i}
            className="absolute text-[10px] font-body text-text-muted -translate-x-1/2"
            style={{ left: `${marker.percent}%` }}
          >
            {marker.label}
          </span>
        ))}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          id="time-skip-back"
          onClick={handleSkipBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
          style={{
            background: 'var(--alert-card-hover)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Skip to start"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          id="time-play-pause"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{
            background: isPlaying
              ? 'rgba(0, 229, 255, 0.15)'
              : 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.04))',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: 'var(--cyan)',
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <button
          id="time-skip-forward"
          onClick={handleSkipForward}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
          style={{
            background: 'var(--alert-card-hover)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Skip to end"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
