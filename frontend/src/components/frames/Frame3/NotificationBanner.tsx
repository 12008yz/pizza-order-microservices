'use client';

import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';

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
        width: '360px',
        height: '85px',
        top: '75px',
        padding: '15px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="absolute"
        style={{
          right: '15px',
          top: '15px',
          width: '16px',
          height: '16px',
          opacity: 0.15,
        }}
      >
        <X size={16} weight="regular" color="#101010" />
      </button>

      {/* Timer text */}
      <div
        className="font-normal text-xs leading-[165%]"
        style={{
          color: 'rgba(16, 16, 16, 0.5)',
          letterSpacing: '0.5px',
          marginBottom: '5px',
        }}
      >
        {title} {currentTimer}
      </div>

      {/* Content */}
      <div
        className="font-normal text-sm leading-[105%]"
        style={{
          color: '#101010',
          letterSpacing: '0.5px',
        }}
      >
        {content}
      </div>
    </div>
  );
}
