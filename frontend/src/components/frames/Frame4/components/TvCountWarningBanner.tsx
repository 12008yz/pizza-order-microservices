'use client';

import React from 'react';

interface TvCountWarningBannerProps {
  count: number;
  message?: string;
  className?: string;
}

const defaultMessage = (count: number) =>
  `При выборе нескольких ТВ-приставок (${count} шт.) итоговая стоимость увеличится. Убедитесь, что вы готовы к дополнительным расходам.`;

export default function TvCountWarningBanner({
  count,
  message,
  className = '',
}: TvCountWarningBannerProps) {
  const text = message ?? defaultMessage(count);

  return (
    <div
      className={`rounded-[10px] p-4 ${className}`}
      style={{
        background: 'rgba(255, 152, 0, 0.08)',
        border: '1px solid rgba(255, 152, 0, 0.25)',
      }}
    >
      <p
        style={{
          fontFamily: "'TT Firs Neue', sans-serif",
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '145%',
          color: 'rgba(16, 16, 16, 0.85)',
        }}
      >
        {text}
      </p>
    </div>
  );
}
