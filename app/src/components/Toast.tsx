'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

/**
 * Toast Component
 * ────────────────
 * Instrument-panel style notification with signal-green left stripe.
 */
interface ToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  isVisible,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      id="success-toast"
      className={`fixed top-16 right-5 z-[100] glass-panel rounded-lg px-4 py-3 flex items-center gap-3 ${
        isExiting ? 'toast-exit' : 'toast-enter'
      }`}
      style={{
        borderLeft: '3px solid var(--green)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        maxWidth: '360px',
      }}
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
        style={{ background: 'rgba(78, 203, 113, 0.1)' }}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-green" />
      </div>

      <div className="flex-1">
        <p className="font-display text-[13px] font-semibold text-text-primary">{message}</p>
        <p className="font-body text-[11px] text-text-muted mt-0.5">Report submitted successfully</p>
      </div>

      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
