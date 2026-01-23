'use client';

import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`relative w-[400px] h-[870px] bg-white ${className}`}>
      {/* Vector - верхний фон (белый) */}
      <div className="absolute left-0 right-[0.06%] top-[10%] bottom-[10%] bg-white" />
      {children}
    </div>
  );
}
