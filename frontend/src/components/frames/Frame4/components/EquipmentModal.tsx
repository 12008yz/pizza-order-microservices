'use client';

import React from 'react';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function EquipmentModal({
  isOpen,
  onClose,
  children,
  className = '',
}: EquipmentModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер — header и карточка влезают в экран, прокрутка только внутри карточки */}
      <div
        className={`relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5] ${className}`}
        style={{ boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка: подсказка */}
        <div className="flex-shrink-0" style={{ minHeight: '105px' }}>
          <div
            className="font-normal flex items-center justify-center text-center"
            style={{
              width: '240px',
              margin: '0 auto',
              paddingTop: '75px',
              height: '30px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.25)',
              letterSpacing: '0.5px',
            }}
          >
            Нажмите в открытое пустое место, чтобы выйти из этого режима
          </div>
        </div>

        {/* Карточка — занимает остаток экрана, контент шага прокручивается внутри */}
        <div
          className="flex flex-col rounded-[20px] bg-white mx-[5%] overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '360px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: '20px',
            backdropFilter: 'blur(7.5px)',
            maxHeight: 'calc(100dvh - 145px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
