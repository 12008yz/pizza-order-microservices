'use client';

import React, { useState, useEffect } from 'react';

const COUNTDOWN_SEC = 3;

interface ConfirmationStepProps {
  onConfirm: () => void;
  onEdit: () => void;
  isSubmitting?: boolean;
}

export default function ConfirmationStep({
  onConfirm,
  onEdit,
  isSubmitting = false,
}: ConfirmationStepProps) {
  const [confirmPressed, setConfirmPressed] = useState(false);
  const [editPressed, setEditPressed] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);

  useEffect(() => {
    setCountdown(COUNTDOWN_SEC);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, COUNTDOWN_SEC - elapsed);
      setCountdown(left);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const canProceed = countdown === 0;

  return (
    <div className="flex flex-col w-full px-[15px] pt-[12px] pb-[20px]">
      <h2
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontWeight: 400,
          fontSize: '20px',
          lineHeight: '125%',
          color: '#101010',
          marginBottom: 10,
        }}
      >
        Подтверждение заявки
      </h2>
      <p
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '14px',
          lineHeight: '105%',
          color: 'rgba(16, 16, 16, 0.25)',
          marginBottom: 15,
        }}
      >
        Мы подготовили все технические интервалы. Пожалуйста, проверьте правильность
      </p>

      <p
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '125%',
          color: '#101010',
          marginBottom: 15,
        }}
      >
        Я подтверждаю, что настоящая заявка действительна и актуальна для меня
      </p>

      <div className="flex flex-col gap-[8px]">
        <button
          type="button"
          onClick={canProceed && !isSubmitting ? onConfirm : undefined}
          disabled={!canProceed || isSubmitting}
          onMouseDown={() => canProceed && !isSubmitting && setConfirmPressed(true)}
          onMouseUp={() => setConfirmPressed(false)}
          onMouseLeave={() => setConfirmPressed(false)}
          onTouchStart={() => canProceed && !isSubmitting && setConfirmPressed(true)}
          onTouchEnd={() => setConfirmPressed(false)}
          className="w-full rounded-[10px] flex items-center justify-center outline-none"
          style={{
            height: 50,
            border: '1px solid rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: canProceed ? 16 : 14,
            background: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.06)',
            color: canProceed ? '#FFFFFF' : '#101010',
            cursor: canProceed && !isSubmitting ? 'pointer' : 'default',
            transform: confirmPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.15s ease-out, background 0.4s ease-out, color 0.4s ease-out, font-size 0.2s ease-out',
          }}
        >
          {isSubmitting ? 'Отправка...' : (canProceed ? 'Подтвердить' : countdown)}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={isSubmitting}
          onMouseDown={() => setEditPressed(true)}
          onMouseUp={() => setEditPressed(false)}
          onMouseLeave={() => setEditPressed(false)}
          onTouchStart={() => setEditPressed(true)}
          onTouchEnd={() => setEditPressed(false)}
          className="w-full rounded-[10px] flex items-center justify-center outline-none cursor-pointer border bg-transparent"
          style={{
            height: 50,
            border: '1px solid rgba(16, 16, 16, 0.25)',
            color: '#101010',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            transform: editPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          Редактировать
        </button>
      </div>
    </div>
  );
}
