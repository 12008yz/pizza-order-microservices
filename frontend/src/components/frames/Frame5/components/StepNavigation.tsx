'use client';

import React, { useState } from 'react';

interface StepNavigationProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}

export default function StepNavigation({
  onBack,
  onNext,
  nextLabel = 'Далее',
  nextDisabled = false,
  showBack = true,
}: StepNavigationProps) {
  const [backPressed, setBackPressed] = useState(false);
  const [nextPressed, setNextPressed] = useState(false);

  return (
    <div className="flex items-center gap-[5px] w-full">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          onMouseDown={() => setBackPressed(true)}
          onMouseUp={() => setBackPressed(false)}
          onMouseLeave={() => setBackPressed(false)}
          onTouchStart={() => setBackPressed(true)}
          onTouchEnd={() => setBackPressed(false)}
          className="flex-shrink-0 rounded-[10px] flex items-center justify-center outline-none cursor-pointer"
          style={{
            width: 50,
            height: 50,
            border: '1px solid rgba(16, 16, 16, 0.25)',
            background: 'transparent',
            boxSizing: 'border-box',
            transform: backPressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
          aria-label="Назад"
        >
          <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        onMouseDown={() => !nextDisabled && setNextPressed(true)}
        onMouseUp={() => setNextPressed(false)}
        onMouseLeave={() => setNextPressed(false)}
        onTouchStart={() => !nextDisabled && setNextPressed(true)}
        onTouchEnd={() => setNextPressed(false)}
        className="flex-1 rounded-[10px] flex items-center justify-center text-center text-white outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          height: 50,
          minHeight: 50,
          background: nextDisabled ? 'rgba(16, 16, 16, 0.25)' : '#101010',
          border: '1px solid rgba(16, 16, 16, 0.25)',
          fontFamily: "'TT Firs Neue', sans-serif",
          fontSize: '16px',
          lineHeight: '125%',
          boxSizing: 'border-box',
          transform: nextPressed ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
