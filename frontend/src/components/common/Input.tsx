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
    ? '1px solid rgb(239, 68, 68)'
    : value
      ? '1px solid rgba(16, 16, 16, 0.5)'
      : '1px solid rgba(16, 16, 16, 0.25)';

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="relative w-full rounded-[10px] bg-white outline-none border-box"
        style={{
          height: '50px',
          minHeight: '50px',
          paddingLeft: '15px',
          paddingRight: '16px',
          border: borderColor,
          fontFamily: 'TT Firs Neue, sans-serif',
          fontSize: '16px',
          lineHeight: '125%',
          color: value ? '#101010' : 'rgba(16,16,16,0.5)',
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
