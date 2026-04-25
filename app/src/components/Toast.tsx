'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

/**
 * Toast Component
 * ────────────────
 * Brief success notification that auto-dismisses.
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
      className={`fixed top-20 right-6 z-[100] glass-panel rounded-xl px-5 py-4 flex items-center gap-3 ${
        isExiting ? 'toast-exit' : 'toast-enter'
      }`}
      style={{
        border: '1px solid rgba(0, 230, 118, 0.25)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 230, 118, 0.05)',
        maxWidth: '380px',
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(0, 230, 118, 0.1)' }}
      >
        <CheckCircle2 className="w-4 h-4 text-green" />
      </div>

      <div className="flex-1">
        <p className="font-display text-sm font-medium text-text-primary">{message}</p>
        <p className="font-body text-xs text-text-muted mt-0.5">Report submitted successfully</p>
      </div>

      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
