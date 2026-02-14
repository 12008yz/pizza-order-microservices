'use client';

import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../../../common/icons';

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
      className="left-1/2 -translate-x-1/2"
      style={{
        position: 'absolute',
        width: 'min(360px, calc(100% - 40px))',
        top: '20px',
        background: '#FFFFFF',
        borderRadius: '15px',
        padding: '15px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 100,
      }}
    >
      {/* Строка: «Автоматически закроется через» слева, крестик закрытия справа */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '10px', minHeight: 24 }}
      >
        <span
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          Автоматически закроется через {countdown}
        </span>
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer w-6 h-6 flex-shrink-0"
          aria-label="Закрыть"
        >
          <CloseIcon width={16} height={16} />
        </button>
      </div>

      {/* Текст предупреждения — отступ 8px от строки «Автоматически закроется через» */}
      <div
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '14px',
          lineHeight: '145%',
          color: '#101010',
          marginTop: '8px',
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
          textDecorationSkipInk: 'none',
          textUnderlineOffset: '2px',
          marginTop: '5px',
          cursor: 'pointer',
        }}
      >
        Подробнее об этом писали в медиа
      </div>
    </div>
  );
}
