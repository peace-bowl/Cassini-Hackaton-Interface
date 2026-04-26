'use client';

import React from 'react';
import { Waves, FileUp, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Header Component
 * ─────────────────
 * Top navigation bar with frosted glass effect.
 * Contains the project logo, title, and "Submit Report" CTA.
 */
interface HeaderProps {
  onSubmitReport: () => void;
  citySearchNode?: React.ReactNode;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function Header({ onSubmitReport, citySearchNode, theme = 'dark', onToggleTheme }: HeaderProps) {
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
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4">
        {/* Animated water icon as logo placeholder */}
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.05))',
            border: '1px solid rgba(0, 229, 255, 0.2)',
          }}
        >
          <Waves className="w-5 h-5 text-cyan" />
        </div>

        <div className="flex flex-col">
          <span
            className="font-display text-sm font-medium tracking-widest uppercase"
            style={{ color: 'var(--cyan-dim)', letterSpacing: '0.15em', fontSize: '10px' }}
          >
            {t('app.subtitle')}
          </span>
          <h1 className="font-display text-lg font-semibold text-text-primary leading-tight -mt-0.5">
            {t('app.title')}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar / Status indicator */}
      <div className="hidden md:flex items-center gap-4">
        {citySearchNode ? (
          <div className="w-64">
            {citySearchNode}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                background: 'var(--green)',
                boxShadow: '0 0 6px rgba(0, 230, 118, 0.5)',
              }}
            />
            <span className="font-body">{t('system.operational')}</span>
            <span className="mx-2 opacity-30">│</span>
            <span className="font-body opacity-60">Timișoara Region</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center h-10 px-3 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer gap-2"
          style={{ border: '1px solid var(--glass-border)' }}
          aria-label="Toggle language"
        >
          <Globe className="w-4 h-4 text-cyan" />
          <span className="font-display text-xs font-semibold text-cyan">{language.toUpperCase()}</span>
        </button>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-[rgba(0,229,255,0.05)] cursor-pointer"
            style={{ border: '1px solid var(--glass-border)' }}
            aria-label={t('theme.toggle')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-cyan" />
            ) : (
              <Moon className="w-4 h-4 text-cyan" />
            )}
          </button>
        )}

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
      </div>
    </header>
  );
}
