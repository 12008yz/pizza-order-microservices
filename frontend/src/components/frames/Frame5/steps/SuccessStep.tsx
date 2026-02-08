'use client';

import React from 'react';
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

  return (
    <div className="flex flex-col w-full">
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
          {STATUS_STEPS.map((step, index) => (
            <div
              key={step.label}
              className="flex items-center gap-[10px]"
              style={{
                height: 36,
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
                color: step.active ? '#101010' : 'rgba(16, 16, 16, 0.5)',
              }}
            >
              <span
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: 20,
                  height: 20,
                  background: step.active ? '#FF1000' : 'rgba(16, 16, 16, 0.25)',
                  color: step.active ? '#FFFFFF' : '#101010',
                  fontSize: 12,
                }}
              >
                {step.active ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L4 7L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              {step.label}
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled
          className="w-full rounded-[10px] flex items-center justify-center outline-none cursor-default border mb-[8px]"
          style={{
            height: 50,
            border: '1px solid rgba(16, 16, 16, 0.25)',
            background: 'transparent',
            color: 'rgba(16, 16, 16, 0.5)',
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
