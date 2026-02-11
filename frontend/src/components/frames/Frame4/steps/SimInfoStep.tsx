'use client';

import React, { useState, useEffect } from 'react';

const COUNTDOWN_SEC = 3;

interface SimInfoStepProps {
  infoType: 'person' | 'region';
  showBothWarningsWithDelay?: boolean;
  onNext: () => void;
  onBack: () => void;
}

const textStyles = {
  fontFamily: 'TT Firs Neue, sans-serif',
  fontStyle: 'normal' as const,
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '125%',
  color: '#101010',
};

export default function SimInfoStep({ infoType, showBothWarningsWithDelay = false, onNext, onBack }: SimInfoStepProps) {
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);

  // Таймер 3-2-1 в обеих модалках, затем появляется кнопка «Далее»
  useEffect(() => {
    setCountdown(COUNTDOWN_SEC);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, COUNTDOWN_SEC - elapsed);
      setCountdown(left);
    }, 200);
    return () => clearInterval(interval);
  }, [infoType]);

  const canProceed = countdown === 0;
  // Первый экран — только про человека; второй — только про регион
  const showPerson = infoType === 'person';
  const showRegion = infoType === 'region';

  return (
    <div className="flex flex-col w-full">
      {/* Заголовок */}
      <div className="flex-shrink-0 px-[15px] pt-[15px]">
        <div
          className="font-normal"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '20px',
            lineHeight: '125%',
            color: '#101010',
          }}
        >
          SIM-карта
        </div>
        <div
          className="font-normal pt-[15px]"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          Мы подготовили все возможные варианты.
          <br />
          Пожалуйста, проверьте правильность
        </div>
      </div>

      {/* Контент с предупреждениями */}
      <div className="flex-1 overflow-y-auto px-[15px] pt-[20px] pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
        {showPerson && (
          <div style={textStyles}>
            <span style={{ whiteSpace: 'nowrap' }}>SIM-карта должна быть зарегистрирована</span>
            <br />
            только на того же человека, на которого,
            <br />
            собираетесь оформлять интернет и пр.
          </div>
        )}

        {showRegion && (
          <div style={textStyles}>
            <span style={{ whiteSpace: 'nowrap' }}>SIM-карта должна быть зарегистрирована</span>
            <br />
            только в том же регионе, в котором,
            <br />
            собираетесь оформлять интернет и пр.
          </div>
        )}
      </div>

      {/* Навигация: стрелка назад + таймер 3-2-1 или кнопка «Далее» */}
      <div className="flex-shrink-0 flex items-center gap-[5px] px-[15px] pb-[15px] pt-[10px]">
        <button
          type="button"
          onClick={onBack}
          onMouseDown={() => setIsBackPressed(true)}
          onMouseUp={() => setIsBackPressed(false)}
          onMouseLeave={() => setIsBackPressed(false)}
          onTouchStart={() => setIsBackPressed(true)}
          onTouchEnd={() => setIsBackPressed(false)}
          className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center flex-shrink-0 bg-transparent"
          style={{
            width: '50px',
            height: '50px',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            boxSizing: 'border-box',
            transform: isBackPressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
          </svg>
        </button>

        <button
          type="button"
          onClick={canProceed ? onNext : undefined}
          disabled={!canProceed}
          onMouseDown={() => canProceed && setIsNextPressed(true)}
          onMouseUp={() => setIsNextPressed(false)}
          onMouseLeave={() => setIsNextPressed(false)}
          onTouchStart={() => canProceed && setIsNextPressed(true)}
          onTouchEnd={() => setIsNextPressed(false)}
          className="outline-none flex-1 rounded-[10px] flex items-center justify-center text-center h-[50px] border border-solid"
          style={{
            borderColor: 'rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: canProceed ? 16 : 14,
            lineHeight: canProceed ? '100%' : '145%',
            fontWeight: canProceed ? 400 : 400,
            boxSizing: 'border-box',
            background: canProceed ? '#101010' : '#FFFFFF',
            color: canProceed ? '#FFFFFF' : '#101010',
            cursor: canProceed ? 'pointer' : 'default',
            transform: isNextPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.15s ease-out, background 0.4s ease-out, color 0.4s ease-out, font-size 0.2s ease-out',
          }}
        >
          {canProceed ? 'Далее' : countdown}
        </button>
      </div>
    </div>
  );
}
