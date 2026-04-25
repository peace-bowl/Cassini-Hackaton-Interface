'use client';

import React from 'react';
import {
  AlertTriangle,
  Droplets,
  Info,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { WaterAlert, Severity } from '@/data/mockData';

/**
 * AlertPanel Component
 * ─────────────────────
 * Collapsible right sidebar displaying active water alerts.
 * Clicking an alert card highlights the corresponding map marker.
 */
interface AlertPanelProps {
  alerts: WaterAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/** Severity-to-icon mapping */
function SeverityIcon({ severity }: { severity: Severity }) {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="w-4 h-4 text-red" />;
    case 'medium':
      return <Droplets className="w-4 h-4 text-amber" />;
    case 'low':
      return <Info className="w-4 h-4 text-cyan" />;
  }
}

/** Severity label styling */
function severityLabel(severity: Severity): string {
  switch (severity) {
    case 'high':
      return 'Critical';
    case 'medium':
      return 'Warning';
    case 'low':
      return 'Info';
  }
}

/** Relative time formatter */
function timeAgo(timestamp: string): string {
  const now = new Date('2026-04-25T12:00:00Z');
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}

export default function AlertPanel({
  alerts,
  selectedAlertId,
  onSelectAlert,
  isCollapsed,
  onToggleCollapse,
}: AlertPanelProps) {
  // Count by severity
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const medCount = alerts.filter((a) => a.severity === 'medium').length;
  const lowCount = alerts.filter((a) => a.severity === 'low').length;

  return (
    <div className="relative flex h-full">
      {/* Collapse Toggle Button */}
      <button
        id="alert-panel-toggle"
        onClick={onToggleCollapse}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-12 flex items-center justify-center rounded-l-lg cursor-pointer transition-colors duration-200"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRight: 'none',
          color: 'var(--text-secondary)',
        }}
        aria-label={isCollapsed ? 'Expand alerts panel' : 'Collapse alerts panel'}
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Panel Content */}
      <div
        className={`glass-panel h-full flex flex-col transition-all duration-500 ease-out overflow-hidden ${
          isCollapsed ? 'w-0 opacity-0 border-0' : 'w-[360px] opacity-100'
        }`}
        style={{
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
        }}
      >
        {/* Panel Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan" />
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase text-text-primary">
              Active Alerts
            </h2>
            <span
              className="ml-auto font-body text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                color: 'var(--cyan)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
              }}
            >
              {alerts.length}
            </span>
          </div>

          {/* Severity Breakdown Bar */}
          <div className="flex items-center gap-3 text-xs text-text-muted font-body">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full severity-dot-high" />
              <span>{highCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full severity-dot-medium" />
              <span>{medCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full severity-dot-low" />
              <span>{lowCount}</span>
            </div>
          </div>
        </div>

        {/* Alert Cards List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {alerts.map((alert, index) => {
            const isSelected = selectedAlertId === alert.id;

            return (
              <button
                key={alert.id}
                id={`alert-card-${alert.id}`}
                onClick={() => onSelectAlert(alert.id)}
                className="animate-fade-in w-full text-left p-4 rounded-xl transition-all duration-200 cursor-pointer group"
                style={{
                  animationDelay: `${index * 50}ms`,
                  background: isSelected
                    ? 'rgba(0, 229, 255, 0.08)'
                    : 'var(--alert-card-bg)',
                  border: isSelected
                    ? '1px solid rgba(0, 229, 255, 0.25)'
                    : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--alert-card-hover)';
                    e.currentTarget.style.border = '1px solid var(--alert-card-hover-border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--alert-card-bg)';
                    e.currentTarget.style.border = '1px solid transparent';
                  }
                }}
              >
                {/* Card Header: Icon + Location + Time */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                    style={{
                      background:
                        alert.severity === 'high'
                          ? 'rgba(255, 61, 61, 0.1)'
                          : alert.severity === 'medium'
                          ? 'rgba(255, 145, 0, 0.1)'
                          : 'rgba(0, 229, 255, 0.1)',
                    }}
                  >
                    <SeverityIcon severity={alert.severity} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[10px] font-display font-medium uppercase tracking-wider"
                        style={{
                          color:
                            alert.severity === 'high'
                              ? 'var(--red)'
                              : alert.severity === 'medium'
                              ? 'var(--amber)'
                              : 'var(--cyan)',
                        }}
                      >
                        {severityLabel(alert.severity)} · {alert.type}
                      </span>
                      <span className="text-[10px] text-text-muted font-body flex-shrink-0">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>

                    <h3 className="text-sm font-display font-medium text-text-primary truncate mb-1">
                      {alert.location}
                    </h3>

                    <p className="text-xs text-text-secondary font-body leading-relaxed line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
