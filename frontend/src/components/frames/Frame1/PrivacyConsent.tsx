'use client';

import { memo } from 'react';
import { useAddress } from '../../../contexts/AddressContext';
import AnimatedCheck from '../../common/AnimatedCheck';

function PrivacyConsent() {
  const { addressData, updatePrivacyConsent } = useAddress();
  const hasError = !!addressData.errors.privacyConsent;

  return (
    <div
      className="relative w-full rounded-[10px] bg-white box-border"
      style={{
        height: 50,
        minHeight: 50,
        border: hasError ? '1px solid rgb(239, 68, 68)' : '1px solid rgba(16, 16, 16, 0.25)',
      }}
    >
      <div
        className="relative w-full h-full rounded-[10px] bg-transparent cursor-pointer flex items-center box-border"
        style={{ paddingLeft: 15, paddingRight: 15 }}
        onClick={() => updatePrivacyConsent(!addressData.privacyConsent)}
      >
        {/* Чекбокс 16×16 — по макету: border 1px solid rgba(16, 16, 16, 0.5) */}
        <div
          className="flex-shrink-0 flex items-center justify-center box-border"
          style={{
            width: 16,
            height: 16,
            marginRight: 10,
            border: addressData.privacyConsent ? 'none' : hasError ? '1px solid rgb(239, 68, 68)' : '1px solid rgba(16, 16, 16, 0.5)',
            background: addressData.privacyConsent ? '#101010' : 'transparent',
            borderRadius: '50%',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
          }}
        >
          {addressData.privacyConsent && (
            <AnimatedCheck key={`privacy-${addressData.privacyConsent}`} size={9} color="white" strokeWidth={1.5} />
          )}
        </div>

        {/* Текст: 14px, line-height 105%, color #101010 */}
        <span
          style={{
            fontFamily: "'TT Firs Neue', sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '105%',
            color: '#101010',
          }}
        >
          Я полностью согласен(-на) с условиями{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 underline"
          >
            политики конфиденциальности
          </a>{' '}
          портала
        </span>
      </div>
    </div>
  );
}

export default memo(PrivacyConsent);
