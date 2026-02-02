'use client';

import React, { useState, useEffect } from 'react';

const WARNINGS_DELAY_SEC = 3;

interface SimInfoStepProps {
  infoType: 'person' | 'region';
  /** Если true (выбран «Я не являюсь клиентом МТС»): оба предупреждения с интерактивным таймером 3 сек, затем переход на Frame 5 */
  showBothWarningsWithDelay?: boolean;
  onNext: () => void;
  onBack: () => void;
}

const infoTexts = {
  person: 'SIM-карта должна быть зарегистрирована только на того же человека, на которого, собираетесь оформлять интернет и пр.',
  region: 'SIM-карта должна быть зарегистрирована в том же регионе, в котором, собираетесь оформлять интернет и пр.',
};

/** Интерактивный таймер: обратный отсчёт в круге */
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(16, 16, 16, 0.12)"
          strokeWidth={stroke}
        />
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
    <>
      {/* Заголовок */}
      <div
        style={{
          position: 'absolute',
          width: '330px',
          left: '15px',
          top: '15px',
        }}
      >
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            display: 'flex',
            alignItems: 'center',
            color: '#101010',
            marginBottom: '15px',
          }}
        >
          SIM-карта
        </div>

        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '145%',
            color: 'rgba(16, 16, 16, 0.5)',
            marginBottom: '20px',
          }}
        >
          Мы подготовили все возможные варианты.
          <br />
          Пожалуйста, проверьте правильность
        </div>

        {/* Предупреждение 1 — на человека + интерактивный таймер */}
        {showPerson && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: showBothWarningsWithDelay ? '16px' : 0,
            }}
          >
            {showBothWarningsWithDelay && (
              <WarningTimer secondsLeft={secondsLeft} totalSec={WARNINGS_DELAY_SEC} />
            )}
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontStyle: 'normal',
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

        {/* Предупреждение 2 — регион + интерактивный таймер (только при «не клиент МТС») */}
        {showBothWarningsWithDelay && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <WarningTimer secondsLeft={secondsLeft} totalSec={WARNINGS_DELAY_SEC} />
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontStyle: 'normal',
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
              fontStyle: 'normal',
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

      {/* Кнопка назад */}
      <button
        type="button"
        onClick={onBack}
        onMouseDown={() => setIsBackPressed(true)}
        onMouseUp={() => setIsBackPressed(false)}
        onMouseLeave={() => setIsBackPressed(false)}
        onTouchStart={() => setIsBackPressed(true)}
        onTouchEnd={() => setIsBackPressed(false)}
        className="outline-none cursor-pointer border border-[rgba(16,16,16,0.25)] rounded-[10px] flex items-center justify-center bg-transparent"
        style={{
          position: 'absolute',
          left: '15px',
          bottom: '15px',
          width: '50px',
          height: '50px',
          boxSizing: 'border-box',
          transform: isBackPressed ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
          <path
            d="M5 1L1 6L5 11"
            stroke="#101010"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Кнопка «Далее» — первые 3 сек недоступна, если showBothWarningsWithDelay */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        onMouseDown={() => canProceed && setIsNextPressed(true)}
        onMouseUp={() => setIsNextPressed(false)}
        onMouseLeave={() => setIsNextPressed(false)}
        onTouchStart={() => canProceed && setIsNextPressed(true)}
        onTouchEnd={() => setIsNextPressed(false)}
        className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center font-normal text-base text-center border border-[rgba(16,16,16,0.25)]"
        style={{
          position: 'absolute',
          left: '70px',
          right: '15px',
          bottom: '15px',
          height: '50px',
          boxSizing: 'border-box',
          fontFamily: 'TT Firs Neue, sans-serif',
          background: canProceed ? 'transparent' : 'rgba(16, 16, 16, 0.12)',
          color: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.4)',
          transform: isNextPressed ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.15s ease-out, background 0.2s, color 0.2s',
          cursor: canProceed ? 'pointer' : 'not-allowed',
        }}
      >
        {showBothWarningsWithDelay && !canProceed ? `Далее через ${secondsLeft} сек` : 'Далее'}
      </button>
    </>
  );
}
