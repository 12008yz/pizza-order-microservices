'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'box-border rounded-[10px] flex items-center justify-center font-normal text-base leading-[315%] text-center outline-none transition-colors';
  
  const variantStyles = {
    primary: disabled
      ? 'bg-[rgba(16,16,16,0.25)] cursor-not-allowed text-white'
      : 'bg-[#101010] hover:bg-gray-800 cursor-pointer text-white',
    secondary: disabled
      ? 'bg-transparent border border-[rgba(16,16,16,0.25)] cursor-not-allowed text-[rgba(16,16,16,0.5)]'
      : 'bg-transparent border border-[#101010] cursor-pointer text-[#101010] hover:bg-[rgba(16,16,16,0.05)]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{
        minHeight: '50px',
        fontFamily: "'TT Firs Neue', sans-serif",
        fontSize: '16px',
        letterSpacing: '0.5px',
      }}
    >
      {children}
    </button>
  );
}
