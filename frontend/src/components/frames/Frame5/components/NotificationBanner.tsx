'use client';

import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';

interface NotificationBannerProps {
  /** Начальное значение таймера (секунды) */
  initialCountdown?: number;
  onClose?: () => void;
}

export default function NotificationBanner({
  initialCountdown = 7,
  onClose,
}: NotificationBannerProps) {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (countdown <= 0) {
      setVisible(false);
      onClose?.();
      return;
    }
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setVisible(false);
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [countdown, onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bg-white rounded-[20px] flex flex-col z-20"
      style={{
        width: 'min(360px, calc(100vw - 40px))',
        top: 75,
        padding: 15,
        boxSizing: 'border-box',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between flex-shrink-0" style={{ minHeight: 20 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '145%',
            color: 'rgba(16, 16, 16, 0.25)',
          }}
        >
          Автоматически закроется через {countdown}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full cursor-pointer border-0 p-0 ml-2"
          style={{ color: 'rgba(16, 16, 16, 0.25)' }}
          aria-label="Закрыть"
        >
          <X size={16} weight="regular" color="currentColor" />
        </button>
      </div>
      <div
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '14px',
          lineHeight: '105%',
          color: '#101010',
          marginTop: 10,
          wordBreak: 'break-word',
        }}
      >
        Информация полностью конфиденциальна.{' '}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: '#0075FF' }}
          onClick={(e) => e.stopPropagation()}
        >
          Подробнее об этом писали в медиа
        </a>
      </div>
    </div>
  );
}
