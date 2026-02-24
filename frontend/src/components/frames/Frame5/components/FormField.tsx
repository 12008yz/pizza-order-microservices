'use client';

import React, { useState } from 'react';

export type FieldStatus = 'empty' | 'valid' | 'error';

/** Фон кружка с галочкой, когда в поле что-то введено (из 1 фрейма) */
const FILLED_CIRCLE_BG = 'rgba(16, 16, 16, 0.5)';

/** Галочка: белая на сером фоне (когда поле заполнено) — из 1 фрейма */
function CheckIcon({ filled }: { filled?: boolean }) {
  const stroke = '#FFFFFF';
  return (
    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
      <path d="M1 3L3 5L7 1" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FormFieldProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  isValid?: boolean;
  error?: string;
  type?: 'text' | 'tel';
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  disabled?: boolean;
  onClick?: () => void;
  status?: FieldStatus;
  /** Для поля телефона: пока только префикс (+7) — рисовать серую обводку как у пустых полей */
  treatAsEmpty?: boolean;
}

function FieldIcon({ status }: { status: FieldStatus }) {
  const size = 18;
  if (status === 'empty') {
    return null;
  }
  if (status === 'valid') {
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: size,
          height: size,
          boxSizing: 'border-box',
          background: FILLED_CIRCLE_BG,
        }}
      >
        <CheckIcon filled />
      </div>
    );
  }
  if (status === 'error') {
    return null;
  }
  return null;
}

export default function FormField({
  value,
  onChange,
  placeholder,
  isValid = false,
  error,
  type = 'text',
  inputMode,
  disabled = false,
  onClick,
  status: statusProp,
  treatAsEmpty = false,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const looksFilled = !treatAsEmpty && value.trim();
  const status: FieldStatus = statusProp ?? (hasError ? 'error' : looksFilled ? (isValid ? 'valid' : 'empty') : 'empty');
  const handleChange = onChange ?? (() => {});

  const borderColor = hasError
    ? '1px solid rgb(239, 68, 68)'
    : looksFilled
      ? '1px solid rgba(16, 16, 16, 0.5)'
      : '1px solid rgba(16, 16, 16, 0.25)';

  const textColor =
    treatAsEmpty && !focused ? 'rgba(16, 16, 16, 0.5)' : value ? '#101010' : 'rgba(16, 16, 16, 0.5)';
  const textStyle: React.CSSProperties = {
    fontFamily: "'TT Firs Neue', sans-serif",
    fontSize: '16px',
    lineHeight: '125%',
    color: textColor,
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
        inputMode={inputMode}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
    paddingRight: '15px',
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
      <div className="w-full">
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
      </div>
    );
  }

  return (
    <div className="w-full">
      <div style={containerStyle}>
        {content}
      </div>
    </div>
  );
}
