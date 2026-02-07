'use client';

import React, { useState, useEffect } from 'react';
import type { SimOperatorOption } from '../types';

const ERROR_BORDER = '1px solid rgb(239, 68, 68)';

interface SimOperatorStepProps {
  selected: SimOperatorOption | null;
  onSelect: (operator: SimOperatorOption) => void;
  onNext: () => void;
  onBack: () => void;
}

const operators: { value: SimOperatorOption; label: string; color: string }[] = [
  { value: 'beeline', label: 'Билайн', color: '#FFCC00' },
  { value: 'megafon', label: 'МегаФон', color: '#00B956' },
  { value: 'mts', label: 'МТС', color: '#E30611' },
  { value: 'tele2', label: 'Tele2', color: '#1F2229' },
  { value: 'yota', label: 'Yota', color: '#00BFFF' },
];

export default function SimOperatorStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: SimOperatorStepProps) {
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
          Текущий оператор
        </div>
        <div
          className="font-normal pt-[15px]"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.25)',
          }}
        >
          Выберите вашего текущего мобильного
          <br />
          оператора для переноса номера
        </div>
      </div>

      {/* Операторы */}
      <div className="overflow-y-auto overflow-x-hidden px-[15px] pt-[20px]" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col gap-[5px] pb-2">
          {operators.map((operator) => {
            const isSelected = selected === operator.value;
            return (
              <div
                key={operator.value}
                onClick={() => onSelect(operator.value)}
                className="rounded-[10px] flex items-center justify-between px-[15px] cursor-pointer min-h-[50px]"
                style={{
                  boxSizing: 'border-box',
                  border: showError && selected === null ? ERROR_BORDER : isSelected ? '1px solid rgba(16, 16, 16, 0.5)' : '1px solid rgba(16, 16, 16, 0.25)',
                  transition: 'border-color 0.2s ease',
                  background: 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: operator.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '125%',
                      color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {operator.label}
                  </span>
                </div>
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
      <div className="flex-shrink-0 flex items-center gap-[10px] px-[15px] pb-[15px] pt-[10px]">
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
