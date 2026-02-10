'use client';

import React from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropBlur?: boolean;
  className?: string;
  /** Скрыть подсказку «Нажмите в открытое пустое место…» */
  hideHint?: boolean;
}

export default function BaseModal({
  isOpen,
  onClose,
  children,
  backdropBlur = true,
  className = '',
  hideHint = false,
}: BaseModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto overflow-x-hidden"
      style={{
        background: backdropBlur ? '#F5F5F5' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: backdropBlur ? 'blur(12.5px)' : 'none',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'calc(20px + var(--sab, 0px))',
        boxSizing: 'border-box',
      }}
      onClick={handleBackdropClick}
    >
      {!hideHint && (
        <div
          style={{
            position: 'absolute',
            width: '240px',
            height: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 'var(--header-top, 50px)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
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
      )}

      <div onClick={(e) => e.stopPropagation()} className={className}>
        {children}
      </div>
    </div>
  );
}
