'use client';

import React from 'react';

interface StepHeaderProps {
  title: string;
  description?: string;
}

export default function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <h2
        style={{
          fontFamily: 'TT Firs Neue, sans-serif',
          fontWeight: 400,
          fontSize: '24px',
          lineHeight: '125%',
          color: '#101010',
          marginBottom: description ? '8px' : 0,
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '155%',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
