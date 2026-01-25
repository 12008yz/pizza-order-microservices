'use client';

import React from 'react';
import { Check } from '@phosphor-icons/react';

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
      className={`relative w-full rounded-[10px] bg-white cursor-pointer flex items-center justify-between ${className}`}
      style={{
        border: selected
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
          color: selected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
        }}
      >
        {label}
      </span>
      
      {/* Radio кнопка */}
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          borderWidth: '0.5px',
          background: selected ? '#101010' : 'transparent',
          border: selected
            ? 'none'
            : '0.5px solid rgba(16, 16, 16, 0.25)',
        }}
      >
        {selected && (
          <Check size={8} weight="bold" color="#FFFFFF" />
        )}
      </div>
    </div>
  );
}
