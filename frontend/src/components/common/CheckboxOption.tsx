'use client';

import React from 'react';
import AnimatedCheck from './AnimatedCheck';

// Галочка из Frame4: чёрный круг, белая галочка (16×16)
const Frame4CheckIcon = () => (
  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
    <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** Использовать галочку из Frame4 (белый круг + чёрная галочка) */
  useFrame4CheckIcon?: boolean;
}

export default function CheckboxOption({
  label,
  checked,
  onChange,
  className = '',
  style,
  useFrame4CheckIcon = false,
}: CheckboxOptionProps) {
  return (
    <div
      onClick={onChange}
      className={`relative rounded-[10px] cursor-pointer ${className}`}
      style={{
        height: '50px',
        border: checked ? '1px solid rgba(16, 16, 16, 0.5)' : '1px solid rgba(16, 16, 16, 0.25)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        className="absolute font-normal flex items-center"
        style={{
          left: '15px',
          top: '15px',
          fontFamily: "'TT Firs Neue', sans-serif",
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '125%',
          color: checked ? '#101010' : 'rgba(16, 16, 16, 0.5)',
        }}
      >
        {label}
      </div>
      <div
        className="absolute w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          right: '15px',
          top: '17px',
          boxSizing: 'border-box',
          ...(useFrame4CheckIcon
            ? {
                background: checked ? '#101010' : 'transparent',
                border: checked ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.5)',
              }
            : {
                background: checked ? '#101010' : 'transparent',
                border: checked ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
              }),
        }}
      >
        {checked && useFrame4CheckIcon && <Frame4CheckIcon />}
        {checked && !useFrame4CheckIcon && (
          <AnimatedCheck size={8} color="#FFFFFF" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
