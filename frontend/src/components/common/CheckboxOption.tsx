'use client';

import React from 'react';
import { Check } from '@phosphor-icons/react';

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export default function CheckboxOption({
  label,
  checked,
  onChange,
  className = '',
}: CheckboxOptionProps) {
  return (
    <div
      onClick={onChange}
      className={`relative w-full rounded-[10px] bg-white cursor-pointer flex items-center justify-between ${className}`}
      style={{
        border: checked
          ? '1px solid #101010'
          : '1px solid rgba(16, 16, 16, 0.25)',
        padding: '0 15px',
        paddingTop: '15.5px',
        paddingBottom: '14px',
        transition: 'border-color 0.2s ease',
      }}
    >
      <span
        className="text-base leading-[125%]"
        style={{
          letterSpacing: '0.5px',
          color: checked ? '#101010' : 'rgba(16, 16, 16, 0.5)',
        }}
      >
        {label}
      </span>
      
      {/* Checkbox */}
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
        style={{
          borderWidth: '0.5px',
          background: checked ? '#101010' : 'transparent',
          border: checked
            ? 'none'
            : '0.5px solid rgba(16, 16, 16, 0.25)',
        }}
      >
        {checked && (
          <Check size={12} weight="bold" color="#FFFFFF" />
        )}
      </div>
    </div>
  );
}
