'use client';

import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div
      className={`relative w-full max-w-[400px] mx-auto bg-white flex flex-col ${className}`}
      style={{
        minHeight: '100dvh',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Vector - верхний фон (белый) */}
      <div className="absolute left-0 right-[0.06%] top-[10%] bottom-[10%] bg-white" />
      {children}
    </div>
  );
}
