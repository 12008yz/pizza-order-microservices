'use client';

import React, { useState, useEffect } from 'react';
import type { SimSmartphoneCount } from '../types';

const ERROR_BORDER = '1px solid rgb(239, 68, 68)';

interface SimSmartphoneCountStepProps {
  selected: SimSmartphoneCount | null;
  onSelect: (count: SimSmartphoneCount) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { value: SimSmartphoneCount; label: string }[] = [
  { value: 1, label: 'Подключение одного смартфона' },
  { value: 2, label: 'Подключение 2-х смартфонов' },
  { value: 3, label: 'Подключение 3-х смартфонов' },
  { value: 4, label: 'Подключение 4-х смартфонов' },
];

export default function SimSmartphoneCountStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: SimSmartphoneCountStepProps) {
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (selected !== null) setShowError(false);
  }, [selected]);

  const handleNext = () => {
    if (selected === null) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onNext();
  };

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

      {/* Опции */}
      <div className="overflow-y-auto overflow-x-hidden px-[15px] pt-[20px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col gap-[5px] pb-2">
          {options.map((option) => {
            const isSelected = selected === option.value;
            return (
              <div
                key={option.value}
                onClick={() => onSelect(option.value)}
                className="rounded-[10px] flex items-center justify-between px-[15px] cursor-pointer min-h-[50px]"
                style={{
                  boxSizing: 'border-box',
                  border: showError && selected === null ? ERROR_BORDER : isSelected ? '1px solid rgba(16, 16, 16, 0.5)' : '1px solid rgba(16, 16, 16, 0.25)',
                  transition: 'border-color 0.2s ease',
                  background: 'transparent',
                }}
              >
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '125%',
                    color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                  }}
                >
                  {option.label}
                </span>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    boxSizing: 'border-box',
                    border: isSelected ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                    background: isSelected ? '#101010' : 'transparent',
                  }}
                >
                  {isSelected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Кнопки навигации */}
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
          onClick={handleNext}
          onMouseDown={() => setIsNextPressed(true)}
          onMouseUp={() => setIsNextPressed(false)}
          onMouseLeave={() => setIsNextPressed(false)}
          onTouchStart={() => setIsNextPressed(true)}
          onTouchEnd={() => setIsNextPressed(false)}
          className="outline-none cursor-pointer flex-1 rounded-[10px] flex items-center justify-center text-center text-white h-[50px]"
          style={{
            background: '#101010',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            lineHeight: '315%',
            boxSizing: 'border-box',
            transform: isNextPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          Далее
        </button>
      </div>
    </div>
  );
}
