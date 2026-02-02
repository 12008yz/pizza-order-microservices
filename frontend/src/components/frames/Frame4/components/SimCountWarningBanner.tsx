'use client';

import React, { useState, useEffect } from 'react';

interface SimCountWarningBannerProps {
  onClose?: () => void;
  autoCloseAfter?: number; // seconds
}

export default function SimCountWarningBanner({
  onClose,
  autoCloseAfter = 7,
}: SimCountWarningBannerProps) {
  const [countdown, setCountdown] = useState(autoCloseAfter);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (countdown <= 0) {
      setIsVisible(false);
      onClose?.();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        right: '20px',
        top: '20px',
        background: '#FFFFFF',
        borderRadius: '15px',
        padding: '15px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 100,
      }}
    >
      {/* Заголовок с таймером */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          Автоматически закроется через {countdown}
        </div>
        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M1 11L11 1"
              stroke="rgba(16, 16, 16, 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Текст предупреждения */}
      <div
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '14px',
          lineHeight: '145%',
          color: '#101010',
        }}
      >
        К сожалению, стоимость подключения, а также стоимость ежемесячного платежа увеличится, пропорционально вашему числу смартфонов. Если же их число, свыше одного устройства.
      </div>

      {/* Ссылка */}
      <div
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '14px',
          lineHeight: '145%',
          color: '#FF1000',
          textDecoration: 'underline',
          marginTop: '5px',
          cursor: 'pointer',
        }}
      >
        Подробнее об этом писали в медиа
      </div>
    </div>
  );
}
