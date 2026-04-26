'use client';

import React from 'react';
import {
  AlertTriangle,
  Droplets,
  Info,
  ChevronUp,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { WaterAlert, Severity } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * AlertPanel Component
 * ─────────────────────
 * Bottom drawer displaying active water alerts.
 * Collapsed: thin strip showing severity counts.
 * Expanded: scrollable card grid.
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
      return <AlertTriangle className="w-3.5 h-3.5 text-red" />;
    case 'medium':
      return <Droplets className="w-3.5 h-3.5 text-amber" />;
    case 'low':
      return <Info className="w-3.5 h-3.5 text-cyan" />;
  }
}

export default function AlertPanel({
  alerts,
  selectedAlertId,
  onSelectAlert,
  isCollapsed,
  onToggleCollapse,
}: AlertPanelProps) {
  const { t, language } = useLanguage();

  function severityLabel(severity: Severity): string {
    switch (severity) {
      case 'high': return t('alert.level.critical');
      case 'medium': return t('alert.level.warning');
      case 'low': return t('alert.level.info');
    }
  }

  function timeAgo(timestamp: string): string {
    const now = new Date('2026-04-25T12:00:00Z');
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'ro') {
      if (diffDays > 0) return `acum ${diffDays}z`;
      if (diffHours > 0) return `acum ${diffHours}h`;
      return t('alert.time.justNow');
    }
    if (diffDays > 0) return `${diffDays}d ${t('alert.time.ago')}`;
    if (diffHours > 0) return `${diffHours}h ${t('alert.time.ago')}`;
    return t('alert.time.justNow');
  }

  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const medCount = alerts.filter((a) => a.severity === 'medium').length;
  const lowCount = alerts.filter((a) => a.severity === 'low').length;

  return (
    <div
      className="glass-panel drawer-transition flex flex-col overflow-hidden"
      style={{
        height: isCollapsed ? '44px' : '280px',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: '1.5px solid var(--glass-border)',
      }}
    >
      {/* Drawer Handle */}
      <button
        id="alert-panel-toggle"
        onClick={onToggleCollapse}
        className="flex items-center justify-between px-5 h-[44px] flex-shrink-0 cursor-pointer transition-colors hover:bg-[rgba(212,168,67,0.03)]"
        style={{ borderBottom: isCollapsed ? 'none' : '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <Activity className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          <span className="font-display text-[11px] font-bold tracking-wider uppercase text-text-primary">
            {t('panel.alerts.title')}
          </span>
          <span
            className="font-display text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              background: 'rgba(212, 168, 67, 0.1)',
              color: 'var(--gold)',
              border: '1px solid rgba(212, 168, 67, 0.15)',
            }}
          >
            {alerts.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Severity LED dots */}
          <div className="flex items-center gap-3 text-[10px] text-text-muted font-body">
            <div className="flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full severity-dot-high" />
              <span>{highCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full severity-dot-medium" />
              <span>{medCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full severity-dot-low" />
              <span>{lowCount}</span>
            </div>
          </div>

          {isCollapsed ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>

      {/* Alert Cards — scrollable horizontal/grid */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {alerts.map((alert, index) => {
              const isSelected = selectedAlertId === alert.id;

              const severityStripeColor =
                alert.severity === 'high'
                  ? 'var(--red)'
                  : alert.severity === 'medium'
                  ? 'var(--amber)'
                  : 'var(--cyan)';

              return (
                <button
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  onClick={() => onSelectAlert(alert.id)}
                  className="animate-fade-in w-full text-left p-3 rounded-lg transition-all duration-200 cursor-pointer group flex gap-3"
                  style={{
                    animationDelay: `${index * 40}ms`,
                    background: isSelected
                      ? 'rgba(212, 168, 67, 0.08)'
                      : 'var(--alert-card-bg)',
                    border: isSelected
                      ? '1px solid rgba(212, 168, 67, 0.25)'
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
                  {/* Severity stripe */}
                  <div
                    className="w-[3px] rounded-full flex-shrink-0 self-stretch"
                    style={{ background: severityStripeColor }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Top row: severity + time */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <SeverityIcon severity={alert.severity} />
                        <span
                          className="text-[9px] font-display font-bold uppercase tracking-wider"
                          style={{
                            color: severityStripeColor,
                          }}
                        >
                          {severityLabel(alert.severity)}
                        </span>
                      </div>
                      <span className="text-[9px] text-text-muted font-body font-medium tabular-nums flex-shrink-0">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>

                    {/* Location */}
                    <h3 className="text-[13px] font-display font-semibold text-text-primary truncate mb-0.5">
                      {alert.location}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-text-secondary font-body leading-snug line-clamp-2">
                      {alert.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
