'use client';

import React, { useState } from 'react';
import CitySearch from './CitySearch';
import { BoundingBox } from '@/services/overpassService';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

interface WelcomeScreenProps {
  onCitySelect: (cityName: string, center: { lat: number; lng: number }, bbox: BoundingBox) => void;
}

export default function WelcomeScreen({ onCitySelect }: WelcomeScreenProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { t } = useLanguage();

  const handleCitySelect = (cityName: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
    setIsClosing(true);
    setTimeout(() => {
      onCitySelect(cityName, center, bbox);
    }, 600);
  };

  const titleWords = t('app.title').split(' ');

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 transition-all duration-600 ${
        isClosing ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ background: 'var(--abyss)' }}
    >
      {/* Animated contour line background */}
      <div className="absolute inset-0 contour-animated opacity-[0.06] pointer-events-none" />
      
      {/* Warm radial glow behind content */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none blur-[120px]"
        style={{ background: 'var(--gold)' }}
      />

      {/* Subtle coordinate grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--gold) 1px, transparent 1px),
            linear-gradient(90deg, var(--gold) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
        {/* Logo */}
        <div
          className="mb-10 animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <Image
            src="/nereus-logo.png"
            alt="The Nereus System"
            width={180}
            height={100}
            className="object-contain opacity-90"
            priority
          />
        </div>
        
        {/* Title with staggered word reveal */}
        <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
          {titleWords.map((word, i) => (
            <span
              key={i}
              className="inline-block mr-3"
              style={{
                animation: `wordReveal 0.6s ease-out ${200 + i * 120}ms forwards`,
                opacity: 0,
                color: i === titleWords.length - 1 ? 'var(--gold)' : 'var(--text-primary)',
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle line */}
        <div
          className="animate-fade-in mb-2"
          style={{ animationDelay: '600ms' }}
        >
          <span
            className="font-display text-xs font-semibold tracking-[0.25em] uppercase"
            style={{ color: 'var(--gold-dim)' }}
          >
            {t('app.subtitle')}
          </span>
        </div>
        
        {/* Description */}
        <p
          className="font-body text-base text-text-secondary mb-12 max-w-md mx-auto leading-relaxed animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          {t('welcome.desc')}
        </p>
        
        {/* Search section */}
        <div
          className="w-full max-w-md mx-auto animate-fade-in"
          style={{ animationDelay: '900ms' }}
        >
          <div className="mb-3 text-left font-display text-[10px] text-text-muted uppercase tracking-[0.2em] pl-1 font-semibold">
            {t('welcome.prompt')}
          </div>
          <div className="w-full">
            <CitySearch onCitySelect={handleCitySelect} />
          </div>
          
          {/* Hint chips */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {['Timișoara', 'București', 'Cluj-Napoca'].map((city, i) => (
              <span
                key={city}
                className="font-body text-[10px] px-3 py-1 rounded-full cursor-default"
                style={{
                  background: 'rgba(212, 168, 67, 0.06)',
                  border: '1px solid rgba(212, 168, 67, 0.12)',
                  color: 'var(--text-muted)',
                  animation: `fadeSlideUp 0.4s ease-out ${1100 + i * 100}ms forwards`,
                  opacity: 0,
                }}
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom coordinate readout */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-widest animate-fade-in"
        style={{ color: 'var(--text-muted)', opacity: 0.4, animationDelay: '1400ms' }}
      >
        45°45&apos;N · 21°13&apos;E — COPERNICUS SENTINEL-2 MSI
      </div>
    </div>
  );
}
