'use client';

import React, { useState } from 'react';
import { Waves } from 'lucide-react';
import CitySearch from './CitySearch';
import { BoundingBox } from '@/services/overpassService';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeScreenProps {
  onCitySelect: (cityName: string, center: { lat: number; lng: number }, bbox: BoundingBox) => void;
}

export default function WelcomeScreen({ onCitySelect }: WelcomeScreenProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { t } = useLanguage();

  const handleCitySelect = (cityName: string, center: { lat: number; lng: number }, bbox: BoundingBox) => {
    setIsClosing(true);
    // Wait for the fade-out animation before calling the parent
    setTimeout(() => {
      onCitySelect(cityName, center, bbox);
    }, 500);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-abyss/80 backdrop-blur-xl transition-all duration-500 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-[100px]"
        style={{ background: 'var(--cyan)' }}
      />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center animate-fade-in">
        {/* Logo */}
        <div
          className="flex items-center justify-center w-20 h-20 rounded-2xl mb-8 shadow-[0_0_40px_rgba(0,229,255,0.2)]"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(0, 229, 255, 0.05))',
            border: '1px solid rgba(0, 229, 255, 0.2)',
          }}
        >
          <Waves className="w-10 h-10 text-cyan" />
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4 tracking-tight">
          {t('app.title')}
        </h1>
        
        <p className="font-body text-lg text-text-secondary mb-10 max-w-lg mx-auto">
          {t('welcome.desc')}
        </p>
        
        <div className="w-full max-w-md mx-auto">
          <div className="mb-3 text-left font-display text-xs text-text-muted uppercase tracking-widest pl-1">
            {t('welcome.prompt')}
          </div>
          {/* We wrap CitySearch to let it take full width */}
          <div className="w-full shadow-2xl rounded-xl">
            <CitySearch onCitySelect={handleCitySelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
