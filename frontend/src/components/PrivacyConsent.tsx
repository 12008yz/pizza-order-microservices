'use client';

import { useAddress } from '../contexts/AddressContext';

export default function PrivacyConsent() {
  const { addressData, updatePrivacyConsent } = useAddress();
  const hasError = !!addressData.errors.privacyConsent;

  return (
    <div
      className={`relative w-full border rounded-[10px] bg-white flex items-center p-4 cursor-pointer transition-all ${
        hasError ? 'border-red-500' : 'border-[rgba(16,16,16,0.25)]'
      }`}
      onClick={() => updatePrivacyConsent(!addressData.privacyConsent)}
    >
      {/* Чекбокс */}
      <div
        className={`w-4 h-4 border rounded-sm flex items-center justify-center mr-3 flex-shrink-0 ${
          addressData.privacyConsent
            ? 'bg-[#101010] border-[#101010]'
            : 'border-[rgba(16,16,16,0.5)]'
        }`}
      >
        {addressData.privacyConsent && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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

      {/* Сообщение об ошибке */}
      {hasError && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500">
          {addressData.errors.privacyConsent}
        </div>
      )}
    </div>
  );
}
