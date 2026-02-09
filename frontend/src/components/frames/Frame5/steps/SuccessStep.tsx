'use client';

import React, { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, PlaneIcon } from '../../../common/icons';

interface SuccessStepProps {
  orderNumber: string;
  onFaq?: () => void;
}

const STATUS_STEPS = [
  { label: 'Подтверждение заявки', active: true },
  { label: 'Назначение времени', active: false },
  { label: 'Подключение услуг', active: false },
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
      <div className="flex-shrink-0 px-[15px] pt-[12px] pb-[20px]">
        <h2
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '125%',
            color: '#101010',
            marginBottom: 10,
          }}
        >
          Заявка №{orderNumber}
        </h2>
        <p
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.5)',
            marginBottom: 15,
          }}
        >
          Мы поздравляем с оформлением заявки. Пожалуйста, подготовьте все вопросы
        </p>
        <p
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            lineHeight: '155%',
            color: '#101010',
            marginBottom: 15,
          }}
        >
          Заявка направлена в центр координации. Пожалуйста, ожидайте звонок от нас
        </p>

        <div
          className="rounded-[10px] overflow-hidden mb-[15px]"
          style={{
            border: '1px solid rgba(16, 16, 16, 0.25)',
            padding: '12px 15px',
          }}
        >
          {STATUS_STEPS.map((step, index) => {
            const isThirdRow = index === 2;
            const rowColor = step.active ? '#101010' : isThirdRow ? 'rgba(16, 16, 16, 0.35)' : 'rgba(16, 16, 16, 0.5)';
            const circleColor = step.active ? '#FFFFFF' : isThirdRow ? 'rgba(16, 16, 16, 0.5)' : '#101010';
            const circleBorder = step.active ? 'none' : isThirdRow ? '1px solid rgba(16, 16, 16, 0.18)' : '1px solid rgba(16, 16, 16, 0.25)';
            return (
            <div
              key={step.label}
              className="flex items-center gap-[10px]"
              style={{
                height: 36,
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
                color: rowColor,
              }}
            >
              <span
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: 20,
                  height: 20,
                  background: step.active ? '#FF1000' : '#FFFFFF',
                  border: circleBorder,
                  color: circleColor,
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.active ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ display: 'block' }}>
                    <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      display: 'block',
                      lineHeight: '20px',
                      height: 20,
                      width: 20,
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    {index + 1}
                  </span>
                )}
              </span>
              {step.label}
            </div>
          );
          })}
        </div>

        <button
          type="button"
          onClick={handleScreenshot}
          className="w-full rounded-[10px] flex items-center justify-center outline-none cursor-pointer border mb-[5px]"
          style={{
            height: 50,
            border: '1px solid rgba(16, 16, 16, 0.25)',
            background: 'transparent',
            color: '#101010',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
          }}
        >
          Вы можете сделать скриншот
        </button>
        <button
          type="button"
          onClick={() => (onFaq ? onFaq() : router.push('/faq'))}
          className="w-full rounded-[10px] flex items-center justify-center text-white outline-none cursor-pointer"
          style={{
            height: 50,
            background: '#101010',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
          }}
        >
          Популярные вопросы
        </button>
      </div>
    </div>
  );
}
