'use client';

import React, { useState } from 'react';
import type { SimOperatorOption } from '../types';

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

  return (
    <>
      {/* Заголовок */}
      <div
        style={{
          position: 'absolute',
          width: '330px',
          height: '70px',
          left: '15px',
          top: '15px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '330px',
            height: '25px',
            left: '0px',
            top: '0px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            display: 'flex',
            alignItems: 'center',
            color: '#101010',
          }}
        >
          Текущий оператор
        </div>

        <div
          style={{
            position: 'absolute',
            width: '330px',
            height: '30px',
            left: '0px',
            top: '40px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
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
      {operators.map((operator, index) => {
        const isSelected = selected === operator.value;
        const topPosition = 100 + index * 55;

        return (
          <div
            key={operator.value}
            onClick={() => onSelect(operator.value)}
            style={{
              position: 'absolute',
              left: '15px',
              right: '15px',
              top: `${topPosition}px`,
              height: '50px',
              boxSizing: 'border-box',
              border: isSelected
                ? '1px solid rgba(16, 16, 16, 0.5)'
                : '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              cursor: 'pointer',
              background: 'transparent',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Цветной индикатор оператора */}
            <div
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                left: '15px',
                top: '21px',
                borderRadius: '50%',
                background: operator.color,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: '35px',
                top: '15px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                display: 'flex',
                alignItems: 'center',
                color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
              }}
            >
              {operator.label}
            </div>

            <div
              style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                right: '15px',
                top: '17px',
                boxSizing: 'border-box',
                borderRadius: '50%',
                border: isSelected ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                background: isSelected ? '#101010' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path
                    d="M1 3L3 5L7 1"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}

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
        <svg
          width="6"
          height="12"
          viewBox="0 0 6 12"
          fill="none"
        >
          <path
            d="M5 1L1 6L5 11"
            stroke="#101010"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Кнопка "Далее" */}
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
