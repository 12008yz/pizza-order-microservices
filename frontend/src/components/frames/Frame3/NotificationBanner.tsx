'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from '../../common/icons';

interface NotificationBannerProps {
  timer?: number;
  title?: string;
  content?: string;
  onClose?: () => void;
}

export default function NotificationBanner({
  timer = 7,
  title = 'Автоматически закроется через',
  content = 'Информация полностью конфиденциальна.',
  onClose,
}: NotificationBannerProps) {
  const [currentTimer, setCurrentTimer] = useState(timer);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentTimer > 0) {
      const interval = setInterval(() => {
        setCurrentTimer((prev) => {
          if (prev <= 1) {
            setIsVisible(false);
            if (onClose) onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentTimer, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 bg-white backdrop-blur-[7.5px] rounded-[20px]"
      style={{
        width: 360,
        height: 85,
        top: 120,
        padding: 15,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Строка: «Автоматически закроется через» слева, крестик закрытия справа */}
      <div
        className="flex items-center justify-between"
        style={{ minHeight: 24 }}
      >
        <span
          className="font-normal text-xs leading-[165%]"
          style={{
            color: 'rgba(16, 16, 16, 0.5)',
            letterSpacing: '0.5px',
          }}
        >
          {title} {currentTimer}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer w-6 h-6 flex-shrink-0"
          aria-label="Закрыть"
        >
          <CloseIcon width={16} height={16} />
        </button>
      </div>

      {/* Content — отступ 8px от строки таймера */}
      <div
        className="font-normal text-sm leading-[105%]"
        style={{
          color: '#101010',
          letterSpacing: '0.5px',
          marginTop: 8,
        }}
      >
        {content}
      </div>
    </div>
  );
}
