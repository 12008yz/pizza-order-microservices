'use client';

import React from 'react';
import StepHeader from '../components/StepHeader';

interface RouterConfigStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function RouterConfigStep({ onNext, onBack }: RouterConfigStepProps) {
  return (
    <div className="p-6">
      <StepHeader
        title="Роутер"
        description="Настройка роутера под вашего оператора. Здесь можно добавить поля для ввода данных или инструкции."
      />
      <div className="mb-8 text-[rgba(16,16,16,0.5)]" style={{ fontFamily: 'TT Firs Neue, sans-serif', fontSize: '14px' }}>
        (Форма настройки — заглушка)
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-[10px] border border-[rgba(16,16,16,0.25)]"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
            color: '#101010',
          }}
        >
          Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 rounded-[10px] bg-[#101010] text-white"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
          }}
        >
          Готово
        </button>
      </div>
    </div>
  );
}
