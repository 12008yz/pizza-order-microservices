'use client';

import { useState } from 'react';
import TariffCard from './TariffCard';

interface Tariff {
  id: number;
  providerName: string;
  providerLogo?: string;
  tariffName: string;
  price: number;
  speed?: number;
  services?: string[];
  rating?: number;
  reviewsCount?: number;
}

export default function TariffsList() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);

  const handleTariffClick = (tariffId: number) => {
    // Обработка клика по тарифу
    console.log('Tariff clicked:', tariffId);
  };

  if (tariffs.length === 0) {
    return (
      <div className="absolute left-[20px] right-[20px] top-[200px] bottom-[20px] flex items-center justify-center">
        <p className="text-[rgba(16,16,16,0.5)] text-center">
          Тарифы не найдены
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute left-[20px] right-[20px] top-[200px] bottom-[20px] overflow-y-auto"
      style={{
        paddingBottom: '20px',
      }}
    >
      <div className="flex flex-col gap-4">
        {tariffs.map((tariff) => (
          <TariffCard
            key={tariff.id}
            {...tariff}
            onClick={() => handleTariffClick(tariff.id)}
          />
        ))}
      </div>
    </div>
  );
}
