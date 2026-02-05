'use client';

import React, { useState, useEffect } from 'react';

const COUNTDOWN_SEC = 3;

interface SimInfoStepProps {
  infoType: 'person' | 'region';
  showBothWarningsWithDelay?: boolean;
  onNext: () => void;
  onBack: () => void;
}

const infoTexts = {
  person: 'SIM-карта должна быть зарегистрирована только на того же человека, на которого, собираетесь оформлять интернет и пр.',
  region: 'SIM-карта должна быть зарегистрирована в том же регионе, в котором, собираетесь оформлять интернет и пр.',
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
            lineHeight: '145%',
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
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '145%',
              color: '#101010',
            }}
          >
            {infoTexts.person}
          </div>
        )}

        {showRegion && (
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '145%',
              color: '#101010',
            }}
          >
            {infoTexts.region}
          </div>
        )}
      </div>

      {/* Навигация: стрелка назад + таймер 3-2-1 или кнопка «Далее» */}
      <div className="flex-shrink-0 flex gap-[10px] px-[15px] pb-[15px] pt-[10px]">
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
          <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
            <path d="M5 1L1 6L5 11" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          className="outline-none flex-1 rounded-[10px] flex items-center justify-center text-center min-h-[50px] border border-solid"
          style={{
            borderColor: 'rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: canProceed ? 16 : 14,
            lineHeight: canProceed ? '100%' : '145%',
            fontWeight: canProceed ? 400 : 400,
            boxSizing: 'border-box',
            background: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.06)',
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
