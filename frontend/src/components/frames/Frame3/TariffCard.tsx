'use client';

import React from 'react';

interface TariffCardProps {
  id: number;
  providerName: string;
  providerLogo?: string;
  tariffName: string;
  price: number;
  connectionPrice?: number;
  speed?: number;
  services?: string[];
  tvChannels?: number;
  tvService?: string;
  mobileMinutes?: number;
  mobileGb?: number;
  mobileSms?: number;
  rating?: number;
  reviewsCount?: number;
  promoText?: string;
  promoPrice?: number;
  isFavorite?: boolean;
  onClick?: () => void;
  onInfoClick?: () => void;
  onFavoriteClick?: () => void;
}

// Круглая иконка с галочкой
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M6 10L9 13L14 7" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Круглая иконка с плюсом
const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="#101010" strokeWidth="1.5" fill="none" />
    <path d="M10 6V14M6 10H14" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Иконка info (i) в круге
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" stroke="rgba(16, 16, 16, 0.5)" strokeWidth="1.5" fill="none" />
    <path d="M10 9V14" stroke="rgba(16, 16, 16, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="6.5" r="1" fill="rgba(16, 16, 16, 0.5)" />
  </svg>
);

export default function TariffCard({
  id,
  providerName,
  providerLogo,
  tariffName,
  price,
  connectionPrice = 500,
  speed,
  services,
  tvChannels,
  tvService,
  mobileMinutes,
  mobileGb,
  mobileSms,
  rating,
  reviewsCount,
  promoText = '90 дней за 0 р.',
  promoPrice,
  isFavorite = false,
  onClick,
  onInfoClick,
  onFavoriteClick,
}: TariffCardProps) {
  return (
    <div
      className="relative bg-white rounded-[20px] flex flex-col"
      style={{
        width: '360px',
        minHeight: '452px',
        boxSizing: 'border-box',
        paddingBottom: '15px',
      }}
    >
      {/* Provider Name & Tariff Name */}
      <div style={{ padding: '24px 20px 0 20px' }}>
        {/* Provider Name */}
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
          {providerName}
        </div>

        {/* Tariff Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '165%',
              color: '#101010',
            }}
          >
            {tariffName}
          </span>
          {/* Info Icon */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick?.();
            }}
            style={{ cursor: 'pointer' }}
          >
            <InfoIcon />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ padding: '16px 20px 0 20px' }}>
        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)' }} />
      </div>

      {/* Features Section */}
      <div style={{ padding: '16px 20px', flex: 1 }}>
        {/* Speed Feature */}
        {speed && (
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
                {speed} Мбит/сек
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
                Безлимитное соединение
              </div>
            </div>
          </div>
        )}

        {/* TV Feature */}
        {tvChannels && (
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
                {tvChannels} каналов{tvService && ` · кинотеатр «${tvService}»`}
              </div>
              <div
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontWeight: 400,
                  fontSize: '13px',
                  lineHeight: '115%',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                Телевидение
              </div>
            </div>
          </div>
        )}

        {/* Mobile Feature */}
        {(mobileMinutes || mobileGb || mobileSms) && (
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
                {mobileMinutes && `${mobileMinutes} мин`}
                {mobileGb && ` · ${mobileGb} гигабайтов`}
                {mobileSms && ` · ${mobileSms} смс`}
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

        {/* Divider before Favorite */}
        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)', marginBottom: '14px' }} />

        {/* Favorite Feature */}
        <div
          style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.();
          }}
        >
          <div style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }}>
            <PlusCircleIcon />
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
              Добавить в «Избранное»
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
              Кнопка выше и справа от «Гигапоиск»
            </div>
          </div>
        </div>
      </div>

      {/* Divider before Price */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ height: '1px', background: 'rgba(16, 16, 16, 0.1)' }} />
      </div>

      {/* Price Section */}
      <div style={{ padding: '16px 20px' }}>
        {/* Price */}
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

        {/* Connection Price */}
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.5)',
          }}
        >
          Подключение от оператора за {connectionPrice} р.
        </div>
      </div>

      {/* CTA Button */}
      <div style={{ padding: '0 20px 0 20px' }}>
        <button
          onClick={onClick}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '50px',
            background: '#101010',
            border: 'none',
            borderRadius: '10px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '100%',
            color: '#FFFFFF',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {promoText}
        </button>
      </div>
    </div>
  );
}
