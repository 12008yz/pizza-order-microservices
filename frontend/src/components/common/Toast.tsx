'use client';

import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6',
  }[type];

  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10001] flex items-center gap-3 px-4 py-3 rounded-[10px] shadow-lg"
      style={{
        background: bgColor,
        color: '#FFFFFF',
        minWidth: '300px',
        maxWidth: '90%',
      }}
    >
      <span className="flex-1 text-sm font-normal" style={{ letterSpacing: '0.5px' }}>
        {message}
      </span>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
        style={{ cursor: 'pointer' }}
      >
        <X size={12} weight="regular" />
      </button>
    </div>
  );
}
