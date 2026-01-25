'use client';

import React from 'react';
import { Minus, Plus } from '@phosphor-icons/react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
  className = '',
}: NumberInputProps) {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue)) {
      const clampedValue = Math.max(min, Math.min(max, inputValue));
      onChange(clampedValue);
    }
  };

  return (
    <div
      className={`flex items-center border border-[rgba(16,16,16,0.25)] rounded-[10px] bg-white ${className}`}
      style={{
        height: '50px',
      }}
    >
      {/* Decrease button */}
      <button
        onClick={handleDecrease}
        disabled={value <= min}
        className="flex items-center justify-center"
        style={{
          width: '50px',
          height: '50px',
          borderRight: '1px solid rgba(16, 16, 16, 0.25)',
          opacity: value <= min ? 0.25 : 1,
          cursor: value <= min ? 'not-allowed' : 'pointer',
        }}
      >
        <Minus size={16} weight="regular" color="#101010" />
      </button>

      {/* Input */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="flex-1 text-center font-normal text-base leading-[125%] bg-transparent outline-none"
        style={{
          color: '#101010',
          letterSpacing: '0.5px',
        }}
      />

      {/* Increase button */}
      <button
        onClick={handleIncrease}
        disabled={value >= max}
        className="flex items-center justify-center"
        style={{
          width: '50px',
          height: '50px',
          borderLeft: '1px solid rgba(16, 16, 16, 0.25)',
          opacity: value >= max ? 0.25 : 1,
          cursor: value >= max ? 'not-allowed' : 'pointer',
        }}
      >
        <Plus size={16} weight="regular" color="#101010" />
      </button>
    </div>
  );
}
