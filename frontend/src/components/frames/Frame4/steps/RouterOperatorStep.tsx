'use client';

import React, { useState, useEffect } from 'react';
import type { RouterOperatorOption } from '../types';

interface RouterOperatorStepProps {
  selected: RouterOperatorOption | null;
  onSelect: (operator: RouterOperatorOption) => void;
  onNext: () => void;
  onBack: () => void;
}

const operators: { value: RouterOperatorOption; label: string }[] = [
  { value: 'beeline', label: 'Билайн' },
  { value: 'domru', label: 'ДОМ.RU' },
  { value: 'megafon', label: 'Мегафон' },
  { value: 'mts', label: 'МТС' },
  { value: 'rostelecom', label: 'Ростелеком' },
];

export default function RouterOperatorStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: RouterOperatorStepProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [countdown, setCountdown] = useState(7);
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);

  // Показываем баннер когда выбран оператор
  useEffect(() => {
    if (selected) {
      setShowBanner(true);
      setCountdown(7);
    }
  }, [selected]);

  // Таймер обратного отсчёта для баннера
  useEffect(() => {
    if (showBanner && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowBanner(false);
    }
  }, [showBanner, countdown]);

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  const isNextDisabled = selected === null;

  return (
    <>
      {/* Group 7549 - Заголовок */}
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

      {/* Опции операторов - 5 вариантов */}
      {operators.map((option, index) => {
        const isSelected = selected === option.value;
        const topPosition = 105 + index * 55; // 105px от верха карточки, шаг 55px

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

      {/* Кнопка назад — анимация нажатия как во Frame1 */}
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
          <path d="M5 1L1 6L5 11" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Кнопка "Далее" — анимация нажатия как во Frame1 (только когда не disabled) */}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        onMouseDown={() => !isNextDisabled && setIsNextPressed(true)}
        onMouseUp={() => setIsNextPressed(false)}
        onMouseLeave={() => setIsNextPressed(false)}
        onTouchStart={() => !isNextDisabled && setIsNextPressed(true)}
        onTouchEnd={() => setIsNextPressed(false)}
        className="outline-none rounded-[10px] flex items-center justify-center text-white font-normal text-base text-center bg-[#101010] border border-[rgba(16,16,16,0.25)]"
        style={{
          position: 'absolute',
          left: '70px',
          right: '15px',
          bottom: '15px',
          height: '50px',
          boxSizing: 'border-box',
          fontFamily: 'TT Firs Neue, sans-serif',
          lineHeight: '315%',
          cursor: isNextDisabled ? 'not-allowed' : 'pointer',
          opacity: isNextDisabled ? 0.1 : 1,
          transform: isNextPressed && !isNextDisabled ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.15s ease-out',
        }}
      >
        Далее
      </button>

      {/* Group 7508 - Баннер предупреждения */}
      {showBanner && (
        <div
          style={{
            position: 'absolute',
            width: '360px',
            height: '120px',
            left: '0px',
            top: '-210px', // Позиция относительно карточки (карточка top 265, баннер top 75 => 75-265=-190)
            background: '#FFFFFF',
            borderRadius: '20px',
            zIndex: 10,
          }}
        >
          {/* Автоматически закроется через X */}
          <div
            style={{
              position: 'absolute',
              width: '300px',
              height: '20px',
              left: '15px',
              top: '15px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '145%',
              color: 'rgba(16, 16, 16, 0.25)',
            }}
          >
            Автоматически закроется через {countdown}
          </div>

          {/* Текст предупреждения */}
          <div
            style={{
              position: 'absolute',
              width: '330px',
              height: '60px',
              left: '15px',
              top: '45px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '105%',
              color: '#101010',
            }}
          >
            Внимание, оборудование этого провайдера технически прошито только на свои сети. Поэтому, подключить его невозможно.{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
              Подробнее об этом писали в медиа
            </span>
          </div>

          {/* Кнопка закрытия (X) */}
          <div
            onClick={handleCloseBanner}
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              right: '15px',
              top: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 1L9 9M9 1L1 9"
                stroke="rgba(16, 16, 16, 0.25)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
