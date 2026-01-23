'use client';

import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'tel' | 'email';
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  error,
  className = '',
}: InputProps) {
  const borderColor = error
    ? '0.5px solid rgb(239, 68, 68)'
    : value
      ? '0.5px solid #101010'
      : '0.5px solid rgba(16, 16, 16, 0.25)';

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="relative w-full rounded-[10px] bg-white px-[15px] py-[15.5px] text-base leading-[125%] outline-none"
        style={{
          border: borderColor,
          color: value ? '#101010' : 'rgba(16,16,16,0.5)',
          letterSpacing: '0.5px',
          paddingBottom: '14px',
        }}
      />
      {error && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500" style={{ letterSpacing: '0.5px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
