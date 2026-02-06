'use client';

import { memo } from 'react';
import { useAddress } from '../../../contexts/AddressContext';
import AnimatedCheck from '../../common/AnimatedCheck';

function PrivacyConsent() {
  const { addressData, updatePrivacyConsent } = useAddress();
  const hasError = !!addressData.errors.privacyConsent;

  return (
    <div
      className="relative w-full rounded-[10px] bg-white"
      style={{
        height: '50px',
        minHeight: '50px',
        border: hasError
          ? '1px solid rgb(239, 68, 68)'
          : '1px solid rgba(16, 16, 16, 0.25)',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="relative w-full h-full rounded-[10px] bg-transparent cursor-pointer flex items-center box-border"
        style={{ paddingLeft: '15px', paddingRight: '15px' }}
        onClick={() => updatePrivacyConsent(!addressData.privacyConsent)}
      >
        {/* Чекбокс 16×16, отступ слева 15px */}
        <div
          className={`rounded-full flex-shrink-0 flex items-center justify-center ${addressData.privacyConsent
            ? 'bg-[#101010]'
            : hasError
              ? 'border-2 border-red-500'
              : 'border border-[rgba(16,16,16,0.5)]'
            }`}
          style={{
            boxSizing: 'border-box',
            width: '16px',
            height: '16px',
            marginRight: '10px',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          {addressData.privacyConsent && (
            <AnimatedCheck key={`privacy-${addressData.privacyConsent}`} size={9} color="white" strokeWidth={1.5} />
          )}
        </div>

        {/* Текст: 14px, line-height 105% = 15px */}
        <span
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '14px',
            lineHeight: '105%',
            color: '#101010',
          }}
        >
          Я полностью согласен с условиями{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 underline"
          >
            политики конфиденциальности
          </a>
          {' '}портала
        </span>
      </div>
    </div>
  );
}

export default memo(PrivacyConsent);
