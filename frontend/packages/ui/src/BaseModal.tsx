'use client';

import React from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropBlur?: boolean;
  className?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  children,
  backdropBlur = true,
  className = '',
}: BaseModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        background: backdropBlur ? '#F5F5F5' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: backdropBlur ? 'blur(12.5px)' : 'none',
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '75px',
          fontFamily: "'TT Firs Neue', sans-serif",
          fontSize: '14px',
          lineHeight: '105%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'rgba(16, 16, 16, 0.15)',
        }}
      >
        Нажмите в открытое пустое место, чтобы выйти из этого режима
      </div>
      <div onClick={(e) => e.stopPropagation()} className={className}>
        {children}
      </div>
    </div>
  );
}
