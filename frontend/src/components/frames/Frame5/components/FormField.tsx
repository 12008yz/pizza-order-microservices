'use client';

import React from 'react';
import AnimatedCheck from '../../../common/AnimatedCheck';

export type FieldStatus = 'empty' | 'valid' | 'error';

interface FormFieldProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  isValid?: boolean;
  error?: string;
  type?: 'text' | 'tel';
  disabled?: boolean;
  onClick?: () => void;
  status?: FieldStatus;
}

function FieldIcon({ status }: { status: FieldStatus }) {
  const size = 18;
  if (status === 'valid') {
    return (
      <span className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="8.5" fill="#6B6B6B" />
        </svg>
        <span className="absolute" style={{ left: 5, top: 5 }}>
          <AnimatedCheck size={8} color="#FFFFFF" strokeWidth={1.5} />
        </span>
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="8.5" fill="rgb(239, 68, 68)" stroke="rgb(239, 68, 68)" strokeWidth="1" />
          <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="8.5" fill="#FFFFFF" stroke="#101010" strokeWidth="1" />
        <path fillRule="evenodd" clipRule="evenodd" d="M8.2 6.2c.3-.3.8-.3 1.1 0l2.5 2.5c.3.3.3.8 0 1.1l-2.5 2.5c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1l1.5-1.5H6.2c-.5 0-.8-.3-.8-.8s.3-.8.8-.8h2.6L8.2 7.3c-.3-.3-.3-.8 0-1.1z" fill="#101010" />
      </svg>
    </span>
  );
}

export default function FormField({
  value,
  onChange,
  placeholder,
  isValid = false,
  error,
  type = 'text',
  disabled = false,
  onClick,
  status: statusProp,
}: FormFieldProps) {
  const hasError = Boolean(error);
  const status: FieldStatus = statusProp ?? (hasError ? 'error' : value.trim() ? (isValid ? 'valid' : 'empty') : 'empty');
  const handleChange = onChange ?? (() => {});

  const borderColor = hasError
    ? '1px solid rgb(239, 68, 68)'
    : value.trim()
      ? '1px solid rgba(16, 16, 16, 0.5)'
      : '1px solid rgba(16, 16, 16, 0.25)';

  const textStyle: React.CSSProperties = {
    fontFamily: 'TT Firs Neue, sans-serif',
    fontSize: '16px',
    lineHeight: '125%',
    color: value ? '#101010' : 'rgba(16, 16, 16, 0.5)',
  };

  const content = onClick ? (
    <>
      <span className="flex-1 min-w-0 text-left" style={textStyle}>
        {value || placeholder}
      </span>
      <FieldIcon status={status} />
    </>
  ) : (
    <>
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-w-0 bg-transparent outline-none border-0"
        style={textStyle}
      />
      <FieldIcon status={status} />
    </>
  );

  const containerStyle: React.CSSProperties = {
    height: '50px',
    minHeight: '50px',
    paddingLeft: '15px',
    paddingRight: '16px',
    border: borderColor,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxSizing: 'border-box',
    background: '#FFFFFF',
  };

  if (onClick) {
    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="w-full text-left cursor-pointer rounded-[10px] flex items-center"
          style={containerStyle}
          aria-label={placeholder}
        >
          {content}
        </button>
        {error && (
          <div className="absolute -bottom-5 left-0 text-xs" style={{ color: 'rgb(239, 68, 68)', letterSpacing: '0.5px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div style={containerStyle}>
        {content}
      </div>
      {error && (
        <div className="absolute -bottom-5 left-0 text-xs" style={{ color: 'rgb(239, 68, 68)', letterSpacing: '0.5px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
