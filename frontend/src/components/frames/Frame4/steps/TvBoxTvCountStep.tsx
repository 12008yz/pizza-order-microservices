'use client';

import React, { useState, useEffect } from 'react';
import type { TvCountOption } from '../types';

const ERROR_BORDER = '1px solid rgb(239, 68, 68)';

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
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);

  useEffect(() => {
    if (selected && selected > 1) {
      setShowBanner(true);
      setCountdown(7);
    } else {
      setShowBanner(false);
    }
  }, [selected]);

  useEffect(() => {
    if (showBanner && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setShowBanner(false);
    }
  }, [showBanner, countdown]);

  const handleCloseBanner = () => setShowBanner(false);
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
          Телевизионная приставка
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
          Мы подготовили все возможные варианты.
          <br />
          Пожалуйста, проверьте правильность
        </div>
      </div>

      {/* Баннер предупреждения о стоимости */}
      {showBanner && (
        <div className="flex-shrink-0 mx-[15px] mt-[10px] rounded-[20px] bg-white border border-[rgba(16,16,16,0.1)] p-[15px] relative">
          <button
            type="button"
            onClick={handleCloseBanner}
            className="absolute right-[15px] top-[15px] w-4 h-4 flex items-center justify-center cursor-pointer outline-none bg-transparent border-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="rgba(16, 16, 16, 0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="font-normal pr-6" style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '145%', color: 'rgba(16, 16, 16, 0.25)' }}>
            Автоматически закроется через {countdown}
          </div>
          <div className="font-normal pt-2" style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px', lineHeight: '105%', color: '#101010' }}>
            К сожалению, стоимость подключения, а также стоимость ежемесячного платежа увеличится, пропорционально вашему числу телевизоров. Если же их число, свыше одного устройства.{' '}
            <span className="underline cursor-pointer">Подробнее об этом писали в медиа</span>
          </div>
        </div>
      )}

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
          onClick={handleNext}
          onMouseDown={() => setIsNextPressed(true)}
          onMouseUp={() => setIsNextPressed(false)}
          onMouseLeave={() => setIsNextPressed(false)}
          onTouchStart={() => setIsNextPressed(true)}
          onTouchEnd={() => setIsNextPressed(false)}
          className="outline-none cursor-pointer flex-1 rounded-[10px] flex items-center justify-center text-center text-white min-h-[50px]"
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
