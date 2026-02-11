'use client';

import React from 'react';
import AnimatedCheck from '../common/AnimatedCheck';

export interface SimTariffCardData {
  id: number;
  providerName: string;
  tariffName: string;
  price: number;
  connectionPrice?: number;
  speed?: number;
  mobileMinutes?: number | null;
  mobileGB?: number | null;
  promoText?: string | null;
  connectionPriceLabel?: string;
}

interface SimTariffCardProps {
  tariff: SimTariffCardData;
  onConnect: (tariffId: number) => void;
  onInfoClick?: () => void;
  onFavoriteClick?: () => void;
}

const CheckCircleIcon = () => (
  <span className="relative inline-block" style={{ width: 20, height: 20 }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
      <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    </svg>
    <span className="absolute" style={{ left: 6, top: 6 }}>
      <AnimatedCheck size={8} color="#101010" strokeWidth={1.5} />
    </span>
  </span>
);

const CrossCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="rgba(16, 16, 16, 0.3)" strokeWidth="1.5" fill="none" />
    <path d="M7 7L13 13M13 7L7 13" stroke="rgba(16, 16, 16, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MinusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M6 10H14" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

import InfoIcon from '../common/icons/InfoIcon';

export default function SimTariffCard({ tariff, onConnect, onInfoClick, onFavoriteClick }: SimTariffCardProps) {
  const price = typeof tariff.price === 'number' ? tariff.price : parseFloat(String(tariff.price));
  const connectionPrice =
    tariff.connectionPrice != null
      ? typeof tariff.connectionPrice === 'number'
        ? tariff.connectionPrice
        : parseFloat(String(tariff.connectionPrice))
      : 0;

  const mobileParts: string[] = [];
  if (tariff.mobileMinutes != null && tariff.mobileMinutes > 0) mobileParts.push(`${tariff.mobileMinutes} мин`);
  if (tariff.mobileGB != null) {
    if (tariff.mobileGB >= 999) mobileParts.push('безлимит гигабайтов');
    else mobileParts.push(`${tariff.mobileGB} гигабайтов`);
  }
  const mobileDesc = mobileParts.length ? mobileParts.join(' · ') : null;

  return (
    <div
      className="relative bg-white rounded-[20px] flex flex-col"
      style={{
        width: '360px',
        minHeight: '380px',
        boxSizing: 'border-box',
        paddingBottom: '20px',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '24px 20px 0 20px' }}>
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '125%',
            color: 'rgba(16, 16, 16, 0.5)',
            marginBottom: '4px',
          }}
        >
          {tariff.providerName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '165%',
              color: '#101010',
            }}
          >
            {tariff.tariffName}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick?.();
            }}
            className="outline-none cursor-pointer border-0 bg-transparent p-0"
          >
            <InfoIcon />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0 20px' }}>
        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)' }} />
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        {tariff.speed != null && tariff.speed > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '155%',
                  color: '#101010',
                }}
              >
                {tariff.speed} Мбит/сек
              </div>
              <div
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '105%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                Безлимитное соединение в квартире
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <CrossCircleIcon />
          </div>
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '155%',
              color: 'rgba(16, 16, 16, 0.5)',
            }}
          >
            Не предусмотрено Телевидение
          </div>
        </div>

        {mobileDesc && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircleIcon />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '155%',
                  color: '#101010',
                }}
              >
                {mobileDesc}
              </div>
              <div
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '105%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                Мобильное соединение
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <MinusCircleIcon />
          </div>
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '155%',
              color: '#101010',
            }}
          >
            Подключение текущего номера
          </div>
        </div>
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.5)',
            marginLeft: '32px',
          }}
        >
          SIM-карта
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)' }} />
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '22px',
            lineHeight: '115%',
            color: '#101010',
            marginBottom: '4px',
          }}
        >
          {price} р./мес.
        </div>
        {tariff.promoText && (
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.6)',
              marginBottom: '4px',
            }}
          >
            {tariff.promoText}
          </div>
        )}
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          {tariff.connectionPriceLabel ?? `Бесплатное подключение от оператора`}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onFavoriteClick && (
          <button
            type="button"
            onClick={onFavoriteClick}
            className="outline-none cursor-pointer border border-[rgba(16,16,16,0.25)] rounded-full w-12 h-12 flex items-center justify-center bg-white flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#101010" strokeWidth="1.5">
              <path d="M10 17l-1.2-1.1C5.4 12.4 3 10.2 3 7.5 3 5 5 3 7.5 3c1.4 0 2.7.6 3.6 1.5.9-.9 2.2-1.5 3.6-1.5C17 3 19 5 19 7.5c0 2.7-2.4 4.9-5.8 8.4L10 17z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => onConnect(tariff.id)}
          className="outline-none cursor-pointer border-0 rounded-[10px] flex-1 h-12 flex items-center justify-center text-white bg-[#101010]"
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
          }}
        >
          Подключить
        </button>
      </div>
    </div>
  );
}
