'use client';

import React from 'react';

interface OperatorWarningBannerProps {
  message?: string;
  className?: string;
}

const defaultMessage =
  'Оборудование от оператора может быть привязано к тарифу. При смене провайдера возможны ограничения.';

export default function OperatorWarningBanner({
  message = defaultMessage,
  className = '',
}: OperatorWarningBannerProps) {
  return (
    <div
      className={`rounded-[10px] p-4 ${className}`}
      style={{
        background: 'rgba(16, 16, 16, 0.06)',
        border: '1px solid rgba(16, 16, 16, 0.12)',
      }}
    >
      <p
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '145%',
          color: 'rgba(16, 16, 16, 0.7)',
        }}
      >
        {message}
      </p>
    </div>
  );
}
