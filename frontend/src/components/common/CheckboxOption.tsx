'use client';

import React from 'react';

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function CheckboxOption({
  label,
  checked,
  onChange,
  className = '',
  style,
}: CheckboxOptionProps) {
  return (
    <div
      onClick={onChange}
      className={`relative rounded-[10px] cursor-pointer ${className}`}
      style={{
        height: '50px',
        border: checked ? '1px solid #101010' : '1px solid rgba(16, 16, 16, 0.25)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        className="absolute font-normal flex items-center"
        style={{
          left: '15px',
          top: '15px',
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '16px',
          lineHeight: '125%',
          color: checked ? '#101010' : 'rgba(16, 16, 16, 0.5)',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
      <div
        className="absolute w-4 h-4 rounded-full flex items-center justify-center"
        style={{
          right: '15px',
          top: '17px',
          background: checked ? '#101010' : 'transparent',
          border: checked ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
        }}
      >
        {checked && (
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
