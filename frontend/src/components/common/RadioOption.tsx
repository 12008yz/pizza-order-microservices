'use client';

import React from 'react';
import AnimatedCheck from './AnimatedCheck';

interface RadioOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export default function RadioOption({ label, selected, onClick, className = '' }: RadioOptionProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-[10px] cursor-pointer ${className}`}
      style={{
        height: '50px',
        border: selected ? '1px solid rgba(16, 16, 16, 0.5)' : '1px solid rgba(16, 16, 16, 0.25)',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="absolute font-normal flex items-center"
        style={{
          left: '15px',
          top: '15px',
          fontFamily: 'TT Firs Neue, sans-serif',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '125%',
          color: selected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
        }}
      >
        {label}
      </div>
      <div
        className="absolute w-4 h-4 rounded-full flex items-center justify-center"
        style={{
          right: '15px',
          top: '17px',
          background: selected ? '#101010' : 'transparent',
          border: selected ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
        }}
      >
        {selected && (
          <AnimatedCheck size={8} color="#FFFFFF" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
