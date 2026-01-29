'use client';

import React from 'react';
import type { RouterNeedOption } from '../types';

interface RouterNeedStepProps {
  selected: RouterNeedOption | null;
  onSelect: (option: RouterNeedOption) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { value: RouterNeedOption; label: string }[] = [
  { value: 'need', label: 'Да, мне это необходимо' },
  { value: 'from_operator', label: 'Имеется, но, от оператора' },
  { value: 'own', label: 'Имеется, но, не от оператора' },
  { value: 'no_thanks', label: 'Нет, спасибо' },
];

export default function RouterNeedStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: RouterNeedStepProps) {
  return (
    <>
      {/* Group 7539 - Заголовок */}
      <div
        style={{
          position: 'absolute',
          width: '330px',
          height: '70px',
          left: '15px',
          top: '15px',
        }}
      >
        {/* Роутер */}
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
          Роутер
        </div>

        {/* Описание */}
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
          Мы подготовили все возможные варианты.
          <br />
          Пожалуйста, проверьте правильность
        </div>
      </div>

      {/* Опции */}
      {options.map((option, index) => {
        const isSelected = selected === option.value;
        const topPosition = 100 + index * 55; // 100px от верха карточки, шаг 55px

        return (
          <div
            key={option.value}
            onClick={() => onSelect(option.value)}
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
            }}
          >
            {/* Label */}
            <div
              style={{
                position: 'absolute',
                left: '15px',
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
              {option.label}
            </div>

            {/* Radio circle */}
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

      {/* Group 7507 - Кнопка назад */}
      <div
        onClick={onBack}
        style={{
          position: 'absolute',
          left: '15px',
          bottom: '15px',
          width: '50px',
          height: '50px',
          boxSizing: 'border-box',
          border: '1px solid rgba(16, 16, 16, 0.25)',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Vector - стрелка назад */}
        <svg
          width="6"
          height="12"
          viewBox="0 0 6 12"
          fill="none"
          style={{ transform: 'rotate(0deg)' }}
        >
          <path
            d="M5 1L1 6L5 11"
            stroke="#101010"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Group 7377 - Кнопка "Далее" */}
      <div
        onClick={onNext}
        style={{
          position: 'absolute',
          left: '70px',
          right: '15px',
          bottom: '15px',
          height: '50px',
          background: '#101010',
          border: '1px solid rgba(16, 16, 16, 0.25)',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '315%',
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          Далее
        </span>
      </div>
    </>
  );
}
