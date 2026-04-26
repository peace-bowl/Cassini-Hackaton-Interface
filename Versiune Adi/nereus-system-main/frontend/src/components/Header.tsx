import React from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Globe, Info, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onSubmitReport: () => void;
  onSubscribe?: () => void;
  citySearchNode?: React.ReactNode;
  cityName?: string;
  scanning?: boolean;
  onScan?: () => void;
  lastScanResult?: any;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
}

export default function Header({ onSubmitReport, onSubscribe, citySearchNode, scanning, onScan, lastScanResult, showHeatmap, onToggleHeatmap }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ro' : 'en');
  };

  return (
    <header
      id="main-header"
      className="glass-panel fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
    >
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <img
          src="/logo-solid.png"
          alt="The Nereus System"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
        />
      </Link>

      <div className="hidden md:flex items-center gap-4">
        {citySearchNode ? (
          <div className="w-64">
            {citySearchNode}
          </div>
        ) : null}

        {onScan && (
          <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
            {onToggleHeatmap && (
              <button
                onClick={onToggleHeatmap}
                className="flex items-center gap-2 rounded-md font-display font-medium transition-all"
                style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  background: showHeatmap ? 'rgba(0,229,255,0.15)' : 'transparent',
                  border: `1px solid ${showHeatmap ? 'var(--cyan)' : 'rgba(255,255,255,0.2)'}`,
                  color: showHeatmap ? 'var(--cyan)' : 'rgba(255,255,255,0.6)',
                }}
              >
                Heatmap: {showHeatmap ? 'ON' : 'OFF'}
              </button>
            )}
            <button
              onClick={onScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-md font-display font-medium transition-all"
              style={{
                fontSize: '13px',
                padding: '6px 12px',
                cursor: scanning ? 'wait' : 'pointer',
                background: scanning ? 'rgba(0,229,255,0.08)' : 'rgba(0,229,255,0.15)',
                border: `1px solid ${scanning ? 'rgba(0,229,255,0.2)' : 'var(--cyan)'}`,
                color: scanning ? 'rgba(0,229,255,0.5)' : 'var(--cyan)',
              }}
            >
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: scanning ? 'var(--cyan)' : 'transparent',
                border: '1px solid var(--cyan)',
                animation: scanning ? 'pulse-ring 1.2s ease-out infinite' : 'none',
              }} />
              {scanning ? (
                <span className="animate-pulse">Scanning...</span>
              ) : (
                <span>Trigger Scan</span>
              )}
            </button>

            {lastScanResult && !scanning && (
              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--cyan)' }}>
                <span className="text-white/40">│</span>
                <span style={{ background: 'rgba(0,229,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {lastScanResult.alerts_created} anomalies
                </span>
                <span className="text-white/40">({lastScanResult.scene_date})</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link to="/about" style={{ textDecoration: 'none' }}>
          <button
            className="flex items-center justify-center h-10 px-3 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer gap-2"
            style={{ border: '1px solid var(--glass-border)' }}
            aria-label="About"
          >
            <Info className="w-4 h-4 text-cyan" />
            <span className="font-display text-xs font-semibold text-cyan">About</span>
          </button>
        </Link>

        <Link to="/demo" style={{ textDecoration: 'none' }}>
          <button
            className="flex items-center justify-center h-10 px-3 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer gap-2"
            style={{ border: '1px solid var(--glass-border)' }}
            aria-label="Demo"
          >
            <span className="font-display text-xs font-semibold text-cyan">Demo</span>
          </button>
        </Link>

        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center h-10 px-3 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer gap-2"
          style={{ border: '1px solid var(--glass-border)' }}
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4 text-cyan" />
          <span className="font-display text-xs font-semibold text-cyan">{language.toUpperCase()}</span>
        </button>

        <button
          id="submit-report-btn"
          onClick={onSubmitReport}
          className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-lg font-display text-sm font-medium transition-all duration-300 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.04))',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: 'var(--cyan)',
          }}
        >
          <FileUp className="w-4 h-4" />
          {t('action.submitReport')}
        </button>

        {onSubscribe && (
          <button
            id="subscribe-btn"
            onClick={onSubscribe}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-sm font-medium transition-all duration-300 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(255,200,0,0.12), rgba(255,200,0,0.04))',
              border: '1px solid rgba(255,200,0,0.25)',
              color: '#ffd700',
            }}
          >
            <Bell className="w-4 h-4" />
            Get Alerts
          </button>
        )}
      </div>
    </header>
  );
}
