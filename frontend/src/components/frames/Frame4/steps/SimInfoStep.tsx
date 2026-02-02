'use client';

import React, { useState } from 'react';

interface SimInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SimInfoStep({ onNext, onBack }: SimInfoStepProps) {
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);

  return (
    <>
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
            color: '#101010',
            marginBottom: '12px',
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
          }}
        >
          Проверьте выбранные параметры. После нажатия «Далее» вы перейдёте к оформлению заказа.
        </div>
      </div>

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
      <button
        type="button"
        onClick={onNext}
        onMouseDown={() => setIsNextPressed(true)}
        onMouseUp={() => setIsNextPressed(false)}
        onMouseLeave={() => setIsNextPressed(false)}
        onTouchStart={() => setIsNextPressed(true)}
        onTouchEnd={() => setIsNextPressed(false)}
        className="outline-none cursor-pointer rounded-[10px] flex items-center justify-center text-white font-normal text-base text-center bg-[#101010] border border-[rgba(16,16,16,0.25)]"
        style={{
          position: 'absolute',
          left: '70px',
          right: '15px',
          bottom: '15px',
          height: '50px',
          boxSizing: 'border-box',
          fontFamily: 'TT Firs Neue, sans-serif',
          lineHeight: '315%',
          transform: isNextPressed ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        Далее
      </button>
    </>
  );
}
