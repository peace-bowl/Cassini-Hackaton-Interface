'use client';

import React from 'react';
import { FileUp, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

/**
 * Header Component
 * ─────────────────
 * Compact instrument-strip navigation bar.
 * Contains the Nereus logo, project title, city search, and action controls.
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
      className="glass-panel fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-[52px]"
      style={{
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1.5px solid var(--glass-border)',
      }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        {/* Nereus Logo */}
        <div className="flex items-center justify-center w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src="/nereus-logo.png"
            alt="Nereus System Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>

        <div className="flex flex-col leading-none">
          <span
            className="font-display text-[9px] font-semibold tracking-[0.2em] uppercase"
            style={{ color: 'var(--gold-dim)' }}
          >
            {t('app.subtitle')}
          </span>
          <h1 className="font-display text-[15px] font-bold text-text-primary tracking-tight">
            {t('app.title')}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar / Status indicator */}
      <div className="hidden md:flex items-center gap-4">
        {citySearchNode ? (
          <div className="w-72">
            {citySearchNode}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span
              className="w-[6px] h-[6px] rounded-full inline-block"
              style={{
                background: 'var(--green)',
                boxShadow: '0 0 6px rgba(78, 203, 113, 0.6)',
              }}
            />
            <span className="font-body text-xs">{t('system.operational')}</span>
            <span className="mx-1.5 opacity-20">│</span>
            <span className="font-body text-xs opacity-50">Romania</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center h-8 px-2.5 rounded-md transition-colors hover:bg-[rgba(212,168,67,0.06)] cursor-pointer gap-1.5"
          style={{ border: '1px solid var(--glass-border)' }}
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          <span className="font-display text-[10px] font-bold" style={{ color: 'var(--gold)' }}>{language.toUpperCase()}</span>
        </button>

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[rgba(212,168,67,0.06)] cursor-pointer"
            style={{ border: '1px solid var(--glass-border)' }}
            aria-label={t('theme.toggle')}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            ) : (
              <Moon className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            )}
          </button>
        )}

        {/* Submit Report CTA */}
        <button
          id="submit-report-btn"
          onClick={onSubmitReport}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md font-display text-xs font-bold transition-all duration-200 cursor-pointer"
          style={{
            background: 'var(--gold)',
            color: 'var(--abyss)',
            boxShadow: '0 1px 4px rgba(212, 168, 67, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(212, 168, 67, 0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(212, 168, 67, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <FileUp className="w-3.5 h-3.5" />
          {t('action.submitReport')}
        </button>
      </div>
    </header>
  );
}
