'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from '../../../common/icons';

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
        top: 'var(--header-top, 50px)',
        padding: 15,
        boxSizing: 'border-box',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Строка: «Автоматически закроется через» слева, крестик закрытия справа */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ minHeight: 20 }}
      >
        <span
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '145%',
            color: 'rgba(16, 16, 16, 0.25)',
          }}
        >
          Автоматически закроется через {countdown}
        </span>
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center justify-center w-6 h-6 cursor-pointer border-0 p-0 bg-transparent flex-shrink-0"
          aria-label="Закрыть"
        >
          <CloseIcon width={16} height={16} />
        </button>
      </div>
      <div
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '14px',
          lineHeight: '105%',
          color: '#101010',
          marginTop: 8,
          wordBreak: 'break-word',
        }}
      >
        Информация полностью конфиденциальна.{' '}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0075FF', textDecoration: 'underline', textDecorationSkipInk: 'none', textUnderlineOffset: '2px' }}
          onClick={(e) => e.stopPropagation()}
        >
          Подробнее об этом писали в медиа
        </a>
      </div>
    </div>
  );
}
