'use client';

import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, PlaneIcon } from '../../../common/icons';

interface SuccessStepProps {
  orderNumber: string;
  onFaq?: () => void;
}

const STATUS_STEPS: { label: string; status: 'completed' | 'current' | 'pending' }[] = [
  { label: 'Подтверждение заявки', status: 'completed' },
  { label: 'Назначение времени', status: 'current' },
  { label: 'Подключение услуг', status: 'pending' },
];

export default function SuccessStep({ orderNumber, onFaq }: SuccessStepProps) {
  const router = useRouter();
  const captureRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#F5F5F5',
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Заявка-${orderNumber}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch {
      // fallback: не блокируем интерфейс при ошибке
    }
  }, [orderNumber]);

  return (
    <div className="flex flex-col w-full" ref={captureRef}>
      <div
        className="flex-shrink-0 pb-[20px]"
        style={{
          width: '100%',
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 15,
          boxSizing: 'border-box',
        }}
      >
        {/* Номер заявки: не жирный, область 330×25 */}
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '25px',
            height: 25,
            color: '#101010',
          }}
        >
          Заявка №{orderNumber}
        </div>
        {/* 15px между номером заявки и текстом */}
        <p
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '1.25',
            fontWeight: 400,
            color: 'rgba(16, 16, 16, 0.5)',
            marginTop: 15,
            marginBottom: 20,
          }}
        >
          Мы поздравляем с оформлением заявки. Пожалуйста, подготовьте все вопросы
        </p>
        <p
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            lineHeight: '155%',
            fontWeight: 400,
            color: '#101010',
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          Заявка направлена в центр координации. Пожалуйста, ожидайте звонок от нас
        </p>
        {/* 10px между текстом и блоком шагов (по скрину 330×10) */}
        <div
          className="rounded-[10px] overflow-hidden"
          style={{
            border: '1px solid rgba(16, 16, 16, 0.25)',
            padding: '12px 15px',
            marginTop: 10,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
          }}
        >
          {STATUS_STEPS.map((step, index) => {
            const isPending = step.status === 'pending';
            const isCurrent = step.status === 'current';
            const rowColor = isPending ? 'rgba(16, 16, 16, 0.35)' : '#101010';
            return (
              <div
                key={step.label}
                className="flex items-center gap-[10px]"
                style={{
                  minHeight: 36,
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: rowColor,
                }}
              >
                <span
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 20,
                    height: 20,
                    background: step.status === 'completed' ? '#FF1000' : isCurrent ? 'transparent' : 'rgba(16, 16, 16, 0.08)',
                    border: step.status === 'completed' ? 'none' : isCurrent ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.18)',
                    color: step.status === 'completed' ? '#FFFFFF' : isCurrent ? '#101010' : 'rgba(16, 16, 16, 0.35)',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {step.status === 'completed' ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ display: 'block' }}>
                      <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                {step.label}
              </div>
            );
          })}
        </div>

        {/* 20px уже задано marginBottom у блока шагов; 5px между скриншотом и кнопкой */}
        <button
          type="button"
          onClick={handleScreenshot}
          className="w-full rounded-[10px] flex items-center justify-center outline-none cursor-pointer border"
          style={{
            width: '100%',
            height: 50,
            border: '1px solid rgba(16, 16, 16, 0.25)',
            background: 'transparent',
            color: 'rgba(16, 16, 16, 0.5)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: 5,
          }}
        >
          Вы можете сделать скриншот
        </button>
        <button
          type="button"
          onClick={() => (onFaq ? onFaq() : router.push('/faq'))}
          className="w-full rounded-[10px] flex items-center justify-center text-white outline-none cursor-pointer"
          style={{
            width: '100%',
            height: 50,
            background: '#101010',
            border: 'none',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
          }}
        >
          Популярные вопросы
        </button>
      </div>
    </div>
  );
}
