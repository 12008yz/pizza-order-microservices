'use client';

import React, { useState, useEffect } from 'react';

const WARNINGS_DELAY_SEC = 3;

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

function WarningTimer({ secondsLeft, totalSec }: { secondsLeft: number; totalSec: number }) {
  const size = 32;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = totalSec > 0 ? (totalSec - secondsLeft) / totalSec : 1;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(16, 16, 16, 0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#101010"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          color: '#101010',
        }}
      >
        {secondsLeft > 0 ? secondsLeft : ''}
      </div>
    </div>
  );
}

export default function SimInfoStep({ infoType, showBothWarningsWithDelay = false, onNext, onBack }: SimInfoStepProps) {
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);
  const [canProceed, setCanProceed] = useState(!showBothWarningsWithDelay);
  const [secondsLeft, setSecondsLeft] = useState(showBothWarningsWithDelay ? WARNINGS_DELAY_SEC : 0);

  useEffect(() => {
    if (!showBothWarningsWithDelay) {
      setCanProceed(true);
      setSecondsLeft(0);
      return;
    }
    setCanProceed(false);
    setSecondsLeft(WARNINGS_DELAY_SEC);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, WARNINGS_DELAY_SEC - elapsed);
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(interval);
        setCanProceed(true);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [showBothWarningsWithDelay]);

  const showPerson = infoType === 'person' || showBothWarningsWithDelay;
  const showRegion = infoType === 'region' || showBothWarningsWithDelay;

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
            className="flex items-start gap-3"
            style={{ marginBottom: showBothWarningsWithDelay ? 16 : 0 }}
          >
            {showBothWarningsWithDelay && (
              <WarningTimer secondsLeft={secondsLeft} totalSec={WARNINGS_DELAY_SEC} />
            )}
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '145%',
                color: '#101010',
                flex: 1,
              }}
            >
              {infoTexts.person}
            </div>
          </div>
        )}

        {showBothWarningsWithDelay && (
          <div className="flex items-start gap-3">
            <WarningTimer secondsLeft={secondsLeft} totalSec={WARNINGS_DELAY_SEC} />
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '145%',
                color: '#101010',
                flex: 1,
              }}
            >
              {infoTexts.region}
            </div>
          </div>
        )}

        {showRegion && !showBothWarningsWithDelay && infoType === 'region' && (
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

      {/* Кнопки навигации */}
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
          onClick={onNext}
          disabled={!canProceed}
          onMouseDown={() => canProceed && setIsNextPressed(true)}
          onMouseUp={() => setIsNextPressed(false)}
          onMouseLeave={() => setIsNextPressed(false)}
          onTouchStart={() => canProceed && setIsNextPressed(true)}
          onTouchEnd={() => setIsNextPressed(false)}
          className="outline-none cursor-pointer flex-1 rounded-[10px] flex items-center justify-center text-center min-h-[50px] disabled:cursor-not-allowed"
          style={{
            border: '1px solid rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            boxSizing: 'border-box',
            background: canProceed ? 'transparent' : 'rgba(16, 16, 16, 0.12)',
            color: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.4)',
            transform: isNextPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.15s ease-out, background 0.2s, color 0.2s',
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          {showBothWarningsWithDelay && !canProceed ? `Далее через ${secondsLeft} сек` : 'Далее'}
        </button>
      </div>
    </div>
  );
}
