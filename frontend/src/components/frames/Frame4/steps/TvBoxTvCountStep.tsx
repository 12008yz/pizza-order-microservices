'use client';

import React, { useState, useEffect } from 'react';
import type { TvCountOption } from '../types';

interface TvBoxTvCountStepProps {
  selected: TvCountOption | null;
  onSelect: (count: TvCountOption) => void;
  onNext: () => void;
  onBack: () => void;
}

const options: { value: TvCountOption; label: string }[] = [
  { value: 1, label: 'Подключение одного телевизора' },
  { value: 2, label: 'Подключение 2-х телевизоров' },
  { value: 3, label: 'Подключение 3-х телевизоров' },
  { value: 4, label: 'Подключение 4-х телевизоров' },
];

export default function TvBoxTvCountStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: TvBoxTvCountStepProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [countdown, setCountdown] = useState(7);

  // Показываем баннер когда выбрано больше 1 ТВ
  useEffect(() => {
    if (selected && selected > 1) {
      setShowBanner(true);
      setCountdown(7);
    } else {
      setShowBanner(false);
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

  return (
    <>
      {/* Баннер предупреждения о стоимости */}
      {showBanner && (
        <div
          style={{
            position: 'absolute',
            width: '360px',
            height: '120px',
            left: '0px',
            top: '-210px',
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
            К сожалению, стоимость подключения, а также стоимость ежемесячного платежа увеличится, пропорционально вашему числу телевизоров. Если же их число, свыше одного устройства.{' '}
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
          Телевизионная приставка
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
          Мы подготовили все возможные варианты.
          <br />
          Пожалуйста, проверьте правильность
        </div>
      </div>

      {/* Опции */}
      {options.map((option, index) => {
        const isSelected = selected === option.value;
        const topPosition = 100 + index * 55;

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
        <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
          <path
            d="M5 1L1 6L5 11"
            stroke="#101010"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Кнопка "Далее" */}
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
