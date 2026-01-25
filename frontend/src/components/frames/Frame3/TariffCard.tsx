'use client';

import React from 'react';

interface TariffCardProps {
  id: number;
  providerName: string;
  providerLogo?: string;
  tariffName: string;
  price: number;
  speed?: number;
  services?: string[];
  rating?: number;
  reviewsCount?: number;
  onClick?: () => void;
}

export default function TariffCard({
  id,
  providerName,
  providerLogo,
  tariffName,
  price,
  speed,
  services,
  rating,
  reviewsCount,
  onClick,
}: TariffCardProps) {
  return (
    <div
      className="box-border bg-white backdrop-blur-[7.5px] rounded-[20px] cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
      style={{
        padding: '20px',
      }}
    >
      {/* Provider Info */}
      <div className="flex items-center mb-4">
        {providerLogo && (
          <img
            src={providerLogo}
            alt={providerName}
            className="w-12 h-12 mr-3 object-contain"
          />
        )}
        <div>
          <h3 className="font-bold text-lg text-[#101010]">{providerName}</h3>
          {rating && reviewsCount && (
            <div className="text-sm text-[rgba(16,16,16,0.5)]">
              ⭐ {rating.toFixed(1)} ({reviewsCount} отзывов)
            </div>
          )}
        </div>
      </div>

      {/* Tariff Name */}
      <h4 className="font-normal text-xl text-[#101010] mb-2">{tariffName}</h4>

      {/* Tariff Details */}
      <div className="mb-4">
        {speed && (
          <div className="text-sm text-[rgba(16,16,16,0.5)] mb-1">
            Скорость: {speed} Мбит/с
          </div>
        )}
        {services && services.length > 0 && (
          <div className="text-sm text-[rgba(16,16,16,0.5)]">
            Услуги: {services.join(', ')}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-bold text-2xl text-[#101010]">{price}</span>
          <span className="text-sm text-[rgba(16,16,16,0.5)] ml-1">₽/мес</span>
        </div>
        <button className="px-4 py-2 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors">
          Подключить
        </button>
      </div>
    </div>
  );
}
