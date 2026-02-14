'use client';

import React from 'react';
import { ClickOutsideHintContent, HINT_TOP } from '../../../common/ClickOutsideHint';

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
      className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden cursor-pointer"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'calc(20px + var(--sab, 0px))',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер — как во Frame2: шапка сверху, карточка прижата вниз и подстраивается по высоте под контент */}
      <div
        className={`relative w-full max-w-[360px] flex flex-col h-full overflow-hidden bg-[#F5F5F5] ${className}`}
        style={{ boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка: подсказка (клик по пустому месту закрывает модалку, как во Frame2) */}
        <div
          className="flex-shrink-0 cursor-pointer"
          style={{ minHeight: '105px' }}
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Закрыть"
        >
          <div className="flex justify-center" style={{ paddingTop: HINT_TOP }}>
            <ClickOutsideHintContent />
          </div>
        </div>

        {/* Карточка — прижата вниз (без лишнего отступа, только safe-area); высота по контенту, при переполнении — прокрутка внутри */}
        <div
          className="flex flex-col rounded-[20px] bg-white overflow-y-auto overflow-x-hidden"
          style={{
            width: '360px',
            maxWidth: 'calc(100% - 40px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: 0,
            maxHeight: 'calc(100dvh - 145px)',
            WebkitOverflowScrolling: 'touch',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
