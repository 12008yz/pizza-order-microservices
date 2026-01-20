'use client';

import { useAddress } from '../contexts/AddressContext';

export default function PrivacyConsent() {
  const { addressData, updatePrivacyConsent } = useAddress();
  const hasError = !!addressData.errors.privacyConsent;

  return (
    <div
      className={`relative w-full rounded-[10px] bg-white ${hasError ? '' : ''
        }`}
      style={{
        border: hasError
          ? '0.5px solid rgb(239, 68, 68)'
          : '0.5px solid rgba(16, 16, 16, 0.25)',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="relative w-full px-[15px] rounded-[10px] bg-transparent cursor-pointer flex items-center"
        style={{ paddingTop: '11px', paddingBottom: '11px' }}
        onClick={() => updatePrivacyConsent(!addressData.privacyConsent)}
      >
        {/* Чекбокс - круглый */}
        <div
          className={`rounded-full mr-3 flex-shrink-0 flex items-center justify-center ${addressData.privacyConsent
              ? 'bg-[#101010]'
              : hasError
                ? 'border-2 border-red-500'
                : 'border border-[rgba(16,16,16,0.5)]'
            }`}
          style={{
            boxSizing: 'border-box',
            width: '16px',
            height: '16px',
          }}
        >
          {addressData.privacyConsent && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Текст */}
        <span className="text-sm leading-[105%] text-[#101010]">
          Покажите своё согласие с условиями{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline"
          >
            политики конфиденциальности портала
          </a>
        </span>
      </div>

      {/* Сообщение об ошибке */}
      {hasError && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
          {addressData.errors.privacyConsent}
        </div>
      )}
    </div>
  );
}
